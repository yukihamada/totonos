import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentCompany } from "@/hooks/useCompany";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

export interface PrescriptionMedication {
  medication_id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  days: number;
  instructions?: string;
}

export interface EmrMedication {
  id: string;
  company_id: string;
  yj_code: string | null;
  name: string;
  generic_name: string | null;
  unit: string | null;
  dosage_form: string | null;
  is_generic: boolean;
  is_active: boolean;
}

export interface EmrPrescription {
  id: string;
  company_id: string;
  record_id: string | null;
  patient_id: string | null;
  prescription_number: string | null;
  prescription_date: string;
  medications: PrescriptionMedication[];
  pharmacy_notes: string | null;
  issued_at: string | null;
  status: 'draft' | 'issued' | 'dispensed' | 'cancelled';
  created_at: string;
  patient?: {
    id: string;
    name: string;
    patient_number: string;
    birth_date: string;
  };
}

export function useEmrMedications() {
  const { data: currentCompany } = useCurrentCompany();
  const queryClient = useQueryClient();

  const { data: medications, isLoading } = useQuery({
    queryKey: ['emr-medications', currentCompany?.id],
    queryFn: async () => {
      if (!currentCompany?.id) return [];
      
      const { data, error } = await supabase
        .from('emr_medications')
        .select('*')
        .eq('company_id', currentCompany.id)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data as EmrMedication[];
    },
    enabled: !!currentCompany?.id,
  });

  const createMedication = useMutation({
    mutationFn: async (data: Omit<EmrMedication, 'id' | 'company_id' | 'is_active'>) => {
      if (!currentCompany?.id) throw new Error('No company selected');
      
      const { data: result, error } = await supabase
        .from('emr_medications')
        .insert({ ...data, company_id: currentCompany.id })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emr-medications'] });
      toast.success('薬剤を追加しました');
    },
  });

  const updateMedication = useMutation({
    mutationFn: async ({ id, ...data }: Partial<EmrMedication> & { id: string }) => {
      const { error } = await supabase
        .from('emr_medications')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emr-medications'] });
      toast.success('薬剤情報を更新しました');
    },
  });

  return { medications: medications || [], isLoading, createMedication, updateMedication };
}

export function useEmrPrescriptions(patientId?: string) {
  const { data: currentCompany } = useCurrentCompany();
  const queryClient = useQueryClient();

  const { data: prescriptions, isLoading } = useQuery({
    queryKey: ['emr-prescriptions', currentCompany?.id, patientId],
    queryFn: async () => {
      if (!currentCompany?.id) return [];
      
      let query = supabase
        .from('emr_prescriptions')
        .select(`
          *,
          patient:emr_patients(id, name, patient_number, birth_date)
        `)
        .eq('company_id', currentCompany.id)
        .order('prescription_date', { ascending: false });

      if (patientId) {
        query = query.eq('patient_id', patientId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(d => ({
        ...d,
        medications: Array.isArray(d.medications) ? d.medications as unknown as PrescriptionMedication[] : []
      })) as EmrPrescription[];
    },
    enabled: !!currentCompany?.id,
  });

  const createPrescription = useMutation({
    mutationFn: async (data: Omit<EmrPrescription, 'id' | 'company_id' | 'created_at' | 'patient'>) => {
      if (!currentCompany?.id) throw new Error('No company selected');

      // Generate prescription number
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
      
      const { count } = await supabase
        .from('emr_prescriptions')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', currentCompany.id)
        .gte('created_at', today.toISOString().slice(0, 10));

      const prescriptionNumber = `RX${dateStr}-${String((count || 0) + 1).padStart(4, '0')}`;

      const insertData = {
        ...data,
        medications: data.medications as unknown as Json,
        company_id: currentCompany.id,
        prescription_number: prescriptionNumber,
      };

      const { data: result, error } = await supabase
        .from('emr_prescriptions')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emr-prescriptions'] });
      toast.success('処方箋を作成しました');
    },
    onError: (error) => {
      toast.error('処方箋の作成に失敗しました');
      console.error(error);
    },
  });

  const issuePrescription = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('emr_prescriptions')
        .update({ 
          status: 'issued',
          issued_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emr-prescriptions'] });
      toast.success('処方箋を発行しました');
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: EmrPrescription['status'] }) => {
      const { error } = await supabase
        .from('emr_prescriptions')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emr-prescriptions'] });
      toast.success('ステータスを更新しました');
    },
  });

  return { 
    prescriptions: prescriptions || [], 
    isLoading, 
    createPrescription, 
    issuePrescription,
    updateStatus 
  };
}
