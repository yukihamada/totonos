import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../test-utils';
import PurchaseOrders from '@/pages/PurchaseOrders';

// Mock hooks
vi.mock('@/hooks/usePurchaseOrders', () => ({
  usePurchaseOrders: () => ({
    data: [],
    isLoading: false,
    error: null,
  }),
  useCreatePurchaseOrder: () => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useUpdatePurchaseOrderStatus: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useDeletePurchaseOrder: () => ({
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

describe('PurchaseOrders Page', () => {
  describe('rendering', () => {
    it('should render page title', async () => {
      render(<PurchaseOrders />);
      await waitFor(() => {
        expect(screen.getByText('発注書')).toBeInTheDocument();
      });
    });

    it('should render page description', async () => {
      render(<PurchaseOrders />);
      await waitFor(() => {
        expect(screen.getByText('発注書の作成と管理')).toBeInTheDocument();
      });
    });

    it('should render add order button', async () => {
      render(<PurchaseOrders />);
      await waitFor(() => {
        expect(screen.getByText('新規作成')).toBeInTheDocument();
      });
    });

    it('should render statistics cards', async () => {
      render(<PurchaseOrders />);
      await waitFor(() => {
        expect(screen.getByText('送付済')).toBeInTheDocument();
        expect(screen.getByText('確認済')).toBeInTheDocument();
        expect(screen.getByText('納品済')).toBeInTheDocument();
        expect(screen.getByText('発注書数')).toBeInTheDocument();
      });
    });

    it('should render purchase orders list section', async () => {
      render(<PurchaseOrders />);
      await waitFor(() => {
        expect(screen.getByText('発注書一覧')).toBeInTheDocument();
      });
    });
  });
});
