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
  notify_mode: string; // 'assigned_only' | 'all_members' | 'admins_only'
}

type NotifyMode = 'assigned_only' | 'all_members' | 'admins_only';

// 登録されたメールアドレスから設定を取得（totonos.jpドメインのみ）
async function findEmailAddressConfig(
  supabase: any, 
  toEmail: string
): Promise<{ config: EmailAddressConfig | null; companyId: string | null }> {
  if (!toEmail) return { config: null, companyId: null };
  
  // totonos.jp へのメールのみ処理
  const match = toEmail.match(/^([^@]+)@([^.]+)\.totonos\.jp$/i);
  if (!match) {
    console.log(`Email not in totonos.jp format: ${toEmail}`);
    return { config: null, companyId: null };
  }

  const prefix = match[1].toLowerCase();
  const slug = match[2].toLowerCase();

  console.log(`Looking for company with slug: ${slug}, prefix: ${prefix}`);

  // Find company by slug
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("id, slug, name")
    .eq("slug", slug)
    .single();

  if (companyError || !company) {
    console.log(`Company not found for slug: ${slug}`);
    return { config: null, companyId: null };
  }

  console.log(`Found company: ${company.id} (${company.name})`);

  // Find email address config
  const { data: emailConfig, error: configError } = await supabase
    .from("company_email_addresses")
    .select("*")
    .eq("company_id", company.id)
    .eq("address_prefix", prefix)
    .eq("is_active", true)
    .single();

  if (configError || !emailConfig) {
    console.log(`No active email config found for prefix: ${prefix} in company: ${company.id}`);
    // 会社は見つかったが、メールアドレス設定がない場合も会社IDは返す
    return { config: null, companyId: company.id };
  }

  console.log(`Found email config: ${emailConfig.id} (purpose: ${emailConfig.purpose})`);
  
  return { 
    config: emailConfig as EmailAddressConfig, 
    companyId: company.id 
  };
}

// 送信者のメールアドレスから所属会社を特定（複数会社対応）
async function findCompanyByUserEmail(
  supabase: any, 
  fromEmail: string,
  ocrVendorName?: string
): Promise<{ companyId: string | null; userId: string | null }> {
  console.log(`Looking for user by email: ${fromEmail}`);
  
  // まずauth.usersからユーザーを検索（メールアドレスで）
  // サービスロールを使っているのでauth.usersにアクセス可能
  const { data: authUser, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) {
    console.error("Failed to list users:", authError);
    return { companyId: null, userId: null };
  }

  const user = authUser?.users?.find((u: any) => 
    u.email?.toLowerCase() === fromEmail.toLowerCase()
  );

  if (!user) {
    console.log(`No user found with email: ${fromEmail}`);
    return { companyId: null, userId: null };
  }

  const userId = user.id;
  console.log(`Found user: ${userId}`);

  // ユーザーが所属する会社を取得
  const { data: memberships, error: memberError } = await supabase
    .from("company_members")
    .select("company_id, companies(id, name, slug)")
    .eq("user_id", userId)
    .eq("is_active", true);

  if (memberError || !memberships || memberships.length === 0) {
    console.log(`No company memberships for user: ${userId}`);
    return { companyId: null, userId };
  }

  console.log(`User belongs to ${memberships.length} companies`);

  // 1社のみの場合はそのまま返す
  if (memberships.length === 1) {
    return { companyId: memberships[0].company_id, userId };
  }

  // 複数会社の場合、領収書のベンダー名から会社を特定
  if (ocrVendorName) {
    console.log(`Trying to match vendor name: ${ocrVendorName}`);
    
    // 会社名とベンダー名を比較
    for (const m of memberships) {
      const company = m.companies as any;
      if (!company) continue;
      
      const companyName = company.name?.toLowerCase() || "";
      const vendorLower = ocrVendorName.toLowerCase();
      
      // 部分一致でマッチング
      if (companyName.includes(vendorLower) || vendorLower.includes(companyName)) {
        console.log(`Matched company by vendor name: ${company.id} (${company.name})`);
        return { companyId: m.company_id, userId };
      }
    }
  }

  // マッチしない場合は最初の会社を返す（ユーザーの現在選択中の会社を優先したいが、情報がない）
  console.log(`Using first company: ${memberships[0].company_id}`);
  return { companyId: memberships[0].company_id, userId };
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

// 通知を送信する対象ユーザーを取得
async function getNotificationRecipients(
  supabase: any,
  companyId: string,
  notifyMode: NotifyMode,
  assignedTo: string | null
): Promise<string[]> {
  switch (notifyMode) {
    case "assigned_only":
      if (assignedTo) {
        return [assignedTo];
      }
      // フォールバック: 管理者に通知
      return await getCompanyAdmins(supabase, companyId);

    case "admins_only":
      return await getCompanyAdmins(supabase, companyId);

    case "all_members":
      return await getCompanyMembers(supabase, companyId);

    default:
      return assignedTo ? [assignedTo] : await getCompanyAdmins(supabase, companyId);
  }
}

// 会社の管理者を取得
async function getCompanyAdmins(supabase: any, companyId: string): Promise<string[]> {
  const { data } = await supabase
    .from("company_members")
    .select("user_id")
    .eq("company_id", companyId)
    .eq("is_active", true)
    .in("role", ["owner", "admin"]);

  return (data || []).map((m: { user_id: string }) => m.user_id);
}

// 会社のメンバー全員を取得
async function getCompanyMembers(supabase: any, companyId: string): Promise<string[]> {
  const { data } = await supabase
    .from("company_members")
    .select("user_id")
    .eq("company_id", companyId)
    .eq("is_active", true);

  return (data || []).map((m: { user_id: string }) => m.user_id);
}

// 画像添付ファイルをOCR処理
async function processReceiptAttachment(
  supabase: any,
  attachment: { filename: string; type: string; content?: string },
  companyId: string | null,
  emailId: string,
  notifyMode: NotifyMode,
  assignedTo: string | null,
  fromEmail: string
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
        applyLegalTimestamp: true,
      },
    });

    if (error) {
      console.error("OCR processing failed:", error);
      return;
    }

    console.log(`Receipt OCR completed: ${data?.receipt?.id}`);

    // 会社IDがない場合、領収書のベンダー名から会社を特定
    let finalCompanyId = companyId;
    let finalAssignedTo = assignedTo;
    
    if (!finalCompanyId && data?.receipt?.vendor) {
      const { companyId: matchedCompanyId, userId } = await findCompanyByUserEmail(
        supabase, 
        fromEmail, 
        data.receipt.vendor
      );
      finalCompanyId = matchedCompanyId;
      if (!finalAssignedTo && userId) {
        finalAssignedTo = userId;
      }
    }

    // 通知を送信
    if (finalCompanyId && data?.receipt) {
      const receipt = data.receipt;
      const vendor = receipt.vendor || "不明な店舗";
      const total = receipt.total_amount 
        ? `¥${Number(receipt.total_amount).toLocaleString()}` 
        : "金額不明";

      // 通知対象ユーザーを取得
      const recipients = await getNotificationRecipients(
        supabase,
        finalCompanyId,
        notifyMode,
        finalAssignedTo
      );

      console.log(`Sending notifications to ${recipients.length} users`);

      // 全員に通知を作成
      for (const userId of recipients) {
        await supabase.from("notifications").insert({
          user_id: userId,
          company_id: finalCompanyId,
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
      }

      console.log(`Notifications sent to ${recipients.length} users`);
    }
  } catch (err) {
    console.error("Failed to process receipt:", err);
  }
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
            size: att.content ? Math.ceil(att.content.length * 0.75) : 0,
            content: att.content,
          })),
        };
      } else {
        // Generic JSON format
        emailData = jsonPayload;
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

    // 登録されたメールアドレスから設定を取得
    const { config: emailAddressConfig, companyId: configCompanyId } = 
      await findEmailAddressConfig(supabase, toEmail);
    
    let companyId = configCompanyId;
    let assignedTo: string | null = emailAddressConfig?.assigned_to || null;
    const notifyMode: NotifyMode = (emailAddressConfig?.notify_mode as NotifyMode) || "assigned_only";

    // 会社が特定できない場合、送信者のメールから会社を特定
    if (!companyId) {
      console.log("Company not found by email address, trying to find by sender email");
      const { companyId: senderCompanyId, userId } = await findCompanyByUserEmail(supabase, fromEmail);
      companyId = senderCompanyId;
      if (!assignedTo && userId) {
        assignedTo = userId;
      }
    }

    // 担当者が未設定の場合、会社の管理者を取得
    if (!assignedTo && companyId) {
      const admins = await getCompanyAdmins(supabase, companyId);
      if (admins.length > 0) {
        assignedTo = admins[0];
      }
    }

    console.log(`Found company: ${companyId}, email config: ${emailAddressConfig?.id}, assignedTo: ${assignedTo}`);

    let relatedType: string | null = null;
    let relatedId: string | null = null;
    let autoCreatedEntityType: string | null = null;
    let autoCreatedEntityId: string | null = null;

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
          notifyMode,
          assignedTo,
          fromEmail
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
        companyId: companyId,
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
