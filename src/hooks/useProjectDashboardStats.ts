import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { addDays, format } from "date-fns";

export interface ProjectDashboardStats {
  activeProjectsCount: number;
  averageProgress: number;
  nearDeadlineCount: number;
  completedTasksThisMonth: number;
  estimatedHours: number;
  projectBreakdown: Array<{
    name: string;
    progress: number;
    tasksCompleted: number;
    tasksTotal: number;
  }>;
}

export function useProjectDashboardStats() {
  const { user } = useAuth();
  const today = new Date();
  const weekFromNow = format(addDays(today, 7), 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['project-dashboard-stats', user?.id],
    queryFn: async (): Promise<ProjectDashboardStats> => {
      if (!user?.id) {
        return {
          activeProjectsCount: 0,
          averageProgress: 0,
          nearDeadlineCount: 0,
          completedTasksThisMonth: 0,
          estimatedHours: 0,
          projectBreakdown: [],
        };
      }

      // Fetch active projects with tasks
      const { data: projects, error: projectError } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          status,
          progress,
          end_date,
          project_tasks (
            id,
            status
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (projectError) {
        console.error('Error fetching projects:', projectError);
      }

      const activeProjects = projects || [];
      const activeCount = activeProjects.length;

      // Calculate average progress
      const totalProgress = activeProjects.reduce((sum, p) => sum + (p.progress || 0), 0);
      const avgProgress = activeCount > 0 ? Math.round(totalProgress / activeCount) : 0;

      // Count projects with deadline within 7 days
      const nearDeadline = activeProjects.filter(p => 
        p.end_date && p.end_date <= weekFromNow
      ).length;

      // Calculate completed tasks this month and estimated hours
      let completedTasks = 0;
      const breakdown = activeProjects.map(p => {
        const tasks = p.project_tasks || [];
        const completed = tasks.filter(t => t.status === 'done').length;
        completedTasks += completed;
        
        return {
          name: p.name,
          progress: p.progress || 0,
          tasksCompleted: completed,
          tasksTotal: tasks.length,
        };
      });

      // Estimate hours: 2 hours per completed task (rough estimation)
      const estimatedHours = completedTasks * 2;

      return {
        activeProjectsCount: activeCount,
        averageProgress: avgProgress,
        nearDeadlineCount: nearDeadline,
        completedTasksThisMonth: completedTasks,
        estimatedHours,
        projectBreakdown: breakdown.slice(0, 5), // Top 5 projects
      };
    },
    enabled: !!user?.id,
    staleTime: 30000,
  });
}
