import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Project, ProjectTask, ProjectMember } from '@/types/project';

// Projects
export function useProjects() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          tasks:project_tasks(id, status)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate task counts
      return (data || []).map(project => ({
        ...project,
        tasks_total: project.tasks?.length || 0,
        tasks_completed: project.tasks?.filter((t: { status: string }) => t.status === 'done').length || 0,
      })) as Project[];
    },
    enabled: !!user,
  });
}

export function useProject(id: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          members:project_members(
            *,
            profile:profiles(display_name, company_name)
          ),
          tasks:project_tasks(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Project;
    },
    enabled: !!user && !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (project: Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'progress'>) => {
      const { data, error } = await supabase
        .from('projects')
        .insert({ ...project, user_id: user?.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({ title: 'プロジェクトを作成しました' });
    },
    onError: (error) => {
      toast({ title: 'エラー', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Project> & { id: string }) => {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', data.id] });
      toast({ title: 'プロジェクトを更新しました' });
    },
    onError: (error) => {
      toast({ title: 'エラー', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({ title: 'プロジェクトを削除しました' });
    },
    onError: (error) => {
      toast({ title: 'エラー', description: error.message, variant: 'destructive' });
    },
  });
}

// Project Tasks
export function useProjectTasks(projectId: string) {
  return useQuery({
    queryKey: ['project-tasks', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as ProjectTask[];
    },
    enabled: !!projectId,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (task: Omit<ProjectTask, 'id' | 'created_at' | 'updated_at' | 'completed_at'>) => {
      const { data, error } = await supabase
        .from('project_tasks')
        .insert(task)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['project-tasks', data.project_id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({ title: 'タスクを作成しました' });
    },
    onError: (error) => {
      toast({ title: 'エラー', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ProjectTask> & { id: string }) => {
      const updateData: Partial<ProjectTask> = { ...updates };
      if (updates.status === 'done') {
        updateData.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('project_tasks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['project-tasks', data.project_id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({ title: 'タスクを更新しました' });
    },
    onError: (error) => {
      toast({ title: 'エラー', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, projectId }: { id: string; projectId: string }) => {
      const { error } = await supabase
        .from('project_tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { projectId };
    },
    onSuccess: ({ projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['project-tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({ title: 'タスクを削除しました' });
    },
    onError: (error) => {
      toast({ title: 'エラー', description: error.message, variant: 'destructive' });
    },
  });
}

// Project Members
export function useAddProjectMember() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (member: Omit<ProjectMember, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('project_members')
        .insert(member)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['project', data.project_id] });
      toast({ title: 'メンバーを追加しました' });
    },
    onError: (error) => {
      toast({ title: 'エラー', description: error.message, variant: 'destructive' });
    },
  });
}

export function useRemoveProjectMember() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, projectId }: { id: string; projectId: string }) => {
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { projectId };
    },
    onSuccess: ({ projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      toast({ title: 'メンバーを削除しました' });
    },
    onError: (error) => {
      toast({ title: 'エラー', description: error.message, variant: 'destructive' });
    },
  });
}
