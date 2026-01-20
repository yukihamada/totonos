import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, UserCheck } from "lucide-react";

export default function MemberCheckins() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">チェックイン</h1>
          <div className="flex gap-2">
            <Button variant="outline"><QrCode className="h-4 w-4 mr-2" />QRスキャン</Button>
            <Button><UserCheck className="h-4 w-4 mr-2" />手動チェックイン</Button>
          </div>
        </div>
        <Card>
          <CardHeader><CardTitle>本日のチェックイン履歴</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">本日のチェックイン履歴がありません</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
