import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../test-utils';
import Contracts from '@/pages/Contracts';

// Mock hooks
vi.mock('@/hooks/useContracts', () => ({
  useContracts: () => ({
    data: [],
    isLoading: false,
    error: null,
  }),
  useDeleteContract: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

describe('Contracts Page', () => {
  describe('rendering', () => {
    it('should render page title', async () => {
      render(<Contracts />);
      await waitFor(() => {
        expect(screen.getByText('契約書一覧')).toBeInTheDocument();
      });
    });

    it('should render the page container', async () => {
      const { container } = render(<Contracts />);
      await waitFor(() => {
        expect(container.querySelector('main')).toBeInTheDocument();
      });
    });
  });
});
