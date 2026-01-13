import { ChatHeader } from "./ChatHeader";
import { ChatMessageList } from "./ChatMessageList";
import { ChatInput } from "./ChatInput";
import { QuickActions } from "./QuickActions";
import { ChatMessage } from "@/types/chat";

interface ChatPanelProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSend: (message: string) => void;
  onClear: () => void;
  onClose: () => void;
}

export function ChatPanel({
  messages,
  isLoading,
  onSend,
  onClear,
  onClose,
}: ChatPanelProps) {
  const handleQuickAction = (prompt: string) => {
    onSend(prompt);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <ChatHeader
        onClose={onClose}
        onClear={onClear}
        isLoading={isLoading}
      />
      <ChatMessageList
        messages={messages}
        isLoading={isLoading}
      />
      <QuickActions
        onSelect={handleQuickAction}
        disabled={isLoading}
      />
      <ChatInput
        onSend={onSend}
        isLoading={isLoading}
      />
    </div>
  );
}
