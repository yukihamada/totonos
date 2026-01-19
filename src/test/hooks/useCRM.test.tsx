import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/useAuth';
import { useLeads, useDeals, useActivities, useCRMStats, useCreateLead, useUpdateLead, useDeleteLead } from '@/hooks/useCRM';

// Mock supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
          gte: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        single: vi.fn(() => Promise.resolve({ data: null, error: null })),
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

describe('useCRM hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useLeads', () => {
    it('should be defined', () => {
      const { result } = renderHook(() => useLeads(), { wrapper: createWrapper() });
      expect(result.current).toBeDefined();
    });

    it('should have query properties', () => {
      const { result } = renderHook(() => useLeads(), { wrapper: createWrapper() });
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('data');
      expect(result.current).toHaveProperty('error');
    });
  });

  describe('useDeals', () => {
    it('should be defined', () => {
      const { result } = renderHook(() => useDeals(), { wrapper: createWrapper() });
      expect(result.current).toBeDefined();
    });

    it('should have query properties', () => {
      const { result } = renderHook(() => useDeals(), { wrapper: createWrapper() });
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('data');
    });
  });

  describe('useActivities', () => {
    it('should be defined with default limit', () => {
      const { result } = renderHook(() => useActivities(), { wrapper: createWrapper() });
      expect(result.current).toBeDefined();
    });

    it('should accept custom limit parameter', () => {
      const { result } = renderHook(() => useActivities(10), { wrapper: createWrapper() });
      expect(result.current).toBeDefined();
    });

    it('should have query properties', () => {
      const { result } = renderHook(() => useActivities(), { wrapper: createWrapper() });
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('data');
    });
  });

  describe('useCRMStats', () => {
    it('should be defined', () => {
      const { result } = renderHook(() => useCRMStats(), { wrapper: createWrapper() });
      expect(result.current).toBeDefined();
    });

    it('should have query properties', () => {
      const { result } = renderHook(() => useCRMStats(), { wrapper: createWrapper() });
      expect(result.current).toHaveProperty('isLoading');
    });
  });

  describe('useCreateLead', () => {
    it('should provide mutate function', () => {
      const { result } = renderHook(() => useCreateLead(), { wrapper: createWrapper() });
      expect(result.current.mutate).toBeDefined();
      expect(result.current.mutateAsync).toBeDefined();
    });

    it('should have isPending state', () => {
      const { result } = renderHook(() => useCreateLead(), { wrapper: createWrapper() });
      expect(result.current.isPending).toBe(false);
    });
  });

  describe('useUpdateLead', () => {
    it('should provide mutate function', () => {
      const { result } = renderHook(() => useUpdateLead(), { wrapper: createWrapper() });
      expect(result.current.mutate).toBeDefined();
    });
  });

  describe('useDeleteLead', () => {
    it('should provide mutate function', () => {
      const { result } = renderHook(() => useDeleteLead(), { wrapper: createWrapper() });
      expect(result.current.mutate).toBeDefined();
    });
  });
});
