import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Map } from "lucide-react";

export default function SkillMap() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">スキルマップ</h1>
          <Button><Plus className="h-4 w-4 mr-2" />スキル追加</Button>
        </div>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Map className="h-5 w-5" />スキル管理</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">スキルがまだ登録されていません</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
