import { Badge } from "@/components/ui/badge";
import type { VisitType } from "@/types/emr";

interface VisitTypeIndicatorProps {
  visitType: VisitType;
  size?: "sm" | "md";
}

const visitTypeConfig: Record<VisitType, { label: string; bgColor: string; textColor: string }> = {
  first_visit: {
    label: "新患",
    bgColor: "bg-blue-500",
    textColor: "text-white",
  },
  return_visit: {
    label: "再診",
    bgColor: "bg-green-500",
    textColor: "text-white",
  },
};

export function VisitTypeIndicator({ visitType, size = "md" }: VisitTypeIndicatorProps) {
  const config = visitTypeConfig[visitType];
  const sizeClass = size === "sm" ? "text-[10px] px-1.5 py-0" : "text-xs px-2 py-0.5";

  return (
    <Badge className={`${config.bgColor} ${config.textColor} ${sizeClass} font-medium`}>
      {config.label}
    </Badge>
  );
}

export function getVisitTypeLabel(visitType: VisitType): string {
  return visitTypeConfig[visitType].label;
}
