import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { consumeCompanyCredits, canUseCredits, CREDIT_COSTS } from "../_shared/credits.ts";
import { fetchWithRetry, getUserFriendlyError } from "../_shared/fetch-utils.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CommandRequest {
  emailId: string;
  companyId: string;
  userId?: string;
  spreadsheetData?: Array<{
    filename: string;
    formattedContent: string;
    rowCount: number;
  }>;
}

interface CommandResponse {
  success: boolean;
  response?: string;
  error?: string;
  creditsUsed?: number;
}

// Define available tools for email commands
const EMAIL_TOOLS = [
  {
    name: "search_leads",
    description: "リードを検索します",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "検索キーワード" },
      },
    },
  },
  {
    name: "create_lead",
    description: "新しいリードを作成します",
    parameters: {
      type: "object",
      properties: {
        company_name: { type: "string", description: "会社名" },
        contact_name: { type: "string", description: "担当者名" },
        email: { type: "string", description: "メールアドレス" },
        phone: { type: "string", description: "電話番号" },
        notes: { type: "string", description: "備考" },
      },
      required: ["company_name"],
    },
  },
  {
    name: "bulk_create_leads",
    description: "複数のリードを一括登録します。CSVやExcelデータからリードを作成する場合に使用します",
    parameters: {
      type: "object",
      properties: {
        leads: {
          type: "array",
          description: "登録するリードの配列",
          items: {
            type: "object",
            properties: {
              company_name: { type: "string", description: "会社名" },
              contact_name: { type: "string", description: "担当者名" },
              email: { type: "string", description: "メールアドレス" },
              phone: { type: "string", description: "電話番号" },
              notes: { type: "string", description: "備考" },
            },
            required: ["company_name"],
          },
        },
      },
      required: ["leads"],
    },
  },
  {
    name: "search_clients",
    description: "取引先を検索します",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "検索キーワード" },
      },
    },
  },
  {
    name: "search_invoices",
    description: "請求書を検索します",
    parameters: {
      type: "object",
      properties: {
        status: { type: "string", description: "ステータス (draft, sent, paid, overdue)" },
        client_name: { type: "string", description: "取引先名" },
      },
    },
  },
  {
    name: "get_stats",
    description: "ダッシュボード統計を取得します",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "analyze_spreadsheet",
    description: "添付されたスプレッドシートデータを分析します",
    parameters: {
      type: "object",
      properties: {
        analysis_type: { 
          type: "string", 
          description: "分析タイプ: summary (要約), list (一覧表示), insights (洞察)" 
        },
      },
    },
  },
];

interface ToolResult {
  tool_call_id: string;
  output: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function executeToolCall(
  supabase: any,
  toolName: string,
  args: Record<string, unknown>,
  companyId: string,
  spreadsheetContent?: string
): Promise<string> {
  console.log(`Executing tool: ${toolName} for company: ${companyId}`, args);

  switch (toolName) {
    case "search_leads": {
      const query = args.query as string || "";
      const { data, error } = await supabase
        .from("leads")
        .select("id, company_name, contact_name, email, status")
        .eq("company_id", companyId)
        .or(`company_name.ilike.%${query}%,contact_name.ilike.%${query}%`)
        .limit(10);
      
      if (error) {
        console.error("search_leads error:", error);
        return JSON.stringify({ error: error.message });
      }
      return JSON.stringify(data || []);
    }

    case "create_lead": {
      const insertData: Record<string, unknown> = {
        company_id: companyId,
        company_name: args.company_name as string,
        status: "new",
        source: "email",
      };
      if (args.contact_name) insertData.contact_name = args.contact_name;
      if (args.email) insertData.email = args.email;
      if (args.phone) insertData.phone = args.phone;
      if (args.notes) insertData.notes = args.notes;

      const { data, error } = await supabase
        .from("leads")
        .insert(insertData)
        .select()
        .single();
      
      if (error) {
        console.error("create_lead error:", error);
        return JSON.stringify({ error: error.message });
      }
      return JSON.stringify({ success: true, lead: data });
    }

    case "bulk_create_leads": {
      const leads = args.leads as Array<Record<string, unknown>>;
      if (!leads || !Array.isArray(leads) || leads.length === 0) {
        return JSON.stringify({ error: "リードデータがありません" });
      }

      // Limit bulk insert to 100 leads at a time
      const maxLeads = leads.slice(0, 100);
      
      const insertData = maxLeads.map(lead => ({
        company_id: companyId,
        company_name: lead.company_name as string,
        contact_name: lead.contact_name as string || null,
        email: lead.email as string || null,
        phone: lead.phone as string || null,
        notes: lead.notes as string || null,
        status: "new",
        source: "email",
      }));

      const { data, error } = await supabase
        .from("leads")
        .insert(insertData)
        .select();
      
      if (error) {
        console.error("bulk_create_leads error:", error);
        return JSON.stringify({ error: error.message });
      }
      
      const message = leads.length > 100 
        ? `${data.length}件のリードを登録しました（上限100件のため、残り${leads.length - 100}件は未登録）`
        : `${data.length}件のリードを登録しました`;
      
      return JSON.stringify({ 
        success: true, 
        message,
        leads: data 
      });
    }

    case "search_clients": {
      const query = args.query as string || "";
      const { data, error } = await supabase
        .from("clients")
        .select("id, name, email, phone")
        .eq("company_id", companyId)
        .ilike("name", `%${query}%`)
        .limit(10);
      
      if (error) {
        console.error("search_clients error:", error);
        return JSON.stringify({ error: error.message });
      }
      return JSON.stringify(data || []);
    }

    case "search_invoices": {
      let query = supabase
        .from("invoices")
        .select("id, invoice_number, title, amount, status, due_date")
        .eq("company_id", companyId)
        .limit(10);
      
      if (args.status) {
        query = query.eq("status", args.status);
      }
      
      const { data, error } = await query;
      if (error) {
        console.error("search_invoices error:", error);
        return JSON.stringify({ error: error.message });
      }
      return JSON.stringify(data || []);
    }

    case "get_stats": {
      const [leadsResult, invoicesResult, clientsResult] = await Promise.all([
        supabase.from("leads").select("id", { count: "exact" }).eq("company_id", companyId),
        supabase.from("invoices").select("id, amount, status").eq("company_id", companyId),
        supabase.from("clients").select("id", { count: "exact" }).eq("company_id", companyId),
      ]);

      // Calculate unpaid amount manually
      const invoices = invoicesResult.data || [];
      let unpaidAmount = 0;
      for (const inv of invoices) {
        if (inv && typeof inv === "object" && "status" in inv && inv.status !== "paid") {
          unpaidAmount += (inv as { amount?: number }).amount || 0;
        }
      }

      const stats = {
        total_leads: leadsResult.count || 0,
        total_clients: clientsResult.count || 0,
        total_invoices: invoices.length,
        unpaid_amount: unpaidAmount,
      };
      return JSON.stringify(stats);
    }

    case "analyze_spreadsheet": {
      if (!spreadsheetContent) {
        return JSON.stringify({ error: "添付されたスプレッドシートがありません" });
      }
      return JSON.stringify({ 
        success: true, 
        content: spreadsheetContent,
        analysis_type: args.analysis_type || "summary"
      });
    }

    default:
      return JSON.stringify({ error: `Unknown tool: ${toolName}` });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function processCommand(
  supabase: any,
  command: string,
  companyId: string,
  spreadsheetContent?: string
): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  
  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY not configured");
  }

  // スプレッドシートデータがある場合はシステムプロンプトに追加
  let spreadsheetContext = "";
  if (spreadsheetContent) {
    spreadsheetContext = `\n\n【添付されたスプレッドシートデータ】\n${spreadsheetContent.substring(0, 5000)}`;
  }

  const systemPrompt = `あなたはTotonosのAIアシスタントです。
メールで受け取った指示に従ってシステムを操作します。
利用可能なツールを使って、ユーザーのリクエストに応えてください。

${spreadsheetContent ? `添付されたCSV/Excelデータがある場合:
- 「リードに登録して」などの指示があれば、bulk_create_leads ツールを使用してデータを一括登録してください
- データの分析や一覧表示が必要な場合は analyze_spreadsheet ツールを使用してください` : ""}

回答は日本語で、簡潔にまとめてください。
ツールの実行結果に基づいて、分かりやすく報告してください。`;

  // First call to determine which tools to use
  const response = await fetchWithRetry("https://api.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${LOVABLE_API_KEY}`,
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: command + spreadsheetContext }
      ],
      tools: EMAIL_TOOLS.map(tool => ({
        type: "function",
        function: tool,
      })),
      tool_choice: "auto",
      temperature: 0.3,
      max_tokens: 2000,
    }),
    maxRetries: 3,
    retryDelayMs: 1000,
    timeoutMs: 30000,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("AI API error:", response.status, errorText);
    throw new Error(`AI API failed: ${response.status}`);
  }

  const data = await response.json();
  const message = data.choices?.[0]?.message;

  // If no tool calls, return the content directly
  if (!message.tool_calls || message.tool_calls.length === 0) {
    return message.content || "リクエストを処理できませんでした。";
  }

  // Execute tool calls
  const toolResults: ToolResult[] = [];
  for (const toolCall of message.tool_calls) {
    const result = await executeToolCall(
      supabase,
      toolCall.function.name,
      JSON.parse(toolCall.function.arguments || "{}"),
      companyId,
      spreadsheetContent
    );
    toolResults.push({
      tool_call_id: toolCall.id,
      output: result,
    });
  }

  // Second call to summarize results
  const summaryResponse = await fetchWithRetry("https://api.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${LOVABLE_API_KEY}`,
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: command + spreadsheetContext },
        message,
        ...toolResults.map(result => ({
          role: "tool",
          tool_call_id: result.tool_call_id,
          content: result.output,
        })),
      ],
      temperature: 0.3,
      max_tokens: 1000,
    }),
    maxRetries: 3,
    retryDelayMs: 1000,
    timeoutMs: 30000,
  });

  if (!summaryResponse.ok) {
    const errorText = await summaryResponse.text();
    console.error("AI summary error:", response.status, errorText);
    throw new Error(`AI summary failed: ${summaryResponse.status}`);
  }

  const summaryData = await summaryResponse.json();
  return summaryData.choices?.[0]?.message?.content || "処理が完了しました。";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { emailId, companyId, spreadsheetData }: CommandRequest = await req.json();

    if (!emailId || !companyId) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing email command for ${emailId}${spreadsheetData?.length ? ` with ${spreadsheetData.length} spreadsheet(s)` : ""}`);

    // Check credits
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hasCredits = await canUseCredits(supabase as any, companyId, "ai_email_command");
    if (!hasCredits) {
      return new Response(
        JSON.stringify({ success: false, error: "クレジットが不足しています" }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch email content
    const { data: email, error: fetchError } = await supabase
      .from("inbound_emails")
      .select("subject, text_body, html_body, from_email")
      .eq("id", emailId)
      .single();

    if (fetchError || !email) {
      console.error("Failed to fetch email:", fetchError);
      return new Response(
        JSON.stringify({ success: false, error: "メールが見つかりません" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const command = email.text_body || email.html_body?.replace(/<[^>]*>/g, "") || "";

    // スプレッドシートコンテンツを結合
    let combinedSpreadsheetContent: string | undefined;
    if (spreadsheetData && spreadsheetData.length > 0) {
      combinedSpreadsheetContent = spreadsheetData
        .map(s => `【${s.filename} (${s.rowCount}行)】\n${s.formattedContent}`)
        .join("\n\n");
    }

    // Process the command
    const commandResponse = await processCommand(supabase, command, companyId, combinedSpreadsheetContent);

    // Consume credits
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const consumeResult = await consumeCompanyCredits(
      supabase as any,
      companyId,
      "ai_email_command",
      `メール経由AI指示: ${email.subject?.substring(0, 30) || "(件名なし)"}`,
      { email_id: emailId, from: email.from_email, has_spreadsheet: !!spreadsheetData?.length }
    );

    if (!consumeResult.success) {
      console.error("Failed to consume credits:", consumeResult.error);
    }

    // Update email with command response
    await supabase
      .from("inbound_emails")
      .update({
        ai_command_response: commandResponse,
        ai_command_executed_at: new Date().toISOString(),
        status: "processed",
      })
      .eq("id", emailId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        response: commandResponse,
        creditsUsed: CREDIT_COSTS.ai_email_command.cost 
      } as CommandResponse),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing command:", error);
    const userFriendlyError = getUserFriendlyError(error);
    return new Response(
      JSON.stringify({ success: false, error: userFriendlyError }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
