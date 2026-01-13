// HR Types

export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'intern';
export type EmployeeStatus = 'active' | 'on_leave' | 'resigned';
export type AttendanceStatus = 'present' | 'absent' | 'paid_leave' | 'sick_leave' | 'remote' | 'half_day';
export type PayrollStatus = 'draft' | 'calculated' | 'approved' | 'paid';
export type YearEndStatus = 'pending' | 'submitted' | 'completed';

export interface Employee {
  id: string;
  user_id: string;
  employee_number: string;
  name: string;
  name_kana?: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  hire_date: string;
  resignation_date?: string;
  employment_type: EmploymentType;
  department?: string;
  position?: string;
  base_salary: number;
  bank_name?: string;
  bank_branch?: string;
  bank_account_type?: string;
  bank_account_number?: string;
  social_insurance_number?: string;
  status: EmployeeStatus;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  work_date: string;
  clock_in?: string;
  clock_out?: string;
  break_start?: string;
  break_end?: string;
  work_hours: number;
  overtime_hours: number;
  status: AttendanceStatus;
  note?: string;
  created_at: string;
  updated_at: string;
  employee?: Employee;
}

export interface PaidLeaveBalance {
  id: string;
  employee_id: string;
  fiscal_year: number;
  granted_days: number;
  used_days: number;
  remaining_days: number;
  expires_at?: string;
  created_at: string;
}

export interface PayrollRecord {
  id: string;
  employee_id: string;
  pay_period_start: string;
  pay_period_end: string;
  payment_date: string;
  base_salary: number;
  overtime_pay: number;
  allowances: Record<string, number>;
  deductions: Record<string, number>;
  gross_pay: number;
  net_pay: number;
  status: PayrollStatus;
  journal_entry_id?: string;
  created_at: string;
  updated_at: string;
  employee?: Employee;
}

export interface YearEndAdjustment {
  id: string;
  employee_id: string;
  tax_year: number;
  spouse_deduction: number;
  dependent_count: number;
  life_insurance_deduction: number;
  earthquake_insurance_deduction: number;
  housing_loan_deduction: number;
  calculated_tax: number;
  adjustment_amount: number;
  status: YearEndStatus;
  created_at: string;
  updated_at: string;
  employee?: Employee;
}
