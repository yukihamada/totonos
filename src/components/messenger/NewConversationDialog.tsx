import { useState } from "react";
import { useCreateConversation } from "@/hooks/useConversations";
import { useCompanyMembers } from "@/hooks/useCompany";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Users, Loader2, Bot } from "lucide-react";
import { toast } from "sonner";
import { AI_BOT } from "@/lib/ai-bot";

interface NewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (conversationId: string) => void;
}

export function NewConversationDialog({
  open,
  onOpenChange,
  onCreated
}: NewConversationDialogProps) {
  const { user } = useAuth();
  const { data: members, isLoading } = useCompanyMembers();
  const createConversation = useCreateConversation();
  
  const [type, setType] = useState<'direct' | 'group'>('direct');
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const otherMembers = members?.filter(m => m.user_id !== user?.id) || [];
  
  // Check if AI is selected
  const isAISelected = selectedUsers.includes(AI_BOT.id);

  const handleToggleUser = (userId: string) => {
    if (type === 'direct') {
      setSelectedUsers([userId]);
    } else {
      setSelectedUsers(prev =>
        prev.includes(userId)
          ? prev.filter(id => id !== userId)
          : [...prev, userId]
      );
    }
  };

  const handleCreate = async () => {
    if (selectedUsers.length === 0) {
      toast.error("メンバーを選択してください");
      return;
    }

    if (type === 'group' && !groupName.trim()) {
      toast.error("グループ名を入力してください");
      return;
    }

    try {
      const conversation = await createConversation.mutateAsync({
        name: type === 'group' ? groupName.trim() : undefined,
        type,
        participantIds: selectedUsers.filter(id => id !== AI_BOT.id),
        includesAI: isAISelected
      });
      
      onCreated(conversation.id);
      handleClose();
    } catch (error) {
      toast.error("会話の作成に失敗しました");
    }
  };

  const handleClose = () => {
    setType('direct');
    setGroupName("");
    setSelectedUsers([]);
    onOpenChange(false);
  };

  const getDisplayName = (member: any) => {
    return member.profiles?.display_name || member.user_id?.slice(0, 8) || "不明";
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>新規会話</DialogTitle>
          <DialogDescription>
            メッセージを送るメンバーを選択してください
          </DialogDescription>
        </DialogHeader>

        <Tabs value={type} onValueChange={(v) => {
          setType(v as 'direct' | 'group');
          setSelectedUsers([]);
        }}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="direct" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              ダイレクト
            </TabsTrigger>
            <TabsTrigger value="group" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              グループ
            </TabsTrigger>
          </TabsList>

          <TabsContent value="direct" className="mt-4">
            <Label className="text-sm text-muted-foreground mb-2 block">
              メンバーを選択
            </Label>
          </TabsContent>

          <TabsContent value="group" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label>グループ名</Label>
              <Input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="例: 営業チーム"
              />
            </div>
            <Label className="text-sm text-muted-foreground block">
              メンバーを選択（複数可）
            </Label>
          </TabsContent>
        </Tabs>

        <ScrollArea className="h-64 border rounded-lg">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {/* AI Bot Option - Always First */}
              <button
                onClick={() => handleToggleUser(AI_BOT.id)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border-b border-border mb-1"
              >
                {type === 'group' && (
                  <Checkbox checked={isAISelected} />
                )}
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="font-medium">{AI_BOT.displayName}</p>
                  <p className="text-xs text-muted-foreground">
                    AIアシスタント
                  </p>
                </div>
                {type === 'direct' && isAISelected && (
                  <div className="w-2 h-2 rounded-full bg-primary" />
                )}
              </button>
              
              {/* Human Members */}
              {otherMembers.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                  他のメンバーがいません
                </div>
              ) : (
                otherMembers.map((member) => {
                  const displayName = getDisplayName(member);
                  const isSelected = selectedUsers.includes(member.user_id);
                  
                  return (
                    <button
                      key={member.user_id}
                      onClick={() => handleToggleUser(member.user_id)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      {type === 'group' && (
                        <Checkbox checked={isSelected} />
                      )}
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-muted">
                          {displayName.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <p className="font-medium">{displayName}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {member.role}
                        </p>
                      </div>
                      {type === 'direct' && isSelected && (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            キャンセル
          </Button>
          <Button 
            onClick={handleCreate}
            disabled={selectedUsers.length === 0 || createConversation.isPending}
          >
            {createConversation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            作成
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
