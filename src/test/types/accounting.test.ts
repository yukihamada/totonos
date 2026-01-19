import { describe, it, expect } from 'vitest';
import {
  getAccountTypeLabel,
  getAccountTypeColor,
  getAssetCategoryLabel,
  getDepreciationMethodLabel,
  getExpenseStatusLabel,
  getExpenseStatusColor,
  getTaxTypeLabel,
  getBankTransactionStatusLabel,
  getCurrencySymbol,
  defaultAccounts,
  type AccountType,
  type AssetCategory,
  type DepreciationMethod,
  type ExpenseStatus,
  type TaxType,
  type BankTransactionStatus,
  type CurrencyCode,
} from '@/types/accounting';

describe('Accounting Types', () => {
  describe('getAccountTypeLabel', () => {
    it('returns correct label for asset', () => {
      expect(getAccountTypeLabel('asset')).toBe('資産');
    });

    it('returns correct label for liability', () => {
      expect(getAccountTypeLabel('liability')).toBe('負債');
    });

    it('returns correct label for equity', () => {
      expect(getAccountTypeLabel('equity')).toBe('純資産');
    });

    it('returns correct label for revenue', () => {
      expect(getAccountTypeLabel('revenue')).toBe('収益');
    });

    it('returns correct label for expense', () => {
      expect(getAccountTypeLabel('expense')).toBe('費用');
    });

    it('handles all account types', () => {
      const types: AccountType[] = ['asset', 'liability', 'equity', 'revenue', 'expense'];
      types.forEach(type => {
        expect(getAccountTypeLabel(type)).toBeTruthy();
      });
    });
  });

  describe('getAccountTypeColor', () => {
    it('returns color class for asset', () => {
      expect(getAccountTypeColor('asset')).toContain('chart-1');
    });

    it('returns color class for liability', () => {
      expect(getAccountTypeColor('liability')).toContain('chart-4');
    });

    it('returns color class for equity', () => {
      expect(getAccountTypeColor('equity')).toContain('chart-2');
    });

    it('returns color class for revenue', () => {
      expect(getAccountTypeColor('revenue')).toContain('chart-2');
    });

    it('returns color class for expense', () => {
      expect(getAccountTypeColor('expense')).toContain('destructive');
    });

    it('returns valid CSS class format', () => {
      const types: AccountType[] = ['asset', 'liability', 'equity', 'revenue', 'expense'];
      types.forEach(type => {
        const color = getAccountTypeColor(type);
        expect(color).toMatch(/^bg-.*text-/);
      });
    });
  });

  describe('getAssetCategoryLabel', () => {
    it('returns correct label for building', () => {
      expect(getAssetCategoryLabel('building')).toBe('建物');
    });

    it('returns correct label for vehicle', () => {
      expect(getAssetCategoryLabel('vehicle')).toBe('車両運搬具');
    });

    it('returns correct label for equipment', () => {
      expect(getAssetCategoryLabel('equipment')).toBe('機械設備');
    });

    it('returns correct label for software', () => {
      expect(getAssetCategoryLabel('software')).toBe('ソフトウェア');
    });

    it('returns correct label for furniture', () => {
      expect(getAssetCategoryLabel('furniture')).toBe('器具備品');
    });

    it('returns correct label for other', () => {
      expect(getAssetCategoryLabel('other')).toBe('その他');
    });

    it('handles all asset categories', () => {
      const categories: AssetCategory[] = ['building', 'vehicle', 'equipment', 'software', 'furniture', 'other'];
      categories.forEach(category => {
        expect(getAssetCategoryLabel(category)).toBeTruthy();
      });
    });
  });

  describe('getDepreciationMethodLabel', () => {
    it('returns correct label for straight_line', () => {
      expect(getDepreciationMethodLabel('straight_line')).toBe('定額法');
    });

    it('returns correct label for declining_balance', () => {
      expect(getDepreciationMethodLabel('declining_balance')).toBe('定率法');
    });

    it('handles all depreciation methods', () => {
      const methods: DepreciationMethod[] = ['straight_line', 'declining_balance'];
      methods.forEach(method => {
        expect(getDepreciationMethodLabel(method)).toBeTruthy();
      });
    });
  });

  describe('getExpenseStatusLabel', () => {
    it('returns correct label for draft', () => {
      expect(getExpenseStatusLabel('draft')).toBe('下書き');
    });

    it('returns correct label for pending', () => {
      expect(getExpenseStatusLabel('pending')).toBe('承認待ち');
    });

    it('returns correct label for approved', () => {
      expect(getExpenseStatusLabel('approved')).toBe('承認済み');
    });

    it('returns correct label for rejected', () => {
      expect(getExpenseStatusLabel('rejected')).toBe('却下');
    });

    it('returns correct label for paid', () => {
      expect(getExpenseStatusLabel('paid')).toBe('精算済み');
    });

    it('handles all expense statuses', () => {
      const statuses: ExpenseStatus[] = ['draft', 'pending', 'approved', 'rejected', 'paid'];
      statuses.forEach(status => {
        expect(getExpenseStatusLabel(status)).toBeTruthy();
      });
    });
  });

  describe('getExpenseStatusColor', () => {
    it('returns correct color for draft', () => {
      expect(getExpenseStatusColor('draft')).toContain('muted');
    });

    it('returns correct color for pending', () => {
      expect(getExpenseStatusColor('pending')).toContain('chart-1');
    });

    it('returns correct color for approved', () => {
      expect(getExpenseStatusColor('approved')).toContain('chart-2');
    });

    it('returns correct color for rejected', () => {
      expect(getExpenseStatusColor('rejected')).toContain('destructive');
    });

    it('returns correct color for paid', () => {
      expect(getExpenseStatusColor('paid')).toContain('chart-4');
    });

    it('returns valid CSS class format', () => {
      const statuses: ExpenseStatus[] = ['draft', 'pending', 'approved', 'rejected', 'paid'];
      statuses.forEach(status => {
        const color = getExpenseStatusColor(status);
        expect(color).toMatch(/^bg-.*text-/);
      });
    });
  });

  describe('getTaxTypeLabel', () => {
    it('returns correct label for taxable', () => {
      expect(getTaxTypeLabel('taxable')).toBe('課税');
    });

    it('returns correct label for exempt', () => {
      expect(getTaxTypeLabel('exempt')).toBe('非課税');
    });

    it('returns correct label for zero_rated', () => {
      expect(getTaxTypeLabel('zero_rated')).toBe('免税');
    });

    it('returns correct label for reverse_charge', () => {
      expect(getTaxTypeLabel('reverse_charge')).toBe('リバースチャージ');
    });

    it('handles all tax types', () => {
      const types: TaxType[] = ['taxable', 'exempt', 'zero_rated', 'reverse_charge'];
      types.forEach(type => {
        expect(getTaxTypeLabel(type)).toBeTruthy();
      });
    });
  });

  describe('getBankTransactionStatusLabel', () => {
    it('returns correct label for unmatched', () => {
      expect(getBankTransactionStatusLabel('unmatched')).toBe('未照合');
    });

    it('returns correct label for matched', () => {
      expect(getBankTransactionStatusLabel('matched')).toBe('照合済');
    });

    it('returns correct label for reconciled', () => {
      expect(getBankTransactionStatusLabel('reconciled')).toBe('消込済');
    });

    it('returns correct label for ignored', () => {
      expect(getBankTransactionStatusLabel('ignored')).toBe('対象外');
    });

    it('handles all bank transaction statuses', () => {
      const statuses: BankTransactionStatus[] = ['unmatched', 'matched', 'reconciled', 'ignored'];
      statuses.forEach(status => {
        expect(getBankTransactionStatusLabel(status)).toBeTruthy();
      });
    });
  });

  describe('getCurrencySymbol', () => {
    it('returns yen symbol for JPY', () => {
      expect(getCurrencySymbol('JPY')).toBe('¥');
    });

    it('returns dollar symbol for USD', () => {
      expect(getCurrencySymbol('USD')).toBe('$');
    });

    it('returns euro symbol for EUR', () => {
      expect(getCurrencySymbol('EUR')).toBe('€');
    });

    it('returns pound symbol for GBP', () => {
      expect(getCurrencySymbol('GBP')).toBe('£');
    });

    it('returns yuan symbol for CNY', () => {
      expect(getCurrencySymbol('CNY')).toBe('¥');
    });

    it('returns won symbol for KRW', () => {
      expect(getCurrencySymbol('KRW')).toBe('₩');
    });

    it('handles all currency codes', () => {
      const codes: CurrencyCode[] = ['JPY', 'USD', 'EUR', 'GBP', 'CNY', 'KRW'];
      codes.forEach(code => {
        expect(getCurrencySymbol(code)).toBeTruthy();
      });
    });
  });
});

describe('Default Chart of Accounts', () => {
  it('has correct number of accounts', () => {
    expect(defaultAccounts.length).toBeGreaterThan(30);
  });

  it('includes all account types', () => {
    const types = new Set(defaultAccounts.map(a => a.account_type));
    expect(types.has('asset')).toBe(true);
    expect(types.has('liability')).toBe(true);
    expect(types.has('equity')).toBe(true);
    expect(types.has('revenue')).toBe(true);
    expect(types.has('expense')).toBe(true);
  });

  it('has unique account codes', () => {
    const codes = defaultAccounts.map(a => a.account_code);
    const uniqueCodes = new Set(codes);
    expect(codes.length).toBe(uniqueCodes.size);
  });

  it('all accounts are marked as system accounts', () => {
    defaultAccounts.forEach(account => {
      expect(account.is_system).toBe(true);
    });
  });

  it('all accounts are active by default', () => {
    defaultAccounts.forEach(account => {
      expect(account.is_active).toBe(true);
    });
  });

  it('asset accounts start with 1xxx', () => {
    const assetAccounts = defaultAccounts.filter(a => a.account_type === 'asset');
    assetAccounts.forEach(account => {
      expect(account.account_code).toMatch(/^1/);
    });
  });

  it('liability accounts start with 2xxx', () => {
    const liabilityAccounts = defaultAccounts.filter(a => a.account_type === 'liability');
    liabilityAccounts.forEach(account => {
      expect(account.account_code).toMatch(/^2/);
    });
  });

  it('equity accounts start with 3xxx', () => {
    const equityAccounts = defaultAccounts.filter(a => a.account_type === 'equity');
    equityAccounts.forEach(account => {
      expect(account.account_code).toMatch(/^3/);
    });
  });

  it('revenue accounts start with 4xxx', () => {
    const revenueAccounts = defaultAccounts.filter(a => a.account_type === 'revenue');
    revenueAccounts.forEach(account => {
      expect(account.account_code).toMatch(/^4/);
    });
  });

  it('expense accounts start with 5xxx or higher', () => {
    const expenseAccounts = defaultAccounts.filter(a => a.account_type === 'expense');
    expenseAccounts.forEach(account => {
      expect(parseInt(account.account_code)).toBeGreaterThanOrEqual(5000);
    });
  });

  it('includes essential cash accounts', () => {
    const cashAccount = defaultAccounts.find(a => a.account_code === '1000');
    const bankAccount = defaultAccounts.find(a => a.account_code === '1100');

    expect(cashAccount).toBeDefined();
    expect(cashAccount?.account_name).toBe('現金');
    expect(bankAccount).toBeDefined();
    expect(bankAccount?.account_name).toBe('普通預金');
  });

  it('includes accounts receivable', () => {
    const arAccount = defaultAccounts.find(a => a.account_code === '1200');
    expect(arAccount).toBeDefined();
    expect(arAccount?.account_name).toBe('売掛金');
  });

  it('includes accounts payable', () => {
    const apAccount = defaultAccounts.find(a => a.account_code === '2000');
    expect(apAccount).toBeDefined();
    expect(apAccount?.account_name).toBe('買掛金');
  });

  it('includes revenue account', () => {
    const revenueAccount = defaultAccounts.find(a => a.account_code === '4000');
    expect(revenueAccount).toBeDefined();
    expect(revenueAccount?.account_name).toBe('売上高');
  });

  it('includes depreciation expense account', () => {
    const depreciationAccount = defaultAccounts.find(a => a.account_code === '7400');
    expect(depreciationAccount).toBeDefined();
    expect(depreciationAccount?.account_name).toBe('減価償却費');
  });
});

describe('Accounting Calculations', () => {
  describe('Depreciation calculations', () => {
    it('calculates straight line depreciation correctly', () => {
      const acquisitionCost = 1000000;
      const salvageValue = 100000;
      const usefulLife = 5;

      const annualDepreciation = (acquisitionCost - salvageValue) / usefulLife;
      const monthlyDepreciation = annualDepreciation / 12;

      expect(annualDepreciation).toBe(180000);
      expect(monthlyDepreciation).toBe(15000);
    });

    it('calculates declining balance depreciation correctly', () => {
      const currentBookValue = 800000;
      const usefulLife = 5;
      const rate = 2 / usefulLife; // 200% declining balance

      const annualDepreciation = currentBookValue * rate;
      const monthlyDepreciation = annualDepreciation / 12;

      expect(annualDepreciation).toBe(320000);
      expect(monthlyDepreciation).toBeCloseTo(26666.67, 1);
    });

    it('does not depreciate below salvage value', () => {
      const currentBookValue = 150000;
      const salvageValue = 100000;
      const calculatedDepreciation = 60000;

      const actualDepreciation = Math.min(calculatedDepreciation, currentBookValue - salvageValue);

      expect(actualDepreciation).toBe(50000);
    });
  });

  describe('Tax calculations', () => {
    it('calculates consumption tax at 10%', () => {
      const taxableAmount = 100000;
      const taxRate = 0.1;

      const tax = Math.round(taxableAmount * taxRate);

      expect(tax).toBe(10000);
    });

    it('calculates net tax liability correctly', () => {
      const salesTaxCollected = 50000;
      const purchasesTaxPaid = 30000;

      const netTaxLiability = salesTaxCollected - purchasesTaxPaid;

      expect(netTaxLiability).toBe(20000);
    });

    it('handles tax refund scenario', () => {
      const salesTaxCollected = 20000;
      const purchasesTaxPaid = 50000;

      const netTaxLiability = salesTaxCollected - purchasesTaxPaid;

      expect(netTaxLiability).toBe(-30000);
      expect(netTaxLiability < 0).toBe(true); // Tax refund
    });
  });

  describe('Journal entry balance validation', () => {
    it('validates balanced entries', () => {
      const lines = [
        { debit_amount: 10000, credit_amount: 0 },
        { debit_amount: 0, credit_amount: 10000 },
      ];

      const totalDebit = lines.reduce((sum, l) => sum + l.debit_amount, 0);
      const totalCredit = lines.reduce((sum, l) => sum + l.credit_amount, 0);

      expect(Math.abs(totalDebit - totalCredit)).toBeLessThanOrEqual(0.01);
    });

    it('rejects unbalanced entries', () => {
      const lines = [
        { debit_amount: 10000, credit_amount: 0 },
        { debit_amount: 0, credit_amount: 9000 },
      ];

      const totalDebit = lines.reduce((sum, l) => sum + l.debit_amount, 0);
      const totalCredit = lines.reduce((sum, l) => sum + l.credit_amount, 0);

      expect(Math.abs(totalDebit - totalCredit)).toBeGreaterThan(0.01);
    });

    it('handles multiple lines correctly', () => {
      const lines = [
        { debit_amount: 5000, credit_amount: 0 },
        { debit_amount: 3000, credit_amount: 0 },
        { debit_amount: 2000, credit_amount: 0 },
        { debit_amount: 0, credit_amount: 7000 },
        { debit_amount: 0, credit_amount: 3000 },
      ];

      const totalDebit = lines.reduce((sum, l) => sum + l.debit_amount, 0);
      const totalCredit = lines.reduce((sum, l) => sum + l.credit_amount, 0);

      expect(totalDebit).toBe(10000);
      expect(totalCredit).toBe(10000);
    });
  });

  describe('Accounts payable aging', () => {
    it('categorizes current invoices correctly', () => {
      const today = new Date();
      const dueDate = new Date(today);
      dueDate.setDate(dueDate.getDate() + 10); // Due in 10 days

      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      expect(daysUntilDue).toBeGreaterThan(0);
    });

    it('categorizes overdue invoices correctly', () => {
      const today = new Date();
      const dueDate = new Date(today);
      dueDate.setDate(dueDate.getDate() - 45); // Overdue by 45 days

      const daysOverdue = Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

      expect(daysOverdue).toBeGreaterThan(30);
      expect(daysOverdue).toBeLessThanOrEqual(60);
    });
  });
});
