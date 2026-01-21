import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/hooks/useCompany";
import { toast } from "sonner";

export interface VitalSigns {
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  pulse?: number;
  temperature?: number;
  spo2?: number;
  weight?: number;
}

export interface EmrHomeVisitPlan {
  id: string;
  company_id: string;
  patient_id: string | null;
  frequency: string | null;
  preferred_day: string | null;
  preferred_time: string | null;
  address: string | null;
  care_plan: string | null;
  is_active: boolean;
  patient?: {
    id: string;
    name: string;
    patient_number: string;
    address: string | null;
  };
}

export interface EmrHomeVisit {
  id: string;
  company_id: string;
  patient_id: string | null;
  plan_id: string | null;
  visit_date: string;
  visit_time: string | null;
  visit_type: 'regular' | 'temporary' | 'emergency';
  address: string | null;
  doctor_name: string | null;
  nurse_name: string | null;
  vital_signs: VitalSigns | null;
  notes: string | null;
  record_id: string | null;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  completed_at: string | null;
  created_at: string;
  patient?: {
    id: string;
    name: string;
    patient_number: string;
    phone: string | null;
  };
}

export function useEmrHomeVisitPlans() {
  const { currentCompany } = useCompany();
  const queryClient = useQueryClient();

  const { data: plans, isLoading } = useQuery({
    queryKey: ['emr-home-visit-plans', currentCompany?.id],
    queryFn: async () => {
      if (!currentCompany?.id) return [];
      
      const { data, error } = await supabase
        .from('emr_home_visit_plans')
        .select(`
          *,
          patient:emr_patients(id, name, patient_number, address)
        `)
        .eq('company_id', currentCompany.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as EmrHomeVisitPlan[];
    },
    enabled: !!currentCompany?.id,
  });

  const createPlan = useMutation({
    mutationFn: async (data: Omit<EmrHomeVisitPlan, 'id' | 'company_id' | 'patient'>) => {
      if (!currentCompany?.id) throw new Error('No company selected');
      
      const { data: result, error } = await supabase
        .from('emr_home_visit_plans')
        .insert({ ...data, company_id: currentCompany.id })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emr-home-visit-plans'] });
      toast.success('訪問計画を作成しました');
    },
  });

  const updatePlan = useMutation({
    mutationFn: async ({ id, ...data }: Partial<EmrHomeVisitPlan> & { id: string }) => {
      const { error } = await supabase
        .from('emr_home_visit_plans')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emr-home-visit-plans'] });
      toast.success('訪問計画を更新しました');
    },
  });

  return { plans: plans || [], isLoading, createPlan, updatePlan };
}

export function useEmrHomeVisits(date?: string) {
  const { currentCompany } = useCompany();
  const queryClient = useQueryClient();

  const { data: visits, isLoading } = useQuery({
    queryKey: ['emr-home-visits', currentCompany?.id, date],
    queryFn: async () => {
      if (!currentCompany?.id) return [];
      
      let query = supabase
        .from('emr_home_visits')
        .select(`
          *,
          patient:emr_patients(id, name, patient_number, phone)
        `)
        .eq('company_id', currentCompany.id)
        .order('visit_date', { ascending: true })
        .order('visit_time', { ascending: true });

      if (date) {
        query = query.eq('visit_date', date);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as EmrHomeVisit[];
    },
    enabled: !!currentCompany?.id,
  });

  const createVisit = useMutation({
    mutationFn: async (data: Omit<EmrHomeVisit, 'id' | 'company_id' | 'created_at' | 'patient'>) => {
      if (!currentCompany?.id) throw new Error('No company selected');
      
      const { data: result, error } = await supabase
        .from('emr_home_visits')
        .insert({ ...data, company_id: currentCompany.id })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emr-home-visits'] });
      toast.success('訪問を登録しました');
    },
  });

  const updateVisit = useMutation({
    mutationFn: async ({ id, ...data }: Partial<EmrHomeVisit> & { id: string }) => {
      const { error } = await supabase
        .from('emr_home_visits')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emr-home-visits'] });
      toast.success('訪問情報を更新しました');
    },
  });

  const completeVisit = useMutation({
    mutationFn: async ({ id, vital_signs, notes }: { id: string; vital_signs?: VitalSigns; notes?: string }) => {
      const { error } = await supabase
        .from('emr_home_visits')
        .update({ 
          status: 'completed',
          vital_signs,
          notes,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emr-home-visits'] });
      toast.success('訪問を完了しました');
    },
  });

  return { visits: visits || [], isLoading, createVisit, updateVisit, completeVisit };
}
