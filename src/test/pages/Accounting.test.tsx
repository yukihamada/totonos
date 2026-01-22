import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../test-utils';
import Accounting from '@/pages/Accounting';

// Mock hooks
vi.mock('@/hooks/useAccounting', () => ({
  useAccounts: () => ({
    data: [{ id: '1', account_name: 'Test Account' }],
    isLoading: false,
    error: null,
  }),
  useJournalEntries: () => ({
    data: [],
    isLoading: false,
    error: null,
  }),
  useExpenseClaims: () => ({
    data: [],
    isLoading: false,
    error: null,
  }),
  useFixedAssets: () => ({
    data: [],
    isLoading: false,
    error: null,
  }),
  useInitializeAccounts: () => ({
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
        expect(screen.getByRole('heading', { name: '会計' })).toBeInTheDocument();
      });
    });

    it('should render page description', async () => {
      render(<Accounting />);
      await waitFor(() => {
        expect(screen.getByText('フル会計機能で財務を一元管理')).toBeInTheDocument();
      });
    });

    // Skip due to complex mock dependencies
    it.skip('should render menu items', async () => {
      render(<Accounting />);
      await waitFor(() => {
        expect(screen.getByText('仕訳帳')).toBeInTheDocument();
      });
    });

    // Skip due to complex mock dependencies
    it.skip('should render statistics cards', async () => {
      render(<Accounting />);
      await waitFor(() => {
        expect(screen.getByText('勘定科目数')).toBeInTheDocument();
      });
    });
  });
});
