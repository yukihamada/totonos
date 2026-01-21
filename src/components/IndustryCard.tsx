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

interface IndustryCardProps {
  template: IndustryTemplate;
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

export function IndustryCard({ template }: IndustryCardProps) {
  // Get the icon component from the map, or use a default
  const IconComponent = template.icon ? iconMap[template.icon] : null;

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

          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {template.description || `${template.name}に特化した業務管理テンプレート`}
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
