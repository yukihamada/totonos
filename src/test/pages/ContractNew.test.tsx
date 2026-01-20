import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../test-utils';
import ContractNew from '@/pages/ContractNew';

// Mock hooks
vi.mock('@/hooks/useContracts', () => ({
  useCreateContract: () => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

vi.mock('@/hooks/useClients', () => ({
  useClients: () => ({
    data: [
      { id: 'client-1', name: 'テスト株式会社' },
    ],
    isLoading: false,
  }),
}));

describe('ContractNew Page', () => {
  describe('rendering', () => {
    it('should render page title', async () => {
      render(<ContractNew />);
      await waitFor(() => {
        expect(screen.getByText('新規契約作成')).toBeInTheDocument();
      });
    });

    it('should render page description', async () => {
      render(<ContractNew />);
      await waitFor(() => {
        expect(screen.getByText('新しい契約を作成します')).toBeInTheDocument();
      });
    });

    it('should render form fields', async () => {
      render(<ContractNew />);
      await waitFor(() => {
        expect(screen.getByText('契約タイトル')).toBeInTheDocument();
        expect(screen.getByText('取引先')).toBeInTheDocument();
        expect(screen.getByText('契約開始日')).toBeInTheDocument();
        expect(screen.getByText('契約終了日')).toBeInTheDocument();
        expect(screen.getByText('契約金額')).toBeInTheDocument();
      });
    });

    it('should render submit button', async () => {
      render(<ContractNew />);
      await waitFor(() => {
        expect(screen.getByText('契約を作成')).toBeInTheDocument();
      });
    });

    it('should render back button', async () => {
      render(<ContractNew />);
      await waitFor(() => {
        expect(screen.getByText('戻る')).toBeInTheDocument();
      });
    });
  });
});
