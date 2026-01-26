import { useState, KeyboardEvent } from "react";
import { useSendMessage } from "@/hooks/useMessages";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { toast } from "sonner";

interface MessageInputProps {
  conversationId: string;
}

export function MessageInput({ conversationId }: MessageInputProps) {
  const [content, setContent] = useState("");
  const sendMessage = useSendMessage();

  const handleSubmit = async () => {
    const trimmed = content.trim();
    if (!trimmed) return;

    try {
      await sendMessage.mutateAsync({
        conversationId,
        content: trimmed
      });
      setContent("");
    } catch (error) {
      toast.error("メッセージの送信に失敗しました");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-4 border-t border-border">
      <div className="flex gap-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="メッセージを入力... (Shift+Enterで改行)"
          className="min-h-[44px] max-h-32 resize-none"
          rows={1}
        />
        <Button 
          onClick={handleSubmit}
          disabled={!content.trim() || sendMessage.isPending}
          size="icon"
          className="shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
