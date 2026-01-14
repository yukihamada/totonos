import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Receipt {
  id: string;
  user_id: string;
  company_id: string | null;
  source: "upload" | "email" | "camera";
  source_email_id: string | null;
  image_url: string | null;
  vendor: string | null;
  receipt_date: string | null;
  total_amount: number | null;
  tax_amount: number | null;
  items: Array<{ name: string; price: number; quantity?: number }>;
  category: string | null;
  raw_text: string | null;
  confidence: number | null;
  status: "pending" | "processed" | "approved" | "rejected" | "linked";
  expense_claim_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface OCRResult {
  vendor: string | null;
  date: string | null;
  total: number | null;
  tax: number | null;
  items: Array<{ name: string; price: number; quantity?: number }>;
  category: string | null;
  rawText: string;
  confidence: number;
}

export function useReceipts() {
  return useQuery({
    queryKey: ["receipts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("receipts")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Receipt[];
    },
  });
}

export function useReceiptOCR() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const processReceipt = async (
    file: File,
    source: "upload" | "camera" = "upload"
  ): Promise<{ result: OCRResult; receipt: Receipt } | null> => {
    setIsProcessing(true);
    setProgress(10);

    try {
      // Convert file to base64
      const base64 = await fileToBase64(file);
      setProgress(30);

      // Upload to storage
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("receipts")
        .upload(fileName, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        // Continue without storage URL
      }
      setProgress(50);

      // Get public URL if uploaded
      let imageUrl: string | null = null;
      if (uploadData?.path) {
        const { data: urlData } = supabase.storage
          .from("receipts")
          .getPublicUrl(uploadData.path);
        imageUrl = urlData.publicUrl;
      }

      // Call OCR function
      setProgress(70);
      const { data: session } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke("ocr-receipt", {
        body: {
          imageBase64: base64,
          imageUrl,
          source,
          saveToDb: true,
        },
      });

      setProgress(100);

      if (response.error) {
        throw new Error(response.error.message || "OCR処理に失敗しました");
      }

      const { result, receipt } = response.data;
      
      // Invalidate queries to refresh list
      queryClient.invalidateQueries({ queryKey: ["receipts"] });

      toast({
        title: "レシート処理完了",
        description: result.vendor 
          ? `${result.vendor} - ¥${result.total?.toLocaleString() || "不明"}`
          : "レシート情報を抽出しました",
      });

      return { result, receipt };
    } catch (error) {
      console.error("OCR error:", error);
      toast({
        title: "エラー",
        description: error instanceof Error ? error.message : "OCR処理に失敗しました",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return {
    processReceipt,
    isProcessing,
    progress,
  };
}

export function useUpdateReceipt() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Receipt> }) => {
      const { data, error } = await supabase
        .from("receipts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
      toast({
        title: "更新完了",
        description: "レシート情報を更新しました",
      });
    },
    onError: (error) => {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteReceipt() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("receipts")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
      toast({
        title: "削除完了",
        description: "レシートを削除しました",
      });
    },
    onError: (error) => {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useLinkReceiptToExpense() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ receiptId, expenseClaimId }: { receiptId: string; expenseClaimId: string }) => {
      const { data, error } = await supabase
        .from("receipts")
        .update({ 
          expense_claim_id: expenseClaimId,
          status: "linked" 
        })
        .eq("id", receiptId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
      queryClient.invalidateQueries({ queryKey: ["expense-claims"] });
      toast({
        title: "連携完了",
        description: "レシートを経費申請に紐付けました",
      });
    },
    onError: (error) => {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Helper function to convert file to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Return the full data URL for the AI to process
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}