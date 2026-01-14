import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type PurchaseOrder = Tables<'purchase_orders'>;
type PurchaseOrderItem = Tables<'purchase_order_items'>;

export function usePurchaseOrders() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['purchase_orders', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          client:clients(id, name, email)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function usePurchaseOrder(id: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['purchase_order', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          client:clients(id, name, email, address, phone),
          items:purchase_order_items(*)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!id,
  });
}

interface CreatePurchaseOrderInput {
  title: string;
  client_id?: string | null;
  description?: string | null;
  delivery_date?: string | null;
  items: {
    description: string;
    quantity: number;
    unit_price: number;
  }[];
}

function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PO-${year}${month}-${random}`;
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreatePurchaseOrderInput) => {
      if (!user) throw new Error('ログインが必要です');

      // Calculate totals
      const amount = input.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
      const taxAmount = Math.floor(amount * 0.1); // 10% tax
      const totalAmount = amount + taxAmount;

      // Create purchase order
      const { data: purchaseOrder, error: poError } = await supabase
        .from('purchase_orders')
        .insert({
          user_id: user.id,
          order_number: generateOrderNumber(),
          title: input.title,
          client_id: input.client_id,
          description: input.description,
          delivery_date: input.delivery_date,
          amount,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          status: 'draft',
        })
        .select()
        .single();

      if (poError) throw poError;

      // Create purchase order items
      if (input.items.length > 0) {
        const { error: itemsError } = await supabase
          .from('purchase_order_items')
          .insert(
            input.items.map(item => ({
              purchase_order_id: purchaseOrder.id,
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unit_price,
              amount: item.quantity * item.unit_price,
            }))
          );

        if (itemsError) throw itemsError;
      }

      return purchaseOrder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase_orders'] });
      toast.success('発注書を作成しました');
    },
    onError: (error) => {
      toast.error('発注書の作成に失敗しました: ' + error.message);
    },
  });
}

export function useUpdatePurchaseOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: PurchaseOrder['status'] }) => {
      const updateData: Partial<PurchaseOrder> = { status };

      if (status === 'confirmed') {
        updateData.confirmed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('purchase_orders')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['purchase_orders'] });
      queryClient.invalidateQueries({ queryKey: ['purchase_order', data.id] });
      toast.success('発注書のステータスを更新しました');
    },
    onError: (error) => {
      toast.error('ステータスの更新に失敗しました: ' + error.message);
    },
  });
}

export function useDeletePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Delete items first
      await supabase.from('purchase_order_items').delete().eq('purchase_order_id', id);

      const { error } = await supabase
        .from('purchase_orders')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase_orders'] });
      toast.success('発注書を削除しました');
    },
    onError: (error) => {
      toast.error('発注書の削除に失敗しました: ' + error.message);
    },
  });
}
