import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Check, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

// All available feature groups with labels
const ALL_FEATURES: Record<string, { label: string; category: string }> = {
  crm: { label: 'CRM', category: 'core' },
  sales: { label: '営業', category: 'core' },
  documents: { label: '帳票', category: 'core' },
  accounting: { label: '会計', category: 'core' },
  inventory: { label: '在庫管理', category: 'core' },
  purchasing: { label: '仕入管理', category: 'core' },
  contracts: { label: '契約管理', category: 'core' },
  members: { label: '会員管理', category: 'core' },
  emr: { label: '電子カルテ', category: 'core' },
  projects: { label: 'プロジェクト', category: 'productivity' },
  expenses: { label: '経費精算', category: 'productivity' },
  hr: { label: '人事・労務', category: 'productivity' },
  recruiting: { label: '採用', category: 'productivity' },
  billing: { label: '課金', category: 'productivity' },
  support: { label: 'サポート', category: 'productivity' },
  marketing: { label: 'マーケ', category: 'productivity' },
  lms: { label: 'LMS', category: 'productivity' },
  legal: { label: '法務', category: 'productivity' },
  info: { label: '情報管理', category: 'other' },
  integrations: { label: '連携', category: 'other' },
  retail: { label: '小売', category: 'other' },
  finance: { label: 'ファイナンス', category: 'other' },
};

interface MenuGroup {
  id: string;
  priority?: number;
}

interface IndustryFeatureSelectorProps {
  menuGroups?: MenuGroup[];
  hiddenFeatures?: string[];
  emphasizedFeatures?: string[];
  onFeaturesChange?: (features: string[]) => void;
  compact?: boolean;
}

export function IndustryFeatureSelector({
  menuGroups = [],
  hiddenFeatures = [],
  emphasizedFeatures = [],
  onFeaturesChange,
  compact = false,
}: IndustryFeatureSelectorProps) {
  // Get default enabled features from menu_groups
  const defaultEnabled = menuGroups.map(g => g.id);
  
  // Initialize state with default enabled features
  const [enabledFeatures, setEnabledFeatures] = useState<Set<string>>(
    new Set(defaultEnabled)
  );
  const [showOthers, setShowOthers] = useState(false);

  // Categorize features
  const primaryFeatures = defaultEnabled.slice(0, 4); // First 4 are primary (default ON)
  const suggestedFeatures = hiddenFeatures.slice(0, 4); // Suggested but OFF
  const otherFeatures = Object.keys(ALL_FEATURES).filter(
    id => !primaryFeatures.includes(id) && !suggestedFeatures.includes(id)
  );

  const toggleFeature = (featureId: string) => {
    const newEnabled = new Set(enabledFeatures);
    if (newEnabled.has(featureId)) {
      newEnabled.delete(featureId);
    } else {
      newEnabled.add(featureId);
    }
    setEnabledFeatures(newEnabled);
    onFeaturesChange?.(Array.from(newEnabled));
  };

  const totalEnabled = enabledFeatures.size;
  const totalAvailable = Object.keys(ALL_FEATURES).length;

  if (compact) {
    return (
      <div className="space-y-2">
        {/* Compact view for card */}
        <div className="flex flex-wrap gap-1.5">
          {primaryFeatures.slice(0, 3).map(id => (
            <Badge
              key={id}
              variant="default"
              className="text-xs px-2 py-0.5 gap-1"
            >
              <Check className="h-3 w-3" />
              {ALL_FEATURES[id]?.label || id}
            </Badge>
          ))}
        </div>
        
        {suggestedFeatures.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {suggestedFeatures.slice(0, 2).map(id => (
              <Badge
                key={id}
                variant="outline"
                className="text-xs px-2 py-0.5 gap-1 text-muted-foreground border-dashed"
              >
                <Plus className="h-3 w-3" />
                {ALL_FEATURES[id]?.label || id}
              </Badge>
            ))}
            <Badge
              variant="secondary"
              className="text-xs px-2 py-0.5 bg-muted/50 text-muted-foreground"
            >
              +{totalAvailable - 5}機能
            </Badge>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4" onClick={e => e.preventDefault()}>
      {/* Header with count */}
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">
          利用する機能を選択
        </div>
        <Badge variant="secondary" className="text-xs">
          {totalEnabled}/{totalAvailable} 機能選択中
        </Badge>
      </div>

      {/* Primary features - Default ON */}
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
          業界標準機能（デフォルトON）
        </div>
        <div className="grid grid-cols-2 gap-2">
          {primaryFeatures.map(id => (
            <FeatureToggle
              key={id}
              id={id}
              label={ALL_FEATURES[id]?.label || id}
              enabled={enabledFeatures.has(id)}
              recommended
              onToggle={() => toggleFeature(id)}
            />
          ))}
        </div>
      </div>

      {/* Suggested features - Default OFF but recommended */}
      {suggestedFeatures.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-muted-foreground"></span>
            おすすめ機能（ワンクリックで追加）
          </div>
          <div className="grid grid-cols-2 gap-2">
            {suggestedFeatures.map(id => (
              <FeatureToggle
                key={id}
                id={id}
                label={ALL_FEATURES[id]?.label || id}
                enabled={enabledFeatures.has(id)}
                onToggle={() => toggleFeature(id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Other features - Collapsed by default */}
      <div className="space-y-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-between text-xs text-muted-foreground hover:text-foreground h-8"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowOthers(!showOthers);
          }}
        >
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-muted"></span>
            その他の機能（{otherFeatures.length}種類）
          </span>
          {showOthers ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
        
        {showOthers && (
          <div className="grid grid-cols-2 gap-2 pt-1 animate-in slide-in-from-top-2 duration-200">
            {otherFeatures.map(id => (
              <FeatureToggle
                key={id}
                id={id}
                label={ALL_FEATURES[id]?.label || id}
                enabled={enabledFeatures.has(id)}
                onToggle={() => toggleFeature(id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Note */}
      <p className="text-xs text-muted-foreground text-center pt-2 border-t">
        すべての機能は登録後いつでも変更できます
      </p>
    </div>
  );
}

interface FeatureToggleProps {
  id: string;
  label: string;
  enabled: boolean;
  recommended?: boolean;
  onToggle: () => void;
}

function FeatureToggle({ id, label, enabled, recommended, onToggle }: FeatureToggleProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer",
        enabled
          ? "bg-primary/5 border-primary/30"
          : "bg-muted/30 border-transparent hover:border-muted-foreground/20"
      )}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
    >
      <span className={cn(
        "text-sm",
        enabled ? "text-foreground font-medium" : "text-muted-foreground"
      )}>
        {label}
      </span>
      <Switch
        checked={enabled}
        onCheckedChange={onToggle}
        className="scale-75"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
