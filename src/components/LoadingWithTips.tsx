import { useState, useEffect } from "react";
import { Lightbulb, Sparkles } from "lucide-react";
import { TableSkeleton, CardSkeleton, ListSkeleton, GridSkeleton } from "./TableSkeleton";

type ModuleType = 
  | "invoices" 
  | "estimates" 
  | "contracts" 
  | "leads" 
  | "clients" 
  | "deals" 
  | "employees" 
  | "projects" 
  | "expenses" 
  | "wiki"
  | "products"
  | "activities"
  | "attendance"
  | "leave"
  | "payroll"
  | "it-assets"
  | "notifications"
  | "audit"
  | "emails"
  | "jobs"
  | "candidates"
  | "team"
  | "purchase-orders"
  | "general";

type SkeletonType = "table" | "card" | "list" | "grid";

const MODULE_TIPS: Record<ModuleType, string[]> = {
  invoices: [
    "AIに「サンプル商事へ15万円の請求書を作成」と伝えるだけで自動作成できます",
    "請求書は一括でPDFエクスポートできます",
    "未払い請求書はダッシュボードでアラート表示されます",
    "定期請求は自動化テンプレートで効率化できます",
  ],
  estimates: [
    "見積書から請求書へワンクリックで変換できます",
    "AIに「先月の見積書を一覧表示」と聞いてみましょう",
    "見積書のテンプレートをカスタマイズできます",
  ],
  contracts: [
    "電子署名で契約締結を完全オンライン化",
    "契約期限が近づくと自動でアラートが届きます",
    "AIに「来月期限の契約を教えて」と聞いてみましょう",
  ],
  leads: [
    "AIがリードをスコアリングし優先度を自動判定",
    "リードから顧客への変換はワンクリック",
    "AIに「今週追加されたリードを見せて」と聞いてみましょう",
  ],
  clients: [
    "顧客情報から取引履歴まで一元管理",
    "AIに「サンプル商事の情報を見せて」と聞いてみましょう",
    "重複した顧客情報は自動でマージ候補として表示",
  ],
  deals: [
    "パイプラインでディールの進捗を可視化",
    "AIに「今月クローズ予定の案件を見せて」と聞いてみましょう",
    "ディールから見積書・請求書を直接作成できます",
  ],
  employees: [
    "従業員情報はマイナンバーまで安全に管理",
    "AIに「営業部のメンバー一覧を見せて」と聞いてみましょう",
    "入退社手続きもシステム上で完結",
  ],
  projects: [
    "ガントチャートとカンバンの両方でプロジェクト管理",
    "AIに「進行中のプロジェクトの状況を教えて」と聞いてみましょう",
    "タイムログで工数を正確に把握",
  ],
  expenses: [
    "レシート撮影でOCRが自動入力",
    "経費精算から仕訳まで自動連携",
    "AIに「今月の経費合計を教えて」と聞いてみましょう",
  ],
  wiki: [
    "社内ナレッジを階層構造で整理",
    "AIに「〇〇についてのドキュメントを探して」と聞いてみましょう",
    "リッチテキストで見やすいドキュメント作成",
  ],
  products: [
    "商品マスタから請求書に直接追加可能",
    "在庫管理と連携して自動発注も設定可能",
  ],
  activities: [
    "顧客とのやり取りを時系列で記録",
    "AIに「来週のフォローアップを教えて」と聞いてみましょう",
  ],
  attendance: [
    "出退勤はワンクリックで打刻",
    "残業時間を自動計算して給与に反映",
  ],
  leave: [
    "休暇申請・承認をオンラインで完結",
    "有給残日数をリアルタイムで確認",
  ],
  payroll: [
    "勤怠データから給与を自動計算",
    "給与明細はPDFで配信可能",
  ],
  "it-assets": [
    "PC・スマホなどのIT資産を一元管理",
    "貸出状況と担当者を追跡可能",
  ],
  notifications: [
    "重要な通知は見逃さないようにアラート",
    "通知設定はカスタマイズ可能",
  ],
  audit: [
    "すべての操作履歴を自動記録",
    "セキュリティ監査に必要な情報を提供",
  ],
  emails: [
    "受信メールを自動でリード・顧客に紐付け",
    "AIがメール内容を分析し返信候補を提案",
  ],
  jobs: [
    "求人情報を複数媒体に一括掲載",
    "応募者の進捗をパイプラインで管理",
  ],
  candidates: [
    "候補者情報と面接履歴を一元管理",
    "AIが履歴書を分析しスキルマッチを判定",
  ],
  team: [
    "チームメンバーの役割と権限を管理",
    "招待リンクで簡単にメンバー追加",
  ],
  "purchase-orders": [
    "発注書から仕入先への発注を効率化",
    "在庫と連携して自動発注も可能",
  ],
  general: [
    "AIアシスタントに何でも聞いてみましょう",
    "キーボードショートカット: ⌘K で検索を開く",
    "ダークモードはヘッダーから切り替え可能",
  ],
};

interface LoadingWithTipsProps {
  module?: ModuleType;
  skeletonType?: SkeletonType;
  columns?: number;
  rows?: number;
  showTip?: boolean;
}

export function LoadingWithTips({
  module = "general",
  skeletonType = "table",
  columns = 5,
  rows = 5,
  showTip = true,
}: LoadingWithTipsProps) {
  const [tip, setTip] = useState("");

  useEffect(() => {
    const tips = MODULE_TIPS[module] || MODULE_TIPS.general;
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    setTip(randomTip);
  }, [module]);

  const renderSkeleton = () => {
    switch (skeletonType) {
      case "card":
        return <CardSkeleton />;
      case "list":
        return <ListSkeleton count={rows} />;
      case "grid":
        return <GridSkeleton count={rows} columns={columns} />;
      case "table":
      default:
        return <TableSkeleton columns={columns} rows={rows} />;
    }
  };

  return (
    <div className="space-y-4">
      {showTip && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border/50">
          <div className="flex-shrink-0 p-2 rounded-full bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground mb-1 flex items-center gap-2">
              <Lightbulb className="h-3.5 w-3.5" />
              ヒント
            </p>
            <p className="text-sm text-muted-foreground">{tip}</p>
          </div>
        </div>
      )}
      {renderSkeleton()}
    </div>
  );
}
