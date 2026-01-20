import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Mail } from "lucide-react";

export default function EmailMarketing() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">メールマーケティング</h1>
          <Button><Plus className="h-4 w-4 mr-2" />新規キャンペーン</Button>
        </div>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5" />メールキャンペーン</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">キャンペーンがまだありません</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
