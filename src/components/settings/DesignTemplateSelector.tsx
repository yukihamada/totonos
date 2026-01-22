import { Check, Layout, Cog, Minus, Sparkles, Square, Building2, Rocket, Heart, Palette, Radio, Crown, Smile, Moon, Leaf, Cpu, LucideIcon } from "lucide-react";
import { designTemplates, DesignTemplate } from "@/types/design-templates";
import { cn } from "@/lib/utils";

interface DesignTemplateSelectorProps {
  value: string;
  onChange: (templateId: string) => void;
}

const iconMap: Record<string, LucideIcon> = {
  Layout,
  Cog,
  Minus,
  Sparkles,
  Square,
  Building2,
  Rocket,
  Heart,
  Palette,
  Radio,
  Crown,
  Smile,
  Moon,
  Leaf,
  Cpu,
};

export function DesignTemplateSelector({ value, onChange }: DesignTemplateSelectorProps) {
  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent className="h-6 w-6" /> : null;
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">デザインテンプレート</h3>
        <p className="text-sm text-muted-foreground">アプリケーション全体のデザインスタイルを選択</p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {designTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            isSelected={value === template.id}
            onClick={() => onChange(template.id)}
            icon={getIcon(template.icon)}
          />
        ))}
      </div>
    </div>
  );
}

interface TemplateCardProps {
  template: DesignTemplate;
  isSelected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}

function TemplateCard({ template, isSelected, onClick, icon }: TemplateCardProps) {
  // border-radius: fullの場合はカードには適用せず、md程度に制限
  const cardRadius = template.styles.borderRadius === 'none' ? '0' :
                     template.styles.borderRadius === 'sm' ? '0.25rem' :
                     template.styles.borderRadius === 'md' ? '0.5rem' :
                     template.styles.borderRadius === 'lg' ? '0.75rem' : '1rem';
  
  // アイコン背景のradius
  const iconRadius = template.styles.borderRadius === 'full' ? '9999px' : cardRadius;
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center p-4 border-2 transition-all",
        "hover:border-primary/50 hover:bg-accent/50",
        isSelected
          ? "border-primary bg-primary/10"
          : "border-border bg-card"
      )}
      style={{ borderRadius: cardRadius }}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 h-5 w-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
          <Check className="h-3 w-3" />
        </div>
      )}
      
      <div 
        className="mb-3 p-3 flex items-center justify-center"
        style={{
          borderRadius: iconRadius,
          backgroundColor: template.styles.accentHue 
            ? `hsl(${template.styles.accentHue}, 60%, 85%)` 
            : 'hsl(var(--muted))',
        }}
      >
        <span style={{
          color: template.styles.accentHue 
            ? `hsl(${template.styles.accentHue}, 70%, 30%)` 
            : 'hsl(var(--foreground))'
        }}>
          {icon}
        </span>
      </div>
      
      <span className="text-sm font-medium text-center text-foreground">{template.name}</span>
      <span className="text-xs text-muted-foreground text-center mt-1 line-clamp-2">
        {template.description}
      </span>
    </button>
  );
}
