import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { 
  ExternalServiceType, 
  ExternalConnection, 
  ConnectionFormData 
} from '@/types/integration';

export function useExternalServiceTypes() {
  return useQuery({
    queryKey: ['external-service-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('external_service_types')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data as ExternalServiceType[];
    },
  });
}

export function useExternalConnections() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['external-connections', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('external_connections')
        .select(`
          *,
          service:external_service_types(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ExternalConnection[];
    },
    enabled: !!user,
  });
}

export function useCreateConnection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (formData: ConnectionFormData) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('external_connections')
        .insert([{
          user_id: user.id,
          service_type: formData.service_type,
          display_name: formData.display_name || null,
          credentials: formData.credentials,
          settings: formData.settings || {},
          status: 'pending' as const,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-connections'] });
      toast({
        title: '接続を追加しました',
        description: '接続テストを実行して有効化してください。',
      });
    },
    onError: (error) => {
      toast({
        title: '接続の追加に失敗しました',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateConnection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ExternalConnection> & { id: string }) => {
      const { data, error } = await supabase
        .from('external_connections')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-connections'] });
      toast({
        title: '接続を更新しました',
      });
    },
    onError: (error) => {
      toast({
        title: '接続の更新に失敗しました',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteConnection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('external_connections')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-connections'] });
      toast({
        title: '接続を削除しました',
      });
    },
    onError: (error) => {
      toast({
        title: '接続の削除に失敗しました',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useTestConnection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (connectionId: string) => {
      const { data, error } = await supabase.functions.invoke('external-api', {
        body: {
          action: 'test_connection',
          connection_id: connectionId,
        },
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data, connectionId) => {
      queryClient.invalidateQueries({ queryKey: ['external-connections'] });
      
      if (data.success) {
        toast({
          title: '接続テスト成功',
          description: '外部サービスに正常に接続できました。',
        });
      } else {
        toast({
          title: '接続テスト失敗',
          description: data.error || '接続できませんでした。',
          variant: 'destructive',
        });
      }
    },
    onError: (error) => {
      toast({
        title: '接続テストに失敗しました',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useSyncConnection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (connectionId: string) => {
      const { data, error } = await supabase.functions.invoke('external-api', {
        body: {
          action: 'sync_data',
          connection_id: connectionId,
        },
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['external-connections'] });
      
      if (data.success) {
        toast({
          title: 'データ同期完了',
          description: `${data.synced_count || 0}件のデータを同期しました。`,
        });
      } else {
        toast({
          title: 'データ同期失敗',
          description: data.error || '同期できませんでした。',
          variant: 'destructive',
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'データ同期に失敗しました',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
