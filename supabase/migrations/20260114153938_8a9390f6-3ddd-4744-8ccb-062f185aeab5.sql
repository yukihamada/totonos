-- First add company_id column to employees table
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);

-- Create index for company_id
CREATE INDEX IF NOT EXISTS idx_employees_company_id ON public.employees(company_id);

-- Create new RLS policies for employees table with correct permission names

-- SELECT: HR personnel (hr_view), admins, owners can view employees in their company
CREATE POLICY "HR and admins can view company employees"
ON public.employees
FOR SELECT
USING (
  company_id IN (
    SELECT cm.company_id FROM public.company_members cm
    LEFT JOIN public.member_permissions mp ON mp.member_id = cm.id
    WHERE cm.user_id = auth.uid()
      AND cm.is_active = true
      AND (
        cm.role IN ('owner', 'admin')
        OR mp.permission IN ('admin', 'hr_view', 'hr_edit', 'hr_payroll')
      )
  )
);

-- INSERT: Only HR personnel (hr_create), admins, owners can create employees
CREATE POLICY "HR and admins can insert company employees"
ON public.employees
FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT cm.company_id FROM public.company_members cm
    LEFT JOIN public.member_permissions mp ON mp.member_id = cm.id
    WHERE cm.user_id = auth.uid()
      AND cm.is_active = true
      AND (
        cm.role IN ('owner', 'admin')
        OR mp.permission IN ('admin', 'hr_create')
      )
  )
);

-- UPDATE: Only HR personnel (hr_edit), admins, owners can update employees
CREATE POLICY "HR and admins can update company employees"
ON public.employees
FOR UPDATE
USING (
  company_id IN (
    SELECT cm.company_id FROM public.company_members cm
    LEFT JOIN public.member_permissions mp ON mp.member_id = cm.id
    WHERE cm.user_id = auth.uid()
      AND cm.is_active = true
      AND (
        cm.role IN ('owner', 'admin')
        OR mp.permission IN ('admin', 'hr_edit')
      )
  )
);

-- DELETE: Only HR personnel (hr_delete), admins and owners can delete employees
CREATE POLICY "HR and admins can delete company employees"
ON public.employees
FOR DELETE
USING (
  company_id IN (
    SELECT cm.company_id FROM public.company_members cm
    LEFT JOIN public.member_permissions mp ON mp.member_id = cm.id
    WHERE cm.user_id = auth.uid()
      AND cm.is_active = true
      AND (
        cm.role IN ('owner', 'admin')
        OR mp.permission IN ('admin', 'hr_delete')
      )
  )
);