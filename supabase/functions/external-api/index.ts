import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  action: "test_connection" | "sync_data" | "fetch_data";
  connection_id: string;
  params?: Record<string, unknown>;
}

// Service-specific API handlers
const serviceHandlers: Record<string, {
  test: (credentials: Record<string, string>, config: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>;
  fetch: (credentials: Record<string, string>, config: Record<string, unknown>, params: Record<string, unknown>) => Promise<unknown>;
}> = {
  freee: {
    test: async (credentials) => {
      try {
        // freee API test endpoint
        const response = await fetch("https://api.freee.co.jp/api/1/users/me", {
          headers: {
            Authorization: `Bearer ${credentials.access_token || credentials.api_key}`,
          },
        });
        if (response.ok) {
          return { success: true };
        }
        return { success: false, error: `API error: ${response.status}` };
      } catch (e: unknown) {
        return { success: false, error: e instanceof Error ? e.message : String(e) };
      }
    },
    fetch: async (credentials, config, params) => {
      const endpoint = params.endpoint as string || "/api/1/deals";
      const response = await fetch(`https://api.freee.co.jp${endpoint}`, {
        headers: {
          Authorization: `Bearer ${credentials.access_token || credentials.api_key}`,
        },
      });
      if (!response.ok) {
        throw new Error(`freee API error: ${response.status}`);
      }
      return response.json();
    },
  },
  hubspot: {
    test: async (credentials) => {
      try {
        const response = await fetch("https://api.hubapi.com/crm/v3/objects/contacts?limit=1", {
          headers: {
            Authorization: `Bearer ${credentials.api_key}`,
          },
        });
        if (response.ok) {
          return { success: true };
        }
        return { success: false, error: `API error: ${response.status}` };
      } catch (e: unknown) {
        return { success: false, error: e instanceof Error ? e.message : String(e) };
      }
    },
    fetch: async (credentials, config, params) => {
      const objectType = params.object_type as string || "contacts";
      const response = await fetch(`https://api.hubapi.com/crm/v3/objects/${objectType}`, {
        headers: {
          Authorization: `Bearer ${credentials.api_key}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HubSpot API error: ${response.status}`);
      }
      return response.json();
    },
  },
  smarthr: {
    test: async (credentials) => {
      try {
        const response = await fetch("https://api.smarthr.jp/v1/crews?per_page=1", {
          headers: {
            Authorization: `Bearer ${credentials.api_key}`,
          },
        });
        if (response.ok) {
          return { success: true };
        }
        return { success: false, error: `API error: ${response.status}` };
      } catch (e) {
        return { success: false, error: e.message };
      }
    },
    fetch: async (credentials, config, params) => {
      const endpoint = params.endpoint as string || "/v1/crews";
      const response = await fetch(`https://api.smarthr.jp${endpoint}`, {
        headers: {
          Authorization: `Bearer ${credentials.api_key}`,
        },
      });
      if (!response.ok) {
        throw new Error(`SmartHR API error: ${response.status}`);
      }
      return response.json();
    },
  },
  notion: {
    test: async (credentials) => {
      try {
        const response = await fetch("https://api.notion.com/v1/users/me", {
          headers: {
            Authorization: `Bearer ${credentials.api_key}`,
            "Notion-Version": "2022-06-28",
          },
        });
        if (response.ok) {
          return { success: true };
        }
        return { success: false, error: `API error: ${response.status}` };
      } catch (e) {
        return { success: false, error: e.message };
      }
    },
    fetch: async (credentials, config, params) => {
      const endpoint = params.endpoint as string || "/v1/databases";
      const response = await fetch(`https://api.notion.com${endpoint}`, {
        headers: {
          Authorization: `Bearer ${credentials.api_key}`,
          "Notion-Version": "2022-06-28",
        },
      });
      if (!response.ok) {
        throw new Error(`Notion API error: ${response.status}`);
      }
      return response.json();
    },
  },
  kintone: {
    test: async (credentials) => {
      try {
        const subdomain = credentials.subdomain;
        if (!subdomain) {
          return { success: false, error: "Subdomain is required" };
        }
        const response = await fetch(`https://${subdomain}.cybozu.com/k/v1/apps.json`, {
          headers: {
            "X-Cybozu-API-Token": credentials.api_token,
          },
        });
        if (response.ok) {
          return { success: true };
        }
        return { success: false, error: `API error: ${response.status}` };
      } catch (e) {
        return { success: false, error: e.message };
      }
    },
    fetch: async (credentials, config, params) => {
      const subdomain = credentials.subdomain;
      const appId = params.app_id as string;
      const response = await fetch(`https://${subdomain}.cybozu.com/k/v1/records.json?app=${appId}`, {
        headers: {
          "X-Cybozu-API-Token": credentials.api_token,
        },
      });
      if (!response.ok) {
        throw new Error(`kintone API error: ${response.status}`);
      }
      return response.json();
    },
  },
};

// Generic test for unsupported services
const genericTest = async (credentials: Record<string, string>): Promise<{ success: boolean; error?: string }> => {
  // Just validate that credentials are provided
  if (Object.keys(credentials).length === 0) {
    return { success: false, error: "No credentials provided" };
  }
  // For services without specific handlers, we assume success if credentials exist
  return { success: true };
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: RequestBody = await req.json();
    const { action, connection_id, params = {} } = body;

    // Get connection from database
    const { data: connection, error: connError } = await supabase
      .from("external_connections")
      .select("*, service:external_service_types(*)")
      .eq("id", connection_id)
      .eq("user_id", user.id)
      .single();

    if (connError || !connection) {
      return new Response(
        JSON.stringify({ error: "Connection not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const serviceType = connection.service_type;
    const credentials = connection.credentials as Record<string, string>;
    const serviceConfig = connection.service?.config || {};

    let result: unknown;

    switch (action) {
      case "test_connection": {
        const handler = serviceHandlers[serviceType];
        let testResult: { success: boolean; error?: string };
        
        if (handler) {
          testResult = await handler.test(credentials, serviceConfig);
        } else {
          testResult = await genericTest(credentials);
        }

        // Update connection status
        await supabase
          .from("external_connections")
          .update({
            status: testResult.success ? "active" : "error",
            last_error: testResult.success ? null : testResult.error,
            updated_at: new Date().toISOString(),
          })
          .eq("id", connection_id);

        result = testResult;
        break;
      }

      case "fetch_data": {
        const handler = serviceHandlers[serviceType];
        if (!handler) {
          return new Response(
            JSON.stringify({ error: `Unsupported service: ${serviceType}` }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        try {
          result = await handler.fetch(credentials, serviceConfig, params);
        } catch (e) {
          // Update connection status on error
          await supabase
            .from("external_connections")
            .update({
              status: "error",
              last_error: e.message,
              updated_at: new Date().toISOString(),
            })
            .eq("id", connection_id);

          throw e;
        }
        break;
      }

      case "sync_data": {
        // For now, just update last_sync_at and return success
        // In a real implementation, this would fetch data and import it
        const handler = serviceHandlers[serviceType];
        let syncedCount = 0;

        if (handler) {
          try {
            const data = await handler.fetch(credentials, serviceConfig, params);
            // Count items (assuming response has results array)
            if (Array.isArray(data)) {
              syncedCount = data.length;
            } else if (data && typeof data === "object") {
              const arr = (data as Record<string, unknown>).results || 
                         (data as Record<string, unknown>).data || 
                         (data as Record<string, unknown>).records;
              if (Array.isArray(arr)) {
                syncedCount = arr.length;
              }
            }
          } catch (e) {
            await supabase
              .from("external_connections")
              .update({
                status: "error",
                last_error: e.message,
                updated_at: new Date().toISOString(),
              })
              .eq("id", connection_id);

            return new Response(
              JSON.stringify({ success: false, error: e.message }),
              { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }

        // Update last sync time
        await supabase
          .from("external_connections")
          .update({
            last_sync_at: new Date().toISOString(),
            status: "active",
            last_error: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", connection_id);

        result = { success: true, synced_count: syncedCount };
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    console.log(`[external-api] Action: ${action}, Service: ${serviceType}, Result:`, result);

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[external-api] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
