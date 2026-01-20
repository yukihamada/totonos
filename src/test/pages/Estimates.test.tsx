import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../test-utils';
import Estimates from '@/pages/Estimates';

// Mock hooks
vi.mock('@/hooks/useEstimates', () => ({
  useEstimates: () => ({
    data: [],
    isLoading: false,
    error: null,
  }),
  useCreateEstimate: () => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useUpdateEstimateStatus: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useDeleteEstimate: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

vi.mock('@/hooks/useClients', () => ({
  useClients: () => ({
    data: [],
    isLoading: false,
  }),
}));

describe('Estimates Page', () => {
  describe('rendering', () => {
    it('should render page title', async () => {
      render(<Estimates />);
      await waitFor(() => {
        expect(screen.getByText('見積書')).toBeInTheDocument();
      });
    });

    it('should render page description', async () => {
      render(<Estimates />);
      await waitFor(() => {
        expect(screen.getByText('見積書の作成と管理')).toBeInTheDocument();
      });
    });

    it('should render add estimate button', async () => {
      render(<Estimates />);
      await waitFor(() => {
        expect(screen.getByText('新規作成')).toBeInTheDocument();
      });
    });

    it('should render statistics cards', async () => {
      render(<Estimates />);
      await waitFor(() => {
        expect(screen.getByText('下書き')).toBeInTheDocument();
        expect(screen.getByText('送付済')).toBeInTheDocument();
        expect(screen.getByText('承認済')).toBeInTheDocument();
        expect(screen.getByText('見積書数')).toBeInTheDocument();
      });
    });

    it('should render estimates list section', async () => {
      render(<Estimates />);
      await waitFor(() => {
        expect(screen.getByText('見積書一覧')).toBeInTheDocument();
      });
    });
  });
});
