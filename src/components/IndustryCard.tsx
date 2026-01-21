import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { IndustryFeatureSelector } from './IndustryFeatureSelector';
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
  Pill,
  Gem,
  Sofa,
  Coffee,
  Croissant,
  Smile,
  PawPrint,
  Zap,
  Wrench,
  Cloud,
  Megaphone,
  Camera,
  Warehouse,
  Bike,
  HandHeart,
  CarFront,
  Ruler,
  Languages,
  Users,
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
  Pill,
  Gem,
  Sofa,
  Coffee,
  Croissant,
  Smile,
  PawPrint,
  Zap,
  Wrench,
  Cloud,
  Megaphone,
  Camera,
  Warehouse,
  Bike,
  HandHeart,
  CarFront,
  Ruler,
  Languages,
  Users,
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  
  // Get the icon component from the map, or use a default
  const IconComponent = template.icon ? iconMap[template.icon] : null;

  // Get enabled features from menu_config (default ON)
  const enabledFeatures = template.menu_config?.menu_groups
    ?.sort((a, b) => (a.priority || 99) - (b.priority || 99))
    ?.slice(0, 3)
    ?.map(group => menuGroupLabels[group.id] || group.id)
    ?.filter(Boolean) || [];

  // Get suggested features that are hidden but can be easily added
  const suggestedFeatures = template.menu_config?.hidden_features
    ?.slice(0, 2)
    ?.map(id => menuGroupLabels[id] || id)
    ?.filter(Boolean) || [];

  // Total available features count
  const totalFeatures = Object.keys(menuGroupLabels).length;

  const handleStartWithFeatures = () => {
    // Navigate to auth with template and selected features
    const featuresParam = selectedFeatures.length > 0 
      ? `&features=${selectedFeatures.join(',')}`
      : '';
    window.location.href = `/auth?template=${template.template_key}${featuresParam}`;
  };

  return (
    <Card className="h-full transition-all duration-300 hover:shadow-lg hover:border-primary/50 group">
      <CardContent className="p-6 flex flex-col h-full">
        {/* Header */}
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

        {/* Title & Description */}
        <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-1">
          {template.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {template.description || `${template.name}に特化した業務管理テンプレート`}
        </p>

        {/* Feature Preview - Compact */}
        <div className="mb-4 flex-1">
          <IndustryFeatureSelector
            menuGroups={template.menu_config?.menu_groups}
            hiddenFeatures={template.menu_config?.hidden_features}
            emphasizedFeatures={template.menu_config?.emphasized_features}
            compact
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-3 border-t">
          <Link to={`/lp/${template.template_key}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full text-xs">
              詳細を見る
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex-1 text-xs">
                機能を選んで始める
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {IconComponent && (
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${template.color || 'hsl(var(--primary))'}20` }}
                    >
                      <IconComponent 
                        className="h-4 w-4" 
                        style={{ color: template.color || 'hsl(var(--primary))' }}
                      />
                    </div>
                  )}
                  {template.name}
                </DialogTitle>
              </DialogHeader>
              
              <IndustryFeatureSelector
                menuGroups={template.menu_config?.menu_groups}
                hiddenFeatures={template.menu_config?.hidden_features}
                emphasizedFeatures={template.menu_config?.emphasized_features}
                onFeaturesChange={setSelectedFeatures}
              />

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setDialogOpen(false)}
                >
                  キャンセル
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleStartWithFeatures}
                >
                  この構成で始める
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
