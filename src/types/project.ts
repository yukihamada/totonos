export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ProjectMemberRole = 'owner' | 'manager' | 'member';

export interface Project {
  id: string;
  user_id: string;
  organization_id: string | null;
  company_id: string | null;
  name: string;
  description: string | null;
  status: ProjectStatus;
  progress: number;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  color: string;
  client_id: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  members?: ProjectMember[];
  tasks?: ProjectTask[];
  tasks_total?: number;
  tasks_completed?: number;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: ProjectMemberRole;
  created_at: string;
  // Relations
  profile?: {
    display_name: string | null;
    company_name: string | null;
  };
}

export interface ProjectTask {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id: string | null;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export const projectStatusLabels: Record<ProjectStatus, string> = {
  planning: '計画中',
  active: '進行中',
  on_hold: '保留中',
  completed: '完了',
  cancelled: 'キャンセル',
};

export const projectStatusColors: Record<ProjectStatus, string> = {
  planning: 'bg-gray-500',
  active: 'bg-blue-500',
  on_hold: 'bg-yellow-500',
  completed: 'bg-green-500',
  cancelled: 'bg-red-500',
};

export const taskStatusLabels: Record<TaskStatus, string> = {
  todo: '未着手',
  in_progress: '進行中',
  review: 'レビュー',
  done: '完了',
};

export const taskPriorityLabels: Record<TaskPriority, string> = {
  low: '低',
  medium: '中',
  high: '高',
  urgent: '緊急',
};
