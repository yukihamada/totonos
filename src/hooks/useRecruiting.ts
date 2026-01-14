import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';

export type JobPostingStatus = 'draft' | 'open' | 'closed' | 'filled';
export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'intern' | 'freelance';
export type CandidateStatus = 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected' | 'withdrawn';
export type InterviewStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show';

export interface JobPosting {
  id: string;
  title: string;
  description?: string;
  requirements?: string;
  benefits?: string;
  department?: string;
  location?: string;
  employmentType: EmploymentType;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  status: JobPostingStatus;
  postedAt?: string;
  closedAt?: string;
  applicantsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Candidate {
  id: string;
  jobPostingId?: string;
  jobPostingTitle?: string;
  name: string;
  email?: string;
  phone?: string;
  resumeUrl?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  source?: string;
  status: CandidateStatus;
  notes?: string;
  rating?: number;
  appliedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Interview {
  id: string;
  candidateId: string;
  candidateName: string;
  jobPostingId?: string;
  jobPostingTitle?: string;
  interviewerId?: string;
  interviewerName?: string;
  interviewType: string;
  scheduledAt: string;
  durationMinutes: number;
  location?: string;
  meetingUrl?: string;
  status: InterviewStatus;
  feedback?: string;
  rating?: number;
  notes?: string;
  completedAt?: string;
  createdAt: string;
}

export interface RecruitingStats {
  openPositions: number;
  totalCandidates: number;
  newThisWeek: number;
  interviewsScheduled: number;
  offersExtended: number;
  hired: number;
  funnel: { stage: string; count: number }[];
}

const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  full_time: '正社員',
  part_time: 'パートタイム',
  contract: '契約社員',
  intern: 'インターン',
  freelance: '業務委託',
};

const CANDIDATE_STATUS_CONFIG: Record<CandidateStatus, { label: string; color: string }> = {
  applied: { label: '応募', color: 'bg-blue-500' },
  screening: { label: '書類選考', color: 'bg-gray-500' },
  interview: { label: '面接中', color: 'bg-yellow-500' },
  offer: { label: '内定', color: 'bg-green-500' },
  hired: { label: '入社', color: 'bg-purple-500' },
  rejected: { label: '不採用', color: 'bg-red-500' },
  withdrawn: { label: '辞退', color: 'bg-orange-500' },
};

export function useRecruiting() {
  const { currentOrganization } = useOrganization();
  const [stats, setStats] = useState<RecruitingStats | null>(null);
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!currentOrganization?.id) return;

    try {
      const { data, error } = await supabase.rpc('get_recruiting_stats', {
        p_organization_id: currentOrganization.id,
      });

      if (error) throw error;

      if (data) {
        setStats({
          openPositions: data.open_positions || 0,
          totalCandidates: data.total_candidates || 0,
          newThisWeek: data.new_this_week || 0,
          interviewsScheduled: data.interviews_scheduled || 0,
          offersExtended: data.offers_extended || 0,
          hired: data.hired || 0,
          funnel: data.funnel || [],
        });
      }
    } catch (err) {
      console.error('Failed to fetch recruiting stats:', err);
    }
  }, [currentOrganization?.id]);

  const fetchJobPostings = useCallback(async (status?: JobPostingStatus) => {
    if (!currentOrganization?.id) return;

    try {
      let query = supabase
        .from('job_postings')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Get applicant counts
      const { data: applicantCounts } = await supabase
        .from('candidates')
        .select('job_posting_id')
        .eq('organization_id', currentOrganization.id)
        .not('job_posting_id', 'is', null);

      const countMap: Record<string, number> = {};
      applicantCounts?.forEach(c => {
        countMap[c.job_posting_id] = (countMap[c.job_posting_id] || 0) + 1;
      });

      setJobPostings(
        (data || []).map((jp: any) => ({
          id: jp.id,
          title: jp.title,
          description: jp.description,
          requirements: jp.requirements,
          benefits: jp.benefits,
          department: jp.department,
          location: jp.location,
          employmentType: jp.employment_type,
          salaryMin: jp.salary_min,
          salaryMax: jp.salary_max,
          salaryCurrency: jp.salary_currency,
          status: jp.status,
          postedAt: jp.posted_at,
          closedAt: jp.closed_at,
          applicantsCount: countMap[jp.id] || 0,
          createdAt: jp.created_at,
          updatedAt: jp.updated_at,
        }))
      );
    } catch (err) {
      console.error('Failed to fetch job postings:', err);
      setError('求人の取得に失敗しました');
    }
  }, [currentOrganization?.id]);

  const fetchCandidates = useCallback(async (limit?: number) => {
    if (!currentOrganization?.id) return;

    try {
      let query = supabase
        .from('candidates')
        .select(`
          *,
          job_postings(title)
        `)
        .eq('organization_id', currentOrganization.id)
        .order('applied_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      setCandidates(
        (data || []).map((c: any) => ({
          id: c.id,
          jobPostingId: c.job_posting_id,
          jobPostingTitle: c.job_postings?.title,
          name: c.name,
          email: c.email,
          phone: c.phone,
          resumeUrl: c.resume_url,
          portfolioUrl: c.portfolio_url,
          linkedinUrl: c.linkedin_url,
          source: c.source,
          status: c.status,
          notes: c.notes,
          rating: c.rating,
          appliedAt: c.applied_at,
          createdAt: c.created_at,
          updatedAt: c.updated_at,
        }))
      );
    } catch (err) {
      console.error('Failed to fetch candidates:', err);
      setError('候補者の取得に失敗しました');
    }
  }, [currentOrganization?.id]);

  const fetchInterviews = useCallback(async (upcoming = true, limit?: number) => {
    if (!currentOrganization?.id) return;

    try {
      let query = supabase
        .from('interviews')
        .select(`
          *,
          candidates(name),
          job_postings(title)
        `)
        .eq('organization_id', currentOrganization.id);

      if (upcoming) {
        query = query
          .gte('scheduled_at', new Date().toISOString())
          .eq('status', 'scheduled')
          .order('scheduled_at', { ascending: true });
      } else {
        query = query.order('scheduled_at', { ascending: false });
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      setInterviews(
        (data || []).map((i: any) => ({
          id: i.id,
          candidateId: i.candidate_id,
          candidateName: i.candidates?.name || '',
          jobPostingId: i.job_posting_id,
          jobPostingTitle: i.job_postings?.title,
          interviewerId: i.interviewer_id,
          interviewerName: i.interviewer_name,
          interviewType: i.interview_type,
          scheduledAt: i.scheduled_at,
          durationMinutes: i.duration_minutes,
          location: i.location,
          meetingUrl: i.meeting_url,
          status: i.status,
          feedback: i.feedback,
          rating: i.rating,
          notes: i.notes,
          completedAt: i.completed_at,
          createdAt: i.created_at,
        }))
      );
    } catch (err) {
      console.error('Failed to fetch interviews:', err);
      setError('面接の取得に失敗しました');
    }
  }, [currentOrganization?.id]);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    await Promise.all([
      fetchStats(),
      fetchJobPostings('open'),
      fetchCandidates(5),
      fetchInterviews(true, 5),
    ]);

    setIsLoading(false);
  }, [fetchStats, fetchJobPostings, fetchCandidates, fetchInterviews]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // CRUD operations
  const createJobPosting = async (input: Partial<JobPosting>): Promise<JobPosting | null> => {
    if (!currentOrganization?.id) return null;

    try {
      const { data, error } = await supabase
        .from('job_postings')
        .insert({
          organization_id: currentOrganization.id,
          title: input.title,
          description: input.description,
          requirements: input.requirements,
          benefits: input.benefits,
          department: input.department,
          location: input.location,
          employment_type: input.employmentType,
          salary_min: input.salaryMin,
          salary_max: input.salaryMax,
          salary_currency: input.salaryCurrency || 'JPY',
          status: input.status || 'draft',
          posted_at: input.status === 'open' ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchAll();
      return data as unknown as JobPosting;
    } catch (err) {
      console.error('Failed to create job posting:', err);
      setError('求人の作成に失敗しました');
      return null;
    }
  };

  const updateJobPosting = async (id: string, input: Partial<JobPosting>): Promise<boolean> => {
    try {
      const updates: Record<string, unknown> = {};
      if (input.title !== undefined) updates.title = input.title;
      if (input.description !== undefined) updates.description = input.description;
      if (input.requirements !== undefined) updates.requirements = input.requirements;
      if (input.benefits !== undefined) updates.benefits = input.benefits;
      if (input.department !== undefined) updates.department = input.department;
      if (input.location !== undefined) updates.location = input.location;
      if (input.employmentType !== undefined) updates.employment_type = input.employmentType;
      if (input.salaryMin !== undefined) updates.salary_min = input.salaryMin;
      if (input.salaryMax !== undefined) updates.salary_max = input.salaryMax;
      if (input.status !== undefined) {
        updates.status = input.status;
        if (input.status === 'open') updates.posted_at = new Date().toISOString();
        if (input.status === 'closed' || input.status === 'filled') updates.closed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('job_postings')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await fetchAll();
      return true;
    } catch (err) {
      console.error('Failed to update job posting:', err);
      setError('求人の更新に失敗しました');
      return false;
    }
  };

  const createCandidate = async (input: Partial<Candidate>): Promise<Candidate | null> => {
    if (!currentOrganization?.id) return null;

    try {
      const { data, error } = await supabase
        .from('candidates')
        .insert({
          organization_id: currentOrganization.id,
          job_posting_id: input.jobPostingId,
          name: input.name,
          email: input.email,
          phone: input.phone,
          resume_url: input.resumeUrl,
          portfolio_url: input.portfolioUrl,
          linkedin_url: input.linkedinUrl,
          source: input.source,
          status: input.status || 'applied',
          notes: input.notes,
          rating: input.rating,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchAll();
      return data as unknown as Candidate;
    } catch (err) {
      console.error('Failed to create candidate:', err);
      setError('候補者の登録に失敗しました');
      return null;
    }
  };

  const updateCandidateStatus = async (id: string, status: CandidateStatus): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('candidates')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      await fetchAll();
      return true;
    } catch (err) {
      console.error('Failed to update candidate status:', err);
      setError('ステータスの更新に失敗しました');
      return false;
    }
  };

  const createInterview = async (input: Partial<Interview>): Promise<Interview | null> => {
    if (!currentOrganization?.id) return null;

    try {
      // Get candidate's job posting if not provided
      let jobPostingId = input.jobPostingId;
      if (!jobPostingId && input.candidateId) {
        const { data: candidate } = await supabase
          .from('candidates')
          .select('job_posting_id')
          .eq('id', input.candidateId)
          .single();
        jobPostingId = candidate?.job_posting_id;
      }

      const { data, error } = await supabase
        .from('interviews')
        .insert({
          organization_id: currentOrganization.id,
          candidate_id: input.candidateId,
          job_posting_id: jobPostingId,
          interviewer_id: input.interviewerId,
          interviewer_name: input.interviewerName,
          interview_type: input.interviewType,
          scheduled_at: input.scheduledAt,
          duration_minutes: input.durationMinutes || 60,
          location: input.location,
          meeting_url: input.meetingUrl,
          status: 'scheduled',
        })
        .select()
        .single();

      if (error) throw error;

      // Update candidate status to interview if currently in screening
      if (input.candidateId) {
        await supabase
          .from('candidates')
          .update({ status: 'interview' })
          .eq('id', input.candidateId)
          .in('status', ['applied', 'screening']);
      }

      await fetchAll();
      return data as unknown as Interview;
    } catch (err) {
      console.error('Failed to create interview:', err);
      setError('面接の登録に失敗しました');
      return null;
    }
  };

  const completeInterview = async (
    id: string,
    feedback: string,
    rating?: number
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('interviews')
        .update({
          status: 'completed',
          feedback,
          rating,
          completed_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      await fetchInterviews();
      return true;
    } catch (err) {
      console.error('Failed to complete interview:', err);
      setError('面接の完了処理に失敗しました');
      return false;
    }
  };

  return {
    stats,
    jobPostings,
    candidates,
    interviews,
    isLoading,
    error,
    refresh: fetchAll,
    fetchJobPostings,
    fetchCandidates,
    fetchInterviews,
    createJobPosting,
    updateJobPosting,
    createCandidate,
    updateCandidateStatus,
    createInterview,
    completeInterview,
    // Helper constants
    employmentTypeLabels: EMPLOYMENT_TYPE_LABELS,
    candidateStatusConfig: CANDIDATE_STATUS_CONFIG,
  };
}
