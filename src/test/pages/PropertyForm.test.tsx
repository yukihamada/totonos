import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../test-utils';
import PropertyForm from '@/pages/PropertyForm';

// Mock react-router-dom params
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({}),
    useNavigate: () => vi.fn(),
  };
});

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

describe('PropertyForm Page', () => {
  describe('rendering (new property mode)', () => {
    it('should render page title for new property', async () => {
      render(<PropertyForm />);
      await waitFor(() => {
        expect(screen.getByText('新規物件登録')).toBeInTheDocument();
      });
    });

    it('should render building info section', async () => {
      render(<PropertyForm />);
      await waitFor(() => {
        expect(screen.getByText('建物情報')).toBeInTheDocument();
      });
    });

    it('should render property name input', async () => {
      render(<PropertyForm />);
      await waitFor(() => {
        expect(screen.getByPlaceholderText('サンプルマンション')).toBeInTheDocument();
      });
    });

    it('should render submit button', async () => {
      render(<PropertyForm />);
      await waitFor(() => {
        // New property mode shows "登録" button
        expect(screen.getByText('登録')).toBeInTheDocument();
      });
    });
  });
});
