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
import { Badge } from "@/components/ui/badge";
import type { DuplicateClientInfo } from "@/hooks/useClients";

interface ClientDuplicateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  duplicates: DuplicateClientInfo[];
  onConfirm: () => void;
  onCancel: () => void;
}

export function ClientDuplicateDialog({
  open,
  onOpenChange,
  duplicates,
  onConfirm,
  onCancel,
}: ClientDuplicateDialogProps) {
  const getMatchLabel = (matchType: DuplicateClientInfo['matchType']) => {
    switch (matchType) {
      case 'both':
        return '名前・メール一致';
      case 'name':
        return '名前一致';
      case 'email':
        return 'メール一致';
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>重複の可能性がある取引先</AlertDialogTitle>
          <AlertDialogDescription>
            以下の既存取引先と情報が重複している可能性があります。
            それでも新規登録しますか？
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="my-4 space-y-2">
          {duplicates.map((dup) => (
            <div
              key={dup.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <p className="font-medium">{dup.name}</p>
                {dup.email && (
                  <p className="text-sm text-muted-foreground">{dup.email}</p>
                )}
              </div>
              <Badge variant="secondary">{getMatchLabel(dup.matchType)}</Badge>
            </div>
          ))}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>キャンセル</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            それでも登録する
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
