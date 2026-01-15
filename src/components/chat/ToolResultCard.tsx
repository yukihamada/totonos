import { useMemo, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ToolResult } from "@/types/chat";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle,
  XCircle,
  FileText,
  Users,
  Calculator,
  Building,
  Book,
  Monitor,
  ExternalLink,
  Bug,
} from "lucide-react";
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
  if (toolName.includes("contract")) return "contracts";
  if (toolName.includes("lead") || toolName.includes("deal") || toolName.includes("activity")) return "crm";
  if (
    toolName.includes("journal") ||
    toolName.includes("account") ||
    toolName.includes("expense") ||
    toolName.includes("balance") ||
    toolName.includes("income")
  )
    return "accounting";
  if (toolName.includes("employee") || toolName.includes("attendance") || toolName.includes("payroll") || toolName.includes("clock"))
    return "hr";
  if (toolName.includes("wiki")) return "wiki";
  if (toolName.includes("asset")) return "it_assets";
  return "contracts";
}

function formatToolName(name: string): string {
  return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function getErrorMessage(result: unknown): string | null {
  if (typeof result === "object" && result !== null) {
    const obj = result as Record<string, unknown>;
    if (typeof obj.error === "string") return obj.error;
    if (typeof obj.message === "string") return obj.message;
  }
  if (typeof result === "string") return result;
  return null;
}

function formatResultSummary(result: unknown): string {
  if (Array.isArray(result)) {
    return `${result.length}件の結果`;
  }
  if (typeof result === "object" && result !== null) {
    const obj = result as Record<string, unknown>;
    if ("success" in obj) {
      return obj.success ? "成功" : "失敗";
    }
    if ("error" in obj && typeof obj.error === "string") {
      return obj.error;
    }
    if ("count" in obj) {
      return `${obj.count}件`;
    }
    if ("message" in obj) {
      return String(obj.message);
    }
  }
  return "完了";
}

function getPrimaryLink(toolName: string, result: unknown): { href: string; label: string } | null {
  const obj = typeof result === "object" && result !== null ? (result as Record<string, unknown>) : null;
  
  // Get ID from various possible locations in the result
  let id: string | null = null;
  if (obj) {
    if (typeof obj.id === "string") id = obj.id;
    else if (obj.invoice && typeof (obj.invoice as Record<string, unknown>).id === "string") {
      id = (obj.invoice as Record<string, unknown>).id as string;
    } else if (obj.estimate && typeof (obj.estimate as Record<string, unknown>).id === "string") {
      id = (obj.estimate as Record<string, unknown>).id as string;
    } else if (obj.contract && typeof (obj.contract as Record<string, unknown>).id === "string") {
      id = (obj.contract as Record<string, unknown>).id as string;
    } else if (obj.client && typeof (obj.client as Record<string, unknown>).id === "string") {
      id = (obj.client as Record<string, unknown>).id as string;
    } else if (obj.lead && typeof (obj.lead as Record<string, unknown>).id === "string") {
      id = (obj.lead as Record<string, unknown>).id as string;
    } else if (obj.deal && typeof (obj.deal as Record<string, unknown>).id === "string") {
      id = (obj.deal as Record<string, unknown>).id as string;
    }
  }

  // Invoice tools
  if (toolName === "invoice_create" && id) {
    return { href: `/invoices/${id}`, label: "請求書を開く" };
  }
  if (toolName === "invoice_create_payment_link" && obj?.payment_url) {
    return { href: obj.payment_url as string, label: "決済ページを開く" };
  }

  // Estimate tools
  if (toolName === "estimate_create" && id) {
    return { href: `/estimates/${id}`, label: "見積書を開く" };
  }

  // Contract tools
  if (toolName === "contract_create" && id) {
    return { href: `/contracts/${id}`, label: "契約書を開く" };
  }

  // Client tools
  if (toolName === "client_create" && id) {
    return { href: "/clients", label: "取引先一覧を開く" };
  }

  // Lead tools
  if (toolName === "lead_create" && id) {
    return { href: "/leads", label: "リード一覧を開く" };
  }

  // Deal tools
  if (toolName === "deal_create" && id) {
    return { href: "/deals", label: "案件一覧を開く" };
  }

  // Wiki tools
  if (toolName === "wiki_create" && id) {
    return { href: `/wiki?id=${id}`, label: "Wikiページを開く" };
  }

  // Employee tools
  if (toolName === "employee_create" && id) {
    return { href: "/employees", label: "従業員一覧を開く" };
  }

  return null;
}

export function ToolResultCard({ result }: ToolResultCardProps) {
  const category = getToolCategory(result.toolName);
  const Icon = toolIcons[category] || FileText;
  const location = useLocation();
  const { toast } = useToast();
  const [isReporting, setIsReporting] = useState(false);

  const summary = useMemo(() => formatResultSummary(result.result), [result.result]);
  const primaryLink = useMemo(() => getPrimaryLink(result.toolName, result.result), [result.toolName, result.result]);
  const errorMessage = useMemo(() => (result.isError ? getErrorMessage(result.result) : null), [result.isError, result.result]);

  const handleReportError = async () => {
    if (!result.isError) return;

    setIsReporting(true);
    try {
      const title = `チャットツール失敗: ${result.toolName}`;
      const details = [
        `発生ページ: ${location.pathname}`,
        "",
        "---",
        "toolName:",
        result.toolName,
        "",
        "result:",
        JSON.stringify(result.result, null, 2),
      ].join("\n");

      const { error } = await supabase.functions.invoke("create-feedback", {
        body: {
          type: "bug",
          title,
          details,
          page: location.pathname,
        },
      });

      if (error) throw error;

      toast({
        title: "送信完了",
        description: "エラー報告を送信しました。ありがとうございます。",
      });
    } catch (e) {
      toast({
        title: "送信エラー",
        description: "エラー報告の送信に失敗しました。時間をおいて再度お試しください。",
        variant: "destructive",
      });
    } finally {
      setIsReporting(false);
    }
  };

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
            <span className="font-medium truncate">{formatToolName(result.toolName)}</span>
            <Badge variant={result.isError ? "destructive" : "secondary"} className="h-4 text-[10px]">
              {result.isError ? <XCircle className="h-2.5 w-2.5 mr-1" /> : <CheckCircle className="h-2.5 w-2.5 mr-1" />}
              {result.isError ? "失敗" : "完了"}
            </Badge>
          </div>

          <p className="text-muted-foreground break-words">{summary}</p>

          {(primaryLink || result.isError) && (
            <div className="flex flex-wrap gap-2 mt-2">
              {primaryLink && (
                primaryLink.href.startsWith('http') ? (
                  <Button variant="secondary" size="sm" asChild>
                    <a href={primaryLink.href} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      {primaryLink.label}
                    </a>
                  </Button>
                ) : (
                  <Button variant="secondary" size="sm" asChild>
                    <Link to={primaryLink.href}>
                      <ExternalLink className="h-3 w-3 mr-1" />
                      {primaryLink.label}
                    </Link>
                  </Button>
                )
              )}

              {result.isError && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReportError}
                  disabled={isReporting}
                >
                  <Bug className="h-3 w-3 mr-1" />
                  {isReporting ? "送信中..." : "エラーを報告"}
                </Button>
              )}
            </div>
          )}

          {result.isError && errorMessage && (
            <p className="mt-2 text-muted-foreground break-words">エラー詳細: {errorMessage}</p>
          )}
        </div>
      </div>
    </Card>
  );
}
