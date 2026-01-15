import { cn } from "@/lib/utils";
import { Bot, User, Wrench, AlertCircle } from "lucide-react";
import { ChatMessage as ChatMessageType } from "@/types/chat";
import { ToolResultCard } from "./ToolResultCard";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  return (
    <div
      className={cn(
        "flex gap-3 px-4 py-3",
        isUser && "flex-row-reverse"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-primary" : "bg-muted"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-primary-foreground" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>

      {/* Content */}
      <div
        className={cn(
          "flex flex-col gap-2 max-w-[80%] min-w-0",
          isUser && "items-end"
        )}
      >
        {/* Main message content */}
        {message.content && (
          <div
            className={cn(
              "rounded-lg px-3 py-2 text-sm min-h-[2rem]",
              isUser
                ? "bg-primary text-primary-foreground"
                : "bg-muted",
              message.isStreaming && "animate-pulse"
            )}
            style={{ wordBreak: "break-word" }}
          >
            {isUser ? (
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-pre:my-2 break-words overflow-hidden">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    pre: ({ children }) => (
                      <pre className="bg-muted-foreground/20 p-2 rounded overflow-x-auto whitespace-pre-wrap break-words">
                        {children}
                      </pre>
                    ),
                    code: ({ children }) => (
                      <code className="bg-muted-foreground/20 px-1 py-0.5 rounded break-all">
                        {children}
                      </code>
                    ),
                    a: ({ href, children }) => (
                      <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline break-all">
                        {children}
                      </a>
                    ),
                    p: ({ children }) => (
                      <p className="break-words">{children}</p>
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        )}

        {/* Tool calls display */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="flex flex-col gap-2 w-full">
            {message.toolCalls.map((toolCall) => (
              <div
                key={toolCall.id}
                className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1"
              >
                <Wrench className="h-3 w-3" />
                <span>{toolCall.name} を実行中...</span>
              </div>
            ))}
          </div>
        )}

        {/* Tool results display */}
        {message.toolResults && message.toolResults.length > 0 && (
          <div className="flex flex-col gap-2 w-full">
            {message.toolResults.map((result) => (
              <ToolResultCard key={result.toolCallId} result={result} />
            ))}
          </div>
        )}

        {/* Timestamp */}
        <span className="text-[10px] text-muted-foreground">
          {message.timestamp.toLocaleTimeString('ja-JP', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  );
}
