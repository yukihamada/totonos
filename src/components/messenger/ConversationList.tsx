import { useConversations, Conversation } from "@/hooks/useConversations";
import { useAuth } from "@/hooks/useAuth";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Users, User, Bot } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { AI_BOT } from "@/lib/ai-bot";

interface ConversationListProps {
  selectedId?: string;
  onSelect: (id: string) => void;
}

export function ConversationList({ selectedId, onSelect }: ConversationListProps) {
  const { data: conversations, isLoading } = useConversations();
  const { user } = useAuth();
  const [search, setSearch] = useState("");

  const getConversationName = (conv: Conversation) => {
    // AI DM shows AI name
    if (conv.includes_ai && conv.type === 'direct') {
      return AI_BOT.displayName;
    }
    
    if (conv.name) return conv.name;
    
    // For DMs, show the other person's name
    if (conv.type === 'direct') {
      const otherParticipant = conv.participants?.find(p => p.user_id !== user?.id);
      return otherParticipant?.profile?.display_name || "不明なユーザー";
    }
    
    return "グループチャット";
  };

  const getInitials = (name: string) => {
    return name.slice(0, 2);
  };

  const filteredConversations = conversations?.filter(conv => {
    const name = getConversationName(conv).toLowerCase();
    return name.includes(search.toLowerCase());
  }) || [];

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-10 w-full" />
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">会話がありません</p>
          </div>
        ) : (
          <div className="p-2">
            {filteredConversations.map((conv) => {
              const name = getConversationName(conv);
              const isSelected = conv.id === selectedId;
              
              return (
                <button
                  key={conv.id}
                  onClick={() => onSelect(conv.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                    isSelected ? "bg-primary/10" : "hover:bg-muted/50"
                  )}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className={cn(
                      "text-sm",
                      conv.includes_ai && conv.type === 'direct' 
                        ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white"
                        : conv.type === 'group' 
                          ? "bg-blue-100 text-blue-600" 
                          : "bg-muted"
                    )}>
                      {conv.includes_ai && conv.type === 'direct' ? (
                        <Bot className="h-4 w-4" />
                      ) : conv.type === 'group' ? (
                        <Users className="h-4 w-4" />
                      ) : (
                        getInitials(name)
                      )}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium truncate">{name}</span>
                      {conv.last_message && (
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(conv.last_message.created_at), {
                            addSuffix: false,
                            locale: ja
                          })}
                        </span>
                      )}
                    </div>
                    {conv.last_message && (
                      <p className="text-sm text-muted-foreground truncate">
                        {conv.last_message.content}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
