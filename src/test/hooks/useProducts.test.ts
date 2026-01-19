import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock supabase
const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' },
    loading: false,
  }),
}));

// Create wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  );
};

describe('useProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Product List', () => {
    it('should fetch products for authenticated user', async () => {
      const mockProducts = [
        { id: '1', name: 'Product 1', sku: 'SKU-001', price: 1000 },
        { id: '2', name: 'Product 2', sku: 'SKU-002', price: 2000 },
      ];

      mockSupabase.order.mockResolvedValueOnce({ data: mockProducts, error: null });

      // Import after mocking
      const { useProducts } = await import('@/hooks/useProducts');
      const { result } = renderHook(() => useProducts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.products).toHaveLength(2);
      expect(mockSupabase.from).toHaveBeenCalledWith('products');
    });

    it('should return empty array when user is not authenticated', async () => {
      vi.doMock('@/hooks/useAuth', () => ({
        useAuth: () => ({ user: null, loading: false }),
      }));

      // Need to re-import to get the new mock
      vi.resetModules();
      const { useProducts } = await import('@/hooks/useProducts');
      const { result } = renderHook(() => useProducts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.products).toEqual([]);
    });
  });

  describe('JAN Code Validation', () => {
    it('should accept valid 13-digit JAN code', () => {
      // Valid JAN-13: 4901234567894
      const janCode = '4901234567894';
      expect(validateJanCode(janCode)).toBe(true);
    });

    it('should accept valid 8-digit JAN code', () => {
      // Valid JAN-8: 49123459
      const janCode = '49123459';
      expect(validateJanCode(janCode)).toBe(true);
    });

    it('should reject invalid JAN code with wrong check digit', () => {
      const janCode = '4901234567890'; // Wrong check digit
      expect(validateJanCode(janCode)).toBe(false);
    });

    it('should reject non-numeric JAN code', () => {
      const janCode = '490123456789A';
      expect(validateJanCode(janCode)).toBe(false);
    });

    it('should reject JAN code with wrong length', () => {
      const janCode = '12345';
      expect(validateJanCode(janCode)).toBe(false);
    });
  });
});

describe('useLowStockProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should filter products with stock below reorder point', async () => {
    const mockProducts = [
      { id: '1', name: 'Low Stock', stock_quantity: 5, reorder_point: 10, is_inventory_managed: true, status: 'active' },
      { id: '2', name: 'OK Stock', stock_quantity: 20, reorder_point: 10, is_inventory_managed: true, status: 'active' },
      { id: '3', name: 'Out of Stock', stock_quantity: 0, reorder_point: 10, is_inventory_managed: true, status: 'active' },
    ];

    mockSupabase.order.mockResolvedValueOnce({ data: mockProducts, error: null });

    const { useLowStockProducts } = await import('@/hooks/useProducts');
    const { result } = renderHook(() => useLowStockProducts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should filter to only low stock and out of stock items
    expect(result.current.data).toHaveLength(2);
    expect(result.current.data?.map(p => p.id)).toEqual(['1', '3']);
  });

  it('should include products with null reorder_point and zero stock', async () => {
    const mockProducts = [
      { id: '1', name: 'No Reorder Point', stock_quantity: 0, reorder_point: null, is_inventory_managed: true, status: 'active' },
    ];

    mockSupabase.order.mockResolvedValueOnce({ data: mockProducts, error: null });

    const { useLowStockProducts } = await import('@/hooks/useProducts');
    const { result } = renderHook(() => useLowStockProducts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // stock_quantity (0) <= reorder_point (null → 0), so should be included
    expect(result.current.data).toHaveLength(1);
  });
});

// Helper function to validate JAN code
function validateJanCode(janCode: string): boolean {
  if (!/^\d+$/.test(janCode)) return false;
  if (janCode.length !== 8 && janCode.length !== 13) return false;

  const digits = janCode.split('').map(Number);
  const checkDigit = digits.pop()!;
  
  let sum = 0;
  if (janCode.length === 13) {
    // JAN-13
    for (let i = 0; i < digits.length; i++) {
      sum += digits[i] * (i % 2 === 0 ? 1 : 3);
    }
  } else {
    // JAN-8
    for (let i = 0; i < digits.length; i++) {
      sum += digits[i] * (i % 2 === 0 ? 3 : 1);
    }
  }
  
  const calculatedCheckDigit = (10 - (sum % 10)) % 10;
  return checkDigit === calculatedCheckDigit;
}
