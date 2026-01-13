import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { companyName } = await req.json();
    if (!companyName || typeof companyName !== "string") {
      throw new Error("Company name is required");
    }

    console.log(`Searching for company: ${companyName}`);

    // Call Lovable AI Gateway to search for company information
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `あなたは日本の企業情報を検索するアシスタントです。
会社名から以下の情報を推測・検索してJSON形式で返してください：

- company_name: 正式な会社名（株式会社を含む）
- company_address: 本社所在地（都道府県から始める）
- industry: 業種（例：IT、製造、小売など）
- description: 事業内容の簡潔な説明（50文字以内）
- website: 公式ウェブサイト（推測可能な場合）
- employee_count_estimate: 従業員数の推定（不明な場合はnull）

存在しない会社や情報が不明な場合は、入力された会社名をそのまま使い、他のフィールドはnullにしてください。
必ずJSON形式のみで回答してください。説明文は不要です。`
          },
          {
            role: "user",
            content: `会社名: ${companyName}`
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    console.log("AI response:", content);

    // Parse the JSON response
    let companyInfo;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        companyInfo = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Return basic info if parsing fails
      companyInfo = {
        company_name: companyName,
        company_address: null,
        industry: null,
        description: null,
        website: null,
        employee_count_estimate: null,
      };
    }

    return new Response(JSON.stringify(companyInfo), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Search company error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
