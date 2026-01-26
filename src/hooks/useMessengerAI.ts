import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AI_BOT, containsAIMention } from "@/lib/ai-bot";
import { toast } from "sonner";

interface UseMessengerAIReturn {
  triggerAIResponse: (conversationId: string, userMessage: string, includesAI: boolean) => Promise<void>;
  isLoading: boolean;
}

export function useMessengerAI(): UseMessengerAIReturn {
  const [isLoading, setIsLoading] = useState(false);

  const triggerAIResponse = useCallback(async (
    conversationId: string,
    userMessage: string,
    includesAI: boolean
  ) => {
    // Only trigger if message contains @ミナト mention or conversation includes AI
    if (!containsAIMention(userMessage) && !includesAI) {
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.functions.invoke('messenger-ai', {
        body: {
          conversationId,
          message: userMessage
        }
      });

      if (error) {
        console.error('AI response error:', error);
        // Don't show toast - error will be shown as system message in conversation
      }
    } catch (err) {
      console.error('Failed to trigger AI response:', err);
      toast.error('AIの応答に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    triggerAIResponse,
    isLoading
  };
}

// Helper to check if we should trigger AI
export function shouldTriggerAI(content: string, conversationIncludesAI: boolean): boolean {
  return containsAIMention(content) || conversationIncludesAI;
}
