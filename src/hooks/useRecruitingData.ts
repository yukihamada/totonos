import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentCompany } from "./useCompany";

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  status: 'new' | 'screening' | 'interview' | 'offer' | 'rejected' | 'hired';
  stage: string;
  source: string;
  rating: number;
  appliedAt: Date;
  avatar: string;
}

export interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  applicants: number;
  status: 'open' | 'closed' | 'draft';
  postedAt: Date;
}

export function useCandidates() {
  const { data: company } = useCurrentCompany();

  return useQuery({
    queryKey: ['candidates', company?.id],
    queryFn: async (): Promise<Candidate[]> => {
      if (!company?.id) return [];

      // Try to fetch from leads as potential candidates
      const { data: leads, error } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching candidates:', error);
        return [];
      }

      // Map leads to candidate format (as a fallback until dedicated candidates table exists)
      return (leads || []).slice(0, 10).map((lead: any, index: number) => ({
        id: lead.id,
        name: lead.company_name || lead.contact_name || '候補者',
        email: lead.email || '',
        phone: lead.phone || '',
        position: '応募ポジション',
        status: ['screening', 'interview', 'offer'][index % 3] as Candidate['status'],
        stage: ['書類選考', '面接中', '内定'][index % 3],
        source: lead.source || '直接応募',
        rating: Math.floor(Math.random() * 2) + 3,
        appliedAt: new Date(lead.created_at),
        avatar: (lead.company_name || lead.contact_name || 'XX').substring(0, 2).toUpperCase(),
      }));
    },
    enabled: !!company?.id,
  });
}

export function useJobPostings() {
  const { data: company } = useCurrentCompany();

  return useQuery({
    queryKey: ['job-postings', company?.id],
    queryFn: async (): Promise<JobPosting[]> => {
      // Currently no job_postings table, return empty
      // When table is added, fetch from there
      return [];
    },
    enabled: !!company?.id,
  });
}

export function useRecruitingStats() {
  const { data: candidates } = useCandidates();

  const stats = {
    openPositions: 0,
    totalCandidates: candidates?.length || 0,
    newThisWeek: 0,
    interviewsScheduled: 0,
    offersExtended: candidates?.filter(c => c.status === 'offer').length || 0,
    hired: candidates?.filter(c => c.status === 'hired').length || 0,
  };

  // Count new this week
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  stats.newThisWeek = candidates?.filter(c => c.appliedAt >= oneWeekAgo).length || 0;
  stats.interviewsScheduled = candidates?.filter(c => c.status === 'interview').length || 0;

  return stats;
}
