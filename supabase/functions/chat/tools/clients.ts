import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export const clientTools = [
  {
    name: "list_clients",
    description: "取引先（顧客）の一覧を取得します。",
    input_schema: {
      type: "object" as const,
      properties: {
        search: {
          type: "string",
          description: "会社名や担当者名で検索",
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
    name: "client_get",
    description: "指定されたIDの取引先の詳細を取得します。",
    input_schema: {
      type: "object" as const,
      properties: {
        client_id: {
          type: "string",
          description: "取引先ID",
        },
      },
      required: ["client_id"],
    },
  },
  {
    name: "client_create",
    description: "新しい取引先を作成します。同名の取引先が既に存在する場合は確認が必要です。",
    input_schema: {
      type: "object" as const,
      properties: {
        name: {
          type: "string",
          description: "会社名",
        },
        email: {
          type: "string",
          description: "メールアドレス",
        },
        phone: {
          type: "string",
          description: "電話番号",
        },
        address: {
          type: "string",
          description: "住所",
        },
        notes: {
          type: "string",
          description: "備考",
        },
        force: {
          type: "boolean",
          description: "重複確認をスキップして強制登録する場合はtrue",
        },
      },
      required: ["name"],
    },
  },
  {
    name: "client_update",
    description: "取引先情報を更新します。",
    input_schema: {
      type: "object" as const,
      properties: {
        client_id: {
          type: "string",
          description: "取引先ID",
        },
        name: {
          type: "string",
          description: "会社名",
        },
        email: {
          type: "string",
          description: "メールアドレス",
        },
        phone: {
          type: "string",
          description: "電話番号",
        },
        address: {
          type: "string",
          description: "住所",
        },
        notes: {
          type: "string",
          description: "備考",
        },
      },
      required: ["client_id"],
    },
  },
  {
    name: "client_delete",
    description: "取引先を削除します。",
    input_schema: {
      type: "object" as const,
      properties: {
        client_id: {
          type: "string",
          description: "取引先ID",
        },
      },
      required: ["client_id"],
    },
  },
];

export async function executeClientTool(
  toolName: string,
  input: Record<string, unknown>,
  userId: string,
  supabase: SupabaseClient
): Promise<unknown> {
  switch (toolName) {
    case "list_clients": {
      let query = supabase
        .from("clients")
        .select("*")
        .eq("user_id", userId)
        .order("name", { ascending: true })
        .limit(input.limit as number || 20);

      if (input.search) {
        query = query.or(`name.ilike.%${input.search}%,email.ilike.%${input.search}%`);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return { clients: data, count: data?.length || 0 };
    }

    case "client_get": {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("id", input.client_id)
        .eq("user_id", userId)
        .single();

      if (error) throw new Error(error.message);
      return { client: data };
    }

    case "client_create": {
      const clientName = String(input.name).trim();
      const forceCreate = input.force === true;

      // 重複チェック
      if (!forceCreate) {
        const { data: existing } = await supabase
          .from("clients")
          .select("id, name")
          .eq("user_id", userId)
          .ilike("name", clientName)
          .limit(5);

        if (existing && existing.length > 0) {
          return {
            duplicate: true,
            existingClients: existing,
            message: `「${clientName}」に似た取引先が既に ${existing.length} 件あります。それでも登録しますか？登録する場合は「はい」と返答してください。`,
          };
        }
      }

      const { data, error } = await supabase
        .from("clients")
        .insert({
          user_id: userId,
          name: clientName,
          email: input.email,
          phone: input.phone,
          address: input.address,
          notes: input.notes,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return { client: data, message: "取引先を作成しました" };
    }

    case "client_update": {
      const updateData: Record<string, unknown> = {};
      if (input.name) updateData.name = input.name;
      if (input.email) updateData.email = input.email;
      if (input.phone) updateData.phone = input.phone;
      if (input.address) updateData.address = input.address;
      if (input.notes !== undefined) updateData.notes = input.notes;

      const { data, error } = await supabase
        .from("clients")
        .update(updateData)
        .eq("id", input.client_id)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return { client: data, message: "取引先情報を更新しました" };
    }

    case "client_delete": {
      const { error } = await supabase
        .from("clients")
        .delete()
        .eq("id", input.client_id)
        .eq("user_id", userId);

      if (error) throw new Error(error.message);
      return { message: "取引先を削除しました" };
    }

    default:
      throw new Error(`Unknown client tool: ${toolName}`);
  }
}
