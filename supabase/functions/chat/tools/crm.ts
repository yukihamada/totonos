import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export const crmTools = [
  {
    name: "list_leads",
    description: "リード（見込み顧客）の一覧を取得します。",
    input_schema: {
      type: "object" as const,
      properties: {
        status: {
          type: "string",
          enum: ["new", "contacted", "qualified", "proposal", "negotiation", "won", "lost"],
          description: "ステータスでフィルタ",
        },
        source: {
          type: "string",
          description: "リードソースでフィルタ",
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
    name: "lead_get",
    description: "指定されたIDのリードの詳細を取得します。",
    input_schema: {
      type: "object" as const,
      properties: {
        lead_id: {
          type: "string",
          description: "リードID",
        },
      },
      required: ["lead_id"],
    },
  },
  {
    name: "lead_create",
    description: "新しいリードを作成します。",
    input_schema: {
      type: "object" as const,
      properties: {
        company_name: {
          type: "string",
          description: "会社名",
        },
        contact_name: {
          type: "string",
          description: "担当者名",
        },
        email: {
          type: "string",
          description: "メールアドレス",
        },
        phone: {
          type: "string",
          description: "電話番号",
        },
        source: {
          type: "string",
          description: "リードソース（例：Web、紹介、展示会）",
        },
        notes: {
          type: "string",
          description: "備考",
        },
      },
      required: ["company_name", "contact_name"],
    },
  },
  {
    name: "lead_update",
    description: "既存のリードを更新します。",
    input_schema: {
      type: "object" as const,
      properties: {
        lead_id: {
          type: "string",
          description: "リードID",
        },
        status: {
          type: "string",
          enum: ["new", "contacted", "qualified", "proposal", "negotiation", "won", "lost"],
          description: "ステータス",
        },
        company_name: {
          type: "string",
          description: "会社名",
        },
        contact_name: {
          type: "string",
          description: "担当者名",
        },
        email: {
          type: "string",
          description: "メールアドレス",
        },
        notes: {
          type: "string",
          description: "備考",
        },
      },
      required: ["lead_id"],
    },
  },
  {
    name: "list_deals",
    description: "案件（商談）の一覧を取得します。",
    input_schema: {
      type: "object" as const,
      properties: {
        stage: {
          type: "string",
          enum: ["discovery", "proposal", "negotiation", "closed_won", "closed_lost"],
          description: "ステージでフィルタ",
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
    name: "deal_create",
    description: "新しい案件を作成します。",
    input_schema: {
      type: "object" as const,
      properties: {
        name: {
          type: "string",
          description: "案件名",
        },
        lead_id: {
          type: "string",
          description: "関連するリードID",
        },
        amount: {
          type: "number",
          description: "金額",
        },
        expected_close_date: {
          type: "string",
          description: "予定クローズ日（YYYY-MM-DD形式）",
        },
        stage: {
          type: "string",
          enum: ["discovery", "proposal", "negotiation", "closed_won", "closed_lost"],
          description: "ステージ",
        },
        description: {
          type: "string",
          description: "案件説明",
        },
      },
      required: ["name", "amount"],
    },
  },
  {
    name: "deal_update_stage",
    description: "案件のステージを更新します。",
    input_schema: {
      type: "object" as const,
      properties: {
        deal_id: {
          type: "string",
          description: "案件ID",
        },
        stage: {
          type: "string",
          enum: ["discovery", "proposal", "negotiation", "closed_won", "closed_lost"],
          description: "新しいステージ",
        },
      },
      required: ["deal_id", "stage"],
    },
  },
  {
    name: "get_pipeline_stats",
    description: "パイプラインの統計情報を取得します。ステージごとの案件数や金額合計を表示します。",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "log_activity",
    description: "リードまたは案件に活動記録を追加します。",
    input_schema: {
      type: "object" as const,
      properties: {
        entity_type: {
          type: "string",
          enum: ["lead", "deal"],
          description: "対象の種類",
        },
        entity_id: {
          type: "string",
          description: "リードまたは案件のID",
        },
        activity_type: {
          type: "string",
          enum: ["call", "email", "meeting", "note"],
          description: "活動種類",
        },
        description: {
          type: "string",
          description: "活動内容",
        },
      },
      required: ["entity_type", "entity_id", "activity_type", "description"],
    },
  },
];

export async function executeCrmTool(
  toolName: string,
  input: Record<string, unknown>,
  userId: string,
  supabase: SupabaseClient
): Promise<unknown> {
  switch (toolName) {
    case "list_leads": {
      let query = supabase
        .from("leads")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(input.limit as number || 10);

      if (input.status) {
        query = query.eq("status", input.status);
      }
      if (input.source) {
        query = query.ilike("source", `%${input.source}%`);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return { leads: data, count: data?.length || 0 };
    }

    case "lead_get": {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("id", input.lead_id)
        .eq("user_id", userId)
        .single();

      if (error) throw new Error(error.message);
      return { lead: data };
    }

    case "lead_create": {
      const { data, error } = await supabase
        .from("leads")
        .insert({
          user_id: userId,
          company_name: input.company_name,
          contact_name: input.contact_name,
          email: input.email,
          phone: input.phone,
          source: input.source || "その他",
          notes: input.notes,
          status: "new",
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return { lead: data, message: "リードを作成しました" };
    }

    case "lead_update": {
      const updateData: Record<string, unknown> = {};
      if (input.status) updateData.status = input.status;
      if (input.company_name) updateData.company_name = input.company_name;
      if (input.contact_name) updateData.contact_name = input.contact_name;
      if (input.email) updateData.email = input.email;
      if (input.notes) updateData.notes = input.notes;

      const { data, error } = await supabase
        .from("leads")
        .update(updateData)
        .eq("id", input.lead_id)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return { lead: data, message: "リードを更新しました" };
    }

    case "list_deals": {
      let query = supabase
        .from("deals")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(input.limit as number || 10);

      if (input.stage) {
        query = query.eq("stage", input.stage);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return { deals: data, count: data?.length || 0 };
    }

    case "deal_create": {
      const { data, error } = await supabase
        .from("deals")
        .insert({
          user_id: userId,
          name: input.name,
          lead_id: input.lead_id,
          amount: input.amount,
          expected_close_date: input.expected_close_date,
          stage: input.stage || "discovery",
          description: input.description,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return { deal: data, message: "案件を作成しました" };
    }

    case "deal_update_stage": {
      const { data, error } = await supabase
        .from("deals")
        .update({ stage: input.stage })
        .eq("id", input.deal_id)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return { deal: data, message: `案件のステージを${input.stage}に更新しました` };
    }

    case "get_pipeline_stats": {
      const { data, error } = await supabase
        .from("deals")
        .select("stage, amount")
        .eq("user_id", userId);

      if (error) throw new Error(error.message);

      const stages = ["discovery", "proposal", "negotiation", "closed_won", "closed_lost"];
      const stats = stages.map((stage) => {
        const stageDeals = data?.filter((d) => d.stage === stage) || [];
        return {
          stage,
          count: stageDeals.length,
          total_amount: stageDeals.reduce((sum, d) => sum + (d.amount || 0), 0),
        };
      });

      return {
        pipeline: stats,
        total_deals: data?.length || 0,
        total_value: data?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0,
      };
    }

    case "log_activity": {
      const { data, error } = await supabase
        .from("activities")
        .insert({
          user_id: userId,
          entity_type: input.entity_type,
          entity_id: input.entity_id,
          activity_type: input.activity_type,
          description: input.description,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return { activity: data, message: "活動を記録しました" };
    }

    default:
      throw new Error(`Unknown CRM tool: ${toolName}`);
  }
}
