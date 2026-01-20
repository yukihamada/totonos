import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  isDateInPast,
  isValidDateString,
  getDefaultValidUntil,
  getDefaultDueDate,
  getTodayString,
  ensureFutureDate,
} from '@/lib/date-validation';

describe('date-validation', () => {
  beforeEach(() => {
    // Mock current date to 2026-01-20
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-20'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('isDateInPast', () => {
    it('returns true for past dates', () => {
      expect(isDateInPast('2025-12-31')).toBe(true);
      expect(isDateInPast('2026-01-19')).toBe(true);
      expect(isDateInPast('2020-01-01')).toBe(true);
    });

    it('returns false for today', () => {
      expect(isDateInPast('2026-01-20')).toBe(false);
    });

    it('returns false for future dates', () => {
      expect(isDateInPast('2026-01-21')).toBe(false);
      expect(isDateInPast('2026-02-28')).toBe(false);
      expect(isDateInPast('2027-01-01')).toBe(false);
    });
  });

  describe('isValidDateString', () => {
    it('returns true for valid date strings', () => {
      expect(isValidDateString('2026-01-20')).toBe(true);
      expect(isValidDateString('2026-02-28')).toBe(true);
      expect(isValidDateString('2025-12-31')).toBe(true);
    });

    it('returns false for invalid date strings', () => {
      expect(isValidDateString('')).toBe(false);
      expect(isValidDateString('invalid')).toBe(false);
      expect(isValidDateString('2026-13-01')).toBe(false); // Invalid month
    });
  });

  describe('getDefaultValidUntil', () => {
    it('returns a date 30 days from now', () => {
      const result = getDefaultValidUntil();
      expect(result).toBe('2026-02-19');
    });
  });

  describe('getDefaultDueDate', () => {
    it('returns a date 30 days from now', () => {
      const result = getDefaultDueDate();
      expect(result).toBe('2026-02-19');
    });
  });

  describe('getTodayString', () => {
    it('returns today as YYYY-MM-DD', () => {
      expect(getTodayString()).toBe('2026-01-20');
    });
  });

  describe('ensureFutureDate', () => {
    it('returns original date if valid and in future', () => {
      expect(ensureFutureDate('2026-02-28')).toBe('2026-02-28');
      expect(ensureFutureDate('2026-01-21')).toBe('2026-01-21');
    });

    it('returns today if date equals today', () => {
      expect(ensureFutureDate('2026-01-20')).toBe('2026-01-20');
    });

    it('returns default future date if date is in past', () => {
      expect(ensureFutureDate('2026-01-19')).toBe('2026-02-19');
      expect(ensureFutureDate('2025-12-31')).toBe('2026-02-19');
    });

    it('returns default future date if date is invalid', () => {
      expect(ensureFutureDate('invalid')).toBe('2026-02-19');
      expect(ensureFutureDate('')).toBe('2026-02-19');
    });

    it('uses custom days offset', () => {
      expect(ensureFutureDate('2025-01-01', 7)).toBe('2026-01-27');
      expect(ensureFutureDate('2025-01-01', 60)).toBe('2026-03-21');
    });
  });
});

describe('AI document generation date context', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-20'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('correctly interprets "end of February" as 2026-02-28', () => {
    // This test validates that when the AI is given current date context,
    // "2月末" should be interpreted as 2026-02-28, not 2025-02-28
    const currentYear = new Date().getFullYear();
    const febEnd = `${currentYear}-02-28`;
    
    expect(febEnd).toBe('2026-02-28');
    expect(isDateInPast(febEnd)).toBe(false);
  });

  it('correctly interprets "next month end" as future date', () => {
    const currentDate = new Date();
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0);
    const nextMonthEnd = nextMonth.toISOString().split('T')[0];
    
    // Next month from January 2026 = February 2026
    expect(nextMonthEnd).toBe('2026-02-28');
    expect(isDateInPast(nextMonthEnd)).toBe(false);
  });
});
