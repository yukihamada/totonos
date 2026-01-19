import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../test-utils';
import Invoices from '@/pages/Invoices';

// Mock hooks
vi.mock('@/hooks/useInvoices', () => ({
  useInvoices: () => ({
    data: [
      {
        id: '1',
        invoice_number: 'INV-001',
        title: 'テスト請求書',
        client: { name: 'サンプル商事' },
        total_amount: 110000,
        status: 'sent',
        issue_date: '2024-01-15',
        due_date: '2024-02-15',
      },
      {
        id: '2',
        invoice_number: 'INV-002',
        title: 'サービス利用料',
        client: { name: 'テスト株式会社' },
        total_amount: 55000,
        status: 'draft',
        issue_date: '2024-01-20',
        due_date: '2024-02-20',
      },
    ],
    isLoading: false,
    error: null,
  }),
  useCreateInvoice: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useDeleteInvoice: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

vi.mock('@/hooks/useClients', () => ({
  useClients: () => ({
    data: [
      { id: 'c1', name: 'サンプル商事' },
      { id: 'c2', name: 'テスト株式会社' },
    ],
    isLoading: false,
  }),
}));

describe('Invoices Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render page title', async () => {
      render(<Invoices />);
      await waitFor(() => {
        expect(screen.getByText('請求書一覧')).toBeInTheDocument();
      });
    });

    it('should render invoice list', async () => {
      render(<Invoices />);
      await waitFor(() => {
        expect(screen.getByText('INV-001')).toBeInTheDocument();
        expect(screen.getByText('INV-002')).toBeInTheDocument();
      });
    });

    it('should display client names', async () => {
      render(<Invoices />);
      await waitFor(() => {
        expect(screen.getByText('サンプル商事')).toBeInTheDocument();
        expect(screen.getByText('テスト株式会社')).toBeInTheDocument();
      });
    });

    it('should display invoice titles', async () => {
      render(<Invoices />);
      await waitFor(() => {
        expect(screen.getByText('テスト請求書')).toBeInTheDocument();
        expect(screen.getByText('サービス利用料')).toBeInTheDocument();
      });
    });
  });

  describe('status display', () => {
    it('should show sent status', async () => {
      render(<Invoices />);
      await waitFor(() => {
        expect(screen.getByText('送付済み')).toBeInTheDocument();
      });
    });

    it('should show draft status', async () => {
      render(<Invoices />);
      await waitFor(() => {
        expect(screen.getByText('下書き')).toBeInTheDocument();
      });
    });
  });

  describe('create button', () => {
    it('should render create invoice button', async () => {
      render(<Invoices />);
      await waitFor(() => {
        expect(screen.getByRole('link', { name: /新規作成/ })).toBeInTheDocument();
      });
    });
  });
});
