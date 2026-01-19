import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../test-utils';
import Expenses from '@/pages/Expenses';

// Mock hooks
vi.mock('@/hooks/useAccounting', () => ({
  useExpenses: () => ({
    data: [
      {
        id: '1',
        title: '交通費',
        amount: 15000,
        category: 'transportation',
        status: 'approved',
        expense_date: '2024-01-15',
        description: '出張交通費',
      },
      {
        id: '2',
        title: '会議費',
        amount: 8000,
        category: 'meeting',
        status: 'pending',
        expense_date: '2024-01-18',
        description: 'クライアント会議',
      },
    ],
    isLoading: false,
    error: null,
  }),
  useCreateExpense: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useDeleteExpense: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

describe('Expenses Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render page title', async () => {
      render(<Expenses />);
      await waitFor(() => {
        expect(screen.getByText('経費一覧')).toBeInTheDocument();
      });
    });

    it('should render expense list', async () => {
      render(<Expenses />);
      await waitFor(() => {
        expect(screen.getByText('交通費')).toBeInTheDocument();
        expect(screen.getByText('会議費')).toBeInTheDocument();
      });
    });

    it('should display expense amounts', async () => {
      render(<Expenses />);
      await waitFor(() => {
        expect(screen.getByText(/15,000/)).toBeInTheDocument();
        expect(screen.getByText(/8,000/)).toBeInTheDocument();
      });
    });
  });

  describe('status display', () => {
    it('should show approved status', async () => {
      render(<Expenses />);
      await waitFor(() => {
        expect(screen.getByText('承認済み')).toBeInTheDocument();
      });
    });

    it('should show pending status', async () => {
      render(<Expenses />);
      await waitFor(() => {
        expect(screen.getByText('申請中')).toBeInTheDocument();
      });
    });
  });

  describe('create button', () => {
    it('should render create expense button', async () => {
      render(<Expenses />);
      await waitFor(() => {
        const button = screen.getByRole('link', { name: /経費申請|新規/ });
        expect(button).toBeInTheDocument();
      });
    });
  });
});
