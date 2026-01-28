import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  status: string;
  stage: string;
  source: string;
  rating: number;
  appliedAt: Date;
  avatar: string;
}

// Map leads as candidate proxy (until dedicated candidates table exists)
export function useCandidates() {
  return useQuery({
    queryKey: ["candidates"],
    queryFn: async (): Promise<Candidate[]> => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!data) return [];

      const statusMap: Record<string, { status: string; stage: string }> = {
        new: { status: 'screening', stage: '書類選考' },
        contacted: { status: 'interview', stage: '一次面接' },
        qualified: { status: 'interview', stage: '技術面接' },
        converted: { status: 'offer', stage: '内定' },
        lost: { status: 'rejected', stage: '不採用' },
      };

      return data.map((lead) => {
        const displayName = lead.contact_name || lead.company_name || '??';
        const nameInitials = displayName
          .split(' ')
          .map(n => n[0] || '')
          .join('')
          .toUpperCase()
          .slice(0, 2);

        const mappedStatus = statusMap[lead.status || 'new'] || { status: 'screening', stage: '書類選考' };

        return {
          id: lead.id,
          name: lead.contact_name || lead.company_name || '（名前なし）',
          email: lead.email || '',
          phone: lead.phone || '',
          position: lead.notes?.includes('エンジニア') ? 'エンジニア' : 
                   lead.notes?.includes('マネージャー') ? 'マネージャー' : '未設定',
          status: mappedStatus.status,
          stage: mappedStatus.stage,
          source: lead.source || 'other',
          rating: lead.status === 'qualified' ? 5 : lead.status === 'contacted' ? 4 : 3,
          appliedAt: new Date(lead.created_at),
          avatar: nameInitials || 'NA',
        };
      });
    },
  });
}

export function useCandidateDetail(candidateId: string | undefined) {
  return useQuery({
    queryKey: ["candidate-detail", candidateId],
    queryFn: async () => {
      if (!candidateId) return null;

      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("id", candidateId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      const displayName = data.contact_name || data.company_name || '??';
      const nameInitials = displayName
        .split(' ')
        .map(n => n[0] || '')
        .join('')
        .toUpperCase()
        .slice(0, 2);

      return {
        id: data.id,
        name: data.contact_name || data.company_name || '（名前なし）',
        email: data.email || '',
        phone: data.phone || '',
        location: '',
        position: '未設定',
        status: data.status || 'new',
        stage: data.status === 'qualified' ? '技術面接' : '書類選考',
        source: data.source || 'other',
        rating: data.status === 'qualified' ? 5 : 3,
        appliedAt: new Date(data.created_at),
        avatar: nameInitials,
        resumeUrl: '',
        portfolioUrl: '',
        linkedIn: '',
        currentCompany: data.company_name || '',
        currentPosition: '',
        yearsOfExperience: 0,
        expectedSalary: '',
        availableDate: new Date(),
        skills: [],
        notes: data.notes || '',
      };
    },
    enabled: !!candidateId,
  });
}
