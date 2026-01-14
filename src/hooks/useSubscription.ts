import { useState } from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { supabase } from '@/integrations/supabase/client';

export type Plan = 'free' | 'pro' | 'enterprise';

export interface PlanFeatures {
  maxUsers: number;
  maxStorage: string;
  features: string[];
  price: number;
  priceLabel: string;
}

export const planFeatures: Record<Plan, PlanFeatures> = {
  free: {
    maxUsers: 3,
    maxStorage: '1GB',
    features: [
      '基本機能',
      'ユーザー3名まで',
      '1GB ストレージ',
      'メールサポート',
    ],
    price: 0,
    priceLabel: '¥0/月',
  },
  pro: {
    maxUsers: -1, // unlimited
    maxStorage: '100GB',
    features: [
      '全機能利用可能',
      '無制限ユーザー',
      '100GB ストレージ',
      '優先サポート',
      'API アクセス',
      'カスタムレポート',
    ],
    price: 2980,
    priceLabel: '¥2,980/月/ユーザー',
  },
  enterprise: {
    maxUsers: -1,
    maxStorage: 'unlimited',
    features: [
      'Pro の全機能',
      'SSO/SAML 対応',
      '専用サポート',
      'SLA 保証',
      'オンプレミス対応',
      'カスタム契約',
    ],
    price: -1,
    priceLabel: 'お問い合わせ',
  },
};

export function useSubscription() {
  const { organization, refreshOrganizations } = useOrganization();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentPlan = (organization?.plan as Plan) || 'free';
  const features = planFeatures[currentPlan];

  const createCheckoutSession = async (priceId: string) => {
    if (!organization) {
      setError('組織が選択されていません');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await supabase.functions.invoke('create-subscription', {
        body: {
          priceId,
          organizationId: organization.id,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const upgradeToPro = async () => {
    const proPriceId = import.meta.env.VITE_STRIPE_PRO_PRICE_ID;
    if (!proPriceId) {
      setError('Stripe price ID が設定されていません');
      return null;
    }
    return createCheckoutSession(proPriceId);
  };

  const upgradeToEnterprise = async () => {
    // Enterprise is contact-based, redirect to contact form
    window.location.href = 'mailto:sales@totonos.jp?subject=Enterprise プランのお問い合わせ';
    return null;
  };

  const cancelSubscription = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await supabase.functions.invoke('cancel-subscription', {
        body: {
          organizationId: organization?.id,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      await refreshOrganizations();
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const canUpgrade = (targetPlan: Plan): boolean => {
    const planOrder: Plan[] = ['free', 'pro', 'enterprise'];
    return planOrder.indexOf(targetPlan) > planOrder.indexOf(currentPlan);
  };

  const isFeatureAvailable = (feature: string): boolean => {
    return features.features.includes(feature);
  };

  const getUserLimit = (): number => {
    return features.maxUsers;
  };

  const getStorageLimit = (): string => {
    return features.maxStorage;
  };

  return {
    currentPlan,
    features,
    loading,
    error,
    upgradeToPro,
    upgradeToEnterprise,
    cancelSubscription,
    canUpgrade,
    isFeatureAvailable,
    getUserLimit,
    getStorageLimit,
    createCheckoutSession,
  };
}