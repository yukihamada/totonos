import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { Client } from '@/types/database';

export function useClients() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['clients', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data as Client[];
    },
    enabled: !!user,
  });
}

export function useClient(id: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['client', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Client;
    },
    enabled: !!user && !!id,
  });
}

interface CreateClientInput {
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
  force?: boolean; // Skip duplicate check
}

export interface DuplicateClientInfo {
  id: string;
  name: string;
  email: string | null;
  matchType: 'name' | 'email' | 'both';
}

export async function checkDuplicateClients(
  userId: string, 
  name: string, 
  email?: string | null
): Promise<DuplicateClientInfo[]> {
  const conditions: string[] = [];
  
  // Exact name match (case-insensitive)
  conditions.push(`name.ilike.${name}`);
  
  // Email match if provided
  if (email) {
    conditions.push(`email.eq.${email}`);
  }

  const { data, error } = await supabase
    .from('clients')
    .select('id, name, email')
    .eq('user_id', userId)
    .or(conditions.join(','))
    .limit(5);

  if (error || !data) return [];

  return data.map(client => {
    const nameMatch = client.name.toLowerCase() === name.toLowerCase();
    const emailMatch = email && client.email && client.email.toLowerCase() === email.toLowerCase();
    
    let matchType: 'name' | 'email' | 'both';
    if (nameMatch && emailMatch) {
      matchType = 'both';
    } else if (nameMatch) {
      matchType = 'name';
    } else {
      matchType = 'email';
    }

    return {
      id: client.id,
      name: client.name,
      email: client.email,
      matchType,
    };
  }).filter(c => c.matchType);
}

export function useCheckDuplicateClients() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ name, email }: { name: string; email?: string | null }) => {
      if (!user) throw new Error('ログインが必要です');
      return checkDuplicateClients(user.id, name, email);
    },
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateClientInput) => {
      if (!user) throw new Error('ログインが必要です');

      // Check for duplicates unless force is true
      if (!input.force) {
        const duplicates = await checkDuplicateClients(user.id, input.name, input.email);
        if (duplicates.length > 0) {
          const error = new Error('重複の可能性がある取引先が見つかりました') as Error & { duplicates: DuplicateClientInfo[] };
          error.duplicates = duplicates;
          throw error;
        }
      }

      const { force, ...clientData } = input;
      const { data, error } = await supabase
        .from('clients')
        .insert({
          user_id: user.id,
          ...clientData,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('取引先を追加しました');
    },
    onError: (error: Error & { duplicates?: DuplicateClientInfo[] }) => {
      // Don't show toast for duplicate errors - let the UI handle it
      if (!error.duplicates) {
        toast.error('取引先の追加に失敗しました: ' + error.message);
      }
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<Client> & { id: string }) => {
      const { data, error } = await supabase
        .from('clients')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client', data.id] });
      toast.success('取引先を更新しました');
    },
    onError: (error) => {
      toast.error('取引先の更新に失敗しました: ' + error.message);
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('取引先を削除しました');
    },
    onError: (error) => {
      toast.error('取引先の削除に失敗しました: ' + error.message);
    },
  });
}
