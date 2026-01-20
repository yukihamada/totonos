import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, ShoppingCart } from "lucide-react";

export default function CloudPOS() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">クラウドPOS</h1>
          <Button variant="outline"><Settings className="h-4 w-4 mr-2" />設定</Button>
        </div>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><ShoppingCart className="h-5 w-5" />レジ画面</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">POSがまだ設定されていません</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
