import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BankTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  balance: number;
  type: "credit" | "debit";
  category?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, organizationId, accountId, provider } = await req.json();

    switch (action) {
      case "get_link_token": {
        // Generate link token for Plaid or similar service
        const linkToken = await createLinkToken(user.id, organizationId);
        return new Response(JSON.stringify({ linkToken }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "exchange_token": {
        // Exchange public token for access token
        const { publicToken } = await req.json();
        const result = await exchangeToken(publicToken, user.id, organizationId, supabaseClient);
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "sync_transactions": {
        // Sync bank transactions
        const transactions = await syncTransactions(accountId, organizationId, supabaseClient);
        return new Response(JSON.stringify({ transactions }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "get_accounts": {
        // Get linked bank accounts
        const accounts = await getLinkedAccounts(organizationId, supabaseClient);
        return new Response(JSON.stringify({ accounts }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "disconnect": {
        // Disconnect bank account
        await disconnectAccount(accountId, organizationId, supabaseClient);
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function createLinkToken(userId: string, organizationId: string): Promise<string> {
  const plaidClientId = Deno.env.get("PLAID_CLIENT_ID");
  const plaidSecret = Deno.env.get("PLAID_SECRET");
  const plaidEnv = Deno.env.get("PLAID_ENV") || "sandbox";

  if (!plaidClientId || !plaidSecret) {
    // Return mock token for development
    return "mock-link-token-" + Date.now();
  }

  const plaidUrl = `https://${plaidEnv}.plaid.com/link/token/create`;

  const response = await fetch(plaidUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: plaidClientId,
      secret: plaidSecret,
      client_name: "Totonos",
      user: { client_user_id: userId },
      products: ["transactions"],
      country_codes: ["JP"],
      language: "ja",
    }),
  });

  const data = await response.json();
  return data.link_token;
}

async function exchangeToken(
  publicToken: string,
  userId: string,
  organizationId: string,
  supabaseClient: any
) {
  const plaidClientId = Deno.env.get("PLAID_CLIENT_ID");
  const plaidSecret = Deno.env.get("PLAID_SECRET");
  const plaidEnv = Deno.env.get("PLAID_ENV") || "sandbox";

  if (!plaidClientId || !plaidSecret) {
    // Mock response for development
    const mockAccountId = "mock-account-" + Date.now();
    await supabaseClient.from("bank_accounts").insert({
      id: mockAccountId,
      organization_id: organizationId,
      user_id: userId,
      name: "テスト銀行口座",
      institution: "テスト銀行",
      account_type: "checking",
      mask: "1234",
      access_token: "mock-access-token",
    });
    return { accountId: mockAccountId };
  }

  // Exchange token with Plaid
  const response = await fetch(`https://${plaidEnv}.plaid.com/item/public_token/exchange`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: plaidClientId,
      secret: plaidSecret,
      public_token: publicToken,
    }),
  });

  const data = await response.json();
  const accessToken = data.access_token;

  // Get account info
  const accountsResponse = await fetch(`https://${plaidEnv}.plaid.com/accounts/get`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: plaidClientId,
      secret: plaidSecret,
      access_token: accessToken,
    }),
  });

  const accountsData = await accountsResponse.json();

  // Store accounts
  for (const account of accountsData.accounts) {
    await supabaseClient.from("bank_accounts").insert({
      organization_id: organizationId,
      user_id: userId,
      plaid_account_id: account.account_id,
      name: account.name,
      institution: accountsData.item?.institution_id || "Unknown",
      account_type: account.type,
      subtype: account.subtype,
      mask: account.mask,
      access_token: accessToken,
      balance: account.balances.current,
    });
  }

  return { success: true, accountCount: accountsData.accounts.length };
}

async function syncTransactions(
  accountId: string,
  organizationId: string,
  supabaseClient: any
): Promise<BankTransaction[]> {
  const { data: account } = await supabaseClient
    .from("bank_accounts")
    .select("*")
    .eq("id", accountId)
    .eq("organization_id", organizationId)
    .single();

  if (!account) {
    throw new Error("Account not found");
  }

  const plaidClientId = Deno.env.get("PLAID_CLIENT_ID");
  const plaidSecret = Deno.env.get("PLAID_SECRET");
  const plaidEnv = Deno.env.get("PLAID_ENV") || "sandbox";

  if (!plaidClientId || !plaidSecret) {
    // Mock transactions for development
    const mockTransactions: BankTransaction[] = [
      {
        id: "tx-1",
        date: new Date().toISOString().split("T")[0],
        description: "給与振込",
        amount: 250000,
        balance: 500000,
        type: "credit",
        category: "income",
      },
      {
        id: "tx-2",
        date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
        description: "電気代",
        amount: -15000,
        balance: 250000,
        type: "debit",
        category: "utilities",
      },
    ];

    for (const tx of mockTransactions) {
      await supabaseClient.from("bank_transactions").upsert({
        ...tx,
        bank_account_id: accountId,
        organization_id: organizationId,
      });
    }

    return mockTransactions;
  }

  // Fetch transactions from Plaid
  const startDate = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];
  const endDate = new Date().toISOString().split("T")[0];

  const response = await fetch(`https://${plaidEnv}.plaid.com/transactions/get`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: plaidClientId,
      secret: plaidSecret,
      access_token: account.access_token,
      start_date: startDate,
      end_date: endDate,
    }),
  });

  const data = await response.json();
  const transactions: BankTransaction[] = data.transactions.map((tx: any) => ({
    id: tx.transaction_id,
    date: tx.date,
    description: tx.name,
    amount: tx.amount * -1, // Plaid uses negative for debits
    balance: 0, // Would need to calculate
    type: tx.amount < 0 ? "credit" : "debit",
    category: tx.category?.[0],
  }));

  // Store transactions
  for (const tx of transactions) {
    await supabaseClient.from("bank_transactions").upsert({
      ...tx,
      bank_account_id: accountId,
      organization_id: organizationId,
    });
  }

  return transactions;
}

async function getLinkedAccounts(organizationId: string, supabaseClient: any) {
  const { data: accounts } = await supabaseClient
    .from("bank_accounts")
    .select("*")
    .eq("organization_id", organizationId);

  return accounts || [];
}

async function disconnectAccount(
  accountId: string,
  organizationId: string,
  supabaseClient: any
) {
  await supabaseClient
    .from("bank_accounts")
    .delete()
    .eq("id", accountId)
    .eq("organization_id", organizationId);
}
