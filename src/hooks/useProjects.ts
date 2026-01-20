import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Project, ProjectTask, ProjectMember } from '@/types/project';

// Projects
export function useProjects() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as unknown as Project[];
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
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as unknown as Project;
    },
    enabled: !!user && !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (project: Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'progress'>) => {
      if (!user) throw new Error('ログインが必要です');

      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...project,
          user_id: user.id,
          progress: 0,
        })
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.id] });
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
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as unknown as ProjectTask[];
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
      const updateData: Record<string, unknown> = { ...updates };
      
      // If status is changed to 'done', set completed_at
      if (updates.status === 'done') {
        updateData.completed_at = new Date().toISOString();
      } else if (updates.status) {
        updateData.completed_at = null;
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['project-tasks', data.projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({ title: 'タスクを削除しました' });
    },
    onError: (error) => {
      toast({ title: 'エラー', description: error.message, variant: 'destructive' });
    },
  });
}

// Project Members
export function useProjectMembers(projectId: string) {
  return useQuery({
    queryKey: ['project-members', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_members')
        .select('*')
        .eq('project_id', projectId);

      if (error) throw error;
      return data as unknown as ProjectMember[];
    },
    enabled: !!projectId,
  });
}

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
      queryClient.invalidateQueries({ queryKey: ['project-members', data.project_id] });
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['project-members', data.projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', data.projectId] });
      toast({ title: 'メンバーを削除しました' });
    },
    onError: (error) => {
      toast({ title: 'エラー', description: error.message, variant: 'destructive' });
    },
  });
}

// Calculate project progress based on tasks
export function useProjectProgress(projectId: string) {
  const { data: tasks } = useProjectTasks(projectId);

  if (!tasks || tasks.length === 0) return 0;

  const completedTasks = tasks.filter(t => t.status === 'done').length;
  return Math.round((completedTasks / tasks.length) * 100);
}
