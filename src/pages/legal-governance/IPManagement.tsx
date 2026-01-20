import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Lightbulb } from "lucide-react";

export default function IPManagement() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">知財管理</h1>
          <Button><Plus className="h-4 w-4 mr-2" />知財登録</Button>
        </div>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Lightbulb className="h-5 w-5" />知的財産一覧</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">知財がまだ登録されていません</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
