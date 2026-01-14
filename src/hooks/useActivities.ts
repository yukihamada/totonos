import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { Tables, Database } from '@/integrations/supabase/types';

type Activity = Tables<'activities'>;
type ActivityType = Database['public']['Enums']['activity_type'];

export function useActivities() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['activities', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          client:clients(id, name),
          lead:leads(id, name, company),
          deal:deals(id, title)
        `)
        .eq('user_id', user.id)
        .order('activity_date', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useActivity(id: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['activity', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          client:clients(id, name, email, phone),
          lead:leads(id, name, company, email, phone),
          deal:deals(id, title, value, stage)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!id,
  });
}

interface CreateActivityInput {
  activity_type: ActivityType;
  subject: string;
  description?: string | null;
  activity_date?: string;
  duration_minutes?: number | null;
  client_id?: string | null;
  lead_id?: string | null;
  deal_id?: string | null;
  next_action?: string | null;
  next_action_date?: string | null;
}

export function useCreateActivity() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateActivityInput) => {
      if (!user) throw new Error('ログインが必要です');

      const { data, error } = await supabase
        .from('activities')
        .insert({
          user_id: user.id,
          activity_type: input.activity_type,
          subject: input.subject,
          description: input.description,
          activity_date: input.activity_date || new Date().toISOString().split('T')[0],
          duration_minutes: input.duration_minutes,
          client_id: input.client_id,
          lead_id: input.lead_id,
          deal_id: input.deal_id,
          next_action: input.next_action,
          next_action_date: input.next_action_date,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      toast.success('活動を記録しました');
    },
    onError: (error) => {
      toast.error('活動の記録に失敗しました: ' + error.message);
    },
  });
}

interface UpdateActivityInput {
  id: string;
  activity_type?: ActivityType;
  subject?: string;
  description?: string | null;
  activity_date?: string;
  duration_minutes?: number | null;
  client_id?: string | null;
  lead_id?: string | null;
  deal_id?: string | null;
  next_action?: string | null;
  next_action_date?: string | null;
}

export function useUpdateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateActivityInput) => {
      const { id, ...updateData } = input;

      const { data, error } = await supabase
        .from('activities')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['activity', data.id] });
      toast.success('活動を更新しました');
    },
    onError: (error) => {
      toast.error('活動の更新に失敗しました: ' + error.message);
    },
  });
}

export function useDeleteActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      toast.success('活動を削除しました');
    },
    onError: (error) => {
      toast.error('活動の削除に失敗しました: ' + error.message);
    },
  });
}

// Helper to get activities for a specific lead, deal, or client
export function useRelatedActivities(type: 'lead' | 'deal' | 'client', id: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['related_activities', type, id],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('activities')
        .select(`
          *,
          client:clients(id, name),
          lead:leads(id, name, company),
          deal:deals(id, title)
        `)
        .eq('user_id', user.id)
        .order('activity_date', { ascending: false });

      if (type === 'lead') {
        query = query.eq('lead_id', id);
      } else if (type === 'deal') {
        query = query.eq('deal_id', id);
      } else {
        query = query.eq('client_id', id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!id,
  });
}

// Activity type labels for UI
export const activityTypeLabels: Record<ActivityType, string> = {
  call: '電話',
  meeting: '会議',
  email: 'メール',
  visit: '訪問',
  demo: 'デモ',
  other: 'その他',
};

export const activityTypeIcons: Record<ActivityType, string> = {
  call: 'Phone',
  meeting: 'Users',
  email: 'Mail',
  visit: 'MapPin',
  demo: 'Presentation',
  other: 'MoreHorizontal',
};
