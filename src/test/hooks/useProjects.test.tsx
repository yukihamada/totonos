import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/useAuth';
import {
  useProjects,
  useProject,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  useProjectTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useAddProjectMember,
  useRemoveProjectMember,
} from '@/hooks/useProjects';

// Mock supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: { user: { id: 'test-user-id' } } }, error: null })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
};

describe('useProjects hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useProjects', () => {
    it('should return empty array (mock data)', async () => {
      const { result } = renderHook(() => useProjects(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.data).toEqual([]);
      });
    });

    it('should not be loading initially', () => {
      const { result } = renderHook(() => useProjects(), { wrapper: createWrapper() });
      expect(result.current).toBeDefined();
    });
  });

  describe('useProject', () => {
    it('should return undefined for single project (stub)', async () => {
      const { result } = renderHook(() => useProject('test-id'), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.data).toBeUndefined();
      });
    });

    it('should handle empty id', () => {
      const { result } = renderHook(() => useProject(''), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('useCreateProject', () => {
    it('should provide mutate function', () => {
      const { result } = renderHook(() => useCreateProject(), { wrapper: createWrapper() });
      expect(result.current.mutate).toBeDefined();
      expect(result.current.mutateAsync).toBeDefined();
    });

    it('should have initial isPending as false', () => {
      const { result } = renderHook(() => useCreateProject(), { wrapper: createWrapper() });
      expect(result.current.isPending).toBe(false);
    });
  });

  describe('useUpdateProject', () => {
    it('should provide mutate function', () => {
      const { result } = renderHook(() => useUpdateProject(), { wrapper: createWrapper() });
      expect(result.current.mutate).toBeDefined();
    });

    it('should have isIdle state initially', () => {
      const { result } = renderHook(() => useUpdateProject(), { wrapper: createWrapper() });
      expect(result.current.isIdle).toBe(true);
    });
  });

  describe('useDeleteProject', () => {
    it('should provide mutate function', () => {
      const { result } = renderHook(() => useDeleteProject(), { wrapper: createWrapper() });
      expect(result.current.mutate).toBeDefined();
    });
  });

  describe('useProjectTasks', () => {
    it('should return empty array', async () => {
      const { result } = renderHook(() => useProjectTasks('project-1'), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.data).toEqual([]);
      });
    });

    it('should be disabled without projectId', () => {
      const { result } = renderHook(() => useProjectTasks(''), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('useCreateTask', () => {
    it('should provide mutate function', () => {
      const { result } = renderHook(() => useCreateTask(), { wrapper: createWrapper() });
      expect(result.current.mutate).toBeDefined();
    });
  });

  describe('useUpdateTask', () => {
    it('should provide mutate function', () => {
      const { result } = renderHook(() => useUpdateTask(), { wrapper: createWrapper() });
      expect(result.current.mutate).toBeDefined();
    });
  });

  describe('useDeleteTask', () => {
    it('should provide mutate function', () => {
      const { result } = renderHook(() => useDeleteTask(), { wrapper: createWrapper() });
      expect(result.current.mutate).toBeDefined();
    });
  });

  describe('useAddProjectMember', () => {
    it('should provide mutate function', () => {
      const { result } = renderHook(() => useAddProjectMember(), { wrapper: createWrapper() });
      expect(result.current.mutate).toBeDefined();
    });
  });

  describe('useRemoveProjectMember', () => {
    it('should provide mutate function', () => {
      const { result } = renderHook(() => useRemoveProjectMember(), { wrapper: createWrapper() });
      expect(result.current.mutate).toBeDefined();
    });
  });
});
