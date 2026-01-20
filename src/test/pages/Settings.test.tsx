import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../test-utils';
import Settings from '@/pages/Settings';

// Mock hooks
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { email: 'test@example.com' },
    isLoading: false,
  }),
}));

vi.mock('@/contexts/SettingsContext', () => ({
  useAppSettings: () => ({
    settings: {
      theme: 'light',
      fontSize: 'base',
      compactMode: false,
      menuGroups: [],
    },
    updateSettings: vi.fn(),
    updateMenuGroup: vi.fn(),
    updateMenuItem: vi.fn(),
    resetToDefaults: vi.fn(),
  }),
}));

vi.mock('@/hooks/useCompany', () => ({
  useCurrentCompany: () => ({
    data: {
      id: 'company-1',
      name: 'テスト株式会社',
      address: '東京都渋谷区',
      phone: '03-1234-5678',
      email: 'info@test.com',
    },
    isLoading: false,
  }),
  useUpdateCompany: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

describe('Settings Page', () => {
  describe('rendering', () => {
    it('should render page title', async () => {
      render(<Settings />);
      await waitFor(() => {
        expect(screen.getByText('設定')).toBeInTheDocument();
      });
    });

    it('should render page description', async () => {
      render(<Settings />);
      await waitFor(() => {
        expect(screen.getByText('アプリケーションの設定を管理')).toBeInTheDocument();
      });
    });

    it('should render save button', async () => {
      render(<Settings />);
      await waitFor(() => {
        expect(screen.getByText('保存')).toBeInTheDocument();
      });
    });

    it('should render tab navigation', async () => {
      render(<Settings />);
      await waitFor(() => {
        expect(screen.getByText('外観')).toBeInTheDocument();
        expect(screen.getByText('メニュー')).toBeInTheDocument();
        expect(screen.getByText('会社情報')).toBeInTheDocument();
        expect(screen.getByText('請求書')).toBeInTheDocument();
        expect(screen.getByText('通知')).toBeInTheDocument();
        expect(screen.getByText('セキュリティ')).toBeInTheDocument();
      });
    });

    it('should render theme settings section', async () => {
      render(<Settings />);
      await waitFor(() => {
        expect(screen.getByText('テーマ設定')).toBeInTheDocument();
        expect(screen.getByText('カラーモード')).toBeInTheDocument();
      });
    });

    it('should render theme options', async () => {
      render(<Settings />);
      await waitFor(() => {
        expect(screen.getByText('ライト')).toBeInTheDocument();
        expect(screen.getByText('ダーク')).toBeInTheDocument();
        expect(screen.getByText('システム')).toBeInTheDocument();
      });
    });

    it('should render regional settings section', async () => {
      render(<Settings />);
      await waitFor(() => {
        expect(screen.getByText('地域設定')).toBeInTheDocument();
      });
    });
  });
});
