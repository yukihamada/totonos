import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PurchaseCreditsParams {
  packId: string;
}

interface VerifyPurchaseParams {
  sessionId: string;
}

export function usePurchaseCredits() {
  return useMutation({
    mutationFn: async (params: PurchaseCreditsParams) => {
      const { data, error } = await supabase.functions.invoke('purchase-credits', {
        body: params,
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      
      return data as { url: string; sessionId: string };
    },
    onSuccess: (data) => {
      // Stripe Checkoutを新しいタブで開く
      window.open(data.url, '_blank');
      toast.success('決済ページを開きました');
    },
    onError: (error: Error) => {
      toast.error('決済の開始に失敗しました: ' + error.message);
    },
  });
}

export function useVerifyCreditPurchase() {
  return useMutation({
    mutationFn: async (params: VerifyPurchaseParams) => {
      const { data, error } = await supabase.functions.invoke('verify-credit-purchase', {
        body: params,
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      
      return data as { 
        success: boolean; 
        paid: boolean; 
        credits?: number; 
        packId?: string;
        userId?: string;
      };
    },
  });
}
