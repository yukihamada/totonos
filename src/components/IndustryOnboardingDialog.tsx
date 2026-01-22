import { useState, useMemo } from "react";
import { Building2, Search, ArrowRight, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIndustryTemplatesWithConfig } from "@/hooks/useIndustryTemplates";
import { CATEGORY_LABELS, type TemplateCategory } from "@/types/industry-template";
import { 
  ShoppingCart, Utensils, Briefcase, Heart, HardHat, 
  Code, Truck, GraduationCap, Store, Car, Dog, Pill, 
  Gem, Sofa, Building, Scissors, Dumbbell, Hotel, Sparkle, 
  Home, Coffee, Cake, Stethoscope, Baby, Ambulance, Cross,
  Cat, Monitor, Film, Calculator, Rocket, Megaphone, Camera,
  Package, Tractor, Warehouse, Bike, Scale, FileText, Receipt,
  Compass, PenTool, Languages, Users, School, HeartHandshake
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  ShoppingCart,
  Utensils,
  Briefcase,
  Heart,
  HardHat,
  Code,
  Truck,
  GraduationCap,
  Store,
  Car,
  Dog,
  Pill,
  Gem,
  Sofa,
  Building,
  Scissors,
  Dumbbell,
  Hotel,
  Sparkle,
  Home,
  Coffee,
  Cake,
  Stethoscope,
  Baby,
  Ambulance,
  Cross,
  Cat,
  Monitor,
  Film,
  Calculator,
  Rocket,
  Megaphone,
  Camera,
  Package,
  Tractor,
  Warehouse,
  Bike,
  Scale,
  FileText,
  Receipt,
  Compass,
  PenTool,
  Languages,
  Users,
  School,
  HeartHandshake,
};

const categoryIcons: Record<TemplateCategory, LucideIcon> = {
  retail: ShoppingCart,
  service: Utensils,
  professional: Briefcase,
  healthcare: Heart,
  construction: HardHat,
  it: Code,
  logistics: Truck,
  education: GraduationCap,
};

interface IndustryOnboardingDialogProps {
  open: boolean;
  onComplete: (templateKey: string) => Promise<void>;
  isLoading?: boolean;
}

export function IndustryOnboardingDialog({ 
  open, 
  onComplete, 
  isLoading 
}: IndustryOnboardingDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | "all">("all");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const { data: templates = [], isLoading: templatesLoading } = useIndustryTemplatesWithConfig();

  // Group templates by category
  const templatesByCategory = useMemo(() => {
    const grouped: Record<TemplateCategory, typeof templates> = {
      retail: [],
      service: [],
      professional: [],
      healthcare: [],
      construction: [],
      it: [],
      logistics: [],
      education: [],
    };

    templates.forEach((template) => {
      if (grouped[template.category as TemplateCategory]) {
        grouped[template.category as TemplateCategory].push(template);
      }
    });

    return grouped;
  }, [templates]);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    let filtered = templates;

    if (selectedCategory !== "all") {
      filtered = filtered.filter((t) => t.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query) ||
          t.keywords?.some((k) => k.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [templates, selectedCategory, searchQuery]);

  const handleSelect = async () => {
    if (selectedTemplate) {
      await onComplete(selectedTemplate);
    }
  };

  const categories = Object.keys(CATEGORY_LABELS) as TemplateCategory[];

  return (
    <Dialog open={open}>
      <DialogContent 
        className="sm:max-w-4xl max-h-[90vh]" 
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            <DialogTitle>業種を選択</DialogTitle>
          </div>
          <DialogDescription>
            業種を選択すると、その業種に最適化されたメニューや機能が自動で設定されます。
            後から変更することもできます。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="業種を検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as TemplateCategory | "all")}>
            <TabsList className="flex flex-wrap h-auto gap-1 bg-transparent p-0">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                すべて
              </TabsTrigger>
              {categories.map((cat) => {
                const Icon = categoryIcons[cat];
                return (
                  <TabsTrigger
                    key={cat}
                    value={cat}
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <Icon className="h-4 w-4 mr-1" />
                    {CATEGORY_LABELS[cat]}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>

          {/* Template Grid */}
          <ScrollArea className="h-[400px] pr-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredTemplates.map((template) => {
                const IconComponent = template.icon 
                  ? iconMap[template.icon] || Building2 
                  : Building2;
                const isSelected = selectedTemplate === template.template_key;

                return (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected 
                        ? "ring-2 ring-primary border-primary" 
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedTemplate(template.template_key)}
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col items-center text-center space-y-2">
                        <div 
                          className={`p-3 rounded-lg ${
                            isSelected 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-muted"
                          }`}
                          style={!isSelected && template.color ? { 
                            backgroundColor: `${template.color}20`,
                            color: template.color 
                          } : undefined}
                        >
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium text-sm leading-tight">
                            {template.name}
                          </p>
                          {template.is_featured && (
                            <Badge variant="secondary" className="text-xs">
                              <Sparkles className="h-3 w-3 mr-1" />
                              おすすめ
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredTemplates.length === 0 && !templatesLoading && (
              <div className="text-center py-8 text-muted-foreground">
                該当する業種が見つかりませんでした
              </div>
            )}

            {templatesLoading && (
              <div className="text-center py-8 text-muted-foreground">
                読み込み中...
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {selectedTemplate ? (
              <>選択中: <span className="font-medium text-foreground">{templates.find(t => t.template_key === selectedTemplate)?.name}</span></>
            ) : (
              "業種を選択してください"
            )}
          </p>
          <Button 
            onClick={handleSelect} 
            disabled={!selectedTemplate || isLoading}
            className="gap-2"
          >
            {isLoading ? "設定中..." : "この業種で始める"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
