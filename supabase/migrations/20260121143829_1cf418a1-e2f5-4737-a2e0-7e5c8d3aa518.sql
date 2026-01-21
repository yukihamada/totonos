
-- =============================================
-- EMR Phase 2: 全機能テーブル作成
-- =============================================

-- 1. 問診テンプレート
CREATE TABLE public.emr_inquiry_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 問診回答
CREATE TABLE public.emr_inquiry_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.emr_inquiry_templates(id) ON DELETE SET NULL,
  patient_id UUID REFERENCES public.emr_patients(id) ON DELETE CASCADE,
  reception_id UUID REFERENCES public.emr_receptions(id) ON DELETE SET NULL,
  responses JSONB NOT NULL DEFAULT '{}',
  submitted_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. 予約枠設定
CREATE TABLE public.emr_appointment_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  slot_duration INTEGER DEFAULT 30,
  max_appointments INTEGER DEFAULT 1,
  department TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 予約
CREATE TABLE public.emr_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.emr_patients(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  appointment_time TEXT NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  department TEXT,
  doctor_name TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'cancelled', 'completed', 'no_show')),
  notes TEXT,
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. 診療報酬マスタ
CREATE TABLE public.emr_billing_masters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  points INTEGER NOT NULL,
  effective_from DATE,
  effective_to DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, code)
);

-- 会計明細
CREATE TABLE public.emr_billing_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  reception_id UUID REFERENCES public.emr_receptions(id) ON DELETE SET NULL,
  patient_id UUID REFERENCES public.emr_patients(id) ON DELETE CASCADE,
  billing_date DATE NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  total_points INTEGER DEFAULT 0,
  insurance_type TEXT,
  copay_ratio INTEGER DEFAULT 30,
  patient_amount INTEGER DEFAULT 0,
  insurance_amount INTEGER DEFAULT 0,
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'partial')),
  payment_method TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- レセプト
CREATE TABLE public.emr_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  billing_month TEXT NOT NULL,
  patient_id UUID REFERENCES public.emr_patients(id) ON DELETE CASCADE,
  receipt_data JSONB NOT NULL DEFAULT '{}',
  total_points INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'returned', 'approved')),
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. 薬剤マスタ
CREATE TABLE public.emr_medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  yj_code TEXT,
  name TEXT NOT NULL,
  generic_name TEXT,
  unit TEXT,
  dosage_form TEXT,
  is_generic BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 処方箋
CREATE TABLE public.emr_prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  record_id UUID REFERENCES public.emr_medical_records(id) ON DELETE SET NULL,
  patient_id UUID REFERENCES public.emr_patients(id) ON DELETE CASCADE,
  prescription_number TEXT,
  prescription_date DATE NOT NULL,
  medications JSONB NOT NULL DEFAULT '[]',
  pharmacy_notes TEXT,
  issued_at TIMESTAMPTZ,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'issued', 'dispensed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. 訪問診療計画
CREATE TABLE public.emr_home_visit_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.emr_patients(id) ON DELETE CASCADE,
  frequency TEXT,
  preferred_day TEXT,
  preferred_time TEXT,
  address TEXT,
  care_plan TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 訪問診療記録
CREATE TABLE public.emr_home_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.emr_patients(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.emr_home_visit_plans(id) ON DELETE SET NULL,
  visit_date DATE NOT NULL,
  visit_time TEXT,
  visit_type TEXT DEFAULT 'regular' CHECK (visit_type IN ('regular', 'temporary', 'emergency')),
  address TEXT,
  doctor_name TEXT,
  nurse_name TEXT,
  vital_signs JSONB,
  notes TEXT,
  record_id UUID REFERENCES public.emr_medical_records(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. オンライン診療
CREATE TABLE public.emr_telemedicine_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.emr_patients(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 15,
  meeting_url TEXT,
  meeting_id TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'waiting', 'in_progress', 'completed', 'cancelled')),
  doctor_name TEXT,
  notes TEXT,
  record_id UUID REFERENCES public.emr_medical_records(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. 健診コース
CREATE TABLE public.emr_checkup_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  price INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 健診予約
CREATE TABLE public.emr_checkup_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.emr_checkup_courses(id) ON DELETE SET NULL,
  patient_id UUID REFERENCES public.emr_patients(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  appointment_time TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 健診結果
CREATE TABLE public.emr_checkup_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.emr_checkup_appointments(id) ON DELETE SET NULL,
  patient_id UUID REFERENCES public.emr_patients(id) ON DELETE CASCADE,
  checkup_date DATE NOT NULL,
  course_name TEXT,
  results JSONB NOT NULL DEFAULT '[]',
  overall_judgement TEXT,
  doctor_comment TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- RLS Policies
-- =============================================

ALTER TABLE public.emr_inquiry_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emr_inquiry_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emr_appointment_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emr_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emr_billing_masters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emr_billing_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emr_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emr_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emr_prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emr_home_visit_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emr_home_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emr_telemedicine_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emr_checkup_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emr_checkup_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emr_checkup_results ENABLE ROW LEVEL SECURITY;

-- Company member policies for all tables
CREATE POLICY "Company members can manage inquiry templates" ON public.emr_inquiry_templates
  FOR ALL USING (company_id IN (SELECT company_id FROM public.company_members WHERE user_id = auth.uid()));

CREATE POLICY "Company members can manage inquiry responses" ON public.emr_inquiry_responses
  FOR ALL USING (company_id IN (SELECT company_id FROM public.company_members WHERE user_id = auth.uid()));

CREATE POLICY "Company members can manage appointment slots" ON public.emr_appointment_slots
  FOR ALL USING (company_id IN (SELECT company_id FROM public.company_members WHERE user_id = auth.uid()));

CREATE POLICY "Company members can manage appointments" ON public.emr_appointments
  FOR ALL USING (company_id IN (SELECT company_id FROM public.company_members WHERE user_id = auth.uid()));

CREATE POLICY "Company members can manage billing masters" ON public.emr_billing_masters
  FOR ALL USING (company_id IN (SELECT company_id FROM public.company_members WHERE user_id = auth.uid()));

CREATE POLICY "Company members can manage billing details" ON public.emr_billing_details
  FOR ALL USING (company_id IN (SELECT company_id FROM public.company_members WHERE user_id = auth.uid()));

CREATE POLICY "Company members can manage receipts" ON public.emr_receipts
  FOR ALL USING (company_id IN (SELECT company_id FROM public.company_members WHERE user_id = auth.uid()));

CREATE POLICY "Company members can manage medications" ON public.emr_medications
  FOR ALL USING (company_id IN (SELECT company_id FROM public.company_members WHERE user_id = auth.uid()));

CREATE POLICY "Company members can manage prescriptions" ON public.emr_prescriptions
  FOR ALL USING (company_id IN (SELECT company_id FROM public.company_members WHERE user_id = auth.uid()));

CREATE POLICY "Company members can manage home visit plans" ON public.emr_home_visit_plans
  FOR ALL USING (company_id IN (SELECT company_id FROM public.company_members WHERE user_id = auth.uid()));

CREATE POLICY "Company members can manage home visits" ON public.emr_home_visits
  FOR ALL USING (company_id IN (SELECT company_id FROM public.company_members WHERE user_id = auth.uid()));

CREATE POLICY "Company members can manage telemedicine" ON public.emr_telemedicine_sessions
  FOR ALL USING (company_id IN (SELECT company_id FROM public.company_members WHERE user_id = auth.uid()));

CREATE POLICY "Company members can manage checkup courses" ON public.emr_checkup_courses
  FOR ALL USING (company_id IN (SELECT company_id FROM public.company_members WHERE user_id = auth.uid()));

CREATE POLICY "Company members can manage checkup appointments" ON public.emr_checkup_appointments
  FOR ALL USING (company_id IN (SELECT company_id FROM public.company_members WHERE user_id = auth.uid()));

CREATE POLICY "Company members can manage checkup results" ON public.emr_checkup_results
  FOR ALL USING (company_id IN (SELECT company_id FROM public.company_members WHERE user_id = auth.uid()));

-- Indexes for performance
CREATE INDEX idx_emr_appointments_date ON public.emr_appointments(company_id, appointment_date);
CREATE INDEX idx_emr_billing_details_date ON public.emr_billing_details(company_id, billing_date);
CREATE INDEX idx_emr_receipts_month ON public.emr_receipts(company_id, billing_month);
CREATE INDEX idx_emr_prescriptions_patient ON public.emr_prescriptions(patient_id);
CREATE INDEX idx_emr_home_visits_date ON public.emr_home_visits(company_id, visit_date);
CREATE INDEX idx_emr_telemedicine_scheduled ON public.emr_telemedicine_sessions(company_id, scheduled_at);
CREATE INDEX idx_emr_checkup_appointments_date ON public.emr_checkup_appointments(company_id, appointment_date);
