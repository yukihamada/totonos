import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary, useErrorHandler } from '@/components/ErrorBoundary';
import { renderHook } from '@testing-library/react';

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Suppress console.error for cleaner test output
const originalError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});
afterEach(() => {
  console.error = originalError;
});

describe('ErrorBoundary', () => {
  describe('normal rendering', () => {
    it('should render children when no error', () => {
      render(
        <ErrorBoundary>
          <div>Child content</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Child content')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      render(
        <ErrorBoundary>
          <div>First</div>
          <div>Second</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('should catch errors and display error UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
    });

    it('should display error description', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('申し訳ありません。予期しないエラーが発生しました。')).toBeInTheDocument();
    });

    it('should show retry button', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('再試行')).toBeInTheDocument();
    });

    it('should show reload button', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('ページを再読み込み')).toBeInTheDocument();
    });

    it('should show home button', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('ホームへ')).toBeInTheDocument();
    });

    it('should show support message', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('問題が解決しない場合は、サポートまでお問い合わせください。')).toBeInTheDocument();
    });
  });

  describe('custom fallback', () => {
    it('should render custom fallback when provided', () => {
      render(
        <ErrorBoundary fallback={<div>Custom error UI</div>}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Custom error UI')).toBeInTheDocument();
    });

    it('should not show default error UI when fallback is provided', () => {
      render(
        <ErrorBoundary fallback={<div>Custom error UI</div>}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.queryByText('エラーが発生しました')).not.toBeInTheDocument();
    });
  });

  describe('error recovery', () => {
    it('should have reset function that can be called', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();

      const retryButton = screen.getByText('再試行');
      // The retry button should be clickable
      expect(() => fireEvent.click(retryButton)).not.toThrow();
    });
  });

  describe('buttons', () => {
    it('should have three action buttons', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBe(3);
    });
  });
});

describe('useErrorHandler', () => {
  it('should return a function', () => {
    const { result } = renderHook(() => useErrorHandler());
    expect(typeof result.current).toBe('function');
  });

  it('should handle errors without throwing', () => {
    const { result } = renderHook(() => useErrorHandler());
    const handleError = result.current;

    expect(() => {
      handleError(new Error('Test error'));
    }).not.toThrow();
  });

  it('should log error to console', () => {
    const { result } = renderHook(() => useErrorHandler());
    const handleError = result.current;

    handleError(new Error('Test error'));

    expect(console.error).toHaveBeenCalled();
  });
});
