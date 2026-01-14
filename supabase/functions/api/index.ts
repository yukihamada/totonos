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
function parsePath(url: URL): { resource: string; id?: string; version: string } {
  const parts = url.pathname.split("/").filter(Boolean);
  const version = parts[1] || "v1";
  const resource = parts[2] || "";
  const id = parts[3];
  return { resource, id, version };
}

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
    const { resource, id, version } = parsePath(url);
    const method = req.method;

    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = parseInt(url.searchParams.get("offset") || "0");
    const status = url.searchParams.get("status");

    let result: unknown;

    switch (resource) {
      case "invoices":
        result = await handleInvoices(supabase, method, id, { limit, offset, status }, req);
        break;
      case "contracts":
        result = await handleContracts(supabase, method, id, { limit, offset, status }, req);
        break;
      case "leads":
        result = await handleLeads(supabase, method, id, { limit, offset, status }, req);
        break;
      case "employees":
        result = await handleEmployees(supabase, method, id, { limit, offset, status }, req);
        break;
      case "deals":
        result = await handleDeals(supabase, method, id, { limit, offset, status }, req);
        break;
      case "wiki":
        result = await handleWiki(supabase, method, id, { limit, offset }, req);
        break;
      default:
        return new Response(
          JSON.stringify({
            error: "Unknown resource",
            available_resources: ["invoices", "contracts", "leads", "employees", "deals", "wiki"]
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

// Invoice handlers
async function handleInvoices(
  supabase: SupabaseClient,
  method: string,
  id: string | undefined,
  params: { limit: number; offset: number; status: string | null },
  req: Request
) {
  if (method === "GET" && id) {
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  if (method === "GET") {
    let query = supabase
      .from("invoices")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(params.offset, params.offset + params.limit - 1);

    if (params.status) {
      query = query.eq("status", params.status);
    }

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);
    return { data, total: count, limit: params.limit, offset: params.offset };
  }

  if (method === "POST") {
    const body = await req.json();
    const { data, error } = await supabase
      .from("invoices")
      .insert(body)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  if (method === "PUT" && id) {
    const body = await req.json();
    const { data, error } = await supabase
      .from("invoices")
      .update(body)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  if (method === "DELETE" && id) {
    const { error } = await supabase
      .from("invoices")
      .delete()
      .eq("id", id);
    if (error) throw new Error(error.message);
    return { success: true };
  }

  throw new Error("Invalid request");
}

// Contract handlers
async function handleContracts(
  supabase: SupabaseClient,
  method: string,
  id: string | undefined,
  params: { limit: number; offset: number; status: string | null },
  req: Request
) {
  if (method === "GET" && id) {
    const { data, error } = await supabase
      .from("contracts")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  if (method === "GET") {
    let query = supabase
      .from("contracts")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(params.offset, params.offset + params.limit - 1);

    if (params.status) {
      query = query.eq("status", params.status);
    }

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);
    return { data, total: count, limit: params.limit, offset: params.offset };
  }

  if (method === "POST") {
    const body = await req.json();
    const { data, error } = await supabase
      .from("contracts")
      .insert(body)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  if (method === "PUT" && id) {
    const body = await req.json();
    const { data, error } = await supabase
      .from("contracts")
      .update(body)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  throw new Error("Invalid request");
}

// Lead handlers
async function handleLeads(
  supabase: SupabaseClient,
  method: string,
  id: string | undefined,
  params: { limit: number; offset: number; status: string | null },
  req: Request
) {
  if (method === "GET" && id) {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  if (method === "GET") {
    let query = supabase
      .from("leads")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(params.offset, params.offset + params.limit - 1);

    if (params.status) {
      query = query.eq("status", params.status);
    }

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);
    return { data, total: count, limit: params.limit, offset: params.offset };
  }

  if (method === "POST") {
    const body = await req.json();
    const { data, error } = await supabase
      .from("leads")
      .insert(body)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  if (method === "PUT" && id) {
    const body = await req.json();
    const { data, error } = await supabase
      .from("leads")
      .update(body)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  throw new Error("Invalid request");
}

// Employee handlers
async function handleEmployees(
  supabase: SupabaseClient,
  method: string,
  id: string | undefined,
  params: { limit: number; offset: number; status: string | null },
  req: Request
) {
  if (method === "GET" && id) {
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  if (method === "GET") {
    let query = supabase
      .from("employees")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(params.offset, params.offset + params.limit - 1);

    if (params.status) {
      query = query.eq("status", params.status);
    }

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);
    return { data, total: count, limit: params.limit, offset: params.offset };
  }

  if (method === "POST") {
    const body = await req.json();
    const { data, error } = await supabase
      .from("employees")
      .insert(body)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  throw new Error("Invalid request");
}

// Deal handlers
async function handleDeals(
  supabase: SupabaseClient,
  method: string,
  id: string | undefined,
  params: { limit: number; offset: number; status: string | null },
  req: Request
) {
  if (method === "GET" && id) {
    const { data, error } = await supabase
      .from("deals")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  if (method === "GET") {
    let query = supabase
      .from("deals")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(params.offset, params.offset + params.limit - 1);

    if (params.status) {
      query = query.eq("stage", params.status);
    }

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);
    return { data, total: count, limit: params.limit, offset: params.offset };
  }

  if (method === "POST") {
    const body = await req.json();
    const { data, error } = await supabase
      .from("deals")
      .insert(body)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  throw new Error("Invalid request");
}

// Wiki handlers
async function handleWiki(
  supabase: SupabaseClient,
  method: string,
  id: string | undefined,
  params: { limit: number; offset: number },
  req: Request
) {
  if (method === "GET" && id) {
    const { data, error } = await supabase
      .from("wiki_pages")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  if (method === "GET") {
    const url = new URL(req.url);
    const search = url.searchParams.get("search");

    let query = supabase
      .from("wiki_pages")
      .select("*", { count: "exact" })
      .order("updated_at", { ascending: false })
      .range(params.offset, params.offset + params.limit - 1);

    if (search) {
      query = query.ilike("title", `%${search}%`);
    }

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);
    return { data, total: count, limit: params.limit, offset: params.offset };
  }

  if (method === "POST") {
    const body = await req.json();
    const { data, error } = await supabase
      .from("wiki_pages")
      .insert(body)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  if (method === "PUT" && id) {
    const body = await req.json();
    const { data, error } = await supabase
      .from("wiki_pages")
      .update(body)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  throw new Error("Invalid request");
}
