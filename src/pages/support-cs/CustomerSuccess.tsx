import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, HeartHandshake } from "lucide-react";

export default function CustomerSuccess() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">カスタマーサクセス</h1>
          <Button><Plus className="h-4 w-4 mr-2" />新規タスク</Button>
        </div>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><HeartHandshake className="h-5 w-5" />顧客ヘルススコア</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">顧客データがまだありません</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
