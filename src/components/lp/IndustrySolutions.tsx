import { CheckCircle, Zap, Shield, BarChart3, FileText, Users } from 'lucide-react';
import type { Solution } from '@/types/industry-template';

interface IndustrySolutionsProps {
  solutions: Solution[] | null | undefined;
  industryName: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  CheckCircle,
  Zap,
  Shield,
  BarChart3,
  FileText,
  Users,
};

export function IndustrySolutions({ solutions, industryName }: IndustrySolutionsProps) {
  const defaultSolutions: Solution[] = [
    {
      icon: 'Zap',
      title: '業種別テンプレートで即日稼働',
      description: '初期設定なしで、すぐに業務を開始できます',
    },
    {
      icon: 'FileText',
      title: '業界標準の勘定科目を搭載',
      description: '面倒な科目設定不要。業界の慣習に沿った会計処理が可能',
    },
    {
      icon: 'BarChart3',
      title: '経営状況をリアルタイムで把握',
      description: 'ダッシュボードで売上・経費・利益を一目で確認',
    },
  ];

  const items = solutions?.length ? solutions : defaultSolutions;

  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Totonosで解決
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {industryName}向けに最適化された機能で、業務効率を大幅に改善
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {items.map((solution, index) => {
            const IconComponent = iconMap[solution.icon] || CheckCircle;
            return (
              <div
                key={index}
                className="text-center p-6"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <IconComponent className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{solution.title}</h3>
                <p className="text-muted-foreground">{solution.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
