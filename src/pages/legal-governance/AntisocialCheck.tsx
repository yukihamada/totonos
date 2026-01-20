import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Shield } from "lucide-react";

export default function AntisocialCheck() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">反社チェック</h1>
          <Button><Search className="h-4 w-4 mr-2" />新規チェック</Button>
        </div>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />チェック履歴</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">チェック履歴がありません</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
