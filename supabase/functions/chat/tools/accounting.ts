import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export const accountingTools = [
  {
    name: "journal_create",
    description: "仕訳を作成します。借方・貸方の勘定科目と金額を指定してください。",
    input_schema: {
      type: "object" as const,
      properties: {
        date: {
          type: "string",
          description: "仕訳日（YYYY-MM-DD形式）",
        },
        description: {
          type: "string",
          description: "摘要",
        },
        debit_account: {
          type: "string",
          description: "借方勘定科目",
        },
        credit_account: {
          type: "string",
          description: "貸方勘定科目",
        },
        amount: {
          type: "number",
          description: "金額",
        },
      },
      required: ["date", "description", "debit_account", "credit_account", "amount"],
    },
  },
  {
    name: "journal_list",
    description: "仕訳一覧を取得します。期間でフィルタリング可能です。",
    input_schema: {
      type: "object" as const,
      properties: {
        start_date: {
          type: "string",
          description: "開始日（YYYY-MM-DD形式）",
        },
        end_date: {
          type: "string",
          description: "終了日（YYYY-MM-DD形式）",
        },
        account: {
          type: "string",
          description: "勘定科目でフィルタ",
        },
        limit: {
          type: "number",
          description: "取得件数の上限（デフォルト: 20）",
        },
      },
      required: [],
    },
  },
  {
    name: "get_trial_balance",
    description: "試算表を取得します。指定日時点の各勘定科目の残高を表示します。",
    input_schema: {
      type: "object" as const,
      properties: {
        as_of_date: {
          type: "string",
          description: "基準日（YYYY-MM-DD形式）デフォルトは今日",
        },
      },
      required: [],
    },
  },
  {
    name: "get_balance_sheet",
    description: "貸借対照表を取得します。資産・負債・純資産の状況を表示します。",
    input_schema: {
      type: "object" as const,
      properties: {
        as_of_date: {
          type: "string",
          description: "基準日（YYYY-MM-DD形式）デフォルトは今日",
        },
      },
      required: [],
    },
  },
  {
    name: "get_income_statement",
    description: "損益計算書を取得します。指定期間の収益・費用・利益を表示します。",
    input_schema: {
      type: "object" as const,
      properties: {
        start_date: {
          type: "string",
          description: "開始日（YYYY-MM-DD形式）",
        },
        end_date: {
          type: "string",
          description: "終了日（YYYY-MM-DD形式）",
        },
      },
      required: [],
    },
  },
  {
    name: "expense_create",
    description: "経費申請を作成します。",
    input_schema: {
      type: "object" as const,
      properties: {
        date: {
          type: "string",
          description: "支出日（YYYY-MM-DD形式）",
        },
        category: {
          type: "string",
          description: "経費カテゴリ（例：交通費、接待費、消耗品費）",
        },
        amount: {
          type: "number",
          description: "金額",
        },
        description: {
          type: "string",
          description: "経費の詳細説明",
        },
        receipt_url: {
          type: "string",
          description: "領収書のURL",
        },
      },
      required: ["date", "category", "amount", "description"],
    },
  },
  {
    name: "expense_list",
    description: "経費申請の一覧を取得します。",
    input_schema: {
      type: "object" as const,
      properties: {
        status: {
          type: "string",
          enum: ["pending", "approved", "rejected"],
          description: "ステータスでフィルタ",
        },
        start_date: {
          type: "string",
          description: "開始日（YYYY-MM-DD形式）",
        },
        end_date: {
          type: "string",
          description: "終了日（YYYY-MM-DD形式）",
        },
        limit: {
          type: "number",
          description: "取得件数の上限（デフォルト: 20）",
        },
      },
      required: [],
    },
  },
];

export async function executeAccountingTool(
  toolName: string,
  input: Record<string, unknown>,
  userId: string,
  supabase: SupabaseClient
): Promise<unknown> {
  switch (toolName) {
    case "journal_create": {
      // Create journal entry with debit and credit lines
      const { data, error } = await supabase
        .from("journal_entries")
        .insert({
          user_id: userId,
          date: input.date,
          description: input.description,
          status: "posted",
        })
        .select()
        .single();

      if (error) throw new Error(error.message);

      // Create journal lines
      const journalId = data.id;
      const { error: linesError } = await supabase
        .from("journal_lines")
        .insert([
          {
            journal_entry_id: journalId,
            account_name: input.debit_account,
            debit: input.amount,
            credit: 0,
          },
          {
            journal_entry_id: journalId,
            account_name: input.credit_account,
            debit: 0,
            credit: input.amount,
          },
        ]);

      if (linesError) throw new Error(linesError.message);

      return {
        journal_entry: data,
        message: `仕訳を作成しました: ${input.debit_account}（借方）/ ${input.credit_account}（貸方） ${input.amount}円`,
      };
    }

    case "journal_list": {
      let query = supabase
        .from("journal_entries")
        .select(`
          *,
          journal_lines (*)
        `)
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .limit(input.limit as number || 20);

      if (input.start_date) {
        query = query.gte("date", input.start_date);
      }
      if (input.end_date) {
        query = query.lte("date", input.end_date);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return { journal_entries: data, count: data?.length || 0 };
    }

    case "get_trial_balance": {
      const asOfDate = input.as_of_date || new Date().toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("journal_lines")
        .select(`
          account_name,
          debit,
          credit,
          journal_entries!inner (user_id, date)
        `)
        .eq("journal_entries.user_id", userId)
        .lte("journal_entries.date", asOfDate);

      if (error) throw new Error(error.message);

      // Aggregate by account
      const accountBalances: Record<string, { debit: number; credit: number }> = {};
      for (const line of data || []) {
        const account = line.account_name;
        if (!accountBalances[account]) {
          accountBalances[account] = { debit: 0, credit: 0 };
        }
        accountBalances[account].debit += line.debit || 0;
        accountBalances[account].credit += line.credit || 0;
      }

      const trialBalance = Object.entries(accountBalances).map(([account, amounts]) => ({
        account,
        debit: amounts.debit,
        credit: amounts.credit,
        balance: amounts.debit - amounts.credit,
      }));

      const totalDebit = trialBalance.reduce((sum, a) => sum + a.debit, 0);
      const totalCredit = trialBalance.reduce((sum, a) => sum + a.credit, 0);

      return {
        as_of_date: asOfDate,
        accounts: trialBalance,
        totals: { debit: totalDebit, credit: totalCredit },
        balanced: totalDebit === totalCredit,
      };
    }

    case "get_balance_sheet": {
      const asOfDate = input.as_of_date || new Date().toISOString().split("T")[0];

      // Get trial balance first
      const { data, error } = await supabase
        .from("journal_lines")
        .select(`
          account_name,
          debit,
          credit,
          journal_entries!inner (user_id, date)
        `)
        .eq("journal_entries.user_id", userId)
        .lte("journal_entries.date", asOfDate);

      if (error) throw new Error(error.message);

      // Categorize accounts (simplified)
      const assets: Record<string, number> = {};
      const liabilities: Record<string, number> = {};
      const equity: Record<string, number> = {};

      for (const line of data || []) {
        const account = line.account_name;
        const balance = (line.debit || 0) - (line.credit || 0);

        // Simple categorization based on account name patterns
        if (account.includes("現金") || account.includes("預金") || account.includes("売掛") || account.includes("資産")) {
          assets[account] = (assets[account] || 0) + balance;
        } else if (account.includes("買掛") || account.includes("借入") || account.includes("負債")) {
          liabilities[account] = (liabilities[account] || 0) - balance;
        } else if (account.includes("資本") || account.includes("利益")) {
          equity[account] = (equity[account] || 0) - balance;
        }
      }

      const totalAssets = Object.values(assets).reduce((sum, v) => sum + v, 0);
      const totalLiabilities = Object.values(liabilities).reduce((sum, v) => sum + v, 0);
      const totalEquity = Object.values(equity).reduce((sum, v) => sum + v, 0);

      return {
        as_of_date: asOfDate,
        assets: { items: assets, total: totalAssets },
        liabilities: { items: liabilities, total: totalLiabilities },
        equity: { items: equity, total: totalEquity },
        balanced: totalAssets === totalLiabilities + totalEquity,
      };
    }

    case "get_income_statement": {
      const today = new Date();
      const startDate = input.start_date || `${today.getFullYear()}-01-01`;
      const endDate = input.end_date || today.toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("journal_lines")
        .select(`
          account_name,
          debit,
          credit,
          journal_entries!inner (user_id, date)
        `)
        .eq("journal_entries.user_id", userId)
        .gte("journal_entries.date", startDate)
        .lte("journal_entries.date", endDate);

      if (error) throw new Error(error.message);

      const revenue: Record<string, number> = {};
      const expenses: Record<string, number> = {};

      for (const line of data || []) {
        const account = line.account_name;
        const amount = (line.credit || 0) - (line.debit || 0);

        if (account.includes("売上") || account.includes("収益") || account.includes("収入")) {
          revenue[account] = (revenue[account] || 0) + amount;
        } else if (account.includes("費") || account.includes("経費") || account.includes("支出")) {
          expenses[account] = (expenses[account] || 0) - amount;
        }
      }

      const totalRevenue = Object.values(revenue).reduce((sum, v) => sum + v, 0);
      const totalExpenses = Object.values(expenses).reduce((sum, v) => sum + v, 0);
      const netIncome = totalRevenue - totalExpenses;

      return {
        period: { start_date: startDate, end_date: endDate },
        revenue: { items: revenue, total: totalRevenue },
        expenses: { items: expenses, total: totalExpenses },
        net_income: netIncome,
      };
    }

    case "expense_create": {
      const { data, error } = await supabase
        .from("expense_claims")
        .insert({
          user_id: userId,
          date: input.date,
          category: input.category,
          amount: input.amount,
          description: input.description,
          receipt_url: input.receipt_url,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return { expense: data, message: "経費申請を作成しました" };
    }

    case "expense_list": {
      let query = supabase
        .from("expense_claims")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .limit(input.limit as number || 20);

      if (input.status) {
        query = query.eq("status", input.status);
      }
      if (input.start_date) {
        query = query.gte("date", input.start_date);
      }
      if (input.end_date) {
        query = query.lte("date", input.end_date);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return { expenses: data, count: data?.length || 0 };
    }

    default:
      throw new Error(`Unknown accounting tool: ${toolName}`);
  }
}
