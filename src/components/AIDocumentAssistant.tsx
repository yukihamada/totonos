import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2, Coins } from "lucide-react";
import { useDocumentAI, DocumentType, GeneratedDocumentData } from "@/hooks/useDocumentAI";

interface AIDocumentAssistantProps {
  documentType: DocumentType;
  onGenerate: (data: GeneratedDocumentData) => void;
  existingData?: Record<string, unknown>;
  clientInfo?: { id: string; name: string };
  showEditMode?: boolean;
}

const documentTypeLabels: Record<DocumentType, string> = {
  contract: "契約書",
  estimate: "見積書",
  invoice: "請求書",
  purchase_order: "発注書",
};

const placeholders: Record<DocumentType, string> = {
  contract: "例: 株式会社〇〇とのWebサイト制作業務委託契約を作成して。金額は100万円で、納期は3ヶ月後。秘密保持条項と知的財産権の取り扱いも含めて。",
  estimate: "例: Webシステム開発で350万円の見積書を作成。要件定義50万、設計100万、開発150万、テスト50万で内訳を作成して。",
  invoice: "例: 1月分のコンサルティング費用として月額30万円の請求書を作成。支払期限は月末で。",
  purchase_order: "例: サーバー機器5台を発注。1台あたり25万円で納品は2週間後希望。",
};

export function AIDocumentAssistant({
  documentType,
  onGenerate,
  existingData,
  clientInfo,
  showEditMode = false,
}: AIDocumentAssistantProps) {
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<"create" | "edit">("create");
  
  const { generateDocument, isGenerating } = useDocumentAI({
    documentType,
    onSuccess: onGenerate,
  });

  const handleGenerate = async () => {
    const data = mode === "edit" ? existingData : undefined;
    await generateDocument(prompt, mode, data, clientInfo);
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AIアシスタント
        </CardTitle>
        <CardDescription>
          自然言語で{documentTypeLabels[documentType]}の内容を指示してください
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder={placeholders[documentType]}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            maxLength={2000}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground text-right">
            {prompt.length}/2000
          </p>
        </div>

        {showEditMode && existingData && (
          <RadioGroup
            value={mode}
            onValueChange={(v) => setMode(v as "create" | "edit")}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="create" id="mode-create" />
              <Label htmlFor="mode-create" className="cursor-pointer">新規作成</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="edit" id="mode-edit" />
              <Label htmlFor="mode-edit" className="cursor-pointer">既存を編集</Label>
            </div>
          </RadioGroup>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Coins className="h-4 w-4" />
            <span>3クレジット消費</span>
          </div>
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || !prompt.trim()}
            className="gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                AIで生成
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
