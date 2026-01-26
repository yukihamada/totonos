import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ConversationList } from "@/components/messenger/ConversationList";
import { MessageThread } from "@/components/messenger/MessageThread";
import { NewConversationDialog } from "@/components/messenger/NewConversationDialog";
import { Button } from "@/components/ui/button";
import { Plus, MessageCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export default function Messages() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>();
  const [showNewDialog, setShowNewDialog] = useState(false);
  const isMobile = useIsMobile();

  const handleConversationCreated = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setShowNewDialog(false);
  };

  const handleBack = () => {
    setSelectedConversationId(undefined);
  };

  return (
    <AppLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageCircle className="h-6 w-6" />
            メッセージ
          </h1>
          <Button onClick={() => setShowNewDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            新規会話
          </Button>
        </div>

        <div className="flex-1 flex gap-4 overflow-hidden rounded-lg border border-border bg-card">
          {/* Conversation List */}
          <div className={cn(
            "w-full md:w-80 flex-shrink-0 border-r border-border",
            isMobile && selectedConversationId && "hidden"
          )}>
            <ConversationList
              selectedId={selectedConversationId}
              onSelect={setSelectedConversationId}
            />
          </div>

          {/* Message Thread */}
          <div className={cn(
            "flex-1",
            isMobile && !selectedConversationId && "hidden"
          )}>
            {selectedConversationId ? (
              <MessageThread
                conversationId={selectedConversationId}
                onBack={isMobile ? handleBack : undefined}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>会話を選択してください</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <NewConversationDialog
        open={showNewDialog}
        onOpenChange={setShowNewDialog}
        onCreated={handleConversationCreated}
      />
    </AppLayout>
  );
}
