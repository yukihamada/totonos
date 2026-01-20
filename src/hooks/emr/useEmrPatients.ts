import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/hooks/useCompany";
import { toast } from "sonner";

export interface EmrPatient {
  id: string;
  company_id: string;
  patient_number: string;
  name: string;
  name_kana: string | null;
  gender: "male" | "female" | "other" | null;
  birth_date: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  blood_type: "A" | "B" | "O" | "AB" | "unknown" | null;
  allergies: string[] | null;
  insurance_type: string | null;
  insurance_number: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type EmrPatientInsert = Omit<EmrPatient, "id" | "created_at" | "updated_at">;
export type EmrPatientUpdate = Partial<EmrPatientInsert>;

export function useEmrPatients() {
  const { currentCompany } = useCompany();
  const queryClient = useQueryClient();
  const companyId = currentCompany?.id;

  const patientsQuery = useQuery({
    queryKey: ["emr-patients", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from("emr_patients")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as EmrPatient[];
    },
    enabled: !!companyId,
  });

  const createPatient = useMutation({
    mutationFn: async (patient: Omit<EmrPatientInsert, "company_id" | "patient_number">) => {
      if (!companyId) throw new Error("会社が選択されていません");
      
      // 患者番号を生成
      const { data: patientNumber, error: numError } = await supabase
        .rpc("generate_emr_patient_number", { p_company_id: companyId });
      if (numError) throw numError;

      const { data, error } = await supabase
        .from("emr_patients")
        .insert({
          ...patient,
          company_id: companyId,
          patient_number: patientNumber,
        })
        .select()
        .single();
      if (error) throw error;
      return data as EmrPatient;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emr-patients", companyId] });
      toast.success("患者を登録しました");
    },
    onError: (error) => {
      toast.error(`患者登録に失敗しました: ${error.message}`);
    },
  });

  const updatePatient = useMutation({
    mutationFn: async ({ id, ...updates }: EmrPatientUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("emr_patients")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as EmrPatient;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emr-patients", companyId] });
      toast.success("患者情報を更新しました");
    },
    onError: (error) => {
      toast.error(`更新に失敗しました: ${error.message}`);
    },
  });

  const deletePatient = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("emr_patients")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emr-patients", companyId] });
      toast.success("患者を削除しました");
    },
    onError: (error) => {
      toast.error(`削除に失敗しました: ${error.message}`);
    },
  });

  return {
    patients: patientsQuery.data ?? [],
    isLoading: patientsQuery.isLoading,
    error: patientsQuery.error,
    createPatient,
    updatePatient,
    deletePatient,
    refetch: patientsQuery.refetch,
  };
}

export function useEmrPatient(patientId: string | undefined) {
  const { currentCompany } = useCompany();
  const companyId = currentCompany?.id;

  return useQuery({
    queryKey: ["emr-patient", patientId],
    queryFn: async () => {
      if (!patientId) return null;
      const { data, error } = await supabase
        .from("emr_patients")
        .select("*")
        .eq("id", patientId)
        .single();
      if (error) throw error;
      return data as EmrPatient;
    },
    enabled: !!patientId && !!companyId,
  });
}
