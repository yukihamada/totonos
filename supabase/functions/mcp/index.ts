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
  // Invoices
  {
    name: "invoice_list",
    description: "請求書の一覧を取得します",
    inputSchema: {
      type: "object",
      properties: {
        status: { type: "string", description: "フィルタ: draft, sent, paid, overdue" },
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
        client_name: { type: "string", description: "取引先名" },
        client_email: { type: "string", description: "メールアドレス" },
        items: { type: "array", description: "明細項目" },
        due_date: { type: "string", description: "支払期限 (YYYY-MM-DD)" },
      },
      required: ["client_name", "items"],
    },
  },
  // Contracts
  {
    name: "list_contracts",
    description: "契約書の一覧を取得します",
    inputSchema: {
      type: "object",
      properties: {
        status: { type: "string", description: "フィルタ: draft, pending, signed, expired" },
        limit: { type: "number", description: "取得件数" },
      },
    },
  },
  {
    name: "contract_get",
    description: "契約書の詳細を取得します",
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
        partner: { type: "string", description: "契約相手" },
        content: { type: "string", description: "契約内容" },
      },
      required: ["title", "partner"],
    },
  },
  // CRM - Leads
  {
    name: "list_leads",
    description: "リードの一覧を取得します",
    inputSchema: {
      type: "object",
      properties: {
        status: { type: "string", description: "フィルタ: new, contacted, qualified, lost" },
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
        name: { type: "string", description: "名前" },
        email: { type: "string", description: "メールアドレス" },
        company: { type: "string", description: "会社名" },
        source: { type: "string", description: "流入元" },
      },
      required: ["name", "email"],
    },
  },
  // CRM - Deals
  {
    name: "list_deals",
    description: "商談の一覧を取得します",
    inputSchema: {
      type: "object",
      properties: {
        stage: { type: "string", description: "ステージでフィルタ" },
        limit: { type: "number", description: "取得件数" },
      },
    },
  },
  {
    name: "deal_create",
    description: "商談を作成します",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "商談タイトル" },
        value: { type: "number", description: "金額" },
        stage: { type: "string", description: "ステージ" },
        lead_id: { type: "string", description: "リードID" },
      },
      required: ["title", "value"],
    },
  },
  {
    name: "get_pipeline_stats",
    description: "パイプラインの統計を取得します",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  // Employees
  {
    name: "list_employees",
    description: "従業員の一覧を取得します",
    inputSchema: {
      type: "object",
      properties: {
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
  // Wiki
  {
    name: "search_wiki",
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
    name: "wiki_create",
    description: "Wikiページを作成します",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "タイトル" },
        content: { type: "string", description: "内容（Markdown）" },
        category: { type: "string", description: "カテゴリ" },
      },
      required: ["title", "content"],
    },
  },
  // Accounting
  {
    name: "get_trial_balance",
    description: "試算表を取得します",
    inputSchema: {
      type: "object",
      properties: {
        year: { type: "number", description: "年度" },
        month: { type: "number", description: "月" },
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
    name: "expense_list",
    description: "経費一覧を取得します",
    inputSchema: {
      type: "object",
      properties: {
        status: { type: "string", description: "ステータス" },
        limit: { type: "number", description: "取得件数" },
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
    // Invoices
    case "invoice_list": {
      let query = supabase.from("invoices").select("*").order("created_at", { ascending: false }).limit(limit);
      if (args.status) query = query.eq("status", args.status as string);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data;
    }
    case "invoice_get": {
      const { data, error } = await supabase.from("invoices").select("*").eq("id", args.id as string).single();
      if (error) throw new Error(error.message);
      return data;
    }
    case "invoice_create": {
      const insertData = args as Record<string, unknown>;
      const { data, error } = await supabase.from("invoices").insert(insertData).select().single();
      if (error) throw new Error(error.message);
      return data;
    }

    // Contracts
    case "list_contracts": {
      let query = supabase.from("contracts").select("*").order("created_at", { ascending: false }).limit(limit);
      if (args.status) query = query.eq("status", args.status as string);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data;
    }
    case "contract_get": {
      const { data, error } = await supabase.from("contracts").select("*").eq("id", args.id as string).single();
      if (error) throw new Error(error.message);
      return data;
    }
    case "contract_create": {
      const insertData = args as Record<string, unknown>;
      const { data, error } = await supabase.from("contracts").insert(insertData).select().single();
      if (error) throw new Error(error.message);
      return data;
    }

    // Leads
    case "list_leads": {
      let query = supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(limit);
      if (args.status) query = query.eq("status", args.status as string);
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
      const insertData = args as Record<string, unknown>;
      const { data, error } = await supabase.from("leads").insert(insertData).select().single();
      if (error) throw new Error(error.message);
      return data;
    }

    // Deals
    case "list_deals": {
      let query = supabase.from("deals").select("*").order("created_at", { ascending: false }).limit(limit);
      if (args.stage) query = query.eq("stage", args.stage as string);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data;
    }
    case "deal_create": {
      const insertData = args as Record<string, unknown>;
      const { data, error } = await supabase.from("deals").insert(insertData).select().single();
      if (error) throw new Error(error.message);
      return data;
    }
    case "get_pipeline_stats": {
      const { data, error } = await supabase.from("deals").select("stage, amount");
      if (error) throw new Error(error.message);
      const stats = (data || []).reduce((acc: Record<string, { count: number; value: number }>, deal: { stage: string; amount: number }) => {
        if (!acc[deal.stage]) acc[deal.stage] = { count: 0, value: 0 };
        acc[deal.stage].count++;
        acc[deal.stage].value += deal.amount || 0;
        return acc;
      }, {});
      return stats;
    }

    // Employees
    case "list_employees": {
      let query = supabase.from("employees").select("*").order("created_at", { ascending: false }).limit(limit);
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

    // Wiki
    case "search_wiki": {
      const { data, error } = await supabase
        .from("wiki_pages")
        .select("*")
        .ilike("title", `%${args.query as string}%`)
        .limit(limit);
      if (error) throw new Error(error.message);
      return data;
    }
    case "wiki_create": {
      const insertData = args as Record<string, unknown>;
      const { data, error } = await supabase.from("wiki_pages").insert(insertData).select().single();
      if (error) throw new Error(error.message);
      return data;
    }

    // Accounting
    case "get_trial_balance": {
      const { data, error } = await supabase.from("journal_entries").select("*").limit(100);
      if (error) throw new Error(error.message);
      const balances: Record<string, number> = {};
      return balances;
    }
    case "journal_list": {
      let query = supabase.from("journal_entries").select("*").order("entry_date", { ascending: false }).limit(limit);
      if (args.start_date) query = query.gte("entry_date", args.start_date as string);
      if (args.end_date) query = query.lte("entry_date", args.end_date as string);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data;
    }
    case "expense_list": {
      let query = supabase.from("expense_claims").select("*").order("created_at", { ascending: false }).limit(limit);
      if (args.status) query = query.eq("status", args.status as string);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data;
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
        const { name, arguments: args } = params;
        const toolResult = await executeTool(supabase, name, args || {});
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
        error: { code: -32603, message: error instanceof Error ? error.message : "Internal error" },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
