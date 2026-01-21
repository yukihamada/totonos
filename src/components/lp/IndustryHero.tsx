import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, Bot, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface IndustryHeroProps {
  title: string;
  subtitle?: string | null;
  templateKey: string;
  color?: string | null;
}

// Typing animation texts for each industry
const getTypingTexts = (industryName: string): string[] => [
  `「${industryName}の請求書を作成」`,
  `「今月の売上を教えて」`,
  `「新規顧客を登録」`,
  `「経費を登録 3000円」`,
];

export function IndustryHero({ title, subtitle, templateKey, color }: IndustryHeroProps) {
  const highlights = [
    '初期設定不要ですぐに使える',
    '業界特化の勘定科目を標準搭載',
    '14日間無料トライアル',
  ];

  // Extract industry name from title
  const industryName = title.replace(/向け.*$/, '');
  const typingTexts = getTypingTexts(industryName);

  const [displayText, setDisplayText] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentText = typingTexts[textIndex];
    
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (charIndex < currentText.length) {
          setDisplayText(currentText.substring(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        } else {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (charIndex > 0) {
          setDisplayText(currentText.substring(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        } else {
          setIsDeleting(false);
          setTextIndex((textIndex + 1) % typingTexts.length);
        }
      }
    }, isDeleting ? 30 : 80);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, textIndex, typingTexts]);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
            <CheckCircle className="h-4 w-4" />
            業種特化テンプレート
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 animate-fade-in [animation-delay:100ms]">
            {title}
          </h1>

          {subtitle && (
            <p className="text-lg md:text-xl text-muted-foreground mb-6 max-w-2xl mx-auto animate-fade-in [animation-delay:200ms]">
              {subtitle}
            </p>
          )}

          {/* Typing Animation */}
          <div className="h-16 flex items-center justify-center mb-6 animate-fade-in [animation-delay:300ms]">
            <div className="bg-muted/50 border-2 border-foreground/20 rounded-lg px-6 py-3 min-w-[280px] md:min-w-[400px]">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                <span className="text-base md:text-lg font-mono">
                  {displayText}
                  <span className="animate-pulse">|</span>
                </span>
              </div>
            </div>
          </div>

          {/* AI Agent Feature */}
          <div className="max-w-xl mx-auto mb-8 p-4 border-2 border-primary bg-primary/5 rounded-lg animate-fade-in [animation-delay:400ms]">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-bold">AIエージェントで全操作可能</span>
            </div>
            <p className="text-sm text-muted-foreground">
              自然言語で話しかけるだけで、請求書作成から経費登録まで全ての業務を操作できます。
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in [animation-delay:500ms]">
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

          <div className="flex flex-wrap justify-center gap-6 animate-fade-in [animation-delay:600ms]">
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
