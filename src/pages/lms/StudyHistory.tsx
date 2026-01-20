import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History } from "lucide-react";

export default function StudyHistory() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">受講履歴</h1>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><History className="h-5 w-5" />学習履歴</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">受講履歴がまだありません</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
