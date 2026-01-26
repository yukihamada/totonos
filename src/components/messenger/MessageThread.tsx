import { useEffect, useRef } from "react";
import { useConversation, useUpdateLastRead } from "@/hooks/useConversations";
import { useMessages } from "@/hooks/useMessages";
import { useAuth } from "@/hooks/useAuth";
import { MessageInput } from "./MessageInput";
import { AIMessageBubble } from "./AIMessageBubble";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Bot } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { ja } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { isAIBot, AI_BOT } from "@/lib/ai-bot";

interface MessageThreadProps {
  conversationId: string;
  onBack?: () => void;
}

export function MessageThread({ conversationId, onBack }: MessageThreadProps) {
  const { data: conversation, isLoading: convLoading } = useConversation(conversationId);
  const { data: messages, isLoading: messagesLoading } = useMessages(conversationId);
  const { user } = useAuth();
  const updateLastRead = useUpdateLastRead();
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mark as read when viewing
  useEffect(() => {
    if (conversationId) {
      updateLastRead.mutate(conversationId);
    }
  }, [conversationId]);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getConversationName = () => {
    if (!conversation) return "";
    if (conversation.name) return conversation.name;
    
    if (conversation.type === 'direct') {
      const otherParticipant = conversation.participants?.find(p => p.user_id !== user?.id);
      return otherParticipant?.profile?.display_name || "不明なユーザー";
    }
    
    return "グループチャット";
  };

  const formatMessageDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) {
      return format(date, "HH:mm");
    }
    if (isYesterday(date)) {
      return `昨日 ${format(date, "HH:mm")}`;
    }
    return format(date, "M/d HH:mm", { locale: ja });
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.slice(0, 2);
  };

  if (convLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-border">
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-16 w-48 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center gap-3">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <Avatar className="h-8 w-8">
          <AvatarFallback className={cn(
            "text-xs",
            conversation?.type === 'group' ? "bg-blue-100 text-blue-600" : "bg-muted"
          )}>
            {conversation?.type === 'group' ? (
              <Users className="h-4 w-4" />
            ) : (
              getInitials(getConversationName())
            )}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-medium">{getConversationName()}</h2>
          {conversation?.type === 'group' && (
            <p className="text-xs text-muted-foreground">
              {conversation.participants?.length || 0}人のメンバー
            </p>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messagesLoading ? (
            <>
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-16 w-48 rounded-lg" />
                </div>
              ))}
            </>
          ) : messages?.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>まだメッセージがありません</p>
              <p className="text-sm mt-1">最初のメッセージを送信しましょう</p>
            </div>
          ) : (
            messages?.map((message, idx) => {
              const isOwn = message.sender_id === user?.id;
              const isAI = isAIBot(message.sender_id);
              const showAvatar = !isOwn && !isAI && (
                idx === 0 || 
                messages[idx - 1]?.sender_id !== message.sender_id
              );
              
              // AI messages get special rendering
              if (isAI) {
                return (
                  <AIMessageBubble
                    key={message.id}
                    content={message.content}
                    timestamp={formatMessageDate(message.created_at)}
                    aiMetadata={(message as any).ai_metadata}
                  />
                );
              }
              
              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-2",
                    isOwn ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  {!isOwn && (
                    <div className="w-8">
                      {showAvatar && (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-muted">
                            {getInitials(message.sender?.display_name || null)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  )}
                  
                  <div className={cn(
                    "max-w-[70%] space-y-1",
                    isOwn ? "items-end" : "items-start"
                  )}>
                    {!isOwn && showAvatar && (
                      <p className="text-xs text-muted-foreground ml-1">
                        {message.sender?.display_name || "不明"}
                      </p>
                    )}
                    <div className={cn(
                      "rounded-2xl px-4 py-2",
                      isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}>
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    </div>
                    <p className={cn(
                      "text-xs text-muted-foreground",
                      isOwn ? "text-right mr-1" : "ml-1"
                    )}>
                      {formatMessageDate(message.created_at)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <MessageInput conversationId={conversationId} />
    </div>
  );
}
