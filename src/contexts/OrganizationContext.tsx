import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  plan: 'free' | 'pro' | 'enterprise';
  created_at: string;
  owner_id: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
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
  inviteMember: (email: string, role: OrganizationMember['role']) => Promise<void>;
  removeMember: (userId: string) => Promise<void>;
  refreshOrganizations: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | null>(null);

const CURRENT_ORG_KEY = 'totonos_current_org';

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [membership, setMembership] = useState<OrganizationMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load organizations on mount
  useEffect(() => {
    if (user) {
      loadOrganizations();
    } else {
      setOrganization(null);
      setOrganizations([]);
      setMembership(null);
      setLoading(false);
    }
  }, [user]);

  const loadOrganizations = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Get all organizations the user is a member of
      const { data: memberships, error: memberError } = await supabase
        .from('organization_members')
        .select(`
          *,
          organization:organizations(*)
        `)
        .eq('user_id', user.id);

      if (memberError) throw memberError;

      const orgs = memberships?.map(m => m.organization).filter(Boolean) as Organization[] || [];
      setOrganizations(orgs);

      // Try to restore last selected organization
      const savedOrgId = localStorage.getItem(CURRENT_ORG_KEY);
      let currentOrg = orgs.find(o => o.id === savedOrgId);

      // If no saved org or saved org not found, use first org
      if (!currentOrg && orgs.length > 0) {
        currentOrg = orgs[0];
      }

      if (currentOrg) {
        setOrganization(currentOrg);
        localStorage.setItem(CURRENT_ORG_KEY, currentOrg.id);

        // Get membership for current org
        const currentMembership = memberships?.find(m => m.organization_id === currentOrg!.id);
        setMembership(currentMembership || null);
      }
    } catch (err) {
      console.error('Failed to load organizations:', err);
      setError('組織の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const switchOrganization = async (orgId: string) => {
    const org = organizations.find(o => o.id === orgId);
    if (!org) {
      throw new Error('組織が見つかりません');
    }

    setOrganization(org);
    localStorage.setItem(CURRENT_ORG_KEY, orgId);

    // Update membership
    if (user) {
      const { data: memberData } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', orgId)
        .eq('user_id', user.id)
        .single();

      setMembership(memberData || null);
    }
  };

  const createOrganization = async (name: string): Promise<Organization | null> => {
    if (!user) return null;

    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');

    const { data: org, error: createError } = await supabase
      .from('organizations')
      .insert({
        name,
        slug,
        owner_id: user.id,
        plan: 'free',
      })
      .select()
      .single();

    if (createError) throw createError;

    // Add owner as admin member
    await supabase
      .from('organization_members')
      .insert({
        organization_id: org.id,
        user_id: user.id,
        role: 'owner',
      });

    await loadOrganizations();
    return org;
  };

  const updateOrganization = async (updates: Partial<Organization>) => {
    if (!organization) return;

    const { error: updateError } = await supabase
      .from('organizations')
      .update(updates)
      .eq('id', organization.id);

    if (updateError) throw updateError;

    setOrganization({ ...organization, ...updates });
    await loadOrganizations();
  };

  const inviteMember = async (email: string, role: OrganizationMember['role']) => {
    if (!organization) return;

    // Create invitation record
    const { error: inviteError } = await supabase
      .from('organization_invitations')
      .insert({
        organization_id: organization.id,
        email,
        role,
        invited_by: user?.id,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      });

    if (inviteError) throw inviteError;

    // TODO: Send invitation email via Edge Function
  };

  const removeMember = async (userId: string) => {
    if (!organization) return;

    const { error: removeError } = await supabase
      .from('organization_members')
      .delete()
      .eq('organization_id', organization.id)
      .eq('user_id', userId);

    if (removeError) throw removeError;
  };

  const refreshOrganizations = async () => {
    await loadOrganizations();
  };

  return (
    <OrganizationContext.Provider
      value={{
        organization,
        organizations,
        membership,
        loading,
        error,
        switchOrganization,
        createOrganization,
        updateOrganization,
        inviteMember,
        removeMember,
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
