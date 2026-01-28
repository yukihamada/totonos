import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentCompany } from "@/hooks/useCompany";

export interface Application {
  id: string;
  type: string;
  category: 'health_pension' | 'employment' | 'workers_comp';
  employeeName: string;
  employeeId: string;
  status: 'draft' | 'pending' | 'submitted' | 'completed' | 'rejected';
  createdAt: string;
  submittedAt?: string;
  completedAt?: string;
  receiptNumber?: string;
  note?: string;
}

export function useSocialInsuranceApplications() {
  const { data: company } = useCurrentCompany();

  return useQuery({
    queryKey: ["social-insurance-applications", company?.id],
    queryFn: async (): Promise<Application[]> => {
      if (!company?.id) return [];

      // Fetch employees and generate insurance application records based on hire dates
      const { data: employees, error } = await supabase
        .from("employees")
        .select("id, employee_number, name, hire_date, status, created_at")
        .eq("company_id", company.id)
        .order("hire_date", { ascending: false });

      if (error) throw error;
      if (!employees) return [];

      const applications: Application[] = [];

      employees.forEach((emp, idx) => {
        const fullName = emp.name || '（名前なし）';
        const empNumber = emp.employee_number || `EMP${String(idx + 1).padStart(3, '0')}`;
        const hireDate = emp.hire_date || emp.created_at;
        const isActive = emp.status === 'active';

        // Health/Pension enrollment
        applications.push({
          id: `hp-${emp.id}`,
          type: '健康保険・厚生年金保険 資格取得届',
          category: 'health_pension',
          employeeName: fullName,
          employeeId: empNumber,
          status: isActive ? 'completed' : 'pending',
          createdAt: hireDate,
          submittedAt: isActive ? hireDate : undefined,
          completedAt: isActive ? hireDate : undefined,
          receiptNumber: isActive ? `R${new Date(hireDate).toISOString().slice(0,10).replace(/-/g,'')}${String(idx + 1).padStart(5,'0')}` : undefined,
        });

        // Employment insurance enrollment
        applications.push({
          id: `ei-${emp.id}`,
          type: '雇用保険 資格取得届',
          category: 'employment',
          employeeName: fullName,
          employeeId: empNumber,
          status: isActive ? 'completed' : 'draft',
          createdAt: hireDate,
          submittedAt: isActive ? hireDate : undefined,
          completedAt: isActive ? hireDate : undefined,
          receiptNumber: isActive ? `R${new Date(hireDate).toISOString().slice(0,10).replace(/-/g,'')}${String(idx + 10).padStart(5,'0')}` : undefined,
        });
      });

      return applications;
    },
    enabled: !!company?.id,
  });
}
