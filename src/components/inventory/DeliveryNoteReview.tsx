import { useState } from "react";
import { Check, AlertCircle, Package, Link2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  useDeliveryNoteDetail, 
  useApplyDeliveryNote, 
  useUpdateDeliveryNoteItem 
} from "@/hooks/useDeliveryNotes";
import { useProducts } from "@/hooks/useProducts";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

interface DeliveryNoteReviewProps {
  deliveryNoteId: string;
  onComplete?: () => void;
}

export function DeliveryNoteReview({ deliveryNoteId, onComplete }: DeliveryNoteReviewProps) {
  const { data: deliveryNote, isLoading } = useDeliveryNoteDetail(deliveryNoteId);
  const { products } = useProducts();
  const applyDeliveryNote = useApplyDeliveryNote();
  const updateItem = useUpdateDeliveryNoteItem();
  const [selectedProducts, setSelectedProducts] = useState<Record<string, string>>({});

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!deliveryNote) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>エラー</AlertTitle>
        <AlertDescription>納品書が見つかりません</AlertDescription>
      </Alert>
    );
  }

  const items = deliveryNote.items || [];
  const matchedCount = items.filter((item: { is_matched: boolean }) => item.is_matched).length;
  const isApplied = deliveryNote.status === 'applied';

  const handleProductSelect = async (itemId: string, productId: string) => {
    setSelectedProducts(prev => ({ ...prev, [itemId]: productId }));
    
    await updateItem.mutateAsync({
      itemId,
      productId: productId === 'none' ? null : productId,
      isMatched: productId !== 'none',
    });
  };

  const handleApply = async () => {
    await applyDeliveryNote.mutateAsync(deliveryNoteId);
    onComplete?.();
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>
                納品書 {deliveryNote.delivery_note_number || '番号なし'}
              </CardTitle>
              <CardDescription className="mt-1">
                {deliveryNote.supplier_name || '仕入先不明'}
              </CardDescription>
            </div>
            <Badge variant={isApplied ? 'default' : 'secondary'}>
              {isApplied ? '在庫反映済み' : '確認待ち'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">納品日</p>
              <p className="font-medium">
                {deliveryNote.delivery_date 
                  ? format(new Date(deliveryNote.delivery_date), 'yyyy年M月d日', { locale: ja })
                  : '-'
                }
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">小計</p>
              <p className="font-medium">
                ¥{deliveryNote.subtotal?.toLocaleString() ?? '-'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">消費税</p>
              <p className="font-medium">
                ¥{deliveryNote.tax_amount?.toLocaleString() ?? '-'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">合計</p>
              <p className="font-medium text-lg">
                ¥{deliveryNote.total_amount?.toLocaleString() ?? '-'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Match Status */}
      <Alert variant={matchedCount === items.length ? 'default' : 'destructive'}>
        <Package className="h-4 w-4" />
        <AlertTitle>商品マッチング状況</AlertTitle>
        <AlertDescription>
          {items.length}件中 {matchedCount}件の商品がマッチしました
          {matchedCount < items.length && (
            <span className="block mt-1 text-sm">
              マッチしていない商品は手動で選択してください
            </span>
          )}
        </AlertDescription>
      </Alert>

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">商品明細</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>状態</TableHead>
                <TableHead>JANコード</TableHead>
                <TableHead>商品名（納品書）</TableHead>
                <TableHead>マッチ商品</TableHead>
                <TableHead className="text-right">数量</TableHead>
                <TableHead className="text-right">単価</TableHead>
                <TableHead className="text-right">金額</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item: {
                id: string;
                is_matched: boolean;
                jan_code: string | null;
                product_name: string | null;
                product_id: string | null;
                product?: { id: string; name: string; sku: string } | null;
                quantity: number;
                unit_price: number | null;
                amount: number | null;
              }) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.is_matched ? (
                      <Badge variant="default" className="gap-1">
                        <Check className="h-3 w-3" />
                        マッチ
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1">
                        <Link2 className="h-3 w-3" />
                        未マッチ
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {item.jan_code || '-'}
                  </TableCell>
                  <TableCell>{item.product_name || '-'}</TableCell>
                  <TableCell>
                    {isApplied ? (
                      item.product?.name || '-'
                    ) : (
                      <Select
                        value={selectedProducts[item.id] || item.product_id || 'none'}
                        onValueChange={(value) => handleProductSelect(item.id, value)}
                        disabled={updateItem.isPending}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="商品を選択" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">（マッチなし）</SelectItem>
                          {products.map(product => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} ({product.sku})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    ¥{item.unit_price?.toLocaleString() ?? '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    ¥{item.amount?.toLocaleString() ?? '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        {!isApplied && matchedCount > 0 && (
          <CardFooter className="border-t pt-4">
            <div className="flex items-center justify-between w-full">
              <p className="text-sm text-muted-foreground">
                {matchedCount}件の商品の在庫を更新します
              </p>
              <Button 
                onClick={handleApply}
                disabled={applyDeliveryNote.isPending}
              >
                {applyDeliveryNote.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                在庫に反映
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
