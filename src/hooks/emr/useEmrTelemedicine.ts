import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentCompany } from "@/hooks/useCompany";
import { toast } from "sonner";

export interface EmrTelemedicineSession {
  id: string;
  company_id: string;
  patient_id: string | null;
  scheduled_at: string;
  duration_minutes: number;
  meeting_url: string | null;
  meeting_id: string | null;
  status: 'scheduled' | 'waiting' | 'in_progress' | 'completed' | 'cancelled';
  doctor_name: string | null;
  notes: string | null;
  record_id: string | null;
  created_at: string;
  patient?: {
    id: string;
    name: string;
    patient_number: string;
    phone: string | null;
    email: string | null;
  };
}

export function useEmrTelemedicine(date?: string) {
  const { data: currentCompany } = useCurrentCompany();
  const queryClient = useQueryClient();

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['emr-telemedicine', currentCompany?.id, date],
    queryFn: async () => {
      if (!currentCompany?.id) return [];
      
      let query = supabase
        .from('emr_telemedicine_sessions')
        .select(`
          *,
          patient:emr_patients(id, name, patient_number, phone, email)
        `)
        .eq('company_id', currentCompany.id)
        .order('scheduled_at', { ascending: true });

      if (date) {
        query = query.gte('scheduled_at', `${date}T00:00:00`)
                    .lt('scheduled_at', `${date}T23:59:59`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as EmrTelemedicineSession[];
    },
    enabled: !!currentCompany?.id,
  });

  const createSession = useMutation({
    mutationFn: async (data: Omit<EmrTelemedicineSession, 'id' | 'company_id' | 'created_at' | 'patient'>) => {
      if (!currentCompany?.id) throw new Error('No company selected');

      // Generate a simple meeting ID
      const meetingId = `TM-${Date.now().toString(36).toUpperCase()}`;
      
      const { data: result, error } = await supabase
        .from('emr_telemedicine_sessions')
        .insert({ 
          ...data, 
          company_id: currentCompany.id,
          meeting_id: meetingId,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emr-telemedicine'] });
      toast.success('オンライン診療を予約しました');
    },
  });

  const updateSession = useMutation({
    mutationFn: async ({ id, ...data }: Partial<EmrTelemedicineSession> & { id: string }) => {
      const { error } = await supabase
        .from('emr_telemedicine_sessions')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emr-telemedicine'] });
      toast.success('診療情報を更新しました');
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: EmrTelemedicineSession['status'] }) => {
      const { error } = await supabase
        .from('emr_telemedicine_sessions')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emr-telemedicine'] });
      toast.success('ステータスを更新しました');
    },
  });

  const startSession = useMutation({
    mutationFn: async (id: string) => {
      // Generate a meeting URL (in production, integrate with actual video service)
      const meetingUrl = `${window.location.origin}/emr/telemedicine/room/${id}`;
      
      const { error } = await supabase
        .from('emr_telemedicine_sessions')
        .update({ 
          status: 'in_progress',
          meeting_url: meetingUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      return meetingUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emr-telemedicine'] });
      toast.success('診療を開始しました');
    },
  });

  const completeSession = useMutation({
    mutationFn: async ({ id, notes, record_id }: { id: string; notes?: string; record_id?: string }) => {
      const { error } = await supabase
        .from('emr_telemedicine_sessions')
        .update({ 
          status: 'completed',
          notes,
          record_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emr-telemedicine'] });
      toast.success('診療を完了しました');
    },
  });

  return { 
    sessions: sessions || [], 
    isLoading, 
    createSession, 
    updateSession,
    updateStatus,
    startSession,
    completeSession
  };
}
