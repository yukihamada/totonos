import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCreateEstimate } from '@/hooks/useEstimates';
import React from 'react';

// Mock supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ 
            data: { id: 'test-estimate-id', estimate_number: 'EST-202601-XXXX' }, 
            error: null 
          })),
        })),
      })),
    })),
  },
}));

// Mock useAuth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
  }),
}));

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useCreateEstimate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-20'));
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('throws error when valid_until is in the past', async () => {
    const { result } = renderHook(() => useCreateEstimate(), {
      wrapper: createWrapper(),
    });

    const pastDate = '2026-01-19'; // Yesterday

    result.current.mutate({
      title: 'Test Estimate',
      valid_until: pastDate,
      items: [
        { description: 'Item 1', quantity: 1, unit_price: 10000 },
      ],
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('有効期限は現在日より未来の日付を指定してください');
  });

  it('throws error when valid_until is far in the past', async () => {
    const { result } = renderHook(() => useCreateEstimate(), {
      wrapper: createWrapper(),
    });

    const pastDate = '2025-12-31'; // Last year

    result.current.mutate({
      title: 'Test Estimate',
      valid_until: pastDate,
      items: [
        { description: 'Item 1', quantity: 1, unit_price: 10000 },
      ],
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('有効期限は現在日より未来の日付を指定してください');
  });

  it('allows valid_until equal to today', async () => {
    const { result } = renderHook(() => useCreateEstimate(), {
      wrapper: createWrapper(),
    });

    const today = '2026-01-20';

    result.current.mutate({
      title: 'Test Estimate',
      valid_until: today,
      items: [
        { description: 'Item 1', quantity: 1, unit_price: 10000 },
      ],
    });

    await waitFor(() => {
      // Should not throw the past date error
      if (result.current.isError) {
        expect(result.current.error?.message).not.toBe('有効期限は現在日より未来の日付を指定してください');
      }
    });
  });

  it('allows valid_until in the future', async () => {
    const { result } = renderHook(() => useCreateEstimate(), {
      wrapper: createWrapper(),
    });

    const futureDate = '2026-02-28';

    result.current.mutate({
      title: 'Test Estimate',
      valid_until: futureDate,
      items: [
        { description: 'Item 1', quantity: 1, unit_price: 10000 },
      ],
    });

    await waitFor(() => {
      // Should not throw the past date error
      if (result.current.isError) {
        expect(result.current.error?.message).not.toBe('有効期限は現在日より未来の日付を指定してください');
      }
    });
  });
});
