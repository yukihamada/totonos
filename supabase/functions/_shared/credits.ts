// Credit costs for various actions (must match frontend CREDIT_COSTS)
export const CREDIT_COSTS = {
  ai_chat: 1,
  ai_email_analysis: 2,
  ai_email_reply: 3,
  ai_email_command: 5,
  ocr: 2,
  pdf: 1,
  email: 1,
  export: 2,
  contract_create: 3,
  contract_sign: 2,
  ai_forecast: 5,
  ai_scoring: 3,
} as const;

export type CreditAction = keyof typeof CREDIT_COSTS;

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
  const cost = CREDIT_COSTS[action];
  
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

  // Log the transaction
  const newBalance = balance.remaining - cost;
  const { error: logError } = await supabase.from("credit_transactions").insert({
    company_id: companyId,
    transaction_type: "consume",
    action,
    amount: -cost,
    balance_after: newBalance,
    description: description || `${action}の実行`,
    metadata: metadata || {},
  });

  if (logError) {
    console.error("Failed to log credit transaction:", logError);
    // Don't fail the operation, just log the error
  }

  console.log(`Credits consumed: ${cost} for ${action}, new balance: ${newBalance}`);

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
  return balance.remaining >= CREDIT_COSTS[action];
}
