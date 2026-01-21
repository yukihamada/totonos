import { useEffect, useCallback, useMemo } from 'react';
import { useCurrentCompany, useUpdateCompany } from '@/hooks/useCompany';
import { 
  BrandingSettings, 
  defaultBrandingSettings, 
  designTemplates,
  letterSpacingMap,
  borderRadiusMap,
} from '@/types/design-templates';
import type { Json } from '@/integrations/supabase/types';

export function useBrandingSettings() {
  const { data: company, isLoading } = useCurrentCompany();
  const updateCompany = useUpdateCompany();

  // Parse branding settings from company
  const brandingSettings: BrandingSettings = useMemo(() => {
    if (!company?.branding_settings) {
      return defaultBrandingSettings;
    }
    
    const stored = company.branding_settings as Partial<BrandingSettings>;
    return {
      ...defaultBrandingSettings,
      ...stored,
    };
  }, [company?.branding_settings]);

  // Apply branding to DOM
  useEffect(() => {
    const root = document.documentElement;
    
    // Get design template
    const template = designTemplates.find(t => t.id === brandingSettings.designTemplateId);
    
    // Apply accent color (template's accentHue overridden by custom if set)
    const accentHue = brandingSettings.accentHue ?? template?.styles.accentHue ?? 210;
    root.style.setProperty('--accent-hue', accentHue.toString());
    
    // Apply accent color as primary (converting HSL)
    // This creates accent-based primary colors
    root.style.setProperty('--primary', `${accentHue} 70% 50%`);
    root.style.setProperty('--primary-foreground', '0 0% 100%');
    
    // Apply fonts
    root.style.setProperty('--font-body', brandingSettings.fontBody);
    if (brandingSettings.fontHeading !== 'inherit') {
      root.style.setProperty('--font-heading', brandingSettings.fontHeading);
    } else {
      root.style.setProperty('--font-heading', brandingSettings.fontBody);
    }
    
    // Apply letter spacing
    root.style.setProperty('--letter-spacing', letterSpacingMap[brandingSettings.letterSpacing]);
    
    // Apply border radius from template
    if (template) {
      root.style.setProperty('--radius', borderRadiusMap[template.styles.borderRadius]);
      root.setAttribute('data-ui-style', template.styles.uiStyle);
    }
  }, [brandingSettings]);

  // Update branding settings
  const updateBrandingSettings = useCallback(async (updates: Partial<BrandingSettings>) => {
    if (!company) return;

    const newSettings: BrandingSettings = {
      ...brandingSettings,
      ...updates,
    };

    await updateCompany.mutateAsync({
      id: company.id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      branding_settings: newSettings as any,
    });
  }, [company, brandingSettings, updateCompany]);

  // Apply design template
  const applyDesignTemplate = useCallback(async (templateId: string) => {
    const template = designTemplates.find(t => t.id === templateId);
    if (!template) return;

    await updateBrandingSettings({
      designTemplateId: templateId,
      accentHue: template.styles.accentHue ?? brandingSettings.accentHue,
    });
  }, [updateBrandingSettings, brandingSettings.accentHue]);

  return {
    brandingSettings,
    updateBrandingSettings,
    applyDesignTemplate,
    isLoading,
    companyId: company?.id,
    logoUrl: company?.logo_url ?? brandingSettings.logoUrl,
  };
}
