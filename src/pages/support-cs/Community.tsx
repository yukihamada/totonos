import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";

export default function Community() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">コミュニティ</h1>
          <Button><Plus className="h-4 w-4 mr-2" />投稿作成</Button>
        </div>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />コミュニティフォーラム</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">投稿がまだありません</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
