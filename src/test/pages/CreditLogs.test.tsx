import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import CreditLogs from '@/pages/CreditLogs';

// Mock organization context
const mockCurrentOrganization = { id: 'test-company-id', name: 'Test Company' };

vi.mock('@/contexts/OrganizationContext', () => ({
  useOrganization: () => ({
    currentOrganization: mockCurrentOrganization,
  }),
}));

// Mock Supabase client
const mockFromReturn = {
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockResolvedValue({ data: [], error: null }),
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => mockFromReturn),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('CreditLogs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFromReturn.limit.mockResolvedValue({ data: [], error: null });
  });

  it('should render credit logs page with title', async () => {
    render(<CreditLogs />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('クレジット利用履歴')).toBeInTheDocument();
    });
  });

  it('should show empty state when no logs exist', async () => {
    mockFromReturn.limit.mockResolvedValue({ data: [], error: null });

    render(<CreditLogs />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/履歴がありません/)).toBeInTheDocument();
    });
  });

  it('should display logs from database', async () => {
    const mockLogs = [
      {
        id: '1',
        transaction_type: 'consume',
        amount: -3,
        balance_after: 97,
        action: 'ocr_delivery_note',
        description: '納品書OCR処理',
        created_at: new Date().toISOString(),
        metadata: null,
      },
      {
        id: '2',
        transaction_type: 'grant',
        amount: 100,
        balance_after: 100,
        action: null,
        description: '月次クレジット付与',
        created_at: new Date().toISOString(),
        metadata: null,
      },
    ];

    mockFromReturn.limit.mockResolvedValue({ data: mockLogs, error: null });

    render(<CreditLogs />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('納品書OCR処理')).toBeInTheDocument();
    });
  });

  it('should display filter options', async () => {
    render(<CreditLogs />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('すべて')).toBeInTheDocument();
    });
  });

  it('should display statistics section', async () => {
    const mockLogs = [
      {
        id: '1',
        transaction_type: 'consume',
        amount: -5,
        balance_after: 95,
        action: 'ai_chat',
        description: 'AIチャット',
        created_at: new Date().toISOString(),
        metadata: null,
      },
      {
        id: '2',
        transaction_type: 'grant',
        amount: 100,
        balance_after: 100,
        action: null,
        description: '月次付与',
        created_at: new Date().toISOString(),
        metadata: null,
      },
    ];

    mockFromReturn.limit.mockResolvedValue({ data: mockLogs, error: null });

    render(<CreditLogs />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('合計消費')).toBeInTheDocument();
      expect(screen.getByText('合計付与')).toBeInTheDocument();
    });
  });

  it('should have export buttons', async () => {
    render(<CreditLogs />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('CSV')).toBeInTheDocument();
      expect(screen.getByText('JSON')).toBeInTheDocument();
    });
  });

  it('should handle database error gracefully', async () => {
    mockFromReturn.limit.mockResolvedValue({ 
      data: null, 
      error: { message: 'Database error' } 
    });

    render(<CreditLogs />, { wrapper: createWrapper() });

    await waitFor(() => {
      // Should still render the page structure
      expect(screen.getByText('クレジット利用履歴')).toBeInTheDocument();
    });
  });

  it('should display correct transaction type badges', async () => {
    const mockLogs = [
      {
        id: '1',
        transaction_type: 'consume',
        amount: -3,
        balance_after: 97,
        action: 'ocr',
        description: 'OCR処理',
        created_at: new Date().toISOString(),
        metadata: null,
      },
      {
        id: '2',
        transaction_type: 'charge',
        amount: 500,
        balance_after: 597,
        action: null,
        description: 'クレジットチャージ',
        created_at: new Date().toISOString(),
        metadata: null,
      },
    ];

    mockFromReturn.limit.mockResolvedValue({ data: mockLogs, error: null });

    render(<CreditLogs />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('消費')).toBeInTheDocument();
      expect(screen.getByText('チャージ')).toBeInTheDocument();
    });
  });
});

describe('CreditLogs filtering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should filter by transaction type when clicking filter button', async () => {
    const user = userEvent.setup();
    const mockLogs = [
      {
        id: '1',
        transaction_type: 'consume',
        amount: -3,
        balance_after: 97,
        action: 'ocr',
        description: 'OCR処理',
        created_at: new Date().toISOString(),
        metadata: null,
      },
      {
        id: '2',
        transaction_type: 'grant',
        amount: 100,
        balance_after: 100,
        action: null,
        description: '月次付与',
        created_at: new Date().toISOString(),
        metadata: null,
      },
    ];

    mockFromReturn.limit.mockResolvedValue({ data: mockLogs, error: null });

    render(<CreditLogs />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('消費')).toBeInTheDocument();
    });

    // Click on consume filter
    const consumeFilterButton = screen.getAllByText('消費')[0];
    await user.click(consumeFilterButton);

    // After filtering, only consume logs should be visible
    await waitFor(() => {
      expect(screen.getByText('OCR処理')).toBeInTheDocument();
    });
  });
});

describe('CreditLogs export', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock URL.createObjectURL and URL.revokeObjectURL
    global.URL.createObjectURL = vi.fn(() => 'mock-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  it('should export to CSV when clicking CSV button', async () => {
    const user = userEvent.setup();
    const mockLogs = [
      {
        id: '1',
        transaction_type: 'consume',
        amount: -3,
        balance_after: 97,
        action: 'ocr',
        description: 'OCR処理',
        created_at: new Date().toISOString(),
        metadata: null,
      },
    ];

    mockFromReturn.limit.mockResolvedValue({ data: mockLogs, error: null });

    render(<CreditLogs />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('CSV')).toBeInTheDocument();
    });

    const csvButton = screen.getByText('CSV');
    await user.click(csvButton);

    // Verify URL.createObjectURL was called
    expect(global.URL.createObjectURL).toHaveBeenCalled();
  });

  it('should export to JSON when clicking JSON button', async () => {
    const user = userEvent.setup();
    const mockLogs = [
      {
        id: '1',
        transaction_type: 'consume',
        amount: -3,
        balance_after: 97,
        action: 'ocr',
        description: 'OCR処理',
        created_at: new Date().toISOString(),
        metadata: null,
      },
    ];

    mockFromReturn.limit.mockResolvedValue({ data: mockLogs, error: null });

    render(<CreditLogs />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('JSON')).toBeInTheDocument();
    });

    const jsonButton = screen.getByText('JSON');
    await user.click(jsonButton);

    // Verify URL.createObjectURL was called
    expect(global.URL.createObjectURL).toHaveBeenCalled();
  });
});
