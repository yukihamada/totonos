-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  start_date DATE,
  end_date DATE,
  budget DECIMAL(15, 2),
  color TEXT DEFAULT '#3B82F6',
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create project_members table for team assignments
CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'manager', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Create project_tasks table
CREATE TABLE IF NOT EXISTS public.project_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_org_id ON projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_project_members_project ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_project ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_assignee ON project_tasks(assignee_id);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
CREATE POLICY "Users can view own projects" ON projects
FOR SELECT USING (
  user_id = auth.uid()
  OR organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create projects" ON projects
FOR INSERT WITH CHECK (
  user_id = auth.uid()
);

CREATE POLICY "Users can update own projects" ON projects
FOR UPDATE USING (
  user_id = auth.uid()
  OR organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')
  )
);

CREATE POLICY "Users can delete own projects" ON projects
FOR DELETE USING (
  user_id = auth.uid()
  OR organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
);

-- RLS Policies for project_members
CREATE POLICY "Users can view project members" ON project_members
FOR SELECT USING (
  project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  OR project_id IN (
    SELECT p.id FROM projects p
    JOIN organization_members om ON p.organization_id = om.organization_id
    WHERE om.user_id = auth.uid()
  )
);

CREATE POLICY "Project owners can manage members" ON project_members
FOR ALL USING (
  project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
);

-- RLS Policies for project_tasks
CREATE POLICY "Users can view project tasks" ON project_tasks
FOR SELECT USING (
  project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  OR project_id IN (
    SELECT p.id FROM projects p
    JOIN organization_members om ON p.organization_id = om.organization_id
    WHERE om.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage project tasks" ON project_tasks
FOR ALL USING (
  project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  OR project_id IN (
    SELECT p.id FROM projects p
    JOIN organization_members om ON p.organization_id = om.organization_id
    WHERE om.user_id = auth.uid()
  )
);

-- Update trigger for timestamps
CREATE OR REPLACE FUNCTION update_project_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_timestamp
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_project_timestamp();

CREATE TRIGGER update_project_tasks_timestamp
  BEFORE UPDATE ON project_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_project_timestamp();

-- Function to calculate project progress based on tasks
CREATE OR REPLACE FUNCTION calculate_project_progress(p_project_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total_tasks INTEGER;
  completed_tasks INTEGER;
BEGIN
  SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'done')
  INTO total_tasks, completed_tasks
  FROM project_tasks
  WHERE project_id = p_project_id;

  IF total_tasks = 0 THEN
    RETURN 0;
  END IF;

  RETURN ROUND((completed_tasks::DECIMAL / total_tasks) * 100);
END;
$$ LANGUAGE plpgsql;
