import { createContext, useContext, ReactNode } from 'react';
import { useCurrentCompany, useUserCompanies, useSwitchCompany, useCreateCompany, useUpdateCompany } from '@/hooks/useCompany';
import type { Company, CompanyMember, MemberRole } from '@/types/company';

export interface Organization {
  id: string;
  name: string;
  display_name?: string;
  logo_url?: string;
  plan?: string;
  created_at: string;
  created_by: string;
}

export interface OrganizationMember {
  id: string;
  company_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'manager' | 'member' | 'viewer';
  joined_at: string;
}

interface OrganizationContextType {
  organization: Organization | null;
  organizations: Organization[];
  membership: OrganizationMember | null;
  loading: boolean;
  error: string | null;
  switchOrganization: (orgId: string) => Promise<void>;
  createOrganization: (name: string) => Promise<Organization | null>;
  updateOrganization: (updates: Partial<Organization>) => Promise<void>;
  refreshOrganizations: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | null>(null);

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { data: currentCompany, isLoading: currentLoading, refetch: refetchCurrent } = useCurrentCompany();
  const { data: userCompanies, isLoading: companiesLoading, refetch: refetchCompanies } = useUserCompanies();
  const switchCompanyMutation = useSwitchCompany();
  const createCompanyMutation = useCreateCompany();
  const updateCompanyMutation = useUpdateCompany();

  // Map company to organization format
  const organization: Organization | null = currentCompany ? {
    id: currentCompany.id,
    name: currentCompany.name,
    display_name: currentCompany.display_name ?? undefined,
    logo_url: currentCompany.logo_url ?? undefined,
    plan: (currentCompany as any).company_credits?.plan ?? 'free',
    created_at: currentCompany.created_at,
    created_by: currentCompany.created_by,
  } : null;

  // Map companies to organizations format
  const organizations: Organization[] = (userCompanies || []).map((membership: any) => ({
    id: membership.companies?.id,
    name: membership.companies?.name,
    display_name: membership.companies?.display_name,
    logo_url: membership.companies?.logo_url,
    created_at: membership.companies?.created_at,
    created_by: membership.companies?.created_by,
  })).filter((org: Organization) => org.id);

  const loading = currentLoading || companiesLoading;

  const switchOrganization = async (orgId: string) => {
    await switchCompanyMutation.mutateAsync(orgId);
  };

  const createOrganization = async (name: string): Promise<Organization | null> => {
    const company = await createCompanyMutation.mutateAsync({
      name,
      display_name: name,
    });

    if (company) {
      return {
        id: company.id,
        name: company.name,
        display_name: company.display_name ?? undefined,
        logo_url: company.logo_url ?? undefined,
        created_at: company.created_at,
        created_by: company.created_by,
      };
    }
    return null;
  };

  const updateOrganization = async (updates: Partial<Organization>) => {
    if (!organization) return;

    await updateCompanyMutation.mutateAsync({
      id: organization.id,
      ...updates,
    });
  };

  const refreshOrganizations = async () => {
    await refetchCurrent();
    await refetchCompanies();
  };

  return (
    <OrganizationContext.Provider
      value={{
        organization,
        organizations,
        membership: null, // TODO: implement membership lookup
        loading,
        error: null,
        switchOrganization,
        createOrganization,
        updateOrganization,
        refreshOrganizations,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization must be used within OrganizationProvider');
  }
  return context;
}