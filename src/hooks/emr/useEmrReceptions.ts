import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/hooks/useCompany";
import { toast } from "sonner";
import { EmrPatient } from "./useEmrPatients";

export interface EmrReception {
  id: string;
  company_id: string;
  patient_id: string;
  reception_number: string;
  reception_date: string;
  reception_time: string;
  status: "waiting" | "in_progress" | "completed" | "cancelled";
  visit_type: "initial" | "follow_up" | "emergency";
  chief_complaint: string | null;
  department: string | null;
  assigned_doctor_name: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  patient?: EmrPatient;
}

export type EmrReceptionInsert = Omit<EmrReception, "id" | "created_at" | "updated_at" | "patient">;
export type EmrReceptionUpdate = Partial<EmrReceptionInsert>;

export function useEmrReceptions(date?: string) {
  const { currentCompany } = useCompany();
  const queryClient = useQueryClient();
  const companyId = currentCompany?.id;
  const targetDate = date || new Date().toISOString().split("T")[0];

  const receptionsQuery = useQuery({
    queryKey: ["emr-receptions", companyId, targetDate],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from("emr_receptions")
        .select(`
          *,
          patient:emr_patients(*)
        `)
        .eq("company_id", companyId)
        .eq("reception_date", targetDate)
        .order("reception_time", { ascending: true });
      if (error) throw error;
      return data as EmrReception[];
    },
    enabled: !!companyId,
  });

  const createReception = useMutation({
    mutationFn: async (reception: Omit<EmrReceptionInsert, "company_id" | "reception_number">) => {
      if (!companyId) throw new Error("会社が選択されていません");
      
      // 受付番号を生成
      const { data: receptionNumber, error: numError } = await supabase
        .rpc("generate_emr_reception_number", { p_company_id: companyId });
      if (numError) throw numError;

      const { data, error } = await supabase
        .from("emr_receptions")
        .insert({
          ...reception,
          company_id: companyId,
          reception_number: receptionNumber,
        })
        .select(`
          *,
          patient:emr_patients(*)
        `)
        .single();
      if (error) throw error;
      return data as EmrReception;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emr-receptions", companyId] });
      toast.success("受付を登録しました");
    },
    onError: (error) => {
      toast.error(`受付登録に失敗しました: ${error.message}`);
    },
  });

  const updateReception = useMutation({
    mutationFn: async ({ id, ...updates }: EmrReceptionUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("emr_receptions")
        .update(updates)
        .eq("id", id)
        .select(`
          *,
          patient:emr_patients(*)
        `)
        .single();
      if (error) throw error;
      return data as EmrReception;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emr-receptions", companyId] });
      toast.success("受付を更新しました");
    },
    onError: (error) => {
      toast.error(`更新に失敗しました: ${error.message}`);
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: EmrReception["status"] }) => {
      const { data, error } = await supabase
        .from("emr_receptions")
        .update({ status })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as EmrReception;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["emr-receptions", companyId] });
      const statusLabels = {
        waiting: "待機中",
        in_progress: "診察中",
        completed: "完了",
        cancelled: "キャンセル",
      };
      toast.success(`ステータスを「${statusLabels[data.status]}」に変更しました`);
    },
    onError: (error) => {
      toast.error(`ステータス更新に失敗しました: ${error.message}`);
    },
  });

  const deleteReception = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("emr_receptions")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emr-receptions", companyId] });
      toast.success("受付を削除しました");
    },
    onError: (error) => {
      toast.error(`削除に失敗しました: ${error.message}`);
    },
  });

  return {
    receptions: receptionsQuery.data ?? [],
    isLoading: receptionsQuery.isLoading,
    error: receptionsQuery.error,
    createReception,
    updateReception,
    updateStatus,
    deleteReception,
    refetch: receptionsQuery.refetch,
  };
}

export function useTodayReceptionStats() {
  const { currentCompany } = useCompany();
  const companyId = currentCompany?.id;
  const today = new Date().toISOString().split("T")[0];

  return useQuery({
    queryKey: ["emr-reception-stats", companyId, today],
    queryFn: async () => {
      if (!companyId) return { total: 0, waiting: 0, inProgress: 0, completed: 0 };
      
      const { data, error } = await supabase
        .from("emr_receptions")
        .select("status")
        .eq("company_id", companyId)
        .eq("reception_date", today);
      
      if (error) throw error;
      
      return {
        total: data.length,
        waiting: data.filter(r => r.status === "waiting").length,
        inProgress: data.filter(r => r.status === "in_progress").length,
        completed: data.filter(r => r.status === "completed").length,
      };
    },
    enabled: !!companyId,
  });
}
