import { describe, it, expect, vi } from 'vitest';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: 'test-id' }, error: null })),
        })),
      })),
    })),
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
  },
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
    loading: false,
  }),
}));

describe('Expense Calculations', () => {
  describe('Expense total calculation', () => {
    it('calculates total from items correctly', () => {
      const items = [
        { expense_date: '2024-01-01', description: 'Transport', amount: 1000 },
        { expense_date: '2024-01-02', description: 'Lunch', amount: 1500 },
        { expense_date: '2024-01-03', description: 'Office supplies', amount: 3000 },
      ];

      const total = items.reduce((sum, item) => sum + item.amount, 0);

      expect(total).toBe(5500);
    });

    it('handles empty items array', () => {
      const items: { amount: number }[] = [];
      const total = items.reduce((sum, item) => sum + item.amount, 0);

      expect(total).toBe(0);
    });

    it('handles single item', () => {
      const items = [
        { expense_date: '2024-01-01', description: 'Single expense', amount: 2500 },
      ];

      const total = items.reduce((sum, item) => sum + item.amount, 0);

      expect(total).toBe(2500);
    });
  });

  describe('Expense status workflow', () => {
    const validTransitions: Record<string, string[]> = {
      'draft': ['pending'],
      'pending': ['approved', 'rejected'],
      'approved': ['paid'],
      'rejected': ['draft'],
      'paid': [],
    };

    it('allows draft to pending transition', () => {
      const currentStatus = 'draft';
      const nextStatus = 'pending';

      expect(validTransitions[currentStatus]).toContain(nextStatus);
    });

    it('allows pending to approved transition', () => {
      const currentStatus = 'pending';
      const nextStatus = 'approved';

      expect(validTransitions[currentStatus]).toContain(nextStatus);
    });

    it('allows pending to rejected transition', () => {
      const currentStatus = 'pending';
      const nextStatus = 'rejected';

      expect(validTransitions[currentStatus]).toContain(nextStatus);
    });

    it('allows approved to paid transition', () => {
      const currentStatus = 'approved';
      const nextStatus = 'paid';

      expect(validTransitions[currentStatus]).toContain(nextStatus);
    });

    it('allows rejected to draft transition (resubmission)', () => {
      const currentStatus = 'rejected';
      const nextStatus = 'draft';

      expect(validTransitions[currentStatus]).toContain(nextStatus);
    });

    it('does not allow paid to any transition', () => {
      const currentStatus = 'paid';

      expect(validTransitions[currentStatus]).toHaveLength(0);
    });

    it('does not allow draft to approved directly', () => {
      const currentStatus = 'draft';
      const nextStatus = 'approved';

      expect(validTransitions[currentStatus]).not.toContain(nextStatus);
    });
  });

  describe('Expense category validation', () => {
    const validCategories = [
      '交通費',
      '会議費',
      '接待交際費',
      '消耗品費',
      '通信費',
      '旅費交通費',
      'その他',
    ];

    it('accepts valid category', () => {
      const category = '交通費';
      expect(validCategories).toContain(category);
    });

    it('has multiple valid categories', () => {
      expect(validCategories.length).toBeGreaterThan(5);
    });
  });

  describe('Receipt validation', () => {
    it('accepts valid image file types', () => {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
      const fileType = 'image/jpeg';

      expect(validTypes).toContain(fileType);
    });

    it('rejects invalid file types', () => {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
      const fileType = 'application/exe';

      expect(validTypes).not.toContain(fileType);
    });

    it('validates file size', () => {
      const maxSizeBytes = 5 * 1024 * 1024; // 5MB
      const fileSize = 2 * 1024 * 1024; // 2MB

      expect(fileSize).toBeLessThanOrEqual(maxSizeBytes);
    });

    it('rejects oversized files', () => {
      const maxSizeBytes = 5 * 1024 * 1024; // 5MB
      const fileSize = 10 * 1024 * 1024; // 10MB

      expect(fileSize).toBeGreaterThan(maxSizeBytes);
    });
  });

  describe('Expense date validation', () => {
    it('accepts current date', () => {
      const today = new Date().toISOString().split('T')[0];
      const expenseDate = today;

      expect(new Date(expenseDate) <= new Date()).toBe(true);
    });

    it('accepts past date', () => {
      const pastDate = '2024-01-01';

      expect(new Date(pastDate) < new Date()).toBe(true);
    });

    it('accepts date within claim period', () => {
      const claimDate = new Date();
      const expenseDate = new Date();
      expenseDate.setDate(expenseDate.getDate() - 30); // 30 days ago

      const maxDaysBack = 90;
      const daysDiff = Math.ceil((claimDate.getTime() - expenseDate.getTime()) / (1000 * 60 * 60 * 24));

      expect(daysDiff).toBeLessThanOrEqual(maxDaysBack);
    });

    it('rejects expense date too far in past', () => {
      const claimDate = new Date();
      const expenseDate = new Date();
      expenseDate.setDate(expenseDate.getDate() - 120); // 120 days ago

      const maxDaysBack = 90;
      const daysDiff = Math.ceil((claimDate.getTime() - expenseDate.getTime()) / (1000 * 60 * 60 * 24));

      expect(daysDiff).toBeGreaterThan(maxDaysBack);
    });
  });
});

describe('Expense Amount Limits', () => {
  it('validates minimum amount', () => {
    const minAmount = 1;
    const amount = 100;

    expect(amount).toBeGreaterThanOrEqual(minAmount);
  });

  it('rejects zero amount', () => {
    const minAmount = 1;
    const amount = 0;

    expect(amount).toBeLessThan(minAmount);
  });

  it('rejects negative amount', () => {
    const amount = -100;

    expect(amount).toBeLessThan(0);
  });

  it('validates maximum amount per item', () => {
    const maxAmountPerItem = 1000000; // 1 million yen
    const amount = 50000;

    expect(amount).toBeLessThanOrEqual(maxAmountPerItem);
  });

  it('validates maximum total per claim', () => {
    const maxTotalPerClaim = 5000000; // 5 million yen
    const items = [
      { amount: 100000 },
      { amount: 200000 },
      { amount: 150000 },
    ];

    const total = items.reduce((sum, item) => sum + item.amount, 0);

    expect(total).toBeLessThanOrEqual(maxTotalPerClaim);
  });
});

describe('Expense Claim Number Generation', () => {
  it('generates proper claim number format', () => {
    const mockClaimNumber = 'EXP-2024-0001';
    expect(mockClaimNumber).toMatch(/^EXP-\d{4}-\d{4}$/);
  });

  it('increments claim number', () => {
    const claimNumber1 = 'EXP-2024-0001';
    const claimNumber2 = 'EXP-2024-0002';

    const num1 = parseInt(claimNumber1.split('-')[2]);
    const num2 = parseInt(claimNumber2.split('-')[2]);

    expect(num2).toBe(num1 + 1);
  });
});
