import { describe, it, expect } from 'vitest';
import {
  getPropertyStatusLabel,
  getPropertyStatusColor,
  getBuildingTypeLabel,
  PRORATION_RULE_OPTIONS,
} from '@/types/estate';

describe('Estate Types', () => {
  describe('getPropertyStatusLabel', () => {
    it('should return correct label for vacant status', () => {
      expect(getPropertyStatusLabel('vacant')).toBe('空室');
    });

    it('should return correct label for occupied status', () => {
      expect(getPropertyStatusLabel('occupied')).toBe('入居中');
    });

    it('should return correct label for notice_given status', () => {
      expect(getPropertyStatusLabel('notice_given')).toBe('退去予定');
    });

    it('should return correct label for under_renovation status', () => {
      expect(getPropertyStatusLabel('under_renovation')).toBe('改装中');
    });
  });

  describe('getPropertyStatusColor', () => {
    it('should return CSS class for occupied status', () => {
      const result = getPropertyStatusColor('occupied');
      expect(result).toContain('bg-');
      expect(result).toContain('text-');
    });

    it('should return CSS class for vacant status', () => {
      const result = getPropertyStatusColor('vacant');
      expect(result).toContain('bg-');
      expect(result).toContain('text-');
    });

    it('should return CSS class for notice_given status', () => {
      const result = getPropertyStatusColor('notice_given');
      expect(result).toContain('bg-');
      expect(result).toContain('text-');
    });

    it('should return CSS class for under_renovation status', () => {
      const result = getPropertyStatusColor('under_renovation');
      expect(result).toContain('bg-');
      expect(result).toContain('text-');
    });
  });

  describe('getBuildingTypeLabel', () => {
    it('should return correct label for mansion type', () => {
      expect(getBuildingTypeLabel('mansion')).toBe('マンション');
    });

    it('should return correct label for apartment type', () => {
      expect(getBuildingTypeLabel('apartment')).toBe('アパート');
    });

    it('should return correct label for house type', () => {
      expect(getBuildingTypeLabel('house')).toBe('一戸建て');
    });

    it('should return correct label for office type', () => {
      expect(getBuildingTypeLabel('office')).toBe('オフィスビル');
    });

    it('should return correct label for commercial type', () => {
      expect(getBuildingTypeLabel('commercial')).toBe('商業施設');
    });

    it('should return correct label for parking type', () => {
      expect(getBuildingTypeLabel('parking')).toBe('駐車場');
    });

    it('should return the input for unknown type', () => {
      expect(getBuildingTypeLabel('custom_type')).toBe('custom_type');
    });

    it('should return 未設定 for null', () => {
      expect(getBuildingTypeLabel(null)).toBe('未設定');
    });
  });

  describe('PRORATION_RULE_OPTIONS', () => {
    it('should have actual_days option', () => {
      const option = PRORATION_RULE_OPTIONS.find(o => o.value === 'actual_days');
      expect(option).toBeDefined();
      expect(option?.label).toBe('実日数');
    });

    it('should have fixed_30_days option', () => {
      const option = PRORATION_RULE_OPTIONS.find(o => o.value === 'fixed_30_days');
      expect(option).toBeDefined();
      expect(option?.label).toBe('30日固定');
    });

    it('should have fixed_31_days option', () => {
      const option = PRORATION_RULE_OPTIONS.find(o => o.value === 'fixed_31_days');
      expect(option).toBeDefined();
      expect(option?.label).toBe('31日固定');
    });

    it('should have include_start_day option', () => {
      const option = PRORATION_RULE_OPTIONS.find(o => o.value === 'include_start_day');
      expect(option).toBeDefined();
      expect(option?.label).toBe('入居日含む');
    });

    it('should have exclude_start_day option', () => {
      const option = PRORATION_RULE_OPTIONS.find(o => o.value === 'exclude_start_day');
      expect(option).toBeDefined();
      expect(option?.label).toBe('入居日含まない');
    });

    it('should have include_end_day option', () => {
      const option = PRORATION_RULE_OPTIONS.find(o => o.value === 'include_end_day');
      expect(option).toBeDefined();
      expect(option?.label).toBe('退去日含む');
    });

    it('should have exclude_end_day option', () => {
      const option = PRORATION_RULE_OPTIONS.find(o => o.value === 'exclude_end_day');
      expect(option).toBeDefined();
      expect(option?.label).toBe('退去日含まない');
    });

    it('should have correct number of options', () => {
      expect(PRORATION_RULE_OPTIONS.length).toBe(7);
    });

    it('should have descriptions for all options', () => {
      PRORATION_RULE_OPTIONS.forEach(option => {
        expect(option.description).toBeDefined();
        expect(option.description.length).toBeGreaterThan(0);
      });
    });
  });
});
