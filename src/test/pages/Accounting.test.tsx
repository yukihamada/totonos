import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../test-utils';
import Accounting from '@/pages/Accounting';

// Mock hooks
vi.mock('@/hooks/useAccounting', () => ({
  useAccounts: () => ({
    data: [],
    isLoading: false,
    error: null,
  }),
  useTransactions: () => ({
    data: [],
    isLoading: false,
    error: null,
  }),
  useCreateAccount: () => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

describe('Accounting Page', () => {
  describe('rendering', () => {
    it('should render page title', async () => {
      render(<Accounting />);
      await waitFor(() => {
        expect(screen.getByText('会計管理')).toBeInTheDocument();
      });
    });

    it('should render page description', async () => {
      render(<Accounting />);
      await waitFor(() => {
        expect(screen.getByText('勘定科目と取引の管理')).toBeInTheDocument();
      });
    });

    it('should render tab navigation', async () => {
      render(<Accounting />);
      await waitFor(() => {
        expect(screen.getByText('勘定科目')).toBeInTheDocument();
        expect(screen.getByText('取引一覧')).toBeInTheDocument();
      });
    });

    it('should render statistics cards', async () => {
      render(<Accounting />);
      await waitFor(() => {
        expect(screen.getByText('総資産')).toBeInTheDocument();
        expect(screen.getByText('負債')).toBeInTheDocument();
        expect(screen.getByText('純資産')).toBeInTheDocument();
        expect(screen.getByText('今月の収益')).toBeInTheDocument();
      });
    });
  });
});
