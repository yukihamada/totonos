import { useState } from "react";
import { Building2 } from "lucide-react";
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

interface CompanySetupDialogProps {
  open: boolean;
  onComplete: (companyName: string, displayName?: string) => Promise<void>;
  isLoading?: boolean;
}

export function CompanySetupDialog({ open, onComplete, isLoading }: CompanySetupDialogProps) {
  const [companyName, setCompanyName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!companyName.trim()) {
      setError("会社名を入力してください");
      return;
    }
    setError("");
    await onComplete(companyName.trim(), displayName.trim() || undefined);
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            <DialogTitle>会社情報を登録</DialogTitle>
          </div>
          <DialogDescription>
            Totonosを使用するには会社情報の登録が必要です。
            <br />
            会社名を入力してください。
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company-name">会社名 *</Label>
            <Input
              id="company-name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="例: 株式会社サンプル"
              disabled={isLoading}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="display-name">表示名（任意）</Label>
            <Input
              id="display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="例: サンプル社"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              サイドバーなどで表示される短い名前です
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isLoading || !companyName.trim()}>
            {isLoading ? "登録中..." : "登録して始める"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
