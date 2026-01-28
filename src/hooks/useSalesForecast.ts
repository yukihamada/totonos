import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subMonths, addMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ja } from 'date-fns/locale';

export interface ForecastData {
  month: string;
  predicted: number;
  actual?: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
}

export interface DealForecast {
  id: string;
  name: string;
  client: string;
  amount: number;
  probability: number;
  expectedCloseDate: string;
  stage: string;
  aiInsight: string;
  riskFactors: string[];
  opportunities: string[];
}

interface SalesForecastResult {
  monthlyForecast: ForecastData[];
  dealForecasts: DealForecast[];
  totalPredicted: number;
  weightedPipeline: number;
  avgConfidence: number;
  isLoading: boolean;
  error: Error | null;
}

// Map stage to Japanese and probabilities
const stageConfig: Record<string, { label: string; baseProbability: number }> = {
  initial: { label: '初回接触', baseProbability: 20 },
  qualification: { label: 'ヒアリング中', baseProbability: 35 },
  proposal: { label: '提案中', baseProbability: 50 },
  negotiation: { label: '最終交渉', baseProbability: 75 },
  contract: { label: '契約書作成', baseProbability: 90 },
  won: { label: '成約', baseProbability: 100 },
  lost: { label: '失注', baseProbability: 0 },
};

// Generate AI insight based on deal data
function generateAIInsight(deal: any): string {
  const stage = deal.stage;
  const amount = deal.amount || 0;
  const daysUntilClose = deal.expected_close_date 
    ? Math.ceil((new Date(deal.expected_close_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  if (stage === 'contract' || stage === 'negotiation') {
    if (daysUntilClose < 14) {
      return '成約間近です。契約条件の最終確認と署名スケジュールの調整を推奨します。';
    }
    return '最終段階です。決裁者との直接コミュニケーションを維持し、競合対策を強化してください。';
  }
  
  if (stage === 'proposal') {
    if (amount > 5000000) {
      return '大型案件です。複数の意思決定者への提案と、段階的な導入プランの提示が効果的です。';
    }
    return '提案内容への反応を確認し、カスタマイズの余地を探ってください。';
  }
  
  if (stage === 'qualification' || stage === 'initial') {
    return '初期段階です。顧客の課題を深掘りし、適切なソリューション提案につなげましょう。';
  }
  
  return '商談の進捗状況を定期的に更新し、次のアクションを明確にしてください。';
}

// Generate risk factors based on deal
function generateRiskFactors(deal: any): string[] {
  const risks: string[] = [];
  const daysUntilClose = deal.expected_close_date 
    ? Math.ceil((new Date(deal.expected_close_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  if (daysUntilClose < 0) {
    risks.push('予定クローズ日を過ぎています');
  } else if (daysUntilClose > 90) {
    risks.push('クローズまでの期間が長い');
  }

  if ((deal.amount || 0) > 10000000) {
    risks.push('大型案件のため意思決定に時間がかかる可能性');
  }

  if (deal.stage === 'initial' || deal.stage === 'qualification') {
    risks.push('初期段階のため不確実性が高い');
  }

  if (!deal.client_id) {
    risks.push('顧客情報が未登録');
  }

  return risks.slice(0, 3);
}

// Generate opportunities based on deal
function generateOpportunities(deal: any): string[] {
  const opportunities: string[] = [];

  if (deal.stage === 'contract' || deal.stage === 'negotiation') {
    opportunities.push('追加オプションの提案機会');
  }

  if ((deal.amount || 0) > 3000000) {
    opportunities.push('年間契約への切り替え提案');
  }

  opportunities.push('関連サービスのクロスセル');

  return opportunities.slice(0, 3);
}

export function useSalesForecast(): SalesForecastResult {
  // Fetch active deals
  const { data: deals, isLoading: dealsLoading, error: dealsError } = useQuery({
    queryKey: ['sales-forecast-deals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select(`
          id,
          deal_name,
          amount,
          probability,
          expected_close_date,
          stage,
          client_id,
          created_at,
          clients(name)
        `)
        .in('stage', ['initial', 'proposal', 'negotiation', 'contract'])
        .order('expected_close_date', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch historical closed deals for trend analysis
  const { data: historicalDeals, isLoading: histLoading } = useQuery({
    queryKey: ['sales-forecast-historical'],
    queryFn: async () => {
      const sixMonthsAgo = format(subMonths(new Date(), 6), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('deals')
        .select('id, amount, actual_close_date, stage')
        .eq('stage', 'won')
        .gte('actual_close_date', sixMonthsAgo)
        .order('actual_close_date', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  // Process deal forecasts
  const dealForecasts = useMemo<DealForecast[]>(() => {
    if (!deals) return [];

    return deals.map(deal => {
      const stageInfo = stageConfig[deal.stage] || { label: deal.stage, baseProbability: 50 };
      const probability = deal.probability ?? stageInfo.baseProbability;
      
      return {
        id: deal.id,
        name: deal.deal_name,
        client: (deal.clients as any)?.name || '未登録',
        amount: deal.amount || 0,
        probability,
        expectedCloseDate: deal.expected_close_date || '',
        stage: stageInfo.label,
        aiInsight: generateAIInsight(deal),
        riskFactors: generateRiskFactors(deal),
        opportunities: generateOpportunities(deal),
      };
    });
  }, [deals]);

  // Generate monthly forecast
  const monthlyForecast = useMemo<ForecastData[]>(() => {
    const forecasts: ForecastData[] = [];
    const now = new Date();

    // Group historical deals by month for actuals
    const monthlyActuals = new Map<string, number>();
    if (historicalDeals) {
      for (const deal of historicalDeals) {
        if (deal.actual_close_date) {
          const monthKey = format(new Date(deal.actual_close_date), 'yyyy年M月', { locale: ja });
          const current = monthlyActuals.get(monthKey) || 0;
          monthlyActuals.set(monthKey, current + (deal.amount || 0));
        }
      }
    }

    // Past 3 months with actuals
    for (let i = 3; i >= 1; i--) {
      const month = subMonths(now, i);
      const monthKey = format(month, 'yyyy年M月', { locale: ja });
      const actual = monthlyActuals.get(monthKey) || 0;
      
      forecasts.push({
        month: monthKey,
        predicted: actual, // Use actual as the "predicted" for past months (no random variance)
        actual,
        confidence: 100, // Past months have 100% confidence since we have actual data
        trend: actual > 0 ? 'up' : 'stable',
      });
    }

    // Future 3 months with predictions based on pipeline
    const pipelineByMonth = new Map<string, number>();
    if (deals) {
      for (const deal of deals) {
        if (deal.expected_close_date) {
          const monthKey = format(new Date(deal.expected_close_date), 'yyyy年M月', { locale: ja });
          const probability = deal.probability ?? (stageConfig[deal.stage]?.baseProbability || 50);
          const weighted = (deal.amount || 0) * (probability / 100);
          const current = pipelineByMonth.get(monthKey) || 0;
          pipelineByMonth.set(monthKey, current + weighted);
        }
      }
    }

    for (let i = 0; i < 3; i++) {
      const month = addMonths(now, i);
      const monthKey = format(month, 'yyyy年M月', { locale: ja });
      const predicted = pipelineByMonth.get(monthKey) || 0;
      
      // Confidence decreases for future months
      const confidence = Math.max(85 - (i * 10), 60);
      
      forecasts.push({
        month: monthKey,
        predicted: Math.round(predicted),
        confidence,
        trend: predicted > 0 ? (i === 0 ? 'up' : 'stable') : 'down',
      });
    }

    return forecasts;
  }, [deals, historicalDeals]);

  // Calculate summary metrics
  const totalPredicted = useMemo(() => {
    return monthlyForecast
      .filter(f => !f.actual)
      .reduce((sum, f) => sum + f.predicted, 0);
  }, [monthlyForecast]);

  const weightedPipeline = useMemo(() => {
    return dealForecasts.reduce(
      (sum, d) => sum + d.amount * (d.probability / 100),
      0
    );
  }, [dealForecasts]);

  const avgConfidence = useMemo(() => {
    if (monthlyForecast.length === 0) return 0;
    return monthlyForecast.reduce((sum, f) => sum + f.confidence, 0) / monthlyForecast.length;
  }, [monthlyForecast]);

  return {
    monthlyForecast,
    dealForecasts,
    totalPredicted,
    weightedPipeline,
    avgConfidence,
    isLoading: dealsLoading || histLoading,
    error: dealsError as Error | null,
  };
}
