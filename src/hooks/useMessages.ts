import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'file' | 'system';
  file_url: string | null;
  created_at: string;
  updated_at: string;
  sender?: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

export function useMessages(conversationId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Get sender profiles
      const senderIds = [...new Set(data?.map(m => m.sender_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', senderIds);

      return (data || []).map(message => {
        const profile = profiles?.find((p: any) => p.user_id === message.sender_id);
        return {
          ...message,
          message_type: message.message_type as 'text' | 'file' | 'system',
          sender: profile ? { display_name: profile.display_name, avatar_url: null } : null
        };
      }) as Message[];
    },
    enabled: !!conversationId,
  });

  // Realtime subscription
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload) => {
          // Get sender profile for new message
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_id, display_name')
            .eq('user_id', payload.new.sender_id)
            .maybeSingle();

          const newMessage = {
            ...payload.new,
            message_type: payload.new.message_type as 'text' | 'file' | 'system',
            sender: profile ? { display_name: profile.display_name, avatar_url: null } : null
          } as Message;

          queryClient.setQueryData(['messages', conversationId], (old: Message[] | undefined) => {
            if (!old) return [newMessage];
            // Avoid duplicates
            if (old.some(m => m.id === newMessage.id)) return old;
            return [...old, newMessage];
          });

          // Update conversation list
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);

  return query;
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      conversationId,
      content,
      messageType = 'text',
      fileUrl
    }: {
      conversationId: string;
      content: string;
      messageType?: 'text' | 'file' | 'system';
      fileUrl?: string;
    }) => {
      if (!user) throw new Error('User not found');

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content,
          message_type: messageType,
          file_url: fileUrl || null
        })
        .select()
        .single();

      if (error) throw error;

      // Update conversation updated_at
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
