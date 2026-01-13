import { Button } from "@/components/ui/button";
import { Bot, Trash2, Minimize2 } from "lucide-react";

interface ChatHeaderProps {
  onClose: () => void;
  onClear: () => void;
  isLoading?: boolean;
}

export function ChatHeader({ onClose, onClear, isLoading }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
          <Bot className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">AI アシスタント</h3>
          <p className="text-xs text-muted-foreground">
            {isLoading ? "考え中..." : "なんでも聞いてください"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClear}
          className="h-8 w-8"
          title="履歴をクリア"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
          title="閉じる"
        >
          <Minimize2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
