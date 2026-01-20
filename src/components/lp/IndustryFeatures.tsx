import { 
  FileText, 
  Receipt, 
  Calculator, 
  Users, 
  BarChart3, 
  FileCheck,
  Package,
  Truck,
  Calendar,
  MessageSquare 
} from 'lucide-react';
import type { Feature } from '@/types/industry-template';

interface IndustryFeaturesProps {
  features: Feature[] | null | undefined;
  emphasizedFeatures?: string[] | null;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText,
  Receipt,
  Calculator,
  Users,
  BarChart3,
  FileCheck,
  Package,
  Truck,
  Calendar,
  MessageSquare,
};

const defaultFeatures: Feature[] = [
  {
    icon: 'FileText',
    title: '請求書・見積書作成',
    description: 'プロフェッショナルな書類をワンクリックで作成。PDFダウンロードやメール送信も簡単。',
  },
  {
    icon: 'Receipt',
    title: '経費精算・レシート管理',
    description: 'スマホでレシートを撮影するだけで自動読み取り。面倒な入力作業を削減。',
  },
  {
    icon: 'Calculator',
    title: '会計・仕訳',
    description: '業種別の勘定科目で正確な仕訳。決算書類も自動生成。',
  },
  {
    icon: 'Users',
    title: '顧客・取引先管理',
    description: '顧客情報を一元管理。取引履歴やコミュニケーション履歴も記録。',
  },
  {
    icon: 'BarChart3',
    title: 'レポート・分析',
    description: '売上推移、経費分析、キャッシュフローをビジュアルで確認。',
  },
  {
    icon: 'FileCheck',
    title: '契約書管理',
    description: '契約書の作成から電子署名まで。更新期限のアラートも自動通知。',
  },
];

export function IndustryFeatures({ features, emphasizedFeatures }: IndustryFeaturesProps) {
  const items = features?.length ? features : defaultFeatures;

  const isEmphasized = (title: string) => {
    if (!emphasizedFeatures) return false;
    return emphasizedFeatures.some(f => 
      title.toLowerCase().includes(f.toLowerCase())
    );
  };

  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            主な機能
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            業務に必要な機能をオールインワンで提供
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {items.map((feature, index) => {
            const IconComponent = iconMap[feature.icon] || FileText;
            const emphasized = isEmphasized(feature.title);
            
            return (
              <div
                key={index}
                className={`
                  bg-background rounded-xl p-6 border transition-all
                  ${emphasized 
                    ? 'border-primary shadow-md ring-1 ring-primary/20' 
                    : 'border-border/50 hover:border-border'
                  }
                `}
              >
                <div className={`
                  w-10 h-10 rounded-lg flex items-center justify-center mb-4
                  ${emphasized ? 'bg-primary text-primary-foreground' : 'bg-muted'}
                `}>
                  <IconComponent className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {feature.title}
                  {emphasized && (
                    <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      おすすめ
                    </span>
                  )}
                </h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
