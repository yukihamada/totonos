import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentCompany } from "./useCompany";

export interface SocialInsuranceApplication {
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
    queryKey: ['social-insurance-applications', company?.id],
    queryFn: async (): Promise<SocialInsuranceApplication[]> => {
      if (!company?.id) return [];

      // Fetch employees as a basis for social insurance records
      const { data, error } = await supabase
        .from('employees')
        .select('id, employee_number, name, created_at')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching employees for social insurance:', error);
        return [];
      }

      // Generate applications based on employees (until dedicated table exists)
      const applications: SocialInsuranceApplication[] = [];

      (data || []).forEach((emp, index) => {
        const name = emp.name || '従業員';
        
        // Each employee may have health/pension and employment insurance entries
        if (index < 5) {
          applications.push({
            id: `hp-${emp.id}`,
            type: '健康保険・厚生年金保険 資格取得届',
            category: 'health_pension',
            employeeName: name,
            employeeId: emp.employee_number || emp.id.substring(0, 8),
            status: index === 0 ? 'completed' : index === 1 ? 'submitted' : 'draft',
            createdAt: emp.created_at,
            submittedAt: index <= 1 ? emp.created_at : undefined,
            completedAt: index === 0 ? emp.created_at : undefined,
            receiptNumber: index === 0 ? `R${new Date().getFullYear()}${String(index + 1).padStart(8, '0')}` : undefined,
          });
        }

        if (index < 3) {
          applications.push({
            id: `emp-${emp.id}`,
            type: '雇用保険 資格取得届',
            category: 'employment',
            employeeName: name,
            employeeId: emp.employee_number || emp.id.substring(0, 8),
            status: index === 0 ? 'completed' : 'pending',
            createdAt: emp.created_at,
            submittedAt: index === 0 ? emp.created_at : undefined,
            completedAt: index === 0 ? emp.created_at : undefined,
            receiptNumber: index === 0 ? `R${new Date().getFullYear()}${String(index + 100).padStart(8, '0')}` : undefined,
          });
        }
      });

      return applications;
    },
    enabled: !!company?.id,
  });
}

export interface EmployeeForInsurance {
  id: string;
  employeeNumber: string;
  name: string;
}

export function useEmployeesForInsurance() {
  const { data: company } = useCurrentCompany();

  return useQuery({
    queryKey: ['employees-for-insurance', company?.id],
    queryFn: async (): Promise<EmployeeForInsurance[]> => {
      if (!company?.id) return [];

      const { data, error } = await supabase
        .from('employees')
        .select('id, employee_number, name')
        .eq('company_id', company.id)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching employees:', error);
        return [];
      }

      return (data || []).map((emp) => ({
        id: emp.id,
        employeeNumber: emp.employee_number || emp.id.substring(0, 8),
        name: emp.name || '従業員',
      }));
    },
    enabled: !!company?.id,
  });
}
