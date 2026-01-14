-- Create a function to auto-add company creator as owner
CREATE OR REPLACE FUNCTION public.handle_new_company()
RETURNS TRIGGER AS $$
BEGIN
  -- Add the creator as the owner of the company
  INSERT INTO public.company_members (company_id, user_id, role, is_active)
  VALUES (NEW.id, NEW.created_by, 'owner', true);
  
  -- Set this company as the user's current company if they don't have one
  INSERT INTO public.user_current_company (user_id, company_id)
  VALUES (NEW.created_by, NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Create company credits with free tier defaults
  INSERT INTO public.company_credits (company_id, plan, monthly_credits, used_this_month, charged_credits)
  VALUES (NEW.id, 'free', 100, 0, 0)
  ON CONFLICT (company_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new company
DROP TRIGGER IF EXISTS on_company_created ON public.companies;
CREATE TRIGGER on_company_created
  AFTER INSERT ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_company();