import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, HelpCircle } from "lucide-react";

export default function HelpCenter() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">ヘルプセンター</h1>
          <Button><Plus className="h-4 w-4 mr-2" />記事作成</Button>
        </div>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><HelpCircle className="h-5 w-5" />ヘルプ記事</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">ヘルプ記事がまだありません</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
