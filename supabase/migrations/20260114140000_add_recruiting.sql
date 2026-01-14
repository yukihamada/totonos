-- Recruiting Module Tables
-- Migration: 20260114140000_add_recruiting

-- Job posting status enum
DO $$ BEGIN
  CREATE TYPE job_posting_status AS ENUM ('draft', 'open', 'closed', 'filled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Employment type enum
DO $$ BEGIN
  CREATE TYPE employment_type AS ENUM ('full_time', 'part_time', 'contract', 'intern', 'freelance');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Candidate status enum
DO $$ BEGIN
  CREATE TYPE candidate_status AS ENUM ('applied', 'screening', 'interview', 'offer', 'hired', 'rejected', 'withdrawn');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Interview status enum
DO $$ BEGIN
  CREATE TYPE interview_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Job Postings table
CREATE TABLE IF NOT EXISTS job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  requirements TEXT,
  benefits TEXT,
  department TEXT,
  location TEXT,
  employment_type employment_type DEFAULT 'full_time',
  salary_min INTEGER,
  salary_max INTEGER,
  salary_currency TEXT DEFAULT 'JPY',
  status job_posting_status DEFAULT 'draft',
  posted_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Candidates table
CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  job_posting_id UUID REFERENCES job_postings(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  resume_url TEXT,
  portfolio_url TEXT,
  linkedin_url TEXT,
  source TEXT, -- how they found us
  status candidate_status DEFAULT 'applied',
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Interviews table
CREATE TABLE IF NOT EXISTS interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  job_posting_id UUID REFERENCES job_postings(id) ON DELETE SET NULL,
  interviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  interviewer_name TEXT,
  interview_type TEXT NOT NULL, -- 一次面接, 技術面接, 最終面接 etc
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  location TEXT, -- オフィス, オンライン, etc
  meeting_url TEXT, -- Zoom/Teams link
  status interview_status DEFAULT 'scheduled',
  feedback TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_job_postings_org ON job_postings(organization_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON job_postings(status);
CREATE INDEX IF NOT EXISTS idx_candidates_org ON candidates(organization_id);
CREATE INDEX IF NOT EXISTS idx_candidates_job ON candidates(job_posting_id);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
CREATE INDEX IF NOT EXISTS idx_interviews_org ON interviews(organization_id);
CREATE INDEX IF NOT EXISTS idx_interviews_candidate ON interviews(candidate_id);
CREATE INDEX IF NOT EXISTS idx_interviews_scheduled ON interviews(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_interviews_interviewer ON interviews(interviewer_id);

-- Enable RLS
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view job postings in their organization"
  ON job_postings FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage job postings in their organization"
  ON job_postings FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'member')
    )
  );

CREATE POLICY "Users can view candidates in their organization"
  ON candidates FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage candidates in their organization"
  ON candidates FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'member')
    )
  );

CREATE POLICY "Users can view interviews in their organization"
  ON interviews FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage interviews in their organization"
  ON interviews FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'member')
    )
  );

-- Function to get recruiting stats
CREATE OR REPLACE FUNCTION get_recruiting_stats(p_organization_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'open_positions', (
      SELECT COUNT(*) FROM job_postings
      WHERE organization_id = p_organization_id AND status = 'open'
    ),
    'total_candidates', (
      SELECT COUNT(*) FROM candidates
      WHERE organization_id = p_organization_id
    ),
    'new_this_week', (
      SELECT COUNT(*) FROM candidates
      WHERE organization_id = p_organization_id
      AND applied_at >= NOW() - INTERVAL '7 days'
    ),
    'interviews_scheduled', (
      SELECT COUNT(*) FROM interviews
      WHERE organization_id = p_organization_id
      AND status = 'scheduled'
      AND scheduled_at >= NOW()
    ),
    'offers_extended', (
      SELECT COUNT(*) FROM candidates
      WHERE organization_id = p_organization_id AND status = 'offer'
    ),
    'hired', (
      SELECT COUNT(*) FROM candidates
      WHERE organization_id = p_organization_id AND status = 'hired'
    ),
    'funnel', (
      SELECT jsonb_agg(jsonb_build_object('stage', stage, 'count', cnt))
      FROM (
        SELECT
          CASE status
            WHEN 'applied' THEN '応募'
            WHEN 'screening' THEN '書類選考'
            WHEN 'interview' THEN '面接中'
            WHEN 'offer' THEN '内定'
            WHEN 'hired' THEN '入社'
            WHEN 'rejected' THEN '不採用'
            WHEN 'withdrawn' THEN '辞退'
          END as stage,
          COUNT(*) as cnt
        FROM candidates
        WHERE organization_id = p_organization_id
        GROUP BY status
        ORDER BY
          CASE status
            WHEN 'applied' THEN 1
            WHEN 'screening' THEN 2
            WHEN 'interview' THEN 3
            WHEN 'offer' THEN 4
            WHEN 'hired' THEN 5
            WHEN 'rejected' THEN 6
            WHEN 'withdrawn' THEN 7
          END
      ) sub
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- Updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_job_postings_updated_at ON job_postings;
CREATE TRIGGER update_job_postings_updated_at
  BEFORE UPDATE ON job_postings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_candidates_updated_at ON candidates;
CREATE TRIGGER update_candidates_updated_at
  BEFORE UPDATE ON candidates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_interviews_updated_at ON interviews;
CREATE TRIGGER update_interviews_updated_at
  BEFORE UPDATE ON interviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
