-- Phase 2: Create projects tables with RLS
-- プロジェクトテーブル
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'on_hold', 'completed', 'cancelled')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  start_date DATE,
  end_date DATE,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- プロジェクトメンバー
CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- プロジェクトタスク
CREATE TABLE IF NOT EXISTS public.project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  assignee_id UUID,
  due_date DATE,
  start_date DATE,
  progress INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS有効化
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;

-- プロジェクトのRLSポリシー (conditional based on company_id column existence)
DROP POLICY IF EXISTS "Users can manage their projects" ON public.projects;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'company_id' AND table_schema = 'public') THEN
    CREATE POLICY "Users can manage their projects" ON public.projects
      FOR ALL USING (
        user_id = auth.uid()
        OR company_id IN (
          SELECT company_id FROM public.company_members
          WHERE user_id = auth.uid() AND is_active = true
        )
      );
  ELSE
    CREATE POLICY "Users can manage their projects" ON public.projects
      FOR ALL USING (user_id = auth.uid());
  END IF;
END $$;

-- プロジェクトメンバーのRLSポリシー
DROP POLICY IF EXISTS "Users can view project members" ON public.project_members;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'company_id' AND table_schema = 'public') THEN
    CREATE POLICY "Users can view project members" ON public.project_members
      FOR SELECT USING (
        project_id IN (
          SELECT id FROM public.projects
          WHERE user_id = auth.uid()
          OR company_id IN (
            SELECT company_id FROM public.company_members
            WHERE user_id = auth.uid() AND is_active = true
          )
        )
      );
  ELSE
    CREATE POLICY "Users can view project members" ON public.project_members
      FOR SELECT USING (
        project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
      );
  END IF;
END $$;

DROP POLICY IF EXISTS "Users can manage project members" ON public.project_members;
CREATE POLICY "Users can manage project members" ON public.project_members
  FOR ALL USING (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid()
    )
  );

-- プロジェクトタスクのRLSポリシー
DROP POLICY IF EXISTS "Users can manage project tasks" ON public.project_tasks;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'company_id' AND table_schema = 'public') THEN
    CREATE POLICY "Users can manage project tasks" ON public.project_tasks
      FOR ALL USING (
        project_id IN (
          SELECT id FROM public.projects
          WHERE user_id = auth.uid()
          OR company_id IN (
            SELECT company_id FROM public.company_members
            WHERE user_id = auth.uid() AND is_active = true
          )
        )
      );
  ELSE
    CREATE POLICY "Users can manage project tasks" ON public.project_tasks
      FOR ALL USING (
        project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
      );
  END IF;
END $$;

-- 更新日時自動更新トリガー
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_tasks_updated_at
  BEFORE UPDATE ON public.project_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Phase 3: search_path修正
CREATE OR REPLACE FUNCTION public.apply_industry_template()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  IF NEW.template_id IS NOT NULL THEN
    INSERT INTO public.accounts (user_id, account_code, account_name, account_type, is_system)
    SELECT NEW.created_by, account_code, account_name, 
           account_type::public.account_type, true
    FROM public.template_accounts
    WHERE is_common = true
    ON CONFLICT DO NOTHING;
    
    INSERT INTO public.accounts (user_id, account_code, account_name, account_type, is_system)
    SELECT NEW.created_by, ta.account_code, ta.account_name,
           ta.account_type::public.account_type, true
    FROM public.template_accounts ta
    WHERE ta.template_id = NEW.template_id
    ON CONFLICT DO NOTHING;
    
    NEW.template_applied_at := now();
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Phase 4: パフォーマンス最適化 - インデックス追加
CREATE INDEX IF NOT EXISTS idx_company_members_user_company_active 
  ON public.company_members(user_id, company_id) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_leads_user_status 
  ON public.leads(user_id, status);

CREATE INDEX IF NOT EXISTS idx_invoices_user_date 
  ON public.invoices(user_id, issue_date DESC);

CREATE INDEX IF NOT EXISTS idx_attendance_employee_date 
  ON public.attendance_records(employee_id, work_date DESC);

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'company_id' AND table_schema = 'public') THEN
    CREATE INDEX IF NOT EXISTS idx_projects_user_company ON public.projects(user_id, company_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_project_tasks_project_status 
  ON public.project_tasks(project_id, status);