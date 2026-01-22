import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export const projectTools = [
  {
    name: "list_projects",
    description: "プロジェクトの一覧を取得します。",
    input_schema: {
      type: "object" as const,
      properties: {
        status: {
          type: "string",
          enum: ["planning", "active", "on_hold", "completed", "cancelled"],
          description: "ステータスでフィルタ",
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
    name: "project_get",
    description: "指定されたIDのプロジェクトの詳細を取得します。タスクも含まれます。",
    input_schema: {
      type: "object" as const,
      properties: {
        project_id: {
          type: "string",
          description: "プロジェクトID",
        },
      },
      required: ["project_id"],
    },
  },
  {
    name: "project_create",
    description: "新しいプロジェクトを作成します。",
    input_schema: {
      type: "object" as const,
      properties: {
        name: {
          type: "string",
          description: "プロジェクト名",
        },
        description: {
          type: "string",
          description: "説明",
        },
        start_date: {
          type: "string",
          description: "開始日（YYYY-MM-DD形式）",
        },
        end_date: {
          type: "string",
          description: "終了予定日（YYYY-MM-DD形式）",
        },
      },
      required: ["name"],
    },
  },
  {
    name: "project_update",
    description: "プロジェクト情報を更新します。",
    input_schema: {
      type: "object" as const,
      properties: {
        project_id: {
          type: "string",
          description: "プロジェクトID",
        },
        name: {
          type: "string",
          description: "プロジェクト名",
        },
        status: {
          type: "string",
          enum: ["planning", "active", "on_hold", "completed", "cancelled"],
          description: "ステータス",
        },
        description: {
          type: "string",
          description: "説明",
        },
        end_date: {
          type: "string",
          description: "終了予定日（YYYY-MM-DD形式）",
        },
        progress: {
          type: "number",
          description: "進捗率（0-100）",
        },
      },
      required: ["project_id"],
    },
  },
  {
    name: "task_create",
    description: "プロジェクトにタスクを追加します。",
    input_schema: {
      type: "object" as const,
      properties: {
        project_id: {
          type: "string",
          description: "プロジェクトID",
        },
        title: {
          type: "string",
          description: "タスクタイトル",
        },
        description: {
          type: "string",
          description: "タスク説明",
        },
        assigned_to: {
          type: "string",
          description: "担当者ID",
        },
        due_date: {
          type: "string",
          description: "期限（YYYY-MM-DD形式）",
        },
        priority: {
          type: "string",
          enum: ["low", "medium", "high", "urgent"],
          description: "優先度",
        },
      },
      required: ["project_id", "title"],
    },
  },
  {
    name: "task_update_status",
    description: "タスクのステータスを更新します。",
    input_schema: {
      type: "object" as const,
      properties: {
        task_id: {
          type: "string",
          description: "タスクID",
        },
        status: {
          type: "string",
          enum: ["todo", "in_progress", "review", "done"],
          description: "新しいステータス",
        },
      },
      required: ["task_id", "status"],
    },
  },
  {
    name: "list_tasks",
    description: "タスクの一覧を取得します。",
    input_schema: {
      type: "object" as const,
      properties: {
        project_id: {
          type: "string",
          description: "プロジェクトIDでフィルタ",
        },
        status: {
          type: "string",
          enum: ["todo", "in_progress", "review", "done"],
          description: "ステータスでフィルタ",
        },
        assigned_to: {
          type: "string",
          description: "担当者IDでフィルタ",
        },
        limit: {
          type: "number",
          description: "取得件数の上限（デフォルト: 50）",
        },
      },
      required: [],
    },
  },
];

export async function executeProjectTool(
  toolName: string,
  input: Record<string, unknown>,
  userId: string,
  supabase: SupabaseClient
): Promise<unknown> {
  switch (toolName) {
    case "list_projects": {
      let query = supabase
        .from("projects")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(input.limit as number || 20);

      if (input.status) {
        query = query.eq("status", input.status);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return { projects: data, count: data?.length || 0 };
    }

    case "project_get": {
      // First get the project
      const { data: project, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", input.project_id)
        .eq("user_id", userId)
        .single();

      if (error) throw new Error(error.message);

      // Then get related tasks
      const { data: tasks } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", userId)
        .eq("related_type", "project")
        .eq("related_id", input.project_id)
        .order("due_date", { ascending: true });

      return { project: { ...project, tasks: tasks || [] } };
    }

    case "project_create": {
      const { data, error } = await supabase
        .from("projects")
        .insert({
          user_id: userId,
          name: input.name,
          description: input.description || null,
          start_date: input.start_date || new Date().toISOString().split("T")[0],
          end_date: input.end_date || null,
          status: "planning",
          progress: 0,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return { project: data, message: `プロジェクト「${input.name}」を作成しました` };
    }

    case "project_update": {
      const updateData: Record<string, unknown> = {};
      if (input.name) updateData.name = input.name;
      if (input.status) updateData.status = input.status;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.end_date) updateData.end_date = input.end_date;
      if (input.progress !== undefined) updateData.progress = input.progress;

      const { data, error } = await supabase
        .from("projects")
        .update(updateData)
        .eq("id", input.project_id)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return { project: data, message: "プロジェクトを更新しました" };
    }

    case "task_create": {
      // Get project name if project_id is provided
      let projectName: string | null = null;
      if (input.project_id) {
        const { data: project } = await supabase
          .from("projects")
          .select("name")
          .eq("id", input.project_id)
          .single();
        projectName = project?.name || null;
      }

      const { data, error } = await supabase
        .from("tasks")
        .insert({
          user_id: userId,
          title: input.title,
          description: input.description || null,
          assignee_id: input.assigned_to || null,
          due_date: input.due_date || null,
          priority: input.priority || "medium",
          status: "todo",
          project_name: projectName,
          related_type: input.project_id ? "project" : null,
          related_id: input.project_id || null,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return { task: data, message: `タスク「${input.title}」を作成しました` };
    }

    case "task_update_status": {
      const updateData: Record<string, unknown> = { status: input.status };
      if (input.status === "done") {
        updateData.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from("tasks")
        .update(updateData)
        .eq("id", input.task_id)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return { task: data, message: `タスクのステータスを「${input.status}」に更新しました` };
    }

    case "list_tasks": {
      let query = supabase
        .from("tasks")
        .select("*")
        .eq("user_id", userId)
        .order("due_date", { ascending: true })
        .limit(input.limit as number || 50);

      if (input.project_id) {
        query = query.eq("related_type", "project").eq("related_id", input.project_id);
      }
      if (input.status) {
        query = query.eq("status", input.status);
      }
      if (input.assigned_to) {
        query = query.eq("assignee_id", input.assigned_to);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return { tasks: data, count: data?.length || 0 };
    }

    default:
      throw new Error(`Unknown project tool: ${toolName}`);
  }
}
