import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Target } from "lucide-react";

export default function AdManagement() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">広告管理</h1>
          <Button><Plus className="h-4 w-4 mr-2" />広告連携</Button>
        </div>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" />広告キャンペーン</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">広告がまだ連携されていません</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
