import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../test-utils';
import EstimateDetail from '@/pages/EstimateDetail';

// Mock react-router-dom useParams
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: 'test-estimate-id' }),
  };
});

// Mock hooks
vi.mock('@/hooks/useEstimates', () => ({
  useEstimate: () => ({
    data: {
      id: 'test-estimate-id',
      estimate_number: 'EST-2025-001',
      title: 'テスト見積書',
      client: { name: 'テスト株式会社', email: 'test@example.com' },
      status: 'draft',
      issue_date: '2025-01-01',
      valid_until: '2025-01-31',
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
  useUpdateEstimateStatus: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useDeleteEstimate: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useConvertEstimateToInvoice: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

vi.mock('@/hooks/useDocumentPDF', () => ({
  useDocumentPDF: () => ({
    downloadEstimatePDF: vi.fn(),
  }),
}));

describe('EstimateDetail Page', () => {
  describe('rendering', () => {
    it('should render estimate title', async () => {
      render(<EstimateDetail />);
      await waitFor(() => {
        expect(screen.getByText('テスト見積書')).toBeInTheDocument();
      });
    });

    it('should render estimate number', async () => {
      render(<EstimateDetail />);
      await waitFor(() => {
        expect(screen.getByText('EST-2025-001')).toBeInTheDocument();
      });
    });

    it('should render client info', async () => {
      render(<EstimateDetail />);
      await waitFor(() => {
        expect(screen.getByText('テスト株式会社')).toBeInTheDocument();
      });
    });

    it('should render estimate info section', async () => {
      render(<EstimateDetail />);
      await waitFor(() => {
        expect(screen.getByText('見積書情報')).toBeInTheDocument();
        expect(screen.getByText('発行日')).toBeInTheDocument();
        expect(screen.getByText('有効期限')).toBeInTheDocument();
      });
    });

    it('should render action buttons', async () => {
      render(<EstimateDetail />);
      await waitFor(() => {
        expect(screen.getByText('編集')).toBeInTheDocument();
        expect(screen.getByText('プレビュー')).toBeInTheDocument();
        expect(screen.getByText('PDF')).toBeInTheDocument();
        expect(screen.getByText('削除')).toBeInTheDocument();
      });
    });

    it('should render items table', async () => {
      render(<EstimateDetail />);
      await waitFor(() => {
        expect(screen.getByText('明細')).toBeInTheDocument();
        expect(screen.getByText('品目')).toBeInTheDocument();
        expect(screen.getByText('数量')).toBeInTheDocument();
        expect(screen.getByText('単価')).toBeInTheDocument();
      });
    });

    it('should render status change section', async () => {
      render(<EstimateDetail />);
      await waitFor(() => {
        expect(screen.getByText('ステータス変更')).toBeInTheDocument();
      });
    });
  });
});
