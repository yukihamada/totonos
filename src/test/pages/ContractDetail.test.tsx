import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../test-utils';
import ContractDetail from '@/pages/ContractDetail';

// Mock react-router-dom useParams
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: 'test-contract-id' }),
  };
});

// Mock hooks
vi.mock('@/hooks/useContracts', () => ({
  useContract: () => ({
    data: {
      id: 'test-contract-id',
      contract_number: 'CON-2025-001',
      title: 'テスト契約',
      client: { name: 'テスト株式会社', email: 'test@example.com' },
      status: 'draft',
      start_date: '2025-01-01',
      end_date: '2025-12-31',
      amount: 100000,
      description: 'テスト契約内容',
      created_at: '2025-01-01',
    },
    isLoading: false,
    error: null,
  }),
  useUpdateContractStatus: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useDeleteContract: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

describe('ContractDetail Page', () => {
  describe('rendering', () => {
    it('should render contract title', async () => {
      render(<ContractDetail />);
      await waitFor(() => {
        expect(screen.getByText('テスト契約')).toBeInTheDocument();
      });
    });

    it('should render contract number', async () => {
      render(<ContractDetail />);
      await waitFor(() => {
        expect(screen.getByText('CON-2025-001')).toBeInTheDocument();
      });
    });

    it('should render client info', async () => {
      render(<ContractDetail />);
      await waitFor(() => {
        expect(screen.getByText('テスト株式会社')).toBeInTheDocument();
      });
    });

    it('should render contract info section', async () => {
      render(<ContractDetail />);
      await waitFor(() => {
        expect(screen.getByText('契約情報')).toBeInTheDocument();
        expect(screen.getByText('契約期間')).toBeInTheDocument();
      });
    });

    it('should render edit button', async () => {
      render(<ContractDetail />);
      await waitFor(() => {
        expect(screen.getByText('編集')).toBeInTheDocument();
      });
    });

    it('should render delete button', async () => {
      render(<ContractDetail />);
      await waitFor(() => {
        expect(screen.getByText('削除')).toBeInTheDocument();
      });
    });
  });
});
