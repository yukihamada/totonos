import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  description?: string;
  icon?: ReactNode;
  trend?: {
    value: string;
    positive: boolean;
  };
  className?: string;
  isLoading?: boolean;
}

export function StatsCard({ 
  title, 
  value, 
  description, 
  icon, 
  trend,
  className,
  isLoading = false
}: StatsCardProps) {
  return (
    <Card className={cn("border-2 border-foreground", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-20 mb-1" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        <div className="flex items-center gap-2 mt-1">
          {isLoading ? (
            <Skeleton className="h-4 w-16" />
          ) : (
            <>
              {trend && (
                <span className={cn(
                  "text-sm font-medium",
                  trend.positive ? "text-chart-2" : "text-destructive"
                )}>
                  {trend.positive ? "+" : ""}{trend.value}
                </span>
              )}
              {description && (
                <span className="text-xs text-muted-foreground">
                  {description}
                </span>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
