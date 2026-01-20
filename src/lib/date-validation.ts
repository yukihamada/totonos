/**
 * Date validation utilities for document generation
 */

/**
 * Check if a date string is in the past (before today)
 */
export function isDateInPast(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);
  
  return date < today;
}

/**
 * Check if a date string is valid
 */
export function isValidDateString(dateStr: string): boolean {
  if (!dateStr) return false;
  
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

/**
 * Get a default valid date (30 days from now)
 */
export function getDefaultValidUntil(): string {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().split('T')[0];
}

/**
 * Get a default due date (30 days from now)
 */
export function getDefaultDueDate(): string {
  return getDefaultValidUntil();
}

/**
 * Get today's date as YYYY-MM-DD string
 */
export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Validate and fix a date if it's in the past
 * Returns the original date if valid, or a default future date if not
 */
export function ensureFutureDate(dateStr: string, defaultDaysFromNow = 30): string {
  if (!isValidDateString(dateStr) || isDateInPast(dateStr)) {
    const date = new Date();
    date.setDate(date.getDate() + defaultDaysFromNow);
    return date.toISOString().split('T')[0];
  }
  return dateStr;
}
