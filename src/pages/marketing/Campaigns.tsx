import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Megaphone } from "lucide-react";

export default function Campaigns() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">キャンペーン管理</h1>
          <Button><Plus className="h-4 w-4 mr-2" />新規キャンペーン</Button>
        </div>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5" />キャンペーン一覧</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">キャンペーンがまだありません</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
