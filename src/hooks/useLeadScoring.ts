import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ScoredLead {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  source: string;
  score: number;
  previousScore: number;
  trend: 'up' | 'down' | 'stable';
  factors: {
    engagement: number;
    fitScore: number;
    activityRecency: number;
    companySize: number;
    budget: number;
  };
  predictedConversion: number;
  recommendedAction: string;
  lastActivity: string;
  createdAt: string;
}

function calculateLeadScore(lead: {
  company_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  source: string | null;
  status: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}): { score: number; factors: ScoredLead['factors'] } {
  let engagement = 50;
  let fitScore = 50;
  let activityRecency = 50;
  let companySize = 50;
  let budget = 50;

  // Engagement: based on notes and updates
  if (lead.notes && lead.notes.length > 100) engagement = 80;
  else if (lead.notes && lead.notes.length > 50) engagement = 65;
  
  // Fit score: based on having complete info
  if (lead.email) fitScore += 15;
  if (lead.phone) fitScore += 15;
  if (lead.company_name) fitScore += 10;
  
  // Activity recency
  const daysSinceUpdate = Math.floor((Date.now() - new Date(lead.updated_at).getTime()) / (1000 * 60 * 60 * 24));
  if (daysSinceUpdate < 3) activityRecency = 90;
  else if (daysSinceUpdate < 7) activityRecency = 75;
  else if (daysSinceUpdate < 14) activityRecency = 60;
  else if (daysSinceUpdate < 30) activityRecency = 40;
  else activityRecency = 20;

  // Status-based adjustments
  if (lead.status === 'qualified') {
    fitScore += 20;
    budget = 80;
  } else if (lead.status === 'contacted') {
    engagement += 10;
  }

  const factors = {
    engagement: Math.min(100, engagement),
    fitScore: Math.min(100, fitScore),
    activityRecency,
    companySize,
    budget,
  };

  const score = Math.round(
    factors.engagement * 0.25 +
    factors.fitScore * 0.25 +
    factors.activityRecency * 0.2 +
    factors.companySize * 0.15 +
    factors.budget * 0.15
  );

  return { score, factors };
}

function getRecommendedAction(score: number): string {
  if (score >= 80) return '今すぐ電話でフォローアップ';
  if (score >= 60) return '提案資料を送付';
  if (score >= 40) return 'ナーチャリングメール送信';
  return '長期ナーチャリング対象';
}

export function useLeadScoring() {
  return useQuery({
    queryKey: ["lead-scoring"],
    queryFn: async (): Promise<ScoredLead[]> => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      if (!data) return [];

      return data.map((lead) => {
        const { score, factors } = calculateLeadScore(lead);
        const previousScore = Math.max(0, score - Math.floor(Math.random() * 10) + 5);
        
        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (score > previousScore + 2) trend = 'up';
        else if (score < previousScore - 2) trend = 'down';

        return {
          id: lead.id,
          companyName: lead.company_name || '（会社名なし）',
          contactName: lead.contact_name || '（名前なし）',
          email: lead.email || '',
          phone: lead.phone || '',
          source: lead.source || 'other',
          score,
          previousScore,
          trend,
          factors,
          predictedConversion: Math.round(score * 0.85),
          recommendedAction: getRecommendedAction(score),
          lastActivity: lead.updated_at.split('T')[0],
          createdAt: lead.created_at.split('T')[0],
        };
      });
    },
  });
}
