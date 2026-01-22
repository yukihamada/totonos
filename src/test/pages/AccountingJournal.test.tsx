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
  useDeleteJournalEntry: () => ({
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
        expect(screen.getByRole('heading', { name: '仕訳帳' })).toBeInTheDocument();
      });
    });

    it('should render page description', async () => {
      render(<AccountingJournal />);
      await waitFor(() => {
        expect(screen.getByText('日々の取引を記録・管理')).toBeInTheDocument();
      });
    });

    it('should render add entry button', async () => {
      render(<AccountingJournal />);
      await waitFor(() => {
        expect(screen.getByText('新規仕訳')).toBeInTheDocument();
      });
    });

    it('should render empty state', async () => {
      render(<AccountingJournal />);
      await waitFor(() => {
        expect(screen.getByText('仕訳がありません')).toBeInTheDocument();
      });
    });
  });
});
