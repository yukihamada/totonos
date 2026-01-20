import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../test-utils';
import Pricing from '@/pages/Pricing';

// Mock hooks
vi.mock('@/hooks/useCredits', () => ({
  useCredits: () => ({
    credits: {
      plan: 'free',
      monthly_credits: 100,
      used_credits: 10,
    },
    isLoading: false,
    error: null,
  }),
  useChangePlan: () => ({
    changePlan: vi.fn(),
    isLoading: false,
  }),
  PLANS: {
    free: { name: 'Free', price: 0, monthlyCredits: 100 },
    starter: { name: 'Starter', price: 980, monthlyCredits: 500 },
    standard: { name: 'Standard', price: 2980, monthlyCredits: 2000 },
    pro: { name: 'Pro', price: 9800, monthlyCredits: 10000 },
    enterprise: { name: 'Enterprise', price: 0, monthlyCredits: Infinity },
  },
}));

describe('Pricing Page', () => {
  describe('rendering', () => {
    it('should render page title', async () => {
      render(<Pricing />);
      await waitFor(() => {
        expect(screen.getByText('料金プラン')).toBeInTheDocument();
      });
    });

    it('should render page description', async () => {
      render(<Pricing />);
      await waitFor(() => {
        expect(screen.getByText('ビジネスの規模に合わせて最適なプランをお選びください')).toBeInTheDocument();
      });
    });

    it('should render billing toggle', async () => {
      render(<Pricing />);
      await waitFor(() => {
        expect(screen.getByText('月額')).toBeInTheDocument();
        expect(screen.getByText('年額')).toBeInTheDocument();
        expect(screen.getByText('20% OFF')).toBeInTheDocument();
      });
    });

    it('should render plan cards', async () => {
      render(<Pricing />);
      await waitFor(() => {
        expect(screen.getByText('Free')).toBeInTheDocument();
        expect(screen.getByText('Starter')).toBeInTheDocument();
        expect(screen.getByText('Standard')).toBeInTheDocument();
        expect(screen.getByText('Pro')).toBeInTheDocument();
        expect(screen.getByText('Enterprise')).toBeInTheDocument();
      });
    });

    it('should render popular badge', async () => {
      render(<Pricing />);
      await waitFor(() => {
        expect(screen.getByText('人気')).toBeInTheDocument();
      });
    });

    it('should render current plan badge', async () => {
      render(<Pricing />);
      await waitFor(() => {
        expect(screen.getByText('現在のプラン')).toBeInTheDocument();
      });
    });

    it('should render FAQ section', async () => {
      render(<Pricing />);
      await waitFor(() => {
        expect(screen.getByText('よくある質問')).toBeInTheDocument();
        expect(screen.getByText('クレジットは翌月に繰り越せますか？')).toBeInTheDocument();
        expect(screen.getByText('プランの変更はいつでもできますか？')).toBeInTheDocument();
      });
    });

    it('should render contact CTA', async () => {
      render(<Pricing />);
      await waitFor(() => {
        expect(screen.getByText('お問い合わせ')).toBeInTheDocument();
      });
    });
  });
});
