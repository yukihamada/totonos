import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useCreateClient } from "@/hooks/useClients";
import type { Client } from "@/types/database";

interface ClientQuickCreateProps {
  onCreated?: (client: Client) => void;
  trigger?: React.ReactNode;
}

export function ClientQuickCreate({ onCreated, trigger }: ClientQuickCreateProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const createClient = useCreateClient();

  const resetForm = () => {
    setName("");
    setEmail("");
  };

  const handleCreate = async () => {
    const result = await createClient.mutateAsync({
      name,
      email: email || null,
    });
    
    if (result && onCreated) {
      onCreated(result as Client);
    }
    
    setOpen(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button type="button" variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-1" />
            新規作成
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>取引先を追加</DialogTitle>
          <DialogDescription>新しい取引先を簡単に登録できます</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>会社名 / 氏名 *</Label>
            <Input
              placeholder="株式会社〇〇"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>メールアドレス</Label>
            <Input
              type="email"
              placeholder="info@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            キャンセル
          </Button>
          <Button onClick={handleCreate} disabled={!name || createClient.isPending}>
            {createClient.isPending ? "作成中..." : "作成"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
