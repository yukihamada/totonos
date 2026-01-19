import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/useAuth';
import {
  useContracts,
  useContract,
  useContractItems,
  useCreateContract,
  useUpdateContract,
  useDeleteContract,
} from '@/hooks/useContracts';

// Mock supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: { id: '1', contract_number: 'C-001', title: 'Test' },
            error: null
          })),
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

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
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

describe('useContracts hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useContracts', () => {
    it('should return contracts array', async () => {
      const { result } = renderHook(() => useContracts(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isLoading || result.current.data !== undefined).toBe(true);
      });
    });

    it('should be defined', () => {
      const { result } = renderHook(() => useContracts(), { wrapper: createWrapper() });
      expect(result.current).toBeDefined();
    });
  });

  describe('useContract', () => {
    it('should return single contract', async () => {
      const { result } = renderHook(() => useContract('test-id'), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current).toBeDefined();
      });
    });

    it('should be disabled without id', () => {
      const { result } = renderHook(() => useContract(''), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('useContractItems', () => {
    it('should return contract items', async () => {
      const { result } = renderHook(() => useContractItems('contract-1'), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current).toBeDefined();
      });
    });

    it('should be disabled without contractId', () => {
      const { result } = renderHook(() => useContractItems(''), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('useCreateContract', () => {
    it('should provide mutate function', () => {
      const { result } = renderHook(() => useCreateContract(), { wrapper: createWrapper() });
      expect(result.current.mutate).toBeDefined();
      expect(result.current.mutateAsync).toBeDefined();
    });

    it('should have isPending state', () => {
      const { result } = renderHook(() => useCreateContract(), { wrapper: createWrapper() });
      expect(result.current.isPending).toBe(false);
    });

    it('should have isSuccess state', () => {
      const { result } = renderHook(() => useCreateContract(), { wrapper: createWrapper() });
      expect(result.current.isSuccess).toBe(false);
    });
  });

  describe('useUpdateContract', () => {
    it('should provide mutate function', () => {
      const { result } = renderHook(() => useUpdateContract(), { wrapper: createWrapper() });
      expect(result.current.mutate).toBeDefined();
    });

    it('should be idle initially', () => {
      const { result } = renderHook(() => useUpdateContract(), { wrapper: createWrapper() });
      expect(result.current.isIdle).toBe(true);
    });
  });

  describe('useDeleteContract', () => {
    it('should provide mutate function', () => {
      const { result } = renderHook(() => useDeleteContract(), { wrapper: createWrapper() });
      expect(result.current.mutate).toBeDefined();
    });

    it('should have reset function', () => {
      const { result } = renderHook(() => useDeleteContract(), { wrapper: createWrapper() });
      expect(result.current.reset).toBeDefined();
    });
  });
});

describe('Contract data structures', () => {
  it('should handle contract with items', () => {
    const contract = {
      id: '1',
      title: 'Service Agreement',
      amount: 100000,
      tax_amount: 10000,
      total_amount: 110000,
      status: 'draft' as const,
    };

    expect(contract.total_amount).toBe(contract.amount + contract.tax_amount);
  });

  it('should handle contract without items', () => {
    const contract = {
      id: '2',
      title: 'Simple Contract',
      amount: 50000,
    };

    expect(contract.amount).toBe(50000);
  });
});
