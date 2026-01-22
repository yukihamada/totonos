import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Send, CheckCircle, AlertCircle } from "lucide-react";
import { useEmrDashboardStats } from "@/hooks/useEmrDashboardStats";
import { Skeleton } from "@/components/ui/skeleton";

export function InsuranceClaimsWidget() {
  const { data: stats, isLoading } = useEmrDashboardStats();

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">保険請求状況</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    );
  }

  const totalReceipts = stats?.monthlyReceiptCount || 0;
  const totalPoints = stats?.monthlyTotalPoints || 0;
  const draft = stats?.draftCount || 0;
  const submitted = stats?.submittedCount || 0;
  const approved = stats?.approvedCount || 0;
  const returned = stats?.returnedCount || 0;

  const totalAmount = totalPoints * 10; // 1点 = 10円

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">保険請求状況</CardTitle>
        <FileText className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">
              {totalPoints.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground">点</span>
          </div>
          <p className="text-xs text-muted-foreground">
            今月 {totalReceipts}件 / ¥{totalAmount.toLocaleString()}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">下書き</p>
              <p className="font-medium">{draft}件</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
            <Send className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-xs text-muted-foreground">提出済み</p>
              <p className="font-medium">{submitted}件</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-xs text-muted-foreground">承認済み</p>
              <p className="font-medium">{approved}件</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <div>
              <p className="text-xs text-muted-foreground">返戻</p>
              <p className="font-medium">{returned}件</p>
            </div>
          </div>
        </div>

        {returned > 0 && (
          <Badge variant="destructive" className="w-full justify-center">
            {returned}件の返戻があります
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
