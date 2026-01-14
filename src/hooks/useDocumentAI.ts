import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type DocumentType = "contract" | "estimate" | "invoice" | "purchase_order";

export interface ContractItem {
  title: string;
  content: string;
}

export interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
}

export interface GeneratedContractData {
  title: string;
  client_id?: string;
  content?: string;
  amount?: number;
  valid_until?: string;
  items: ContractItem[];
}

export interface GeneratedEstimateData {
  title: string;
  client_id?: string;
  description?: string;
  valid_until: string;
  items: LineItem[];
}

export interface GeneratedInvoiceData {
  title: string;
  client_id?: string;
  description?: string;
  due_date: string;
  items: LineItem[];
}

export interface GeneratedPurchaseOrderData {
  title: string;
  client_id?: string;
  description?: string;
  delivery_date?: string;
  items: LineItem[];
}

export type GeneratedDocumentData = 
  | GeneratedContractData 
  | GeneratedEstimateData 
  | GeneratedInvoiceData 
  | GeneratedPurchaseOrderData;

interface UseDocumentAIOptions {
  documentType: DocumentType;
  onSuccess?: (data: GeneratedDocumentData) => void;
}

export function useDocumentAI({ documentType, onSuccess }: UseDocumentAIOptions) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateDocument = async (
    prompt: string,
    mode: "create" | "edit" = "create",
    existingData?: Record<string, unknown>,
    clientInfo?: { id: string; name: string }
  ) => {
    if (!prompt.trim()) {
      toast.error("プロンプトを入力してください");
      return null;
    }

    setIsGenerating(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error("ログインが必要です");
        return null;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-document`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            documentType,
            prompt,
            mode,
            existingData,
            clientInfo,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        
        if (response.status === 402) {
          toast.error(errorData.error || "クレジットが不足しています");
          return null;
        }
        
        if (response.status === 429) {
          toast.error("レート制限に達しました。しばらく待ってから再試行してください。");
          return null;
        }

        throw new Error(errorData.error || "生成に失敗しました");
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        toast.success(`AIで${getDocumentTypeName(documentType)}を生成しました（${result.creditsUsed}クレジット消費）`);
        onSuccess?.(result.data);
        return result.data as GeneratedDocumentData;
      }

      throw new Error("生成結果が不正です");
    } catch (error) {
      console.error("Document generation error:", error);
      toast.error(error instanceof Error ? error.message : "生成に失敗しました");
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateDocument,
    isGenerating,
  };
}

function getDocumentTypeName(type: DocumentType): string {
  const names: Record<DocumentType, string> = {
    contract: "契約書",
    estimate: "見積書",
    invoice: "請求書",
    purchase_order: "発注書",
  };
  return names[type];
}
