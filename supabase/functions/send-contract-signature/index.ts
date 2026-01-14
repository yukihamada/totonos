import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendContractSignatureRequest {
  contractId: string;
  sendMethod: "email" | "link";
  recipientEmail?: string;
  recipientName?: string;
  message?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "認証が必要です" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "認証に失敗しました" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: SendContractSignatureRequest = await req.json();
    const { contractId, sendMethod, recipientEmail, recipientName, message } = body;

    // Get contract
    const { data: contract, error: contractError } = await supabase
      .from("contracts")
      .select("*, client:clients(*)")
      .eq("id", contractId)
      .eq("user_id", user.id)
      .single();

    if (contractError || !contract) {
      return new Response(JSON.stringify({ error: "契約書が見つかりません" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const email = recipientEmail || contract.client?.email;
    if (sendMethod === "email" && !email) {
      return new Response(JSON.stringify({ error: "メールアドレスが必要です" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate signature token
    const signatureToken = crypto.randomUUID();

    // Create signature record
    const { error: sigError } = await supabase.from("contract_signatures").insert({
      contract_id: contractId,
      signatory_type: "recipient",
      signatory_email: email || "pending@example.com",
      signatory_name: recipientName || contract.client?.name || null,
      signature_token: signatureToken,
      signature_method: "email_otp",
    });

    if (sigError) {
      console.error("[send-contract-signature] Failed to create signature:", sigError);
      return new Response(JSON.stringify({ error: "署名レコードの作成に失敗しました" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update contract status
    await supabase.from("contracts").update({ status: "sent" }).eq("id", contractId);

    const signatureUrl = `${supabaseUrl.replace(".supabase.co", ".lovable.app")}/contract-sign/${signatureToken}`;

    // Send email if method is email
    if (sendMethod === "email" && resendApiKey && email) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: "Totonos <noreply@resend.dev>",
          to: [email],
          subject: `【署名依頼】${contract.title}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>電子署名のお願い</h2>
              <p>${recipientName || "ご担当者"}様</p>
              <p>以下の契約書への電子署名をお願いいたします。</p>
              ${message ? `<p style="background: #f5f5f5; padding: 12px; border-radius: 4px;">${message}</p>` : ""}
              <div style="margin: 24px 0;">
                <strong>契約書:</strong> ${contract.title}<br>
                <strong>契約番号:</strong> ${contract.contract_number}
              </div>
              <a href="${signatureUrl}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                契約書を確認して署名する
              </a>
              <p style="margin-top: 24px; color: #666; font-size: 12px;">
                このリンクは電子署名法に基づく電子署名のためのものです。
              </p>
            </div>
          `,
        }),
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        signatureUrl: sendMethod === "link" ? signatureUrl : undefined,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[send-contract-signature] Error:", error);
    return new Response(JSON.stringify({ error: "予期せぬエラーが発生しました" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
