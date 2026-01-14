import { z } from 'zod';

// Common validation patterns
const emailSchema = z.string().email('有効なメールアドレスを入力してください');
const phoneSchema = z.string().regex(/^[\d\-+() ]*$/, '有効な電話番号を入力してください').optional().or(z.literal(''));
const urlSchema = z.string().url('有効なURLを入力してください').optional().or(z.literal(''));
const positiveNumberSchema = z.number().positive('正の数値を入力してください');
const nonNegativeNumberSchema = z.number().min(0, '0以上の数値を入力してください');
const requiredString = z.string().min(1, '必須項目です');
const optionalString = z.string().optional().or(z.literal(''));

// Date validation helpers
const dateSchema = z.string().refine(
  (val) => !val || !isNaN(Date.parse(val)),
  '有効な日付を入力してください'
);

const futureDateSchema = z.string().refine(
  (val) => !val || new Date(val) >= new Date(new Date().setHours(0, 0, 0, 0)),
  '今日以降の日付を入力してください'
);

// Lead form validation
export const leadSchema = z.object({
  company_name: requiredString.max(100, '100文字以内で入力してください'),
  contact_name: optionalString.transform(v => v || null),
  email: z.union([emailSchema, z.literal('')]).transform(v => v || null),
  phone: phoneSchema.transform(v => v || null),
  source: z.enum(['website', 'referral', 'advertisement', 'cold_call', 'event', 'other']),
  status: z.enum(['new', 'contacted', 'qualified', 'converted', 'lost']),
  notes: optionalString.transform(v => v || null),
});

export type LeadFormData = z.infer<typeof leadSchema>;

// Client form validation
export const clientSchema = z.object({
  name: requiredString.max(100, '100文字以内で入力してください'),
  email: z.union([emailSchema, z.literal('')]).optional(),
  phone: phoneSchema,
  address: optionalString,
  contact_person: optionalString,
  notes: optionalString,
});

export type ClientFormData = z.infer<typeof clientSchema>;

// Employee form validation
export const employeeSchema = z.object({
  employee_number: requiredString.max(20, '20文字以内で入力してください'),
  name: requiredString.max(100, '100文字以内で入力してください'),
  email: emailSchema,
  department: optionalString,
  position: optionalString,
  hire_date: dateSchema.optional(),
  phone: phoneSchema,
  status: z.enum(['active', 'inactive', 'on_leave']).default('active'),
});

export type EmployeeFormData = z.infer<typeof employeeSchema>;

// Invoice form validation
export const invoiceItemSchema = z.object({
  description: requiredString,
  quantity: positiveNumberSchema,
  unit_price: nonNegativeNumberSchema,
  tax_rate: nonNegativeNumberSchema.max(100, '100以下の値を入力してください').default(10),
});

export const invoiceSchema = z.object({
  title: requiredString.max(200, '200文字以内で入力してください'),
  client_id: requiredString,
  issue_date: dateSchema,
  due_date: dateSchema,
  items: z.array(invoiceItemSchema).min(1, '少なくとも1つの品目を追加してください'),
  notes: optionalString,
  payment_terms: optionalString,
}).refine(
  (data) => !data.issue_date || !data.due_date || new Date(data.due_date) >= new Date(data.issue_date),
  { message: '支払期日は発行日以降である必要があります', path: ['due_date'] }
);

export type InvoiceFormData = z.infer<typeof invoiceSchema>;

// Contract form validation
export const contractSchema = z.object({
  title: requiredString.max(200, '200文字以内で入力してください'),
  client_id: requiredString,
  contract_type: z.enum(['service', 'nda', 'employment', 'lease', 'other']),
  start_date: dateSchema,
  end_date: dateSchema.optional(),
  value: nonNegativeNumberSchema.optional(),
  description: optionalString,
  terms: optionalString,
}).refine(
  (data) => !data.start_date || !data.end_date || new Date(data.end_date) >= new Date(data.start_date),
  { message: '終了日は開始日以降である必要があります', path: ['end_date'] }
);

export type ContractFormData = z.infer<typeof contractSchema>;

// Project form validation
export const projectSchema = z.object({
  name: requiredString.max(100, '100文字以内で入力してください'),
  description: optionalString,
  client_id: optionalString,
  start_date: dateSchema.optional(),
  end_date: dateSchema.optional(),
  budget: nonNegativeNumberSchema.optional(),
  status: z.enum(['planning', 'active', 'on_hold', 'completed', 'cancelled']).default('planning'),
}).refine(
  (data) => !data.start_date || !data.end_date || new Date(data.end_date) >= new Date(data.start_date),
  { message: '終了日は開始日以降である必要があります', path: ['end_date'] }
);

export type ProjectFormData = z.infer<typeof projectSchema>;

// Expense form validation
export const expenseSchema = z.object({
  title: requiredString.max(200, '200文字以内で入力してください'),
  amount: positiveNumberSchema,
  category: z.enum(['travel', 'meals', 'supplies', 'equipment', 'software', 'other']),
  date: dateSchema,
  receipt_url: urlSchema,
  description: optionalString,
  project_id: optionalString,
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;

// Job posting form validation
export const jobPostingSchema = z.object({
  title: requiredString.max(100, '100文字以内で入力してください'),
  department: requiredString,
  location: requiredString,
  employment_type: z.enum(['full_time', 'part_time', 'contract', 'internship']),
  salary_min: nonNegativeNumberSchema.optional(),
  salary_max: nonNegativeNumberSchema.optional(),
  description: requiredString,
  requirements: optionalString,
  benefits: optionalString,
  status: z.enum(['draft', 'published', 'closed']).default('draft'),
}).refine(
  (data) => !data.salary_min || !data.salary_max || data.salary_max >= data.salary_min,
  { message: '上限は下限以上である必要があります', path: ['salary_max'] }
);

export type JobPostingFormData = z.infer<typeof jobPostingSchema>;

// Candidate form validation
export const candidateSchema = z.object({
  name: requiredString.max(100, '100文字以内で入力してください'),
  email: emailSchema,
  phone: phoneSchema,
  position_applied: requiredString,
  resume_url: urlSchema,
  cover_letter: optionalString,
  source: z.enum(['job_board', 'referral', 'direct', 'agency', 'other']).default('direct'),
  status: z.enum(['new', 'screening', 'interviewing', 'offer', 'hired', 'rejected']).default('new'),
});

export type CandidateFormData = z.infer<typeof candidateSchema>;

// Leave request form validation
export const leaveRequestSchema = z.object({
  leave_type: z.enum(['annual', 'sick', 'personal', 'maternity', 'paternity', 'other']),
  start_date: dateSchema,
  end_date: dateSchema,
  reason: optionalString,
}).refine(
  (data) => new Date(data.end_date) >= new Date(data.start_date),
  { message: '終了日は開始日以降である必要があります', path: ['end_date'] }
);

export type LeaveRequestFormData = z.infer<typeof leaveRequestSchema>;

// Journal entry form validation
export const journalEntryLineSchema = z.object({
  account_id: requiredString,
  debit: nonNegativeNumberSchema.default(0),
  credit: nonNegativeNumberSchema.default(0),
  description: optionalString,
});

export const journalEntrySchema = z.object({
  date: dateSchema,
  description: requiredString,
  lines: z.array(journalEntryLineSchema).min(2, '少なくとも2行必要です'),
}).refine(
  (data) => {
    const totalDebit = data.lines.reduce((sum, line) => sum + (line.debit || 0), 0);
    const totalCredit = data.lines.reduce((sum, line) => sum + (line.credit || 0), 0);
    return Math.abs(totalDebit - totalCredit) < 0.01;
  },
  { message: '借方と貸方の合計が一致する必要があります', path: ['lines'] }
);

export type JournalEntryFormData = z.infer<typeof journalEntrySchema>;

// Organization invitation
export const invitationSchema = z.object({
  email: emailSchema,
  role: z.enum(['admin', 'manager', 'member', 'viewer']),
});

export type InvitationFormData = z.infer<typeof invitationSchema>;

// Profile form validation
export const profileSchema = z.object({
  display_name: optionalString.transform(v => v || null),
  company_name: optionalString.transform(v => v || null),
  company_address: optionalString.transform(v => v || null),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

// Helper function to get error message from zod error
export function getZodErrorMessage(error: z.ZodError): string {
  return error.errors.map(e => e.message).join(', ');
}

// Helper function for form validation
export function validateForm<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}
