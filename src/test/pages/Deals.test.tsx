import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../test-utils';
import Deals from '@/pages/Deals';

// Mock hooks
vi.mock('@/hooks/useCRM', () => ({
  useDeals: () => ({
    data: [],
    isLoading: false,
    error: null,
  }),
  useCreateDeal: () => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useUpdateDeal: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

describe('Deals Page', () => {
  describe('rendering', () => {
    it('should render page title', async () => {
      render(<Deals />);
      await waitFor(() => {
        expect(screen.getByText('商談パイプライン')).toBeInTheDocument();
      });
    });

    it('should render page description', async () => {
      render(<Deals />);
      await waitFor(() => {
        expect(screen.getByText('商談をドラッグ&ドロップでステージ移動')).toBeInTheDocument();
      });
    });

    it('should render add deal button', async () => {
      render(<Deals />);
      await waitFor(() => {
        expect(screen.getByText('商談を追加')).toBeInTheDocument();
      });
    });

    it('should render all stage columns', async () => {
      render(<Deals />);
      await waitFor(() => {
        // Stage labels from types/crm.ts stageLabels
        expect(screen.getByText(/初期接触/)).toBeInTheDocument();
        expect(screen.getByText(/提案中/)).toBeInTheDocument();
        expect(screen.getByText(/交渉中/)).toBeInTheDocument();
        expect(screen.getByText(/契約手続き/)).toBeInTheDocument();
        expect(screen.getByText(/受注/)).toBeInTheDocument();
        expect(screen.getByText(/失注/)).toBeInTheDocument();
      });
    });
  });
});
