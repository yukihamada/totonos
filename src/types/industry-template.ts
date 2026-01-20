export type TemplateCategory = 
  | 'retail'
  | 'service'
  | 'professional'
  | 'healthcare'
  | 'construction'
  | 'it'
  | 'logistics'
  | 'education';

export interface IndustryTemplate {
  id: string;
  template_key: string;
  name: string;
  name_en: string | null;
  description: string | null;
  category: TemplateCategory;
  icon: string | null;
  color: string | null;
  hero_image_url: string | null;
  keywords: string[] | null;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
}

export interface TemplateAccount {
  id: string;
  template_id: string | null;
  account_code: string;
  account_name: string;
  account_type: string;
  parent_code: string | null;
  is_common: boolean;
  account_description: string | null;
  tax_category: string | null;
  sort_order: number;
}

export interface MenuGroup {
  id: string;
  label: string;
  items: string[];
  icon?: string;
}

export interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  size: 'small' | 'medium' | 'large';
  position: number;
}

export interface TemplateMenuConfig {
  id: string;
  template_id: string;
  menu_groups: MenuGroup[];
  mobile_nav_items: string[] | null;
  hidden_features: string[] | null;
  emphasized_features: string[] | null;
  dashboard_widgets: DashboardWidget[] | null;
}

export interface PainPoint {
  icon: string;
  title: string;
  description: string;
}

export interface Solution {
  icon: string;
  title: string;
  description: string;
}

export interface Feature {
  icon: string;
  title: string;
  description: string;
  image?: string;
}

export interface Testimonial {
  name: string;
  role: string;
  company: string;
  content: string;
  avatar?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface TemplateLandingContent {
  id: string;
  template_id: string;
  hero_title: string;
  hero_subtitle: string | null;
  pain_points: PainPoint[] | null;
  solutions: Solution[] | null;
  features: Feature[] | null;
  testimonials: Testimonial[] | null;
  faq: FAQItem[] | null;
  cta_text: string;
}

export interface TemplateWithContent extends IndustryTemplate {
  landing_content?: TemplateLandingContent;
  menu_config?: TemplateMenuConfig;
}

export const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  retail: '小売・流通',
  service: '飲食・サービス',
  professional: '専門サービス',
  healthcare: '医療・福祉',
  construction: '建設・製造',
  it: 'IT・クリエイティブ',
  logistics: '物流・農業',
  education: '教育・非営利',
};

export const CATEGORY_ICONS: Record<TemplateCategory, string> = {
  retail: 'ShoppingCart',
  service: 'Utensils',
  professional: 'Briefcase',
  healthcare: 'Heart',
  construction: 'HardHat',
  it: 'Code',
  logistics: 'Truck',
  education: 'GraduationCap',
};
