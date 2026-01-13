import { supabase } from "@/integrations/supabase/client";
import { ChatMessage, ChatResponse, StreamChunk } from "@/types/chat";

const CHAT_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

export interface SendChatMessageOptions {
  messages: { role: string; content: string }[];
  signal?: AbortSignal;
}

export async function sendChatMessage({
  messages,
  signal,
}: SendChatMessageOptions): Promise<ChatResponse> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("認証が必要です");
  }

  const response = await fetch(CHAT_FUNCTION_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages }),
    signal,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `エラーが発生しました (${response.status})`);
  }

  return response.json();
}

export async function* streamChatMessage({
  messages,
  signal,
}: SendChatMessageOptions): AsyncGenerator<StreamChunk> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("認証が必要です");
  }

  const response = await fetch(CHAT_FUNCTION_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify({ messages, stream: true }),
    signal,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `エラーが発生しました (${response.status})`);
  }

  if (!response.body) {
    throw new Error("ストリームレスポンスが利用できません");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") {
            return;
          }
          try {
            const chunk = JSON.parse(data) as StreamChunk;
            yield chunk;
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
