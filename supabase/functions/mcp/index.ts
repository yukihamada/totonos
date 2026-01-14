import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const MCP_VERSION = "2024-11-05";

function validateApiKey(apiKey: string): boolean {
  return apiKey.startsWith("ttn_") && apiKey.length === 36;
}

const mcpTools = [
  // ==================== Invoices ====================
  {
    name: "invoice_list",
    description: "請求書の一覧を取得します",
    inputSchema: {
      type: "object",
      properties: {
        status: { type: "string", description: "フィルタ: draft, sent, pending, paid, overdue, cancelled" },
        limit: { type: "number", description: "取得件数（デフォルト: 50）" },
      },
    },
  },
  {
    name: "invoice_get",
    description: "請求書の詳細を取得します",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "請求書ID" },
      },
      required: ["id"],
    },
  },
  {
    name: "invoice_create",
    description: "請求書を作成します",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "タイトル" },
        client_id: { type: "string", description: "取引先ID" },
        amount: { type: "number", description: "金額" },
        tax_amount: { type: "number", description: "消費税額" },
        due_date: { type: "string", description: "支払期限 (YYYY-MM-DD)" },
        description: { type: "string", description: "説明" },
      },
      required: ["title", "amount", "due_date"],
    },
  },
  {
    name: "invoice_update",
    description: "請求書を更新します",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "請求書ID" },
        status: { type: "string", description: "ステータス" },
        paid_date: { type: "string", description: "支払日" },
      },
      required: ["id"],
    },
  },
  {
    name: "invoice_delete",
    description: "請求書を削除します",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "請求書ID" },
      },
      required: ["id"],
    },
  },

  // ==================== Contracts ====================
  {
    name: "contract_list",
    description: "契約書の一覧を取得します",
    inputSchema: {
      type: "object",
      properties: {
        status: { type: "string", description: "フィルタ: draft, sent, pending_signature, partially_signed, signed, expired, cancelled" },
        limit: { type: "number", description: "取得件数" },
      },
    },
  },
  {
    name: "contract_get",
    description: "契約書の詳細を取得します（署名情報含む）",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "契約書ID" },
      },
      required: ["id"],
    },
  },
  {
    name: "contract_create",
    description: "契約書を作成します",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "契約タイトル" },
        client_id: { type: "string", description: "取引先ID" },
        content: { type: "string", description: "契約内容" },
        amount: { type: "number", description: "契約金額" },
        valid_until: { type: "string", description: "有効期限 (YYYY-MM-DD)" },
      },
      required: ["title"],
    },
  },
  {
    name: "contract_update",
    description: "契約書を更新します",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "契約書ID" },
        status: { type: "string", description: "ステータス" },
        content: { type: "string", description: "内容" },
      },
      required: ["id"],
    },
  },

  // ==================== Clients ====================
  {
    name: "client_list",
    description: "取引先の一覧を取得します",
    inputSchema: {
      type: "object",
      properties: {
        search: { type: "string", description: "名前で検索" },
        limit: { type: "number", description: "取得件数" },
      },
    },
  },
  {
    name: "client_get",
    description: "取引先の詳細を取得します",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "取引先ID" },
      },
      required: ["id"],
    },
  },
  {
    name: "client_create",
    description: "取引先を作成します",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "取引先名" },
        email: { type: "string", description: "メールアドレス" },
        phone: { type: "string", description: "電話番号" },
        address: { type: "string", description: "住所" },
        notes: { type: "string", description: "メモ" },
      },
      required: ["name"],
    },
  },
  {
    name: "client_update",
    description: "取引先を更新します",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "取引先ID" },
        name: { type: "string", description: "取引先名" },
        email: { type: "string", description: "メールアドレス" },
        phone: { type: "string", description: "電話番号" },
      },
      required: ["id"],
    },
  },

  // ==================== CRM - Leads ====================
  {
    name: "lead_list",
    description: "リードの一覧を取得します",
    inputSchema: {
      type: "object",
      properties: {
        status: { type: "string", description: "フィルタ: new, contacted, qualified, converted, lost" },
        source: { type: "string", description: "流入元でフィルタ" },
        limit: { type: "number", description: "取得件数" },
      },
    },
  },
  {
    name: "lead_get",
    description: "リードの詳細を取得します",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "リードID" },
      },
      required: ["id"],
    },
  },
  {
    name: "lead_create",
    description: "リードを作成します",
    inputSchema: {
      type: "object",
      properties: {
        company_name: { type: "string", description: "会社名" },
        contact_name: { type: "string", description: "担当者名" },
        email: { type: "string", description: "メールアドレス" },
        phone: { type: "string", description: "電話番号" },
        source: { type: "string", description: "流入元: website, referral, exhibition, cold_call, advertising, other" },
        notes: { type: "string", description: "メモ" },
      },
      required: ["company_name"],
    },
  },
  {
    name: "lead_update",
    description: "リードを更新します",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "リードID" },
        status: { type: "string", description: "ステータス" },
        notes: { type: "string", description: "メモ" },
      },
      required: ["id"],
    },
  },
  {
    name: "lead_convert",
    description: "リードを顧客に転換します",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "リードID" },
      },
      required: ["id"],
    },
  },

  // ==================== CRM - Deals ====================
  {
    name: "deal_list",
    description: "商談の一覧を取得します",
    inputSchema: {
      type: "object",
      properties: {
        stage: { type: "string", description: "ステージでフィルタ: initial, proposal, negotiation, contract, won, lost" },
        limit: { type: "number", description: "取得件数" },
      },
    },
  },
  {
    name: "deal_get",
    description: "商談の詳細を取得します",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "商談ID" },
      },
      required: ["id"],
    },
  },
  {
    name: "deal_create",
    description: "商談を作成します",
    inputSchema: {
      type: "object",
      properties: {
        deal_name: { type: "string", description: "商談名" },
        amount: { type: "number", description: "金額" },
        stage: { type: "string", description: "ステージ" },
        lead_id: { type: "string", description: "リードID" },
        client_id: { type: "string", description: "取引先ID" },
        expected_close_date: { type: "string", description: "予想成約日 (YYYY-MM-DD)" },
        probability: { type: "number", description: "成約確率 (0-100)" },
      },
      required: ["deal_name"],
    },
  },
  {
    name: "deal_update",
    description: "商談を更新します",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "商談ID" },
        stage: { type: "string", description: "ステージ" },
        amount: { type: "number", description: "金額" },
        notes: { type: "string", description: "メモ" },
      },
      required: ["id"],
    },
  },
  {
    name: "pipeline_stats",
    description: "パイプラインの統計を取得します",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },

  // ==================== CRM - Activities ====================
  {
    name: "activity_list",
    description: "活動履歴の一覧を取得します",
    inputSchema: {
      type: "object",
      properties: {
        type: { type: "string", description: "タイプでフィルタ: call, meeting, email, visit, demo, other" },
        limit: { type: "number", description: "取得件数" },
      },
    },
  },
  {
    name: "activity_create",
    description: "活動を記録します",
    inputSchema: {
      type: "object",
      properties: {
        activity_type: { type: "string", description: "タイプ: call, meeting, email, visit, demo, other" },
        subject: { type: "string", description: "件名" },
        description: { type: "string", description: "説明" },
        lead_id: { type: "string", description: "リードID" },
        client_id: { type: "string", description: "取引先ID" },
        deal_id: { type: "string", description: "商談ID" },
        duration_minutes: { type: "number", description: "所要時間（分）" },
        next_action: { type: "string", description: "次のアクション" },
        next_action_date: { type: "string", description: "次のアクション日" },
      },
      required: ["activity_type", "subject"],
    },
  },

  // ==================== Estimates ====================
  {
    name: "estimate_list",
    description: "見積書の一覧を取得します",
    inputSchema: {
      type: "object",
      properties: {
        status: { type: "string", description: "フィルタ: draft, sent, accepted, rejected, expired" },
        limit: { type: "number", description: "取得件数" },
      },
    },
  },
  {
    name: "estimate_get",
    description: "見積書の詳細を取得します",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "見積書ID" },
      },
      required: ["id"],
    },
  },
  {
    name: "estimate_create",
    description: "見積書を作成します",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "タイトル" },
        client_id: { type: "string", description: "取引先ID" },
        amount: { type: "number", description: "金額" },
        valid_until: { type: "string", description: "有効期限 (YYYY-MM-DD)" },
        description: { type: "string", description: "説明" },
      },
      required: ["title", "amount", "valid_until"],
    },
  },

  // ==================== Purchase Orders ====================
  {
    name: "purchase_order_list",
    description: "発注書の一覧を取得します",
    inputSchema: {
      type: "object",
      properties: {
        status: { type: "string", description: "フィルタ: draft, sent, confirmed, delivered, cancelled" },
        limit: { type: "number", description: "取得件数" },
      },
    },
  },
  {
    name: "purchase_order_get",
    description: "発注書の詳細を取得します",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "発注書ID" },
      },
      required: ["id"],
    },
  },
  {
    name: "purchase_order_create",
    description: "発注書を作成します",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "タイトル" },
        client_id: { type: "string", description: "取引先ID" },
        amount: { type: "number", description: "金額" },
        delivery_date: { type: "string", description: "納期 (YYYY-MM-DD)" },
      },
      required: ["title", "amount"],
    },
  },

  // ==================== Employees ====================
  {
    name: "employee_list",
    description: "従業員の一覧を取得します",
    inputSchema: {
      type: "object",
      properties: {
        status: { type: "string", description: "フィルタ: active, on_leave, resigned" },
        department: { type: "string", description: "部署でフィルタ" },
        limit: { type: "number", description: "取得件数" },
      },
    },
  },
  {
    name: "employee_get",
    description: "従業員の詳細を取得します",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "従業員ID" },
      },
      required: ["id"],
    },
  },
  {
    name: "employee_create",
    description: "従業員を登録します",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "名前" },
        name_kana: { type: "string", description: "フリガナ" },
        email: { type: "string", description: "メールアドレス" },
        phone: { type: "string", description: "電話番号" },
        department: { type: "string", description: "部署" },
        position: { type: "string", description: "役職" },
        hire_date: { type: "string", description: "入社日 (YYYY-MM-DD)" },
        employment_type: { type: "string", description: "雇用形態: full_time, part_time, contract, intern" },
        base_salary: { type: "number", description: "基本給" },
      },
      required: ["name", "hire_date"],
    },
  },
  {
    name: "employee_update",
    description: "従業員情報を更新します",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "従業員ID" },
        status: { type: "string", description: "ステータス" },
        department: { type: "string", description: "部署" },
        position: { type: "string", description: "役職" },
      },
      required: ["id"],
    },
  },

  // ==================== Attendance ====================
  {
    name: "attendance_list",
    description: "勤怠記録の一覧を取得します",
    inputSchema: {
      type: "object",
      properties: {
        employee_id: { type: "string", description: "従業員IDでフィルタ" },
        date_from: { type: "string", description: "開始日" },
        date_to: { type: "string", description: "終了日" },
        limit: { type: "number", description: "取得件数" },
      },
    },
  },
  {
    name: "attendance_clock_in",
    description: "出勤を記録します",
    inputSchema: {
      type: "object",
      properties: {
        employee_id: { type: "string", description: "従業員ID" },
        note: { type: "string", description: "メモ" },
      },
      required: ["employee_id"],
    },
  },
  {
    name: "attendance_clock_out",
    description: "退勤を記録します",
    inputSchema: {
      type: "object",
      properties: {
        employee_id: { type: "string", description: "従業員ID" },
        note: { type: "string", description: "メモ" },
      },
      required: ["employee_id"],
    },
  },

  // ==================== Payroll ====================
  {
    name: "payroll_list",
    description: "給与記録の一覧を取得します",
    inputSchema: {
      type: "object",
      properties: {
        status: { type: "string", description: "ステータス: draft, calculated, approved, paid" },
        employee_id: { type: "string", description: "従業員IDでフィルタ" },
        limit: { type: "number", description: "取得件数" },
      },
    },
  },
  {
    name: "payroll_get",
    description: "給与明細を取得します",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "給与記録ID" },
      },
      required: ["id"],
    },
  },

  // ==================== Leave Requests ====================
  {
    name: "leave_balance_list",
    description: "有給残高の一覧を取得します",
    inputSchema: {
      type: "object",
      properties: {
        employee_id: { type: "string", description: "従業員IDでフィルタ" },
        fiscal_year: { type: "number", description: "年度" },
        limit: { type: "number", description: "取得件数" },
      },
    },
  },

  // ==================== Wiki ====================
  {
    name: "wiki_list",
    description: "Wikiページの一覧を取得します",
    inputSchema: {
      type: "object",
      properties: {
        category: { type: "string", description: "カテゴリ: manual, policy, minutes, announcement, template, other" },
        limit: { type: "number", description: "取得件数" },
      },
    },
  },
  {
    name: "wiki_search",
    description: "Wikiを検索します",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "検索キーワード" },
        limit: { type: "number", description: "取得件数" },
      },
      required: ["query"],
    },
  },
  {
    name: "wiki_get",
    description: "Wikiページを取得します",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "ページID" },
      },
      required: ["id"],
    },
  },
  {
    name: "wiki_create",
    description: "Wikiページを作成します",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "タイトル" },
        content: { type: "string", description: "内容（Markdown）" },
        category: { type: "string", description: "カテゴリ" },
        parent_page_id: { type: "string", description: "親ページID" },
      },
      required: ["title", "content"],
    },
  },
  {
    name: "wiki_update",
    description: "Wikiページを更新します",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "ページID" },
        title: { type: "string", description: "タイトル" },
        content: { type: "string", description: "内容" },
      },
      required: ["id"],
    },
  },

  // ==================== Accounting ====================
  {
    name: "account_list",
    description: "勘定科目の一覧を取得します",
    inputSchema: {
      type: "object",
      properties: {
        type: { type: "string", description: "タイプ: asset, liability, equity, revenue, expense" },
        limit: { type: "number", description: "取得件数" },
      },
    },
  },
  {
    name: "journal_list",
    description: "仕訳一覧を取得します",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "number", description: "取得件数" },
        start_date: { type: "string", description: "開始日" },
        end_date: { type: "string", description: "終了日" },
      },
    },
  },
  {
    name: "journal_get",
    description: "仕訳の詳細を取得します",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "仕訳ID" },
      },
      required: ["id"],
    },
  },
  {
    name: "journal_create",
    description: "仕訳を作成します",
    inputSchema: {
      type: "object",
      properties: {
        entry_date: { type: "string", description: "日付 (YYYY-MM-DD)" },
        description: { type: "string", description: "摘要" },
        lines: {
          type: "array",
          description: "仕訳明細（借方・貸方）",
          items: {
            type: "object",
            properties: {
              account_id: { type: "string" },
              debit_amount: { type: "number" },
              credit_amount: { type: "number" },
              description: { type: "string" },
            },
          },
        },
      },
      required: ["entry_date", "lines"],
    },
  },
  {
    name: "expense_list",
    description: "経費申請の一覧を取得します",
    inputSchema: {
      type: "object",
      properties: {
        status: { type: "string", description: "ステータス: draft, pending, approved, rejected, paid" },
        limit: { type: "number", description: "取得件数" },
      },
    },
  },
  {
    name: "expense_get",
    description: "経費申請の詳細を取得します",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "経費申請ID" },
      },
      required: ["id"],
    },
  },
  {
    name: "trial_balance",
    description: "試算表を取得します",
    inputSchema: {
      type: "object",
      properties: {
        date: { type: "string", description: "基準日 (YYYY-MM-DD)" },
      },
    },
  },

  // ==================== Fixed Assets ====================
  {
    name: "fixed_asset_list",
    description: "固定資産の一覧を取得します",
    inputSchema: {
      type: "object",
      properties: {
        category: { type: "string", description: "カテゴリ: building, vehicle, equipment, software, furniture, other" },
        limit: { type: "number", description: "取得件数" },
      },
    },
  },
  {
    name: "fixed_asset_get",
    description: "固定資産の詳細と償却スケジュールを取得します",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "固定資産ID" },
      },
      required: ["id"],
    },
  },

  // ==================== IT Assets ====================
  {
    name: "it_asset_list",
    description: "IT資産の一覧を取得します",
    inputSchema: {
      type: "object",
      properties: {
        type: { type: "string", description: "タイプ: pc, mobile, monitor, furniture, software_license, other" },
        status: { type: "string", description: "ステータス: in_use, in_stock, maintenance, disposed" },
        limit: { type: "number", description: "取得件数" },
      },
    },
  },
  {
    name: "it_asset_get",
    description: "IT資産の詳細を取得します",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "IT資産ID" },
      },
      required: ["id"],
    },
  },
  {
    name: "it_asset_create",
    description: "IT資産を登録します",
    inputSchema: {
      type: "object",
      properties: {
        asset_name: { type: "string", description: "資産名" },
        asset_type: { type: "string", description: "タイプ" },
        manufacturer: { type: "string", description: "メーカー" },
        model: { type: "string", description: "型番" },
        serial_number: { type: "string", description: "シリアル番号" },
        purchase_date: { type: "string", description: "購入日" },
        purchase_price: { type: "number", description: "購入価格" },
        assigned_to_employee_id: { type: "string", description: "貸与先従業員ID" },
      },
      required: ["asset_name", "asset_type"],
    },
  },

  // ==================== Tasks ====================
  {
    name: "task_list",
    description: "タスクの一覧を取得します",
    inputSchema: {
      type: "object",
      properties: {
        status: { type: "string", description: "ステータス: todo, in_progress, review, done" },
        priority: { type: "string", description: "優先度: low, medium, high, urgent" },
        assignee_id: { type: "string", description: "担当者ID" },
        limit: { type: "number", description: "取得件数" },
      },
    },
  },
  {
    name: "task_get",
    description: "タスクの詳細を取得します",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "タスクID" },
      },
      required: ["id"],
    },
  },
  {
    name: "task_create",
    description: "タスクを作成します",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "タイトル" },
        description: { type: "string", description: "説明" },
        priority: { type: "string", description: "優先度" },
        due_date: { type: "string", description: "期限 (YYYY-MM-DD)" },
        assignee_id: { type: "string", description: "担当者ID" },
        project_name: { type: "string", description: "プロジェクト名" },
      },
      required: ["title"],
    },
  },
  {
    name: "task_update",
    description: "タスクを更新します",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "タスクID" },
        status: { type: "string", description: "ステータス" },
        priority: { type: "string", description: "優先度" },
      },
      required: ["id"],
    },
  },

  // ==================== Trust Passport ====================
  {
    name: "trust_passport_get",
    description: "トラストパスポートの情報を取得します",
    inputSchema: {
      type: "object",
      properties: {
        user_id: { type: "string", description: "ユーザーID（省略時は自分）" },
      },
    },
  },
  {
    name: "trust_score_history",
    description: "トラストスコアの履歴を取得します",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "number", description: "取得件数" },
      },
    },
  },

  // ==================== Boost Requests ====================
  {
    name: "boost_request_list",
    description: "前払いリクエストの一覧を取得します",
    inputSchema: {
      type: "object",
      properties: {
        status: { type: "string", description: "ステータス: pending, approved, completed, rejected" },
        limit: { type: "number", description: "取得件数" },
      },
    },
  },
  {
    name: "boost_request_create",
    description: "前払いリクエストを作成します",
    inputSchema: {
      type: "object",
      properties: {
        invoice_id: { type: "string", description: "請求書ID" },
        requested_amount: { type: "number", description: "希望金額" },
      },
      required: ["invoice_id", "requested_amount"],
    },
  },

  // ==================== Notifications ====================
  {
    name: "notification_list",
    description: "通知の一覧を取得します",
    inputSchema: {
      type: "object",
      properties: {
        is_read: { type: "boolean", description: "既読フィルタ" },
        limit: { type: "number", description: "取得件数" },
      },
    },
  },
  {
    name: "notification_mark_read",
    description: "通知を既読にします",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "通知ID（省略時は全て既読）" },
      },
    },
  },
];

async function executeTool(
  supabase: SupabaseClient,
  toolName: string,
  args: Record<string, unknown>
): Promise<unknown> {
  const limit = (args.limit as number) || 50;

  switch (toolName) {
    // ==================== Invoices ====================
    case "invoice_list": {
      let query = supabase.from("invoices").select("*, clients(name, email)").order("created_at", { ascending: false }).limit(limit);
      if (args.status) query = query.eq("status", args.status as string);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data;
    }
    case "invoice_get": {
      const { data, error } = await supabase.from("invoices").select("*, clients(name, email), invoice_items(*)").eq("id", args.id as string).single();
      if (error) throw new Error(error.message);
      return data;
    }
    case "invoice_create": {
      const { data, error } = await supabase.from("invoices").insert(args as Record<string, unknown>).select().single();
      if (error) throw new Error(error.message);
      return data;
    }
    case "invoice_update": {
      const { id, ...updateData } = args;
      const { data, error } = await supabase.from("invoices").update(updateData).eq("id", id as string).select().single();
      if (error) throw new Error(error.message);
      return data;
    }
    case "invoice_delete": {
      const { error } = await supabase.from("invoices").delete().eq("id", args.id as string);
      if (error) throw new Error(error.message);
      return { success: true };
    }

    // ==================== Contracts ====================
    case "contract_list": {
      let query = supabase.from("contracts").select("*, clients(name, email)").order("created_at", { ascending: false }).limit(limit);
      if (args.status) query = query.eq("status", args.status as string);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data;
    }
    case "contract_get": {
      const { data, error } = await supabase.from("contracts").select("*, clients(name, email), contract_signatures(*), contract_items(*)").eq("id", args.id as string).single();
      if (error) throw new Error(error.message);
      return data;
    }
    case "contract_create": {
      const { data, error } = await supabase.from("contracts").insert(args as Record<string, unknown>).select().single();
      if (error) throw new Error(error.message);
      return data;
    }
    case "contract_update": {
      const { id, ...updateData } = args;
      const { data, error } = await supabase.from("contracts").update(updateData).eq("id", id as string).select().single();
      if (error) throw new Error(error.message);
      return data;
    }

    // ==================== Clients ====================
    case "client_list": {
      let query = supabase.from("clients").select("*").order("created_at", { ascending: false }).limit(limit);
      if (args.search) query = query.ilike("name", `%${args.search as string}%`);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data;
    }
    case "client_get": {
      const { data, error } = await supabase.from("clients").select("*").eq("id", args.id as string).single();
      if (error) throw new Error(error.message);
      return data;
    }
    case "client_create": {
      const { data, error } = await supabase.from("clients").insert(args as Record<string, unknown>).select().single();
      if (error) throw new Error(error.message);
      return data;
    }
    case "client_update": {
      const { id, ...updateData } = args;
      const { data, error } = await supabase.from("clients").update(updateData).eq("id", id as string).select().single();
      if (error) throw new Error(error.message);
      return data;
    }

    // ==================== Leads ====================
    case "lead_list": {
      let query = supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(limit);
      if (args.status) query = query.eq("status", args.status as string);
      if (args.source) query = query.eq("source", args.source as string);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data;
    }
    case "lead_get": {
      const { data, error } = await supabase.from("leads").select("*").eq("id", args.id as string).single();
      if (error) throw new Error(error.message);
      return data;
    }
    case "lead_create": {
      const { data, error } = await supabase.from("leads").insert(args as Record<string, unknown>).select().single();
      if (error) throw new Error(error.message);
      return data;
    }
    case "lead_update": {
      const { id, ...updateData } = args;
      const { data, error } = await supabase.from("leads").update(updateData).eq("id", id as string).select().single();
      if (error) throw new Error(error.message);
      return data;
    }
    case "lead_convert": {
      // Get lead data
      const { data: lead, error: leadError } = await supabase.from("leads").select("*").eq("id", args.id as string).single();
      if (leadError) throw new Error(leadError.message);
      
      // Create client from lead
      const { data: client, error: clientError } = await supabase.from("clients").insert({
        name: lead.company_name,
        email: lead.email,
        phone: lead.phone,
        notes: lead.notes,
        user_id: lead.user_id,
      }).select().single();
      if (clientError) throw new Error(clientError.message);
      
      // Update lead status
      const { error: updateError } = await supabase.from("leads").update({
        status: "converted",
        converted_to_client_id: client.id,
      }).eq("id", args.id as string);
      if (updateError) throw new Error(updateError.message);
      
      return { lead_id: args.id, client_id: client.id, success: true };
    }

    // ==================== Deals ====================
    case "deal_list": {
      let query = supabase.from("deals").select("*, clients(name), leads(company_name)").order("created_at", { ascending: false }).limit(limit);
      if (args.stage) query = query.eq("stage", args.stage as string);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data;
    }
    case "deal_get": {
      const { data, error } = await supabase.from("deals").select("*, clients(name), leads(company_name)").eq("id", args.id as string).single();
      if (error) throw new Error(error.message);
      return data;
    }
    case "deal_create": {
      const { data, error } = await supabase.from("deals").insert(args as Record<string, unknown>).select().single();
      if (error) throw new Error(error.message);
      return data;
    }
    case "deal_update": {
      const { id, ...updateData } = args;
      const { data, error } = await supabase.from("deals").update(updateData).eq("id", id as string).select().single();
      if (error) throw new Error(error.message);
      return data;
    }
    case "pipeline_stats": {
      const { data, error } = await supabase.from("deals").select("stage, amount");
      if (error) throw new Error(error.message);
      const stats = (data || []).reduce((acc: Record<string, { count: number; value: number }>, deal: { stage: string; amount: number | null }) => {
        if (!acc[deal.stage]) acc[deal.stage] = { count: 0, value: 0 };
        acc[deal.stage].count++;
        acc[deal.stage].value += deal.amount || 0;
        return acc;
      }, {});
      return stats;
    }

    // ==================== Activities ====================
    case "activity_list": {
      let query = supabase.from("activities").select("*, clients(name), leads(company_name), deals(deal_name)").order("activity_date", { ascending: false }).limit(limit);
      if (args.type) query = query.eq("activity_type", args.type as string);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data;
    }
    case "activity_create": {
      const { data, error } = await supabase.from("activities").insert(args as Record<string, unknown>).select().single();
      if (error) throw new Error(error.message);
      return data;
    }

    // ==================== Estimates ====================
    case "estimate_list": {
      let query = supabase.from("estimates").select("*, clients(name, email)").order("created_at", { ascending: false }).limit(limit);
      if (args.status) query = query.eq("status", args.status as string);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data;
    }
    case "estimate_get": {
      const { data, error } = await supabase.from("estimates").select("*, clients(name, email), estimate_items(*)").eq("id", args.id as string).single();
      if (error) throw new Error(error.message);
      return data;
    }
    case "estimate_create": {
      const { data, error } = await supabase.from("estimates").insert(args as Record<string, unknown>).select().single();
      if (error) throw new Error(error.message);
      return data;
    }

    // ==================== Purchase Orders ====================
    case "purchase_order_list": {
      let query = supabase.from("purchase_orders").select("*, clients(name, email)").order("created_at", { ascending: false }).limit(limit);
      if (args.status) query = query.eq("status", args.status as string);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data;
    }
    case "purchase_order_get": {
      const { data, error } = await supabase.from("purchase_orders").select("*, clients(name, email), purchase_order_items(*)").eq("id", args.id as string).single();
      if (error) throw new Error(error.message);
      return data;
    }
    case "purchase_order_create": {
      const { data, error } = await supabase.from("purchase_orders").insert(args as Record<string, unknown>).select().single();
      if (error) throw new Error(error.message);
      return data;
    }

    // ==================== Employees ====================
    case "employee_list": {
      let query = supabase.from("employees").select("*").order("created_at", { ascending: false }).limit(limit);
      if (args.status) query = query.eq("status", args.status as string);
      if (args.department) query = query.eq("department", args.department as string);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data;
    }
    case "employee_get": {
      const { data, error } = await supabase.from("employees").select("*").eq("id", args.id as string).single();
      if (error) throw new Error(error.message);
      return data;
    }
    case "employee_create": {
      const { data, error } = await supabase.from("employees").insert(args as Record<string, unknown>).select().single();
      if (error) throw new Error(error.message);
      return data;
    }
    case "employee_update": {
      const { id, ...updateData } = args;
      const { data, error } = await supabase.from("employees").update(updateData).eq("id", id as string).select().single();
      if (error) throw new Error(error.message);
      return data;
    }

    // ==================== Attendance ====================
    case "attendance_list": {
      let query = supabase.from("attendance_records").select("*, employees(name, employee_number)").order("work_date", { ascending: false }).limit(limit);
      if (args.employee_id) query = query.eq("employee_id", args.employee_id as string);
      if (args.date_from) query = query.gte("work_date", args.date_from as string);
      if (args.date_to) query = query.lte("work_date", args.date_to as string);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data;
    }
    case "attendance_clock_in": {
      const today = new Date().toISOString().split("T")[0];
      const now = new Date().toISOString();
      const { data, error } = await supabase.from("attendance_records").insert({
        employee_id: args.employee_id,
        work_date: today,
        clock_in: now,
        status: "present",
        note: args.note,
      }).select().single();
      if (error) throw new Error(error.message);
      return data;
    }
    case "attendance_clock_out": {
      const today = new Date().toISOString().split("T")[0];
      const now = new Date().toISOString();
      const { data, error } = await supabase.from("attendance_records").update({
        clock_out: now,
        note: args.note,
      }).eq("employee_id", args.employee_id as string).eq("work_date", today).select().single();
      if (error) throw new Error(error.message);
      return data;
    }

    // ==================== Payroll ====================
    case "payroll_list": {
      let query = supabase.from("payroll_records").select("*, employees(name, employee_number)").order("payment_date", { ascending: false }).limit(limit);
      if (args.status) query = query.eq("status", args.status as string);
      if (args.employee_id) query = query.eq("employee_id", args.employee_id as string);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data;
    }
    case "payroll_get": {
      const { data, error } = await supabase.from("payroll_records").select("*, employees(name, employee_number)").eq("id", args.id as string).single();
      if (error) throw new Error(error.message);
      return data;
    }

    // ==================== Leave Requests ====================
    case "leave_balance_list": {
      let query = supabase.from("paid_leave_balances").select("*, employees(name, employee_number)").order("fiscal_year", { ascending: false }).limit(limit);
      if (args.employee_id) query = query.eq("employee_id", args.employee_id as string);
      if (args.fiscal_year) query = query.eq("fiscal_year", args.fiscal_year as number);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data;
    }

    // ==================== Wiki ====================
    case "wiki_list": {
      let query = supabase.from("wiki_pages").select("id, title, category, updated_at, is_published").order("updated_at", { ascending: false }).limit(limit);
      if (args.category) query = query.eq("category", args.category as string);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data;
    }
    case "wiki_search": {
      const { data, error } = await supabase
        .from("wiki_pages")
        .select("id, title, category, updated_at")
        .or(`title.ilike.%${args.query as string}%,content.ilike.%${args.query as string}%`)
        .limit(limit);
      if (error) throw new Error(error.message);
      return data;
    }
    case "wiki_get": {
      const { data, error } = await supabase.from("wiki_pages").select("*").eq("id", args.id as string).single();
      if (error) throw new Error(error.message);
      return data;
    }
    case "wiki_create": {
      const { data, error } = await supabase.from("wiki_pages").insert(args as Record<string, unknown>).select().single();
      if (error) throw new Error(error.message);
      return data;
    }
    case "wiki_update": {
      const { id, ...updateData } = args;
      const { data, error } = await supabase.from("wiki_pages").update(updateData).eq("id", id as string).select().single();
      if (error) throw new Error(error.message);
      return data;
    }

    // ==================== Accounting ====================
    case "account_list": {
      let query = supabase.from("accounts").select("*").order("account_code", { ascending: true }).limit(limit);
      if (args.type) query = query.eq("account_type", args.type as string);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data;
    }
    case "journal_list": {
      let query = supabase.from("journal_entries").select("*").order("entry_date", { ascending: false }).limit(limit);
      if (args.start_date) query = query.gte("entry_date", args.start_date as string);
      if (args.end_date) query = query.lte("entry_date", args.end_date as string);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data;
    }
    case "journal_get": {
      const { data, error } = await supabase.from("journal_entries").select("*, journal_entry_lines(*, accounts(account_name, account_code))").eq("id", args.id as string).single();
      if (error) throw new Error(error.message);
      return data;
    }
    case "journal_create": {
      const { lines, ...entryData } = args;
      const { data: entry, error: entryError } = await supabase.from("journal_entries").insert(entryData as Record<string, unknown>).select().single();
      if (entryError) throw new Error(entryError.message);
      
      if (lines && Array.isArray(lines)) {
        const linesWithEntry = (lines as Record<string, unknown>[]).map(line => ({
          ...line,
          journal_entry_id: entry.id,
        }));
        const { error: linesError } = await supabase.from("journal_entry_lines").insert(linesWithEntry);
        if (linesError) throw new Error(linesError.message);
      }
      
      return entry;
    }
    case "expense_list": {
      let query = supabase.from("expense_claims").select("*").order("created_at", { ascending: false }).limit(limit);
      if (args.status) query = query.eq("status", args.status as string);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data;
    }
    case "expense_get": {
      const { data, error } = await supabase.from("expense_claims").select("*, expense_items(*)").eq("id", args.id as string).single();
      if (error) throw new Error(error.message);
      return data;
    }
    case "trial_balance": {
      // Get all accounts with their journal entry lines
      const { data: accounts, error: accountsError } = await supabase.from("accounts").select("*").order("account_code");
      if (accountsError) throw new Error(accountsError.message);
      
      let query = supabase.from("journal_entry_lines").select("account_id, debit_amount, credit_amount");
      if (args.date) {
        // Would need to join with journal_entries to filter by date
      }
      const { data: lines, error: linesError } = await query;
      if (linesError) throw new Error(linesError.message);
      
      // Calculate balances
      const balances = accounts.map((account: { id: string; account_name: string; account_code: string; account_type: string }) => {
        const accountLines = (lines || []).filter((l: { account_id: string }) => l.account_id === account.id);
        const totalDebit = accountLines.reduce((sum: number, l: { debit_amount: number }) => sum + (l.debit_amount || 0), 0);
        const totalCredit = accountLines.reduce((sum: number, l: { credit_amount: number }) => sum + (l.credit_amount || 0), 0);
        return {
          account_code: account.account_code,
          account_name: account.account_name,
          account_type: account.account_type,
          debit: totalDebit,
          credit: totalCredit,
          balance: totalDebit - totalCredit,
        };
      });
      
      return balances;
    }

    // ==================== Fixed Assets ====================
    case "fixed_asset_list": {
      let query = supabase.from("fixed_assets").select("*").order("created_at", { ascending: false }).limit(limit);
      if (args.category) query = query.eq("asset_category", args.category as string);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data;
    }
    case "fixed_asset_get": {
      const { data, error } = await supabase.from("fixed_assets").select("*, depreciation_schedules(*)").eq("id", args.id as string).single();
      if (error) throw new Error(error.message);
      return data;
    }

    // ==================== IT Assets ====================
    case "it_asset_list": {
      let query = supabase.from("it_assets").select("*, employees(name)").order("created_at", { ascending: false }).limit(limit);
      if (args.type) query = query.eq("asset_type", args.type as string);
      if (args.status) query = query.eq("status", args.status as string);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data;
    }
    case "it_asset_get": {
      const { data, error } = await supabase.from("it_assets").select("*, employees(name, employee_number)").eq("id", args.id as string).single();
      if (error) throw new Error(error.message);
      return data;
    }
    case "it_asset_create": {
      const { data, error } = await supabase.from("it_assets").insert(args as Record<string, unknown>).select().single();
      if (error) throw new Error(error.message);
      return data;
    }

    // ==================== Tasks ====================
    case "task_list": {
      let query = supabase.from("tasks").select("*, employees(name)").order("created_at", { ascending: false }).limit(limit);
      if (args.status) query = query.eq("status", args.status as string);
      if (args.priority) query = query.eq("priority", args.priority as string);
      if (args.assignee_id) query = query.eq("assignee_id", args.assignee_id as string);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data;
    }
    case "task_get": {
      const { data, error } = await supabase.from("tasks").select("*, employees(name)").eq("id", args.id as string).single();
      if (error) throw new Error(error.message);
      return data;
    }
    case "task_create": {
      const { data, error } = await supabase.from("tasks").insert(args as Record<string, unknown>).select().single();
      if (error) throw new Error(error.message);
      return data;
    }
    case "task_update": {
      const { id, ...updateData } = args;
      const { data, error } = await supabase.from("tasks").update(updateData).eq("id", id as string).select().single();
      if (error) throw new Error(error.message);
      return data;
    }

    // ==================== Trust Passport ====================
    case "trust_passport_get": {
      let query = supabase.from("trust_passports").select("*");
      if (args.user_id) {
        query = query.eq("user_id", args.user_id as string);
      }
      const { data, error } = await query.limit(1).single();
      if (error) throw new Error(error.message);
      return data;
    }
    case "trust_score_history": {
      const { data, error } = await supabase.from("trust_score_history").select("*").order("created_at", { ascending: false }).limit(limit);
      if (error) throw new Error(error.message);
      return data;
    }

    // ==================== Boost Requests ====================
    case "boost_request_list": {
      let query = supabase.from("boost_requests").select("*, invoices(invoice_number, total_amount)").order("created_at", { ascending: false }).limit(limit);
      if (args.status) query = query.eq("status", args.status as string);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data;
    }
    case "boost_request_create": {
      const feePercentage = 3; // 3% fee
      const requestedAmount = args.requested_amount as number;
      const feeAmount = requestedAmount * (feePercentage / 100);
      const netAmount = requestedAmount - feeAmount;
      
      const { data, error } = await supabase.from("boost_requests").insert({
        invoice_id: args.invoice_id,
        requested_amount: requestedAmount,
        fee_percentage: feePercentage,
        fee_amount: feeAmount,
        net_amount: netAmount,
        status: "pending",
      }).select().single();
      if (error) throw new Error(error.message);
      return data;
    }

    // ==================== Notifications ====================
    case "notification_list": {
      let query = supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(limit);
      if (args.is_read !== undefined) query = query.eq("is_read", args.is_read as boolean);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data;
    }
    case "notification_mark_read": {
      if (args.id) {
        const { data, error } = await supabase.from("notifications").update({ is_read: true }).eq("id", args.id as string).select().single();
        if (error) throw new Error(error.message);
        return data;
      } else {
        const { error } = await supabase.from("notifications").update({ is_read: true }).eq("is_read", false);
        if (error) throw new Error(error.message);
        return { success: true, message: "All notifications marked as read" };
      }
    }

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = authHeader.replace("Bearer ", "");
    if (!validateApiKey(apiKey)) {
      return new Response(
        JSON.stringify({ error: "Invalid API key format" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { jsonrpc, id, method, params } = body;

    if (jsonrpc !== "2.0") {
      return new Response(
        JSON.stringify({
          jsonrpc: "2.0",
          id,
          error: { code: -32600, message: "Invalid Request" },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let result: unknown;

    switch (method) {
      case "initialize":
        result = {
          protocolVersion: MCP_VERSION,
          capabilities: {
            tools: {},
          },
          serverInfo: {
            name: "totonos-mcp",
            version: "1.0.0",
          },
        };
        break;

      case "tools/list":
        result = {
          tools: mcpTools,
        };
        break;

      case "tools/call":
        const { name, arguments: callArgs } = params;
        const toolResult = await executeTool(supabase, name, callArgs || {});
        result = {
          content: [
            {
              type: "text",
              text: JSON.stringify(toolResult, null, 2),
            },
          ],
        };
        break;

      case "ping":
        result = {};
        break;

      default:
        return new Response(
          JSON.stringify({
            jsonrpc: "2.0",
            id,
            error: { code: -32601, message: `Method not found: ${method}` },
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(
      JSON.stringify({
        jsonrpc: "2.0",
        id,
        result,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("MCP error:", error);
    return new Response(
      JSON.stringify({
        jsonrpc: "2.0",
        id: null,
        error: {
          code: -32603,
          message: error instanceof Error ? error.message : "Internal error",
        },
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
