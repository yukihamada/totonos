import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { grantReferralBonus } from './useCredits';

// 招待報酬定義
export const REFERRAL_REWARDS = {
  signup: { referrer: 50, referee: 50, description: '新規登録' },
  paid: { referrer: 200, referee: 100, description: '有料プラン契約' },
  retention: { referrer: 100, referee: 0, description: '3ヶ月継続' },
} as const;

// 招待バッジ
export const REFERRAL_BADGES = [
  { id: 'bronze', name: 'Bronze', minReferrals: 1, icon: '🥉' },
  { id: 'silver', name: 'Silver', minReferrals: 5, icon: '🥈' },
  { id: 'gold', name: 'Gold', minReferrals: 10, icon: '🥇' },
  { id: 'platinum', name: 'Platinum', minReferrals: 50, icon: '💎' },
] as const;

// 招待履歴
export interface Referral {
  id: string;
  refereeEmail: string;
  refereeId?: string;
  status: 'pending' | 'signup' | 'paid' | 'churned';
  earnedCredits: number;
  createdAt: Date;
  signupAt?: Date;
  paidAt?: Date;
}

// リファラル状態
export interface ReferralState {
  referralCode: string;
  referralLink: string;
  totalReferrals: number;
  totalEarned: number;
  monthlyRank: number;
  badge: typeof REFERRAL_BADGES[number] | null;
  referrals: Referral[];
}

// ローカルストレージキー
const REFERRAL_KEY = 'pulse_referral';

// リファラルコード生成
function generateReferralCode(userId: string): string {
  const hash = userId.slice(0, 4).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PULSE${hash}${random}`;
}

// 状態読み込み
function loadReferralState(userId: string): ReferralState {
  try {
    const stored = localStorage.getItem(`${REFERRAL_KEY}_${userId}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...parsed,
        referrals: parsed.referrals.map((r: Referral) => ({
          ...r,
          createdAt: new Date(r.createdAt),
          signupAt: r.signupAt ? new Date(r.signupAt) : undefined,
          paidAt: r.paidAt ? new Date(r.paidAt) : undefined,
        })),
      };
    }
  } catch {
    // エラー時は初期状態
  }

  const referralCode = generateReferralCode(userId);
  return {
    referralCode,
    referralLink: `${window.location.origin}/signup?ref=${referralCode}`,
    totalReferrals: 0,
    totalEarned: 0,
    monthlyRank: 0,
    badge: null,
    referrals: [],
  };
}

// 状態保存
function saveReferralState(userId: string, state: ReferralState): void {
  localStorage.setItem(`${REFERRAL_KEY}_${userId}`, JSON.stringify(state));
}

// バッジ計算
function calculateBadge(totalReferrals: number): typeof REFERRAL_BADGES[number] | null {
  for (let i = REFERRAL_BADGES.length - 1; i >= 0; i--) {
    if (totalReferrals >= REFERRAL_BADGES[i].minReferrals) {
      return REFERRAL_BADGES[i];
    }
  }
  return null;
}

export function useReferral() {
  const { user } = useAuth();
  const [state, setState] = useState<ReferralState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初期読み込み
  useEffect(() => {
    if (user) {
      const loaded = loadReferralState(user.id);
      setState(loaded);
    }
    setIsLoading(false);
  }, [user]);

  // 招待を記録
  const trackReferral = useCallback((email: string): Referral | null => {
    if (!user || !state) return null;

    const newReferral: Referral = {
      id: crypto.randomUUID(),
      refereeEmail: email,
      status: 'pending',
      earnedCredits: 0,
      createdAt: new Date(),
    };

    const newState = {
      ...state,
      referrals: [...state.referrals, newReferral],
    };

    setState(newState);
    saveReferralState(user.id, newState);

    return newReferral;
  }, [user, state]);

  // サインアップ完了を記録
  const recordSignup = useCallback((referralId: string, refereeId: string): boolean => {
    if (!user || !state) return false;

    const referralIndex = state.referrals.findIndex(r => r.id === referralId);
    if (referralIndex === -1) return false;

    const referral = state.referrals[referralIndex];
    if (referral.status !== 'pending') return false;

    const updatedReferral: Referral = {
      ...referral,
      refereeId,
      status: 'signup',
      earnedCredits: REFERRAL_REWARDS.signup.referrer,
      signupAt: new Date(),
    };

    const newReferrals = [...state.referrals];
    newReferrals[referralIndex] = updatedReferral;

    const newTotalReferrals = state.totalReferrals + 1;
    const newTotalEarned = state.totalEarned + REFERRAL_REWARDS.signup.referrer;

    const newState: ReferralState = {
      ...state,
      referrals: newReferrals,
      totalReferrals: newTotalReferrals,
      totalEarned: newTotalEarned,
      badge: calculateBadge(newTotalReferrals),
    };

    // 報酬付与
    grantReferralBonus(
      REFERRAL_REWARDS.signup.referrer,
      `友達招待報酬（${referral.refereeEmail}が登録）`
    );

    setState(newState);
    saveReferralState(user.id, newState);

    return true;
  }, [user, state]);

  // 有料プラン契約を記録
  const recordPaidConversion = useCallback((referralId: string): boolean => {
    if (!user || !state) return false;

    const referralIndex = state.referrals.findIndex(r => r.id === referralId);
    if (referralIndex === -1) return false;

    const referral = state.referrals[referralIndex];
    if (referral.status !== 'signup') return false;

    const updatedReferral: Referral = {
      ...referral,
      status: 'paid',
      earnedCredits: referral.earnedCredits + REFERRAL_REWARDS.paid.referrer,
      paidAt: new Date(),
    };

    const newReferrals = [...state.referrals];
    newReferrals[referralIndex] = updatedReferral;

    const newTotalEarned = state.totalEarned + REFERRAL_REWARDS.paid.referrer;

    const newState: ReferralState = {
      ...state,
      referrals: newReferrals,
      totalEarned: newTotalEarned,
    };

    // 報酬付与
    grantReferralBonus(
      REFERRAL_REWARDS.paid.referrer,
      `友達招待報酬（${referral.refereeEmail}が有料プラン契約）`
    );

    setState(newState);
    saveReferralState(user.id, newState);

    return true;
  }, [user, state]);

  // SNSシェアURL生成
  const getShareUrls = useCallback(() => {
    if (!state) return null;

    const text = encodeURIComponent('Pulse Finance OSを使っています！招待リンクから登録すると50クレジットもらえます✨');
    const url = encodeURIComponent(state.referralLink);

    return {
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      line: `https://social-plugins.line.me/lineit/share?url=${url}&text=${text}`,
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${text}`,
    };
  }, [state]);

  // 統計取得
  const getStats = useCallback(() => {
    if (!state) return null;

    const pending = state.referrals.filter(r => r.status === 'pending').length;
    const signedUp = state.referrals.filter(r => r.status === 'signup').length;
    const paid = state.referrals.filter(r => r.status === 'paid').length;
    const conversionRate = state.totalReferrals > 0
      ? Math.round((paid / state.totalReferrals) * 100)
      : 0;

    return {
      pending,
      signedUp,
      paid,
      total: state.totalReferrals,
      totalEarned: state.totalEarned,
      conversionRate,
    };
  }, [state]);

  // リファラルコードで参照元を取得
  const getReferrerByCode = useCallback((code: string): string | null => {
    // 実際にはAPIで取得
    // ここではデモ用にnull返却
    return null;
  }, []);

  return {
    state,
    isLoading,
    trackReferral,
    recordSignup,
    recordPaidConversion,
    getShareUrls,
    getStats,
    getReferrerByCode,
  };
}
