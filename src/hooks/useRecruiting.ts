import { useState, useCallback } from 'react';

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

// Mock data - tables don't exist in DB yet
const emptyStats: RecruitingStats = {
  openPositions: 0,
  totalCandidates: 0,
  newThisWeek: 0,
  interviewsScheduled: 0,
  offersExtended: 0,
  hired: 0,
  funnel: [],
};

export function useRecruiting() {
  const [stats] = useState<RecruitingStats>(emptyStats);
  const [jobPostings] = useState<JobPosting[]>([]);
  const [candidates] = useState<Candidate[]>([]);
  const [interviews] = useState<Interview[]>([]);
  const [isLoading] = useState(false);
  const [error] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    // Stub - table doesn't exist
  }, []);

  const fetchJobPostings = useCallback(async (_status?: JobPostingStatus) => {
    // Stub - table doesn't exist
  }, []);

  const fetchCandidates = useCallback(async (_limit?: number) => {
    // Stub - table doesn't exist
  }, []);

  const fetchInterviews = useCallback(async (_upcoming = true, _limit?: number) => {
    // Stub - table doesn't exist
  }, []);

  const fetchAll = useCallback(async () => {
    // Stub - tables don't exist
  }, []);

  // CRUD operations - all stubs
  const createJobPosting = async (_input: Partial<JobPosting>): Promise<JobPosting | null> => {
    return null;
  };

  const updateJobPosting = async (_id: string, _input: Partial<JobPosting>): Promise<boolean> => {
    return false;
  };

  const createCandidate = async (_input: Partial<Candidate>): Promise<Candidate | null> => {
    return null;
  };

  const updateCandidateStatus = async (_id: string, _status: CandidateStatus): Promise<boolean> => {
    return false;
  };

  const createInterview = async (_input: Partial<Interview>): Promise<Interview | null> => {
    return null;
  };

  const completeInterview = async (
    _id: string,
    _feedback: string,
    _rating?: number
  ): Promise<boolean> => {
    return false;
  };

  const cancelInterview = async (_id: string): Promise<boolean> => {
    return false;
  };

  return {
    // Data
    stats,
    jobPostings,
    candidates,
    interviews,
    isLoading,
    error,
    
    // Fetch functions
    fetchStats,
    fetchJobPostings,
    fetchCandidates,
    fetchInterviews,
    fetchAll,
    
    // CRUD functions
    createJobPosting,
    updateJobPosting,
    createCandidate,
    updateCandidateStatus,
    createInterview,
    completeInterview,
    cancelInterview,
    
    // Utility
    getEmploymentTypeLabel: (type: EmploymentType) => EMPLOYMENT_TYPE_LABELS[type] || type,
    getCandidateStatusConfig: (status: CandidateStatus) => CANDIDATE_STATUS_CONFIG[status],
  };
}
