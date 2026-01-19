import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../test-utils';
import Expenses from '@/pages/Expenses';

// Note: Expenses page uses mock data internally, no hooks to mock

describe('Expenses Page', () => {
  describe('rendering', () => {
    it('should render page title', async () => {
      render(<Expenses />);
      await waitFor(() => {
        expect(screen.getByText('経費一覧')).toBeInTheDocument();
      });
    });

    it('should render the page container', async () => {
      const { container } = render(<Expenses />);
      await waitFor(() => {
        expect(container.querySelector('main')).toBeInTheDocument();
      });
    });
  });
});
