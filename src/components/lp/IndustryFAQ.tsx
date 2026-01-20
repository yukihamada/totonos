import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { FAQItem } from '@/types/industry-template';

interface IndustryFAQProps {
  faq: FAQItem[] | null | undefined;
  industryName: string;
}

const defaultFAQ: FAQItem[] = [
  {
    question: '無料トライアルはありますか？',
    answer: 'はい、14日間の無料トライアルをご用意しています。クレジットカード登録不要でお試しいただけます。',
  },
  {
    question: '他のソフトからデータ移行できますか？',
    answer: 'はい、CSV形式でのデータインポートに対応しています。既存の顧客データや取引履歴を簡単に移行できます。',
  },
  {
    question: '複数のスタッフで使えますか？',
    answer: 'はい、チームメンバーを招待して共同で利用できます。権限設定により、スタッフごとにアクセスできる機能を制限することも可能です。',
  },
  {
    question: 'スマートフォンでも使えますか？',
    answer: 'はい、レスポンシブデザインに対応しており、スマートフォンやタブレットからもご利用いただけます。外出先でも経費入力や売上確認が可能です。',
  },
  {
    question: 'サポートはありますか？',
    answer: 'はい、チャットサポートとメールサポートをご用意しています。操作方法や設定についてお気軽にお問い合わせください。',
  },
];

export function IndustryFAQ({ faq, industryName }: IndustryFAQProps) {
  const items = faq?.length ? faq : defaultFAQ;

  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            よくある質問
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {industryName}のお客様からよくいただく質問
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {items.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-background border border-border/50 rounded-lg px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline py-4">
                  <span className="font-medium">{item.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
