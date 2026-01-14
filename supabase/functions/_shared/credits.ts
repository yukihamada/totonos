// Credit costs for various actions with cost analysis
// cost: credits charged to user
// apiCost: approximate API cost in USD (for internal tracking)
export const CREDIT_COSTS = {
  ai_chat: { cost: 1, apiCost: 0.002, name: "AIチャット" },
  ai_email_analysis: { cost: 2, apiCost: 0.005, name: "メールAI分析" },
  ai_email_reply: { cost: 3, apiCost: 0.008, name: "AI返信生成" },
  ai_email_command: { cost: 5, apiCost: 0.015, name: "メールAI指示" },
  ai_document_generate: { cost: 3, apiCost: 0.015, name: "AI文書生成" },
  ocr: { cost: 2, apiCost: 0.003, name: "OCR処理" },
  pdf: { cost: 1, apiCost: 0.001, name: "PDF生成" },
  email: { cost: 1, apiCost: 0.0002, name: "メール送信" },
  export: { cost: 2, apiCost: 0.001, name: "データエクスポート" },
  contract_create: { cost: 3, apiCost: 0.002, name: "契約書作成" },
  contract_sign: { cost: 2, apiCost: 0.001, name: "署名依頼" },
  contract_blockchain: { cost: 5, apiCost: 0.05, name: "ブロックチェーン証明" },
  ai_forecast: { cost: 5, apiCost: 0.02, name: "AI予測" },
  ai_scoring: { cost: 3, apiCost: 0.01, name: "AIスコアリング" },
  mcp_call: { cost: 1, apiCost: 0.001, name: "MCP呼び出し" },
} as const;

export type CreditAction = keyof typeof CREDIT_COSTS;

// Price per credit in JPY (for profit calculation)
export const CREDIT_PRICE_JPY = 10; // 1クレジット = 10円
export const USD_TO_JPY = 150; // 概算レート

// Calculate profit margin for each action
export function calculateProfitMargin(action: CreditAction): {
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
} {
  const config = CREDIT_COSTS[action];
  const revenue = config.cost * CREDIT_PRICE_JPY;
  const cost = config.apiCost * USD_TO_JPY;
  const profit = revenue - cost;
  const margin = (profit / revenue) * 100;
  
  return { revenue, cost, profit, margin };
}

interface CreditBalance {
  remaining: number;
  monthlyRemaining: number;
  chargedRemaining: number;
  companyId: string;
}

interface ConsumeResult {
  success: boolean;
  error?: string;
  newBalance?: number;
  creditsUsed?: number;
}

/**
 * Check company credits balance
 */
// deno-lint-ignore no-explicit-any
export async function checkCompanyCredits(
  supabase: any,
  companyId: string
): Promise<CreditBalance> {
  const { data, error } = await supabase
    .from("company_credits")
    .select("*")
    .eq("company_id", companyId)
    .single();

  if (error || !data) {
    console.error("Failed to fetch company credits:", error);
    return {
      remaining: 0,
      monthlyRemaining: 0,
      chargedRemaining: 0,
      companyId,
    };
  }

  const monthlyCredits = (data.monthly_credits as number) || 0;
  const usedThisMonth = (data.used_this_month as number) || 0;
  const chargedCredits = (data.charged_credits as number) || 0;
  
  const monthlyRemaining = Math.max(0, monthlyCredits - usedThisMonth);
  const chargedRemaining = chargedCredits;

  return {
    remaining: monthlyRemaining + chargedRemaining,
    monthlyRemaining,
    chargedRemaining,
    companyId,
  };
}

/**
 * Consume credits for a specific action
 * Prioritizes monthly credits before charged credits
 */
// deno-lint-ignore no-explicit-any
export async function consumeCompanyCredits(
  supabase: any,
  companyId: string,
  action: CreditAction,
  description?: string,
  metadata?: Record<string, unknown>
): Promise<ConsumeResult> {
  const config = CREDIT_COSTS[action];
  const cost = config.cost;
  
  // Get current balance
  const balance = await checkCompanyCredits(supabase, companyId);
  
  if (balance.remaining < cost) {
    return {
      success: false,
      error: `クレジット不足です。必要: ${cost}, 残高: ${balance.remaining}`,
    };
  }

  // Calculate how to deduct
  let monthlyToUse = 0;
  let chargedToUse = 0;

  if (balance.monthlyRemaining >= cost) {
    // Use monthly credits only
    monthlyToUse = cost;
  } else {
    // Use all remaining monthly + some charged
    monthlyToUse = balance.monthlyRemaining;
    chargedToUse = cost - monthlyToUse;
  }

  // Get current values
  const { data: currentData } = await supabase
    .from("company_credits")
    .select("used_this_month, charged_credits")
    .eq("company_id", companyId)
    .single();

  if (!currentData) {
    return {
      success: false,
      error: "クレジット情報が見つかりません",
    };
  }

  const currentUsed = (currentData.used_this_month as number) || 0;
  const currentCharged = (currentData.charged_credits as number) || 0;

  // Update company_credits
  const { error: creditUpdateError } = await supabase
    .from("company_credits")
    .update({
      used_this_month: currentUsed + monthlyToUse,
      charged_credits: currentCharged - chargedToUse,
    })
    .eq("company_id", companyId);

  if (creditUpdateError) {
    console.error("Failed to update credits:", creditUpdateError);
    return {
      success: false,
      error: "クレジットの更新に失敗しました",
    };
  }

  // Log the transaction with cost tracking
  const newBalance = balance.remaining - cost;
  const profitInfo = calculateProfitMargin(action);
  
  const { error: logError } = await supabase.from("credit_transactions").insert({
    company_id: companyId,
    transaction_type: "consume",
    action,
    amount: -cost,
    balance_after: newBalance,
    description: description || config.name,
    metadata: {
      ...metadata,
      api_cost_usd: config.apiCost,
      revenue_jpy: profitInfo.revenue,
      cost_jpy: profitInfo.cost,
      profit_jpy: profitInfo.profit,
    },
  });

  if (logError) {
    console.error("Failed to log credit transaction:", logError);
    // Don't fail the operation, just log the error
  }

  console.log(`Credits consumed: ${cost} for ${action}, new balance: ${newBalance}, profit: ¥${profitInfo.profit.toFixed(2)}`);

  return {
    success: true,
    newBalance,
    creditsUsed: cost,
  };
}

/**
 * Check if there are enough credits for an action
 */
// deno-lint-ignore no-explicit-any
export async function canUseCredits(
  supabase: any,
  companyId: string,
  action: CreditAction
): Promise<boolean> {
  const balance = await checkCompanyCredits(supabase, companyId);
  return balance.remaining >= CREDIT_COSTS[action].cost;
}

/**
 * Get company ID from user ID
 */
// deno-lint-ignore no-explicit-any
export async function getCompanyIdForUser(
  supabase: any,
  userId: string
): Promise<string | null> {
  // First try user_current_company
  const { data: currentCompany } = await supabase
    .from("user_current_company")
    .select("company_id")
    .eq("user_id", userId)
    .single();

  if (currentCompany?.company_id) {
    return currentCompany.company_id;
  }

  // Fallback to company_members
  const { data: membership } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", userId)
    .eq("is_active", true)
    .limit(1)
    .single();

  return membership?.company_id || null;
}

/**
 * Get company ID from API key hash
 */
// deno-lint-ignore no-explicit-any
export async function getCompanyIdFromApiKey(
  supabase: any,
  keyHash: string
): Promise<{ companyId: string | null; userId: string | null }> {
  const { data: apiKey } = await supabase
    .from("api_keys")
    .select("user_id")
    .eq("key_hash", keyHash)
    .single();

  if (!apiKey?.user_id) {
    return { companyId: null, userId: null };
  }

  const companyId = await getCompanyIdForUser(supabase, apiKey.user_id);
  return { companyId, userId: apiKey.user_id };
}
