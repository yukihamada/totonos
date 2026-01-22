import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../test-utils';
import AccountingLedger from '@/pages/AccountingLedger';

// Mock hooks
vi.mock('@/hooks/useAccounting', () => ({
  useAccounts: () => ({
    data: [],
    isLoading: false,
    error: null,
  }),
  useLedgerEntries: () => ({
    data: [],
    isLoading: false,
    error: null,
  }),
  useGeneralLedger: () => ({
    data: null,
    isLoading: false,
    error: null,
  }),
}));

describe('AccountingLedger Page', () => {
  describe('rendering', () => {
    it('should render page title', async () => {
      render(<AccountingLedger />);
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: '総勘定元帳' })).toBeInTheDocument();
      });
    });

    it('should render page description', async () => {
      render(<AccountingLedger />);
      await waitFor(() => {
        expect(screen.getByText('勘定科目別の取引一覧')).toBeInTheDocument();
      });
    });

    it('should render search section', async () => {
      render(<AccountingLedger />);
      await waitFor(() => {
        expect(screen.getByText('検索条件')).toBeInTheDocument();
      });
    });

    it('should render account selector', async () => {
      render(<AccountingLedger />);
      await waitFor(() => {
        expect(screen.getByText('科目を選択')).toBeInTheDocument();
      });
    });
  });
});
