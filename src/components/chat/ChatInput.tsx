import { useState, useRef, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSend, isLoading, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = input.trim();
    if (trimmed && !isLoading && !disabled) {
      onSend(trimmed);
      setInput("");
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // IME入力中（日本語変換中など）はEnterで送信しない
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextValue = e.target.value;
    setInput(nextValue);

    // Auto-resize textarea (grow-only to avoid "縮んだり広がったり" のちらつき)
    const textarea = e.target;
    const currentHeight = textarea.style.height
      ? parseInt(textarea.style.height.replace("px", ""), 10)
      : textarea.offsetHeight;

    if (!nextValue) {
      textarea.style.height = "auto";
      return;
    }

    const nextHeight = Math.min(textarea.scrollHeight, 120);
    if (nextHeight > currentHeight) {
      textarea.style.height = `${nextHeight}px`;
    }
  };

  return (
    <div className="border-t p-3 overflow-hidden">
      <div className="flex gap-2 items-end w-full">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="メッセージを入力... (Shift+Enterで改行)"
          disabled={isLoading || disabled}
          className="flex-1 min-w-0 min-h-[40px] max-h-[120px] resize-none text-sm"
          rows={1}
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim() || isLoading || disabled}
          size="icon"
          className="h-10 w-10 shrink-0"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
      <p className="text-[10px] text-muted-foreground mt-1 text-center">
        AIは間違える可能性があります。重要な情報は確認してください。
      </p>
    </div>
  );
}
