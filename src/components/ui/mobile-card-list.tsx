import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface MobileCardListProps<T> {
  data: T[];
  renderCard: (item: T, index: number) => React.ReactNode;
  renderTable: () => React.ReactNode;
  className?: string;
  emptyState?: React.ReactNode;
}

export function MobileCardList<T>({ 
  data, 
  renderCard, 
  renderTable,
  className,
  emptyState
}: MobileCardListProps<T>) {
  const isMobile = useIsMobile();

  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  if (isMobile) {
    return (
      <div className={cn("space-y-3", className)}>
        {data.map((item, index) => (
          <React.Fragment key={index}>
            {renderCard(item, index)}
          </React.Fragment>
        ))}
      </div>
    );
  }

  return <>{renderTable()}</>;
}

interface MobileCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function MobileCard({ children, onClick, className }: MobileCardProps) {
  return (
    <Card 
      className={cn(
        "p-4 active:bg-muted/50 transition-colors",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </Card>
  );
}

interface MobileCardRowProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

export function MobileCardRow({ label, value, className }: MobileCardRowProps) {
  return (
    <div className={cn("flex justify-between items-center py-1", className)}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

interface MobileCardHeaderProps {
  title: React.ReactNode;
  badge?: React.ReactNode;
  subtitle?: React.ReactNode;
  className?: string;
}

export function MobileCardHeader({ title, badge, subtitle, className }: MobileCardHeaderProps) {
  return (
    <div className={cn("mb-3", className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{title}</div>
          {subtitle && (
            <div className="text-sm text-muted-foreground truncate">{subtitle}</div>
          )}
        </div>
        {badge}
      </div>
    </div>
  );
}

interface MobileCardActionsProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileCardActions({ children, className }: MobileCardActionsProps) {
  return (
    <div className={cn("flex gap-2 mt-3 pt-3 border-t", className)}>
      {children}
    </div>
  );
}
