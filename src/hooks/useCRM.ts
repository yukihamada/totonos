import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Lead, Deal, Activity, SalesTarget } from '@/types/crm';

// Leads
export function useLeads() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['leads', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Lead[];
    },
    enabled: !!user,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (lead: Omit<Lead, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('leads')
        .insert({ ...lead, user_id: user?.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({ title: 'リードを登録しました' });
    },
    onError: (error) => {
      toast({ title: 'エラー', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Lead> & { id: string }) => {
      const { data, error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({ title: 'リードを更新しました' });
    },
    onError: (error) => {
      toast({ title: 'エラー', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({ title: 'リードを削除しました' });
    },
    onError: (error) => {
      toast({ title: 'エラー', description: error.message, variant: 'destructive' });
    },
  });
}

// Deals
export function useDeals() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['deals', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select('*, lead:leads(company_name), client:clients(name)')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Deal[];
    },
    enabled: !!user,
  });
}

export function useCreateDeal() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (deal: Omit<Deal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('deals')
        .insert({ ...deal, user_id: user?.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast({ title: '商談を登録しました' });
    },
    onError: (error) => {
      toast({ title: 'エラー', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateDeal() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Deal> & { id: string }) => {
      const { data, error } = await supabase
        .from('deals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast({ title: '商談を更新しました' });
    },
    onError: (error) => {
      toast({ title: 'エラー', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteDeal() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('deals')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast({ title: '商談を削除しました' });
    },
    onError: (error) => {
      toast({ title: 'エラー', description: error.message, variant: 'destructive' });
    },
  });
}

// Activities
export function useActivities(limit = 50) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['activities', user?.id, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activities')
        .select('*, lead:leads(company_name), deal:deals(deal_name), client:clients(name)')
        .eq('user_id', user?.id)
        .order('activity_date', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as Activity[];
    },
    enabled: !!user,
  });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (activity: Omit<Activity, 'id' | 'user_id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('activities')
        .insert({ ...activity, user_id: user?.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      toast({ title: '活動を記録しました' });
    },
    onError: (error) => {
      toast({ title: 'エラー', description: error.message, variant: 'destructive' });
    },
  });
}

// Sales Targets
export function useSalesTargets() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['sales-targets', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales_targets')
        .select('*')
        .eq('user_id', user?.id)
        .order('period_start', { ascending: false });
      
      if (error) throw error;
      return data as SalesTarget[];
    },
    enabled: !!user,
  });
}

export function useCreateSalesTarget() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (target: Omit<SalesTarget, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('sales_targets')
        .insert({ ...target, user_id: user?.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-targets'] });
      toast({ title: '売上目標を設定しました' });
    },
    onError: (error) => {
      toast({ title: 'エラー', description: error.message, variant: 'destructive' });
    },
  });
}

// Dashboard stats
export function useCRMStats() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['crm-stats', user?.id],
    queryFn: async () => {
      // Get leads count by status
      const { data: leads } = await supabase
        .from('leads')
        .select('status')
        .eq('user_id', user?.id);
      
      // Get deals pipeline
      const { data: deals } = await supabase
        .from('deals')
        .select('stage, amount')
        .eq('user_id', user?.id);
      
      // Get this month's activities
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const { data: activities } = await supabase
        .from('activities')
        .select('activity_type')
        .eq('user_id', user?.id)
        .gte('activity_date', startOfMonth.toISOString());
      
      const leadsByStatus = leads?.reduce((acc, l) => {
        acc[l.status] = (acc[l.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};
      
      const dealsByStage = deals?.reduce((acc, d) => {
        if (!acc[d.stage]) acc[d.stage] = { count: 0, amount: 0 };
        acc[d.stage].count++;
        acc[d.stage].amount += Number(d.amount) || 0;
        return acc;
      }, {} as Record<string, { count: number; amount: number }>) || {};
      
      const totalPipelineValue = deals
        ?.filter(d => !['won', 'lost'].includes(d.stage))
        .reduce((sum, d) => sum + (Number(d.amount) || 0), 0) || 0;
      
      const wonThisMonth = deals
        ?.filter(d => d.stage === 'won')
        .reduce((sum, d) => sum + (Number(d.amount) || 0), 0) || 0;
      
      return {
        leadsByStatus,
        dealsByStage,
        totalPipelineValue,
        wonThisMonth,
        activitiesThisMonth: activities?.length || 0,
        newLeads: leadsByStatus.new || 0,
      };
    },
    enabled: !!user,
  });
}
