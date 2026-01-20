import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../test-utils';
import AIAgents from '@/pages/AIAgents';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('AIAgents Page', () => {
  describe('rendering', () => {
    it('should render page title', async () => {
      render(<AIAgents />);
      await waitFor(() => {
        expect(screen.getByText('AIエージェント')).toBeInTheDocument();
      });
    });

    it('should render the page container', async () => {
      const { container } = render(<AIAgents />);
      await waitFor(() => {
        expect(container.querySelector('main')).toBeInTheDocument();
      });
    });

    it('should render page description', async () => {
      render(<AIAgents />);
      await waitFor(() => {
        expect(screen.getByText('自動でタスクを実行するAIエージェントを管理します')).toBeInTheDocument();
      });
    });

    it('should render add new agent button', async () => {
      render(<AIAgents />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /新しいエージェントを追加/ })).toBeInTheDocument();
      });
    });
  });

  describe('statistics cards', () => {
    it('should render active agents stat card', async () => {
      render(<AIAgents />);
      await waitFor(() => {
        expect(screen.getByText('稼働中のエージェント')).toBeInTheDocument();
      });
    });

    it('should render completed tasks stat card', async () => {
      render(<AIAgents />);
      await waitFor(() => {
        expect(screen.getByText('完了タスク数')).toBeInTheDocument();
      });
    });

    it('should render average success rate stat card', async () => {
      render(<AIAgents />);
      await waitFor(() => {
        expect(screen.getByText('平均成功率')).toBeInTheDocument();
      });
    });

    it('should render saved time stat card', async () => {
      render(<AIAgents />);
      await waitFor(() => {
        expect(screen.getByText('節約時間')).toBeInTheDocument();
      });
    });
  });

  describe('category filter tabs', () => {
    it('should render all tab', async () => {
      render(<AIAgents />);
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: 'すべて' })).toBeInTheDocument();
      });
    });

    it('should render automation tab', async () => {
      render(<AIAgents />);
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /自動化/ })).toBeInTheDocument();
      });
    });

    it('should render analysis tab', async () => {
      render(<AIAgents />);
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /分析/ })).toBeInTheDocument();
      });
    });

    it('should render notification tab', async () => {
      render(<AIAgents />);
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /通知/ })).toBeInTheDocument();
      });
    });

    it('should render assistant tab', async () => {
      render(<AIAgents />);
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /アシスタント/ })).toBeInTheDocument();
      });
    });
  });

  describe('agent cards', () => {
    it('should render invoice reminder agent', async () => {
      render(<AIAgents />);
      await waitFor(() => {
        expect(screen.getByText('請求書リマインダー')).toBeInTheDocument();
      });
    });

    it('should render expense processor agent', async () => {
      render(<AIAgents />);
      await waitFor(() => {
        expect(screen.getByText('経費自動処理')).toBeInTheDocument();
      });
    });

    it('should render lead scorer agent', async () => {
      render(<AIAgents />);
      await waitFor(() => {
        expect(screen.getByText('リードスコアリング')).toBeInTheDocument();
      });
    });

    it('should render contract monitor agent', async () => {
      render(<AIAgents />);
      await waitFor(() => {
        expect(screen.getByText('契約期限モニター')).toBeInTheDocument();
      });
    });

    it('should render email classifier agent', async () => {
      render(<AIAgents />);
      await waitFor(() => {
        expect(screen.getByText('メール自動分類')).toBeInTheDocument();
      });
    });

    it('should render sales forecaster agent', async () => {
      render(<AIAgents />);
      await waitFor(() => {
        expect(screen.getByText('売上予測')).toBeInTheDocument();
      });
    });

    it('should render chat assistant agent', async () => {
      render(<AIAgents />);
      await waitFor(() => {
        expect(screen.getByText('チャットアシスタント')).toBeInTheDocument();
      });
    });
  });

  describe('help section', () => {
    it('should render help card title', async () => {
      render(<AIAgents />);
      await waitFor(() => {
        expect(screen.getByText('AIエージェントとは？')).toBeInTheDocument();
      });
    });

    it('should render safe execution feature', async () => {
      render(<AIAgents />);
      await waitFor(() => {
        expect(screen.getByText('安全な実行')).toBeInTheDocument();
      });
    });

    it('should render complete history feature', async () => {
      render(<AIAgents />);
      await waitFor(() => {
        expect(screen.getByText('完全な履歴')).toBeInTheDocument();
      });
    });

    it('should render customizable feature', async () => {
      render(<AIAgents />);
      await waitFor(() => {
        expect(screen.getByText('カスタマイズ可能')).toBeInTheDocument();
      });
    });
  });
});
