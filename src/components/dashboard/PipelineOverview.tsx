import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface PipelineOverviewProps {
  data: { stage: string; count: number; value: number }[];
  totalValue: number;
}

export function PipelineOverview({ data, totalValue }: PipelineOverviewProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `¥${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `¥${(value / 1000).toFixed(0)}K`;
    }
    return `¥${value.toLocaleString()}`;
  };

  const colors = [
    'bg-blue-500',
    'bg-yellow-500',
    'bg-orange-500',
    'bg-purple-500',
    'bg-green-500',
  ];

  return (
    <Card className="border-2 border-foreground">
      <CardHeader>
        <CardTitle>パイプライン概要</CardTitle>
        <CardDescription>
          商談ステージ別の状況 (合計: {formatCurrency(totalValue)})
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((item, index) => {
          const percentage = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
          return (
            <div key={item.stage} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{item.stage}</span>
                <span className="text-muted-foreground">
                  {item.count}件 / {formatCurrency(item.value)}
                </span>
              </div>
              <div className="relative">
                <Progress
                  value={percentage}
                  className="h-2"
                />
                <div
                  className={`absolute top-0 left-0 h-2 rounded-full ${colors[index % colors.length]}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
        {data.every(item => item.count === 0) && (
          <div className="text-center py-4 text-muted-foreground">
            商談がありません
          </div>
        )}
      </CardContent>
    </Card>
  );
}
