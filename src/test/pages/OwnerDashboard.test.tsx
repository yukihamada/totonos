import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../test-utils';
import OwnerDashboard from '@/pages/OwnerDashboard';

// Mock useAuth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
    profile: { display_name: 'テストオーナー' },
    loading: false,
    signOut: vi.fn(),
    signInWithMagicLink: vi.fn(),
    signInWithGoogle: vi.fn(),
    signInWithGitHub: vi.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock the supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { user: { id: 'test-user-id' } } },
        error: null
      }),
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

describe('OwnerDashboard Page', () => {
  describe('rendering', () => {
    it('should render page title', async () => {
      render(<OwnerDashboard />);
      await waitFor(() => {
        expect(screen.getByText('オーナーポータル')).toBeInTheDocument();
      });
    });

    it('should render welcome message', async () => {
      render(<OwnerDashboard />);
      await waitFor(() => {
        expect(screen.getByText(/ようこそ.*様/)).toBeInTheDocument();
      });
    });

    it('should render property count card', async () => {
      render(<OwnerDashboard />);
      await waitFor(() => {
        expect(screen.getByText('所有物件数')).toBeInTheDocument();
      });
    });

    it('should render occupancy rate card', async () => {
      render(<OwnerDashboard />);
      await waitFor(() => {
        expect(screen.getByText('稼働率')).toBeInTheDocument();
      });
    });

    it('should render monthly income card', async () => {
      render(<OwnerDashboard />);
      await waitFor(() => {
        expect(screen.getByText('月間家賃収入')).toBeInTheDocument();
      });
    });

    it('should render last payment card', async () => {
      render(<OwnerDashboard />);
      await waitFor(() => {
        expect(screen.getByText('前回送金額')).toBeInTheDocument();
      });
    });

    it('should render properties section', async () => {
      render(<OwnerDashboard />);
      await waitFor(() => {
        expect(screen.getByText('所有物件')).toBeInTheDocument();
      });
    });

    it('should render payment history section', async () => {
      render(<OwnerDashboard />);
      await waitFor(() => {
        expect(screen.getByText('送金履歴')).toBeInTheDocument();
      });
    });
  });
});
