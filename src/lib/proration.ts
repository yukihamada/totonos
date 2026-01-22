/**
 * Proration calculation utilities for real estate management
 */

import { getDaysInMonth, format } from 'date-fns';
import type { ProrationRuleType, ProrationResult, InitialCostResult } from '@/types/estate';

export { PRORATION_RULE_OPTIONS } from '@/types/estate';
export type { ProrationRuleType, ProrationResult };

interface MoveInProrationParams {
  moveInDate: Date;
  monthlyRent: number;
  rules: ProrationRuleType[];
}

interface MoveOutProrationParams {
  moveOutDate: Date;
  monthlyRent: number;
  rules: ProrationRuleType[];
}

interface InitialCostParams {
  moveInDate: Date;
  monthlyRent: number;
  managementFee?: number;
  deposit?: number;
  keyMoney?: number;
  rules: ProrationRuleType[];
  includeNextMonth?: boolean;
}

function getTotalDaysInPeriod(date: Date, rules: ProrationRuleType[]): number {
  if (rules.includes('fixed_30_days')) return 30;
  if (rules.includes('fixed_31_days')) return 31;
  return getDaysInMonth(date);
}

/**
 * Calculate prorated rent for move-in
 */
export function calculateMoveInProration({
  moveInDate,
  monthlyRent,
  rules,
}: MoveInProrationParams): ProrationResult {
  const totalDays = getTotalDaysInPeriod(moveInDate, rules);
  const dayOfMonth = moveInDate.getDate();

  // Calculate remaining days in the month
  let remainingDays = totalDays - dayOfMonth + 1; // +1 to include the move-in day by default

  // Adjust based on rules
  if (rules.includes('exclude_start_day')) {
    remainingDays -= 1;
  }

  // Ensure at least 0 days
  remainingDays = Math.max(0, remainingDays);

  // Calculate prorated amount
  const dailyRate = monthlyRent / totalDays;
  const amount = Math.round(dailyRate * remainingDays);

  const ruleDescription = rules.includes('include_start_day')
    ? '入居日を含む'
    : rules.includes('exclude_start_day')
      ? '入居日を含まない'
      : '入居日を含む（デフォルト）';

  const daysDescription = rules.includes('fixed_30_days')
    ? '30日固定'
    : rules.includes('fixed_31_days')
      ? '31日固定'
      : '実日数';

  return {
    amount,
    days: remainingDays,
    totalDaysInPeriod: totalDays,
    formula: `¥${monthlyRent.toLocaleString()} ÷ ${totalDays}日 × ${remainingDays}日 = ¥${amount.toLocaleString()}`,
    description: `${format(moveInDate, 'M月d日')}入居、${daysDescription}計算、${ruleDescription}`,
  };
}

/**
 * Calculate prorated rent for move-out
 */
export function calculateMoveOutProration({
  moveOutDate,
  monthlyRent,
  rules,
}: MoveOutProrationParams): ProrationResult {
  const totalDays = getTotalDaysInPeriod(moveOutDate, rules);
  const dayOfMonth = moveOutDate.getDate();

  // Calculate days up to and including move-out day
  let usedDays = dayOfMonth; // Include the day by default

  // Adjust based on rules
  if (rules.includes('exclude_end_day')) {
    usedDays -= 1;
  }

  // Ensure at least 0 days
  usedDays = Math.max(0, usedDays);

  // Calculate prorated amount
  const dailyRate = monthlyRent / totalDays;
  const amount = Math.round(dailyRate * usedDays);

  const ruleDescription = rules.includes('include_end_day')
    ? '退去日を含む'
    : rules.includes('exclude_end_day')
      ? '退去日を含まない'
      : '退去日を含まない（デフォルト）';

  const daysDescription = rules.includes('fixed_30_days')
    ? '30日固定'
    : rules.includes('fixed_31_days')
      ? '31日固定'
      : '実日数';

  return {
    amount,
    days: usedDays,
    totalDaysInPeriod: totalDays,
    formula: `¥${monthlyRent.toLocaleString()} ÷ ${totalDays}日 × ${usedDays}日 = ¥${amount.toLocaleString()}`,
    description: `${format(moveOutDate, 'M月d日')}退去、${daysDescription}計算、${ruleDescription}`,
  };
}

/**
 * Calculate initial costs including prorated first month rent
 */
export function calculateInitialCosts({
  moveInDate,
  monthlyRent,
  managementFee = 0,
  deposit = 0,
  keyMoney = 0,
  rules,
  includeNextMonth = true,
}: InitialCostParams): InitialCostResult {
  // Calculate first month prorated rent
  const firstMonthRent = calculateMoveInProration({
    moveInDate,
    monthlyRent,
    rules,
  });

  // Calculate first month prorated management fee
  const firstMonthMgmtFee = managementFee > 0
    ? Math.round((managementFee / firstMonthRent.totalDaysInPeriod) * firstMonthRent.days)
    : 0;

  const breakdown: Array<{ label: string; amount: number }> = [];

  // Add first month rent
  breakdown.push({
    label: `${format(moveInDate, 'M月')}分家賃（日割り${firstMonthRent.days}日）`,
    amount: firstMonthRent.amount,
  });

  // Add first month management fee if applicable
  if (firstMonthMgmtFee > 0) {
    breakdown.push({
      label: `${format(moveInDate, 'M月')}分共益費（日割り）`,
      amount: firstMonthMgmtFee,
    });
  }

  // Add next month if requested
  if (includeNextMonth) {
    const nextMonth = new Date(moveInDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    breakdown.push({
      label: `${format(nextMonth, 'M月')}分家賃（前払い）`,
      amount: monthlyRent,
    });

    if (managementFee > 0) {
      breakdown.push({
        label: `${format(nextMonth, 'M月')}分共益費（前払い）`,
        amount: managementFee,
      });
    }
  }

  // Add deposit
  if (deposit > 0) {
    breakdown.push({
      label: '敷金',
      amount: deposit,
    });
  }

  // Add key money
  if (keyMoney > 0) {
    breakdown.push({
      label: '礼金',
      amount: keyMoney,
    });
  }

  // Calculate total
  const total = breakdown.reduce((sum, item) => sum + item.amount, 0);

  return {
    total,
    breakdown,
    firstMonthRent,
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  }).format(amount);
}
