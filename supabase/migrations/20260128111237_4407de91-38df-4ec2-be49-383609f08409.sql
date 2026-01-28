-- 監査ログ記録用の関数を作成
CREATE OR REPLACE FUNCTION public.log_table_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.data_access_audit_log (
    user_id,
    table_name,
    operation,
    record_id,
    query_details,
    created_at
  ) VALUES (
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
    TG_TABLE_NAME,
    TG_OP,
    CASE 
      WHEN TG_OP = 'DELETE' THEN OLD.id 
      ELSE NEW.id 
    END,
    CASE 
      WHEN TG_OP = 'INSERT' THEN to_jsonb(NEW)
      WHEN TG_OP = 'UPDATE' THEN jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
      WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD)
    END,
    now()
  );
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$;

-- invoices テーブル用トリガー
CREATE TRIGGER audit_invoices_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.log_table_change();

-- contracts テーブル用トリガー
CREATE TRIGGER audit_contracts_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.contracts
  FOR EACH ROW
  EXECUTE FUNCTION public.log_table_change();

-- leads テーブル用トリガー
CREATE TRIGGER audit_leads_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.log_table_change();

-- deals テーブル用トリガー
CREATE TRIGGER audit_deals_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.deals
  FOR EACH ROW
  EXECUTE FUNCTION public.log_table_change();

-- clients テーブル用トリガー
CREATE TRIGGER audit_clients_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.log_table_change();

-- estimates テーブル用トリガー
CREATE TRIGGER audit_estimates_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.estimates
  FOR EACH ROW
  EXECUTE FUNCTION public.log_table_change();

-- employees テーブル用トリガー
CREATE TRIGGER audit_employees_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.log_table_change();

-- journal_entries テーブル用トリガー
CREATE TRIGGER audit_journal_entries_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.log_table_change();