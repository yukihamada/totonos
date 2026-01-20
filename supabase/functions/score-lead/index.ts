import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { consumeCompanyCredits, getCompanyIdForUser } from "../_shared/credits.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LeadData {
  id: string;
  name: string;
  email: string;
  company: string;
  title?: string;
  source: string;
  website_visits?: number;
  email_opens?: number;
  email_clicks?: number;
  form_submissions?: number;
  days_since_last_activity?: number;
  industry?: string;
  company_size?: string;
}

interface ScoreResult {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  factors: Array<{
    factor: string;
    impact: number;
    description: string;
  }>;
  recommendations: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { leadId, organizationId } = await req.json();

    // クレジット消費
    const companyId = await getCompanyIdForUser(supabaseClient, user.id);
    if (companyId) {
      const creditResult = await consumeCompanyCredits(
        supabaseClient,
        companyId,
        "lead_scoring",
        "リードスコアリング"
      );
      if (!creditResult.success) {
        return new Response(JSON.stringify({ error: creditResult.error }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.log(`Credits consumed: ${creditResult.creditsUsed}, new balance: ${creditResult.newBalance}`);
    }

    // Fetch lead data
    const { data: lead, error: leadError } = await supabaseClient
      .from("leads")
      .select("*")
      .eq("id", leadId)
      .eq("organization_id", organizationId)
      .single();

    if (leadError || !lead) {
      return new Response(JSON.stringify({ error: "Lead not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Calculate score
    const result = calculateLeadScore(lead);

    // Update lead with new score
    await supabaseClient
      .from("leads")
      .update({
        score: result.score,
        score_grade: result.grade,
        score_factors: result.factors,
        scored_at: new Date().toISOString(),
      })
      .eq("id", leadId);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function calculateLeadScore(lead: LeadData): ScoreResult {
  let score = 0;
  const factors: ScoreResult['factors'] = [];
  const recommendations: string[] = [];

  // 1. Contact Information Completeness (max 15 points)
  let contactScore = 0;
  if (lead.email) contactScore += 5;
  if (lead.company) contactScore += 5;
  if (lead.title) contactScore += 5;
  score += contactScore;

  if (contactScore > 0) {
    factors.push({
      factor: "連絡先情報",
      impact: contactScore,
      description: `${contactScore}/15 - メール、会社名、役職の有無`,
    });
  }

  if (!lead.title) {
    recommendations.push("役職情報を取得するとスコアが向上します");
  }

  // 2. Engagement Score (max 30 points)
  let engagementScore = 0;

  if (lead.website_visits) {
    const visitPoints = Math.min(lead.website_visits * 2, 10);
    engagementScore += visitPoints;
  }

  if (lead.email_opens) {
    const openPoints = Math.min(lead.email_opens * 1.5, 10);
    engagementScore += openPoints;
  }

  if (lead.email_clicks) {
    const clickPoints = Math.min(lead.email_clicks * 3, 10);
    engagementScore += clickPoints;
  }

  score += engagementScore;

  if (engagementScore > 0) {
    factors.push({
      factor: "エンゲージメント",
      impact: engagementScore,
      description: `${engagementScore.toFixed(0)}/30 - Web訪問、メール開封、クリック`,
    });
  }

  if (engagementScore < 10) {
    recommendations.push("メールキャンペーンでエンゲージメントを高めましょう");
  }

  // 3. Lead Source Quality (max 20 points)
  const sourceScores: Record<string, number> = {
    referral: 20,
    organic: 15,
    direct: 12,
    social: 10,
    paid: 8,
    cold: 5,
    other: 5,
  };

  const sourceScore = sourceScores[lead.source?.toLowerCase()] || 5;
  score += sourceScore;

  factors.push({
    factor: "リードソース",
    impact: sourceScore,
    description: `${sourceScore}/20 - ${lead.source || "不明"}からの流入`,
  });

  // 4. Recency (max 15 points)
  let recencyScore = 15;
  if (lead.days_since_last_activity !== undefined) {
    if (lead.days_since_last_activity > 30) recencyScore = 5;
    else if (lead.days_since_last_activity > 14) recencyScore = 10;
    else if (lead.days_since_last_activity > 7) recencyScore = 12;
  }
  score += recencyScore;

  factors.push({
    factor: "最終活動",
    impact: recencyScore,
    description: `${recencyScore}/15 - ${lead.days_since_last_activity || 0}日前`,
  });

  if (recencyScore < 10) {
    recommendations.push("最近活動がありません。フォローアップを検討してください");
  }

  // 5. Company Fit (max 20 points)
  let fitScore = 10; // Default middle score

  // Ideal customer profile matching
  const idealIndustries = ["IT", "テクノロジー", "金融", "製造", "小売"];
  if (lead.industry && idealIndustries.some(i => lead.industry?.includes(i))) {
    fitScore += 5;
  }

  const idealSizes = ["50-100", "100-500", "500+", "1000+"];
  if (lead.company_size && idealSizes.some(s => lead.company_size?.includes(s))) {
    fitScore += 5;
  }

  score += fitScore;

  factors.push({
    factor: "企業適合度",
    impact: fitScore,
    description: `${fitScore}/20 - 業種・規模によるフィット`,
  });

  // Calculate grade
  let grade: ScoreResult['grade'];
  if (score >= 80) grade = 'A';
  else if (score >= 60) grade = 'B';
  else if (score >= 40) grade = 'C';
  else if (score >= 20) grade = 'D';
  else grade = 'F';

  // Add grade-based recommendations
  if (grade === 'A') {
    recommendations.unshift("優先度高: 即時フォローアップを推奨します");
  } else if (grade === 'B') {
    recommendations.unshift("有望リード: 継続的なナーチャリングを行いましょう");
  } else if (grade === 'C') {
    recommendations.unshift("育成が必要: コンテンツマーケティングで関係構築を");
  }

  return {
    score: Math.round(score),
    grade,
    factors,
    recommendations,
  };
}
