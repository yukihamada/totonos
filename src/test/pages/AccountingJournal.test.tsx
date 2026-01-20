import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../test-utils';
import AccountingJournal from '@/pages/AccountingJournal';

// Mock hooks
vi.mock('@/hooks/useAccounting', () => ({
  useJournalEntries: () => ({
    data: [],
    isLoading: false,
    error: null,
  }),
  useAccounts: () => ({
    data: [],
    isLoading: false,
  }),
  useCreateJournalEntry: () => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

describe('AccountingJournal Page', () => {
  describe('rendering', () => {
    it('should render page title', async () => {
      render(<AccountingJournal />);
      await waitFor(() => {
        expect(screen.getByText('仕訳帳')).toBeInTheDocument();
      });
    });

    it('should render page description', async () => {
      render(<AccountingJournal />);
      await waitFor(() => {
        expect(screen.getByText('日々の取引を仕訳形式で記録')).toBeInTheDocument();
      });
    });

    it('should render add entry button', async () => {
      render(<AccountingJournal />);
      await waitFor(() => {
        expect(screen.getByText('仕訳を追加')).toBeInTheDocument();
      });
    });

    it('should render statistics cards', async () => {
      render(<AccountingJournal />);
      await waitFor(() => {
        expect(screen.getByText('仕訳件数')).toBeInTheDocument();
        expect(screen.getByText('借方合計')).toBeInTheDocument();
        expect(screen.getByText('貸方合計')).toBeInTheDocument();
      });
    });

    it('should render journal table', async () => {
      render(<AccountingJournal />);
      await waitFor(() => {
        expect(screen.getByText('仕訳一覧')).toBeInTheDocument();
      });
    });
  });
});
