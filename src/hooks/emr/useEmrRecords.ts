import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/hooks/useCompany";
import { toast } from "sonner";
import { EmrPatient } from "./useEmrPatients";
import { EmrReception } from "./useEmrReceptions";

export interface VitalSigns {
  temperature?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  pulse?: number;
  respiratory_rate?: number;
  spo2?: number;
  weight?: number;
  height?: number;
}

export interface Prescription {
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
}

export interface Procedure {
  name: string;
  code?: string;
  notes?: string;
}

export interface EmrMedicalRecord {
  id: string;
  company_id: string;
  patient_id: string;
  reception_id: string | null;
  record_number: string;
  record_date: string;
  doctor_name: string | null;
  subjective: string | null;
  objective: string | null;
  assessment: string | null;
  plan: string | null;
  vital_signs: VitalSigns;
  prescriptions: Prescription[];
  procedures: Procedure[];
  is_signed: boolean;
  signed_at: string | null;
  hpki_signature: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  patient?: EmrPatient;
  reception?: EmrReception;
}

export type EmrMedicalRecordInsert = Omit<EmrMedicalRecord, "id" | "created_at" | "updated_at" | "patient" | "reception">;
export type EmrMedicalRecordUpdate = Partial<EmrMedicalRecordInsert>;

export function useEmrRecords(patientId?: string) {
  const { currentCompany } = useCompany();
  const queryClient = useQueryClient();
  const companyId = currentCompany?.id;

  const recordsQuery = useQuery({
    queryKey: ["emr-records", companyId, patientId],
    queryFn: async () => {
      if (!companyId) return [];
      
      let query = supabase
        .from("emr_medical_records")
        .select(`
          *,
          patient:emr_patients(*)
        `)
        .eq("company_id", companyId)
        .order("record_date", { ascending: false });
      
      if (patientId) {
        query = query.eq("patient_id", patientId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as EmrMedicalRecord[];
    },
    enabled: !!companyId,
  });

  const createRecord = useMutation({
    mutationFn: async (record: Omit<EmrMedicalRecordInsert, "company_id" | "record_number">) => {
      if (!companyId) throw new Error("会社が選択されていません");
      
      // カルテ番号を生成
      const { data: recordNumber, error: numError } = await supabase
        .rpc("generate_emr_record_number", { p_company_id: companyId });
      if (numError) throw numError;

      const { data, error } = await supabase
        .from("emr_medical_records")
        .insert({
          ...record,
          company_id: companyId,
          record_number: recordNumber,
        })
        .select(`
          *,
          patient:emr_patients(*)
        `)
        .single();
      if (error) throw error;
      return data as EmrMedicalRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emr-records", companyId] });
      toast.success("カルテを作成しました");
    },
    onError: (error) => {
      toast.error(`カルテ作成に失敗しました: ${error.message}`);
    },
  });

  const updateRecord = useMutation({
    mutationFn: async ({ id, ...updates }: EmrMedicalRecordUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("emr_medical_records")
        .update(updates)
        .eq("id", id)
        .select(`
          *,
          patient:emr_patients(*)
        `)
        .single();
      if (error) throw error;
      return data as EmrMedicalRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emr-records", companyId] });
      toast.success("カルテを更新しました");
    },
    onError: (error) => {
      toast.error(`更新に失敗しました: ${error.message}`);
    },
  });

  const signRecord = useMutation({
    mutationFn: async ({ id, signature }: { id: string; signature?: string }) => {
      const { data, error } = await supabase
        .from("emr_medical_records")
        .update({
          is_signed: true,
          signed_at: new Date().toISOString(),
          hpki_signature: signature || null,
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as EmrMedicalRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emr-records", companyId] });
      toast.success("カルテに署名しました");
    },
    onError: (error) => {
      toast.error(`署名に失敗しました: ${error.message}`);
    },
  });

  const deleteRecord = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("emr_medical_records")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emr-records", companyId] });
      toast.success("カルテを削除しました");
    },
    onError: (error) => {
      toast.error(`削除に失敗しました: ${error.message}`);
    },
  });

  return {
    records: recordsQuery.data ?? [],
    isLoading: recordsQuery.isLoading,
    error: recordsQuery.error,
    createRecord,
    updateRecord,
    signRecord,
    deleteRecord,
    refetch: recordsQuery.refetch,
  };
}

export function useEmrRecord(recordId: string | undefined) {
  const { currentCompany } = useCompany();
  const companyId = currentCompany?.id;

  return useQuery({
    queryKey: ["emr-record", recordId],
    queryFn: async () => {
      if (!recordId) return null;
      const { data, error } = await supabase
        .from("emr_medical_records")
        .select(`
          *,
          patient:emr_patients(*),
          reception:emr_receptions(*)
        `)
        .eq("id", recordId)
        .single();
      if (error) throw error;
      return data as EmrMedicalRecord;
    },
    enabled: !!recordId && !!companyId,
  });
}

export function useTodayRecordStats() {
  const { currentCompany } = useCompany();
  const companyId = currentCompany?.id;
  const today = new Date().toISOString().split("T")[0];

  return useQuery({
    queryKey: ["emr-record-stats", companyId, today],
    queryFn: async () => {
      if (!companyId) return { total: 0, signed: 0, unsigned: 0 };
      
      const { data, error } = await supabase
        .from("emr_medical_records")
        .select("is_signed")
        .eq("company_id", companyId)
        .eq("record_date", today);
      
      if (error) throw error;
      
      return {
        total: data.length,
        signed: data.filter(r => r.is_signed).length,
        unsigned: data.filter(r => !r.is_signed).length,
      };
    },
    enabled: !!companyId,
  });
}
