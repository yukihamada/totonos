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

interface EmailAddressConfig {
  id: string;
  company_id: string;
  address_prefix: string;
  purpose: string;
  is_active: boolean;
  auto_create_entity: boolean;
  ai_processing_enabled: boolean;
  assigned_to: string | null;
}

// メールアドレスのプレフィックスから設定を取得
async function findEmailAddressConfig(
  supabase: any, 
  toEmail: string
): Promise<{ config: EmailAddressConfig | null; companyId: string | null }> {
  if (!toEmail) return { config: null, companyId: null };
  
  // Parse email address: prefix@company-slug.totonos.jp
  const match = toEmail.match(/^([^@]+)@([^.]+)\.totonos\.jp$/i);
  if (!match) return { config: null, companyId: null };

  const prefix = match[1].toLowerCase();
  const slug = match[2];

  // Find company by slug
  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .or(`name.ilike.${slug},id.eq.${slug}`)
    .single();

  if (!company) return { config: null, companyId: null };

  // Find email address config
  const { data: emailConfig } = await supabase
    .from("company_email_addresses")
    .select("*")
    .eq("company_id", company.id)
    .eq("address_prefix", prefix)
    .eq("is_active", true)
    .single();

  return { 
    config: emailConfig as EmailAddressConfig | null, 
    companyId: company.id 
  };
}

// メールアドレスからcompany_idを特定（fallback）
async function findCompanyByEmail(supabase: any, toEmail: string): Promise<string | null> {
  if (!toEmail) return null;
  
  // totonos.jp のサブドメインからcompany_idを特定
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

// 自動エンティティ作成
async function autoCreateEntity(
  supabase: any,
  companyId: string,
  purpose: string,
  fromEmail: string,
  fromName: string | null,
  subject: string | null
): Promise<{ type: string; id: string } | null> {
  console.log(`Auto-creating entity for purpose: ${purpose}`);

  switch (purpose) {
    case "lead_capture": {
      // Create a new lead
      const { data: lead, error } = await supabase
        .from("leads")
        .insert({
          company_id: companyId,
          email: fromEmail,
          contact_name: fromName || fromEmail.split("@")[0],
          company_name: fromName || "メール経由リード",
          source: "email",
          status: "new",
          notes: `件名: ${subject || "(なし)"}`,
        })
        .select()
        .single();

      if (error) {
        console.error("Failed to create lead:", error);
        return null;
      }
      return { type: "lead", id: lead.id };
    }

    case "recruit": {
      // Create a candidate (if candidates table exists)
      // For now, just log
      console.log(`Would create candidate from: ${fromEmail}`);
      return null;
    }

    default:
      return null;
  }
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
    .eq("email", fromEmail)
    .single();

  if (lead) return { type: "lead", id: lead.id };

  // 取引先を検索
  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("email", fromEmail)
    .single();

  if (client) return { type: "client", id: client.id };

  return null;
}

// AI分析をトリガー
async function triggerAIAnalysis(
  supabase: any,
  emailId: string,
  textContent: string,
  subject: string | null
): Promise<void> {
  try {
    // Call the analyze-email edge function
    const { error } = await supabase.functions.invoke("analyze-email", {
      body: { emailId, textContent, subject },
    });
    
    if (error) {
      console.error("AI analysis failed:", error);
    }
  } catch (err) {
    console.error("Failed to trigger AI analysis:", err);
  }
}

// 画像添付ファイルをOCR処理
async function processReceiptAttachment(
  supabase: any,
  attachment: { filename: string; type: string; content?: string },
  companyId: string | null,
  emailId: string,
  assignedTo: string | null
): Promise<void> {
  if (!attachment.content) {
    console.log("No content in attachment, skipping OCR");
    return;
  }

  console.log(`Processing receipt attachment: ${attachment.filename}`);

  try {
    // Call OCR function
    const { data, error } = await supabase.functions.invoke("ocr-receipt", {
      body: {
        imageBase64: `data:${attachment.type};base64,${attachment.content}`,
        source: "email",
        sourceEmailId: emailId,
        companyId: companyId,
        saveToDb: true,
        applyLegalTimestamp: true, // 電子帳簿保存法対応
      },
    });

    if (error) {
      console.error("OCR processing failed:", error);
      return;
    }

    console.log(`Receipt OCR completed: ${data?.receipt?.id}`);

    // 通知を作成
    if (assignedTo && data?.receipt) {
      const receipt = data.receipt;
      const vendor = receipt.vendor || "不明な店舗";
      const total = receipt.total_amount 
        ? `¥${Number(receipt.total_amount).toLocaleString()}` 
        : "金額不明";

      await supabase.from("notifications").insert({
        user_id: assignedTo,
        company_id: companyId,
        type: "info",
        title: "📧 メール経由の領収書を保存しました",
        message: `${vendor} - ${total}\n電子帳簿保存法に準拠して保存されました。`,
        category: "receipt",
        link: `/receipt-capture`,
        metadata: {
          receipt_id: receipt.id,
          email_id: emailId,
          vendor: vendor,
          total: receipt.total_amount,
          legal_verified: true,
        },
      });

      console.log(`Notification sent to user: ${assignedTo}`);
    }
  } catch (err) {
    console.error("Failed to process receipt:", err);
  }
}

// 会社の管理者を取得
async function getCompanyAdmins(supabase: any, companyId: string): Promise<string[]> {
  const { data } = await supabase
    .from("company_members")
    .select("user_id")
    .eq("company_id", companyId)
    .in("role", ["owner", "admin"]);

  return (data || []).map((m: { user_id: string }) => m.user_id);
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
      
      console.log("Received JSON payload:", JSON.stringify(jsonPayload, null, 2));

      // Resend format detection
      if (jsonPayload.type === "email.received" && jsonPayload.data) {
        const resendData = jsonPayload as ResendInboundEmail;
        const data = resendData.data;

        console.log("Detected Resend format");

        // Convert headers array to object
        const headersObj: Record<string, string> = {};
        if (data.headers) {
          for (const h of data.headers) {
            headersObj[h.name] = h.value;
          }
        }

        emailData = {
          from: data.from || "",
          to: data.to?.[0] || "",
          cc: data.cc?.join(", "),
          subject: data.subject || "",
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
        // Ensure required fields
        emailData.from = emailData.from || "";
        emailData.to = emailData.to || "";
      }
    }

    // 送信元からname/emailを分離
    let fromEmail = emailData.from || "";
    let fromName = emailData.fromName;
    if (emailData.from) {
      const fromMatch = emailData.from.match(/^(.+?)\s*<([^>]+)>$/);
      if (fromMatch) {
        fromName = fromMatch[1].replace(/^["']|["']$/g, "");
        fromEmail = fromMatch[2];
      }
    }

    // 宛先メールアドレスを正規化
    let toEmail = emailData.to || "";
    if (emailData.to) {
      const toMatch = emailData.to.match(/<([^>]+)>/);
      if (toMatch) {
        toEmail = toMatch[1];
      }
    }

    console.log(`Processing email from: ${fromEmail} to: ${toEmail}`);

    // メールアドレス設定を取得
    const { config: emailAddressConfig, companyId: configCompanyId } = 
      await findEmailAddressConfig(supabase, toEmail);
    
    // 会社IDを決定
    const companyId = configCompanyId || await findCompanyByEmail(supabase, toEmail);
    console.log(`Found company: ${companyId}, email config: ${emailAddressConfig?.id}`);

    let relatedType: string | null = null;
    let relatedId: string | null = null;
    let autoCreatedEntityType: string | null = null;
    let autoCreatedEntityId: string | null = null;
    let assignedTo: string | null = emailAddressConfig?.assigned_to || null;

    // 担当者が未設定の場合、会社の管理者を取得
    if (!assignedTo && companyId) {
      const admins = await getCompanyAdmins(supabase, companyId);
      if (admins.length > 0) {
        assignedTo = admins[0];
      }
    }

    if (companyId) {
      // 自動エンティティ作成
      if (emailAddressConfig?.auto_create_entity) {
        const created = await autoCreateEntity(
          supabase,
          companyId,
          emailAddressConfig.purpose,
          fromEmail,
          fromName || null,
          emailData.subject || null
        );
        if (created) {
          autoCreatedEntityType = created.type;
          autoCreatedEntityId = created.id;
          relatedType = created.type;
          relatedId = created.id;
        }
      }

      // 既存エンティティとの関連付け
      if (!relatedType) {
        const related = await findRelatedEntity(supabase, companyId, fromEmail);
        if (related) {
          relatedType = related.type;
          relatedId = related.id;
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
        related_type: relatedType,
        related_id: relatedId,
        assigned_to: assignedTo,
        tags: [],
        email_address_id: emailAddressConfig?.id || null,
        auto_created_entity_type: autoCreatedEntityType,
        auto_created_entity_id: autoCreatedEntityId,
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

    // 画像添付ファイルをOCR処理（非同期）
    const imageAttachments = (emailData.attachments || []).filter(
      att => att.type?.startsWith("image/") || 
             /\.(jpg|jpeg|png|gif|webp|heic|heif)$/i.test(att.filename)
    );

    if (imageAttachments.length > 0) {
      console.log(`Found ${imageAttachments.length} image attachments, processing as receipts`);
      
      // 並列でOCR処理
      for (const att of imageAttachments) {
        // 非同期で処理（await しない）
        processReceiptAttachment(
          supabase, 
          att, 
          companyId, 
          savedEmail.id, 
          assignedTo
        );
      }
    }

    // AI分析をトリガー（非同期）
    if (emailAddressConfig?.ai_processing_enabled !== false) {
      triggerAIAnalysis(
        supabase,
        savedEmail.id,
        emailData.text || emailData.html || "",
        emailData.subject || null
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        id: savedEmail.id,
        autoCreated: autoCreatedEntityType ? { type: autoCreatedEntityType, id: autoCreatedEntityId } : null,
        receiptProcessing: imageAttachments.length > 0 ? { count: imageAttachments.length } : null
      }),
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