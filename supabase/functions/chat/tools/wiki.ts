import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export const wikiTools = [
  {
    name: "search_wiki",
    description: "Wikiページをキーワードで検索します。",
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
  {
    name: "wiki_list",
    description: "Wikiページの一覧を取得します。",
    input_schema: {
      type: "object" as const,
      properties: {
        limit: {
          type: "number",
          description: "取得件数の上限（デフォルト: 20）",
        },
      },
      required: [],
    },
  },
  {
    name: "wiki_get",
    description: "指定されたIDのWikiページの内容を取得します。",
    input_schema: {
      type: "object" as const,
      properties: {
        page_id: {
          type: "string",
          description: "WikiページID",
        },
      },
      required: ["page_id"],
    },
  },
  {
    name: "wiki_create",
    description: "新しいWikiページを作成します。",
    input_schema: {
      type: "object" as const,
      properties: {
        title: {
          type: "string",
          description: "ページタイトル",
        },
        content: {
          type: "string",
          description: "ページ内容（Markdown形式）",
        },
        parent_id: {
          type: "string",
          description: "親ページID（オプション）",
        },
      },
      required: ["title", "content"],
    },
  },
  {
    name: "wiki_update",
    description: "既存のWikiページを更新します。",
    input_schema: {
      type: "object" as const,
      properties: {
        page_id: {
          type: "string",
          description: "WikiページID",
        },
        title: {
          type: "string",
          description: "ページタイトル",
        },
        content: {
          type: "string",
          description: "ページ内容（Markdown形式）",
        },
      },
      required: ["page_id"],
    },
  },
  {
    name: "wiki_delete",
    description: "Wikiページを削除します。",
    input_schema: {
      type: "object" as const,
      properties: {
        page_id: {
          type: "string",
          description: "WikiページID",
        },
      },
      required: ["page_id"],
    },
  },
];

export async function executeWikiTool(
  toolName: string,
  input: Record<string, unknown>,
  userId: string,
  supabase: SupabaseClient
): Promise<unknown> {
  switch (toolName) {
    case "search_wiki": {
      const query = supabase
        .from("wiki_pages")
        .select("id, title, content, parent_id, updated_at")
        .eq("user_id", userId)
        .or(`title.ilike.%${input.query}%,content.ilike.%${input.query}%`)
        .order("updated_at", { ascending: false })
        .limit(input.limit as number || 10);

      const { data, error } = await query;
      if (error) throw new Error(error.message);

      // Return summary without full content for search results
      const results = data?.map((page) => ({
        id: page.id,
        title: page.title,
        parent_id: page.parent_id,
        excerpt: page.content?.substring(0, 200) + (page.content?.length > 200 ? "..." : ""),
        updated_at: page.updated_at,
      }));

      return { pages: results, count: data?.length || 0, query: input.query };
    }

    case "wiki_list": {
      const query = supabase
        .from("wiki_pages")
        .select("id, title, parent_id, updated_at")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(input.limit as number || 20);

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return { pages: data, count: data?.length || 0 };
    }

    case "wiki_get": {
      const { data, error } = await supabase
        .from("wiki_pages")
        .select("*")
        .eq("id", input.page_id)
        .eq("user_id", userId)
        .single();

      if (error) throw new Error(error.message);
      return { page: data };
    }

    case "wiki_create": {
      const { data, error } = await supabase
        .from("wiki_pages")
        .insert({
          user_id: userId,
          title: input.title,
          content: input.content,
          parent_id: input.parent_id || null,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return { page: data, message: "Wikiページを作成しました" };
    }

    case "wiki_update": {
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (input.title) updateData.title = input.title;
      if (input.content) updateData.content = input.content;

      const { data, error } = await supabase
        .from("wiki_pages")
        .update(updateData)
        .eq("id", input.page_id)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return { page: data, message: "Wikiページを更新しました" };
    }

    case "wiki_delete": {
      const { error } = await supabase
        .from("wiki_pages")
        .delete()
        .eq("id", input.page_id)
        .eq("user_id", userId);

      if (error) throw new Error(error.message);
      return { message: "Wikiページを削除しました" };
    }

    default:
      throw new Error(`Unknown wiki tool: ${toolName}`);
  }
}
