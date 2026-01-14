import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useCurrentCompany } from "./useCompany";
import { toast } from "sonner";
import type { CompanyCredits, UserCredits, CreditTransaction } from "@/types/company";

// プラン定義
export const PLANS = {
  free: { name: "Free", price: 0, monthlyCredits: 100 },
  starter: { name: "Starter", price: 980, monthlyCredits: 500 },
  standard: { name: "Standard", price: 2980, monthlyCredits: 2000 },
  pro: { name: "Pro", price: 9800, monthlyCredits: 10000 },
  enterprise: { name: "Enterprise", price: 0, monthlyCredits: Infinity },
} as const;

export type PlanType = keyof typeof PLANS;

// クレジット消費単価
export const CREDIT_COSTS = {
  ai_chat: { name: "AIチャット", cost: 1 },
  ai_forecast: { name: "AI売上予測", cost: 5 },
  ai_scoring: { name: "AIリードスコアリング", cost: 3 },
  ocr: { name: "領収書OCR", cost: 2 },
  pdf: { name: "PDF生成", cost: 1 },
  email: { name: "メール送信", cost: 1 },
  export: { name: "データエクスポート", cost: 2 },
  contract_create: { name: "契約書作成", cost: 3 },
  contract_sign: { name: "電子署名", cost: 2 },
} as const;

export type CreditAction = keyof typeof CREDIT_COSTS;

// チャージパック
export const CHARGE_PACKS = [
  { id: "pack_100", credits: 100, price: 500, pricePerCredit: 5.0, discount: 0 },
  { id: "pack_500", credits: 500, price: 2000, pricePerCredit: 4.0, discount: 20 },
  { id: "pack_1000", credits: 1000, price: 3500, pricePerCredit: 3.5, discount: 30 },
  { id: "pack_5000", credits: 5000, price: 15000, pricePerCredit: 3.0, discount: 40 },
] as const;

// ユーザーのクレジットを取得
export function useUserCredits() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-credits", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("user_credits")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;

      // 存在しない場合は作成
      if (!data) {
        const { data: newCredits, error: createError } = await supabase
          .from("user_credits")
          .insert({ user_id: user.id })
          .select()
          .single();

        if (createError) throw createError;
        return newCredits;
      }

      return data;
    },
    enabled: !!user,
  });
}

// 会社のクレジットを取得
export function useCompanyCredits() {
  const { data: company } = useCurrentCompany();

  return useQuery({
    queryKey: ["company-credits", company?.id],
    queryFn: async () => {
      if (!company) return null;

      const { data, error } = await supabase
        .from("company_credits")
        .select("*")
        .eq("company_id", company.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!company?.id,
  });
}

// ハイブリッドクレジット計算
export function useHybridCredits() {
  const { data: userCredits, isLoading: userLoading } = useUserCredits();
  const { data: companyCredits, isLoading: companyLoading } = useCompanyCredits();

  const companyRemaining = companyCredits
    ? Math.max(0, companyCredits.monthly_credits - companyCredits.used_this_month) +
      companyCredits.charged_credits
    : 0;

  const userRemaining = userCredits
    ? Math.max(0, userCredits.monthly_credits - userCredits.used_this_month) +
      userCredits.charged_credits
    : 0;

  const totalRemaining = companyRemaining + userRemaining;

  const canUse = (action: CreditAction): boolean => {
    const cost = CREDIT_COSTS[action].cost;
    return totalRemaining >= cost;
  };

  return {
    userCredits,
    companyCredits,
    companyRemaining,
    userRemaining,
    totalRemaining,
    canUse,
    isLoading: userLoading || companyLoading,
  };
}

// クレジット消費
export function useConsumeCredits() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: company } = useCurrentCompany();

  return useMutation({
    mutationFn: async ({
      action,
      description,
    }: {
      action: CreditAction;
      description?: string;
    }) => {
      if (!user) throw new Error("認証が必要です");

      const cost = CREDIT_COSTS[action].cost;
      const reason = description || CREDIT_COSTS[action].name;

      // まず会社クレジットから消費
      if (company) {
        const { data: companyCredits } = await supabase
          .from("company_credits")
          .select("*")
          .eq("company_id", company.id)
          .single();

        if (companyCredits) {
          const companyRemaining =
            Math.max(0, companyCredits.monthly_credits - companyCredits.used_this_month) +
            companyCredits.charged_credits;

          if (companyRemaining >= cost) {
            const monthlyRemaining =
              companyCredits.monthly_credits - companyCredits.used_this_month;
            let newUsedThisMonth = companyCredits.used_this_month;
            let newChargedCredits = companyCredits.charged_credits;

            if (monthlyRemaining >= cost) {
              newUsedThisMonth += cost;
            } else {
              newUsedThisMonth = companyCredits.monthly_credits;
              newChargedCredits -= cost - monthlyRemaining;
            }

            await supabase
              .from("company_credits")
              .update({
                used_this_month: newUsedThisMonth,
                charged_credits: newChargedCredits,
              })
              .eq("company_id", company.id);

            const newBalance =
              Math.max(0, companyCredits.monthly_credits - newUsedThisMonth) + newChargedCredits;

            await supabase.from("credit_transactions").insert({
              user_id: user.id,
              company_id: company.id,
              transaction_type: "consume",
              amount: -cost,
              balance_after: newBalance,
              action,
              description: reason,
            });

            return { source: "company", cost };
          }
        }
      }

      // 会社クレジットが足りない場合は個人クレジットから
      const { data: userCredits } = await supabase
        .from("user_credits")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!userCredits) throw new Error("クレジット情報が見つかりません");

      const userRemaining =
        Math.max(0, userCredits.monthly_credits - userCredits.used_this_month) +
        userCredits.charged_credits;

      if (userRemaining < cost) {
        throw new Error("クレジットが不足しています");
      }

      const monthlyRemaining = userCredits.monthly_credits - userCredits.used_this_month;
      let newUsedThisMonth = userCredits.used_this_month;
      let newChargedCredits = userCredits.charged_credits;

      if (monthlyRemaining >= cost) {
        newUsedThisMonth += cost;
      } else {
        newUsedThisMonth = userCredits.monthly_credits;
        newChargedCredits -= cost - monthlyRemaining;
      }

      await supabase
        .from("user_credits")
        .update({
          used_this_month: newUsedThisMonth,
          charged_credits: newChargedCredits,
        })
        .eq("user_id", user.id);

      const newBalance =
        Math.max(0, userCredits.monthly_credits - newUsedThisMonth) + newChargedCredits;

      await supabase.from("credit_transactions").insert({
        user_id: user.id,
        transaction_type: "consume",
        amount: -cost,
        balance_after: newBalance,
        action,
        description: reason,
      });

      return { source: "user", cost };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-credits"] });
      queryClient.invalidateQueries({ queryKey: ["company-credits"] });
    },
    onError: (error) => {
      toast.error("クレジットの消費に失敗しました", { description: error.message });
    },
  });
}

// クレジットトランザクション履歴
export function useCreditTransactions(limit = 50) {
  const { user } = useAuth();
  const { data: company } = useCurrentCompany();

  return useQuery({
    queryKey: ["credit-transactions", user?.id, company?.id, limit],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from("credit_transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (company) {
        query = query.or(`user_id.eq.${user.id},company_id.eq.${company.id}`);
      } else {
        query = query.eq("user_id", user.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}
