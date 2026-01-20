import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../test-utils';
import Pipeline from '@/pages/Pipeline';

// Mock hooks
vi.mock('@/hooks/useCRM', () => ({
  useDeals: () => ({
    data: [],
    isLoading: false,
    error: null,
  }),
  useUpdateDeal: () => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

describe('Pipeline Page', () => {
  describe('rendering', () => {
    it('should render page title', async () => {
      render(<Pipeline />);
      await waitFor(() => {
        expect(screen.getByText('パイプライン')).toBeInTheDocument();
      });
    });

    it('should render page description', async () => {
      render(<Pipeline />);
      await waitFor(() => {
        expect(screen.getByText('商談のステージ管理')).toBeInTheDocument();
      });
    });

    it('should render statistics cards', async () => {
      render(<Pipeline />);
      await waitFor(() => {
        expect(screen.getByText('パイプライン合計')).toBeInTheDocument();
        expect(screen.getByText('加重パイプライン')).toBeInTheDocument();
        expect(screen.getByText('成約')).toBeInTheDocument();
        expect(screen.getByText('失注')).toBeInTheDocument();
      });
    });

    it('should render stage columns', async () => {
      render(<Pipeline />);
      await waitFor(() => {
        expect(screen.getByText('初期')).toBeInTheDocument();
        expect(screen.getByText('提案中')).toBeInTheDocument();
        expect(screen.getByText('交渉中')).toBeInTheDocument();
      });
    });
  });
});
