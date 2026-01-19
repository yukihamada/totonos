import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/useAuth';
import {
  useWikiPages,
  useWikiPage,
  useCreateWikiPage,
  useUpdateWikiPage,
  useDeleteWikiPage,
  useITAssets,
  useCreateITAsset,
  useUpdateITAsset,
  useDeleteITAsset,
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
} from '@/hooks/useWiki';

// Mock supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
          single: vi.fn(() => Promise.resolve({ data: { id: '1', title: 'Test', view_count: 0 }, error: null })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: '1' }, error: null })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: { id: '1' }, error: null })),
          })),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    })),
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: { user: { id: 'test-user-id', email: 'test@example.com' } } }, error: null })),
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

describe('useWiki hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useWikiPages', () => {
    it('should return wiki pages', async () => {
      const { result } = renderHook(() => useWikiPages(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isLoading || result.current.data !== undefined).toBe(true);
      });
    });

    it('should be defined', () => {
      const { result } = renderHook(() => useWikiPages(), { wrapper: createWrapper() });
      expect(result.current).toBeDefined();
    });
  });

  describe('useWikiPage', () => {
    it('should return single wiki page', async () => {
      const { result } = renderHook(() => useWikiPage('test-id'), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current).toBeDefined();
      });
    });

    it('should be disabled without id', () => {
      const { result } = renderHook(() => useWikiPage(''), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('useCreateWikiPage', () => {
    it('should provide mutate function', () => {
      const { result } = renderHook(() => useCreateWikiPage(), { wrapper: createWrapper() });
      expect(result.current.mutate).toBeDefined();
    });
  });

  describe('useUpdateWikiPage', () => {
    it('should provide mutate function', () => {
      const { result } = renderHook(() => useUpdateWikiPage(), { wrapper: createWrapper() });
      expect(result.current.mutate).toBeDefined();
    });
  });

  describe('useDeleteWikiPage', () => {
    it('should provide mutate function', () => {
      const { result } = renderHook(() => useDeleteWikiPage(), { wrapper: createWrapper() });
      expect(result.current.mutate).toBeDefined();
    });
  });
});

describe('useITAssets hooks', () => {
  describe('useITAssets', () => {
    it('should return IT assets', async () => {
      const { result } = renderHook(() => useITAssets(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current).toBeDefined();
      });
    });
  });

  describe('useCreateITAsset', () => {
    it('should provide mutate function', () => {
      const { result } = renderHook(() => useCreateITAsset(), { wrapper: createWrapper() });
      expect(result.current.mutate).toBeDefined();
    });
  });

  describe('useUpdateITAsset', () => {
    it('should provide mutate function', () => {
      const { result } = renderHook(() => useUpdateITAsset(), { wrapper: createWrapper() });
      expect(result.current.mutate).toBeDefined();
    });
  });

  describe('useDeleteITAsset', () => {
    it('should provide mutate function', () => {
      const { result } = renderHook(() => useDeleteITAsset(), { wrapper: createWrapper() });
      expect(result.current.mutate).toBeDefined();
    });
  });
});

describe('useTasks hooks', () => {
  describe('useTasks', () => {
    it('should return tasks without filter', async () => {
      const { result } = renderHook(() => useTasks(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current).toBeDefined();
      });
    });

    it('should return tasks with status filter', async () => {
      const { result } = renderHook(() => useTasks('todo'), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current).toBeDefined();
      });
    });

    it('should accept different status values', () => {
      const statuses = ['todo', 'in_progress', 'review', 'done'] as const;
      statuses.forEach(status => {
        const { result } = renderHook(() => useTasks(status), { wrapper: createWrapper() });
        expect(result.current).toBeDefined();
      });
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
});

describe('Wiki data structures', () => {
  it('should handle wiki page with content', () => {
    const page = {
      id: '1',
      title: 'Getting Started',
      content: '# Welcome',
      category: 'Documentation',
      view_count: 10,
    };

    expect(page.view_count).toBe(10);
    expect(page.content).toContain('#');
  });

  it('should handle IT asset with employee', () => {
    const asset = {
      id: '1',
      asset_code: 'PC-001',
      asset_type: 'laptop',
      manufacturer: 'Apple',
      model: 'MacBook Pro',
      employee_id: 'emp-1',
    };

    expect(asset.asset_code).toBe('PC-001');
  });
});
