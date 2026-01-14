-- インポートジョブ管理テーブル
CREATE TABLE public.import_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  source_service TEXT NOT NULL,
  target_module TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  file_name TEXT,
  total_rows INTEGER DEFAULT 0,
  processed_rows INTEGER DEFAULT 0,
  error_rows INTEGER DEFAULT 0,
  mapping_config JSONB,
  error_summary JSONB,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- インポートエラーログテーブル
CREATE TABLE public.import_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.import_jobs(id) ON DELETE CASCADE,
  row_number INTEGER,
  original_data JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- フィールドマッピングテンプレートテーブル
CREATE TABLE public.import_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  template_name TEXT NOT NULL,
  source_service TEXT NOT NULL,
  target_module TEXT NOT NULL,
  mapping JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLSを有効化
ALTER TABLE public.import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_templates ENABLE ROW LEVEL SECURITY;

-- import_jobs用RLSポリシー
CREATE POLICY "Users can view own import jobs"
  ON public.import_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own import jobs"
  ON public.import_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own import jobs"
  ON public.import_jobs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own import jobs"
  ON public.import_jobs FOR DELETE
  USING (auth.uid() = user_id);

-- import_errors用RLSポリシー
CREATE POLICY "Users can view own import errors"
  ON public.import_errors FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.import_jobs
      WHERE import_jobs.id = import_errors.job_id
      AND import_jobs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create import errors for own jobs"
  ON public.import_errors FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.import_jobs
      WHERE import_jobs.id = import_errors.job_id
      AND import_jobs.user_id = auth.uid()
    )
  );

-- import_templates用RLSポリシー
CREATE POLICY "Users can view own import templates"
  ON public.import_templates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own import templates"
  ON public.import_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own import templates"
  ON public.import_templates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own import templates"
  ON public.import_templates FOR DELETE
  USING (auth.uid() = user_id);

-- updated_atトリガー
CREATE TRIGGER update_import_jobs_updated_at
  BEFORE UPDATE ON public.import_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_import_templates_updated_at
  BEFORE UPDATE ON public.import_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();