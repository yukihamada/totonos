import { Button } from "@/components/ui/button";
import { QUICK_ACTIONS, QuickAction } from "@/types/chat";
import { FileText, Users, Calculator, Building, Book, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface QuickActionsProps {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

const categoryIcons: Record<string, React.ElementType> = {
  contracts: FileText,
  crm: Users,
  accounting: Calculator,
  hr: Building,
  wiki: Book,
};

export function QuickActions({ onSelect, disabled }: QuickActionsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const visibleActions = isExpanded ? QUICK_ACTIONS : QUICK_ACTIONS.slice(0, 3);

  return (
    <div className="border-t px-3 py-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">クイックアクション</span>
        {QUICK_ACTIONS.length > 3 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 text-xs px-2"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1" />
                閉じる
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1" />
                もっと見る
              </>
            )}
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {visibleActions.map((action) => {
          const Icon = categoryIcons[action.category] || FileText;
          return (
            <Button
              key={action.id}
              variant="outline"
              size="sm"
              onClick={() => onSelect(action.prompt)}
              disabled={disabled}
              className={cn(
                "h-7 text-xs px-2",
                "hover:bg-primary/10 hover:border-primary/50"
              )}
            >
              <Icon className="h-3 w-3 mr-1" />
              {action.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
