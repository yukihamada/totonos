import { useState, useCallback, useRef } from "react";
import { ChatMessage, ToolCall, ToolResult } from "@/types/chat";
import { sendChatMessage } from "@/lib/chat-api";
import { toast } from "sonner";

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const addMessage = useCallback((message: Omit<ChatMessage, "id" | "timestamp">) => {
    const newMessage: ChatMessage = {
      ...message,
      id: generateId(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  }, []);

  const updateMessage = useCallback((id: string, updates: Partial<ChatMessage>) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, ...updates } : msg))
    );
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      // Add user message
      addMessage({
        role: "user",
        content: content.trim(),
      });

      // Prepare messages for API
      const apiMessages = [
        ...messages,
        { role: "user" as const, content: content.trim() },
      ].map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      setIsLoading(true);

      try {
        const response = await sendChatMessage({
          messages: apiMessages,
          signal: abortControllerRef.current.signal,
        });

        // Add assistant message
        const assistantMessage = addMessage({
          role: "assistant",
          content: response.content,
          toolCalls: response.toolCalls,
        });

        // If there are tool results, update the message
        if (response.toolCalls && response.toolCalls.length > 0) {
          // Tool results would come from the API response
          // For now, they're included in the response
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        const errorMessage =
          error instanceof Error ? error.message : "エラーが発生しました";

        // Add error message
        addMessage({
          role: "assistant",
          content: `申し訳ありません。${errorMessage}`,
        });

        toast.error("チャットエラー", {
          description: errorMessage,
        });
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [messages, addMessage]
  );

  const clearMessages = useCallback(() => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setMessages([]);
    setIsLoading(false);
  }, []);

  const regenerate = useCallback(async () => {
    if (messages.length < 2) return;

    // Get the last user message (findLastIndex polyfill for ES2022 compatibility)
    let lastUserMessageIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        lastUserMessageIndex = i;
        break;
      }
    }
    if (lastUserMessageIndex === -1) return;

    const lastUserMessage = messages[lastUserMessageIndex];

    // Remove messages after the last user message
    setMessages((prev) => prev.slice(0, lastUserMessageIndex + 1));

    // Resend the message
    await sendMessage(lastUserMessage.content);
  }, [messages, sendMessage]);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    regenerate,
    addMessage,
    updateMessage,
  };
}
