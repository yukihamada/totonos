import { useState, useCallback, useRef } from "react";
import { ChatMessage, ToolCall, ToolResult } from "@/types/chat";
import { streamChatMessage, processFilesForMessage, AttachedFile } from "@/lib/chat-api";
import { toast } from "sonner";
import { useCredits } from "@/hooks/useCredits";

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { canUse, consume } = useCredits();

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
    setMessages((prev) => prev.map((msg) => (msg.id === id ? { ...msg, ...updates } : msg)));
  }, []);

  const sendMessage = useCallback(
    async (content: string, files?: AttachedFile[]) => {
      if (!content.trim() && (!files || files.length === 0)) return;

      // Use ai_chat for all file types (credit system handles it)
      const creditAction = 'ai_chat' as const;

      // クレジットチェック
      if (!canUse(creditAction)) {
        toast.error("クレジット不足", {
          description: "AIチャットを利用するにはクレジットが必要です。クレジットを購入してください。",
        });
        return;
      }

      // クレジット消費
      const consumed = await consume(creditAction, 'AIチャット');
      if (!consumed) {
        toast.error("クレジット消費エラー", {
          description: "クレジットの消費に失敗しました。",
        });
        return;
      }

      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      // Create display content for user message
      let displayContent = content.trim();
      if (files && files.length > 0) {
        const fileNames = files.map(f => f.file.name).join(', ');
        if (displayContent) {
          displayContent += `\n📎 添付: ${fileNames}`;
        } else {
          displayContent = `📎 添付: ${fileNames}`;
        }
      }

      // Add user message to UI
      addMessage({
        role: "user",
        content: displayContent,
      });

      // Process files and prepare message for API
      const processedMessage = await processFilesForMessage(content.trim() || "このファイルを分析してください。", files);

      // Prepare messages for API (convert previous messages + new one)
      const apiMessages = [
        ...messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        processedMessage
      ];

      setIsLoading(true);

      // Create a placeholder assistant message that we update via streaming
      const assistantMessage = addMessage({
        role: "assistant",
        content: "",
        toolCalls: [],
        toolResults: [],
        isStreaming: true,
      });

      try {
        let contentBuffer = "";
        let toolCalls: ToolCall[] = [];
        let toolResults: ToolResult[] = [];

        for await (const chunk of streamChatMessage({
          messages: apiMessages,
          signal: abortControllerRef.current.signal,
        })) {
          if (chunk.type === "content_block_delta" && chunk.delta?.text) {
            contentBuffer += chunk.delta.text;
            updateMessage(assistantMessage.id, { content: contentBuffer });
          }

          if (chunk.type === "tool_use" && chunk.toolCall) {
            toolCalls = [...toolCalls, chunk.toolCall];
            updateMessage(assistantMessage.id, { toolCalls });
          }

          if (chunk.type === "tool_result" && chunk.toolResult) {
            toolResults = [...toolResults, chunk.toolResult];
            updateMessage(assistantMessage.id, { toolResults });
          }

          if (chunk.type === "error") {
            const errorMessage = chunk.error || "エラーが発生しました";
            updateMessage(assistantMessage.id, {
              content: `申し訳ありません。${errorMessage}`,
              isStreaming: false,
            });
            toast.error("チャットエラー", { description: errorMessage });
            return;
          }
        }

        updateMessage(assistantMessage.id, { isStreaming: false });
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        const errorMessage = error instanceof Error ? error.message : "エラーが発生しました";

        updateMessage(assistantMessage.id, {
          content: `申し訳ありません。${errorMessage}`,
          isStreaming: false,
        });

        toast.error("チャットエラー", {
          description: errorMessage,
        });
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [messages, addMessage, updateMessage, canUse, consume]
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

    // Resend the message (without files since we don't store them)
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

export type { AttachedFile };
