import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Star } from 'lucide-react';
import type { IndustryTemplate } from '@/types/industry-template';

interface IndustryCardProps {
  template: IndustryTemplate;
}

export function IndustryCard({ template }: IndustryCardProps) {
  return (
    <Link to={`/lp/${template.template_key}`}>
      <Card className="h-full transition-all hover:shadow-md hover:border-primary/50 group">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ backgroundColor: `${template.color || 'hsl(var(--primary))'}20` }}
            >
              {template.icon || '🏢'}
            </div>
            {template.is_featured && (
              <Badge variant="secondary" className="gap-1">
                <Star className="h-3 w-3" />
                おすすめ
              </Badge>
            )}
          </div>

          <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
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
