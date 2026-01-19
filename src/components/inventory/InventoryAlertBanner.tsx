import { useInventoryAlerts } from '@/hooks/useProducts';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Package, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

interface InventoryAlertBannerProps {
  maxItems?: number;
}

export function InventoryAlertBanner({ maxItems = 3 }: InventoryAlertBannerProps) {
  const { alerts, isLoading, acknowledgeAlert } = useInventoryAlerts();

  if (isLoading || alerts.length === 0) {
    return null;
  }

  const displayAlerts = alerts.slice(0, maxItems);
  const remainingCount = alerts.length - maxItems;

  return (
    <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>
        在庫アラート ({alerts.length}件)
      </AlertTitle>
      <AlertDescription>
        <div className="space-y-2 mt-2">
          {displayAlerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-center justify-between gap-4 rounded-md bg-background/50 p-2"
            >
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{alert.product?.name}</span>
                <Badge
                  variant={alert.alert_type === 'out_of_stock' ? 'destructive' : 'secondary'}
                  className="text-xs"
                >
                  {alert.alert_type === 'out_of_stock' ? '在庫切れ' : '在庫少'}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  現在: {alert.current_value}{alert.product?.unit || '個'}
                  {alert.threshold_value && ` / 発注点: ${alert.threshold_value}${alert.product?.unit || '個'}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => acknowledgeAlert.mutate(alert.id)}
                >
                  確認
                </Button>
              </div>
            </div>
          ))}
          
          {remainingCount > 0 && (
            <p className="text-sm text-muted-foreground">
              他 {remainingCount} 件のアラートがあります
            </p>
          )}
          
          <div className="flex gap-2 mt-3">
            <Button variant="outline" size="sm" asChild>
              <Link to="/products">
                <Package className="mr-2 h-4 w-4" />
                在庫管理へ
              </Link>
            </Button>
            <Button variant="default" size="sm" asChild>
              <Link to="/purchase-orders">
                <ShoppingCart className="mr-2 h-4 w-4" />
                発注書を作成
              </Link>
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}
