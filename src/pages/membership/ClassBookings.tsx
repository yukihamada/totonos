import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ClassBookings() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">予約管理</h1>
        <Card>
          <CardHeader><CardTitle>予約一覧</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">予約がまだありません</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
