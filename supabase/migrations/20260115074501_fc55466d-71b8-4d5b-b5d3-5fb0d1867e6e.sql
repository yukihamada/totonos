-- Tighten access to employee data and remove anonymous read access

-- Ensure RLS is enabled (should already be on)
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Revoke anonymous SELECT on sensitive resources
REVOKE SELECT ON TABLE public.employees FROM anon;
REVOKE SELECT ON TABLE public.employees_safe FROM anon;

-- Ensure authenticated users can still use the safe view
GRANT SELECT ON TABLE public.employees_safe TO authenticated;

-- Recreate employees RLS policies so they apply ONLY to authenticated users (not PUBLIC/anon)
DO $$
BEGIN
  -- Drop existing policies (if present)
  EXECUTE 'DROP POLICY IF EXISTS "Users can view their own employees" ON public.employees';
  EXECUTE 'DROP POLICY IF EXISTS "Users can insert their own employees" ON public.employees';
  EXECUTE 'DROP POLICY IF EXISTS "Users can update their own employees" ON public.employees';
  EXECUTE 'DROP POLICY IF EXISTS "Users can delete their own employees" ON public.employees';

  EXECUTE 'DROP POLICY IF EXISTS "HR and admins can view company employees" ON public.employees';
  EXECUTE 'DROP POLICY IF EXISTS "HR and admins can insert company employees" ON public.employees';
  EXECUTE 'DROP POLICY IF EXISTS "HR and admins can update company employees" ON public.employees';
  EXECUTE 'DROP POLICY IF EXISTS "HR and admins can delete company employees" ON public.employees';
END $$;

-- User-scoped access (single-tenant / owner use-case)
CREATE POLICY "Users can view their own employees"
ON public.employees
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own employees"
ON public.employees
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own employees"
ON public.employees
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own employees"
ON public.employees
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Company-scoped HR/admin access (multi-company use-case)
CREATE POLICY "HR and admins can view company employees"
ON public.employees
FOR SELECT
TO authenticated
USING (
  company_id IN (
    SELECT cm.company_id
    FROM public.company_members cm
    LEFT JOIN public.member_permissions mp ON mp.member_id = cm.id
    WHERE cm.user_id = auth.uid()
      AND cm.is_active = true
      AND (
        cm.role = ANY (ARRAY['owner'::public.member_role, 'admin'::public.member_role])
        OR mp.permission = ANY (ARRAY[
          'admin'::public.permission_type,
          'hr_view'::public.permission_type,
          'hr_edit'::public.permission_type,
          'hr_payroll'::public.permission_type
        ])
      )
  )
);

CREATE POLICY "HR and admins can insert company employees"
ON public.employees
FOR INSERT
TO authenticated
WITH CHECK (
  company_id IN (
    SELECT cm.company_id
    FROM public.company_members cm
    LEFT JOIN public.member_permissions mp ON mp.member_id = cm.id
    WHERE cm.user_id = auth.uid()
      AND cm.is_active = true
      AND (
        cm.role = ANY (ARRAY['owner'::public.member_role, 'admin'::public.member_role])
        OR mp.permission = ANY (ARRAY[
          'admin'::public.permission_type,
          'hr_create'::public.permission_type
        ])
      )
  )
);

CREATE POLICY "HR and admins can update company employees"
ON public.employees
FOR UPDATE
TO authenticated
USING (
  company_id IN (
    SELECT cm.company_id
    FROM public.company_members cm
    LEFT JOIN public.member_permissions mp ON mp.member_id = cm.id
    WHERE cm.user_id = auth.uid()
      AND cm.is_active = true
      AND (
        cm.role = ANY (ARRAY['owner'::public.member_role, 'admin'::public.member_role])
        OR mp.permission = ANY (ARRAY[
          'admin'::public.permission_type,
          'hr_edit'::public.permission_type
        ])
      )
  )
);

CREATE POLICY "HR and admins can delete company employees"
ON public.employees
FOR DELETE
TO authenticated
USING (
  company_id IN (
    SELECT cm.company_id
    FROM public.company_members cm
    LEFT JOIN public.member_permissions mp ON mp.member_id = cm.id
    WHERE cm.user_id = auth.uid()
      AND cm.is_active = true
      AND (
        cm.role = ANY (ARRAY['owner'::public.member_role, 'admin'::public.member_role])
        OR mp.permission = ANY (ARRAY[
          'admin'::public.permission_type,
          'hr_delete'::public.permission_type
        ])
      )
  )
);
