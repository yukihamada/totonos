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
          enum: ["website", "referral", "exhibition", "cold_call", "advertising", "other"],
          description: "リードソース: website(ウェブサイト), referral(紹介), exhibition(展示会), cold_call(コールド), advertising(広告), other(その他)",
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
          enum: ["new", "contacted", "qualified", "converted", "lost"],
          description: "ステータス: new(新規), contacted(連絡済), qualified(見込確定), converted(顧客化), lost(失注)",
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
          enum: ["initial", "proposal", "negotiation", "contract", "won", "lost"],
          description: "ステージでフィルタ: initial(初期), proposal(提案中), negotiation(交渉中), contract(契約), won(成約), lost(失注)",
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
          enum: ["initial", "proposal", "negotiation", "contract", "won", "lost"],
          description: "ステージ: initial(初期), proposal(提案中), negotiation(交渉中), contract(契約), won(成約), lost(失注)",
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
          enum: ["initial", "proposal", "negotiation", "contract", "won", "lost"],
          description: "新しいステージ: initial(初期), proposal(提案中), negotiation(交渉中), contract(契約), won(成約), lost(失注)",
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
    description: "リード、案件、または取引先に活動記録を追加します。",
    input_schema: {
      type: "object" as const,
      properties: {
        entity_type: {
          type: "string",
          enum: ["lead", "deal", "client"],
          description: "対象の種類",
        },
        entity_id: {
          type: "string",
          description: "リード、案件、または取引先のID",
        },
        activity_type: {
          type: "string",
          enum: ["call", "meeting", "email", "visit", "demo", "other"],
          description: "活動種類: call(電話), meeting(会議), email(メール), visit(訪問), demo(デモ), other(その他)",
        },
        subject: {
          type: "string",
          description: "活動の件名（短い説明）",
        },
        description: {
          type: "string",
          description: "活動内容の詳細",
        },
      },
      required: ["entity_type", "entity_id", "activity_type"],
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
          source: input.source || "other",
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
          deal_name: input.name,
          lead_id: input.lead_id || null,
          client_id: input.client_id || null,
          amount: input.amount,
          expected_close_date: input.expected_close_date || null,
          stage: input.stage || "initial",
          notes: input.description || null,
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
      // Prepare the insert data based on entity type
      const insertData: Record<string, unknown> = {
        user_id: userId,
        activity_type: input.activity_type,
        subject: input.subject || input.description?.toString().substring(0, 100) || "活動記録",
        description: input.description,
        activity_date: new Date().toISOString(),
      };

      // Set the appropriate foreign key based on entity type
      if (input.entity_type === "lead") {
        insertData.lead_id = input.entity_id;
      } else if (input.entity_type === "deal") {
        insertData.deal_id = input.entity_id;
      } else if (input.entity_type === "client") {
        insertData.client_id = input.entity_id;
      }

      const { data, error } = await supabase
        .from("activities")
        .insert(insertData)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return { activity: data, message: "活動を記録しました" };
    }

    default:
      throw new Error(`Unknown CRM tool: ${toolName}`);
  }
}
