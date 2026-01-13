import { useState, useCallback } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ChatButton } from "./ChatButton";
import { ChatPanel } from "./ChatPanel";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { messages, isLoading, sendMessage, clearMessages } = useChat();

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleSend = useCallback(
    async (content: string) => {
      await sendMessage(content);
    },
    [sendMessage]
  );

  const handleClear = useCallback(() => {
    clearMessages();
  }, [clearMessages]);

  // Don't render if user is not logged in
  if (!user) {
    return null;
  }

  return (
    <>
      <ChatButton
        isOpen={isOpen}
        onClick={handleToggle}
        hasUnread={false}
      />
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="right"
          className="w-full sm:w-[400px] p-0 flex flex-col"
        >
          <ChatPanel
            messages={messages}
            isLoading={isLoading}
            onSend={handleSend}
            onClear={handleClear}
            onClose={handleClose}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
