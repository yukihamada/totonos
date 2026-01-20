import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { consumeCompanyCredits, canUseCredits, CREDIT_COSTS } from "../_shared/credits.ts";
import { fetchWithRetry, getUserFriendlyError } from "../_shared/fetch-utils.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReplyRequest {
  emailId: string;
  replyStyle: "formal" | "casual" | "brief";
  companyId: string;
}

interface ReplyResponse {
  success: boolean;
  reply?: string;
  error?: string;
  creditsUsed?: number;
}

async function generateReply(
  subject: string | null,
  body: string,
  fromName: string | null,
  replyStyle: string
): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  
  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY not configured");
  }

  const styleGuide: Record<string, string> = {
    formal: "丁寧で礼儀正しいビジネス文体で書いてください。敬語を適切に使用し、プロフェッショナルな印象を与えてください。",
    casual: "親しみやすく、でも礼儀は保った文体で書いてください。硬すぎない自然な表現を使ってください。",
    brief: "簡潔に要点だけを伝える文体で書いてください。3〜5文程度でまとめてください。",
  };

  const prompt = `以下のメールに対する返信案を作成してください。

${styleGuide[replyStyle] || styleGuide.formal}

【受信メール】
件名: ${subject || "(なし)"}
差出人: ${fromName || "不明"}
本文:
${body.substring(0, 2000)}

【回答形式】
返信メールの本文のみを出力してください。件名や署名は不要です。`;

  const response = await fetchWithRetry("https://api.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${LOVABLE_API_KEY}`,
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
    maxRetries: 3,
    retryDelayMs: 1000,
    timeoutMs: 30000,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("AI API error:", response.status, errorText);
    throw new Error(`AI API failed: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { emailId, replyStyle, companyId }: ReplyRequest = await req.json();

    if (!emailId || !companyId) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Generating reply for email ${emailId}, style: ${replyStyle}`);

    // Check credits
    const hasCredits = await canUseCredits(supabase, companyId, "ai_email_reply");
    if (!hasCredits) {
      return new Response(
        JSON.stringify({ success: false, error: "クレジットが不足しています" }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch email content
    const { data: email, error: fetchError } = await supabase
      .from("inbound_emails")
      .select("subject, text_body, html_body, from_name, from_email")
      .eq("id", emailId)
      .single();

    if (fetchError || !email) {
      console.error("Failed to fetch email:", fetchError);
      return new Response(
        JSON.stringify({ success: false, error: "メールが見つかりません" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = email.text_body || email.html_body?.replace(/<[^>]*>/g, "") || "";

    // Generate reply
    const reply = await generateReply(
      email.subject,
      body,
      email.from_name,
      replyStyle || "formal"
    );

    // Consume credits
    const consumeResult = await consumeCompanyCredits(
      supabase,
      companyId,
      "ai_email_reply",
      `AI返信案生成: ${email.subject?.substring(0, 30) || "(件名なし)"}`,
      { email_id: emailId, from: email.from_email, style: replyStyle }
    );

    if (!consumeResult.success) {
      console.error("Failed to consume credits:", consumeResult.error);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        reply,
        creditsUsed: CREDIT_COSTS.ai_email_reply.cost 
      } as ReplyResponse),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating reply:", error);
    const userFriendlyError = getUserFriendlyError(error);
    return new Response(
      JSON.stringify({ success: false, error: userFriendlyError }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
