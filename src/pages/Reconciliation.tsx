import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeftRight, Construction, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Reconciliation() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <ArrowLeftRight className="h-8 w-8" />
              自動消込
            </h1>
            <p className="text-muted-foreground">
              入金と請求書の自動マッチング
            </p>
          </div>
        </div>

        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Construction className="h-16 w-16 text-muted-foreground mb-6" />
            <h2 className="text-2xl font-bold mb-2">準備中</h2>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              自動消込機能は現在開発中です。
              銀行口座連携機能の完成後にご利用いただけます。
            </p>
            <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
              <p>予定機能:</p>
              <ul className="list-disc list-inside">
                <li>入金明細と請求書の自動マッチング</li>
                <li>AIによる消込候補の提案</li>
                <li>一括消込処理</li>
                <li>消込履歴の管理</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
