import React from "react";
import {
  BarChart3,
  Target,
  AlertCircle,
  Activity,
  Package,
  Shield,
  Users,
  Calendar,
  Clock,
  Stethoscope,
  Briefcase,
  FileText,
  TrendingUp,
  Wallet,
} from "lucide-react";

export type WidgetSize = "small" | "medium" | "large";

export interface DashboardWidgetConfig {
  id: string;
  type: string;
  title: string;
  position: number;
  size: WidgetSize;
  visible: boolean;
}

export interface WidgetDefinition {
  type: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  defaultSize: WidgetSize;
  category: string;
  industries?: string[]; // If specified, only show for these industries
}

// All available widget types
export const WIDGET_DEFINITIONS: WidgetDefinition[] = [
  // Common widgets
  {
    type: "revenue-chart",
    title: "売上推移",
    description: "月別の請求額と入金額の推移を表示",
    icon: <BarChart3 className="h-4 w-4" />,
    defaultSize: "large",
    category: "共通",
  },
  {
    type: "pipeline-overview",
    title: "パイプライン",
    description: "商談パイプラインの概要を表示",
    icon: <Target className="h-4 w-4" />,
    defaultSize: "large",
    category: "営業",
  },
  {
    type: "unpaid-invoices",
    title: "未収請求",
    description: "未払い・期限超過の請求書アラート",
    icon: <AlertCircle className="h-4 w-4" />,
    defaultSize: "medium",
    category: "会計",
  },
  {
    type: "activity-feed",
    title: "アクティビティ",
    description: "最近の活動履歴",
    icon: <Activity className="h-4 w-4" />,
    defaultSize: "medium",
    category: "共通",
  },
  {
    type: "inventory-alerts",
    title: "在庫アラート",
    description: "在庫切れ・発注点到達の商品",
    icon: <Package className="h-4 w-4" />,
    defaultSize: "medium",
    category: "在庫",
  },
  {
    type: "trust-passport",
    title: "Trust Passport",
    description: "信用スコアとランク",
    icon: <Shield className="h-4 w-4" />,
    defaultSize: "medium",
    category: "ファイナンス",
  },
  {
    type: "stats-invoiced",
    title: "今月の請求額",
    description: "今月の請求額合計",
    icon: <FileText className="h-4 w-4" />,
    defaultSize: "small",
    category: "会計",
  },
  {
    type: "stats-unpaid",
    title: "入金待ち",
    description: "未入金の請求額",
    icon: <Wallet className="h-4 w-4" />,
    defaultSize: "small",
    category: "会計",
  },
  {
    type: "stats-pipeline",
    title: "パイプライン金額",
    description: "商談パイプラインの総額",
    icon: <Target className="h-4 w-4" />,
    defaultSize: "small",
    category: "営業",
  },
  {
    type: "stats-won",
    title: "成約済み",
    description: "今期の成約金額",
    icon: <TrendingUp className="h-4 w-4" />,
    defaultSize: "small",
    category: "営業",
  },
  {
    type: "stats-clients",
    title: "取引先数",
    description: "登録済み取引先の数",
    icon: <Users className="h-4 w-4" />,
    defaultSize: "small",
    category: "共通",
  },
  // Industry-specific widgets
  {
    type: "daily-patients",
    title: "本日の患者数",
    description: "本日の来院患者数と予約状況",
    icon: <Stethoscope className="h-4 w-4" />,
    defaultSize: "medium",
    category: "医療",
    industries: ["healthcare", "clinic-emr"],
  },
  {
    type: "insurance-claims",
    title: "保険請求状況",
    description: "保険請求の進捗状況",
    icon: <FileText className="h-4 w-4" />,
    defaultSize: "medium",
    category: "医療",
    industries: ["healthcare", "clinic-emr"],
  },
  {
    type: "today-appointments",
    title: "本日の予約",
    description: "本日の予約一覧",
    icon: <Calendar className="h-4 w-4" />,
    defaultSize: "medium",
    category: "予約",
    industries: ["service", "salon", "fitness-club", "yoga-studio"],
  },
  {
    type: "active-projects",
    title: "進行中プロジェクト",
    description: "アクティブなプロジェクトの状況",
    icon: <Briefcase className="h-4 w-4" />,
    defaultSize: "medium",
    category: "プロジェクト",
    industries: ["construction", "it", "consulting"],
  },
  {
    type: "billable-hours",
    title: "請求可能時間",
    description: "今月の請求可能な稼働時間",
    icon: <Clock className="h-4 w-4" />,
    defaultSize: "medium",
    category: "プロジェクト",
    industries: ["consulting", "legal", "it"],
  },
];

// Default widgets for each industry
export const INDUSTRY_DEFAULT_WIDGETS: Record<string, DashboardWidgetConfig[]> = {
  // General / Default
  default: [
    { id: "w1", type: "stats-invoiced", title: "今月の請求額", position: 1, size: "small", visible: true },
    { id: "w2", type: "stats-unpaid", title: "入金待ち", position: 2, size: "small", visible: true },
    { id: "w3", type: "stats-pipeline", title: "パイプライン金額", position: 3, size: "small", visible: true },
    { id: "w4", type: "stats-won", title: "成約済み", position: 4, size: "small", visible: true },
    { id: "w5", type: "stats-clients", title: "取引先数", position: 5, size: "small", visible: true },
    { id: "w6", type: "revenue-chart", title: "売上推移", position: 6, size: "large", visible: true },
    { id: "w7", type: "pipeline-overview", title: "パイプライン", position: 7, size: "large", visible: true },
    { id: "w8", type: "unpaid-invoices", title: "未収請求", position: 8, size: "medium", visible: true },
    { id: "w9", type: "activity-feed", title: "アクティビティ", position: 9, size: "medium", visible: true },
  ],
  // Retail
  retail: [
    { id: "w1", type: "stats-invoiced", title: "今月の売上", position: 1, size: "small", visible: true },
    { id: "w2", type: "stats-clients", title: "顧客数", position: 2, size: "small", visible: true },
    { id: "w3", type: "inventory-alerts", title: "在庫アラート", position: 3, size: "medium", visible: true },
    { id: "w4", type: "revenue-chart", title: "売上推移", position: 4, size: "large", visible: true },
    { id: "w5", type: "activity-feed", title: "アクティビティ", position: 5, size: "medium", visible: true },
  ],
  // Healthcare
  healthcare: [
    { id: "w1", type: "daily-patients", title: "本日の患者数", position: 1, size: "medium", visible: true },
    { id: "w2", type: "stats-invoiced", title: "今月の診療報酬", position: 2, size: "small", visible: true },
    { id: "w3", type: "insurance-claims", title: "保険請求状況", position: 3, size: "medium", visible: true },
    { id: "w4", type: "revenue-chart", title: "売上推移", position: 4, size: "large", visible: true },
    { id: "w5", type: "activity-feed", title: "アクティビティ", position: 5, size: "medium", visible: true },
  ],
  // Service / Beauty
  service: [
    { id: "w1", type: "today-appointments", title: "本日の予約", position: 1, size: "medium", visible: true },
    { id: "w2", type: "stats-invoiced", title: "今月の売上", position: 2, size: "small", visible: true },
    { id: "w3", type: "stats-clients", title: "顧客数", position: 3, size: "small", visible: true },
    { id: "w4", type: "revenue-chart", title: "売上推移", position: 4, size: "large", visible: true },
    { id: "w5", type: "activity-feed", title: "アクティビティ", position: 5, size: "medium", visible: true },
  ],
  // IT / Consulting
  it: [
    { id: "w1", type: "active-projects", title: "進行中プロジェクト", position: 1, size: "medium", visible: true },
    { id: "w2", type: "billable-hours", title: "請求可能時間", position: 2, size: "medium", visible: true },
    { id: "w3", type: "pipeline-overview", title: "パイプライン", position: 3, size: "large", visible: true },
    { id: "w4", type: "revenue-chart", title: "売上推移", position: 4, size: "large", visible: true },
    { id: "w5", type: "activity-feed", title: "アクティビティ", position: 5, size: "medium", visible: true },
  ],
  // Construction
  construction: [
    { id: "w1", type: "active-projects", title: "進行中案件", position: 1, size: "medium", visible: true },
    { id: "w2", type: "stats-pipeline", title: "受注予定", position: 2, size: "small", visible: true },
    { id: "w3", type: "stats-won", title: "受注済み", position: 3, size: "small", visible: true },
    { id: "w4", type: "pipeline-overview", title: "案件パイプライン", position: 4, size: "large", visible: true },
    { id: "w5", type: "revenue-chart", title: "売上推移", position: 5, size: "large", visible: true },
    { id: "w6", type: "unpaid-invoices", title: "未収金", position: 6, size: "medium", visible: true },
  ],
  // Professional services
  professional: [
    { id: "w1", type: "billable-hours", title: "請求可能時間", position: 1, size: "medium", visible: true },
    { id: "w2", type: "pipeline-overview", title: "案件パイプライン", position: 2, size: "large", visible: true },
    { id: "w3", type: "stats-invoiced", title: "今月の請求額", position: 3, size: "small", visible: true },
    { id: "w4", type: "stats-unpaid", title: "未収金", position: 4, size: "small", visible: true },
    { id: "w5", type: "revenue-chart", title: "売上推移", position: 5, size: "large", visible: true },
    { id: "w6", type: "activity-feed", title: "アクティビティ", position: 6, size: "medium", visible: true },
  ],
};

// Get widget definition by type
export function getWidgetDefinition(type: string): WidgetDefinition | undefined {
  return WIDGET_DEFINITIONS.find((w) => w.type === type);
}

// Get available widgets for an industry
export function getAvailableWidgetsForIndustry(industryKey?: string): WidgetDefinition[] {
  return WIDGET_DEFINITIONS.filter((w) => {
    if (!w.industries) return true; // Common widgets
    if (!industryKey) return false; // Industry-specific but no industry selected
    return w.industries.includes(industryKey);
  });
}

// Get default widgets for an industry
export function getDefaultWidgetsForIndustry(industryKey?: string): DashboardWidgetConfig[] {
  if (industryKey && INDUSTRY_DEFAULT_WIDGETS[industryKey]) {
    return INDUSTRY_DEFAULT_WIDGETS[industryKey];
  }
  return INDUSTRY_DEFAULT_WIDGETS.default;
}
