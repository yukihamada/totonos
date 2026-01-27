import { useEffect, useRef } from "react";
import { Bot, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AI_BOT } from "@/lib/ai-bot";
import { cn } from "@/lib/utils";

export interface MentionCandidate {
  id: string;
  name: string;
  isAI: boolean;
}

export interface MentionPopupProps {
  isOpen: boolean;
  candidates: MentionCandidate[];
  selectedIndex: number;
  onSelect: (candidate: MentionCandidate) => void;
  onClose: () => void;
}

export function MentionPopup({ isOpen, candidates, selectedIndex, onSelect, onClose }: MentionPopupProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const selectedEl = listRef.current?.children[selectedIndex] as HTMLElement;
    selectedEl?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  if (!isOpen || candidates.length === 0) return null;

  return (
    <div
      className="absolute bottom-full left-0 mb-2 z-50 bg-popover border border-border rounded-lg shadow-lg overflow-hidden min-w-[200px]"
    >
      <div ref={listRef} className="max-h-48 overflow-y-auto">
        {candidates.map((candidate, idx) => (
          <button
            key={candidate.id}
            onClick={() => onSelect(candidate)}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors",
              idx === selectedIndex ? "bg-accent" : "hover:bg-muted"
            )}
          >
            <Avatar className="h-6 w-6">
              <AvatarFallback className={cn(
                "text-xs",
                candidate.isAI 
                  ? "bg-gradient-to-br from-primary to-primary/60 text-primary-foreground" 
                  : "bg-muted"
              )}>
                {candidate.isAI ? (
                  <Bot className="h-3 w-3" />
                ) : (
                  candidate.name.slice(0, 1)
                )}
              </AvatarFallback>
            </Avatar>
            <span className={cn(candidate.isAI && "text-primary font-medium")}>
              {candidate.name}
            </span>
            {candidate.isAI && (
              <span className="text-xs text-muted-foreground ml-auto">AI</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// Create mention candidates including AI bot
export function createMentionCandidates(
  members: Array<{ user_id: string; profiles?: { display_name: string | null } | null }>,
  currentUserId?: string
): MentionCandidate[] {
  const candidates: MentionCandidate[] = [
    {
      id: AI_BOT.id,
      name: AI_BOT.displayName,
      isAI: true
    }
  ];

  members
    .filter(m => m.user_id !== currentUserId)
    .forEach(member => {
      candidates.push({
        id: member.user_id,
        name: member.profiles?.display_name || member.user_id.slice(0, 8),
        isAI: false
      });
    });

  return candidates;
}
