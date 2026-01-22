import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../test-utils';
import EstateTenants from '@/pages/EstateTenants';

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

describe('EstateTenants Page', () => {
  describe('rendering', () => {
    it('should render page title', async () => {
      render(<EstateTenants />);
      await waitFor(() => {
        expect(screen.getByText('入居者管理')).toBeInTheDocument();
      });
    });

    it('should render page description', async () => {
      render(<EstateTenants />);
      await waitFor(() => {
        expect(screen.getByText('入居者の一覧・登録・編集')).toBeInTheDocument();
      });
    });

    it('should render add tenant button', async () => {
      render(<EstateTenants />);
      await waitFor(() => {
        expect(screen.getByText('入居者を登録')).toBeInTheDocument();
      });
    });

    it('should render search input', async () => {
      render(<EstateTenants />);
      await waitFor(() => {
        expect(screen.getByPlaceholderText('氏名・フリガナ・メールで検索...')).toBeInTheDocument();
      });
    });
  });
});
