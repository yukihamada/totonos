import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { contractTools, executeContractTool } from "./contracts.ts";
import { crmTools, executeCrmTool } from "./crm.ts";
import { accountingTools, executeAccountingTool } from "./accounting.ts";
import { hrTools, executeHrTool } from "./hr.ts";
import { wikiTools, executeWikiTool } from "./wiki.ts";
import { itAssetTools, executeItAssetTool } from "./it-assets.ts";

// Combine all tools
export const allTools = [
  ...contractTools,
  ...crmTools,
  ...accountingTools,
  ...hrTools,
  ...wikiTools,
  ...itAssetTools,
];

// Tool execution router
export async function executeToolCall(
  toolName: string,
  input: Record<string, unknown>,
  userId: string,
  supabase: SupabaseClient
): Promise<unknown> {
  // Contract tools
  if (toolName.startsWith("contract_") || toolName === "list_contracts" || toolName === "search_contracts") {
    return executeContractTool(toolName, input, userId, supabase);
  }

  // CRM tools
  if (toolName.startsWith("lead_") || toolName.startsWith("deal_") ||
      toolName === "list_leads" || toolName === "list_deals" ||
      toolName === "get_pipeline_stats" || toolName === "log_activity") {
    return executeCrmTool(toolName, input, userId, supabase);
  }

  // Accounting tools
  if (toolName.startsWith("journal_") || toolName.startsWith("expense_") ||
      toolName === "get_trial_balance" || toolName === "get_balance_sheet" ||
      toolName === "get_income_statement") {
    return executeAccountingTool(toolName, input, userId, supabase);
  }

  // HR tools
  if (toolName.startsWith("employee_") || toolName.startsWith("attendance_") ||
      toolName === "list_employees" || toolName === "calculate_payroll") {
    return executeHrTool(toolName, input, userId, supabase);
  }

  // Wiki tools
  if (toolName.startsWith("wiki_") || toolName === "search_wiki") {
    return executeWikiTool(toolName, input, userId, supabase);
  }

  // IT Asset tools
  if (toolName.startsWith("asset_") || toolName === "list_it_assets") {
    return executeItAssetTool(toolName, input, userId, supabase);
  }

  throw new Error(`Unknown tool: ${toolName}`);
}
