import { useParams, Navigate } from 'react-router-dom';
import { useIndustryTemplateByKey } from '@/hooks/useIndustryTemplates';
import { IndustryLandingLayout } from '@/components/lp/IndustryLandingLayout';
import { IndustryHero } from '@/components/lp/IndustryHero';
import { IndustryPainPoints } from '@/components/lp/IndustryPainPoints';
import { IndustrySolutions } from '@/components/lp/IndustrySolutions';
import { IndustryFeatures } from '@/components/lp/IndustryFeatures';
import { IndustryFAQ } from '@/components/lp/IndustryFAQ';
import { IndustryCTA } from '@/components/lp/IndustryCTA';
import { Skeleton } from '@/components/ui/skeleton';
import { Helmet } from 'react-helmet-async';

export default function IndustryLanding() {
  const { template } = useParams<{ template: string }>();
  const { data: templateData, isLoading, error } = useIndustryTemplateByKey(template);

  if (isLoading) {
    return (
      <IndustryLandingLayout>
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <Skeleton className="h-12 w-3/4 mx-auto" />
            <Skeleton className="h-6 w-1/2 mx-auto" />
            <Skeleton className="h-10 w-40 mx-auto" />
          </div>
        </div>
      </IndustryLandingLayout>
    );
  }

  if (error || !templateData) {
    return <Navigate to="/industries" replace />;
  }

  const { landing_content, menu_config } = templateData;

  const heroTitle = landing_content?.hero_title || `${templateData.name}向け業務管理システム`;
  const heroSubtitle = landing_content?.hero_subtitle || templateData.description;
  const ctaText = landing_content?.cta_text || 'この業種で始める';

  return (
    <>
      <Helmet>
        <title>{templateData.name}向け業務管理 | Totonos</title>
        <meta 
          name="description" 
          content={`${templateData.name}に特化した業務管理システム。請求書、経費精算、顧客管理をオールインワンで。14日間無料トライアル実施中。`} 
        />
        <meta name="keywords" content={templateData.keywords?.join(', ') || `${templateData.name}, 業務管理, 請求書, 経費精算`} />
        <link rel="canonical" href={`https://totonos.lovable.app/lp/${template}`} />
      </Helmet>

      <IndustryLandingLayout>
        <IndustryHero
          title={heroTitle}
          subtitle={heroSubtitle}
          templateKey={templateData.template_key}
          color={templateData.color}
        />

        <IndustryPainPoints
          painPoints={landing_content?.pain_points}
          industryName={templateData.name}
        />

        <IndustrySolutions
          solutions={landing_content?.solutions}
          industryName={templateData.name}
        />

        <IndustryFeatures
          features={landing_content?.features}
          emphasizedFeatures={menu_config?.emphasized_features}
        />

        <IndustryFAQ
          faq={landing_content?.faq}
          industryName={templateData.name}
        />

        <IndustryCTA
          ctaText={ctaText}
          templateKey={templateData.template_key}
          industryName={templateData.name}
        />
      </IndustryLandingLayout>
    </>
  );
}
