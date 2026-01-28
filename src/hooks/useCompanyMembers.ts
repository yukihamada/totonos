import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentCompany } from "./useCompany";

export interface CompanyMember {
  id: string;
  name: string;
  avatar: string;
  department: string;
  email: string;
  role: string;
}

export function useCompanyMembers() {
  const { data: company } = useCurrentCompany();

  return useQuery({
    queryKey: ['company-members', company?.id],
    queryFn: async (): Promise<CompanyMember[]> => {
      if (!company?.id) return [];

      const { data: members, error } = await supabase
        .from('company_members')
        .select(`
          id,
          user_id,
          role,
          profile:user_id (
            display_name,
            email,
            avatar_url
          )
        `)
        .eq('company_id', company.id)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching company members:', error);
        return [];
      }

      return (members || []).map((member: any) => {
        const displayName = member.profile?.display_name || member.profile?.email?.split('@')[0] || 'メンバー';
        return {
          id: member.user_id,
          name: displayName,
          avatar: displayName.substring(0, 2).toUpperCase(),
          department: '',
          email: member.profile?.email || '',
          role: member.role || 'member',
        };
      });
    },
    enabled: !!company?.id,
  });
}
