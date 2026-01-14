import { useState, useCallback, useEffect } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ChatButton } from "./ChatButton";
import { ChatPanel } from "./ChatPanel";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChatWidgetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ChatWidget({ open: controlledOpen, onOpenChange }: ChatWidgetProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const { user } = useAuth();
  const { messages, isLoading, sendMessage, clearMessages } = useChat();
  const isMobile = useIsMobile();

  // Support both controlled and uncontrolled modes
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  const handleToggle = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen, setIsOpen]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

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
      {/* Hide floating button on mobile since we have bottom nav */}
      {!isMobile && (
        <ChatButton
          isOpen={isOpen}
          onClick={handleToggle}
          hasUnread={false}
        />
      )}
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
