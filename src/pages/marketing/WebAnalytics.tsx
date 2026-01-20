import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, BarChart3 } from "lucide-react";

export default function WebAnalytics() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Web解析</h1>
          <Button variant="outline"><Settings className="h-4 w-4 mr-2" />設定</Button>
        </div>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" />アクセス解析</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">解析データがまだありません</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
