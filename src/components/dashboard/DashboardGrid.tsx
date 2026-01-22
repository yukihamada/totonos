import { DashboardWidgetConfig } from "@/config/dashboard-widgets";
import { WidgetRenderer } from "./WidgetRenderer";
import { cn } from "@/lib/utils";

interface DashboardGridProps {
  widgets: DashboardWidgetConfig[];
  stats?: {
    monthlyInvoiced?: number;
    totalInvoiced?: number;
    unpaidAmount?: number;
    unpaidCount?: number;
    overdueAmount?: number;
    overdueCount?: number;
    pipelineValue?: number;
    dealsCount?: number;
    wonDealsValue?: number;
    monthlyRevenue?: { month: string; amount: number; paid: number }[];
    pipelineByStage?: { stage: string; value: number; count: number }[];
  };
  clientsCount?: number;
  isLoading?: boolean;
}

export function DashboardGrid({ widgets, stats, clientsCount, isLoading }: DashboardGridProps) {
  // Separate widgets by size for layout
  const smallWidgets = widgets.filter((w) => w.size === "small");
  const mediumWidgets = widgets.filter((w) => w.size === "medium");
  const largeWidgets = widgets.filter((w) => w.size === "large");

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Small widgets row - KPI cards */}
      {smallWidgets.length > 0 && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5 md:gap-4">
          {smallWidgets.map((widget) => (
            <div
              key={widget.id}
              className={cn(
                smallWidgets.length === 5 && smallWidgets.indexOf(widget) === 4
                  ? "col-span-2 md:col-span-1"
                  : ""
              )}
            >
              <WidgetRenderer
                widget={widget}
                stats={stats}
                clientsCount={clientsCount}
                isLoading={isLoading}
              />
            </div>
          ))}
        </div>
      )}

      {/* Large widgets row - Charts */}
      {largeWidgets.length > 0 && (
        <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
          {largeWidgets.map((widget) => (
            <WidgetRenderer
              key={widget.id}
              widget={widget}
              stats={stats}
              clientsCount={clientsCount}
              isLoading={isLoading}
            />
          ))}
        </div>
      )}

      {/* Medium widgets row - Alerts and feeds */}
      {mediumWidgets.length > 0 && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 md:gap-6">
          {mediumWidgets.map((widget) => (
            <WidgetRenderer
              key={widget.id}
              widget={widget}
              stats={stats}
              clientsCount={clientsCount}
              isLoading={isLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
}
