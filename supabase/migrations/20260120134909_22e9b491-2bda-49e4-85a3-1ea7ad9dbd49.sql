-- EMR患者テーブル
CREATE TABLE IF NOT EXISTS public.emr_patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  patient_number TEXT NOT NULL,
  name TEXT NOT NULL,
  name_kana TEXT,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  birth_date DATE,
  phone TEXT,
  email TEXT,
  address TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  blood_type TEXT CHECK (blood_type IN ('A', 'B', 'O', 'AB', 'unknown')),
  allergies TEXT[],
  insurance_type TEXT,
  insurance_number TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (company_id, patient_number)
);

-- EMR受付テーブル
CREATE TABLE IF NOT EXISTS public.emr_receptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES public.emr_patients(id) ON DELETE CASCADE NOT NULL,
  reception_number TEXT NOT NULL,
  reception_date DATE DEFAULT CURRENT_DATE,
  reception_time TIME DEFAULT CURRENT_TIME,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'in_progress', 'completed', 'cancelled')),
  visit_type TEXT DEFAULT 'follow_up' CHECK (visit_type IN ('initial', 'follow_up', 'emergency')),
  chief_complaint TEXT,
  department TEXT,
  assigned_doctor_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- EMRカルテテーブル
CREATE TABLE IF NOT EXISTS public.emr_medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES public.emr_patients(id) ON DELETE CASCADE NOT NULL,
  reception_id UUID REFERENCES public.emr_receptions(id),
  record_number TEXT NOT NULL,
  record_date DATE DEFAULT CURRENT_DATE,
  doctor_name TEXT,
  subjective TEXT,
  objective TEXT,
  assessment TEXT,
  plan TEXT,
  vital_signs JSONB DEFAULT '{}',
  prescriptions JSONB DEFAULT '[]',
  procedures JSONB DEFAULT '[]',
  is_signed BOOLEAN DEFAULT false,
  signed_at TIMESTAMPTZ,
  hpki_signature TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- インデックス作成
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'emr_patients' AND column_name = 'company_id' AND table_schema = 'public') THEN CREATE INDEX IF NOT EXISTS idx_emr_patients_company ON public.emr_patients(company_id); END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'emr_patients' AND column_name = 'patient_number' AND table_schema = 'public') THEN CREATE INDEX IF NOT EXISTS idx_emr_patients_patient_number ON public.emr_patients(patient_number); END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'emr_receptions' AND column_name = 'company_id' AND table_schema = 'public') THEN CREATE INDEX IF NOT EXISTS idx_emr_receptions_company ON public.emr_receptions(company_id); END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'emr_receptions' AND column_name = 'patient_id' AND table_schema = 'public') THEN CREATE INDEX IF NOT EXISTS idx_emr_receptions_patient ON public.emr_receptions(patient_id); END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'emr_receptions' AND column_name = 'reception_date' AND table_schema = 'public') THEN CREATE INDEX IF NOT EXISTS idx_emr_receptions_date ON public.emr_receptions(reception_date); END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'emr_medical_records' AND column_name = 'company_id' AND table_schema = 'public') THEN CREATE INDEX IF NOT EXISTS idx_emr_medical_records_company ON public.emr_medical_records(company_id); END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'emr_medical_records' AND column_name = 'patient_id' AND table_schema = 'public') THEN CREATE INDEX IF NOT EXISTS idx_emr_medical_records_patient ON public.emr_medical_records(patient_id); END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'emr_medical_records' AND column_name = 'record_date' AND table_schema = 'public') THEN CREATE INDEX IF NOT EXISTS idx_emr_medical_records_date ON public.emr_medical_records(record_date); END IF; END $$;

-- RLS有効化
ALTER TABLE public.emr_patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emr_receptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emr_medical_records ENABLE ROW LEVEL SECURITY;

-- 患者テーブルRLSポリシー
CREATE POLICY "Company members can view patients"
ON public.emr_patients FOR SELECT
USING (public.is_company_member(auth.uid(), company_id));

CREATE POLICY "Company members can insert patients"
ON public.emr_patients FOR INSERT
WITH CHECK (public.is_company_member(auth.uid(), company_id));

CREATE POLICY "Company members can update patients"
ON public.emr_patients FOR UPDATE
USING (public.is_company_member(auth.uid(), company_id));

CREATE POLICY "Company admins can delete patients"
ON public.emr_patients FOR DELETE
USING (public.is_company_admin(auth.uid(), company_id));

-- 受付テーブルRLSポリシー
CREATE POLICY "Company members can view receptions"
ON public.emr_receptions FOR SELECT
USING (public.is_company_member(auth.uid(), company_id));

CREATE POLICY "Company members can insert receptions"
ON public.emr_receptions FOR INSERT
WITH CHECK (public.is_company_member(auth.uid(), company_id));

CREATE POLICY "Company members can update receptions"
ON public.emr_receptions FOR UPDATE
USING (public.is_company_member(auth.uid(), company_id));

CREATE POLICY "Company admins can delete receptions"
ON public.emr_receptions FOR DELETE
USING (public.is_company_admin(auth.uid(), company_id));

-- カルテテーブルRLSポリシー
CREATE POLICY "Company members can view records"
ON public.emr_medical_records FOR SELECT
USING (public.is_company_member(auth.uid(), company_id));

CREATE POLICY "Company members can insert records"
ON public.emr_medical_records FOR INSERT
WITH CHECK (public.is_company_member(auth.uid(), company_id));

CREATE POLICY "Company members can update records"
ON public.emr_medical_records FOR UPDATE
USING (public.is_company_member(auth.uid(), company_id) AND is_signed = false);

CREATE POLICY "Company admins can delete records"
ON public.emr_medical_records FOR DELETE
USING (public.is_company_admin(auth.uid(), company_id));

-- 番号生成関数
CREATE OR REPLACE FUNCTION public.generate_emr_patient_number(p_company_id uuid)
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO v_count
  FROM public.emr_patients
  WHERE company_id = p_company_id;
  RETURN 'P-' || LPAD(v_count::TEXT, 6, '0');
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_emr_reception_number(p_company_id uuid)
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_date TEXT;
  v_count INTEGER;
BEGIN
  v_date := to_char(CURRENT_DATE, 'YYYYMMDD');
  SELECT COUNT(*) + 1 INTO v_count
  FROM public.emr_receptions
  WHERE company_id = p_company_id AND reception_date = CURRENT_DATE;
  RETURN 'R-' || v_date || '-' || LPAD(v_count::TEXT, 4, '0');
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_emr_record_number(p_company_id uuid)
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_date TEXT;
  v_count INTEGER;
BEGIN
  v_date := to_char(CURRENT_DATE, 'YYYYMMDD');
  SELECT COUNT(*) + 1 INTO v_count
  FROM public.emr_medical_records
  WHERE company_id = p_company_id AND record_date = CURRENT_DATE;
  RETURN 'MR-' || v_date || '-' || LPAD(v_count::TEXT, 4, '0');
END;
$$;

-- updated_at トリガー
CREATE TRIGGER update_emr_patients_updated_at
BEFORE UPDATE ON public.emr_patients
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_emr_receptions_updated_at
BEFORE UPDATE ON public.emr_receptions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_emr_medical_records_updated_at
BEFORE UPDATE ON public.emr_medical_records
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();