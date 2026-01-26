import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentCompany } from "@/hooks/useCompany";

export interface Conversation {
  id: string;
  company_id: string;
  name: string | null;
  type: 'direct' | 'group' | 'channel';
  created_by: string | null;
  created_at: string;
  updated_at: string;
  participants?: ConversationParticipant[];
  last_message?: {
    content: string;
    created_at: string;
    sender_id: string;
  } | null;
  unread_count?: number;
}

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  joined_at: string;
  last_read_at: string | null;
  profile?: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

export function useConversations() {
  const { user } = useAuth();
  const { data: company } = useCurrentCompany();

  return useQuery({
    queryKey: ['conversations', company?.id],
    queryFn: async () => {
      if (!company?.id) return [];

      // Get conversations where user is a participant
      const { data: participations, error: participationsError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user?.id);

      if (participationsError) throw participationsError;

      const conversationIds = participations?.map(p => p.conversation_id) || [];

      if (conversationIds.length === 0) return [];

      // Get conversations with participants
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select(`
          *,
          participants:conversation_participants(
            id,
            user_id,
            joined_at,
            last_read_at
          )
        `)
        .in('id', conversationIds)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Get last message for each conversation
      const conversationsWithLastMessage = await Promise.all(
        (conversations || []).map(async (conv) => {
          const { data: messages } = await supabase
            .from('messages')
            .select('content, created_at, sender_id')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1);

          // Get profiles for participants
          const participantIds = conv.participants?.map((p: any) => p.user_id) || [];
          const { data: profiles } = await supabase
            .from('profiles')
            .select('user_id, display_name')
            .in('user_id', participantIds);

          const participantsWithProfiles = conv.participants?.map((p: any) => ({
            ...p,
            profile: profiles?.find((pr: any) => pr.user_id === p.user_id) ? {
              display_name: profiles.find((pr: any) => pr.user_id === p.user_id)?.display_name || null,
              avatar_url: null
            } : null
          }));

          return {
            ...conv,
            participants: participantsWithProfiles,
            last_message: messages?.[0] || null
          };
        })
      );

      return conversationsWithLastMessage as Conversation[];
    },
    enabled: !!user && !!company?.id,
  });
}

export function useConversation(conversationId: string | undefined) {
  return useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: async () => {
      if (!conversationId) return null;

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          participants:conversation_participants(
            id,
            user_id,
            joined_at,
            last_read_at
          )
        `)
        .eq('id', conversationId)
        .single();

      if (error) throw error;

      // Get profiles for participants
      const participantIds = data.participants?.map((p: any) => p.user_id) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', participantIds);

      const participantsWithProfiles = data.participants?.map((p: any) => ({
        ...p,
        profile: profiles?.find((pr: any) => pr.user_id === p.user_id) ? {
          display_name: profiles.find((pr: any) => pr.user_id === p.user_id)?.display_name || null,
          avatar_url: null
        } : null
      }));

      return {
        ...data,
        participants: participantsWithProfiles
      } as Conversation;
    },
    enabled: !!conversationId,
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: company } = useCurrentCompany();

  return useMutation({
    mutationFn: async ({
      name,
      type,
      participantIds
    }: {
      name?: string;
      type: 'direct' | 'group' | 'channel';
      participantIds: string[];
    }) => {
      if (!user || !company) throw new Error('User or company not found');

      // For direct messages, check if conversation already exists
      if (type === 'direct' && participantIds.length === 1) {
        const otherUserId = participantIds[0];
        
        // Get all DM conversations where current user participates
        const { data: myConversations } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', user.id);

        const myConvIds = myConversations?.map(c => c.conversation_id) || [];

        if (myConvIds.length > 0) {
          // Check if other user is in any of those conversations
          const { data: existingConv } = await supabase
            .from('conversations')
            .select(`
              id,
              participants:conversation_participants(user_id)
            `)
            .in('id', myConvIds)
            .eq('type', 'direct');

          const existingDM = existingConv?.find(conv => {
            const userIds = conv.participants?.map((p: any) => p.user_id) || [];
            return userIds.includes(otherUserId) && userIds.includes(user.id) && userIds.length === 2;
          });

          if (existingDM) {
            return existingDM;
          }
        }
      }

      // Create new conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          company_id: company.id,
          name: name || null,
          type,
          created_by: user.id
        })
        .select()
        .single();

      if (convError) throw convError;

      // Add creator as participant first
      const { error: creatorError } = await supabase
        .from('conversation_participants')
        .insert({
          conversation_id: conversation.id,
          user_id: user.id
        });

      if (creatorError) throw creatorError;

      // Add other participants
      for (const participantId of participantIds) {
        if (participantId !== user.id) {
          await supabase
            .from('conversation_participants')
            .insert({
              conversation_id: conversation.id,
              user_id: participantId
            });
        }
      }

      return conversation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useUpdateLastRead() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      if (!user) throw new Error('User not found');

      const { error } = await supabase
        .from('conversation_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
  });
}
