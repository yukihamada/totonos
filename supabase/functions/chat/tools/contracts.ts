import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const APP_BASE_URL = "https://totonos.lovable.app";
export const contractTools = [
  {
    name: "list_contracts",
    description: "契約書の一覧を取得します。ステータスや種類でフィルタリング可能です。",
    input_schema: {
      type: "object" as const,
      properties: {
        status: {
          type: "string",
          enum: ["draft", "review", "active", "expired", "terminated"],
          description: "契約ステータスでフィルタ",
        },
        contract_type: {
          type: "string",
          description: "契約種類でフィルタ（例：業務委託契約、秘密保持契約）",
        },
        limit: {
          type: "number",
          description: "取得件数の上限（デフォルト: 10）",
        },
      },
      required: [],
    },
  },
  {
    name: "contract_get",
    description: "指定されたIDの契約書の詳細を取得します。",
    input_schema: {
      type: "object" as const,
      properties: {
        contract_id: {
          type: "string",
          description: "契約書ID",
        },
      },
      required: ["contract_id"],
    },
  },
  {
    name: "contract_create",
    description: "新しい契約書を作成します。",
    input_schema: {
      type: "object" as const,
      properties: {
        title: {
          type: "string",
          description: "契約書タイトル",
        },
        contract_type: {
          type: "string",
          description: "契約種類（例：業務委託契約、秘密保持契約、売買契約）",
        },
        party_name: {
          type: "string",
          description: "契約相手先名",
        },
        start_date: {
          type: "string",
          description: "契約開始日（YYYY-MM-DD形式）",
        },
        end_date: {
          type: "string",
          description: "契約終了日（YYYY-MM-DD形式）",
        },
        amount: {
          type: "number",
          description: "契約金額",
        },
        description: {
          type: "string",
          description: "契約内容の説明",
        },
      },
      required: ["title", "contract_type", "party_name"],
    },
  },
  {
    name: "contract_update",
    description: "既存の契約書を更新します。",
    input_schema: {
      type: "object" as const,
      properties: {
        contract_id: {
          type: "string",
          description: "契約書ID",
        },
        title: {
          type: "string",
          description: "契約書タイトル",
        },
        status: {
          type: "string",
          enum: ["draft", "review", "active", "expired", "terminated"],
          description: "ステータス",
        },
        party_name: {
          type: "string",
          description: "契約相手先名",
        },
        end_date: {
          type: "string",
          description: "契約終了日（YYYY-MM-DD形式）",
        },
        amount: {
          type: "number",
          description: "契約金額",
        },
      },
      required: ["contract_id"],
    },
  },
  {
    name: "contract_delete",
    description: "契約書を削除します。",
    input_schema: {
      type: "object" as const,
      properties: {
        contract_id: {
          type: "string",
          description: "契約書ID",
        },
      },
      required: ["contract_id"],
    },
  },
  {
    name: "search_contracts",
    description: "契約書をキーワードで検索します。",
    input_schema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description: "検索キーワード",
        },
        limit: {
          type: "number",
          description: "取得件数の上限（デフォルト: 10）",
        },
      },
      required: ["query"],
    },
  },
];

export async function executeContractTool(
  toolName: string,
  input: Record<string, unknown>,
  userId: string,
  supabase: SupabaseClient
): Promise<unknown> {
  switch (toolName) {
    case "list_contracts": {
      let query = supabase
        .from("contracts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(input.limit as number || 10);

      if (input.status) {
        query = query.eq("status", input.status);
      }
      if (input.contract_type) {
        query = query.ilike("contract_type", `%${input.contract_type}%`);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return { contracts: data, count: data?.length || 0 };
    }

    case "contract_get": {
      const { data, error } = await supabase
        .from("contracts")
        .select("*")
        .eq("id", input.contract_id)
        .eq("user_id", userId)
        .single();

      if (error) throw new Error(error.message);
      return { contract: data };
    }

    case "contract_create": {
      const { data, error } = await supabase
        .from("contracts")
        .insert({
          user_id: userId,
          title: input.title,
          contract_type: input.contract_type,
          party_name: input.party_name,
          start_date: input.start_date,
          end_date: input.end_date,
          amount: input.amount,
          description: input.description,
          status: "draft",
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      const contractUrl = `${APP_BASE_URL}/contracts/${data.id}`;
      return { 
        contract: data, 
        url: contractUrl,
        message: `契約書を作成しました\n📄 ${contractUrl}` 
      };
    }
    case "contract_update": {
      const updateData: Record<string, unknown> = {};
      if (input.title) updateData.title = input.title;
      if (input.status) updateData.status = input.status;
      if (input.party_name) updateData.party_name = input.party_name;
      if (input.end_date) updateData.end_date = input.end_date;
      if (input.amount !== undefined) updateData.amount = input.amount;

      const { data, error } = await supabase
        .from("contracts")
        .update(updateData)
        .eq("id", input.contract_id)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return { contract: data, message: "契約書を更新しました" };
    }

    case "contract_delete": {
      const { error } = await supabase
        .from("contracts")
        .delete()
        .eq("id", input.contract_id)
        .eq("user_id", userId);

      if (error) throw new Error(error.message);
      return { message: "契約書を削除しました" };
    }

    case "search_contracts": {
      const { data, error } = await supabase
        .from("contracts")
        .select("*")
        .eq("user_id", userId)
        .or(`title.ilike.%${input.query}%,party_name.ilike.%${input.query}%,description.ilike.%${input.query}%`)
        .order("created_at", { ascending: false })
        .limit(input.limit as number || 10);

      if (error) throw new Error(error.message);
      return { contracts: data, count: data?.length || 0, query: input.query };
    }

    default:
      throw new Error(`Unknown contract tool: ${toolName}`);
  }
}
