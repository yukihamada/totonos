import { useState } from 'react';
import { format, addDays } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  AlertTriangle,
  Package,
  ShoppingCart,
  Truck,
  ChevronDown,
  ChevronUp,
  Building2,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useGroupedReorderSuggestions,
  useCreateAutoReorder,
  type GroupedReorderSuggestion,
} from '@/hooks/useAutoReorder';
import type { Product } from '@/hooks/useProducts';

interface SupplierGroupCardProps {
  group: GroupedReorderSuggestion;
  onCreateOrder: (group: GroupedReorderSuggestion) => void;
  isCreating: boolean;
}

function SupplierGroupCard({ group, onCreateOrder, isCreating }: SupplierGroupCardProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle className="text-lg">
                  {group.supplierName || '仕入先未設定'}
                </CardTitle>
                <CardDescription>
                  {group.products.length}商品 · 合計 ¥{group.totalAmount.toLocaleString()}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => onCreateOrder(group)}
                disabled={isCreating}
                size="sm"
              >
                {isCreating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ShoppingCart className="mr-2 h-4 w-4" />
                )}
                発注書を作成
              </Button>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon">
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {group.products.map(({ product, suggestedQuantity }) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  suggestedQuantity={suggestedQuantity}
                />
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

interface ProductRowProps {
  product: Product;
  suggestedQuantity: number;
}

function ProductRow({ product, suggestedQuantity }: ProductRowProps) {
  const stockPercentage = product.reorder_point
    ? Math.min(100, (product.stock_quantity / product.reorder_point) * 100)
    : 0;
  
  const isOutOfStock = product.stock_quantity === 0;
  const isCritical = stockPercentage < 30;

  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
          <Package className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{product.name}</span>
            {isOutOfStock ? (
              <Badge variant="destructive">在庫切れ</Badge>
            ) : isCritical ? (
              <Badge variant="outline" className="border-destructive text-destructive">
                残りわずか
              </Badge>
            ) : null}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>SKU: {product.sku}</span>
            {product.jan_code && <span>· JAN: {product.jan_code}</span>}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-right">
          <div className="text-sm text-muted-foreground">現在庫</div>
          <div className="font-medium">
            {product.stock_quantity} {product.unit || '個'}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">発注点</div>
          <div className="font-medium">
            {product.reorder_point} {product.unit || '個'}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">発注数</div>
          <div className="font-medium text-primary">
            {suggestedQuantity} {product.unit || '個'}
          </div>
        </div>
        <div className="text-right w-20">
          <div className="text-sm text-muted-foreground">金額</div>
          <div className="font-medium">
            ¥{((product.cost || product.price) * suggestedQuantity).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AutoReorderPanel() {
  const { data: groups = [], isLoading, totalProducts, refetch } = useGroupedReorderSuggestions();
  const createAutoReorder = useCreateAutoReorder();
  const [selectedGroup, setSelectedGroup] = useState<GroupedReorderSuggestion | null>(null);
  const [deliveryDate, setDeliveryDate] = useState(
    format(addDays(new Date(), 3), 'yyyy-MM-dd')
  );

  const handleCreateOrder = (group: GroupedReorderSuggestion) => {
    setSelectedGroup(group);
  };

  const confirmCreateOrder = async () => {
    if (!selectedGroup) return;
    
    await createAutoReorder.mutateAsync({
      supplierId: selectedGroup.supplierId,
      products: selectedGroup.products,
      deliveryDate,
    });
    
    setSelectedGroup(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (groups.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                自動発注
              </CardTitle>
              <CardDescription>発注点を下回った商品はありません</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              更新
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Package className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>すべての商品の在庫が発注点を上回っています</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalAmount = groups.reduce((sum, g) => sum + g.totalAmount, 0);

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                発注が必要な商品
              </CardTitle>
              <CardDescription>
                {totalProducts}商品が発注点を下回っています
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-muted-foreground">合計発注額（税抜）</div>
                <div className="text-2xl font-bold">¥{totalAmount.toLocaleString()}</div>
              </div>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                更新
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {groups.map((group) => (
          <SupplierGroupCard
            key={group.supplierId || 'no-supplier'}
            group={group}
            onCreateOrder={handleCreateOrder}
            isCreating={createAutoReorder.isPending}
          />
        ))}
      </div>

      {/* 発注確認ダイアログ */}
      <Dialog open={!!selectedGroup} onOpenChange={() => setSelectedGroup(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>発注書を作成</DialogTitle>
            <DialogDescription>
              {selectedGroup?.supplierName || '仕入先未設定'}への発注書を作成します
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="delivery-date">希望納品日</Label>
              <Input
                id="delivery-date"
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
              />
            </div>
            <div className="bg-muted rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">発注商品数</span>
                <span className="font-medium">{selectedGroup?.products.length}点</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">小計</span>
                <span className="font-medium">
                  ¥{selectedGroup?.totalAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">消費税(10%)</span>
                <span className="font-medium">
                  ¥{Math.floor((selectedGroup?.totalAmount || 0) * 0.1).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="font-medium">合計</span>
                <span className="font-bold text-lg">
                  ¥{Math.floor((selectedGroup?.totalAmount || 0) * 1.1).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedGroup(null)}>
              キャンセル
            </Button>
            <Button onClick={confirmCreateOrder} disabled={createAutoReorder.isPending}>
              {createAutoReorder.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ShoppingCart className="mr-2 h-4 w-4" />
              )}
              発注書を作成
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
