-- companiesテーブルにインボイス登録番号カラムを追加
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS invoice_registration_number TEXT;

-- インボイス登録番号の形式コメント（T + 13桁数字）
COMMENT ON COLUMN public.companies.invoice_registration_number IS 'インボイス制度の適格請求書発行事業者登録番号（T + 13桁数字）';

-- invoicesテーブルにもインボイス登録番号を追加（発行時点の番号を保存）
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS invoice_registration_number TEXT;

COMMENT ON COLUMN public.invoices.invoice_registration_number IS '請求書発行時点のインボイス登録番号';