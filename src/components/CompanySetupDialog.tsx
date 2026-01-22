import { useState, useEffect } from "react";
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
import { IndustryOnboardingDialog } from "./IndustryOnboardingDialog";
import { useSettings } from "@/hooks/useSettings";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentCompany } from "@/hooks/useCompany";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface CompanySetupDialogProps {
  open: boolean;
  onComplete: (companyName: string, displayName?: string) => Promise<void>;
  isLoading?: boolean;
}

export function CompanySetupDialog({ open, onComplete, isLoading }: CompanySetupDialogProps) {
  const [step, setStep] = useState<"company" | "industry">("company");
  const [companyName, setCompanyName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [applyingTemplate, setApplyingTemplate] = useState(false);
  
  const { applyTemplateByDbKey } = useSettings();
  const { data: currentCompany } = useCurrentCompany();
  const queryClient = useQueryClient();

  // Check if company already has a template
  const hasTemplate = currentCompany?.template_id != null;

  // Reset step when dialog opens
  useEffect(() => {
    if (open) {
      // If company already exists and has no template, go to industry step
      if (currentCompany?.name && currentCompany.name !== "会社名未登録" && !hasTemplate) {
        setStep("industry");
      } else {
        setStep("company");
      }
    }
  }, [open, currentCompany, hasTemplate]);

  const handleCompanySubmit = async () => {
    if (!companyName.trim()) {
      setError("会社名を入力してください");
      return;
    }
    setError("");
    await onComplete(companyName.trim(), displayName.trim() || undefined);
    
    // If template is not set, move to industry selection
    if (!hasTemplate) {
      setStep("industry");
    }
  };

  const handleIndustryComplete = async (templateKey: string) => {
    if (!currentCompany) return;
    
    setApplyingTemplate(true);
    try {
      // Get the template ID from the database
      const { data: templateData } = await supabase
        .from("industry_templates")
        .select("id")
        .eq("template_key", templateKey)
        .single();

      if (templateData) {
        // Update company with template
        await supabase
          .from("companies")
          .update({ 
            template_id: templateData.id,
            template_applied_at: new Date().toISOString()
          })
          .eq("id", currentCompany.id);

        // Apply menu template
        applyTemplateByDbKey(templateKey);

        // Refresh company data
        queryClient.invalidateQueries({ queryKey: ["current-company"] });
        
        toast.success("業種テンプレートを適用しました");
      }
    } catch (err) {
      console.error("Failed to apply template:", err);
      toast.error("テンプレートの適用に失敗しました");
    } finally {
      setApplyingTemplate(false);
    }
  };

  // Show industry selection dialog
  if (step === "industry" && !hasTemplate) {
    return (
      <IndustryOnboardingDialog
        open={open}
        onComplete={handleIndustryComplete}
        isLoading={applyingTemplate}
      />
    );
  }

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
          <Button onClick={handleCompanySubmit} disabled={isLoading || !companyName.trim()}>
            {isLoading ? "登録中..." : "次へ: 業種を選択"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}