import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Share2 } from "lucide-react";

export default function SNSManagement() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">SNS管理</h1>
          <Button><Plus className="h-4 w-4 mr-2" />アカウント連携</Button>
        </div>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Share2 className="h-5 w-5" />SNSアカウント</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">SNSアカウントがまだ連携されていません</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
