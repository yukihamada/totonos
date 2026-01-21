import { AlertTriangle, Clock, FileX, Calculator, Users, TrendingDown } from 'lucide-react';
import type { PainPoint } from '@/types/industry-template';

interface IndustryPainPointsProps {
  painPoints: PainPoint[] | null | undefined;
  industryName: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  AlertTriangle,
  Clock,
  FileX,
  Calculator,
  Users,
  TrendingDown,
};

export function IndustryPainPoints({ painPoints, industryName }: IndustryPainPointsProps) {
  const defaultPainPoints: PainPoint[] = [
    {
      icon: 'Clock',
      title: '手作業での経理処理',
      description: '毎月の請求書作成や経費精算に多くの時間を費やしている',
    },
    {
      icon: 'FileX',
      title: '書類の管理が煩雑',
      description: '契約書や請求書がバラバラで必要な時にすぐ見つからない',
    },
    {
      icon: 'Calculator',
      title: '業界特有の会計処理',
      description: '一般的なソフトでは業界の慣習に合った処理ができない',
    },
  ];

  const items = painPoints?.length ? painPoints : defaultPainPoints;

  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {industryName}でこんな悩みはありませんか？
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            多くの経営者が抱える共通の課題を、専用テンプレートで解決します
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {items.map((point, index) => {
            const IconComponent = iconMap[point.icon] || AlertTriangle;
            return (
              <div
                key={index}
                className="bg-background rounded-xl p-6 shadow-sm border border-border/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                  <IconComponent className="h-6 w-6 text-destructive" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{point.title}</h3>
                <p className="text-muted-foreground">{point.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
