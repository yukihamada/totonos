import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

// プラン定義
export const PLANS = {
  free: { name: 'Free', price: 0, monthlyCredits: 100 },
  starter: { name: 'Starter', price: 980, monthlyCredits: 500 },
  standard: { name: 'Standard', price: 2980, monthlyCredits: 2000 },
  pro: { name: 'Pro', price: 9800, monthlyCredits: 10000 },
  enterprise: { name: 'Enterprise', price: 0, monthlyCredits: Infinity },
} as const;

export type PlanType = keyof typeof PLANS;

// クレジット消費単価
export const CREDIT_COSTS = {
  ai_chat: { name: 'AIチャット', cost: 1 },
  ai_forecast: { name: 'AI売上予測', cost: 5 },
  ai_scoring: { name: 'AIリードスコアリング', cost: 3 },
  ocr: { name: '領収書OCR', cost: 2 },
  pdf: { name: 'PDF生成', cost: 1 },
  email: { name: 'メール送信', cost: 1 },
  export: { name: 'データエクスポート', cost: 2 },
} as const;

export type CreditAction = keyof typeof CREDIT_COSTS;

// チャージパック
export const CHARGE_PACKS = [
  { id: 'pack_100', credits: 100, price: 500, pricePerCredit: 5.0, discount: 0 },
  { id: 'pack_500', credits: 500, price: 2000, pricePerCredit: 4.0, discount: 20 },
  { id: 'pack_1000', credits: 1000, price: 3500, pricePerCredit: 3.5, discount: 30 },
  { id: 'pack_5000', credits: 5000, price: 15000, pricePerCredit: 3.0, discount: 40 },
] as const;

// クレジットトランザクション
export interface CreditTransaction {
  id: string;
  type: 'grant' | 'consume' | 'charge' | 'refund' | 'referral';
  amount: number;
  balance: number;
  reason: string;
  action?: CreditAction;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

// ユーザークレジット状態
export interface CreditState {
  plan: PlanType;
  monthlyCredits: number;
  chargedCredits: number;
  usedThisMonth: number;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
}

// フック戻り値
interface UseCreditsReturn {
  credits: CreditState | null;
  totalRemaining: number;
  isLoading: boolean;
  canUse: (action: CreditAction) => boolean;
  consume: (action: CreditAction, description?: string) => Promise<boolean>;
  charge: (packId: string) => Promise<boolean>;
  getLogs: () => CreditTransaction[];
  refetch: () => void;
}

// ローカルストレージキー
const CREDITS_KEY = 'totonos_credits';
const LOGS_KEY = 'totonos_credit_logs';

// 初期状態を生成
function getInitialState(): CreditState {
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  return {
    plan: 'free',
    monthlyCredits: PLANS.free.monthlyCredits,
    chargedCredits: 0,
    usedThisMonth: 0,
    currentPeriodStart: periodStart,
    currentPeriodEnd: periodEnd,
  };
}

// ローカルストレージから状態を読み込み
function loadState(): CreditState {
  try {
    const stored = localStorage.getItem(CREDITS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // 日付の復元
      parsed.currentPeriodStart = new Date(parsed.currentPeriodStart);
      parsed.currentPeriodEnd = new Date(parsed.currentPeriodEnd);

      // 月が変わっていたらリセット
      const now = new Date();
      if (now > parsed.currentPeriodEnd) {
        const newState = getInitialState();
        newState.plan = parsed.plan;
        newState.monthlyCredits = PLANS[parsed.plan as PlanType].monthlyCredits;
        newState.chargedCredits = parsed.chargedCredits; // チャージ分は繰り越し
        return newState;
      }

      return parsed;
    }
  } catch {
    // エラー時は初期状態
  }
  return getInitialState();
}

// ログを読み込み
function loadLogs(): CreditTransaction[] {
  try {
    const stored = localStorage.getItem(LOGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((log: CreditTransaction) => ({
        ...log,
        createdAt: new Date(log.createdAt),
      }));
    }
  } catch {
    // エラー時は空配列
  }
  return [];
}

// 状態を保存
function saveState(state: CreditState): void {
  localStorage.setItem(CREDITS_KEY, JSON.stringify(state));
}

// ログを保存
function saveLogs(logs: CreditTransaction[]): void {
  // 最新1000件のみ保持
  const trimmed = logs.slice(-1000);
  localStorage.setItem(LOGS_KEY, JSON.stringify(trimmed));
}

export function useCredits(): UseCreditsReturn {
  const { user } = useAuth();
  const [credits, setCredits] = useState<CreditState | null>(null);
  const [logs, setLogs] = useState<CreditTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 初期読み込み
  useEffect(() => {
    if (user) {
      const state = loadState();
      const loadedLogs = loadLogs();
      setCredits(state);
      setLogs(loadedLogs);
    }
    setIsLoading(false);
  }, [user]);

  // 残りクレジット計算
  const totalRemaining = credits
    ? Math.max(0, credits.monthlyCredits - credits.usedThisMonth) + credits.chargedCredits
    : 0;

  // 使用可能チェック
  const canUse = useCallback((action: CreditAction): boolean => {
    if (!credits) return false;
    const cost = CREDIT_COSTS[action].cost;
    return totalRemaining >= cost;
  }, [credits, totalRemaining]);

  // クレジット消費
  const consume = useCallback(async (action: CreditAction, description?: string): Promise<boolean> => {
    if (!credits) return false;

    const cost = CREDIT_COSTS[action].cost;
    if (totalRemaining < cost) return false;

    const monthlyRemaining = credits.monthlyCredits - credits.usedThisMonth;
    let newUsedThisMonth = credits.usedThisMonth;
    let newChargedCredits = credits.chargedCredits;

    // まず月間クレジットから消費、足りなければチャージ分から
    if (monthlyRemaining >= cost) {
      newUsedThisMonth += cost;
    } else {
      newUsedThisMonth = credits.monthlyCredits;
      newChargedCredits -= (cost - monthlyRemaining);
    }

    const newState = {
      ...credits,
      usedThisMonth: newUsedThisMonth,
      chargedCredits: newChargedCredits,
    };

    const newBalance = Math.max(0, newState.monthlyCredits - newState.usedThisMonth) + newState.chargedCredits;

    const transaction: CreditTransaction = {
      id: crypto.randomUUID(),
      type: 'consume',
      amount: -cost,
      balance: newBalance,
      reason: description || CREDIT_COSTS[action].name,
      action,
      createdAt: new Date(),
    };

    const newLogs = [...logs, transaction];

    setCredits(newState);
    setLogs(newLogs);
    saveState(newState);
    saveLogs(newLogs);

    return true;
  }, [credits, logs, totalRemaining]);

  // クレジットチャージ
  const charge = useCallback(async (packId: string): Promise<boolean> => {
    if (!credits) return false;

    const pack = CHARGE_PACKS.find(p => p.id === packId);
    if (!pack) return false;

    const newState = {
      ...credits,
      chargedCredits: credits.chargedCredits + pack.credits,
    };

    const newBalance = Math.max(0, newState.monthlyCredits - newState.usedThisMonth) + newState.chargedCredits;

    const transaction: CreditTransaction = {
      id: crypto.randomUUID(),
      type: 'charge',
      amount: pack.credits,
      balance: newBalance,
      reason: `${pack.credits}クレジットチャージ（¥${pack.price.toLocaleString()}）`,
      metadata: { packId, price: pack.price },
      createdAt: new Date(),
    };

    const newLogs = [...logs, transaction];

    setCredits(newState);
    setLogs(newLogs);
    saveState(newState);
    saveLogs(newLogs);

    return true;
  }, [credits, logs]);

  // ログ取得
  const getLogs = useCallback((): CreditTransaction[] => {
    return [...logs].reverse(); // 新しい順
  }, [logs]);

  // 再読み込み
  const refetch = useCallback(() => {
    if (user) {
      const state = loadState();
      const loadedLogs = loadLogs();
      setCredits(state);
      setLogs(loadedLogs);
    }
  }, [user]);

  return {
    credits,
    totalRemaining,
    isLoading,
    canUse,
    consume,
    charge,
    getLogs,
    refetch,
  };
}

// プラン変更フック
export function useChangePlan() {
  const [isLoading, setIsLoading] = useState(false);

  const changePlan = async (newPlan: PlanType): Promise<boolean> => {
    setIsLoading(true);
    try {
      const state = loadState();
      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      const newState: CreditState = {
        ...state,
        plan: newPlan,
        monthlyCredits: PLANS[newPlan].monthlyCredits,
        usedThisMonth: 0, // プラン変更時はリセット
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
      };

      saveState(newState);

      // ログ記録
      const logs = loadLogs();
      const newBalance = newState.monthlyCredits + newState.chargedCredits;
      const transaction: CreditTransaction = {
        id: crypto.randomUUID(),
        type: 'grant',
        amount: newState.monthlyCredits,
        balance: newBalance,
        reason: `${PLANS[newPlan].name}プランに変更`,
        metadata: { plan: newPlan, price: PLANS[newPlan].price },
        createdAt: new Date(),
      };
      saveLogs([...logs, transaction]);

      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { changePlan, isLoading };
}

// リファラル報酬付与
export function grantReferralBonus(amount: number, reason: string): void {
  const state = loadState();
  const newState = {
    ...state,
    chargedCredits: state.chargedCredits + amount,
  };

  const newBalance = Math.max(0, newState.monthlyCredits - newState.usedThisMonth) + newState.chargedCredits;

  const logs = loadLogs();
  const transaction: CreditTransaction = {
    id: crypto.randomUUID(),
    type: 'referral',
    amount,
    balance: newBalance,
    reason,
    createdAt: new Date(),
  };

  saveState(newState);
  saveLogs([...logs, transaction]);
}
