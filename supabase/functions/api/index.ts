import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

// API Key validation (check prefix and format)
function validateApiKey(apiKey: string): boolean {
  return apiKey.startsWith("ttn_") && apiKey.length === 36;
}

// Parse URL path to get resource and ID
function parsePath(url: URL): { resource: string; id?: string; subResource?: string; version: string } {
  const parts = url.pathname.split("/").filter(Boolean);
  const version = parts[1] || "v1";
  const resource = parts[2] || "";
  const id = parts[3];
  const subResource = parts[4];
  return { resource, id, subResource, version };
}

const AVAILABLE_RESOURCES = [
  "invoices",
  "contracts",
  "leads",
  "deals",
  "clients",
  "employees",
  "estimates",
  "purchase-orders",
  "activities",
  "wiki",
  "journal-entries",
  "accounts",
  "expense-claims",
  "fixed-assets",
  "it-assets",
  "attendance",
  "payroll",
  "leave-requests",
  "tasks",
  "notifications",
  "trust-passport",
  "boost-requests",
];

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = authHeader.replace("Bearer ", "");
    if (!validateApiKey(apiKey)) {
      return new Response(
        JSON.stringify({ error: "Invalid API key format" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const { resource, id, subResource, version } = parsePath(url);
    const method = req.method;

    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = parseInt(url.searchParams.get("offset") || "0");
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search");

    let result: unknown;

    switch (resource) {
      case "invoices":
        result = await handleInvoices(supabase, method, id, { limit, offset, status }, req);
        break;
      case "contracts":
        result = await handleContracts(supabase, method, id, subResource, { limit, offset, status }, req);
        break;
      case "leads":
        result = await handleLeads(supabase, method, id, { limit, offset, status }, req);
        break;
      case "deals":
        result = await handleDeals(supabase, method, id, { limit, offset, status }, req);
        break;
      case "clients":
        result = await handleClients(supabase, method, id, { limit, offset, search }, req);
        break;
      case "employees":
        result = await handleEmployees(supabase, method, id, { limit, offset, status }, req);
        break;
      case "estimates":
        result = await handleEstimates(supabase, method, id, { limit, offset, status }, req);
        break;
      case "purchase-orders":
        result = await handlePurchaseOrders(supabase, method, id, { limit, offset, status }, req);
        break;
      case "activities":
        result = await handleActivities(supabase, method, id, { limit, offset }, req);
        break;
      case "wiki":
        result = await handleWiki(supabase, method, id, { limit, offset, search }, req);
        break;
      case "journal-entries":
        result = await handleJournalEntries(supabase, method, id, { limit, offset }, req);
        break;
      case "accounts":
        result = await handleAccounts(supabase, method, id, { limit, offset }, req);
        break;
      case "expense-claims":
        result = await handleExpenseClaims(supabase, method, id, { limit, offset, status }, req);
        break;
      case "fixed-assets":
        result = await handleFixedAssets(supabase, method, id, { limit, offset }, req);
        break;
      case "it-assets":
        result = await handleITAssets(supabase, method, id, { limit, offset, status }, req);
        break;
      case "attendance":
        result = await handleAttendance(supabase, method, id, { limit, offset, status }, req);
        break;
      case "payroll":
        result = await handlePayroll(supabase, method, id, { limit, offset, status }, req);
        break;
      case "leave-requests":
        result = await handleLeaveRequests(supabase, method, id, { limit, offset }, req);
        break;
      case "tasks":
        result = await handleTasks(supabase, method, id, { limit, offset, status }, req);
        break;
      case "notifications":
        result = await handleNotifications(supabase, method, id, { limit, offset }, req);
        break;
      case "trust-passport":
        result = await handleTrustPassport(supabase, method, id, { limit, offset }, req);
        break;
      case "boost-requests":
        result = await handleBoostRequests(supabase, method, id, { limit, offset, status }, req);
        break;
      default:
        return new Response(
          JSON.stringify({
            error: "Unknown resource",
            available_resources: AVAILABLE_RESOURCES
          }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("API error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Generic CRUD helper
async function handleGenericCRUD(
  supabase: SupabaseClient,
  tableName: string,
  method: string,
  id: string | undefined,
  params: { limit: number; offset: number; status?: string | null; search?: string | null },
  req: Request,
  options?: {
    orderBy?: string;
    statusField?: string;
    searchField?: string;
    selectFields?: string;
  }
) {
  const orderBy = options?.orderBy || "created_at";
  const statusField = options?.statusField || "status";
  const searchField = options?.searchField || "name";
  const selectFields = options?.selectFields || "*";

  if (method === "GET" && id) {
    const { data, error } = await supabase
      .from(tableName)
      .select(selectFields)
      .eq("id", id)
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  if (method === "GET") {
    let query = supabase
      .from(tableName)
      .select(selectFields, { count: "exact" })
      .order(orderBy, { ascending: false })
      .range(params.offset, params.offset + params.limit - 1);

    if (params.status) {
      query = query.eq(statusField, params.status);
    }
    if (params.search) {
      query = query.ilike(searchField, `%${params.search}%`);
    }

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);
    return { data, total: count, limit: params.limit, offset: params.offset };
  }

  if (method === "POST") {
    const body = await req.json();
    const { data, error } = await supabase
      .from(tableName)
      .insert(body)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  if (method === "PUT" && id) {
    const body = await req.json();
    const { data, error } = await supabase
      .from(tableName)
      .update(body)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  if (method === "DELETE" && id) {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq("id", id);
    if (error) throw new Error(error.message);
    return { success: true };
  }

  throw new Error("Invalid request");
}

// Invoice handlers
async function handleInvoices(
  supabase: SupabaseClient,
  method: string,
  id: string | undefined,
  params: { limit: number; offset: number; status: string | null },
  req: Request
) {
  return handleGenericCRUD(supabase, "invoices", method, id, params, req, {
    selectFields: "*, clients(name, email)"
  });
}

// Contract handlers
async function handleContracts(
  supabase: SupabaseClient,
  method: string,
  id: string | undefined,
  subResource: string | undefined,
  params: { limit: number; offset: number; status: string | null },
  req: Request
) {
  // Handle sub-resources like /contracts/:id/signatures
  if (id && subResource === "signatures") {
    if (method === "GET") {
      const { data, error } = await supabase
        .from("contract_signatures")
        .select("*")
        .eq("contract_id", id);
      if (error) throw new Error(error.message);
      return data;
    }
  }

  return handleGenericCRUD(supabase, "contracts", method, id, params, req, {
    selectFields: "*, clients(name, email)"
  });
}

// Lead handlers
async function handleLeads(
  supabase: SupabaseClient,
  method: string,
  id: string | undefined,
  params: { limit: number; offset: number; status: string | null },
  req: Request
) {
  return handleGenericCRUD(supabase, "leads", method, id, params, req, {
    searchField: "company_name"
  });
}

// Deal handlers
async function handleDeals(
  supabase: SupabaseClient,
  method: string,
  id: string | undefined,
  params: { limit: number; offset: number; status: string | null },
  req: Request
) {
  return handleGenericCRUD(supabase, "deals", method, id, params, req, {
    statusField: "stage",
    selectFields: "*, clients(name), leads(company_name)"
  });
}

// Client handlers
async function handleClients(
  supabase: SupabaseClient,
  method: string,
  id: string | undefined,
  params: { limit: number; offset: number; search: string | null },
  req: Request
) {
  return handleGenericCRUD(supabase, "clients", method, id, params, req);
}

// Employee handlers
async function handleEmployees(
  supabase: SupabaseClient,
  method: string,
  id: string | undefined,
  params: { limit: number; offset: number; status: string | null },
  req: Request
) {
  return handleGenericCRUD(supabase, "employees", method, id, params, req);
}

// Estimate handlers
async function handleEstimates(
  supabase: SupabaseClient,
  method: string,
  id: string | undefined,
  params: { limit: number; offset: number; status: string | null },
  req: Request
) {
  return handleGenericCRUD(supabase, "estimates", method, id, params, req, {
    selectFields: "*, clients(name, email)"
  });
}

// Purchase Order handlers
async function handlePurchaseOrders(
  supabase: SupabaseClient,
  method: string,
  id: string | undefined,
  params: { limit: number; offset: number; status: string | null },
  req: Request
) {
  return handleGenericCRUD(supabase, "purchase_orders", method, id, params, req, {
    selectFields: "*, clients(name, email)"
  });
}

// Activity handlers
async function handleActivities(
  supabase: SupabaseClient,
  method: string,
  id: string | undefined,
  params: { limit: number; offset: number },
  req: Request
) {
  return handleGenericCRUD(supabase, "activities", method, id, params, req, {
    orderBy: "activity_date",
    selectFields: "*, clients(name), leads(company_name), deals(deal_name)"
  });
}

// Wiki handlers
async function handleWiki(
  supabase: SupabaseClient,
  method: string,
  id: string | undefined,
  params: { limit: number; offset: number; search: string | null },
  req: Request
) {
  return handleGenericCRUD(supabase, "wiki_pages", method, id, params, req, {
    orderBy: "updated_at",
    searchField: "title"
  });
}

// Journal Entry handlers
async function handleJournalEntries(
  supabase: SupabaseClient,
  method: string,
  id: string | undefined,
  params: { limit: number; offset: number },
  req: Request
) {
  if (method === "GET" && id) {
    const { data, error } = await supabase
      .from("journal_entries")
      .select("*, journal_entry_lines(*, accounts(account_name, account_code))")
      .eq("id", id)
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  return handleGenericCRUD(supabase, "journal_entries", method, id, params, req, {
    orderBy: "entry_date"
  });
}

// Account handlers
async function handleAccounts(
  supabase: SupabaseClient,
  method: string,
  id: string | undefined,
  params: { limit: number; offset: number },
  req: Request
) {
  return handleGenericCRUD(supabase, "accounts", method, id, params, req, {
    orderBy: "account_code",
    searchField: "account_name"
  });
}

// Expense Claim handlers
async function handleExpenseClaims(
  supabase: SupabaseClient,
  method: string,
  id: string | undefined,
  params: { limit: number; offset: number; status: string | null },
  req: Request
) {
  if (method === "GET" && id) {
    const { data, error } = await supabase
      .from("expense_claims")
      .select("*, expense_items(*)")
      .eq("id", id)
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  return handleGenericCRUD(supabase, "expense_claims", method, id, params, req);
}

// Fixed Asset handlers
async function handleFixedAssets(
  supabase: SupabaseClient,
  method: string,
  id: string | undefined,
  params: { limit: number; offset: number },
  req: Request
) {
  if (method === "GET" && id) {
    const { data, error } = await supabase
      .from("fixed_assets")
      .select("*, depreciation_schedules(*)")
      .eq("id", id)
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  return handleGenericCRUD(supabase, "fixed_assets", method, id, params, req, {
    searchField: "asset_name"
  });
}

// IT Asset handlers
async function handleITAssets(
  supabase: SupabaseClient,
  method: string,
  id: string | undefined,
  params: { limit: number; offset: number; status: string | null },
  req: Request
) {
  return handleGenericCRUD(supabase, "it_assets", method, id, params, req, {
    selectFields: "*, employees(name)"
  });
}

// Attendance handlers
async function handleAttendance(
  supabase: SupabaseClient,
  method: string,
  id: string | undefined,
  params: { limit: number; offset: number; status: string | null },
  req: Request
) {
  return handleGenericCRUD(supabase, "attendance_records", method, id, params, req, {
    orderBy: "work_date",
    selectFields: "*, employees(name, employee_number)"
  });
}

// Payroll handlers
async function handlePayroll(
  supabase: SupabaseClient,
  method: string,
  id: string | undefined,
  params: { limit: number; offset: number; status: string | null },
  req: Request
) {
  return handleGenericCRUD(supabase, "payroll_records", method, id, params, req, {
    orderBy: "payment_date",
    selectFields: "*, employees(name, employee_number)"
  });
}

// Leave Request handlers (using paid_leave_balances)
async function handleLeaveRequests(
  supabase: SupabaseClient,
  method: string,
  id: string | undefined,
  params: { limit: number; offset: number },
  req: Request
) {
  return handleGenericCRUD(supabase, "paid_leave_balances", method, id, params, req, {
    selectFields: "*, employees(name, employee_number)"
  });
}

// Task handlers
async function handleTasks(
  supabase: SupabaseClient,
  method: string,
  id: string | undefined,
  params: { limit: number; offset: number; status: string | null },
  req: Request
) {
  return handleGenericCRUD(supabase, "tasks", method, id, params, req, {
    selectFields: "*, employees(name)"
  });
}

// Notification handlers
async function handleNotifications(
  supabase: SupabaseClient,
  method: string,
  id: string | undefined,
  params: { limit: number; offset: number },
  req: Request
) {
  return handleGenericCRUD(supabase, "notifications", method, id, params, req);
}

// Trust Passport handlers
async function handleTrustPassport(
  supabase: SupabaseClient,
  method: string,
  id: string | undefined,
  params: { limit: number; offset: number },
  req: Request
) {
  if (method === "GET" && !id) {
    // Get trust passport with history
    const { data, error } = await supabase
      .from("trust_passports")
      .select("*")
      .limit(params.limit)
      .range(params.offset, params.offset + params.limit - 1);
    if (error) throw new Error(error.message);
    return { data, limit: params.limit, offset: params.offset };
  }

  if (method === "GET" && id) {
    const { data, error } = await supabase
      .from("trust_passports")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw new Error(error.message);
    
    // Get history
    const { data: history } = await supabase
      .from("trust_score_history")
      .select("*")
      .eq("user_id", data.user_id)
      .order("created_at", { ascending: false })
      .limit(10);
    
    return { ...data, history };
  }

  throw new Error("Trust passport is read-only via API");
}

// Boost Request handlers
async function handleBoostRequests(
  supabase: SupabaseClient,
  method: string,
  id: string | undefined,
  params: { limit: number; offset: number; status: string | null },
  req: Request
) {
  return handleGenericCRUD(supabase, "boost_requests", method, id, params, req, {
    selectFields: "*, invoices(invoice_number, total_amount)"
  });
}
