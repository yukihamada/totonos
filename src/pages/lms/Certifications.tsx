import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Award } from "lucide-react";

export default function Certifications() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">資格管理</h1>
          <Button><Plus className="h-4 w-4 mr-2" />資格登録</Button>
        </div>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Award className="h-5 w-5" />資格一覧</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">資格がまだ登録されていません</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
