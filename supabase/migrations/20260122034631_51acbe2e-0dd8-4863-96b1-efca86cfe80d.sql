-- LMSテスト・試験テーブル
CREATE TABLE public.lms_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.lms_courses(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  time_limit_minutes INTEGER,
  pass_score INTEGER DEFAULT 60,
  max_attempts INTEGER DEFAULT 3,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- LMS問題テーブル
CREATE TABLE public.lms_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES public.lms_tests(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('single_choice', 'multiple_choice', 'text')),
  options JSONB,
  correct_answer JSONB NOT NULL,
  points INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  explanation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- LMS受験結果テーブル
CREATE TABLE public.lms_test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES public.lms_tests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  score INTEGER,
  max_score INTEGER,
  passed BOOLEAN,
  answers JSONB,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  attempt_number INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- インデックス作成
CREATE INDEX idx_lms_tests_company_id ON public.lms_tests(company_id);
CREATE INDEX idx_lms_tests_course_id ON public.lms_tests(course_id);
CREATE INDEX idx_lms_questions_test_id ON public.lms_questions(test_id);
CREATE INDEX idx_lms_test_results_test_id ON public.lms_test_results(test_id);
CREATE INDEX idx_lms_test_results_user_id ON public.lms_test_results(user_id);
CREATE INDEX idx_lms_test_results_company_id ON public.lms_test_results(company_id);

-- RLS有効化
ALTER TABLE public.lms_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_test_results ENABLE ROW LEVEL SECURITY;

-- lms_tests ポリシー
CREATE POLICY "Company members can view tests" ON public.lms_tests
  FOR SELECT USING (public.is_company_member(auth.uid(), company_id));

CREATE POLICY "Company admins can insert tests" ON public.lms_tests
  FOR INSERT WITH CHECK (public.is_company_admin(auth.uid(), company_id));

CREATE POLICY "Company admins can update tests" ON public.lms_tests
  FOR UPDATE USING (public.is_company_admin(auth.uid(), company_id));

CREATE POLICY "Company admins can delete tests" ON public.lms_tests
  FOR DELETE USING (public.is_company_admin(auth.uid(), company_id));

-- lms_questions ポリシー
CREATE POLICY "Company members can view questions" ON public.lms_questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.lms_tests t
      WHERE t.id = test_id AND public.is_company_member(auth.uid(), t.company_id)
    )
  );

CREATE POLICY "Company admins can insert questions" ON public.lms_questions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.lms_tests t
      WHERE t.id = test_id AND public.is_company_admin(auth.uid(), t.company_id)
    )
  );

CREATE POLICY "Company admins can update questions" ON public.lms_questions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.lms_tests t
      WHERE t.id = test_id AND public.is_company_admin(auth.uid(), t.company_id)
    )
  );

CREATE POLICY "Company admins can delete questions" ON public.lms_questions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.lms_tests t
      WHERE t.id = test_id AND public.is_company_admin(auth.uid(), t.company_id)
    )
  );

-- lms_test_results ポリシー
CREATE POLICY "Users can view own results" ON public.lms_test_results
  FOR SELECT USING (auth.uid() = user_id OR public.is_company_admin(auth.uid(), company_id));

CREATE POLICY "Users can insert own results" ON public.lms_test_results
  FOR INSERT WITH CHECK (auth.uid() = user_id AND public.is_company_member(auth.uid(), company_id));

CREATE POLICY "Users can update own results" ON public.lms_test_results
  FOR UPDATE USING (auth.uid() = user_id);

-- updated_atトリガー
CREATE TRIGGER update_lms_tests_updated_at
  BEFORE UPDATE ON public.lms_tests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();