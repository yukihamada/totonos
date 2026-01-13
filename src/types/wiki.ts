// Wiki & Information Management Types

export type WikiCategory = 'manual' | 'policy' | 'minutes' | 'announcement' | 'template' | 'other';
export type AssetType = 'pc' | 'mobile' | 'monitor' | 'furniture' | 'software_license' | 'other';
export type AssetStatus = 'in_use' | 'in_stock' | 'maintenance' | 'disposed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';

export interface WikiPage {
  id: string;
  user_id: string;
  title: string;
  content?: string;
  parent_page_id?: string;
  category: WikiCategory;
  is_published: boolean;
  view_count: number;
  last_edited_by?: string;
  created_at: string;
  updated_at: string;
  children?: WikiPage[];
}

export interface ITAsset {
  id: string;
  user_id: string;
  asset_type: AssetType;
  asset_name: string;
  asset_code: string;
  manufacturer?: string;
  model?: string;
  serial_number?: string;
  purchase_date?: string;
  purchase_price: number;
  assigned_to_employee_id?: string;
  location?: string;
  status: AssetStatus;
  license_expires_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  employee?: { name: string };
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  assignee_id?: string;
  due_date?: string;
  priority: TaskPriority;
  status: TaskStatus;
  project_name?: string;
  related_type?: string;
  related_id?: string;
  created_at: string;
  updated_at: string;
  assignee?: { name: string };
}

// Labels
export const categoryLabels: Record<WikiCategory, string> = {
  manual: 'マニュアル',
  policy: '規程・ポリシー',
  minutes: '議事録',
  announcement: 'お知らせ',
  template: 'テンプレート',
  other: 'その他',
};

export const assetTypeLabels: Record<AssetType, string> = {
  pc: 'PC',
  mobile: 'スマートフォン',
  monitor: 'モニター',
  furniture: '什器',
  software_license: 'ソフトウェアライセンス',
  other: 'その他',
};

export const assetStatusLabels: Record<AssetStatus, string> = {
  in_use: '使用中',
  in_stock: '在庫',
  maintenance: 'メンテナンス中',
  disposed: '廃棄済み',
};

export const priorityLabels: Record<TaskPriority, string> = {
  low: '低',
  medium: '中',
  high: '高',
  urgent: '緊急',
};

export const taskStatusLabels: Record<TaskStatus, string> = {
  todo: '未着手',
  in_progress: '進行中',
  review: 'レビュー中',
  done: '完了',
};

export const priorityColors: Record<TaskPriority, string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};
