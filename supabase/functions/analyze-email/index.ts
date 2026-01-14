import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AnalyzeRequest {
  emailId: string;
  textContent: string;
  subject: string | null;
}

interface AIAnalysis {
  summary: string;
  category: string;
  urgency: "high" | "medium" | "low";
  sentiment: "positive" | "negative" | "neutral";
  extractedDeadline: string | null;
}

async function analyzeWithAI(content: string, subject: string | null): Promise<AIAnalysis> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  
  if (!LOVABLE_API_KEY) {
    console.error("LOVABLE_API_KEY not configured");
    throw new Error("AI API key not configured");
  }

  const prompt = `以下のメールを分析してJSON形式で回答してください。

件名: ${subject || "(なし)"}
本文:
${content.substring(0, 3000)}

回答形式:
{
  "summary": "3行以内の要約（日本語）",
  "category": "問い合わせ|見積依頼|クレーム|契約関連|採用応募|請求関連|その他 のいずれか",
  "urgency": "high|medium|low のいずれか（緊急度）",
  "sentiment": "positive|negative|neutral のいずれか（感情）",
  "extractedDeadline": "期日があれば ISO8601形式、なければ null"
}

JSON のみを返してください。`;

  const response = await fetch("https://api.lovable.dev/v1/chat/completions", {
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
      temperature: 0.3,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("AI API error:", errorText);
    throw new Error(`AI API failed: ${response.status}`);
  }

  const data = await response.json();
  const aiResponse = data.choices?.[0]?.message?.content || "";

  console.log("AI response:", aiResponse);

  // Extract JSON from response
  const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse AI response as JSON");
  }

  const analysis = JSON.parse(jsonMatch[0]) as AIAnalysis;
  return analysis;
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

    const { emailId, textContent, subject }: AnalyzeRequest = await req.json();

    if (!emailId || !textContent) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Analyzing email ${emailId}`);

    // Run AI analysis
    const analysis = await analyzeWithAI(textContent, subject);

    console.log(`Analysis result:`, analysis);

    // Update email with AI analysis
    const { error: updateError } = await supabase
      .from("inbound_emails")
      .update({
        ai_summary: analysis.summary,
        ai_category: analysis.category,
        ai_urgency: analysis.urgency,
        ai_sentiment: analysis.sentiment,
        ai_extracted_deadline: analysis.extractedDeadline,
        status: "processed",
      })
      .eq("id", emailId);

    if (updateError) {
      console.error("Failed to update email with analysis:", updateError);
      return new Response(
        JSON.stringify({ success: false, error: updateError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, analysis }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error analyzing email:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
