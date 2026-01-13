import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Employee, AttendanceRecord, PayrollRecord } from '@/types/hr';

// Employees
export function useEmployees() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['employees', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('user_id', user?.id)
        .order('employee_number');
      
      if (error) throw error;
      return data as Employee[];
    },
    enabled: !!user,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (employee: Omit<Employee, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('employees')
        .insert({ ...employee, user_id: user?.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast({ title: '従業員を登録しました' });
    },
    onError: (error) => {
      toast({ title: 'エラー', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Employee> & { id: string }) => {
      const { data, error } = await supabase
        .from('employees')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast({ title: '従業員情報を更新しました' });
    },
    onError: (error) => {
      toast({ title: 'エラー', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast({ title: '従業員を削除しました' });
    },
    onError: (error) => {
      toast({ title: 'エラー', description: error.message, variant: 'destructive' });
    },
  });
}

// Attendance
export function useAttendanceRecords(employeeId?: string, month?: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['attendance', employeeId, month],
    queryFn: async () => {
      let query = supabase
        .from('attendance_records')
        .select('*, employee:employees(name)')
        .order('work_date', { ascending: false });
      
      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }
      
      if (month) {
        const startDate = `${month}-01`;
        const endDate = `${month}-31`;
        query = query.gte('work_date', startDate).lte('work_date', endDate);
      }
      
      const { data, error } = await query.limit(100);
      
      if (error) throw error;
      return data as AttendanceRecord[];
    },
    enabled: !!user,
  });
}

export function useClockIn() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ employeeId, date }: { employeeId: string; date: string }) => {
      const now = new Date();
      const clockIn = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const { data, error } = await supabase
        .from('attendance_records')
        .upsert({
          employee_id: employeeId,
          work_date: date,
          clock_in: clockIn,
          status: 'present',
        }, { onConflict: 'employee_id,work_date' })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast({ title: '出勤を記録しました' });
    },
    onError: (error) => {
      toast({ title: 'エラー', description: error.message, variant: 'destructive' });
    },
  });
}

export function useClockOut() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ employeeId, date }: { employeeId: string; date: string }) => {
      const now = new Date();
      const clockOut = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      // Get existing record
      const { data: existing } = await supabase
        .from('attendance_records')
        .select('clock_in')
        .eq('employee_id', employeeId)
        .eq('work_date', date)
        .single();
      
      // Calculate work hours
      let workHours = 0;
      if (existing?.clock_in) {
        const [inH, inM] = existing.clock_in.split(':').map(Number);
        const [outH, outM] = clockOut.split(':').map(Number);
        workHours = (outH + outM / 60) - (inH + inM / 60);
        workHours = Math.max(0, workHours - 1); // Subtract 1 hour for lunch
      }
      
      const overtimeHours = Math.max(0, workHours - 8);
      
      const { data, error } = await supabase
        .from('attendance_records')
        .update({
          clock_out: clockOut,
          work_hours: workHours,
          overtime_hours: overtimeHours,
        })
        .eq('employee_id', employeeId)
        .eq('work_date', date)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast({ title: '退勤を記録しました' });
    },
    onError: (error) => {
      toast({ title: 'エラー', description: error.message, variant: 'destructive' });
    },
  });
}

// Payroll
export function usePayrollRecords(month?: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['payroll', month],
    queryFn: async () => {
      let query = supabase
        .from('payroll_records')
        .select('*, employee:employees(name, employee_number)')
        .order('payment_date', { ascending: false });
      
      if (month) {
        query = query.gte('payment_date', `${month}-01`).lte('payment_date', `${month}-31`);
      }
      
      const { data, error } = await query.limit(100);
      
      if (error) throw error;
      return data as PayrollRecord[];
    },
    enabled: !!user,
  });
}

export function useCreatePayroll() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (payroll: Omit<PayrollRecord, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('payroll_records')
        .insert(payroll)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll'] });
      toast({ title: '給与明細を作成しました' });
    },
    onError: (error) => {
      toast({ title: 'エラー', description: error.message, variant: 'destructive' });
    },
  });
}
