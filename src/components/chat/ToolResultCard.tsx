import { ToolResult } from "@/types/chat";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, FileText, Users, Calculator, Building, Book, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolResultCardProps {
  result: ToolResult;
}

const toolIcons: Record<string, React.ElementType> = {
  contracts: FileText,
  crm: Users,
  accounting: Calculator,
  hr: Building,
  wiki: Book,
  it_assets: Monitor,
};

function getToolCategory(toolName: string): string {
  if (toolName.includes('contract')) return 'contracts';
  if (toolName.includes('lead') || toolName.includes('deal') || toolName.includes('activity')) return 'crm';
  if (toolName.includes('journal') || toolName.includes('account') || toolName.includes('expense') || toolName.includes('balance') || toolName.includes('income')) return 'accounting';
  if (toolName.includes('employee') || toolName.includes('attendance') || toolName.includes('payroll') || toolName.includes('clock')) return 'hr';
  if (toolName.includes('wiki')) return 'wiki';
  if (toolName.includes('asset')) return 'it_assets';
  return 'contracts';
}

function formatToolName(name: string): string {
  return name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatResultSummary(result: unknown): string {
  if (Array.isArray(result)) {
    return `${result.length}件の結果`;
  }
  if (typeof result === 'object' && result !== null) {
    const obj = result as Record<string, unknown>;
    if ('success' in obj) {
      return obj.success ? '成功' : '失敗';
    }
    if ('count' in obj) {
      return `${obj.count}件`;
    }
    if ('message' in obj) {
      return String(obj.message);
    }
  }
  return '完了';
}

export function ToolResultCard({ result }: ToolResultCardProps) {
  const category = getToolCategory(result.toolName);
  const Icon = toolIcons[category] || FileText;

  return (
    <Card
      className={cn(
        "p-3 text-xs",
        result.isError ? "border-destructive/50 bg-destructive/5" : "border-primary/20 bg-primary/5"
      )}
    >
      <div className="flex items-start gap-2">
        <div
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded",
            result.isError ? "bg-destructive/20" : "bg-primary/20"
          )}
        >
          <Icon className="h-3 w-3" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium truncate">
              {formatToolName(result.toolName)}
            </span>
            <Badge
              variant={result.isError ? "destructive" : "secondary"}
              className="h-4 text-[10px]"
            >
              {result.isError ? (
                <XCircle className="h-2.5 w-2.5 mr-1" />
              ) : (
                <CheckCircle className="h-2.5 w-2.5 mr-1" />
              )}
              {result.isError ? 'エラー' : '完了'}
            </Badge>
          </div>
          <p className="text-muted-foreground truncate">
            {formatResultSummary(result.result)}
          </p>
        </div>
      </div>
    </Card>
  );
}
