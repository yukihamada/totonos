import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Smartphone } from "lucide-react";

export default function MemberApp() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">会員アプリ</h1>
          <Button variant="outline"><Settings className="h-4 w-4 mr-2" />設定</Button>
        </div>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Smartphone className="h-5 w-5" />アプリ設定</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">会員アプリがまだ設定されていません</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
