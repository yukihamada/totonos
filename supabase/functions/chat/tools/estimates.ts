import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const APP_BASE_URL = "https://totonos.lovable.app";
export const estimateTools = [
  {
    name: "list_estimates",
    description: "見積書の一覧を取得します。",
    input_schema: {
      type: "object" as const,
      properties: {
        status: {
          type: "string",
          enum: ["draft", "sent", "accepted", "rejected", "expired"],
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
    name: "estimate_get",
    description: "指定されたIDの見積書の詳細を取得します。明細も含まれます。",
    input_schema: {
      type: "object" as const,
      properties: {
        estimate_id: {
          type: "string",
          description: "見積書ID",
        },
      },
      required: ["estimate_id"],
    },
  },
  {
    name: "estimate_create",
    description: "新しい見積書を作成します。",
    input_schema: {
      type: "object" as const,
      properties: {
        title: {
          type: "string",
          description: "見積書タイトル",
        },
        client_id: {
          type: "string",
          description: "取引先ID",
        },
        valid_until: {
          type: "string",
          description: "有効期限（YYYY-MM-DD形式）",
        },
        description: {
          type: "string",
          description: "備考",
        },
        items: {
          type: "array",
          description: "見積明細の配列",
          items: {
            type: "object",
            properties: {
              description: { type: "string", description: "品目名" },
              quantity: { type: "number", description: "数量" },
              unit_price: { type: "number", description: "単価" },
            },
          },
        },
      },
      required: ["title", "valid_until"],
    },
  },
  {
    name: "estimate_update_status",
    description: "見積書のステータスを更新します。",
    input_schema: {
      type: "object" as const,
      properties: {
        estimate_id: {
          type: "string",
          description: "見積書ID",
        },
        status: {
          type: "string",
          enum: ["draft", "sent", "accepted", "rejected", "expired"],
          description: "新しいステータス",
        },
      },
      required: ["estimate_id", "status"],
    },
  },
  {
    name: "estimate_to_invoice",
    description: "見積書から請求書を作成します。",
    input_schema: {
      type: "object" as const,
      properties: {
        estimate_id: {
          type: "string",
          description: "見積書ID",
        },
        due_date: {
          type: "string",
          description: "支払期限（YYYY-MM-DD形式）",
        },
      },
      required: ["estimate_id", "due_date"],
    },
  },
];

export async function executeEstimateTool(
  toolName: string,
  input: Record<string, unknown>,
  userId: string,
  supabase: SupabaseClient
): Promise<unknown> {
  switch (toolName) {
    case "list_estimates": {
      let query = supabase
        .from("estimates")
        .select(`
          *,
          clients (name)
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
      return { estimates: data, count: data?.length || 0 };
    }

    case "estimate_get": {
      const { data, error } = await supabase
        .from("estimates")
        .select(`
          *,
          clients (name, email),
          estimate_items (*)
        `)
        .eq("id", input.estimate_id)
        .eq("user_id", userId)
        .single();

      if (error) throw new Error(error.message);
      return { estimate: data };
    }

    case "estimate_create": {
      // Generate estimate number
      const estimateNumber = `EST-${Date.now().toString(36).toUpperCase()}`;
      
      // Calculate totals from items
      const items = (input.items as Array<{ description: string; quantity: number; unit_price: number }>) || [];
      const amount = items.reduce((sum, item) => sum + (item.quantity || 1) * (item.unit_price || 0), 0);
      const taxAmount = Math.round(amount * 0.1);
      const totalAmount = amount + taxAmount;

      const { data: estimate, error } = await supabase
        .from("estimates")
        .insert({
          user_id: userId,
          estimate_number: estimateNumber,
          title: input.title,
          client_id: input.client_id,
          valid_until: input.valid_until,
          description: input.description,
          amount,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          status: "draft",
        })
        .select()
        .single();

      if (error) throw new Error(error.message);

      // Insert estimate items
      if (items.length > 0) {
        const { error: itemsError } = await supabase
          .from("estimate_items")
          .insert(
            items.map((item) => ({
              estimate_id: estimate.id,
              description: item.description,
              quantity: item.quantity || 1,
              unit_price: item.unit_price || 0,
              amount: (item.quantity || 1) * (item.unit_price || 0),
            }))
          );

        if (itemsError) throw new Error(itemsError.message);
      }

      const estimateUrl = `${APP_BASE_URL}/estimates/${estimate.id}`;
      return { 
        estimate, 
        url: estimateUrl,
        message: `見積書 ${estimateNumber} を作成しました\n📄 ${estimateUrl}` 
      };
    }
    case "estimate_update_status": {
      const updateData: Record<string, unknown> = { status: input.status };
      if (input.status === "accepted") {
        updateData.accepted_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from("estimates")
        .update(updateData)
        .eq("id", input.estimate_id)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return { estimate: data, message: `見積書のステータスを「${input.status}」に更新しました` };
    }

    case "estimate_to_invoice": {
      // Get estimate with items
      const { data: estimate, error: estError } = await supabase
        .from("estimates")
        .select(`
          *,
          estimate_items (*)
        `)
        .eq("id", input.estimate_id)
        .eq("user_id", userId)
        .single();

      if (estError) throw new Error(estError.message);

      // Generate invoice number
      const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`;

      // Create invoice
      const { data: invoice, error: invError } = await supabase
        .from("invoices")
        .insert({
          user_id: userId,
          invoice_number: invoiceNumber,
          title: estimate.title,
          client_id: estimate.client_id,
          amount: estimate.amount,
          tax_amount: estimate.tax_amount,
          total_amount: estimate.total_amount,
          due_date: input.due_date,
          description: estimate.description,
          status: "draft",
        })
        .select()
        .single();

      if (invError) throw new Error(invError.message);

      // Copy items
      if (estimate.estimate_items?.length > 0) {
        const { error: itemsError } = await supabase
          .from("invoice_items")
          .insert(
            estimate.estimate_items.map((item: { description: string; quantity: number; unit_price: number; amount: number }) => ({
              invoice_id: invoice.id,
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unit_price,
              amount: item.amount,
            }))
          );

        if (itemsError) throw new Error(itemsError.message);
      }

      // Update estimate status
      await supabase
        .from("estimates")
        .update({ status: "accepted", accepted_at: new Date().toISOString() })
        .eq("id", input.estimate_id);

      return { invoice, message: `見積書から請求書 ${invoiceNumber} を作成しました` };
    }

    default:
      throw new Error(`Unknown estimate tool: ${toolName}`);
  }
}
