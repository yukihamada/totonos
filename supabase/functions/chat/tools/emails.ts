import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export const emailTools = [
  {
    name: "list_emails",
    description: "受信メールの一覧を取得します。",
    input_schema: {
      type: "object" as const,
      properties: {
        is_read: {
          type: "boolean",
          description: "既読/未読でフィルタ",
        },
        is_starred: {
          type: "boolean",
          description: "スター付きでフィルタ",
        },
        is_archived: {
          type: "boolean",
          description: "アーカイブ済みでフィルタ",
        },
        search: {
          type: "string",
          description: "件名や送信元で検索",
        },
        limit: {
          type: "number",
          description: "取得件数の上限（デフォルト: 30）",
        },
      },
      required: [],
    },
  },
  {
    name: "email_get",
    description: "指定されたIDのメールの詳細を取得します。AI分析結果も含まれます。",
    input_schema: {
      type: "object" as const,
      properties: {
        email_id: {
          type: "string",
          description: "メールID",
        },
      },
      required: ["email_id"],
    },
  },
  {
    name: "email_mark_read",
    description: "メールを既読/未読にします。",
    input_schema: {
      type: "object" as const,
      properties: {
        email_id: {
          type: "string",
          description: "メールID",
        },
        is_read: {
          type: "boolean",
          description: "既読にする場合はtrue",
        },
      },
      required: ["email_id", "is_read"],
    },
  },
  {
    name: "email_star",
    description: "メールにスターを付ける/外します。",
    input_schema: {
      type: "object" as const,
      properties: {
        email_id: {
          type: "string",
          description: "メールID",
        },
        is_starred: {
          type: "boolean",
          description: "スターを付ける場合はtrue",
        },
      },
      required: ["email_id", "is_starred"],
    },
  },
  {
    name: "email_archive",
    description: "メールをアーカイブ/アーカイブ解除します。",
    input_schema: {
      type: "object" as const,
      properties: {
        email_id: {
          type: "string",
          description: "メールID",
        },
        is_archived: {
          type: "boolean",
          description: "アーカイブする場合はtrue",
        },
      },
      required: ["email_id", "is_archived"],
    },
  },
  {
    name: "email_link_to_entity",
    description: "メールをリード・取引先・案件に紐付けます。",
    input_schema: {
      type: "object" as const,
      properties: {
        email_id: {
          type: "string",
          description: "メールID",
        },
        related_type: {
          type: "string",
          enum: ["lead", "client", "deal"],
          description: "紐付け先の種類",
        },
        related_id: {
          type: "string",
          description: "紐付け先のID",
        },
      },
      required: ["email_id", "related_type", "related_id"],
    },
  },
  {
    name: "email_stats",
    description: "メールの統計情報を取得します。",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
];

export async function executeEmailTool(
  toolName: string,
  input: Record<string, unknown>,
  userId: string,
  supabase: SupabaseClient
): Promise<unknown> {
  // Get user's company to filter emails
  const { data: membership } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", userId)
    .eq("is_active", true)
    .single();

  const companyId = membership?.company_id;

  switch (toolName) {
    case "list_emails": {
      let query = supabase
        .from("inbound_emails")
        .select(`
          id,
          from_email,
          from_name,
          subject,
          ai_summary,
          ai_category,
          ai_urgency,
          is_read,
          is_starred,
          is_archived,
          created_at
        `)
        .order("created_at", { ascending: false })
        .limit(input.limit as number || 30);

      if (companyId) {
        query = query.eq("company_id", companyId);
      }
      if (input.is_read !== undefined) {
        query = query.eq("is_read", input.is_read);
      }
      if (input.is_starred !== undefined) {
        query = query.eq("is_starred", input.is_starred);
      }
      if (input.is_archived !== undefined) {
        query = query.eq("is_archived", input.is_archived);
      }
      if (input.search) {
        query = query.or(`subject.ilike.%${input.search}%,from_email.ilike.%${input.search}%,from_name.ilike.%${input.search}%`);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return { emails: data, count: data?.length || 0 };
    }

    case "email_get": {
      let query = supabase
        .from("inbound_emails")
        .select("*")
        .eq("id", input.email_id);

      if (companyId) {
        query = query.eq("company_id", companyId);
      }

      const { data, error } = await query.single();
      if (error) throw new Error(error.message);
      return { email: data };
    }

    case "email_mark_read": {
      let query = supabase
        .from("inbound_emails")
        .update({ is_read: input.is_read })
        .eq("id", input.email_id);

      if (companyId) {
        query = query.eq("company_id", companyId);
      }

      const { data, error } = await query.select().single();
      if (error) throw new Error(error.message);
      return { email: data, message: input.is_read ? "既読にしました" : "未読にしました" };
    }

    case "email_star": {
      let query = supabase
        .from("inbound_emails")
        .update({ is_starred: input.is_starred })
        .eq("id", input.email_id);

      if (companyId) {
        query = query.eq("company_id", companyId);
      }

      const { data, error } = await query.select().single();
      if (error) throw new Error(error.message);
      return { email: data, message: input.is_starred ? "スターを付けました" : "スターを外しました" };
    }

    case "email_archive": {
      let query = supabase
        .from("inbound_emails")
        .update({ is_archived: input.is_archived })
        .eq("id", input.email_id);

      if (companyId) {
        query = query.eq("company_id", companyId);
      }

      const { data, error } = await query.select().single();
      if (error) throw new Error(error.message);
      return { email: data, message: input.is_archived ? "アーカイブしました" : "アーカイブを解除しました" };
    }

    case "email_link_to_entity": {
      let query = supabase
        .from("inbound_emails")
        .update({
          related_type: input.related_type,
          related_id: input.related_id,
        })
        .eq("id", input.email_id);

      if (companyId) {
        query = query.eq("company_id", companyId);
      }

      const { data, error } = await query.select().single();
      if (error) throw new Error(error.message);
      return { email: data, message: `${input.related_type}に紐付けました` };
    }

    case "email_stats": {
      let baseQuery = supabase.from("inbound_emails").select("id, is_read, is_starred, ai_urgency, ai_category", { count: "exact" });
      
      if (companyId) {
        baseQuery = baseQuery.eq("company_id", companyId);
      }

      const { data, error, count } = await baseQuery;
      if (error) throw new Error(error.message);

      const stats = {
        total: count || 0,
        unread: data?.filter(e => !e.is_read).length || 0,
        starred: data?.filter(e => e.is_starred).length || 0,
        urgent: data?.filter(e => e.ai_urgency === "high").length || 0,
        by_category: {} as Record<string, number>,
      };

      for (const email of data || []) {
        if (email.ai_category) {
          stats.by_category[email.ai_category] = (stats.by_category[email.ai_category] || 0) + 1;
        }
      }

      return { stats };
    }

    default:
      throw new Error(`Unknown email tool: ${toolName}`);
  }
}
