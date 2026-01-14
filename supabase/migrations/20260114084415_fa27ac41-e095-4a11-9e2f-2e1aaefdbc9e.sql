-- Create trigger to automatically add creator as owner when company is created
CREATE OR REPLACE FUNCTION public.handle_new_company()
RETURNS TRIGGER AS $$
BEGIN
  -- Add creator as owner member
  INSERT INTO public.company_members (company_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'owner');
  
  -- Create company credits with default free plan
  INSERT INTO public.company_credits (company_id)
  VALUES (NEW.id);
  
  -- Set as current company for the user
  INSERT INTO public.user_current_company (user_id, company_id)
  VALUES (NEW.created_by, NEW.id)
  ON CONFLICT (user_id) DO UPDATE SET company_id = EXCLUDED.company_id, updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger
DROP TRIGGER IF EXISTS on_company_created ON public.companies;
CREATE TRIGGER on_company_created
  AFTER INSERT ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_company();