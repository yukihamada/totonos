import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const APP_BASE_URL = "https://totonos.lovable.app";
export const contractTools = [
  {
    name: "list_contracts",
    description: "契約書の一覧を取得します。ステータスでフィルタリング可能です。",
    input_schema: {
      type: "object" as const,
      properties: {
        status: {
          type: "string",
          enum: ["draft", "review", "sent", "signed", "active", "expired", "terminated", "cancelled"],
          description: "契約ステータスでフィルタ",
        },
        client_id: {
          type: "string",
          description: "取引先IDでフィルタ",
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
        client_id: {
          type: "string",
          description: "取引先ID（オプション）",
        },
        valid_until: {
          type: "string",
          description: "契約有効期限（YYYY-MM-DD形式）",
        },
        amount: {
          type: "number",
          description: "契約金額",
        },
        content: {
          type: "string",
          description: "契約内容",
        },
      },
      required: ["title"],
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
          enum: ["draft", "review", "sent", "signed", "active", "expired", "terminated", "cancelled"],
          description: "ステータス",
        },
        client_id: {
          type: "string",
          description: "取引先ID",
        },
        valid_until: {
          type: "string",
          description: "契約有効期限（YYYY-MM-DD形式）",
        },
        amount: {
          type: "number",
          description: "契約金額",
        },
        content: {
          type: "string",
          description: "契約内容",
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

function generateContractNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CON-${year}${month}-${random}`;
}

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
        .select(`
          *,
          client:clients (id, name)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(input.limit as number || 10);

      if (input.status) {
        query = query.eq("status", input.status);
      }
      if (input.client_id) {
        query = query.eq("client_id", input.client_id);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return { contracts: data, count: data?.length || 0 };
    }

    case "contract_get": {
      const { data, error } = await supabase
        .from("contracts")
        .select(`
          *,
          client:clients (id, name, email)
        `)
        .eq("id", input.contract_id)
        .eq("user_id", userId)
        .single();

      if (error) throw new Error(error.message);
      return { contract: data };
    }

    case "contract_create": {
      const amount = (input.amount as number) || 0;
      const taxAmount = Math.floor(amount * 0.1);
      const totalAmount = amount + taxAmount;

      const { data, error } = await supabase
        .from("contracts")
        .insert({
          user_id: userId,
          contract_number: generateContractNumber(),
          title: input.title,
          client_id: input.client_id || null,
          valid_until: input.valid_until || null,
          amount: amount,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          content: input.content || null,
          status: "draft",
          issue_date: new Date().toISOString().split("T")[0],
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
      if (input.client_id) updateData.client_id = input.client_id;
      if (input.valid_until) updateData.valid_until = input.valid_until;
      if (input.content) updateData.content = input.content;
      if (input.amount !== undefined) {
        const amount = input.amount as number;
        const taxAmount = Math.floor(amount * 0.1);
        updateData.amount = amount;
        updateData.tax_amount = taxAmount;
        updateData.total_amount = amount + taxAmount;
      }

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
        .select(`
          *,
          client:clients (id, name)
        `)
        .eq("user_id", userId)
        .or(`title.ilike.%${input.query}%,content.ilike.%${input.query}%,contract_number.ilike.%${input.query}%`)
        .order("created_at", { ascending: false })
        .limit(input.limit as number || 10);

      if (error) throw new Error(error.message);
      return { contracts: data, count: data?.length || 0, query: input.query };
    }

    default:
      throw new Error(`Unknown contract tool: ${toolName}`);
  }
}
