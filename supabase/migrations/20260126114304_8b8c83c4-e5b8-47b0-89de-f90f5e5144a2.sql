-- ========================================
-- 1. 仮払いテーブル作成
-- ========================================
CREATE TABLE public.advance_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  purpose TEXT NOT NULL,
  requested_amount INTEGER NOT NULL,
  approved_amount INTEGER,
  settled_amount INTEGER,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'settled', 'rejected', 'overdue')),
  request_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_date DATE NOT NULL,
  settle_date DATE,
  reason TEXT,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.advance_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view company advance payments"
ON public.advance_payments FOR SELECT TO authenticated
USING (public.is_company_member(auth.uid(), company_id));

CREATE POLICY "Users can create advance payments"
ON public.advance_payments FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND public.is_company_member(auth.uid(), company_id));

CREATE POLICY "Users can update own pending advance payments"
ON public.advance_payments FOR UPDATE TO authenticated
USING (
  (auth.uid() = user_id AND status = 'pending') OR 
  public.is_company_admin(auth.uid(), company_id)
);

CREATE POLICY "Admins can delete advance payments"
ON public.advance_payments FOR DELETE TO authenticated
USING (public.is_company_admin(auth.uid(), company_id));

-- Indexes
CREATE INDEX idx_advance_payments_company_id ON public.advance_payments(company_id);
CREATE INDEX idx_advance_payments_user_id ON public.advance_payments(user_id);
CREATE INDEX idx_advance_payments_status ON public.advance_payments(status);

-- Trigger for updated_at
CREATE TRIGGER update_advance_payments_updated_at
BEFORE UPDATE ON public.advance_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ========================================
-- 2. 招待テーブルに名前カラム追加
-- ========================================
ALTER TABLE public.company_invitations
ADD COLUMN IF NOT EXISTS invitee_name TEXT;