import { Link } from 'react-router-dom';
import { Package, ArrowLeft, Settings } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { AutoReorderPanel } from '@/components/inventory/AutoReorderPanel';

export default function AutoReorder() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/products">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Package className="h-8 w-8" />
                自動発注
              </h1>
              <p className="text-muted-foreground">
                在庫が発注点を下回った商品を確認し、発注書を自動生成します
              </p>
            </div>
          </div>
          <Button variant="outline" asChild>
            <Link to="/products">
              <Settings className="mr-2 h-4 w-4" />
              商品設定
            </Link>
          </Button>
        </div>

        {/* Auto Reorder Panel */}
        <AutoReorderPanel />
      </div>
    </AppLayout>
  );
}
