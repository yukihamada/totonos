import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useCurrentCompany } from "@/hooks/useCompany";

export function IndustryTemplateAppliedDialog() {
  const [open, setOpen] = useState(false);
  const { data: company } = useCurrentCompany();
  
  useEffect(() => {
    // Check if template was recently applied (within last 30 seconds)
    if (company?.template_applied_at) {
      const appliedAt = new Date(company.template_applied_at);
      const now = new Date();
      const diffSeconds = (now.getTime() - appliedAt.getTime()) / 1000;
      
      // Show dialog if template was applied within last 30 seconds
      if (diffSeconds < 30) {
        // Check if we've already shown this dialog in this session
        const shownKey = `template_dialog_shown_${company.id}`;
        if (!sessionStorage.getItem(shownKey)) {
          setOpen(true);
          sessionStorage.setItem(shownKey, 'true');
        }
      }
    }
  }, [company?.template_applied_at, company?.id]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle>業種テンプレートが適用されました</DialogTitle>
              <DialogDescription>
                お選びいただいた業種に最適化された設定が適用されました。
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            メニューやダッシュボードが業種に合わせてカスタマイズされています。
            設定はいつでも変更可能です。
          </p>
        </div>
        <div className="flex justify-end">
          <Button onClick={() => setOpen(false)}>
            始める
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
