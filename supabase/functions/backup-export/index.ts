import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, createRateLimitResponse } from "../_shared/rate-limit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limit: 5 exports per day
const RATE_LIMIT = { maxRequests: 5, windowMs: 86400000 };

// Tables to export for each category
const EXPORT_TABLES: Record<string, string[]> = {
  all: [
    'invoices', 'contracts', 'leads', 'deals', 'clients',
    'employees', 'estimates', 'purchase_orders', 'tasks',
    'documents', 'journal_entries', 'accounts', 'expense_claims',
    'attendance_records', 'leave_requests', 'wiki_pages', 'activities',
  ],
  financial: ['invoices', 'journal_entries', 'accounts', 'expense_claims'],
  crm: ['leads', 'deals', 'clients', 'activities'],
  hr: ['employees', 'attendance_records', 'leave_requests'],
  contracts: ['contracts', 'estimates', 'purchase_orders'],
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify user token
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user's organization with admin check
    const { data: member } = await supabaseClient
      .from('organization_members')
      .select('organization_id, role')
      .eq('user_id', user.id)
      .in('role', ['owner', 'admin'])
      .single();

    if (!member) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const organizationId = member.organization_id;

    // Rate limiting
    const rateLimitResult = await checkRateLimit(`backup:${organizationId}`, RATE_LIMIT);
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult, corsHeaders);
    }

    const { category = 'all', format = 'json' } = await req.json();

    const tables = EXPORT_TABLES[category] || EXPORT_TABLES.all;
    const exportData: Record<string, unknown[]> = {};
    const exportMeta = {
      exportedAt: new Date().toISOString(),
      organizationId,
      exportedBy: user.id,
      category,
      tables,
    };

    // Export each table
    for (const table of tables) {
      try {
        const { data, error } = await supabaseClient
          .from(table)
          .select('*')
          .eq('organization_id', organizationId)
          .limit(10000); // Safety limit

        if (error) {
          console.warn(`Failed to export ${table}:`, error);
          exportData[table] = [];
        } else {
          exportData[table] = data || [];
        }
      } catch (err) {
        console.warn(`Error exporting ${table}:`, err);
        exportData[table] = [];
      }
    }

    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `totonos-backup-${category}-${timestamp}.${format}`;

    let responseBody: string;
    let contentType: string;

    if (format === 'csv') {
      // Convert to CSV (simplified - one file per table in a zip would be better)
      const csvParts: string[] = [];

      for (const [table, rows] of Object.entries(exportData)) {
        if (rows.length === 0) continue;

        csvParts.push(`--- ${table.toUpperCase()} ---`);
        const headers = Object.keys(rows[0] as object);
        csvParts.push(headers.join(','));

        for (const row of rows as Record<string, unknown>[]) {
          const values = headers.map(h => {
            const val = row[h];
            if (val === null || val === undefined) return '';
            if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
              return `"${val.replace(/"/g, '""')}"`;
            }
            return String(val);
          });
          csvParts.push(values.join(','));
        }
        csvParts.push('');
      }

      responseBody = csvParts.join('\n');
      contentType = 'text/csv';
    } else {
      // JSON format
      responseBody = JSON.stringify({
        meta: exportMeta,
        data: exportData,
      }, null, 2);
      contentType = 'application/json';
    }

    // Log the export for audit
    await supabaseClient.rpc('log_audit_event', {
      p_organization_id: organizationId,
      p_user_id: user.id,
      p_action: 'backup.export',
      p_resource_type: 'backup',
      p_metadata: {
        category,
        format,
        tables_count: tables.length,
        total_records: Object.values(exportData).reduce((sum, arr) => sum + (arr as unknown[]).length, 0),
      },
    }).catch(err => console.error('Audit log failed:', err));

    return new Response(responseBody, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Backup export error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
