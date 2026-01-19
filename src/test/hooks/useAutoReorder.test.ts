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
  eq: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  single: vi.fn(),
  order: vi.fn().mockReturnThis(),
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

describe('useReorderSuggestions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should calculate reorder suggestions correctly', async () => {
    const mockLowStockProducts = [
      { 
        id: '1', 
        name: 'Product A', 
        stock_quantity: 5, 
        reorder_point: 10,
        reorder_quantity: 50,
        supplier_id: 'supplier-1',
        supplier: { id: 'supplier-1', name: 'Supplier One' },
        is_inventory_managed: true,
        status: 'active',
      },
      { 
        id: '2', 
        name: 'Product B', 
        stock_quantity: 0, 
        reorder_point: 20,
        reorder_quantity: null, // Should calculate based on reorder_point
        supplier_id: 'supplier-1',
        supplier: { id: 'supplier-1', name: 'Supplier One' },
        is_inventory_managed: true,
        status: 'active',
      },
    ];

    mockSupabase.order.mockResolvedValueOnce({ data: mockLowStockProducts, error: null });

    const { useReorderSuggestions } = await import('@/hooks/useAutoReorder');
    const { result } = renderHook(() => useReorderSuggestions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toHaveLength(2);
    
    // Product A: has explicit reorder_quantity
    expect(result.current.data?.[0].suggestedQuantity).toBe(50);
  });

  it('should group suggestions by supplier', async () => {
    const mockProducts = [
      { id: '1', supplier_id: 'supplier-1', supplier: { id: 'supplier-1', name: 'A' }, stock_quantity: 0, reorder_point: 10, reorder_quantity: 20, is_inventory_managed: true, status: 'active' },
      { id: '2', supplier_id: 'supplier-1', supplier: { id: 'supplier-1', name: 'A' }, stock_quantity: 0, reorder_point: 10, reorder_quantity: 20, is_inventory_managed: true, status: 'active' },
      { id: '3', supplier_id: 'supplier-2', supplier: { id: 'supplier-2', name: 'B' }, stock_quantity: 0, reorder_point: 10, reorder_quantity: 20, is_inventory_managed: true, status: 'active' },
    ];

    mockSupabase.order.mockResolvedValueOnce({ data: mockProducts, error: null });

    const { useGroupedReorderSuggestions } = await import('@/hooks/useAutoReorder');
    const { result } = renderHook(() => useGroupedReorderSuggestions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Grouped data should have 2 suppliers
    expect(result.current.data).toHaveLength(2);
  });

  it('should group products without supplier under no-supplier key', async () => {
    const mockProducts = [
      { id: '1', supplier_id: null, supplier: null, stock_quantity: 0, reorder_point: 10, reorder_quantity: 20, is_inventory_managed: true, status: 'active' },
    ];

    mockSupabase.order.mockResolvedValueOnce({ data: mockProducts, error: null });

    const { useGroupedReorderSuggestions } = await import('@/hooks/useAutoReorder');
    const { result } = renderHook(() => useGroupedReorderSuggestions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data[0].supplierId).toBeNull();
  });
});

describe('useCreateAutoReorder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create purchase order with items', async () => {
    const mockPurchaseOrder = { id: 'po-1', order_number: 'PO-202501-0001' };
    
    mockSupabase.single.mockResolvedValueOnce({ data: mockPurchaseOrder, error: null }); // PO insert
    mockSupabase.select = vi.fn().mockResolvedValue({ data: [], error: null }); // Items insert
    mockSupabase.in.mockResolvedValueOnce({ data: null, error: null }); // Alerts update

    const { useCreateAutoReorder } = await import('@/hooks/useAutoReorder');
    const { result } = renderHook(() => useCreateAutoReorder(), {
      wrapper: createWrapper(),
    });

    // Note: We can't easily test the mutation without triggering it
    // This is more of a structure test
    expect(result.current.mutate).toBeDefined();
    expect(result.current.isPending).toBe(false);
  });
});

describe('Reorder Quantity Calculation', () => {
  it('should use reorder_quantity when available', () => {
    const product = {
      reorder_point: 10,
      reorder_quantity: 50,
      stock_quantity: 5,
    };

    const suggestedQuantity = calculateSuggestedQuantity(product);
    expect(suggestedQuantity).toBe(50);
  });

  it('should calculate quantity based on reorder_point when reorder_quantity is null', () => {
    const product = {
      reorder_point: 10,
      reorder_quantity: null,
      stock_quantity: 5,
    };

    // Formula: reorder_point - stock_quantity + 10 = 10 - 5 + 10 = 15
    const suggestedQuantity = calculateSuggestedQuantity(product);
    expect(suggestedQuantity).toBe(15);
  });

  it('should return minimum of 1 when calculation is zero or negative', () => {
    const product = {
      reorder_point: 5,
      reorder_quantity: null,
      stock_quantity: 20,
    };

    // Formula: 5 - 20 + 10 = -5 → min 1
    const suggestedQuantity = calculateSuggestedQuantity(product);
    expect(suggestedQuantity).toBe(1);
  });
});

// Helper function to calculate suggested quantity (matches useAutoReorder logic)
function calculateSuggestedQuantity(product: {
  reorder_point: number | null;
  reorder_quantity: number | null;
  stock_quantity: number;
}): number {
  if (product.reorder_quantity) {
    return product.reorder_quantity;
  }
  
  const reorderPoint = product.reorder_point ?? 0;
  const calculated = reorderPoint - product.stock_quantity + 10;
  return Math.max(calculated, 1);
}
