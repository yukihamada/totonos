import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ViewTask {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee: string;
  dueDate: string;
  startDate: string;
  tags: string[];
}

export function useDatabaseViewTasks() {
  return useQuery({
    queryKey: ["database-view-tasks"],
    queryFn: async (): Promise<ViewTask[]> => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("due_date", { ascending: true })
        .limit(50);

      if (error) throw error;
      if (!data || data.length === 0) return [];

      const statusMap: Record<string, ViewTask['status']> = {
        pending: 'todo',
        in_progress: 'in_progress',
        review: 'review',
        completed: 'done',
      };

      const priorityMap: Record<string, ViewTask['priority']> = {
        low: 'low',
        medium: 'medium',
        high: 'high',
        urgent: 'high',
      };

      return data.map((task) => ({
        id: task.id,
        title: task.title || '（タイトルなし）',
        status: statusMap[task.status || 'pending'] || 'todo',
        priority: priorityMap[task.priority || 'medium'] || 'medium',
        assignee: task.assignee_id || '未割当',
        dueDate: task.due_date || '',
        startDate: task.created_at?.split('T')[0] || '',
        tags: task.project_name ? [task.project_name] : [],
      }));
    },
  });
}
