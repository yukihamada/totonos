import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Product {
  id: string;
  user_id: string;
  company_id: string | null;
  sku: string;
  jan_code: string | null;
  name: string;
  name_kana: string | null;
  description: string | null;
  category: string | null;
  price: number;
  cost: number | null;
  tax_rate: number | null;
  stock_quantity: number;
  min_stock: number | null;
  reorder_point: number | null;
  reorder_quantity: number | null;
  unit: string | null;
  location: string | null;
  supplier_id: string | null;
  supplier_product_code: string | null;
  lead_time_days: number | null;
  status: 'active' | 'inactive' | 'discontinued';
  is_inventory_managed: boolean | null;
  barcode_image_url: string | null;
  notes: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  // Joined data
  supplier?: {
    id: string;
    name: string;
  } | null;
}

export interface ProductFormData {
  sku: string;
  jan_code?: string | null;
  name: string;
  name_kana?: string | null;
  description?: string | null;
  category?: string | null;
  price: number;
  cost?: number | null;
  tax_rate?: number | null;
  stock_quantity?: number;
  min_stock?: number | null;
  reorder_point?: number | null;
  reorder_quantity?: number | null;
  unit?: string | null;
  location?: string | null;
  supplier_id?: string | null;
  supplier_product_code?: string | null;
  lead_time_days?: number | null;
  status?: 'active' | 'inactive' | 'discontinued';
  is_inventory_managed?: boolean | null;
  notes?: string | null;
}

export interface InventoryTransaction {
  id: string;
  user_id: string;
  company_id: string | null;
  product_id: string;
  transaction_type: string;
  quantity: number;
  quantity_before: number;
  quantity_after: number;
  unit_price: number | null;
  total_amount: number | null;
  reference_type: string | null;
  reference_id: string | null;
  notes: string | null;
  performed_by: string | null;
  transaction_date: string;
  created_at: string;
  product?: Product;
}

export interface InventoryAlert {
  id: string;
  user_id: string;
  company_id: string | null;
  product_id: string;
  alert_type: 'low_stock' | 'out_of_stock' | 'reorder_needed' | 'overstock';
  threshold_value: number | null;
  current_value: number | null;
  status: 'active' | 'acknowledged' | 'resolved';
  acknowledged_at: string | null;
  acknowledged_by: string | null;
  resolved_at: string | null;
  auto_purchase_order_id: string | null;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export function useProducts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const productsQuery = useQuery({
    queryKey: ['products', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          supplier:clients!products_supplier_id_fkey(id, name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Product[];
    },
    enabled: !!user?.id,
  });

  const createProduct = useMutation({
    mutationFn: async (formData: ProductFormData) => {
      if (!user?.id) throw new Error('ユーザーが認証されていません');

      const { data, error } = await supabase
        .from('products')
        .insert({
          user_id: user.id,
          ...formData,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('商品を追加しました');
    },
    onError: (error: Error) => {
      toast.error(`商品の追加に失敗しました: ${error.message}`);
    },
  });

  const updateProduct = useMutation({
    mutationFn: async ({ id, ...formData }: ProductFormData & { id: string }) => {
      if (!user?.id) throw new Error('ユーザーが認証されていません');

      const { data, error } = await supabase
        .from('products')
        .update(formData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('商品を更新しました');
    },
    onError: (error: Error) => {
      toast.error(`商品の更新に失敗しました: ${error.message}`);
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error('ユーザーが認証されていません');

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('商品を削除しました');
    },
    onError: (error: Error) => {
      toast.error(`商品の削除に失敗しました: ${error.message}`);
    },
  });

  const updateStock = useMutation({
    mutationFn: async ({
      productId,
      quantity,
      transactionType,
      notes,
      unitPrice,
    }: {
      productId: string;
      quantity: number;
      transactionType: string;
      notes?: string;
      unitPrice?: number;
    }) => {
      if (!user?.id) throw new Error('ユーザーが認証されていません');

      // Get current stock
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', productId)
        .eq('user_id', user.id)
        .single();

      if (productError) throw productError;

      const quantityBefore = product.stock_quantity;
      const quantityAfter = quantityBefore + quantity;

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('inventory_transactions')
        .insert({
          user_id: user.id,
          product_id: productId,
          transaction_type: transactionType,
          quantity,
          quantity_before: quantityBefore,
          quantity_after: quantityAfter,
          unit_price: unitPrice,
          total_amount: unitPrice ? Math.abs(quantity) * unitPrice : null,
          notes,
          performed_by: user.id,
        });

      if (transactionError) throw transactionError;

      // Update stock
      const { data, error } = await supabase
        .from('products')
        .update({ stock_quantity: quantityAfter })
        .eq('id', productId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-alerts'] });
      toast.success('在庫を更新しました');
    },
    onError: (error: Error) => {
      toast.error(`在庫の更新に失敗しました: ${error.message}`);
    },
  });

  return {
    products: productsQuery.data ?? [],
    isLoading: productsQuery.isLoading,
    error: productsQuery.error,
    createProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    refetch: productsQuery.refetch,
  };
}

export function useInventoryAlerts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const alertsQuery = useQuery({
    queryKey: ['inventory-alerts', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('inventory_alerts')
        .select(`
          *,
          product:products(id, name, sku, jan_code, stock_quantity, reorder_point, unit)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as (InventoryAlert & { product: Product })[];
    },
    enabled: !!user?.id,
  });

  const acknowledgeAlert = useMutation({
    mutationFn: async (alertId: string) => {
      if (!user?.id) throw new Error('ユーザーが認証されていません');

      const { error } = await supabase
        .from('inventory_alerts')
        .update({
          status: 'acknowledged',
          acknowledged_at: new Date().toISOString(),
          acknowledged_by: user.id,
        })
        .eq('id', alertId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-alerts'] });
      toast.success('アラートを確認しました');
    },
  });

  return {
    alerts: alertsQuery.data ?? [],
    isLoading: alertsQuery.isLoading,
    error: alertsQuery.error,
    acknowledgeAlert,
    refetch: alertsQuery.refetch,
  };
}

export function useInventoryTransactions(productId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['inventory-transactions', user?.id, productId],
    queryFn: async () => {
      if (!user?.id) return [];
      
      let query = supabase
        .from('inventory_transactions')
        .select(`
          *,
          product:products(id, name, sku, jan_code)
        `)
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false })
        .limit(100);

      if (productId) {
        query = query.eq('product_id', productId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as (InventoryTransaction & { product: Product })[];
    },
    enabled: !!user?.id,
  });
}

export function useLowStockProducts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['low-stock-products', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_inventory_managed', true)
        .eq('status', 'active')
        .or('stock_quantity.lte.reorder_point,stock_quantity.eq.0')
        .order('stock_quantity', { ascending: true });

      if (error) throw error;
      return data as Product[];
    },
    enabled: !!user?.id,
  });
}
