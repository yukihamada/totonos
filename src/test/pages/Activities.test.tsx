import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../test-utils';
import Activities from '@/pages/Activities';

// Mock hooks
vi.mock('@/hooks/useActivities', () => ({
  useActivities: () => ({
    data: [],
    isLoading: false,
    error: null,
  }),
  useCreateActivity: () => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useDeleteActivity: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  activityTypeLabels: {
    call: '電話',
    meeting: '会議',
    email: 'メール',
    visit: '訪問',
    demo: 'デモ',
    other: 'その他',
  },
}));

vi.mock('@/hooks/useClients', () => ({
  useClients: () => ({
    data: [],
    isLoading: false,
  }),
}));

vi.mock('@/hooks/useCRM', () => ({
  useLeads: () => ({
    data: [],
    isLoading: false,
  }),
  useDeals: () => ({
    data: [],
    isLoading: false,
  }),
}));

describe('Activities Page', () => {
  describe('rendering', () => {
    it('should render page title', async () => {
      render(<Activities />);
      await waitFor(() => {
        expect(screen.getByText('活動履歴')).toBeInTheDocument();
      });
    });

    it('should render page description', async () => {
      render(<Activities />);
      await waitFor(() => {
        expect(screen.getByText('営業活動の記録と管理')).toBeInTheDocument();
      });
    });

    it('should render add activity button', async () => {
      render(<Activities />);
      await waitFor(() => {
        expect(screen.getByText('活動を記録')).toBeInTheDocument();
      });
    });

    it('should render statistics cards', async () => {
      render(<Activities />);
      await waitFor(() => {
        expect(screen.getByText('今日の活動')).toBeInTheDocument();
        expect(screen.getByText('今週の活動')).toBeInTheDocument();
        expect(screen.getByText('予定アクション')).toBeInTheDocument();
        expect(screen.getByText('総活動数')).toBeInTheDocument();
      });
    });

    it('should render activity list section', async () => {
      render(<Activities />);
      await waitFor(() => {
        expect(screen.getByText('活動一覧')).toBeInTheDocument();
      });
    });
  });
});
