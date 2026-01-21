import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface LogoUploaderProps {
  logoUrl?: string;
  companyId: string;
  showLogoSidebar: boolean;
  showLogoLogin: boolean;
  showLogoDocuments: boolean;
  onLogoChange: (url: string | undefined) => void;
  onShowLogoSidebarChange: (value: boolean) => void;
  onShowLogoLoginChange: (value: boolean) => void;
  onShowLogoDocumentsChange: (value: boolean) => void;
}

export function LogoUploader({
  logoUrl,
  companyId,
  showLogoSidebar,
  showLogoLogin,
  showLogoDocuments,
  onLogoChange,
  onShowLogoSidebarChange,
  onShowLogoLoginChange,
  onShowLogoDocumentsChange,
}: LogoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "無効なファイル形式",
        description: "PNG, JPG, SVG, WebP形式の画像をアップロードしてください。",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "ファイルサイズ超過",
        description: "2MB以下の画像をアップロードしてください。",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${companyId}/logo-${Date.now()}.${fileExt}`;

      // Delete old logo if exists
      if (logoUrl) {
        const oldPath = logoUrl.split('/').slice(-2).join('/');
        await supabase.storage.from('company-logos').remove([oldPath]);
      }

      // Upload new logo
      const { error: uploadError } = await supabase.storage
        .from('company-logos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('company-logos')
        .getPublicUrl(fileName);

      onLogoChange(publicUrl);
      toast({
        title: "アップロード完了",
        description: "ロゴが正常にアップロードされました。",
      });
    } catch (error) {
      console.error('Logo upload error:', error);
      toast({
        title: "アップロード失敗",
        description: "ロゴのアップロードに失敗しました。",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDelete = async () => {
    if (!logoUrl) return;
    
    try {
      const path = logoUrl.split('/').slice(-2).join('/');
      await supabase.storage.from('company-logos').remove([path]);
      onLogoChange(undefined);
      toast({
        title: "削除完了",
        description: "ロゴが削除されました。",
      });
    } catch (error) {
      console.error('Logo delete error:', error);
      toast({
        title: "削除失敗",
        description: "ロゴの削除に失敗しました。",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">会社ロゴ</h3>
        <p className="text-sm text-muted-foreground">サイドバーや書類に表示するロゴをアップロード</p>
      </div>

      {/* Upload area */}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-colors",
          isDragging ? "border-primary bg-accent" : "border-border",
          "hover:border-primary/50"
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/svg+xml,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
        />

        {logoUrl ? (
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 border rounded-lg overflow-hidden bg-muted">
              <img
                src={logoUrl}
                alt="Company logo"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">現在のロゴ</p>
              <p className="text-xs text-muted-foreground">PNG, JPG, SVG, WebP (最大2MB)</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "変更"}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div 
            className="flex flex-col items-center justify-center cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
            ) : (
              <>
                <div className="p-3 rounded-full bg-muted mb-3">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">クリックまたはドラッグ&ドロップ</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG, SVG, WebP (最大2MB)</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Display options */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">表示オプション</Label>
        
        <div className="flex items-center justify-between py-2">
          <div className="space-y-0.5">
            <Label htmlFor="show-sidebar" className="text-sm">サイドバーに表示</Label>
            <p className="text-xs text-muted-foreground">ナビゲーションバーのヘッダー部分</p>
          </div>
          <Switch
            id="show-sidebar"
            checked={showLogoSidebar}
            onCheckedChange={onShowLogoSidebarChange}
          />
        </div>

        <div className="flex items-center justify-between py-2">
          <div className="space-y-0.5">
            <Label htmlFor="show-login" className="text-sm">ログインページに表示</Label>
            <p className="text-xs text-muted-foreground">認証画面の上部</p>
          </div>
          <Switch
            id="show-login"
            checked={showLogoLogin}
            onCheckedChange={onShowLogoLoginChange}
          />
        </div>

        <div className="flex items-center justify-between py-2">
          <div className="space-y-0.5">
            <Label htmlFor="show-documents" className="text-sm">書類に表示</Label>
            <p className="text-xs text-muted-foreground">請求書・見積書などのPDF</p>
          </div>
          <Switch
            id="show-documents"
            checked={showLogoDocuments}
            onCheckedChange={onShowLogoDocumentsChange}
          />
        </div>
      </div>
    </div>
  );
}
