import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../test-utils';
import EstateReconciliation from '@/pages/EstateReconciliation';

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

describe('EstateReconciliation Page', () => {
  describe('rendering', () => {
    it('should render page title', async () => {
      render(<EstateReconciliation />);
      await waitFor(() => {
        expect(screen.getByText('家賃入金消込')).toBeInTheDocument();
      });
    });

    it('should render page description', async () => {
      render(<EstateReconciliation />);
      await waitFor(() => {
        expect(screen.getByText('銀行入金データと家賃請求の照合・消込処理')).toBeInTheDocument();
      });
    });

    it('should render CSV upload button', async () => {
      render(<EstateReconciliation />);
      await waitFor(() => {
        expect(screen.getByText('銀行CSVをアップロード')).toBeInTheDocument();
      });
    });

    it('should render matching info section', async () => {
      render(<EstateReconciliation />);
      await waitFor(() => {
        expect(screen.getByText('AIマッチングについて')).toBeInTheDocument();
      });
    });
  });
});
