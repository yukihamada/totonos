import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import type { Product } from './useProducts';

export interface ReorderSuggestion {
  product: Product;
  suggestedQuantity: number;
  supplierId: string | null;
  supplierName: string | null;
}

export interface GroupedReorderSuggestion {
  supplierId: string | null;
  supplierName: string | null;
  products: Array<{
    product: Product;
    suggestedQuantity: number;
  }>;
  totalAmount: number;
}

// 発注点を下回った商品を取得
export function useReorderSuggestions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['reorder-suggestions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // 発注点を設定している＆在庫管理している商品で、在庫が発注点以下のものを取得
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          supplier:clients!products_supplier_id_fkey(id, name)
        `)
        .eq('user_id', user.id)
        .eq('is_inventory_managed', true)
        .eq('status', 'active')
        .not('reorder_point', 'is', null)
        .order('stock_quantity', { ascending: true });

      if (error) throw error;
      
      // Filter products below reorder point
      const lowStockProducts = (data || []).filter(
        (p) => p.stock_quantity <= (p.reorder_point || 0)
      );

      // Calculate suggested quantity for each
      const suggestions: ReorderSuggestion[] = lowStockProducts.map((product) => {
        // 発注数量が設定されていればそれを使用、なければ発注点までの差分＋バッファ
        const suggestedQuantity = product.reorder_quantity 
          || Math.max(1, (product.reorder_point || 0) - product.stock_quantity + 10);
        
        return {
          product: product as Product,
          suggestedQuantity,
          supplierId: product.supplier_id,
          supplierName: product.supplier?.name || null,
        };
      });

      return suggestions;
    },
    enabled: !!user?.id,
    refetchInterval: 5 * 60 * 1000, // 5分ごとにチェック
  });
}

// 仕入先ごとにグループ化した発注提案
export function useGroupedReorderSuggestions() {
  const { data: suggestions = [], ...rest } = useReorderSuggestions();

  const grouped = suggestions.reduce<Record<string, GroupedReorderSuggestion>>((acc, item) => {
    const key = item.supplierId || 'no-supplier';
    
    if (!acc[key]) {
      acc[key] = {
        supplierId: item.supplierId,
        supplierName: item.supplierName,
        products: [],
        totalAmount: 0,
      };
    }
    
    const amount = (item.product.cost || item.product.price) * item.suggestedQuantity;
    acc[key].products.push({
      product: item.product,
      suggestedQuantity: item.suggestedQuantity,
    });
    acc[key].totalAmount += amount;
    
    return acc;
  }, {});

  return {
    ...rest,
    data: Object.values(grouped),
    totalProducts: suggestions.length,
  };
}

// 自動発注書生成
export function useCreateAutoReorder() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      supplierId,
      products,
      deliveryDate,
    }: {
      supplierId: string | null;
      products: Array<{
        product: Product;
        suggestedQuantity: number;
      }>;
      deliveryDate?: string;
    }) => {
      if (!user?.id) throw new Error('ユーザーが認証されていません');
      if (products.length === 0) throw new Error('発注する商品がありません');

      // Calculate totals
      const items = products.map((item) => ({
        description: `${item.product.name}${item.product.jan_code ? ` (JAN: ${item.product.jan_code})` : ''} - SKU: ${item.product.sku}`,
        quantity: item.suggestedQuantity,
        unit_price: item.product.cost || item.product.price,
      }));

      const amount = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
      const taxAmount = Math.floor(amount * 0.1);
      const totalAmount = amount + taxAmount;

      // Generate order number
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      const orderNumber = `PO-${year}${month}-${random}`;

      // Create purchase order
      const { data: purchaseOrder, error: poError } = await supabase
        .from('purchase_orders')
        .insert({
          user_id: user.id,
          order_number: orderNumber,
          title: `自動発注 - ${products.map(p => p.product.name).slice(0, 3).join('、')}${products.length > 3 ? '...' : ''}`,
          client_id: supplierId,
          description: `在庫発注点に基づく自動発注\n発注商品数: ${products.length}点`,
          delivery_date: deliveryDate || null,
          amount,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          status: 'draft',
        })
        .select()
        .single();

      if (poError) throw poError;

      // Create purchase order items
      const { error: itemsError } = await supabase
        .from('purchase_order_items')
        .insert(
          items.map((item) => ({
            purchase_order_id: purchaseOrder.id,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            amount: item.quantity * item.unit_price,
          }))
        );

      if (itemsError) throw itemsError;

      // Update inventory alerts to link to this purchase order
      const productIds = products.map((p) => p.product.id);
      await supabase
        .from('inventory_alerts')
        .update({ 
          auto_purchase_order_id: purchaseOrder.id,
          status: 'acknowledged',
          acknowledged_at: new Date().toISOString(),
          acknowledged_by: user.id,
        })
        .in('product_id', productIds)
        .eq('status', 'active')
        .eq('user_id', user.id);

      return purchaseOrder;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['purchase_orders'] });
      queryClient.invalidateQueries({ queryKey: ['reorder-suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-alerts'] });
      toast.success('発注書を作成しました', {
        description: `発注書番号: ${data.order_number}`,
        action: {
          label: '確認する',
          onClick: () => {
            window.location.href = `/purchase-orders/${data.id}`;
          },
        },
      });
    },
    onError: (error: Error) => {
      toast.error(`発注書の作成に失敗しました: ${error.message}`);
    },
  });
}

// 一括自動発注（すべての仕入先に対して発注書を作成）
export function useCreateBulkAutoReorder() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const createAutoReorder = useCreateAutoReorder();

  return useMutation({
    mutationFn: async (groupedSuggestions: GroupedReorderSuggestion[]) => {
      if (!user?.id) throw new Error('ユーザーが認証されていません');
      
      const results = [];
      const errors = [];
      
      for (const group of groupedSuggestions) {
        try {
          const result = await createAutoReorder.mutateAsync({
            supplierId: group.supplierId,
            products: group.products,
          });
          results.push(result);
        } catch (error) {
          errors.push({
            supplier: group.supplierName || '未設定',
            error: error instanceof Error ? error.message : '不明なエラー',
          });
        }
      }

      if (errors.length > 0) {
        throw new Error(`${errors.length}件の発注書作成に失敗しました`);
      }

      return results;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['purchase_orders'] });
      queryClient.invalidateQueries({ queryKey: ['reorder-suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-alerts'] });
      toast.success(`${data.length}件の発注書を作成しました`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
