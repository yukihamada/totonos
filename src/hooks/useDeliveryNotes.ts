import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import type { DeliveryNote, DeliveryNoteItem } from "@/types/inventory";

export interface DeliveryNoteWithItems extends DeliveryNote {
  items?: DeliveryNoteItem[];
}

export interface DeliveryNoteOCRResult {
  delivery_note_number: string | null;
  supplier_name: string | null;
  delivery_date: string | null;
  items: Array<{
    jan_code: string | null;
    product_name: string;
    quantity: number;
    unit_price: number | null;
    amount: number | null;
  }>;
  subtotal: number | null;
  tax_amount: number | null;
  total_amount: number | null;
  raw_text: string;
  confidence: number;
}

export function useDeliveryNotes() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const deliveryNotesQuery = useQuery({
    queryKey: ['delivery-notes', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('delivery_notes')
        .select(`
          *,
          items:delivery_note_items(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as DeliveryNoteWithItems[];
    },
    enabled: !!user?.id,
  });

  const deleteDeliveryNote = useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error('ユーザーが認証されていません');

      const { error } = await supabase
        .from('delivery_notes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
      toast.success('納品書を削除しました');
    },
    onError: (error: Error) => {
      toast.error(`納品書の削除に失敗しました: ${error.message}`);
    },
  });

  return {
    deliveryNotes: deliveryNotesQuery.data ?? [],
    isLoading: deliveryNotesQuery.isLoading,
    error: deliveryNotesQuery.error,
    deleteDeliveryNote,
    refetch: deliveryNotesQuery.refetch,
  };
}

export function useDeliveryNoteDetail(id: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['delivery-note', id],
    queryFn: async () => {
      if (!user?.id || !id) return null;
      
      const { data, error } = await supabase
        .from('delivery_notes')
        .select(`
          *,
          items:delivery_note_items(
            *,
            product:products(id, name, sku, jan_code, stock_quantity, unit)
          )
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && !!id,
  });
}

export function useDeliveryNoteOCR() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const queryClient = useQueryClient();

  const processDeliveryNote = async (
    file: File,
    options?: {
      purchaseOrderId?: string;
      supplierId?: string;
      companyId?: string;
    }
  ): Promise<{
    result: DeliveryNoteOCRResult;
    deliveryNote: DeliveryNote;
    items: DeliveryNoteItem[];
  } | null> => {
    setIsProcessing(true);
    setProgress(10);

    try {
      // Convert file to base64
      const base64 = await fileToBase64(file);
      setProgress(30);

      // Call OCR function
      setProgress(50);
      
      const response = await supabase.functions.invoke("ocr-delivery-note", {
        body: {
          imageBase64: base64,
          purchaseOrderId: options?.purchaseOrderId,
          supplierId: options?.supplierId,
          companyId: options?.companyId,
          saveToDb: true,
        },
      });

      setProgress(90);

      if (response.error) {
        throw new Error(response.error.message || "OCR処理に失敗しました");
      }

      const { result, deliveryNote, items } = response.data;
      
      setProgress(100);
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });

      toast.success("納品書を読み取りました", {
        description: result.supplier_name 
          ? `${result.supplier_name} - ¥${result.total_amount?.toLocaleString() || "不明"}`
          : "確認画面で内容をご確認ください",
      });

      return { result, deliveryNote, items };
    } catch (error) {
      console.error("OCR error:", error);
      toast.error(error instanceof Error ? error.message : "OCR処理に失敗しました");
      return null;
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return {
    processDeliveryNote,
    isProcessing,
    progress,
  };
}

export function useApplyDeliveryNote() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (deliveryNoteId: string) => {
      if (!user?.id) throw new Error('ユーザーが認証されていません');

      // Get delivery note with items
      const { data: deliveryNote, error: fetchError } = await supabase
        .from('delivery_notes')
        .select(`
          *,
          items:delivery_note_items(*)
        `)
        .eq('id', deliveryNoteId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw fetchError;
      if (!deliveryNote) throw new Error('納品書が見つかりません');
      if (deliveryNote.status === 'applied') throw new Error('既に在庫に反映済みです');

      const items = deliveryNote.items || [];
      const matchedItems = items.filter((item: DeliveryNoteItem) => item.product_id && item.is_matched);

      if (matchedItems.length === 0) {
        throw new Error('マッチした商品がありません');
      }

      // Update stock for each matched item
      for (const item of matchedItems) {
        // Get current stock
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('stock_quantity')
          .eq('id', item.product_id)
          .single();

        if (productError) {
          console.error(`Product fetch error for ${item.product_id}:`, productError);
          continue;
        }

        const quantityBefore = product.stock_quantity;
        const quantityAfter = quantityBefore + item.quantity;

        // Create transaction
        await supabase
          .from('inventory_transactions')
          .insert({
            user_id: user.id,
            company_id: deliveryNote.company_id,
            product_id: item.product_id,
            transaction_type: 'delivery_receipt',
            quantity: item.quantity,
            quantity_before: quantityBefore,
            quantity_after: quantityAfter,
            unit_price: item.unit_price,
            total_amount: item.amount,
            reference_type: 'delivery_note',
            reference_id: deliveryNoteId,
            notes: `納品書 ${deliveryNote.delivery_note_number || deliveryNoteId} から取込`,
            performed_by: user.id,
          });

        // Update stock
        await supabase
          .from('products')
          .update({ stock_quantity: quantityAfter })
          .eq('id', item.product_id);
      }

      // Update delivery note status
      const { error: updateError } = await supabase
        .from('delivery_notes')
        .update({
          status: 'applied',
          received_date: new Date().toISOString(),
        })
        .eq('id', deliveryNoteId);

      if (updateError) throw updateError;

      return { 
        appliedCount: matchedItems.length,
        totalItems: items.length,
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['low-stock-products'] });
      toast.success(`${data.appliedCount}件の商品の在庫を更新しました`);
    },
    onError: (error: Error) => {
      toast.error(`在庫反映に失敗しました: ${error.message}`);
    },
  });
}

export function useUpdateDeliveryNoteItem() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      productId,
      isMatched,
    }: {
      itemId: string;
      productId: string | null;
      isMatched: boolean;
    }) => {
      if (!user?.id) throw new Error('ユーザーが認証されていません');

      const { data, error } = await supabase
        .from('delivery_note_items')
        .update({
          product_id: productId,
          is_matched: isMatched,
          match_confidence: isMatched ? 1.0 : 0,
        })
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-note'] });
      toast.success('商品マッチングを更新しました');
    },
    onError: (error: Error) => {
      toast.error(`更新に失敗しました: ${error.message}`);
    },
  });
}

// Helper function
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
