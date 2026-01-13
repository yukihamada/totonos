import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export const invoiceTools = [
  {
    name: "invoice_list",
    description: "請求書の一覧を取得します。",
    input_schema: {
      type: "object" as const,
      properties: {
        status: {
          type: "string",
          enum: ["draft", "sent", "pending", "paid", "overdue", "cancelled"],
          description: "ステータスでフィルタ",
        },
        client_id: {
          type: "string",
          description: "取引先IDでフィルタ",
        },
        limit: {
          type: "number",
          description: "取得件数の上限（デフォルト: 20）",
        },
      },
      required: [],
    },
  },
  {
    name: "invoice_get",
    description: "指定されたIDの請求書の詳細を取得します。",
    input_schema: {
      type: "object" as const,
      properties: {
        invoice_id: {
          type: "string",
          description: "請求書ID",
        },
      },
      required: ["invoice_id"],
    },
  },
  {
    name: "invoice_create",
    description: "新しい請求書を作成します。",
    input_schema: {
      type: "object" as const,
      properties: {
        title: {
          type: "string",
          description: "請求書の件名",
        },
        client_id: {
          type: "string",
          description: "取引先ID",
        },
        due_date: {
          type: "string",
          description: "支払期限（YYYY-MM-DD形式）",
        },
        description: {
          type: "string",
          description: "備考",
        },
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
          description: "明細項目（品目、数量、単価）",
        },
      },
      required: ["title", "due_date", "items"],
    },
  },
  {
    name: "invoice_update_status",
    description: "請求書のステータスを更新します。",
    input_schema: {
      type: "object" as const,
      properties: {
        invoice_id: {
          type: "string",
          description: "請求書ID",
        },
        status: {
          type: "string",
          enum: ["draft", "sent", "pending", "paid", "overdue", "cancelled"],
          description: "新しいステータス",
        },
      },
      required: ["invoice_id", "status"],
    },
  },
  {
    name: "invoice_delete",
    description: "請求書を削除します。",
    input_schema: {
      type: "object" as const,
      properties: {
        invoice_id: {
          type: "string",
          description: "請求書ID",
        },
      },
      required: ["invoice_id"],
    },
  },
  {
    name: "invoice_stats",
    description: "請求書の統計情報を取得します。未払い、入金済み、延滞中の金額を表示します。",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
];

function generateInvoiceNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `INV-${year}${month}-${random}`;
}

export async function executeInvoiceTool(
  toolName: string,
  input: Record<string, unknown>,
  userId: string,
  supabase: SupabaseClient
): Promise<unknown> {
  switch (toolName) {
    case "invoice_list": {
      let query = supabase
        .from("invoices")
        .select(`
          *,
          client:clients (id, name)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(input.limit as number || 20);

      if (input.status) {
        query = query.eq("status", input.status);
      }
      if (input.client_id) {
        query = query.eq("client_id", input.client_id);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return { invoices: data, count: data?.length || 0 };
    }

    case "invoice_get": {
      const { data, error } = await supabase
        .from("invoices")
        .select(`
          *,
          client:clients (id, name, email),
          items:invoice_items (*)
        `)
        .eq("id", input.invoice_id)
        .eq("user_id", userId)
        .single();

      if (error) throw new Error(error.message);
      return { invoice: data };
    }

    case "invoice_create": {
      const items = input.items as Array<{ description: string; quantity: number; unit_price: number }>;
      const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
      const tax = Math.floor(subtotal * 0.1);
      const total = subtotal + tax;

      const { data: invoice, error } = await supabase
        .from("invoices")
        .insert({
          user_id: userId,
          invoice_number: generateInvoiceNumber(),
          title: input.title,
          client_id: input.client_id || null,
          description: input.description || null,
          issue_date: new Date().toISOString().split("T")[0],
          due_date: input.due_date,
          subtotal,
          tax_amount: tax,
          total_amount: total,
          status: "draft",
        })
        .select()
        .single();

      if (error) throw new Error(error.message);

      // Create invoice items
      if (items.length > 0) {
        const { error: itemsError } = await supabase
          .from("invoice_items")
          .insert(
            items.map((item) => ({
              invoice_id: invoice.id,
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unit_price,
              amount: item.quantity * item.unit_price,
            }))
          );

        if (itemsError) throw new Error(itemsError.message);
      }

      return {
        invoice,
        message: `請求書 ${invoice.invoice_number} を作成しました（合計: ¥${total.toLocaleString()}）`,
      };
    }

    case "invoice_update_status": {
      const statusLabels: Record<string, string> = {
        draft: "下書き",
        sent: "送付済",
        pending: "未払い",
        paid: "入金済",
        overdue: "延滞",
        cancelled: "キャンセル",
      };

      const { data, error } = await supabase
        .from("invoices")
        .update({ status: input.status })
        .eq("id", input.invoice_id)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return {
        invoice: data,
        message: `請求書 ${data.invoice_number} を「${statusLabels[input.status as string]}」に更新しました`,
      };
    }

    case "invoice_delete": {
      // First delete invoice items
      await supabase
        .from("invoice_items")
        .delete()
        .eq("invoice_id", input.invoice_id);

      const { error } = await supabase
        .from("invoices")
        .delete()
        .eq("id", input.invoice_id)
        .eq("user_id", userId);

      if (error) throw new Error(error.message);
      return { message: "請求書を削除しました" };
    }

    case "invoice_stats": {
      const { data, error } = await supabase
        .from("invoices")
        .select("status, total_amount")
        .eq("user_id", userId);

      if (error) throw new Error(error.message);

      const stats = {
        unpaid: 0,
        paid: 0,
        overdue: 0,
        total_count: data?.length || 0,
      };

      for (const invoice of data || []) {
        if (invoice.status === "pending" || invoice.status === "sent") {
          stats.unpaid += invoice.total_amount || 0;
        } else if (invoice.status === "paid") {
          stats.paid += invoice.total_amount || 0;
        } else if (invoice.status === "overdue") {
          stats.overdue += invoice.total_amount || 0;
        }
      }

      return {
        stats,
        summary: `未払い: ¥${stats.unpaid.toLocaleString()}, 入金済: ¥${stats.paid.toLocaleString()}, 延滞: ¥${stats.overdue.toLocaleString()}`,
      };
    }

    default:
      throw new Error(`Unknown invoice tool: ${toolName}`);
  }
}
