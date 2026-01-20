import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Layout } from "lucide-react";

export default function LPBuilder() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">LPビルダー</h1>
          <Button><Plus className="h-4 w-4 mr-2" />新規LP</Button>
        </div>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Layout className="h-5 w-5" />ランディングページ</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">LPがまだありません</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
