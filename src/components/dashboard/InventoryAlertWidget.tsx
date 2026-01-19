import { Link } from 'react-router-dom';
import { Package, AlertTriangle, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useReorderSuggestions } from '@/hooks/useAutoReorder';

export function InventoryAlertWidget() {
  const { data: suggestions = [], isLoading } = useReorderSuggestions();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return null; // Don't show if no alerts
  }

  const outOfStockCount = suggestions.filter(s => s.product.stock_quantity === 0).length;
  const lowStockCount = suggestions.length - outOfStockCount;
  const totalAmount = suggestions.reduce(
    (sum, s) => sum + (s.product.cost || s.product.price) * s.suggestedQuantity,
    0
  );

  return (
    <Card className="border-destructive/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-lg">在庫アラート</CardTitle>
          </div>
          <Button size="sm" variant="outline" asChild>
            <Link to="/auto-reorder">
              自動発注
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <CardDescription>
          {suggestions.length}商品が発注点を下回っています
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          {outOfStockCount > 0 && (
            <Badge variant="destructive" className="gap-1">
              <Package className="h-3 w-3" />
              在庫切れ {outOfStockCount}件
            </Badge>
          )}
          {lowStockCount > 0 && (
            <Badge variant="outline" className="gap-1 border-destructive text-destructive">
              残りわずか {lowStockCount}件
            </Badge>
          )}
        </div>
        <div className="space-y-2">
          {suggestions.slice(0, 3).map((suggestion) => (
            <div
              key={suggestion.product.id}
              className="flex items-center justify-between py-2 border-b last:border-0"
            >
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">{suggestion.product.name}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                残 {suggestion.product.stock_quantity} {suggestion.product.unit || '個'}
              </div>
            </div>
          ))}
          {suggestions.length > 3 && (
            <div className="text-center pt-2">
              <Button variant="link" size="sm" asChild>
                <Link to="/auto-reorder">
                  他 {suggestions.length - 3}件を確認
                </Link>
              </Button>
            </div>
          )}
        </div>
        <div className="mt-4 pt-4 border-t flex justify-between items-center">
          <span className="text-sm text-muted-foreground">推定発注額（税抜）</span>
          <span className="font-bold">¥{totalAmount.toLocaleString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}
