/**
 * CSV Parser for bank transaction imports
 */

import type { ParsedBankTransaction } from '@/types/estate';

export type { ParsedBankTransaction as BankTransaction };

interface ParseResult {
  transactions: ParsedBankTransaction[];
  successRows: number;
  errors: string[];
}

/**
 * Parse a CSV file containing bank transactions
 * Supports common Japanese bank CSV formats
 */
export async function readAndParseCSV(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const result = parseCSVContent(text);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('ファイルの読み込みに失敗しました'));
    };

    // Try to detect encoding - Japanese banks often use Shift-JIS
    reader.readAsText(file, 'UTF-8');
  });
}

function parseCSVContent(content: string): ParseResult {
  const lines = content.split(/\r?\n/).filter((line) => line.trim());
  const transactions: ParsedBankTransaction[] = [];
  const errors: string[] = [];

  if (lines.length === 0) {
    return { transactions: [], successRows: 0, errors: ['CSVファイルが空です'] };
  }

  // Detect header row and column mapping
  const headerRow = lines[0].toLowerCase();
  const columnMapping = detectColumnMapping(headerRow);

  if (!columnMapping) {
    // Try without header (assume standard format)
    return parseWithoutHeader(lines);
  }

  // Parse with detected header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    try {
      const transaction = parseRow(line, columnMapping);
      if (transaction) {
        transactions.push(transaction);
      }
    } catch (error) {
      errors.push(`行 ${i + 1}: ${error instanceof Error ? error.message : '解析エラー'}`);
    }
  }

  return {
    transactions,
    successRows: transactions.length,
    errors,
  };
}

interface ColumnMapping {
  dateIndex: number;
  depositorIndex: number;
  depositorKanaIndex?: number;
  amountIndex: number;
  bankIndex?: number;
  branchIndex?: number;
  refIndex?: number;
}

function detectColumnMapping(headerRow: string): ColumnMapping | null {
  const columns = parseCSVRow(headerRow);

  let dateIndex = -1;
  let depositorIndex = -1;
  let depositorKanaIndex = -1;
  let amountIndex = -1;
  let bankIndex = -1;
  let branchIndex = -1;
  let refIndex = -1;

  columns.forEach((col, index) => {
    const normalizedCol = col.toLowerCase().trim();

    // Date column detection
    if (normalizedCol.includes('日付') || normalizedCol.includes('date') || normalizedCol === '取引日') {
      dateIndex = index;
    }

    // Depositor name detection
    if (
      normalizedCol.includes('振込人') ||
      normalizedCol.includes('依頼人') ||
      normalizedCol.includes('お名前') ||
      normalizedCol === '名前'
    ) {
      if (normalizedCol.includes('カナ') || normalizedCol.includes('kana')) {
        depositorKanaIndex = index;
      } else {
        depositorIndex = index;
      }
    }

    // Amount detection
    if (
      normalizedCol.includes('金額') ||
      normalizedCol.includes('入金') ||
      normalizedCol === 'amount' ||
      normalizedCol === '摘要金額'
    ) {
      amountIndex = index;
    }

    // Bank name detection
    if (normalizedCol.includes('銀行') || normalizedCol === 'bank') {
      bankIndex = index;
    }

    // Branch detection
    if (normalizedCol.includes('支店') || normalizedCol === 'branch') {
      branchIndex = index;
    }

    // Reference number detection
    if (normalizedCol.includes('番号') || normalizedCol.includes('ref') || normalizedCol === '照会番号') {
      refIndex = index;
    }
  });

  // Minimum required columns
  if (dateIndex === -1 || depositorIndex === -1 || amountIndex === -1) {
    return null;
  }

  return {
    dateIndex,
    depositorIndex,
    depositorKanaIndex: depositorKanaIndex >= 0 ? depositorKanaIndex : undefined,
    amountIndex,
    bankIndex: bankIndex >= 0 ? bankIndex : undefined,
    branchIndex: branchIndex >= 0 ? branchIndex : undefined,
    refIndex: refIndex >= 0 ? refIndex : undefined,
  };
}

function parseWithoutHeader(lines: string[]): ParseResult {
  const transactions: ParsedBankTransaction[] = [];
  const errors: string[] = [];

  // Assume standard format: date, depositor, amount
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    try {
      const columns = parseCSVRow(line);

      if (columns.length < 3) {
        errors.push(`行 ${i + 1}: 列数が不足しています`);
        continue;
      }

      const date = parseDate(columns[0]);
      const depositor = columns[1].trim();
      const amount = parseAmount(columns[2]);

      if (!date) {
        errors.push(`行 ${i + 1}: 日付の形式が不正です`);
        continue;
      }

      if (!depositor) {
        errors.push(`行 ${i + 1}: 振込人名がありません`);
        continue;
      }

      if (isNaN(amount) || amount <= 0) {
        errors.push(`行 ${i + 1}: 金額が不正です`);
        continue;
      }

      transactions.push({
        transactionDate: date,
        depositorName: depositor,
        amount,
        bankName: columns[3]?.trim() || undefined,
        branchName: columns[4]?.trim() || undefined,
        referenceNumber: columns[5]?.trim() || undefined,
      });
    } catch (error) {
      errors.push(`行 ${i + 1}: ${error instanceof Error ? error.message : '解析エラー'}`);
    }
  }

  return {
    transactions,
    successRows: transactions.length,
    errors,
  };
}

function parseRow(line: string, mapping: ColumnMapping): ParsedBankTransaction | null {
  const columns = parseCSVRow(line);

  const date = parseDate(columns[mapping.dateIndex]);
  const depositor = columns[mapping.depositorIndex]?.trim();
  const amount = parseAmount(columns[mapping.amountIndex]);

  if (!date || !depositor || isNaN(amount) || amount <= 0) {
    return null;
  }

  return {
    transactionDate: date,
    depositorName: depositor,
    depositorNameKana: mapping.depositorKanaIndex !== undefined ? columns[mapping.depositorKanaIndex]?.trim() : undefined,
    amount,
    bankName: mapping.bankIndex !== undefined ? columns[mapping.bankIndex]?.trim() : undefined,
    branchName: mapping.branchIndex !== undefined ? columns[mapping.branchIndex]?.trim() : undefined,
    referenceNumber: mapping.refIndex !== undefined ? columns[mapping.refIndex]?.trim() : undefined,
  };
}

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

function parseDate(value: string | undefined): string | null {
  if (!value) return null;

  const cleaned = value.trim();

  // Try various date formats
  const formats = [
    // YYYY-MM-DD
    /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
    // YYYY/MM/DD
    /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/,
    // DD/MM/YYYY or MM/DD/YYYY (assume Japanese style: YYYY first)
    // Japanese: 年月日
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

function parseAmount(value: string | undefined): number {
  if (!value) return NaN;

  // Remove currency symbols, commas, and spaces
  const cleaned = value
    .replace(/[¥￥円,、\s]/g, '')
    .replace(/^-/, '') // Remove negative sign (we're only tracking deposits)
    .trim();

  return parseInt(cleaned, 10);
}
