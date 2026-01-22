import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { TestTimer } from '@/components/lms/TestTimer';

describe('TestTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should display initial time correctly', () => {
    const onTimeUp = vi.fn();
    render(<TestTimer timeLimitMinutes={5} onTimeUp={onTimeUp} />);

    expect(screen.getByText('残り 05:00')).toBeInTheDocument();
  });

  it('should countdown correctly', () => {
    const onTimeUp = vi.fn();
    render(<TestTimer timeLimitMinutes={1} onTimeUp={onTimeUp} />);

    expect(screen.getByText('残り 01:00')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(10000); // 10 seconds
    });

    expect(screen.getByText('残り 00:50')).toBeInTheDocument();
  });

  it('should call onTimeUp when time reaches zero', () => {
    const onTimeUp = vi.fn();
    render(<TestTimer timeLimitMinutes={1} onTimeUp={onTimeUp} />);

    act(() => {
      vi.advanceTimersByTime(60000); // 60 seconds
    });

    expect(onTimeUp).toHaveBeenCalled();
  });

  it('should show warning style in last minute', () => {
    const onTimeUp = vi.fn();
    render(<TestTimer timeLimitMinutes={2} onTimeUp={onTimeUp} />);

    act(() => {
      vi.advanceTimersByTime(61000); // 61 seconds - leaving 59 seconds
    });

    // Should now be in low time mode (< 60 seconds)
    const badge = screen.getByText(/残り 00:59/);
    expect(badge.closest('[class*="secondary"]')).toBeTruthy();
  });

  it('should show critical style in last 30 seconds', () => {
    const onTimeUp = vi.fn();
    render(<TestTimer timeLimitMinutes={1} onTimeUp={onTimeUp} />);

    act(() => {
      vi.advanceTimersByTime(35000); // 35 seconds - leaving 25 seconds
    });

    // Should now be in critical mode (< 30 seconds)
    const badge = screen.getByText(/残り 00:25/);
    expect(badge.closest('[class*="destructive"]')).toBeTruthy();
  });

  it('should format time with leading zeros', () => {
    const onTimeUp = vi.fn();
    render(<TestTimer timeLimitMinutes={10} onTimeUp={onTimeUp} />);

    expect(screen.getByText('残り 10:00')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(65000); // 65 seconds
    });

    expect(screen.getByText('残り 08:55')).toBeInTheDocument();
  });
});
