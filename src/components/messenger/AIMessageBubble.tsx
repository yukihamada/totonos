import { Bot } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AI_BOT } from "@/lib/ai-bot";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface AIMessageBubbleProps {
  content: string;
  timestamp: string;
  aiMetadata?: {
    tool_calls?: Array<{
      name: string;
      result?: unknown;
    }>;
  } | null;
}

export function AIMessageBubble({ content, timestamp, aiMetadata }: AIMessageBubbleProps) {
  return (
    <div className="flex gap-2 flex-row">
      <div className="w-8">
        <Avatar className="h-8 w-8 bg-gradient-to-br from-primary to-primary/60">
          <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      </div>
      
      <div className="max-w-[70%] space-y-1">
        <p className="text-xs text-primary font-medium ml-1">
          {AI_BOT.displayName}
        </p>
        <div className={cn(
          "rounded-2xl px-4 py-2",
          "bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20"
        )}>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
        
        {/* Tool execution results if any */}
        {aiMetadata?.tool_calls && aiMetadata.tool_calls.length > 0 && (
          <div className="mt-2 space-y-2">
            {aiMetadata.tool_calls.map((tool, idx) => (
              <div key={idx} className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1">
                🔧 {tool.name}
              </div>
            ))}
          </div>
        )}
        
        <p className="text-xs text-muted-foreground ml-1">
          {timestamp}
        </p>
      </div>
    </div>
  );
}
