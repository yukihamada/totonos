import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface IndustryHeroProps {
  title: string;
  subtitle?: string | null;
  templateKey: string;
  color?: string | null;
}

export function IndustryHero({ title, subtitle, templateKey, color }: IndustryHeroProps) {
  const highlights = [
    '初期設定不要ですぐに使える',
    '業界特化の勘定科目を標準搭載',
    '14日間無料トライアル',
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <CheckCircle className="h-4 w-4" />
            業種特化テンプレート
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            {title}
          </h1>

          {subtitle && (
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" asChild className="text-lg px-8">
              <Link to={`/auth?template=${templateKey}`}>
                無料で始める
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8">
              <Link to="/industries">
                他の業種を見る
              </Link>
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            {highlights.map((highlight, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-primary" />
                {highlight}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div 
        className="absolute inset-0 -z-10 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 30% 20%, ${color || 'hsl(var(--primary))'} 0%, transparent 50%)`,
        }}
      />
    </section>
  );
}
