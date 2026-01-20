import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";

export default function CorporateRegistry() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">登記管理</h1>
          <Button><Plus className="h-4 w-4 mr-2" />登記追加</Button>
        </div>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />登記情報</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">登記情報がまだ登録されていません</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
