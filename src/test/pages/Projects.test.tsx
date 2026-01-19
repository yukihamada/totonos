import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../test-utils';
import Projects from '@/pages/Projects';

// Note: Projects page uses mock data internally, no hooks to mock

describe('Projects Page', () => {
  describe('rendering', () => {
    it('should render page title', async () => {
      render(<Projects />);
      await waitFor(() => {
        expect(screen.getByText('プロジェクト')).toBeInTheDocument();
      });
    });

    it('should render the page container', async () => {
      const { container } = render(<Projects />);
      await waitFor(() => {
        expect(container.querySelector('main')).toBeInTheDocument();
      });
    });
  });
});
