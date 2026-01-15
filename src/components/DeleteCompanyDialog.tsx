import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DeleteCompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyName: string;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export function DeleteCompanyDialog({
  open,
  onOpenChange,
  companyName,
  onConfirm,
  isLoading,
}: DeleteCompanyDialogProps) {
  const [confirmText, setConfirmText] = useState("");

  const isConfirmed = confirmText === companyName;

  const handleConfirm = async () => {
    if (!isConfirmed) return;
    await onConfirm();
    setConfirmText("");
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <AlertDialogTitle>会社を削除</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-3">
            <p>
              この操作は取り消せません。以下のデータがすべて削除されます：
            </p>
            <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
              <li>請求書・見積書・契約書</li>
              <li>顧客・リード・商談データ</li>
              <li>従業員・勤怠・給与データ</li>
              <li>会計・経費データ</li>
              <li>Wiki・IT資産データ</li>
              <li>すべてのチームメンバー・招待</li>
            </ul>
            <div className="pt-2">
              <Label htmlFor="confirm-delete">
                確認のため「<span className="font-bold">{companyName}</span>」と入力してください
              </Label>
              <Input
                id="confirm-delete"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={companyName}
                className="mt-2"
                disabled={isLoading}
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>キャンセル</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!isConfirmed || isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? "削除中..." : "完全に削除する"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
