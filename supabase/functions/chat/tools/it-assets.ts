import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export const itAssetTools = [
  {
    name: "list_it_assets",
    description: "IT資産の一覧を取得します。",
    input_schema: {
      type: "object" as const,
      properties: {
        category: {
          type: "string",
          enum: ["PC", "モニター", "周辺機器", "ソフトウェア", "モバイル", "ネットワーク機器", "その他"],
          description: "カテゴリでフィルタ",
        },
        status: {
          type: "string",
          enum: ["in_use", "available", "maintenance", "retired"],
          description: "ステータスでフィルタ",
        },
        assigned_to: {
          type: "string",
          description: "割当先従業員IDでフィルタ",
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
    name: "asset_get",
    description: "指定されたIDのIT資産の詳細を取得します。",
    input_schema: {
      type: "object" as const,
      properties: {
        asset_id: {
          type: "string",
          description: "資産ID",
        },
      },
      required: ["asset_id"],
    },
  },
  {
    name: "asset_create",
    description: "新しいIT資産を登録します。",
    input_schema: {
      type: "object" as const,
      properties: {
        name: {
          type: "string",
          description: "資産名",
        },
        category: {
          type: "string",
          enum: ["PC", "モニター", "周辺機器", "ソフトウェア", "モバイル", "ネットワーク機器", "その他"],
          description: "カテゴリ",
        },
        serial_number: {
          type: "string",
          description: "シリアル番号",
        },
        manufacturer: {
          type: "string",
          description: "メーカー",
        },
        model: {
          type: "string",
          description: "型番",
        },
        purchase_date: {
          type: "string",
          description: "購入日（YYYY-MM-DD形式）",
        },
        purchase_price: {
          type: "number",
          description: "購入価格",
        },
        warranty_end_date: {
          type: "string",
          description: "保証期限（YYYY-MM-DD形式）",
        },
        notes: {
          type: "string",
          description: "備考",
        },
      },
      required: ["name", "category"],
    },
  },
  {
    name: "asset_update",
    description: "IT資産情報を更新します。",
    input_schema: {
      type: "object" as const,
      properties: {
        asset_id: {
          type: "string",
          description: "資産ID",
        },
        name: {
          type: "string",
          description: "資産名",
        },
        status: {
          type: "string",
          enum: ["in_use", "available", "maintenance", "retired"],
          description: "ステータス",
        },
        notes: {
          type: "string",
          description: "備考",
        },
      },
      required: ["asset_id"],
    },
  },
  {
    name: "asset_assign",
    description: "IT資産を従業員に割り当てます。",
    input_schema: {
      type: "object" as const,
      properties: {
        asset_id: {
          type: "string",
          description: "資産ID",
        },
        employee_id: {
          type: "string",
          description: "割当先従業員ID",
        },
        notes: {
          type: "string",
          description: "割当時の備考",
        },
      },
      required: ["asset_id", "employee_id"],
    },
  },
  {
    name: "asset_unassign",
    description: "IT資産の割り当てを解除します。",
    input_schema: {
      type: "object" as const,
      properties: {
        asset_id: {
          type: "string",
          description: "資産ID",
        },
        notes: {
          type: "string",
          description: "解除時の備考",
        },
      },
      required: ["asset_id"],
    },
  },
  {
    name: "asset_retire",
    description: "IT資産を廃棄済みにします。",
    input_schema: {
      type: "object" as const,
      properties: {
        asset_id: {
          type: "string",
          description: "資産ID",
        },
        reason: {
          type: "string",
          description: "廃棄理由",
        },
      },
      required: ["asset_id"],
    },
  },
];

export async function executeItAssetTool(
  toolName: string,
  input: Record<string, unknown>,
  userId: string,
  supabase: SupabaseClient
): Promise<unknown> {
  switch (toolName) {
    case "list_it_assets": {
      let query = supabase
        .from("it_assets")
        .select(`
          *,
          employees (name)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(input.limit as number || 20);

      if (input.category) {
        query = query.eq("category", input.category);
      }
      if (input.status) {
        query = query.eq("status", input.status);
      }
      if (input.assigned_to) {
        query = query.eq("assigned_to", input.assigned_to);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return { assets: data, count: data?.length || 0 };
    }

    case "asset_get": {
      const { data, error } = await supabase
        .from("it_assets")
        .select(`
          *,
          employees (name, email),
          asset_history (*)
        `)
        .eq("id", input.asset_id)
        .eq("user_id", userId)
        .single();

      if (error) throw new Error(error.message);
      return { asset: data };
    }

    case "asset_create": {
      const { data, error } = await supabase
        .from("it_assets")
        .insert({
          user_id: userId,
          name: input.name,
          category: input.category,
          serial_number: input.serial_number,
          manufacturer: input.manufacturer,
          model: input.model,
          purchase_date: input.purchase_date,
          purchase_price: input.purchase_price,
          warranty_end_date: input.warranty_end_date,
          notes: input.notes,
          status: "available",
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return { asset: data, message: "IT資産を登録しました" };
    }

    case "asset_update": {
      const updateData: Record<string, unknown> = {};
      if (input.name) updateData.name = input.name;
      if (input.status) updateData.status = input.status;
      if (input.notes) updateData.notes = input.notes;

      const { data, error } = await supabase
        .from("it_assets")
        .update(updateData)
        .eq("id", input.asset_id)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return { asset: data, message: "IT資産情報を更新しました" };
    }

    case "asset_assign": {
      // Update asset
      const { data, error } = await supabase
        .from("it_assets")
        .update({
          assigned_to: input.employee_id,
          status: "in_use",
        })
        .eq("id", input.asset_id)
        .eq("user_id", userId)
        .select(`
          *,
          employees (name)
        `)
        .single();

      if (error) throw new Error(error.message);

      // Log history
      await supabase.from("asset_history").insert({
        asset_id: input.asset_id,
        action: "assigned",
        employee_id: input.employee_id,
        notes: input.notes,
      });

      return {
        asset: data,
        message: `資産を${data.employees?.name || "従業員"}に割り当てました`,
      };
    }

    case "asset_unassign": {
      // Get current assignment
      const { data: current, error: getError } = await supabase
        .from("it_assets")
        .select("assigned_to")
        .eq("id", input.asset_id)
        .eq("user_id", userId)
        .single();

      if (getError) throw new Error(getError.message);

      // Log history
      if (current?.assigned_to) {
        await supabase.from("asset_history").insert({
          asset_id: input.asset_id,
          action: "unassigned",
          employee_id: current.assigned_to,
          notes: input.notes,
        });
      }

      // Update asset
      const { data, error } = await supabase
        .from("it_assets")
        .update({
          assigned_to: null,
          status: "available",
        })
        .eq("id", input.asset_id)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return { asset: data, message: "資産の割り当てを解除しました" };
    }

    case "asset_retire": {
      // Log history
      await supabase.from("asset_history").insert({
        asset_id: input.asset_id,
        action: "retired",
        notes: input.reason,
      });

      // Update asset
      const { data, error } = await supabase
        .from("it_assets")
        .update({
          status: "retired",
          assigned_to: null,
          notes: `廃棄: ${input.reason || "理由未記載"}`,
        })
        .eq("id", input.asset_id)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return { asset: data, message: "資産を廃棄済みにしました" };
    }

    default:
      throw new Error(`Unknown IT asset tool: ${toolName}`);
  }
}
