import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Gift } from "lucide-react";

export default function LoyaltyPoints() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">ポイント管理</h1>
          <Button variant="outline"><Settings className="h-4 w-4 mr-2" />ポイント設定</Button>
        </div>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Gift className="h-5 w-5" />ポイント履歴</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">ポイントデータがまだありません</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
