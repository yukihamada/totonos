import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../test-utils';
import SlackIntegration from '@/pages/SlackIntegration';

// Mock useWebhooks hook
vi.mock('@/hooks/useWebhooks', () => ({
  useWebhooks: () => ({
    webhooks: [],
    isLoading: false,
    createWebhook: vi.fn(),
    updateWebhook: vi.fn(),
    deleteWebhook: vi.fn(),
    toggleWebhook: vi.fn(),
    testWebhook: vi.fn(),
  }),
  WEBHOOK_EVENTS: [
    'invoice.created',
    'invoice.paid',
    'invoice.overdue',
    'contract.signed',
    'contract.expiring',
    'deal.won',
    'lead.created',
    'expense.submitted',
    'expense.approved',
  ],
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('SlackIntegration Page', () => {
  describe('rendering', () => {
    it('should render page title', async () => {
      render(<SlackIntegration />);
      await waitFor(() => {
        expect(screen.getByText('Slack連携')).toBeInTheDocument();
      });
    });

    it('should render the page container', async () => {
      const { container } = render(<SlackIntegration />);
      await waitFor(() => {
        expect(container.querySelector('main')).toBeInTheDocument();
      });
    });

    it('should render setup guide section', async () => {
      render(<SlackIntegration />);
      await waitFor(() => {
        expect(screen.getByText('設定方法')).toBeInTheDocument();
      });
    });

    it('should render webhook configuration section', async () => {
      render(<SlackIntegration />);
      await waitFor(() => {
        expect(screen.getByText('Webhook設定')).toBeInTheDocument();
      });
    });

    it('should render event selection section', async () => {
      render(<SlackIntegration />);
      await waitFor(() => {
        expect(screen.getByText('通知イベント')).toBeInTheDocument();
      });
    });

    it('should render webhook URL input', async () => {
      render(<SlackIntegration />);
      await waitFor(() => {
        expect(screen.getByPlaceholderText('https://hooks.slack.com/services/...')).toBeInTheDocument();
      });
    });

    it('should render save button', async () => {
      render(<SlackIntegration />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: '保存' })).toBeInTheDocument();
      });
    });

    it('should render select all button', async () => {
      render(<SlackIntegration />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'すべて選択' })).toBeInTheDocument();
      });
    });
  });

  describe('event categories', () => {
    it('should render billing events category', async () => {
      render(<SlackIntegration />);
      await waitFor(() => {
        expect(screen.getByText('請求')).toBeInTheDocument();
      });
    });

    it('should render contract events category', async () => {
      render(<SlackIntegration />);
      await waitFor(() => {
        expect(screen.getByText('契約')).toBeInTheDocument();
      });
    });

    it('should render sales events category', async () => {
      render(<SlackIntegration />);
      await waitFor(() => {
        expect(screen.getByText('営業')).toBeInTheDocument();
      });
    });

    it('should render expense events category', async () => {
      render(<SlackIntegration />);
      await waitFor(() => {
        expect(screen.getByText('経費')).toBeInTheDocument();
      });
    });
  });

  describe('setup instructions', () => {
    it('should render Slack App link', async () => {
      render(<SlackIntegration />);
      await waitFor(() => {
        expect(screen.getByText('Slack App管理ページ')).toBeInTheDocument();
      });
    });

    it('should render documentation link', async () => {
      render(<SlackIntegration />);
      await waitFor(() => {
        expect(screen.getByText('Slack Webhookドキュメント')).toBeInTheDocument();
      });
    });
  });
});

