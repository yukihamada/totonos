import { useCurrentCompany } from '@/hooks/useCompany';

// Re-export with alias for backward compatibility
export function useOrganization() {
  const { data: currentCompany, isLoading, error } = useCurrentCompany();
  
  return {
    currentOrganization: currentCompany ? { 
      id: currentCompany.id, 
      name: currentCompany.name,
      plan: 'free'
    } : null,
    organizations: [],
    isLoading,
    error: error?.message || null,
    switchOrganization: async () => {},
    refresh: async () => {},
  };
}
