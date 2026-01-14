import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SignContractRequest {
  token: string;
  otpCode: string;
  signatorName: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get client IP from headers
    const clientIP =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    const { token, otpCode, signatorName }: SignContractRequest =
      await req.json();

    console.log(`[sign-contract] Attempting to sign contract with token: ${token?.substring(0, 8)}...`);

    // Validate input
    if (!token || typeof token !== "string") {
      console.error("[sign-contract] Invalid or missing token");
      return new Response(
        JSON.stringify({ error: "署名トークンが無効です" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!otpCode || typeof otpCode !== "string" || otpCode.length !== 6 || !/^\d{6}$/.test(otpCode)) {
      console.error("[sign-contract] Invalid OTP code format");
      return new Response(
        JSON.stringify({ error: "6桁の確認コードを入力してください" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!signatorName || typeof signatorName !== "string" || signatorName.trim().length === 0) {
      console.error("[sign-contract] Invalid signator name");
      return new Response(
        JSON.stringify({ error: "署名者名を入力してください" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (signatorName.trim().length > 100) {
      console.error("[sign-contract] Signator name too long");
      return new Response(
        JSON.stringify({ error: "署名者名は100文字以内で入力してください" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find signature record by token
    const { data: signature, error: sigError } = await supabase
      .from("contract_signatures")
      .select("*, contract:contracts(*)")
      .eq("signature_token", token)
      .single();

    if (sigError || !signature) {
      console.error("[sign-contract] Invalid or expired signature token:", sigError);
      return new Response(
        JSON.stringify({ error: "署名リンクが無効または期限切れです" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if already signed
    if (signature.signed_at) {
      console.log("[sign-contract] Contract already signed");
      return new Response(
        JSON.stringify({ error: "この契約書はすでに署名されています" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate OTP code server-side
    // Check if OTP exists and is not expired
    if (!signature.otp_code) {
      console.error("[sign-contract] No OTP code set for this signature");
      return new Response(
        JSON.stringify({ error: "確認コードが設定されていません。再度お試しください。" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check OTP expiration
    if (signature.otp_expires_at) {
      const expiresAt = new Date(signature.otp_expires_at);
      if (new Date() > expiresAt) {
        console.error("[sign-contract] OTP code has expired");
        return new Response(
          JSON.stringify({ error: "確認コードの有効期限が切れています。再度お試しください。" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Validate OTP code (constant-time comparison to prevent timing attacks)
    const storedOtp = signature.otp_code;
    let isValidOtp = true;
    if (storedOtp.length !== otpCode.length) {
      isValidOtp = false;
    } else {
      for (let i = 0; i < storedOtp.length; i++) {
        if (storedOtp[i] !== otpCode[i]) {
          isValidOtp = false;
        }
      }
    }

    if (!isValidOtp) {
      console.error("[sign-contract] Invalid OTP code provided");
      return new Response(
        JSON.stringify({ error: "確認コードが正しくありません" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[sign-contract] OTP validated successfully, proceeding with signature");

    // Update signature record with server-side timestamp
    const signedAt = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("contract_signatures")
      .update({
        signatory_name: signatorName.trim(),
        signed_at: signedAt,
        signed_ip: clientIP,
        signed_user_agent: userAgent,
        otp_code: null, // Clear OTP after successful use
        otp_expires_at: null,
      })
      .eq("signature_token", token)
      .eq("signed_at", null); // Extra safety: only update if not already signed

    if (updateError) {
      console.error("[sign-contract] Failed to update signature:", updateError);
      return new Response(
        JSON.stringify({ error: "署名処理に失敗しました" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if all parties have signed
    const { data: allSignatures, error: signaturesError } = await supabase
      .from("contract_signatures")
      .select("*")
      .eq("contract_id", signature.contract_id);

    if (signaturesError) {
      console.error("[sign-contract] Failed to fetch all signatures:", signaturesError);
      // Continue anyway - the main signature was recorded
    }

    const allSigned = allSignatures?.every((s) => s.signed_at);
    const newStatus = allSigned ? "signed" : "partially_signed";

    // Update contract status
    const { error: contractUpdateError } = await supabase
      .from("contracts")
      .update({ status: newStatus })
      .eq("id", signature.contract_id);

    if (contractUpdateError) {
      console.error("[sign-contract] Failed to update contract status:", contractUpdateError);
      // Continue anyway - the signature was recorded
    }

    // Log the signature for audit purposes
    const { error: logError } = await supabase
      .from("signature_verification_logs")
      .insert({
        contract_id: signature.contract_id,
        verification_result: true,
        verified_by_ip: clientIP,
        details: {
          signatory_email: signature.signatory_email,
          signatory_type: signature.signatory_type,
          user_agent: userAgent,
          timestamp: signedAt,
        },
      });

    if (logError) {
      console.error("[sign-contract] Failed to log signature:", logError);
      // Non-critical - continue
    }

    console.log(`[sign-contract] Contract signed successfully. Contract ID: ${signature.contract_id}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "署名が完了しました",
        signedAt,
        contractStatus: newStatus,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[sign-contract] Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "予期せぬエラーが発生しました" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
