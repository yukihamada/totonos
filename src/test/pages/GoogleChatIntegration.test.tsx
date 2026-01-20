import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../test-utils';
import GoogleChatIntegration from '@/pages/GoogleChatIntegration';

// Mock useWebhooks hook
vi.mock('@/hooks/useWebhooks', () => ({
  useWebhooks: () => ({
    webhooks: [],
    isLoading: false,
    createWebhook: vi.fn(),
    updateWebhook: vi.fn(),
    deleteWebhook: vi.fn(),
    testWebhook: vi.fn(),
  }),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('GoogleChatIntegration Page', () => {
  describe('rendering', () => {
    it('should render page title', async () => {
      render(<GoogleChatIntegration />);
      await waitFor(() => {
        expect(screen.getByText('Google Chat連携')).toBeInTheDocument();
      });
    });

    it('should render the page container', async () => {
      const { container } = render(<GoogleChatIntegration />);
      await waitFor(() => {
        expect(container.querySelector('main')).toBeInTheDocument();
      });
    });

    it('should render setup guide section', async () => {
      render(<GoogleChatIntegration />);
      await waitFor(() => {
        expect(screen.getByText('設定方法')).toBeInTheDocument();
      });
    });

    it('should render webhook configuration section', async () => {
      render(<GoogleChatIntegration />);
      await waitFor(() => {
        expect(screen.getByText('Webhook設定')).toBeInTheDocument();
      });
    });

    it('should render event selection section', async () => {
      render(<GoogleChatIntegration />);
      await waitFor(() => {
        expect(screen.getByText('通知イベント')).toBeInTheDocument();
      });
    });

    it('should render webhook URL input', async () => {
      render(<GoogleChatIntegration />);
      await waitFor(() => {
        expect(screen.getByPlaceholderText('https://chat.googleapis.com/v1/spaces/...')).toBeInTheDocument();
      });
    });

    it('should render save button', async () => {
      render(<GoogleChatIntegration />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: '保存' })).toBeInTheDocument();
      });
    });

    it('should render select all button', async () => {
      render(<GoogleChatIntegration />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'すべて選択' })).toBeInTheDocument();
      });
    });
  });

  describe('event categories', () => {
    it('should render billing events category', async () => {
      render(<GoogleChatIntegration />);
      await waitFor(() => {
        expect(screen.getByText('請求')).toBeInTheDocument();
      });
    });

    it('should render contract events category', async () => {
      render(<GoogleChatIntegration />);
      await waitFor(() => {
        expect(screen.getByText('契約')).toBeInTheDocument();
      });
    });

    it('should render sales events category', async () => {
      render(<GoogleChatIntegration />);
      await waitFor(() => {
        expect(screen.getByText('営業')).toBeInTheDocument();
      });
    });

    it('should render expense events category', async () => {
      render(<GoogleChatIntegration />);
      await waitFor(() => {
        expect(screen.getByText('経費')).toBeInTheDocument();
      });
    });
  });
});

