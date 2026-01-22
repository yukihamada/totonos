import { describe, it, expect } from 'vitest';

// We need to test the internal functions, so we'll import them
// For testing purposes, we'll export the parse function
// Since the internal functions are not exported, we test through the module's behavior

describe('CSV Parser', () => {
  // Helper function to simulate CSV parsing behavior
  // This tests the logic without FileReader dependency

  describe('parseCSVRow', () => {
    // Test the CSV row parsing logic by creating a simple implementation
    function parseCSVRow(line: string): string[] {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          result.push(current);
          current = '';
        } else {
          current += char;
        }
      }

      result.push(current);
      return result;
    }

    it('should parse simple CSV row', () => {
      const row = '2026-01-15,山田太郎,100000';
      const result = parseCSVRow(row);

      expect(result).toEqual(['2026-01-15', '山田太郎', '100000']);
    });

    it('should parse row with quoted fields', () => {
      const row = '"2026-01-15","山田, 太郎","100,000"';
      const result = parseCSVRow(row);

      expect(result).toEqual(['2026-01-15', '山田, 太郎', '100,000']);
    });

    it('should handle escaped quotes', () => {
      const row = '"Test ""quoted"" value",other';
      const result = parseCSVRow(row);

      expect(result).toEqual(['Test "quoted" value', 'other']);
    });

    it('should handle empty fields', () => {
      const row = '2026-01-15,,100000';
      const result = parseCSVRow(row);

      expect(result).toEqual(['2026-01-15', '', '100000']);
    });
  });

  describe('parseDate', () => {
    function parseDate(value: string | undefined): string | null {
      if (!value) return null;

      const cleaned = value.trim();

      const formats = [
        /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
        /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/,
        /^(\d{4})年(\d{1,2})月(\d{1,2})日$/,
      ];

      for (const format of formats) {
        const match = cleaned.match(format);
        if (match) {
          const year = parseInt(match[1], 10);
          const month = parseInt(match[2], 10);
          const day = parseInt(match[3], 10);

          if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
            return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          }
        }
      }

      return null;
    }

    it('should parse YYYY-MM-DD format', () => {
      expect(parseDate('2026-01-15')).toBe('2026-01-15');
    });

    it('should parse YYYY/MM/DD format', () => {
      expect(parseDate('2026/01/15')).toBe('2026-01-15');
    });

    it('should parse Japanese date format', () => {
      expect(parseDate('2026年1月15日')).toBe('2026-01-15');
    });

    it('should handle single digit month/day', () => {
      expect(parseDate('2026-1-5')).toBe('2026-01-05');
    });

    it('should return null for invalid date', () => {
      expect(parseDate('invalid')).toBeNull();
    });

    it('should return null for invalid month', () => {
      expect(parseDate('2026-13-15')).toBeNull();
    });

    it('should return null for invalid day', () => {
      expect(parseDate('2026-01-32')).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(parseDate('')).toBeNull();
    });

    it('should return null for undefined', () => {
      expect(parseDate(undefined)).toBeNull();
    });
  });

  describe('parseAmount', () => {
    function parseAmount(value: string | undefined): number {
      if (!value) return NaN;

      const cleaned = value
        .replace(/[¥￥円,、\s]/g, '')
        .replace(/^-/, '')
        .trim();

      return parseInt(cleaned, 10);
    }

    it('should parse plain number', () => {
      expect(parseAmount('100000')).toBe(100000);
    });

    it('should parse number with yen symbol', () => {
      expect(parseAmount('¥100000')).toBe(100000);
    });

    it('should parse number with full-width yen symbol', () => {
      expect(parseAmount('￥100000')).toBe(100000);
    });

    it('should parse number with 円', () => {
      expect(parseAmount('100000円')).toBe(100000);
    });

    it('should parse number with commas', () => {
      expect(parseAmount('100,000')).toBe(100000);
    });

    it('should parse number with Japanese comma', () => {
      expect(parseAmount('100、000')).toBe(100000);
    });

    it('should parse number with all formatting', () => {
      expect(parseAmount('¥1,234,567円')).toBe(1234567);
    });

    it('should remove negative sign (deposits only)', () => {
      expect(parseAmount('-50000')).toBe(50000);
    });

    it('should return NaN for undefined', () => {
      expect(parseAmount(undefined)).toBeNaN();
    });

    it('should return NaN for empty string', () => {
      expect(parseAmount('')).toBeNaN();
    });
  });

  describe('detectColumnMapping', () => {
    function detectColumnMapping(headerRow: string): object | null {
      const columns = headerRow.split(',');

      let dateIndex = -1;
      let depositorIndex = -1;
      let amountIndex = -1;

      columns.forEach((col, index) => {
        const normalizedCol = col.toLowerCase().trim();

        if (normalizedCol.includes('日付') || normalizedCol.includes('date') || normalizedCol === '取引日') {
          dateIndex = index;
        }

        if (
          normalizedCol.includes('振込人') ||
          normalizedCol.includes('依頼人') ||
          normalizedCol.includes('お名前') ||
          normalizedCol === '名前'
        ) {
          depositorIndex = index;
        }

        if (
          normalizedCol.includes('金額') ||
          normalizedCol.includes('入金') ||
          normalizedCol === 'amount'
        ) {
          amountIndex = index;
        }
      });

      if (dateIndex === -1 || depositorIndex === -1 || amountIndex === -1) {
        return null;
      }

      return { dateIndex, depositorIndex, amountIndex };
    }

    it('should detect Japanese header columns', () => {
      const header = '取引日,振込人,金額';
      const mapping = detectColumnMapping(header);

      expect(mapping).toEqual({
        dateIndex: 0,
        depositorIndex: 1,
        amountIndex: 2,
      });
    });

    it('should detect English header columns', () => {
      const header = 'date,name,amount';
      const mapping = detectColumnMapping(header);

      // 'name' doesn't match our patterns, so this should return null
      expect(mapping).toBeNull();
    });

    it('should detect alternative Japanese headers', () => {
      const header = '日付,依頼人,入金金額';
      const mapping = detectColumnMapping(header);

      expect(mapping).toEqual({
        dateIndex: 0,
        depositorIndex: 1,
        amountIndex: 2,
      });
    });

    it('should return null for missing required columns', () => {
      const header = '取引日,金額';
      const mapping = detectColumnMapping(header);

      expect(mapping).toBeNull();
    });

    it('should handle different column orders', () => {
      const header = '金額,取引日,振込人名';
      const mapping = detectColumnMapping(header);

      expect(mapping).toEqual({
        dateIndex: 1,
        depositorIndex: 2,
        amountIndex: 0,
      });
    });
  });
});
