import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreatePaymentParams {
  invoiceId: string;
  amount: number;
  invoiceNumber: string;
  title: string;
  clientEmail?: string;
}

interface VerifyPaymentParams {
  sessionId: string;
  invoiceId: string;
}

export function useCreatePaymentSession() {
  return useMutation({
    mutationFn: async (params: CreatePaymentParams) => {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: params,
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      
      return data as { url: string; sessionId: string };
    },
    onSuccess: (data) => {
      // Open Stripe Checkout in new tab
      window.open(data.url, '_blank');
      toast.success('決済ページを開きました');
    },
    onError: (error: Error) => {
      toast.error('決済リンクの作成に失敗しました: ' + error.message);
    },
  });
}

export function useVerifyPayment() {
  return useMutation({
    mutationFn: async (params: VerifyPaymentParams) => {
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: params,
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      
      return data as { success: boolean; paid: boolean; amount?: number; customerEmail?: string };
    },
  });
}
