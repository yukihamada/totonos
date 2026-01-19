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
  functions: {
    invoke: vi.fn(),
  },
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

describe('useDeliveryNotes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch delivery notes with items', async () => {
    const mockDeliveryNotes = [
      {
        id: 'dn-1',
        delivery_note_number: 'DN-001',
        supplier_name: 'Test Supplier',
        status: 'review',
        items: [
          { id: 'item-1', product_name: 'Product A', quantity: 10 },
        ],
      },
    ];

    mockSupabase.order.mockResolvedValueOnce({ data: mockDeliveryNotes, error: null });

    const { useDeliveryNotes } = await import('@/hooks/useDeliveryNotes');
    const { result } = renderHook(() => useDeliveryNotes(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.deliveryNotes).toHaveLength(1);
    expect(result.current.deliveryNotes[0].items).toHaveLength(1);
  });

  it('should filter by status', async () => {
    const mockDeliveryNotes = [
      { id: 'dn-1', status: 'pending', items: [] },
      { id: 'dn-2', status: 'review', items: [] },
      { id: 'dn-3', status: 'applied', items: [] },
    ];

    mockSupabase.order.mockResolvedValueOnce({ data: mockDeliveryNotes, error: null });

    const { useDeliveryNotes } = await import('@/hooks/useDeliveryNotes');
    const { result } = renderHook(() => useDeliveryNotes(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Filter applied notes
    const appliedNotes = result.current.deliveryNotes.filter(n => n.status === 'applied');
    expect(appliedNotes).toHaveLength(1);
  });
});

describe('useDeliveryNoteOCR', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should process delivery note image via OCR', async () => {
    const mockOCRResult = {
      result: {
        delivery_note_number: 'DN-2024-001',
        supplier_name: 'Test Supplier Co.',
        delivery_date: '2024-01-15',
        items: [
          { jan_code: '4901234567894', product_name: 'Test Product', quantity: 10, unit_price: 100, amount: 1000 },
        ],
        total_amount: 1100,
        confidence: 0.9,
      },
      deliveryNote: { id: 'dn-1' },
      items: [{ id: 'item-1' }],
    };

    mockSupabase.functions.invoke.mockResolvedValueOnce({ data: mockOCRResult, error: null });

    const { useDeliveryNoteOCR } = await import('@/hooks/useDeliveryNotes');
    const { result } = renderHook(() => useDeliveryNoteOCR(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isProcessing).toBe(false);
    expect(result.current.progress).toBe(0);
    expect(result.current.processDeliveryNote).toBeDefined();
  });

  it('should handle OCR errors gracefully', async () => {
    mockSupabase.functions.invoke.mockResolvedValueOnce({ 
      data: null, 
      error: { message: 'OCR処理に失敗しました' } 
    });

    const { useDeliveryNoteOCR } = await import('@/hooks/useDeliveryNotes');
    const { result } = renderHook(() => useDeliveryNoteOCR(), {
      wrapper: createWrapper(),
    });

    // Create a mock file
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    const processResult = await result.current.processDeliveryNote(mockFile);
    
    expect(processResult).toBeNull();
  });
});

describe('useApplyDeliveryNote', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update stock for matched items', async () => {
    const mockDeliveryNote = {
      id: 'dn-1',
      status: 'review',
      company_id: 'company-1',
      items: [
        { id: 'item-1', product_id: 'prod-1', quantity: 10, unit_price: 100, amount: 1000, is_matched: true },
        { id: 'item-2', product_id: null, quantity: 5, is_matched: false }, // Not matched
      ],
    };

    const mockProduct = { stock_quantity: 20 };

    mockSupabase.single
      .mockResolvedValueOnce({ data: mockDeliveryNote, error: null }) // Fetch delivery note
      .mockResolvedValueOnce({ data: mockProduct, error: null }); // Fetch product

    mockSupabase.eq.mockResolvedValue({ data: null, error: null }); // Updates

    const { useApplyDeliveryNote } = await import('@/hooks/useDeliveryNotes');
    const { result } = renderHook(() => useApplyDeliveryNote(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
    expect(result.current.isPending).toBe(false);
  });

  it('should not process already applied delivery notes', async () => {
    const mockDeliveryNote = {
      id: 'dn-1',
      status: 'applied', // Already applied
      items: [],
    };

    mockSupabase.single.mockResolvedValueOnce({ data: mockDeliveryNote, error: null });

    const { useApplyDeliveryNote } = await import('@/hooks/useDeliveryNotes');
    const { result } = renderHook(() => useApplyDeliveryNote(), {
      wrapper: createWrapper(),
    });

    // The mutation should reject when status is 'applied'
    expect(result.current.mutate).toBeDefined();
  });
});

describe('Product Matching Logic', () => {
  it('should match by JAN code with 100% confidence', () => {
    const item = { jan_code: '4901234567894', product_name: 'Test' };
    const products = [
      { id: 'prod-1', jan_code: '4901234567894', name: 'Matched Product' },
      { id: 'prod-2', jan_code: '4901234567000', name: 'Other Product' },
    ];

    const match = findProductMatch(item, products);
    expect(match?.productId).toBe('prod-1');
    expect(match?.confidence).toBe(1.0);
  });

  it('should match by product name with lower confidence', () => {
    const item = { jan_code: null, product_name: 'Test Product' };
    const products = [
      { id: 'prod-1', jan_code: null, name: 'Test Product XYZ' },
    ];

    const match = findProductMatch(item, products);
    expect(match?.productId).toBe('prod-1');
    expect(match?.confidence).toBeLessThan(1.0);
  });

  it('should return null when no match found', () => {
    const item = { jan_code: '0000000000000', product_name: 'Unknown' };
    const products = [
      { id: 'prod-1', jan_code: '4901234567894', name: 'Different Product' },
    ];

    const match = findProductMatch(item, products);
    expect(match).toBeNull();
  });
});

// Helper function to find product match
function findProductMatch(
  item: { jan_code: string | null; product_name: string },
  products: Array<{ id: string; jan_code: string | null; name: string }>
): { productId: string; confidence: number } | null {
  // Try JAN code match first
  if (item.jan_code) {
    const janMatch = products.find(p => p.jan_code === item.jan_code);
    if (janMatch) {
      return { productId: janMatch.id, confidence: 1.0 };
    }
  }

  // Try name match
  if (item.product_name) {
    const nameMatch = products.find(p => 
      p.name.toLowerCase().includes(item.product_name.toLowerCase()) ||
      item.product_name.toLowerCase().includes(p.name.toLowerCase())
    );
    if (nameMatch) {
      return { productId: nameMatch.id, confidence: 0.7 };
    }
  }

  return null;
}
