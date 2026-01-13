import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { WikiPage, ITAsset, Task } from '@/types/wiki';

// Wiki Pages
export function useWikiPages() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['wiki-pages', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wiki_pages')
        .select('*')
        .eq('user_id', user?.id)
        .order('title');
      
      if (error) throw error;
      return data as WikiPage[];
    },
    enabled: !!user,
  });
}

export function useWikiPage(id: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['wiki-page', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wiki_pages')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      // Increment view count
      await supabase
        .from('wiki_pages')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', id);
      
      return data as WikiPage;
    },
    enabled: !!user && !!id,
  });
}

export function useCreateWikiPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (page: Omit<WikiPage, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'view_count'>) => {
      const { data, error } = await supabase
        .from('wiki_pages')
        .insert({ 
          ...page, 
          user_id: user?.id,
          last_edited_by: user?.email,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wiki-pages'] });
      toast({ title: 'ページを作成しました' });
    },
    onError: (error) => {
      toast({ title: 'エラー', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateWikiPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<WikiPage> & { id: string }) => {
      const { data, error } = await supabase
        .from('wiki_pages')
        .update({ ...updates, last_edited_by: user?.email })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wiki-pages'] });
      queryClient.invalidateQueries({ queryKey: ['wiki-page'] });
      toast({ title: 'ページを更新しました' });
    },
    onError: (error) => {
      toast({ title: 'エラー', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteWikiPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('wiki_pages')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wiki-pages'] });
      toast({ title: 'ページを削除しました' });
    },
    onError: (error) => {
      toast({ title: 'エラー', description: error.message, variant: 'destructive' });
    },
  });
}

// IT Assets
export function useITAssets() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['it-assets', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('it_assets')
        .select('*, employee:employees(name)')
        .eq('user_id', user?.id)
        .order('asset_code');
      
      if (error) throw error;
      return data as ITAsset[];
    },
    enabled: !!user,
  });
}

export function useCreateITAsset() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (asset: Omit<ITAsset, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('it_assets')
        .insert({ ...asset, user_id: user?.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['it-assets'] });
      toast({ title: '資産を登録しました' });
    },
    onError: (error) => {
      toast({ title: 'エラー', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateITAsset() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ITAsset> & { id: string }) => {
      const { data, error } = await supabase
        .from('it_assets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['it-assets'] });
      toast({ title: '資産情報を更新しました' });
    },
    onError: (error) => {
      toast({ title: 'エラー', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteITAsset() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('it_assets')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['it-assets'] });
      toast({ title: '資産を削除しました' });
    },
    onError: (error) => {
      toast({ title: 'エラー', description: error.message, variant: 'destructive' });
    },
  });
}

// Tasks
export function useTasks(status?: 'todo' | 'in_progress' | 'review' | 'done') {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['tasks', user?.id, status],
    queryFn: async () => {
      let query = supabase
        .from('tasks')
        .select('*, assignee:employees(name)')
        .eq('user_id', user?.id)
        .order('due_date', { ascending: true, nullsFirst: false });
      
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Task[];
    },
    enabled: !!user,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (task: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert({ ...task, user_id: user?.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({ title: 'タスクを作成しました' });
    },
    onError: (error) => {
      toast({ title: 'エラー', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Task> & { id: string }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({ title: 'タスクを更新しました' });
    },
    onError: (error) => {
      toast({ title: 'エラー', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({ title: 'タスクを削除しました' });
    },
    onError: (error) => {
      toast({ title: 'エラー', description: error.message, variant: 'destructive' });
    },
  });
}
