import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useCurrentCompany } from "./useCompany";
import { toast } from "sonner";

export interface AdvancePayment {
  id: string;
  user_id: string;
  company_id: string;
  purpose: string;
  requested_amount: number;
  approved_amount: number | null;
  settled_amount: number | null;
  status: "pending" | "approved" | "settled" | "rejected" | "overdue";
  request_date: string;
  expected_date: string;
  settle_date: string | null;
  reason: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useAdvancePayments() {
  const { data: company } = useCurrentCompany();

  return useQuery({
    queryKey: ["advance-payments", company?.id],
    queryFn: async () => {
      if (!company?.id) return [];

      const { data, error } = await supabase
        .from("advance_payments")
        .select("*")
        .eq("company_id", company.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as AdvancePayment[];
    },
    enabled: !!company?.id,
  });
}

export function useCreateAdvancePayment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: company } = useCurrentCompany();

  return useMutation({
    mutationFn: async ({
      purpose,
      requestedAmount,
      expectedDate,
      reason,
    }: {
      purpose: string;
      requestedAmount: number;
      expectedDate: Date;
      reason?: string;
    }) => {
      if (!user) throw new Error("認証が必要です");
      if (!company) throw new Error("会社が選択されていません");

      const { data, error } = await supabase
        .from("advance_payments")
        .insert({
          user_id: user.id,
          company_id: company.id,
          purpose,
          requested_amount: requestedAmount,
          expected_date: expectedDate.toISOString().split("T")[0],
          reason: reason || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advance-payments"] });
      toast.success("仮払い申請を提出しました");
    },
    onError: (error) => {
      toast.error("仮払い申請に失敗しました", { description: error.message });
    },
  });
}

export function useUpdateAdvancePaymentStatus() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      approvedAmount,
      settledAmount,
    }: {
      id: string;
      status: "approved" | "rejected" | "settled";
      approvedAmount?: number;
      settledAmount?: number;
    }) => {
      if (!user) throw new Error("認証が必要です");

      const updateData: Record<string, unknown> = { status };

      if (status === "approved") {
        updateData.approved_amount = approvedAmount;
        updateData.approved_by = user.id;
        updateData.approved_at = new Date().toISOString();
      } else if (status === "settled") {
        updateData.settled_amount = settledAmount;
        updateData.settle_date = new Date().toISOString().split("T")[0];
      }

      const { error } = await supabase
        .from("advance_payments")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["advance-payments"] });
      const messages = {
        approved: "仮払いを承認しました",
        rejected: "仮払いを却下しました",
        settled: "精算を完了しました",
      };
      toast.success(messages[variables.status]);
    },
    onError: (error) => {
      toast.error("ステータス更新に失敗しました", { description: error.message });
    },
  });
}
