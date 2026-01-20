import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { 
  IndustryTemplate, 
  TemplateWithContent, 
  TemplateLandingContent,
  TemplateMenuConfig,
  TemplateCategory 
} from '@/types/industry-template';

export function useIndustryTemplates() {
  return useQuery({
    queryKey: ['industry-templates'],
    queryFn: async (): Promise<IndustryTemplate[]> => {
      const { data, error } = await supabase
        .from('industry_templates')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as IndustryTemplate[];
    },
  });
}

export function useIndustryTemplateByKey(templateKey: string | undefined) {
  return useQuery({
    queryKey: ['industry-template', templateKey],
    queryFn: async (): Promise<TemplateWithContent | null> => {
      if (!templateKey) return null;

      const { data: template, error: templateError } = await supabase
        .from('industry_templates')
        .select('*')
        .eq('template_key', templateKey)
        .eq('is_active', true)
        .single();

      if (templateError) {
        if (templateError.code === 'PGRST116') return null;
        throw templateError;
      }

      // Fetch landing content
      const { data: landingContent } = await supabase
        .from('template_landing_content')
        .select('*')
        .eq('template_id', template.id)
        .single();

      // Fetch menu config
      const { data: menuConfig } = await supabase
        .from('template_menu_config')
        .select('*')
        .eq('template_id', template.id)
        .single();

      // Parse JSONB fields properly
      const parsedLandingContent = landingContent ? {
        ...landingContent,
        pain_points: landingContent.pain_points as unknown as TemplateLandingContent['pain_points'],
        solutions: landingContent.solutions as unknown as TemplateLandingContent['solutions'],
        features: landingContent.features as unknown as TemplateLandingContent['features'],
        testimonials: landingContent.testimonials as unknown as TemplateLandingContent['testimonials'],
        faq: landingContent.faq as unknown as TemplateLandingContent['faq'],
      } as TemplateLandingContent : undefined;

      const parsedMenuConfig = menuConfig ? {
        ...menuConfig,
        menu_groups: menuConfig.menu_groups as unknown as TemplateMenuConfig['menu_groups'],
        mobile_nav_items: menuConfig.mobile_nav_items as unknown as TemplateMenuConfig['mobile_nav_items'],
        dashboard_widgets: menuConfig.dashboard_widgets as unknown as TemplateMenuConfig['dashboard_widgets'],
      } as TemplateMenuConfig : undefined;

      return {
        ...(template as IndustryTemplate),
        landing_content: parsedLandingContent,
        menu_config: parsedMenuConfig,
      };
    },
    enabled: !!templateKey,
  });
}

export function useFeaturedTemplates() {
  return useQuery({
    queryKey: ['featured-templates'],
    queryFn: async (): Promise<IndustryTemplate[]> => {
      const { data, error } = await supabase
        .from('industry_templates')
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('sort_order', { ascending: true })
        .limit(6);

      if (error) throw error;
      return data as IndustryTemplate[];
    },
  });
}

export function useTemplatesByCategory(category: TemplateCategory | undefined) {
  return useQuery({
    queryKey: ['templates-by-category', category],
    queryFn: async (): Promise<IndustryTemplate[]> => {
      if (!category) return [];

      const { data, error } = await supabase
        .from('industry_templates')
        .select('*')
        .eq('is_active', true)
        .eq('category', category)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as IndustryTemplate[];
    },
    enabled: !!category,
  });
}

export function useTemplatesGroupedByCategory() {
  const { data: templates, ...rest } = useIndustryTemplates();

  const grouped = templates?.reduce((acc, template) => {
    const category = template.category as TemplateCategory;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(template);
    return acc;
  }, {} as Record<TemplateCategory, IndustryTemplate[]>);

  return { data: grouped, ...rest };
}
