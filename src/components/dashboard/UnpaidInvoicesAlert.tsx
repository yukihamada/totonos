import { AlertTriangle, Clock, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface UnpaidInvoicesAlertProps {
  unpaidAmount: number;
  unpaidCount: number;
  overdueAmount: number;
  overdueCount: number;
}

export function UnpaidInvoicesAlert({
  unpaidAmount,
  unpaidCount,
  overdueAmount,
  overdueCount,
}: UnpaidInvoicesAlertProps) {
  const hasOverdue = overdueCount > 0;

  if (unpaidCount === 0) {
    return (
      <Card className="border-2 border-foreground bg-green-50 dark:bg-green-950/20">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-600" />
            <CardTitle className="text-lg">未払い請求書なし</CardTitle>
          </div>
          <CardDescription>すべての請求書が入金済みです</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={`border-2 ${hasOverdue ? 'border-destructive bg-destructive/5' : 'border-foreground'}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {hasOverdue ? (
              <AlertTriangle className="h-5 w-5 text-destructive" />
            ) : (
              <Clock className="h-5 w-5 text-muted-foreground" />
            )}
            <CardTitle className="text-lg">未払い請求書</CardTitle>
          </div>
          {hasOverdue && (
            <Badge variant="destructive">
              {overdueCount}件 期限超過
            </Badge>
          )}
        </div>
        <CardDescription>入金待ちの請求書があります</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">未払い合計</p>
            <p className="text-2xl font-bold">¥{unpaidAmount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{unpaidCount}件</p>
          </div>
          {hasOverdue && (
            <div className="space-y-1">
              <p className="text-sm text-destructive">期限超過</p>
              <p className="text-2xl font-bold text-destructive">¥{overdueAmount.toLocaleString()}</p>
              <p className="text-xs text-destructive">{overdueCount}件</p>
            </div>
          )}
        </div>
        <Button asChild className="w-full" variant={hasOverdue ? "destructive" : "default"}>
          <Link to="/invoices">請求書を確認</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
