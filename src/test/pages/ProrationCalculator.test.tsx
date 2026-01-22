import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { render } from '../test-utils';
import ProrationCalculator from '@/pages/ProrationCalculator';

// Mock the supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn((callback) => {
        setTimeout(() => callback('INITIAL_SESSION', null), 0);
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    }),
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: null, error: null }),
    },
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
    }),
    removeChannel: vi.fn(),
  },
}));

describe('ProrationCalculator Page', () => {
  describe('rendering', () => {
    it('should render page title', async () => {
      render(<ProrationCalculator />);
      await waitFor(() => {
        expect(screen.getByText('日割り計算')).toBeInTheDocument();
      });
    });

    it('should render page description', async () => {
      render(<ProrationCalculator />);
      await waitFor(() => {
        expect(screen.getByText('入居・退去時の日割り家賃を計算')).toBeInTheDocument();
      });
    });

    it('should render calculation type buttons', async () => {
      render(<ProrationCalculator />);
      await waitFor(() => {
        expect(screen.getByText('入居日割り')).toBeInTheDocument();
        expect(screen.getByText('退去日割り')).toBeInTheDocument();
        expect(screen.getByText('初期費用')).toBeInTheDocument();
      });
    });

    it('should render calculation rules section', async () => {
      render(<ProrationCalculator />);
      await waitFor(() => {
        expect(screen.getByText('計算ルール')).toBeInTheDocument();
      });
    });

    it('should render proration rule options', async () => {
      render(<ProrationCalculator />);
      await waitFor(() => {
        expect(screen.getByText('実日数')).toBeInTheDocument();
        expect(screen.getByText('30日固定')).toBeInTheDocument();
        expect(screen.getByText('31日固定')).toBeInTheDocument();
      });
    });

    it('should render calculate button', async () => {
      render(<ProrationCalculator />);
      await waitFor(() => {
        expect(screen.getByText('計算する')).toBeInTheDocument();
      });
    });

    it('should render result section', async () => {
      render(<ProrationCalculator />);
      await waitFor(() => {
        expect(screen.getByText('計算結果')).toBeInTheDocument();
      });
    });

    it('should render placeholder when no calculation', async () => {
      render(<ProrationCalculator />);
      await waitFor(() => {
        expect(screen.getByText('条件を入力して計算してください')).toBeInTheDocument();
      });
    });
  });
});
