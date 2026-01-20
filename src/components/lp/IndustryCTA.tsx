import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface IndustryCTAProps {
  ctaText: string;
  templateKey: string;
  industryName: string;
}

export function IndustryCTA({ ctaText, templateKey, industryName }: IndustryCTAProps) {
  const benefits = [
    '14日間無料トライアル',
    'クレジットカード不要',
    'いつでもキャンセル可能',
  ];

  return (
    <section className="py-16 lg:py-24 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {industryName}向けに最適化された
            <br />
            業務管理を今すぐ始めよう
          </h2>

          <p className="text-primary-foreground/80 text-lg mb-8">
            面倒な初期設定は不要。登録後すぐに業務を開始できます。
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              size="lg" 
              variant="secondary"
              asChild 
              className="text-lg px-8"
            >
              <Link to={`/auth?template=${templateKey}`}>
                {ctaText}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-primary-foreground/80">
                <CheckCircle className="h-4 w-4" />
                {benefit}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
