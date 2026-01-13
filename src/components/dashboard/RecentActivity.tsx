import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, CreditCard, Zap } from "lucide-react";
import { formatCurrency, getStatusColor, getStatusLabel, InvoiceStatus } from "@/types/database";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  type: 'invoice' | 'payment' | 'boost';
  title: string;
  amount: number;
  status?: InvoiceStatus;
  date: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getIcon = (type: Activity['type']) => {
    switch (type) {
      case 'invoice': return <FileText className="h-4 w-4" />;
      case 'payment': return <CreditCard className="h-4 w-4" />;
      case 'boost': return <Zap className="h-4 w-4" />;
    }
  };

  return (
    <Card className="border-2 border-foreground">
      <CardHeader>
        <CardTitle className="text-lg">最近のアクティビティ</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              アクティビティはありません
            </p>
          ) : (
            activities.map((activity) => (
              <div 
                key={activity.id} 
                className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center border border-border bg-muted">
                    {getIcon(activity.type)}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(activity.amount)}</p>
                  {activity.status && (
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs", getStatusColor(activity.status))}
                    >
                      {getStatusLabel(activity.status)}
                    </Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
