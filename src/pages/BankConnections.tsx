import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Construction, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BankConnections() {
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
              <Building2 className="h-8 w-8" />
              銀行口座連携
            </h1>
            <p className="text-muted-foreground">
              銀行口座との連携・自動明細取込
            </p>
          </div>
        </div>

        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Construction className="h-16 w-16 text-muted-foreground mb-6" />
            <h2 className="text-2xl font-bold mb-2">準備中</h2>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              銀行口座連携機能は現在開発中です。
              近日公開予定ですので、しばらくお待ちください。
            </p>
            <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
              <p>予定機能:</p>
              <ul className="list-disc list-inside">
                <li>銀行口座のAPI連携</li>
                <li>自動明細取込</li>
                <li>残高確認</li>
                <li>取引履歴の同期</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
