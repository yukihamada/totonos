import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/hooks/useCompany";
import { toast } from "sonner";

export interface EmrAppointment {
  id: string;
  company_id: string;
  patient_id: string | null;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  department: string | null;
  doctor_name: string | null;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  notes: string | null;
  reminder_sent: boolean;
  created_at: string;
  updated_at: string;
  patient?: {
    id: string;
    name: string;
    patient_number: string;
    phone: string | null;
  };
}

export interface EmrAppointmentSlot {
  id: string;
  company_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_duration: number;
  max_appointments: number;
  department: string | null;
  is_active: boolean;
}

type AppointmentInsert = Omit<EmrAppointment, 'id' | 'created_at' | 'updated_at' | 'patient'>;
type AppointmentUpdate = Partial<AppointmentInsert>;

export function useEmrAppointments(date?: string) {
  const { currentCompany } = useCompany();
  const queryClient = useQueryClient();

  const { data: appointments, isLoading, error } = useQuery({
    queryKey: ['emr-appointments', currentCompany?.id, date],
    queryFn: async () => {
      if (!currentCompany?.id) return [];
      
      let query = supabase
        .from('emr_appointments')
        .select(`
          *,
          patient:emr_patients(id, name, patient_number, phone)
        `)
        .eq('company_id', currentCompany.id)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });

      if (date) {
        query = query.eq('appointment_date', date);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as EmrAppointment[];
    },
    enabled: !!currentCompany?.id,
  });

  const createAppointment = useMutation({
    mutationFn: async (data: Omit<AppointmentInsert, 'company_id'>) => {
      if (!currentCompany?.id) throw new Error('No company selected');
      
      const { data: result, error } = await supabase
        .from('emr_appointments')
        .insert({ ...data, company_id: currentCompany.id })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emr-appointments'] });
      toast.success('予約を登録しました');
    },
    onError: (error) => {
      toast.error('予約の登録に失敗しました');
      console.error(error);
    },
  });

  const updateAppointment = useMutation({
    mutationFn: async ({ id, ...data }: AppointmentUpdate & { id: string }) => {
      const { data: result, error } = await supabase
        .from('emr_appointments')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emr-appointments'] });
      toast.success('予約を更新しました');
    },
    onError: (error) => {
      toast.error('予約の更新に失敗しました');
      console.error(error);
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: EmrAppointment['status'] }) => {
      const { error } = await supabase
        .from('emr_appointments')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emr-appointments'] });
      toast.success('ステータスを更新しました');
    },
  });

  const deleteAppointment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('emr_appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emr-appointments'] });
      toast.success('予約を削除しました');
    },
  });

  return {
    appointments: appointments || [],
    isLoading,
    error,
    createAppointment,
    updateAppointment,
    updateStatus,
    deleteAppointment,
  };
}

export function useEmrAppointmentSlots() {
  const { currentCompany } = useCompany();
  const queryClient = useQueryClient();

  const { data: slots, isLoading } = useQuery({
    queryKey: ['emr-appointment-slots', currentCompany?.id],
    queryFn: async () => {
      if (!currentCompany?.id) return [];
      
      const { data, error } = await supabase
        .from('emr_appointment_slots')
        .select('*')
        .eq('company_id', currentCompany.id)
        .eq('is_active', true)
        .order('day_of_week')
        .order('start_time');

      if (error) throw error;
      return data as EmrAppointmentSlot[];
    },
    enabled: !!currentCompany?.id,
  });

  const createSlot = useMutation({
    mutationFn: async (data: Omit<EmrAppointmentSlot, 'id' | 'company_id'>) => {
      if (!currentCompany?.id) throw new Error('No company selected');
      
      const { data: result, error } = await supabase
        .from('emr_appointment_slots')
        .insert({ ...data, company_id: currentCompany.id })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emr-appointment-slots'] });
      toast.success('予約枠を作成しました');
    },
  });

  const deleteSlot = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('emr_appointment_slots')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emr-appointment-slots'] });
      toast.success('予約枠を削除しました');
    },
  });

  return { slots: slots || [], isLoading, createSlot, deleteSlot };
}
