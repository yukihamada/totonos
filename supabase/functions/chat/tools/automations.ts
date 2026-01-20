import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

// Automation tools for AI agent
export const automationTools = [
  {
    name: "automation_create",
    description: `定期的な自動タスクを登録します。例: 「毎月15日にA社へ10万円の請求書を送る」
    
使用例:
- 毎月の定期請求書発行
- 定期的なメール送信
- 定期契約の自動更新リマインダー

【重要】必要な情報が不足している場合は、このツールを呼び出す前にユーザーに確認してください:
- 請求書の場合: クライアント名、金額、発行日（毎月何日か）
- メールの場合: 宛先、件名、内容、送信日
- 契約の場合: クライアント名、契約タイトル、金額`,
    input_schema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "自動化タスクの名前（例: A社への月次請求）",
        },
        description: {
          type: "string",
          description: "タスクの説明",
        },
        trigger_type: {
          type: "string",
          enum: ["schedule"],
          description: "トリガータイプ（現在はscheduleのみ対応）",
        },
        schedule_description: {
          type: "string",
          description: "スケジュールの説明（例: 毎月1日、毎週月曜日）",
        },
        schedule_day: {
          type: "number",
          description: "実行日（月次の場合: 1-28）",
        },
        schedule_time: {
          type: "string",
          description: "実行時刻（例: 09:00）",
        },
        action_type: {
          type: "string",
          enum: ["create_invoice", "create_contract", "send_email", "create_lead", "create_expense"],
          description: "実行するアクションの種類",
        },
        client_name: {
          type: "string",
          description: "対象クライアント名（新規の場合は自動作成）",
        },
        action_config: {
          type: "object",
          description: "アクション固有の設定",
          properties: {
            // 請求書用
            amount: { type: "number", description: "金額" },
            tax_rate: { type: "number", description: "税率（デフォルト10%）" },
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  description: { type: "string" },
                  quantity: { type: "number" },
                  unit_price: { type: "number" },
                },
              },
              description: "請求書の明細項目",
            },
            // メール用
            subject: { type: "string", description: "メール件名" },
            body: { type: "string", description: "メール本文" },
            to_email: { type: "string", description: "送信先メールアドレス" },
            // 契約用
            contract_title: { type: "string", description: "契約タイトル" },
            contract_content: { type: "string", description: "契約内容" },
          },
        },
      },
      required: ["name", "trigger_type", "action_type", "schedule_description"],
    },
  },
  {
    name: "automation_list",
    description: "登録されている自動化タスクの一覧を取得します",
    input_schema: {
      type: "object",
      properties: {
        include_inactive: {
          type: "boolean",
          description: "無効なタスクも含めるか",
        },
      },
    },
  },
  {
    name: "automation_update",
    description: "自動化タスクを更新します（有効/無効の切り替え、設定変更）",
    input_schema: {
      type: "object",
      properties: {
        automation_id: {
          type: "string",
          description: "更新する自動化タスクのID",
        },
        is_active: {
          type: "boolean",
          description: "有効/無効",
        },
        name: {
          type: "string",
          description: "新しい名前",
        },
        action_config: {
          type: "object",
          description: "新しいアクション設定",
        },
      },
      required: ["automation_id"],
    },
  },
  {
    name: "automation_delete",
    description: "自動化タスクを削除します",
    input_schema: {
      type: "object",
      properties: {
        automation_id: {
          type: "string",
          description: "削除する自動化タスクのID",
        },
      },
      required: ["automation_id"],
    },
  },
  {
    name: "automation_run_now",
    description: "自動化タスクを今すぐ手動で実行します",
    input_schema: {
      type: "object",
      properties: {
        automation_id: {
          type: "string",
          description: "実行する自動化タスクのID",
        },
      },
      required: ["automation_id"],
    },
  },
];

// Helper: Generate cron expression from schedule description
function generateCronExpression(scheduleDay?: number, scheduleTime?: string): string {
  const hour = scheduleTime ? parseInt(scheduleTime.split(":")[0]) : 9;
  const minute = scheduleTime ? parseInt(scheduleTime.split(":")[1]) : 0;
  const day = scheduleDay || 1;
  
  // Monthly cron: minute hour day * *
  return `${minute} ${hour} ${day} * *`;
}

// Helper: Calculate next run date
function calculateNextRunDate(scheduleDay?: number, scheduleTime?: string): Date {
  const now = new Date();
  const day = scheduleDay || 1;
  const [hour, minute] = (scheduleTime || "09:00").split(":").map(Number);
  
  const nextRun = new Date(now.getFullYear(), now.getMonth(), day, hour, minute, 0);
  
  // If the day has passed this month, schedule for next month
  if (nextRun <= now) {
    nextRun.setMonth(nextRun.getMonth() + 1);
  }
  
  return nextRun;
}

// Helper: Get or create client
async function getOrCreateClient(
  supabase: SupabaseClient,
  userId: string,
  clientName: string
): Promise<string | null> {
  // First try to find existing client
  const { data: existingClient } = await supabase
    .from("clients")
    .select("id")
    .eq("user_id", userId)
    .ilike("name", clientName)
    .maybeSingle();

  if (existingClient) {
    return existingClient.id;
  }

  // Create new client
  const { data: newClient, error } = await supabase
    .from("clients")
    .insert({ user_id: userId, name: clientName })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to create client:", error);
    return null;
  }

  return newClient.id;
}

// Helper: Get company ID for user
async function getCompanyIdForUser(supabase: SupabaseClient, userId: string): Promise<string | null> {
  const { data } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();
  
  return data?.company_id || null;
}

// Execute automation action
async function executeAutomationAction(
  supabase: SupabaseClient,
  userId: string,
  automation: {
    action_type: string;
    action_config: Record<string, unknown>;
    client_id: string | null;
  }
): Promise<{ success: boolean; result?: unknown; error?: string }> {
  const config = automation.action_config;
  
  switch (automation.action_type) {
    case "create_invoice": {
      // Generate invoice number
      const invoiceNumber = `INV-${Date.now().toString().slice(-8)}`;
      const amount = (config.amount as number) || 0;
      const taxRate = (config.tax_rate as number) || 10;
      const taxAmount = Math.floor(amount * taxRate / 100);
      
      const { data: invoice, error } = await supabase
        .from("invoices")
        .insert({
          user_id: userId,
          client_id: automation.client_id,
          invoice_number: invoiceNumber,
          status: "draft",
          issue_date: new Date().toISOString().split("T")[0],
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          subtotal: amount,
          tax_amount: taxAmount,
          total_amount: amount + taxAmount,
          notes: config.notes as string || "自動生成された請求書",
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Create invoice items if provided
      const items = config.items as Array<{ description: string; quantity: number; unit_price: number }> | undefined;
      if (items && items.length > 0) {
        await supabase.from("invoice_items").insert(
          items.map((item) => ({
            invoice_id: invoice.id,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            amount: item.quantity * item.unit_price,
          }))
        );
      }

      return { success: true, result: { invoice_id: invoice.id, invoice_number: invoiceNumber } };
    }

    case "create_contract": {
      const contractNumber = `CON-${Date.now().toString().slice(-8)}`;
      const amount = (config.amount as number) || 0;
      const taxRate = (config.tax_rate as number) || 10;
      const taxAmount = Math.floor(amount * taxRate / 100);

      const { data: contract, error } = await supabase
        .from("contracts")
        .insert({
          user_id: userId,
          client_id: automation.client_id,
          contract_number: contractNumber,
          title: (config.contract_title as string) || "自動生成契約書",
          content: config.contract_content as string,
          amount: amount,
          tax_amount: taxAmount,
          total_amount: amount + taxAmount,
          status: "draft",
          issue_date: new Date().toISOString().split("T")[0],
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, result: { contract_id: contract.id, contract_number: contractNumber } };
    }

    case "send_email": {
      // Queue email for sending
      const { error } = await supabase.from("email_logs").insert({
        user_id: userId,
        recipient_email: config.to_email as string,
        subject: config.subject as string,
        email_type: "automation",
        status: "pending",
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, result: { message: "メールを送信キューに追加しました" } };
    }

    default:
      return { success: false, error: `未対応のアクションタイプ: ${automation.action_type}` };
  }
}

export async function executeAutomationTool(
  toolName: string,
  input: Record<string, unknown>,
  userId: string,
  supabase: SupabaseClient
): Promise<unknown> {
  const companyId = await getCompanyIdForUser(supabase, userId);
  
  if (!companyId) {
    throw new Error("会社が登録されていません。先に会社を登録してください。");
  }

  switch (toolName) {
    case "automation_create": {
      // Get or create client if specified
      let clientId: string | null = null;
      if (input.client_name) {
        clientId = await getOrCreateClient(supabase, userId, input.client_name as string);
      }

      const scheduleDay = input.schedule_day as number | undefined;
      const scheduleTime = input.schedule_time as string | undefined;
      const cronExpression = generateCronExpression(scheduleDay, scheduleTime);
      const nextRunAt = calculateNextRunDate(scheduleDay, scheduleTime);

      const { data, error } = await supabase
        .from("ai_automations")
        .insert({
          company_id: companyId,
          user_id: userId,
          name: input.name as string,
          description: input.description as string,
          trigger_type: input.trigger_type as string,
          schedule_cron: cronExpression,
          schedule_description: input.schedule_description as string,
          action_type: input.action_type as string,
          action_config: input.action_config || {},
          client_id: clientId,
          next_run_at: nextRunAt.toISOString(),
        })
        .select(`
          *,
          clients(name)
        `)
        .single();

      if (error) {
        throw new Error(`自動化タスクの作成に失敗しました: ${error.message}`);
      }

      return {
        success: true,
        automation: data,
        message: `自動化タスク「${data.name}」を登録しました。次回実行: ${nextRunAt.toLocaleDateString("ja-JP")}`,
      };
    }

    case "automation_list": {
      const query = supabase
        .from("ai_automations")
        .select(`
          *,
          clients(name)
        `)
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });

      if (!input.include_inactive) {
        query.eq("is_active", true);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`自動化タスクの取得に失敗しました: ${error.message}`);
      }

      return {
        automations: data,
        count: data?.length || 0,
      };
    }

    case "automation_update": {
      const updateData: Record<string, unknown> = {};
      
      if (input.is_active !== undefined) updateData.is_active = input.is_active;
      if (input.name) updateData.name = input.name;
      if (input.action_config) updateData.action_config = input.action_config;

      const { data, error } = await supabase
        .from("ai_automations")
        .update(updateData)
        .eq("id", input.automation_id as string)
        .eq("company_id", companyId)
        .select()
        .single();

      if (error) {
        throw new Error(`自動化タスクの更新に失敗しました: ${error.message}`);
      }

      return {
        success: true,
        automation: data,
        message: `自動化タスク「${data.name}」を更新しました`,
      };
    }

    case "automation_delete": {
      const { data: existing } = await supabase
        .from("ai_automations")
        .select("name")
        .eq("id", input.automation_id as string)
        .eq("company_id", companyId)
        .single();

      const { error } = await supabase
        .from("ai_automations")
        .delete()
        .eq("id", input.automation_id as string)
        .eq("company_id", companyId);

      if (error) {
        throw new Error(`自動化タスクの削除に失敗しました: ${error.message}`);
      }

      return {
        success: true,
        message: `自動化タスク「${existing?.name || ""}」を削除しました`,
      };
    }

    case "automation_run_now": {
      // Get the automation
      const { data: automation, error: fetchError } = await supabase
        .from("ai_automations")
        .select("*")
        .eq("id", input.automation_id as string)
        .eq("company_id", companyId)
        .single();

      if (fetchError || !automation) {
        throw new Error("自動化タスクが見つかりません");
      }

      // Execute the action
      const result = await executeAutomationAction(supabase, userId, {
        action_type: automation.action_type,
        action_config: automation.action_config,
        client_id: automation.client_id,
      });

      // Update last run info
      await supabase
        .from("ai_automations")
        .update({
          last_run_at: new Date().toISOString(),
          run_count: (automation.run_count || 0) + 1,
          last_error: result.success ? null : result.error,
        })
        .eq("id", automation.id);

      if (!result.success) {
        throw new Error(`実行に失敗しました: ${result.error}`);
      }

      return {
        success: true,
        automation_name: automation.name,
        result: result.result,
        message: `「${automation.name}」を実行しました`,
      };
    }

    default:
      throw new Error(`Unknown automation tool: ${toolName}`);
  }
}
