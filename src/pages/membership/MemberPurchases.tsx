import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function MemberPurchases() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">物販</h1>
          <Button><Plus className="h-4 w-4 mr-2" />新規販売</Button>
        </div>
        <Card>
          <CardHeader><CardTitle>売上履歴</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">販売履歴がありません</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
