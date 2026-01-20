import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../test-utils';
import EmrHpkiBridge from '@/pages/emr/EmrHpkiBridge';

// Mock the useHpkiBridge hook
vi.mock('@/hooks/emr/useHpkiBridge', () => ({
  useHpkiBridge: () => ({
    status: {
      connected: false,
      cardInserted: false,
      readerName: undefined,
      error: undefined,
      lastChecked: undefined,
    },
    readers: [],
    loading: false,
    error: null,
    refreshStatus: vi.fn(),
    sign: vi.fn(),
  }),
}));

describe('EmrHpkiBridge Page', () => {
  describe('rendering', () => {
    it('should render page title', async () => {
      render(<EmrHpkiBridge />);
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /HPKI署名テスト/i })).toBeInTheDocument();
      });
    });

    it('should render page description', async () => {
      render(<EmrHpkiBridge />);
      await waitFor(() => {
        expect(screen.getByText('電子署名の接続確認とテスト')).toBeInTheDocument();
      });
    });

    it('should render setup instructions', async () => {
      render(<EmrHpkiBridge />);
      await waitFor(() => {
        expect(screen.getByText('ブリッジアプリのセットアップ')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should render HPKI download section', async () => {
      render(<EmrHpkiBridge />);
      await waitFor(() => {
        expect(screen.getByText('HPKIブリッジアプリ')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should render server status section', async () => {
      render(<EmrHpkiBridge />);
      await waitFor(() => {
        expect(screen.getByText('接続ステータス')).toBeInTheDocument();
        expect(screen.getByText('ブリッジサーバー')).toBeInTheDocument();
      });
    });

    it('should render card reader status', async () => {
      render(<EmrHpkiBridge />);
      await waitFor(() => {
        expect(screen.getByText('ICカードリーダー')).toBeInTheDocument();
      });
    });

    it('should render signature test section', async () => {
      render(<EmrHpkiBridge />);
      await waitFor(() => {
        expect(screen.getByText('署名テスト')).toBeInTheDocument();
      });
    });

    it('should render text input for signing', async () => {
      render(<EmrHpkiBridge />);
      await waitFor(() => {
        expect(screen.getByText('署名対象テキスト')).toBeInTheDocument();
      });
    });

    it('should render PIN input', async () => {
      render(<EmrHpkiBridge />);
      await waitFor(() => {
        expect(screen.getByText('ICカードPIN')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('PINを入力')).toBeInTheDocument();
      });
    });

    it('should render sign button', async () => {
      render(<EmrHpkiBridge />);
      await waitFor(() => {
        expect(screen.getByText('署名実行')).toBeInTheDocument();
      });
    });

    it('should render refresh status button', async () => {
      render(<EmrHpkiBridge />);
      await waitFor(() => {
        expect(screen.getByText('ステータス更新')).toBeInTheDocument();
      });
    });

    it('should show disconnected status initially', async () => {
      render(<EmrHpkiBridge />);
      await waitFor(() => {
        expect(screen.getByText('未接続')).toBeInTheDocument();
      });
    });

    it('should show warning when server not connected', async () => {
      render(<EmrHpkiBridge />);
      await waitFor(() => {
        expect(screen.getByText('ブリッジサーバーに接続してください')).toBeInTheDocument();
      });
    });
  });
});
