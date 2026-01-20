import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTemplatesGroupedByCategory, useFeaturedTemplates } from '@/hooks/useIndustryTemplates';
import { IndustryLandingLayout } from '@/components/lp/IndustryLandingLayout';
import { IndustryCard } from '@/components/IndustryCard';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, ArrowRight, Sparkles } from 'lucide-react';
import { CATEGORY_LABELS, type TemplateCategory, type IndustryTemplate } from '@/types/industry-template';

export default function Industries() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: groupedTemplates, isLoading } = useTemplatesGroupedByCategory();
  const { data: featuredTemplates } = useFeaturedTemplates();

  const categories = Object.keys(CATEGORY_LABELS) as TemplateCategory[];

  const filterTemplates = (templates: IndustryTemplate[] | undefined) => {
    if (!templates) return [];
    if (!searchQuery) return templates;
    
    const query = searchQuery.toLowerCase();
    return templates.filter(t => 
      t.name.toLowerCase().includes(query) ||
      t.name_en?.toLowerCase().includes(query) ||
      t.description?.toLowerCase().includes(query)
    );
  };

  const allFilteredTemplates = categories.flatMap(category => 
    filterTemplates(groupedTemplates?.[category])
  );

  return (
    <>
      <Helmet>
        <title>業種別テンプレート一覧 | Totonos</title>
        <meta 
          name="description" 
          content="28業種に対応した業務管理テンプレート。小売、飲食、医療、建設、ITなど、あなたの業種に最適化されたシステムをすぐに使い始められます。" 
        />
        <link rel="canonical" href="https://totonos.lovable.app/industries" />
      </Helmet>

      <IndustryLandingLayout>
        {/* Hero Section */}
        <section className="py-16 lg:py-24 bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                あなたの業種に最適化された
                <br />
                業務管理テンプレート
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                28業種に対応。業界特有の勘定科目や機能が最初から設定済み。
                <br />
                面倒な初期設定なしで、すぐに業務を開始できます。
              </p>

              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="業種を検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 text-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Featured Templates */}
        {!searchQuery && featuredTemplates && featuredTemplates.length > 0 && (
          <section className="py-12 border-b">
            <div className="container mx-auto px-4">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                <h2 className="text-xl font-semibold">おすすめの業種</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredTemplates.map((template) => (
                  <IndustryCard key={template.id} template={template} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* All Templates */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
                  <Skeleton key={i} className="h-48" />
                ))}
              </div>
            ) : searchQuery ? (
              <>
                <p className="text-muted-foreground mb-6">
                  「{searchQuery}」の検索結果: {allFilteredTemplates.length}件
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allFilteredTemplates.map((template) => (
                    <IndustryCard key={template.id} template={template} />
                  ))}
                </div>
                {allFilteredTemplates.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">
                      該当する業種が見つかりませんでした
                    </p>
                    <Button variant="outline" onClick={() => setSearchQuery('')}>
                      検索をクリア
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <Tabs defaultValue={categories[0]} className="w-full">
                <TabsList className="w-full flex-wrap h-auto gap-2 p-2 mb-8">
                  {categories.map((category) => (
                    <TabsTrigger key={category} value={category}>
                      {CATEGORY_LABELS[category]}
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({groupedTemplates?.[category]?.length || 0})
                      </span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {categories.map((category) => (
                  <TabsContent key={category} value={category}>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {groupedTemplates?.[category]?.map((template) => (
                        <IndustryCard key={template.id} template={template} />
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              お探しの業種が見つからない場合
            </h2>
            <p className="text-muted-foreground mb-6">
              汎用テンプレートで開始し、後から自由にカスタマイズできます
            </p>
            <Button size="lg" asChild>
              <Link to="/auth">
                汎用テンプレートで始める
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </IndustryLandingLayout>
    </>
  );
}
