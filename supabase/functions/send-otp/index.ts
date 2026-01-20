import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendOTPRequest {
  token: string;
}

// Generate a cryptographically secure 6-digit OTP
function generateOTP(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  const otp = (array[0] % 1000000).toString().padStart(6, "0");
  return otp;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { token }: SendOTPRequest = await req.json();

    // Validate input

    // Validate input
    if (!token || typeof token !== "string") {
      console.error("[send-otp] Invalid or missing token");
      return new Response(
        JSON.stringify({ error: "署名トークンが無効です" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find signature record by token
    const { data: signature, error: sigError } = await supabase
      .from("contract_signatures")
      .select("*, contract:contracts(title, contract_number)")
      .eq("signature_token", token)
      .single();

    if (sigError || !signature) {
      console.error("[send-otp] Invalid or expired signature token:", sigError);
      return new Response(
        JSON.stringify({ error: "署名リンクが無効または期限切れです" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if already signed
    if (signature.signed_at) {
      return new Response(
        JSON.stringify({ error: "この契約書はすでに署名されています" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate new OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    // Store OTP in database
    const { error: updateError } = await supabase
      .from("contract_signatures")
      .update({
        otp_code: otpCode,
        otp_expires_at: expiresAt,
      })
      .eq("signature_token", token);

    if (updateError) {
      console.error("[send-otp] Failed to store OTP:", updateError);
      return new Response(
        JSON.stringify({ error: "確認コードの生成に失敗しました" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send OTP via email if Resend API key is configured
    if (resendApiKey) {
      try {
        const contractTitle = signature.contract?.title || "契約書";
        const contractNumber = signature.contract?.contract_number || "";

        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: "Totonos <noreply@resend.dev>",
            to: [signature.signatory_email],
            subject: `【確認コード】${contractTitle} の署名確認`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>契約書署名の確認コード</h2>
                <p>以下の確認コードを入力して、契約書への署名を続行してください。</p>
                
                <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                  <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 0;">${otpCode}</p>
                </div>
                
                <p><strong>契約書:</strong> ${contractTitle}</p>
                ${contractNumber ? `<p><strong>契約番号:</strong> ${contractNumber}</p>` : ""}
                
                <p style="color: #666; font-size: 14px;">
                  このコードは10分間有効です。<br>
                  心当たりのない場合は、このメールを無視してください。
                </p>
                
                <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
                <p style="color: #999; font-size: 12px;">
                  Totonos - 契約管理システム
                </p>
              </div>
            `,
          }),
        });

        if (!emailResponse.ok) {
          const errorData = await emailResponse.text();
          console.error("[send-otp] Failed to send email:", errorData);
          // Continue anyway - OTP is stored
        }
      } catch (emailError) {
        console.error("[send-otp] Email sending error:", emailError);
        // Continue anyway - OTP is stored
      }
    } else {
      // RESEND_API_KEY not configured, skipping email
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "確認コードを送信しました",
        email: signature.signatory_email.replace(/(.{2})(.*)(@.*)/, "$1***$3"), // Mask email
        expiresAt,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[send-otp] Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "予期せぬエラーが発生しました" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
