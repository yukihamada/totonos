import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../test-utils';
import InvoiceDetail from '@/pages/InvoiceDetail';

// Mock react-router-dom useParams
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: 'test-invoice-id' }),
  };
});

// Mock hooks
vi.mock('@/hooks/useInvoices', () => ({
  useInvoice: () => ({
    data: {
      id: 'test-invoice-id',
      invoice_number: 'INV-2025-001',
      title: 'テスト請求書',
      client: { name: 'テスト株式会社', email: 'test@example.com' },
      status: 'draft',
      issue_date: '2025-01-01',
      due_date: '2025-01-31',
      amount: 100000,
      tax_amount: 10000,
      total_amount: 110000,
      items: [
        { id: 'item-1', description: 'サービス料', quantity: 1, unit_price: 100000, amount: 100000 },
      ],
    },
    isLoading: false,
    error: null,
  }),
  useUpdateInvoiceStatus: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useDeleteInvoice: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

vi.mock('@/hooks/useDocumentPDF', () => ({
  useDocumentPDF: () => ({
    downloadInvoicePDF: vi.fn().mockResolvedValue(undefined),
  }),
}));

describe('InvoiceDetail Page', () => {
  describe('rendering', () => {
    it('should render invoice title', async () => {
      render(<InvoiceDetail />);
      await waitFor(() => {
        expect(screen.getByText('テスト請求書')).toBeInTheDocument();
      });
    });

    it('should render invoice number', async () => {
      render(<InvoiceDetail />);
      await waitFor(() => {
        expect(screen.getByText('INV-2025-001')).toBeInTheDocument();
      });
    });

    it('should render client info', async () => {
      render(<InvoiceDetail />);
      await waitFor(() => {
        expect(screen.getByText('テスト株式会社')).toBeInTheDocument();
      });
    });

    it('should render invoice info section', async () => {
      render(<InvoiceDetail />);
      await waitFor(() => {
        expect(screen.getByText('請求書情報')).toBeInTheDocument();
        expect(screen.getByText('発行日')).toBeInTheDocument();
        expect(screen.getByText('支払期日')).toBeInTheDocument();
      });
    });

    it('should render action buttons', async () => {
      render(<InvoiceDetail />);
      await waitFor(() => {
        expect(screen.getByText('編集')).toBeInTheDocument();
        expect(screen.getByText('PDF')).toBeInTheDocument();
        expect(screen.getByText('削除')).toBeInTheDocument();
      });
    });

    it('should render items table', async () => {
      render(<InvoiceDetail />);
      await waitFor(() => {
        expect(screen.getByText('明細')).toBeInTheDocument();
        expect(screen.getByText('品目')).toBeInTheDocument();
        expect(screen.getByText('数量')).toBeInTheDocument();
        expect(screen.getByText('単価')).toBeInTheDocument();
      });
    });
  });
});
