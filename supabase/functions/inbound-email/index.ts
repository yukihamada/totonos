import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature",
};

interface InboundEmail {
  from: string;
  fromName?: string;
  to: string;
  cc?: string;
  bcc?: string;
  subject?: string;
  text?: string;
  html?: string;
  replyTo?: string;
  messageId?: string;
  headers?: Record<string, string>;
  attachments?: Array<{
    filename: string;
    type: string;
    size: number;
    content?: string; // base64
  }>;
  // SendGrid specific
  envelope?: string;
  charsets?: string;
  SPF?: string;
  DKIM?: string;
}

// Resend Inbound Email format
interface ResendInboundEmail {
  type: "email.received";
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    cc?: string[];
    bcc?: string[];
    reply_to?: string[];
    subject: string;
    text?: string;
    html?: string;
    attachments?: Array<{
      filename: string;
      content: string; // base64
      content_type: string;
    }>;
    headers?: Array<{
      name: string;
      value: string;
    }>;
  };
}

// メールアドレスからcompany_idを特定
async function findCompanyByEmail(supabase: any, toEmail: string): Promise<string | null> {
  // totonos.jp のサブドメインからcompany_idを特定
  // 例: inbox@company-slug.totonos.jp
  const match = toEmail.match(/^[^@]+@([^.]+)\.totonos\.jp$/i);
  if (match) {
    const slug = match[1];
    const { data } = await supabase
      .from("companies")
      .select("id")
      .or(`name.ilike.${slug},id.eq.${slug}`)
      .single();
    return data?.id || null;
  }

  // 直接メールアドレスで会社を検索
  const { data } = await supabase
    .from("companies")
    .select("id")
    .eq("email", toEmail)
    .single();

  return data?.id || null;
}

// ルーティングルールを適用
async function applyRoutingRules(
  supabase: any,
  companyId: string,
  email: InboundEmail
): Promise<{ relatedType?: string; relatedId?: string; assignedTo?: string; tags?: string[] }> {
  const { data: rules } = await supabase
    .from("email_routing_rules")
    .select("*")
    .eq("company_id", companyId)
    .eq("is_active", true)
    .order("priority", { ascending: false });

  if (!rules || rules.length === 0) return {};

  for (const rule of rules) {
    const conditions = rule.conditions || {};
    let matches = true;

    // 条件チェック
    if (conditions.from_contains && !email.from.toLowerCase().includes(conditions.from_contains.toLowerCase())) {
      matches = false;
    }
    if (conditions.from_equals && email.from.toLowerCase() !== conditions.from_equals.toLowerCase()) {
      matches = false;
    }
    if (conditions.subject_contains && email.subject && !email.subject.toLowerCase().includes(conditions.subject_contains.toLowerCase())) {
      matches = false;
    }
    if (conditions.subject_regex && email.subject) {
      try {
        const regex = new RegExp(conditions.subject_regex, "i");
        if (!regex.test(email.subject)) matches = false;
      } catch {
        matches = false;
      }
    }

    if (matches) {
      const actions = rule.actions || {};
      return {
        relatedType: actions.related_type,
        relatedId: actions.related_id,
        assignedTo: actions.assign_to,
        tags: actions.add_tags,
      };
    }
  }

  return {};
}

// 既存のリード/取引先を検索して関連付け
async function findRelatedEntity(
  supabase: any,
  companyId: string,
  fromEmail: string
): Promise<{ type: string; id: string } | null> {
  // リードを検索
  const { data: lead } = await supabase
    .from("leads")
    .select("id")
    .eq("company_id", companyId)
    .eq("email", fromEmail)
    .single();

  if (lead) return { type: "lead", id: lead.id };

  // 取引先を検索
  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("company_id", companyId)
    .eq("email", fromEmail)
    .single();

  if (client) return { type: "client", id: client.id };

  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    let emailData: InboundEmail;

    // Content-Type に応じてパース
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      // SendGrid Inbound Parse format
      const formData = await req.formData();
      emailData = {
        from: formData.get("from") as string || "",
        to: formData.get("to") as string || "",
        cc: formData.get("cc") as string || undefined,
        subject: formData.get("subject") as string || undefined,
        text: formData.get("text") as string || undefined,
        html: formData.get("html") as string || undefined,
        envelope: formData.get("envelope") as string || undefined,
        charsets: formData.get("charsets") as string || undefined,
        SPF: formData.get("SPF") as string || undefined,
        DKIM: formData.get("DKIM") as string || undefined,
      };

      // Parse headers
      const headersRaw = formData.get("headers") as string;
      if (headersRaw) {
        emailData.headers = {};
        const lines = headersRaw.split("\n");
        for (const line of lines) {
          const [key, ...valueParts] = line.split(":");
          if (key && valueParts.length > 0) {
            emailData.headers[key.trim()] = valueParts.join(":").trim();
          }
        }
        emailData.messageId = emailData.headers["Message-ID"] || emailData.headers["Message-Id"];
      }

      // Attachments
      const attachmentInfo = formData.get("attachment-info");
      if (attachmentInfo) {
        try {
          const info = JSON.parse(attachmentInfo as string);
          emailData.attachments = [];
          for (const [key, meta] of Object.entries(info as Record<string, any>)) {
            const file = formData.get(key) as File;
            if (file) {
              const buffer = await file.arrayBuffer();
              const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
              emailData.attachments.push({
                filename: meta.filename || file.name,
                type: meta.type || file.type,
                size: file.size,
                content: base64,
              });
            }
          }
        } catch {
          // Ignore attachment parsing errors
        }
      }
    } else {
      // JSON format (Resend, Mailgun, Postmark, etc.)
      const jsonPayload = await req.json();

      // Resend format detection
      if (jsonPayload.type === "email.received" && jsonPayload.data) {
        const resendData = jsonPayload as ResendInboundEmail;
        const data = resendData.data;

        // Convert headers array to object
        const headersObj: Record<string, string> = {};
        if (data.headers) {
          for (const h of data.headers) {
            headersObj[h.name] = h.value;
          }
        }

        emailData = {
          from: data.from,
          to: data.to[0] || "",
          cc: data.cc?.join(", "),
          subject: data.subject,
          text: data.text,
          html: data.html,
          replyTo: data.reply_to?.[0],
          messageId: data.email_id,
          headers: headersObj,
          attachments: data.attachments?.map(att => ({
            filename: att.filename,
            type: att.content_type,
            size: att.content ? Math.ceil(att.content.length * 0.75) : 0, // base64 to byte estimate
            content: att.content,
          })),
        };
      } else {
        // Generic JSON format
        emailData = jsonPayload;
      }
    }

    // 送信元からname/emailを分離
    let fromEmail = emailData.from;
    let fromName = emailData.fromName;
    const fromMatch = emailData.from.match(/^(.+?)\s*<([^>]+)>$/);
    if (fromMatch) {
      fromName = fromMatch[1].replace(/^["']|["']$/g, "");
      fromEmail = fromMatch[2];
    }

    // 宛先メールアドレスを正規化
    let toEmail = emailData.to;
    const toMatch = emailData.to.match(/<([^>]+)>/);
    if (toMatch) {
      toEmail = toMatch[1];
    }

    // 会社を特定
    const companyId = await findCompanyByEmail(supabase, toEmail);

    // ルーティングルール適用
    let routingResult: any = {};
    if (companyId) {
      routingResult = await applyRoutingRules(supabase, companyId, emailData);

      // 自動関連付け
      if (!routingResult.relatedType) {
        const related = await findRelatedEntity(supabase, companyId, fromEmail);
        if (related) {
          routingResult.relatedType = related.type;
          routingResult.relatedId = related.id;
        }
      }
    }

    // CCをパース
    const ccEmails = emailData.cc
      ? emailData.cc.split(",").map(e => {
          const m = e.trim().match(/<([^>]+)>/);
          return m ? m[1] : e.trim();
        })
      : [];

    // DBに保存
    const { data: savedEmail, error } = await supabase
      .from("inbound_emails")
      .insert({
        company_id: companyId,
        message_id: emailData.messageId,
        from_email: fromEmail,
        from_name: fromName,
        to_email: toEmail,
        cc_emails: ccEmails.length > 0 ? ccEmails : null,
        reply_to: emailData.replyTo,
        subject: emailData.subject,
        text_body: emailData.text,
        html_body: emailData.html,
        attachments: emailData.attachments || [],
        headers: emailData.headers || {},
        raw_payload: emailData,
        status: "received",
        related_type: routingResult.relatedType,
        related_id: routingResult.relatedId,
        assigned_to: routingResult.assignedTo,
        tags: routingResult.tags || [],
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to save email:", error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Email saved: ${savedEmail.id} from ${fromEmail} to ${toEmail}`);

    return new Response(
      JSON.stringify({ success: true, id: savedEmail.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing inbound email:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
