import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../test-utils';
import Properties from '@/pages/Properties';

// Mock the supabase client for buildings query
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

describe('Properties Page', () => {
  describe('rendering', () => {
    it('should render page title', async () => {
      render(<Properties />);
      await waitFor(() => {
        expect(screen.getByText('物件管理')).toBeInTheDocument();
      });
    });

    it('should render page description', async () => {
      render(<Properties />);
      await waitFor(() => {
        expect(screen.getByText('建物と部屋の一覧・管理')).toBeInTheDocument();
      });
    });

    it('should render add property buttons', async () => {
      render(<Properties />);
      await waitFor(() => {
        // There are multiple "物件を追加" buttons
        const buttons = screen.getAllByText('物件を追加');
        expect(buttons.length).toBeGreaterThan(0);
      });
    });

    it('should render search input', async () => {
      render(<Properties />);
      await waitFor(() => {
        expect(screen.getByPlaceholderText('物件名・住所で検索...')).toBeInTheDocument();
      });
    });
  });
});
