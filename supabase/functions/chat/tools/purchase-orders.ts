import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export const purchaseOrderTools = [
  {
    name: "list_purchase_orders",
    description: "発注書の一覧を取得します。",
    input_schema: {
      type: "object" as const,
      properties: {
        status: {
          type: "string",
          enum: ["draft", "sent", "confirmed", "received", "cancelled"],
          description: "ステータスでフィルタ",
        },
        supplier: {
          type: "string",
          description: "発注先名で検索",
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
    name: "purchase_order_get",
    description: "指定されたIDの発注書の詳細を取得します。明細も含まれます。",
    input_schema: {
      type: "object" as const,
      properties: {
        purchase_order_id: {
          type: "string",
          description: "発注書ID",
        },
      },
      required: ["purchase_order_id"],
    },
  },
  {
    name: "purchase_order_create",
    description: "新しい発注書を作成します。",
    input_schema: {
      type: "object" as const,
      properties: {
        supplier_name: {
          type: "string",
          description: "発注先名",
        },
        delivery_date: {
          type: "string",
          description: "納品予定日（YYYY-MM-DD形式）",
        },
        notes: {
          type: "string",
          description: "備考",
        },
        items: {
          type: "array",
          description: "発注明細の配列",
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
      required: ["supplier_name"],
    },
  },
  {
    name: "purchase_order_update_status",
    description: "発注書のステータスを更新します。",
    input_schema: {
      type: "object" as const,
      properties: {
        purchase_order_id: {
          type: "string",
          description: "発注書ID",
        },
        status: {
          type: "string",
          enum: ["draft", "sent", "confirmed", "received", "cancelled"],
          description: "新しいステータス",
        },
      },
      required: ["purchase_order_id", "status"],
    },
  },
];

export async function executePurchaseOrderTool(
  toolName: string,
  input: Record<string, unknown>,
  userId: string,
  supabase: SupabaseClient
): Promise<unknown> {
  switch (toolName) {
    case "list_purchase_orders": {
      let query = supabase
        .from("purchase_orders")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(input.limit as number || 20);

      if (input.status) {
        query = query.eq("status", input.status);
      }
      if (input.supplier) {
        query = query.ilike("supplier_name", `%${input.supplier}%`);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return { purchase_orders: data, count: data?.length || 0 };
    }

    case "purchase_order_get": {
      const { data, error } = await supabase
        .from("purchase_orders")
        .select(`
          *,
          purchase_order_items (*)
        `)
        .eq("id", input.purchase_order_id)
        .eq("user_id", userId)
        .single();

      if (error) throw new Error(error.message);
      return { purchase_order: data };
    }

    case "purchase_order_create": {
      // Generate PO number
      const poNumber = `PO-${Date.now().toString(36).toUpperCase()}`;
      
      // Calculate totals from items
      const items = (input.items as Array<{ description: string; quantity: number; unit_price: number }>) || [];
      const amount = items.reduce((sum, item) => sum + (item.quantity || 1) * (item.unit_price || 0), 0);
      const taxAmount = Math.round(amount * 0.1);
      const totalAmount = amount + taxAmount;

      const { data: po, error } = await supabase
        .from("purchase_orders")
        .insert({
          user_id: userId,
          po_number: poNumber,
          supplier_name: input.supplier_name,
          delivery_date: input.delivery_date,
          notes: input.notes,
          amount,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          status: "draft",
        })
        .select()
        .single();

      if (error) throw new Error(error.message);

      // Insert items
      if (items.length > 0) {
        const { error: itemsError } = await supabase
          .from("purchase_order_items")
          .insert(
            items.map((item) => ({
              purchase_order_id: po.id,
              description: item.description,
              quantity: item.quantity || 1,
              unit_price: item.unit_price || 0,
              amount: (item.quantity || 1) * (item.unit_price || 0),
            }))
          );

        if (itemsError) throw new Error(itemsError.message);
      }

      return { purchase_order: po, message: `発注書 ${poNumber} を作成しました` };
    }

    case "purchase_order_update_status": {
      const updateData: Record<string, unknown> = { status: input.status };
      if (input.status === "received") {
        updateData.received_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from("purchase_orders")
        .update(updateData)
        .eq("id", input.purchase_order_id)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return { purchase_order: data, message: `発注書のステータスを「${input.status}」に更新しました` };
    }

    default:
      throw new Error(`Unknown purchase order tool: ${toolName}`);
  }
}
