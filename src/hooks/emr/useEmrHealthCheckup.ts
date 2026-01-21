import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentCompany } from "@/hooks/useCompany";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

export interface CheckupItem {
  category: string;
  name: string;
  reference_value?: string;
  unit?: string;
}

export interface CheckupResult {
  item: string;
  category: string;
  value: string | number;
  unit?: string;
  reference?: string;
  judgement: 'A' | 'B' | 'C' | 'D' | 'E' | '-';
}

export interface EmrCheckupCourse {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  items: CheckupItem[];
  price: number;
  is_active: boolean;
}

export interface EmrCheckupAppointment {
  id: string;
  company_id: string;
  course_id: string | null;
  patient_id: string | null;
  appointment_date: string;
  appointment_time: string | null;
  status: 'scheduled' | 'completed' | 'cancelled';
  created_at: string;
  patient?: {
    id: string;
    name: string;
    patient_number: string;
    birth_date: string;
    gender: string;
  };
  course?: {
    id: string;
    name: string;
    price: number;
  };
}

export interface EmrCheckupResult {
  id: string;
  company_id: string;
  appointment_id: string | null;
  patient_id: string | null;
  checkup_date: string;
  course_name: string | null;
  results: CheckupResult[];
  overall_judgement: string | null;
  doctor_comment: string | null;
  pdf_url: string | null;
  created_at: string;
  patient?: {
    id: string;
    name: string;
    patient_number: string;
    birth_date: string;
  };
}

export function useEmrCheckupCourses() {
  const { data: currentCompany } = useCurrentCompany();
  const queryClient = useQueryClient();

  const { data: courses, isLoading } = useQuery({
    queryKey: ['emr-checkup-courses', currentCompany?.id],
    queryFn: async () => {
      if (!currentCompany?.id) return [];
      
      const { data, error } = await supabase
        .from('emr_checkup_courses')
        .select('*')
        .eq('company_id', currentCompany.id)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return (data || []).map(d => ({
        ...d,
        items: Array.isArray(d.items) ? d.items as unknown as CheckupItem[] : []
      })) as EmrCheckupCourse[];
    },
    enabled: !!currentCompany?.id,
  });

  const createCourse = useMutation({
    mutationFn: async (data: Omit<EmrCheckupCourse, 'id' | 'company_id'>) => {
      if (!currentCompany?.id) throw new Error('No company selected');
      
      const insertData = {
        ...data,
        items: data.items as unknown as Json,
        company_id: currentCompany.id,
      };

      const { data: result, error } = await supabase
        .from('emr_checkup_courses')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emr-checkup-courses'] });
      toast.success('健診コースを作成しました');
    },
  });

  const updateCourse = useMutation({
    mutationFn: async ({ id, ...data }: Partial<EmrCheckupCourse> & { id: string }) => {
      const updateData: Record<string, unknown> = {
        ...data,
        updated_at: new Date().toISOString(),
      };
      if (data.items) {
        updateData.items = data.items as unknown as Json;
      }

      const { error } = await supabase
        .from('emr_checkup_courses')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emr-checkup-courses'] });
      toast.success('健診コースを更新しました');
    },
  });

  return { courses: courses || [], isLoading, createCourse, updateCourse };
}

export function useEmrCheckupAppointments(date?: string) {
  const { data: currentCompany } = useCurrentCompany();
  const queryClient = useQueryClient();

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['emr-checkup-appointments', currentCompany?.id, date],
    queryFn: async () => {
      if (!currentCompany?.id) return [];
      
      let query = supabase
        .from('emr_checkup_appointments')
        .select(`
          *,
          patient:emr_patients(id, name, patient_number, birth_date, gender),
          course:emr_checkup_courses(id, name, price)
        `)
        .eq('company_id', currentCompany.id)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });

      if (date) {
        query = query.eq('appointment_date', date);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as EmrCheckupAppointment[];
    },
    enabled: !!currentCompany?.id,
  });

  const createAppointment = useMutation({
    mutationFn: async (data: Omit<EmrCheckupAppointment, 'id' | 'company_id' | 'created_at' | 'patient' | 'course'>) => {
      if (!currentCompany?.id) throw new Error('No company selected');
      
      const { data: result, error } = await supabase
        .from('emr_checkup_appointments')
        .insert({ ...data, company_id: currentCompany.id })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emr-checkup-appointments'] });
      toast.success('健診予約を登録しました');
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: EmrCheckupAppointment['status'] }) => {
      const { error } = await supabase
        .from('emr_checkup_appointments')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emr-checkup-appointments'] });
      toast.success('ステータスを更新しました');
    },
  });

  return { appointments: appointments || [], isLoading, createAppointment, updateStatus };
}

export function useEmrCheckupResults(patientId?: string) {
  const { data: currentCompany } = useCurrentCompany();
  const queryClient = useQueryClient();

  const { data: results, isLoading } = useQuery({
    queryKey: ['emr-checkup-results', currentCompany?.id, patientId],
    queryFn: async () => {
      if (!currentCompany?.id) return [];
      
      let query = supabase
        .from('emr_checkup_results')
        .select(`
          *,
          patient:emr_patients(id, name, patient_number, birth_date)
        `)
        .eq('company_id', currentCompany.id)
        .order('checkup_date', { ascending: false });

      if (patientId) {
        query = query.eq('patient_id', patientId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(d => ({
        ...d,
        results: Array.isArray(d.results) ? d.results as unknown as CheckupResult[] : []
      })) as EmrCheckupResult[];
    },
    enabled: !!currentCompany?.id,
  });

  const createResult = useMutation({
    mutationFn: async (data: Omit<EmrCheckupResult, 'id' | 'company_id' | 'created_at' | 'patient'>) => {
      if (!currentCompany?.id) throw new Error('No company selected');
      
      const insertData = {
        ...data,
        results: data.results as unknown as Json,
        company_id: currentCompany.id,
      };

      const { data: result, error } = await supabase
        .from('emr_checkup_results')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emr-checkup-results'] });
      toast.success('健診結果を登録しました');
    },
  });

  const updateResult = useMutation({
    mutationFn: async ({ id, ...data }: Partial<EmrCheckupResult> & { id: string }) => {
      const updateData: Record<string, unknown> = {
        ...data,
        updated_at: new Date().toISOString(),
      };
      if (data.results) {
        updateData.results = data.results as unknown as Json;
      }

      const { error } = await supabase
        .from('emr_checkup_results')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emr-checkup-results'] });
      toast.success('健診結果を更新しました');
    },
  });

  return { results: results || [], isLoading, createResult, updateResult };
}
