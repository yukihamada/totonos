import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Star,
  ShoppingCart,
  Car,
  Dog,
  UtensilsCrossed,
  Scissors,
  Dumbbell,
  Building2,
  Sparkles as SparklesIcon,
  Briefcase,
  Scale,
  Calculator,
  FileCheck,
  Home,
  Shield,
  Palette,
  Stethoscope,
  Baby,
  HeartHandshake,
  HardHat,
  Factory,
  Cookie,
  Printer,
  Code,
  Video,
  FileSpreadsheet,
  Truck,
  Leaf,
  GraduationCap,
  type LucideIcon,
} from 'lucide-react';
import type { IndustryTemplate } from '@/types/industry-template';

interface MenuGroupConfig {
  id: string;
  priority?: number;
}

interface IndustryCardProps {
  template: IndustryTemplate & {
    menu_config?: {
      menu_groups: MenuGroupConfig[];
      hidden_features?: string[];
      emphasized_features?: string[];
    };
  };
}

// Map icon names from database to Lucide components
const iconMap: Record<string, LucideIcon> = {
  ShoppingCart,
  Car,
  Dog,
  UtensilsCrossed,
  Scissors,
  Dumbbell,
  Building2,
  Sparkles: SparklesIcon,
  Briefcase,
  Scale,
  Calculator,
  FileCheck,
  Home,
  Shield,
  Palette,
  Stethoscope,
  Baby,
  HeartHandshake,
  HardHat,
  Factory,
  Cookie,
  Printer,
  Code,
  Video,
  FileSpreadsheet,
  Truck,
  Leaf,
  GraduationCap,
};

// Map menu group IDs to display labels
const menuGroupLabels: Record<string, string> = {
  crm: 'CRM',
  sales: '営業',
  documents: '帳票',
  finance: 'ファイナンス',
  accounting: '会計',
  'expense-reimbursement': '経費精算',
  expenses: '経費精算',
  'project-management': 'プロジェクト',
  projects: 'プロジェクト',
  recruiting: '採用',
  hr: '人事・労務',
  info: '情報管理',
  integrations: '連携',
  billing: '課金',
  support: 'サポート',
  marketing: 'マーケ',
  retail: '小売',
  lms: 'LMS',
  legal: '法務',
  emr: '電子カルテ',
  members: '会員管理',
  inventory: '在庫管理',
  purchasing: '仕入管理',
  contracts: '契約管理',
};

export function IndustryCard({ template }: IndustryCardProps) {
  // Get the icon component from the map, or use a default
  const IconComponent = template.icon ? iconMap[template.icon] : null;

  // Get enabled features from menu_config (default ON)
  const enabledFeatures = template.menu_config?.menu_groups
    ?.sort((a, b) => (a.priority || 99) - (b.priority || 99))
    ?.slice(0, 3)
    ?.map(group => menuGroupLabels[group.id] || group.id)
    ?.filter(Boolean) || [];

  // Get suggested features that are hidden but can be easily added (default OFF but recommended)
  const suggestedFeatures = template.menu_config?.hidden_features
    ?.slice(0, 2)
    ?.map(id => menuGroupLabels[id] || id)
    ?.filter(Boolean) || [];

  return (
    <Link to={`/lp/${template.template_key}`}>
      <Card className="h-full transition-all duration-300 hover:shadow-lg hover:border-primary/50 hover:-translate-y-1 group">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${template.color || 'hsl(var(--primary))'}20` }}
            >
              {IconComponent ? (
                <IconComponent 
                  className="h-6 w-6" 
                  style={{ color: template.color || 'hsl(var(--primary))' }}
                />
              ) : (
                <span className="text-2xl">{template.icon || '🏢'}</span>
              )}
            </div>
            {template.is_featured && (
              <Badge variant="secondary" className="gap-1">
                <Star className="h-3 w-3" />
                おすすめ
              </Badge>
            )}
          </div>

          <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-1">
            {template.name}
          </h3>

          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {template.description || `${template.name}に特化した業務管理テンプレート`}
          </p>

          {/* Default ON features */}
          {enabledFeatures.length > 0 && (
            <div className="mb-2">
              <div className="flex items-center gap-1 mb-1">
                <span className="text-xs text-muted-foreground">デフォルトON:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {enabledFeatures.map((feature, index) => (
                  <Badge 
                    key={index} 
                    variant="default" 
                    className="text-xs px-2 py-0.5"
                  >
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Suggested features (easy to add) */}
          {suggestedFeatures.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center gap-1 mb-1">
                <span className="text-xs text-muted-foreground">簡単に追加可能:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {suggestedFeatures.map((feature, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="text-xs px-2 py-0.5 text-muted-foreground"
                  >
                    + {feature}
                  </Badge>
                ))}
                <Badge 
                  variant="secondary" 
                  className="text-xs px-2 py-0.5 bg-transparent text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  他多数...
                </Badge>
              </div>
            </div>
          )}

          {/* Note about customization */}
          <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
            <span className="inline-block w-1 h-1 rounded-full bg-primary"></span>
            すべての機能は後から自由に変更可能
          </p>

          <div className="flex items-center text-sm text-primary font-medium">
            詳細を見る
            <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
