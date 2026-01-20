import { useState } from 'react';
import { useTemplatesGroupedByCategory } from '@/hooks/useIndustryTemplates';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Star, Check } from 'lucide-react';
import { CATEGORY_LABELS, type IndustryTemplate, type TemplateCategory } from '@/types/industry-template';
import { Skeleton } from '@/components/ui/skeleton';

interface IndustrySelectorProps {
  selectedTemplate: IndustryTemplate | null;
  onSelect: (template: IndustryTemplate) => void;
}

export function IndustrySelector({ selectedTemplate, onSelect }: IndustrySelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: groupedTemplates, isLoading } = useTemplatesGroupedByCategory();

  const categories = Object.keys(CATEGORY_LABELS) as TemplateCategory[];

  const filterTemplates = (templates: IndustryTemplate[] | undefined) => {
    if (!templates) return [];
    if (!searchQuery) return templates;
    
    const query = searchQuery.toLowerCase();
    return templates.filter(t => 
      t.name.toLowerCase().includes(query) ||
      t.name_en?.toLowerCase().includes(query) ||
      t.description?.toLowerCase().includes(query)
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="業種を検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="all" className="text-xs">
            すべて
          </TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger key={category} value={category} className="text-xs">
              {CATEGORY_LABELS[category]}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto">
            {categories.flatMap(category => 
              filterTemplates(groupedTemplates?.[category])
            ).map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                isSelected={selectedTemplate?.id === template.id}
                onSelect={onSelect}
              />
            ))}
          </div>
        </TabsContent>

        {categories.map((category) => (
          <TabsContent key={category} value={category} className="mt-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto">
              {filterTemplates(groupedTemplates?.[category]).map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isSelected={selectedTemplate?.id === template.id}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

interface TemplateCardProps {
  template: IndustryTemplate;
  isSelected: boolean;
  onSelect: (template: IndustryTemplate) => void;
}

function TemplateCard({ template, isSelected, onSelect }: TemplateCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected 
          ? 'border-primary ring-2 ring-primary/20' 
          : 'hover:border-primary/50'
      }`}
      onClick={() => onSelect(template)}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-2">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
            style={{ backgroundColor: `${template.color || 'hsl(var(--primary))'}20` }}
          >
            {template.icon || '🏢'}
          </div>
          {isSelected ? (
            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <Check className="h-3 w-3 text-primary-foreground" />
            </div>
          ) : template.is_featured ? (
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          ) : null}
        </div>
        <h4 className="font-medium text-sm">{template.name}</h4>
      </CardContent>
    </Card>
  );
}
