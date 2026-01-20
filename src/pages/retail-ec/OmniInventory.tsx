import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Package } from "lucide-react";

export default function OmniInventory() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">オムニチャネル在庫</h1>
          <Button variant="outline"><RefreshCw className="h-4 w-4 mr-2" />在庫同期</Button>
        </div>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" />統合在庫</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">在庫データがまだありません</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
