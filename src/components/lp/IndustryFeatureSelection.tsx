import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { IndustryFeatureSelector } from '@/components/IndustryFeatureSelector';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useState, useCallback } from 'react';

interface IndustryFeatureSelectionProps {
  templateKey: string;
  industryName: string;
  menuConfig?: {
    menu_groups?: Array<{ id: string; priority?: number }>;
    hidden_features?: string[];
    emphasized_features?: string[];
  };
}

export function IndustryFeatureSelection({ 
  templateKey, 
  industryName,
  menuConfig 
}: IndustryFeatureSelectionProps) {
  const navigate = useNavigate();
  
  // Get default enabled features from menu_config
  const defaultEnabled = menuConfig?.menu_groups?.map(g => g.id) || [
    'invoices', 'expenses', 'accounting', 'crm'
  ];
  
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(defaultEnabled);

  const handleFeaturesChange = useCallback((features: string[]) => {
    setSelectedFeatures(features);
  }, []);

  const handleStartWithFeatures = () => {
    const featuresParam = selectedFeatures.join(',');
    navigate(`/auth?template=${templateKey}&features=${featuresParam}`);
  };

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              カスタマイズ可能
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              必要な機能を選んで始める
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {industryName}に必要な機能をカスタマイズ。後からいつでも変更できます。
            </p>
          </div>

          <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm">
            <IndustryFeatureSelector
              menuGroups={menuConfig?.menu_groups}
              hiddenFeatures={menuConfig?.hidden_features}
              emphasizedFeatures={menuConfig?.emphasized_features}
              onFeaturesChange={handleFeaturesChange}
              compact={false}
            />
            
            <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                すべての機能は後から自由に変更できます
              </p>
              <Button 
                size="lg" 
                onClick={handleStartWithFeatures}
                className="w-full sm:w-auto"
              >
                {selectedFeatures.length}個の機能で始める
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
