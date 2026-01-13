import { Button } from "@/components/ui/button";
import { MessageCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatButtonProps {
  isOpen: boolean;
  onClick: () => void;
  hasUnread?: boolean;
}

export function ChatButton({ isOpen, onClick, hasUnread }: ChatButtonProps) {
  return (
    <Button
      onClick={onClick}
      size="icon"
      className={cn(
        "fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full shadow-lg transition-all duration-200",
        "hover:scale-105 active:scale-95",
        isOpen ? "bg-muted hover:bg-muted/80" : "bg-primary hover:bg-primary/90"
      )}
    >
      {isOpen ? (
        <X className="h-6 w-6" />
      ) : (
        <>
          <MessageCircle className="h-6 w-6" />
          {hasUnread && (
            <span data-testid="unread-indicator" className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive animate-pulse" />
          )}
        </>
      )}
    </Button>
  );
}
