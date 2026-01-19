import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SettingsProvider } from '@/contexts/SettingsContext';

// Wrapper component for tests
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <SettingsProvider>{children}</SettingsProvider>
);

describe('ThemeToggle', () => {
  describe('rendering', () => {
    it('should render the toggle button', () => {
      render(<ThemeToggle />, { wrapper: TestWrapper });
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should have accessible label', () => {
      render(<ThemeToggle />, { wrapper: TestWrapper });
      expect(screen.getByText('テーマを切り替え')).toBeInTheDocument();
    });

    it('should render sun and moon icons', () => {
      const { container } = render(<ThemeToggle />, { wrapper: TestWrapper });
      // Icons are rendered in the button
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should render button with correct styling', () => {
      render(<ThemeToggle />, { wrapper: TestWrapper });
      const button = screen.getByRole('button');
      expect(button).toHaveClass('inline-flex');
    });

    it('should have two svg icons (sun and moon)', () => {
      const { container } = render(<ThemeToggle />, { wrapper: TestWrapper });
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBe(2);
    });
  });
});
