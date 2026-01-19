import { useState, useCallback } from "react";
import { Upload, Camera, FileImage, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useDeliveryNoteOCR } from "@/hooks/useDeliveryNotes";

interface DeliveryNoteUploadProps {
  onSuccess?: (deliveryNoteId: string) => void;
  purchaseOrderId?: string;
  supplierId?: string;
}

export function DeliveryNoteUpload({ 
  onSuccess,
  purchaseOrderId,
  supplierId,
}: DeliveryNoteUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const { processDeliveryNote, isProcessing, progress } = useDeliveryNoteOCR();

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      return;
    }

    const result = await processDeliveryNote(file, {
      purchaseOrderId,
      supplierId,
    });

    if (result?.deliveryNote?.id) {
      onSuccess?.(result.deliveryNote.id);
    }
  }, [processDeliveryNote, purchaseOrderId, supplierId, onSuccess]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }, [handleFile]);

  const handleCameraCapture = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handleFile(file);
    };
    input.click();
  }, [handleFile]);

  if (isProcessing) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="text-center">
              <p className="font-medium">納品書を読み取り中...</p>
              <p className="text-sm text-muted-foreground">
                AIが納品書の内容を解析しています
              </p>
            </div>
            <Progress value={progress} className="w-64" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileImage className="h-5 w-5" />
          納品書アップロード
        </CardTitle>
        <CardDescription>
          納品書の画像またはPDFをアップロードすると、AIが自動で内容を読み取ります
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-muted rounded-full">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">
                ファイルをドラッグ＆ドロップ
              </p>
              <p className="text-sm text-muted-foreground">
                または クリックしてファイルを選択
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              対応形式: JPG, PNG, PDF（最大10MB）
            </p>
          </div>
        </div>

        <div className="mt-4 flex justify-center">
          <Button
            variant="outline"
            onClick={handleCameraCapture}
            className="gap-2"
          >
            <Camera className="h-4 w-4" />
            カメラで撮影
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
