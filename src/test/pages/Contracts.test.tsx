import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../test-utils';
import Contracts from '@/pages/Contracts';

// Mock hooks
vi.mock('@/hooks/useContracts', () => ({
  useContracts: () => ({
    data: [
      {
        id: '1',
        contract_number: 'CON-001',
        title: 'サービス利用契約',
        client: { name: 'サンプル商事', email: 'sample@example.com' },
        amount: 500000,
        total_amount: 550000,
        status: 'active',
        valid_until: '2024-12-31',
        signatures: [],
      },
      {
        id: '2',
        contract_number: 'CON-002',
        title: '業務委託契約',
        client: { name: 'テスト株式会社', email: 'test@example.com' },
        amount: 300000,
        total_amount: 330000,
        status: 'draft',
        valid_until: '2024-06-30',
        signatures: [],
      },
    ],
    isLoading: false,
    error: null,
  }),
  useCreateContract: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useDeleteContract: () => ({
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

describe('Contracts Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render page title', async () => {
      render(<Contracts />);
      await waitFor(() => {
        expect(screen.getByText('契約書管理')).toBeInTheDocument();
      });
    });

    it('should render contract list', async () => {
      render(<Contracts />);
      await waitFor(() => {
        expect(screen.getByText('CON-001')).toBeInTheDocument();
        expect(screen.getByText('CON-002')).toBeInTheDocument();
      });
    });

    it('should display client names', async () => {
      render(<Contracts />);
      await waitFor(() => {
        expect(screen.getByText('サンプル商事')).toBeInTheDocument();
        expect(screen.getByText('テスト株式会社')).toBeInTheDocument();
      });
    });

    it('should display contract titles', async () => {
      render(<Contracts />);
      await waitFor(() => {
        expect(screen.getByText('サービス利用契約')).toBeInTheDocument();
        expect(screen.getByText('業務委託契約')).toBeInTheDocument();
      });
    });
  });

  describe('status display', () => {
    it('should show active status', async () => {
      render(<Contracts />);
      await waitFor(() => {
        expect(screen.getByText('有効')).toBeInTheDocument();
      });
    });

    it('should show draft status', async () => {
      render(<Contracts />);
      await waitFor(() => {
        expect(screen.getByText('下書き')).toBeInTheDocument();
      });
    });
  });

  describe('contract amounts', () => {
    it('should display total amounts', async () => {
      render(<Contracts />);
      await waitFor(() => {
        expect(screen.getByText(/550,000/)).toBeInTheDocument();
        expect(screen.getByText(/330,000/)).toBeInTheDocument();
      });
    });
  });

  describe('create button', () => {
    it('should render create contract button', async () => {
      render(<Contracts />);
      await waitFor(() => {
        const button = screen.getByRole('link', { name: /新規作成|契約書作成/ });
        expect(button).toBeInTheDocument();
      });
    });
  });
});
