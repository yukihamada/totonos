import { describe, it, expect } from 'vitest';
import {
  calculateMoveInProration,
  calculateMoveOutProration,
  calculateInitialCosts,
  formatCurrency,
} from '@/lib/proration';

describe('Proration Library', () => {
  describe('calculateMoveInProration', () => {
    it('should calculate prorated rent for mid-month move-in with actual days', () => {
      const result = calculateMoveInProration({
        moveInDate: new Date('2026-01-15'),
        monthlyRent: 100000,
        rules: ['actual_days', 'include_start_day'],
      });

      // January has 31 days, moving in on 15th means 17 remaining days (15-31 inclusive)
      expect(result.days).toBe(17);
      expect(result.totalDaysInPeriod).toBe(31);
      expect(result.amount).toBe(Math.round((100000 / 31) * 17));
    });

    it('should calculate prorated rent excluding start day', () => {
      const result = calculateMoveInProration({
        moveInDate: new Date('2026-01-15'),
        monthlyRent: 100000,
        rules: ['actual_days', 'exclude_start_day'],
      });

      // Excluding start day: 16 days remaining (16-31 inclusive)
      expect(result.days).toBe(16);
    });

    it('should use fixed 30 days when rule is specified', () => {
      const result = calculateMoveInProration({
        moveInDate: new Date('2026-01-15'),
        monthlyRent: 100000,
        rules: ['fixed_30_days', 'include_start_day'],
      });

      expect(result.totalDaysInPeriod).toBe(30);
      // 30 - 15 + 1 = 16 days
      expect(result.days).toBe(16);
    });

    it('should use fixed 31 days when rule is specified', () => {
      const result = calculateMoveInProration({
        moveInDate: new Date('2026-02-15'),
        monthlyRent: 100000,
        rules: ['fixed_31_days', 'include_start_day'],
      });

      expect(result.totalDaysInPeriod).toBe(31);
    });

    it('should handle first day of month', () => {
      const result = calculateMoveInProration({
        moveInDate: new Date('2026-01-01'),
        monthlyRent: 100000,
        rules: ['actual_days', 'include_start_day'],
      });

      expect(result.days).toBe(31);
      expect(result.amount).toBe(100000);
    });

    it('should handle last day of month', () => {
      const result = calculateMoveInProration({
        moveInDate: new Date('2026-01-31'),
        monthlyRent: 100000,
        rules: ['actual_days', 'include_start_day'],
      });

      expect(result.days).toBe(1);
      expect(result.amount).toBe(Math.round(100000 / 31));
    });

    it('should include formula in result', () => {
      const result = calculateMoveInProration({
        moveInDate: new Date('2026-01-15'),
        monthlyRent: 100000,
        rules: ['actual_days', 'include_start_day'],
      });

      expect(result.formula).toContain('100,000');
      expect(result.formula).toContain('31日');
      expect(result.formula).toContain('17日');
    });
  });

  describe('calculateMoveOutProration', () => {
    it('should calculate prorated rent for mid-month move-out with actual days', () => {
      const result = calculateMoveOutProration({
        moveOutDate: new Date('2026-01-15'),
        monthlyRent: 100000,
        rules: ['actual_days', 'include_end_day'],
      });

      // Moving out on 15th means 15 days used (1-15 inclusive)
      expect(result.days).toBe(15);
      expect(result.totalDaysInPeriod).toBe(31);
    });

    it('should calculate prorated rent excluding end day', () => {
      const result = calculateMoveOutProration({
        moveOutDate: new Date('2026-01-15'),
        monthlyRent: 100000,
        rules: ['actual_days', 'exclude_end_day'],
      });

      // Excluding end day: 14 days used (1-14)
      expect(result.days).toBe(14);
    });

    it('should handle last day of month move-out', () => {
      const result = calculateMoveOutProration({
        moveOutDate: new Date('2026-01-31'),
        monthlyRent: 100000,
        rules: ['actual_days', 'include_end_day'],
      });

      expect(result.days).toBe(31);
      expect(result.amount).toBe(100000);
    });

    it('should handle first day of month move-out', () => {
      const result = calculateMoveOutProration({
        moveOutDate: new Date('2026-01-01'),
        monthlyRent: 100000,
        rules: ['actual_days', 'include_end_day'],
      });

      expect(result.days).toBe(1);
      expect(result.amount).toBe(Math.round(100000 / 31));
    });

    it('should use fixed 30 days when rule is specified', () => {
      const result = calculateMoveOutProration({
        moveOutDate: new Date('2026-01-15'),
        monthlyRent: 100000,
        rules: ['fixed_30_days', 'include_end_day'],
      });

      expect(result.totalDaysInPeriod).toBe(30);
    });
  });

  describe('calculateInitialCosts', () => {
    it('should calculate total initial costs with all components', () => {
      const result = calculateInitialCosts({
        moveInDate: new Date('2026-01-15'),
        monthlyRent: 100000,
        managementFee: 10000,
        deposit: 200000,
        keyMoney: 100000,
        rules: ['actual_days', 'include_start_day'],
        includeNextMonth: true,
      });

      // Should include: first month rent, first month mgmt fee, next month rent, next month mgmt fee, deposit, key money
      expect(result.breakdown.length).toBe(6);
      expect(result.total).toBeGreaterThan(0);
    });

    it('should calculate initial costs without next month', () => {
      const result = calculateInitialCosts({
        moveInDate: new Date('2026-01-15'),
        monthlyRent: 100000,
        managementFee: 10000,
        deposit: 200000,
        keyMoney: 100000,
        rules: ['actual_days', 'include_start_day'],
        includeNextMonth: false,
      });

      // Should include: first month rent, first month mgmt fee, deposit, key money
      expect(result.breakdown.length).toBe(4);
    });

    it('should handle zero deposit and key money', () => {
      const result = calculateInitialCosts({
        moveInDate: new Date('2026-01-15'),
        monthlyRent: 100000,
        managementFee: 0,
        deposit: 0,
        keyMoney: 0,
        rules: ['actual_days', 'include_start_day'],
        includeNextMonth: false,
      });

      // Should only include first month rent
      expect(result.breakdown.length).toBe(1);
      expect(result.breakdown[0].label).toContain('家賃');
    });

    it('should include next month prepaid rent correctly', () => {
      const result = calculateInitialCosts({
        moveInDate: new Date('2026-01-15'),
        monthlyRent: 100000,
        rules: ['actual_days', 'include_start_day'],
        includeNextMonth: true,
      });

      const nextMonthRent = result.breakdown.find(item => item.label.includes('2月') && item.label.includes('前払い'));
      expect(nextMonthRent).toBeDefined();
      expect(nextMonthRent?.amount).toBe(100000);
    });

    it('should include firstMonthRent details', () => {
      const result = calculateInitialCosts({
        moveInDate: new Date('2026-01-15'),
        monthlyRent: 100000,
        rules: ['actual_days', 'include_start_day'],
        includeNextMonth: false,
      });

      expect(result.firstMonthRent).toBeDefined();
      expect(result.firstMonthRent.days).toBe(17);
      expect(result.firstMonthRent.formula).toBeDefined();
    });
  });

  describe('formatCurrency', () => {
    it('should format positive amounts correctly', () => {
      const result = formatCurrency(100000);
      expect(result).toBe('￥100,000');
    });

    it('should format zero correctly', () => {
      const result = formatCurrency(0);
      expect(result).toBe('￥0');
    });

    it('should format negative amounts correctly', () => {
      const result = formatCurrency(-50000);
      expect(result).toBe('-￥50,000');
    });

    it('should format large amounts correctly', () => {
      const result = formatCurrency(1234567);
      expect(result).toBe('￥1,234,567');
    });
  });
});
