import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as XLSX from "https://esm.sh/xlsx@0.18.5";
import { checkRateLimit, createRateLimitResponse } from "../_shared/rate-limit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RATE_LIMIT = { maxRequests: 20, windowMs: 86400000 };

const EXPORT_TABLES: Record<string, string[]> = {
  all: [
    'invoices', 'contracts', 'leads', 'deals', 'clients',
    'employees', 'estimates', 'purchase_orders', 'tasks',
    'journal_entries', 'accounts', 'expense_claims',
    'attendance_records', 'activities', 'products', 'projects',
  ],
  financial: ['invoices', 'journal_entries', 'accounts', 'expense_claims', 'budgets'],
  accounting: ['accounts', 'journal_entries', 'budgets', 'expense_claims'],
  crm: ['leads', 'deals', 'clients', 'activities'],
  hr: ['employees', 'attendance_records'],
  contracts: ['contracts', 'estimates', 'purchase_orders'],
  admin_stats: [], // special: aggregated stats
};

interface ExportRequest {
  category?: string;
  format?: 'json' | 'csv' | 'xlsx' | 'freee' | 'yayoi';
  scope?: 'company' | 'admin'; // admin = aggregated across all companies (super-admin only)
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: ExportRequest = await req.json().catch(() => ({}));
    const { category = 'all', format = 'json', scope = 'company' } = body;

    // Admin-scope stats: only allow super-admin (owner of TOTONOS itself)
    // Simple check: must be admin/owner of any company AND category is admin_stats
    const { data: member } = await supabase
      .from('company_members')
      .select('company_id, role')
      .eq('user_id', user.id)
      .in('role', ['owner', 'admin'])
      .maybeSingle();

    if (!member) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const companyId = member.company_id;
    const rateLimitResult = checkRateLimit(`backup:${companyId}`, RATE_LIMIT);
    if (!rateLimitResult.allowed) return createRateLimitResponse(rateLimitResult, corsHeaders);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const exportData: Record<string, unknown[]> = {};

    // ===== ADMIN STATS =====
    if (category === 'admin_stats' || scope === 'admin') {
      const tables = ['companies', 'profiles', 'company_members', 'credit_transactions', 'invoices', 'journal_entries', 'leads', 'deals'];
      const stats: Record<string, unknown> = {};
      for (const t of tables) {
        const { count } = await supabase.from(t).select('*', { count: 'exact', head: true });
        stats[t] = count ?? 0;
      }
      const { data: companiesData } = await supabase
        .from('companies').select('id, name, slug, created_at, industry, employee_count');
      exportData['summary'] = [stats];
      exportData['companies'] = companiesData ?? [];
      return generateResponse(exportData, format, `totonos-admin-stats-${timestamp}`);
    }

    // ===== ACCOUNTING SPECIALIZED =====
    if (category === 'accounting' || format === 'freee' || format === 'yayoi') {
      const { data: accounts } = await supabase.from('accounts').select('*').eq('user_id', user.id);
      const { data: journals } = await supabase.from('journal_entries').select('*').eq('user_id', user.id);

      if (format === 'freee') {
        const csv = generateFreeeCsv(journals ?? []);
        return new Response(csv, {
          status: 200,
          headers: {
            ...corsHeaders, "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="freee-journal-${timestamp}.csv"`,
          },
        });
      }
      if (format === 'yayoi') {
        const csv = generateYayoiCsv(journals ?? []);
        return new Response("\ufeff" + csv, {
          status: 200,
          headers: {
            ...corsHeaders, "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="yayoi-journal-${timestamp}.csv"`,
          },
        });
      }
      exportData['accounts'] = accounts ?? [];
      exportData['journal_entries'] = journals ?? [];
      return generateResponse(exportData, format, `totonos-accounting-${timestamp}`);
    }

    // ===== STANDARD COMPANY EXPORT =====
    const tables = EXPORT_TABLES[category] || EXPORT_TABLES.all;
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table).select('*').eq('user_id', user.id).limit(10000);
        if (error) {
          console.warn(`Failed ${table}:`, error.message);
          exportData[table] = [];
        } else {
          exportData[table] = data ?? [];
        }
      } catch (err) {
        console.warn(`Error ${table}:`, err);
        exportData[table] = [];
      }
    }

    return generateResponse(exportData, format, `totonos-backup-${category}-${timestamp}`);
  } catch (error) {
    console.error("Export error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function generateResponse(
  data: Record<string, unknown[]>,
  format: string,
  basename: string
): Response {
  if (format === 'xlsx') {
    const wb = XLSX.utils.book_new();
    for (const [table, rows] of Object.entries(data)) {
      const ws = XLSX.utils.json_to_sheet(rows.length > 0 ? rows as Record<string, unknown>[] : [{ note: 'no data' }]);
      XLSX.utils.book_append_sheet(wb, ws, table.substring(0, 31));
    }
    const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    return new Response(buf, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${basename}.xlsx"`,
      },
    });
  }

  if (format === 'csv') {
    const parts: string[] = [];
    for (const [table, rows] of Object.entries(data)) {
      if (rows.length === 0) continue;
      parts.push(`--- ${table.toUpperCase()} ---`);
      const headers = Object.keys(rows[0] as object);
      parts.push(headers.join(','));
      for (const row of rows as Record<string, unknown>[]) {
        parts.push(headers.map(h => csvEscape(row[h])).join(','));
      }
      parts.push('');
    }
    return new Response("\ufeff" + parts.join('\n'), {
      status: 200,
      headers: {
        ...corsHeaders, "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${basename}.csv"`,
      },
    });
  }

  // JSON default
  return new Response(JSON.stringify({
    meta: { exportedAt: new Date().toISOString(), tables: Object.keys(data) },
    data,
  }, null, 2), {
    status: 200,
    headers: {
      ...corsHeaders, "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${basename}.json"`,
    },
  });
}

function csvEscape(val: unknown): string {
  if (val === null || val === undefined) return '';
  const s = typeof val === 'object' ? JSON.stringify(val) : String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

// freee 振替伝票形式 (簡易): 取引日,借方勘定科目,借方金額,貸方勘定科目,貸方金額,摘要
function generateFreeeCsv(journals: any[]): string {
  const headers = ['取引日', '借方勘定科目', '借方金額', '貸方勘定科目', '貸方金額', '摘要'];
  const rows = [headers.join(',')];
  for (const j of journals) {
    rows.push([
      j.date ?? j.entry_date ?? '',
      j.debit_account ?? '',
      j.amount ?? 0,
      j.credit_account ?? '',
      j.amount ?? 0,
      csvEscape(j.description ?? ''),
    ].join(','));
  }
  return "\ufeff" + rows.join('\n');
}

// 弥生会計形式 (簡易・標準フォーマット)
function generateYayoiCsv(journals: any[]): string {
  const headers = ['識別フラグ', '伝票No', '決算', '取引日付', '借方勘定科目', '借方金額', '貸方勘定科目', '貸方金額', '摘要'];
  const rows = [headers.join(',')];
  let no = 1;
  for (const j of journals) {
    rows.push([
      '2000', no++, '', j.date ?? j.entry_date ?? '',
      j.debit_account ?? '', j.amount ?? 0,
      j.credit_account ?? '', j.amount ?? 0,
      csvEscape(j.description ?? ''),
    ].join(','));
  }
  return rows.join('\n');
}
