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
  subject: string | null,
  spreadsheetData?: { filename: string; formattedContent: string; rowCount: number }[]
): Promise<void> {
  try {
    const { error } = await supabase.functions.invoke("analyze-email", {
      body: { emailId, textContent, subject, spreadsheetData },
    });
    
    if (error) {
      console.error("AI analysis failed:", error);
    }
  } catch (err) {
    console.error("Failed to trigger AI analysis:", err);
  }
}

// メール返信を送信
async function sendReplyEmail(
  toEmail: string,
  toName: string | null,
  originalSubject: string | null,
  replyBody: string,
  isQuestion: boolean = false
): Promise<boolean> {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY not configured");
    return false;
  }

  try {
    const subject = isQuestion
      ? `【確認のお願い】Re: ${originalSubject || "(件名なし)"}`
      : `【処理完了】Re: ${originalSubject || "(件名なし)"}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.8; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${isQuestion ? "#f59e0b" : "#16a34a"}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .logo { font-size: 24px; font-weight: bold; }
          .status { font-size: 14px; margin-top: 8px; }
          .content { padding: 30px 20px; background: #f9f9f9; border-radius: 0 0 8px 8px; }
          .message-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${isQuestion ? "#f59e0b" : "#16a34a"}; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .note { background: #e8f4fd; padding: 15px; border-radius: 8px; margin-top: 20px; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Totonos</div>
            <div class="status">${isQuestion ? "⚠️ 確認が必要です" : "✓ 処理が完了しました"}</div>
          </div>
          <div class="content">
            <p>${toName || "お客様"} 様</p>
            <p>${isQuestion ? "ご依頼いただいた内容について確認がございます。" : "ご依頼いただいた処理が完了しました。"}</p>
            
            <div class="message-box">
              ${replyBody.split('\n').map(line => `<p style="margin: 8px 0;">${line}</p>`).join('')}
            </div>
            
            ${isQuestion ? `
              <div class="note">
                💡 上記の内容をご確認いただき、ご希望の操作を記載してメールにご返信ください。
              </div>
            ` : `
              <div class="note">
                ℹ️ 処理結果の詳細はTotonosの受信メール画面からご確認いただけます。
              </div>
            `}
          </div>
          <div class="footer">
            <p>このメールはTotonosから自動送信されています。</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Totonos <onboarding@resend.dev>",
        to: [toEmail],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to send reply email:", errorText);
      return false;
    }

    console.log(`Reply email sent to ${toEmail}`);
    return true;
  } catch (err) {
    console.error("Error sending reply email:", err);
    return false;
  }
}

// AIコマンド処理をトリガー（自動実行）
async function triggerAICommandProcessing(
  supabase: any,
  emailId: string,
  companyId: string,
  subject: string | null,
  textContent: string,
  assignedTo: string | null,
  fromEmail: string,
  fromName: string | null,
  spreadsheetData?: { filename: string; formattedContent: string; rowCount: number }[]
): Promise<void> {
  try {
    console.log(`Triggering AI command processing for email ${emailId}`);
    
    const { data, error } = await supabase.functions.invoke("process-email-command", {
      body: { 
        emailId, 
        companyId,
        spreadsheetData 
      },
    });
    
    if (error) {
      console.error("AI command processing failed:", error);
      
      // 失敗時も通知を送信
      if (assignedTo) {
        await supabase.from("notifications").insert({
          user_id: assignedTo,
          company_id: companyId,
          type: "error",
          title: "📧 メールコマンド処理エラー",
          message: `件名: ${subject || "(なし)"}\n処理中にエラーが発生しました。`,
          category: "email",
          link: "/inbound-emails",
          metadata: {
            email_id: emailId,
            error: error.message || "Unknown error",
          },
        });
      }
      
      // エラー時もメールで通知
      await sendReplyEmail(
        fromEmail,
        fromName,
        subject,
        `申し訳ございません。ご依頼の処理中にエラーが発生しました。\n\nエラー内容: ${error.message || "不明なエラー"}\n\n再度お試しいただくか、別の方法でお問い合わせください。`,
        false
      );
      
      return;
    }
    
    console.log(`AI command processing completed for ${emailId}:`, data);
    
    // 処理成功時、担当者に通知を送信
    if (assignedTo && data?.response) {
      await supabase.from("notifications").insert({
        user_id: assignedTo,
        company_id: companyId,
        type: "success",
        title: "📧 メールコマンドを処理しました",
        message: `件名: ${subject || "(なし)"}\n\n結果: ${(data.response as string).substring(0, 200)}${(data.response as string).length > 200 ? "..." : ""}`,
        category: "email",
        link: "/inbound-emails",
        metadata: {
          email_id: emailId,
          response: data.response,
          credits_used: data.creditsUsed,
        },
      });
    }
    
    // 処理結果をメールで送信
    if (data?.response) {
      const isQuestion = data.needsConfirmation === true || 
                         (data.response as string).includes("確認") ||
                         (data.response as string).includes("選択してください") ||
                         (data.response as string).includes("どちら");
      
      await sendReplyEmail(
        fromEmail,
        fromName,
        subject,
        data.response as string,
        isQuestion
      );
    }
  } catch (err) {
    console.error("Failed to trigger AI command processing:", err);
    
    // 例外時もメールで通知
    await sendReplyEmail(
      fromEmail,
      fromName,
      subject,
      "申し訳ございません。処理中に予期せぬエラーが発生しました。後ほど再度お試しください。",
      false
    );
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

// CSV文字列をパースする関数
function parseCSV(csvContent: string): { headers: string[]; rows: string[][]; error?: string } {
  try {
    const lines = csvContent.split(/\r?\n/).filter(line => line.trim());
    if (lines.length === 0) {
      return { headers: [], rows: [], error: "Empty CSV" };
    }

    const headers = lines[0].split(",").map(h => h.trim().replace(/^["']|["']$/g, ""));
    const rows: string[][] = [];

    for (let i = 1; i < lines.length; i++) {
      const values: string[] = [];
      let current = "";
      let inQuotes = false;

      for (const char of lines[i]) {
        if (char === '"' && !inQuotes) {
          inQuotes = true;
        } else if (char === '"' && inQuotes) {
          inQuotes = false;
        } else if (char === "," && !inQuotes) {
          values.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      rows.push(values);
    }

    return { headers, rows };
  } catch (err) {
    return { headers: [], rows: [], error: String(err) };
  }
}

// Base64デコードしてテキストに変換（Shift-JIS対応）
function decodeBase64ToText(base64: string): string {
  try {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Try UTF-8 first
    try {
      const utf8Decoder = new TextDecoder("utf-8", { fatal: true });
      return utf8Decoder.decode(bytes);
    } catch {
      // Fallback to Shift-JIS for Japanese CSVs
      try {
        const sjisDecoder = new TextDecoder("shift-jis", { fatal: false });
        return sjisDecoder.decode(bytes);
      } catch {
        // Last resort: Latin-1
        const latinDecoder = new TextDecoder("iso-8859-1");
        return latinDecoder.decode(bytes);
      }
    }
  } catch (err) {
    console.error("Failed to decode base64:", err);
    return "";
  }
}

// スプレッドシートデータをAI分析用にフォーマット
function formatSpreadsheetForAI(
  headers: string[],
  rows: string[][],
  maxRows: number = 50
): string {
  const displayRows = rows.slice(0, maxRows);
  const headerLine = headers.join(" | ");
  const separator = headers.map(() => "---").join(" | ");
  const dataLines = displayRows.map(row => row.join(" | "));

  let result = `| ${headerLine} |\n| ${separator} |\n`;
  for (const line of dataLines) {
    result += `| ${line} |\n`;
  }

  if (rows.length > maxRows) {
    result += `\n... 他 ${rows.length - maxRows} 行`;
  }

  return result;
}

// スプレッドシート添付ファイルを処理
interface SpreadsheetData {
  filename: string;
  headers: string[];
  rows: string[][];
  rowCount: number;
  formattedContent: string;
}

async function processSpreadsheetAttachment(
  attachment: { filename: string; type: string; content?: string }
): Promise<SpreadsheetData | null> {
  if (!attachment.content) {
    console.log("No content in attachment, skipping");
    return null;
  }

  console.log(`Processing spreadsheet attachment: ${attachment.filename}`);

  try {
    const mimeType = attachment.type?.toLowerCase() || "";
    const filename = attachment.filename?.toLowerCase() || "";

    // CSVの場合
    if (mimeType === "text/csv" || filename.endsWith(".csv")) {
      const textContent = decodeBase64ToText(attachment.content);
      const { headers, rows, error } = parseCSV(textContent);

      if (error) {
        console.error("CSV parse error:", error);
        return null;
      }

      return {
        filename: attachment.filename,
        headers,
        rows,
        rowCount: rows.length,
        formattedContent: formatSpreadsheetForAI(headers, rows),
      };
    }

    // Excelの場合（基本的なXLSX解析）
    if (
      mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      mimeType === "application/vnd.ms-excel" ||
      filename.endsWith(".xlsx") ||
      filename.endsWith(".xls")
    ) {
      // Excel files require a library for full parsing
      // For now, return metadata only
      console.log(`Excel file detected: ${attachment.filename}, size: ${attachment.content.length}`);
      return {
        filename: attachment.filename,
        headers: [],
        rows: [],
        rowCount: 0,
        formattedContent: `[Excelファイル: ${attachment.filename}]\n※Excelファイルは詳細解析が必要です。CSV形式での送信をお勧めします。`,
      };
    }

    return null;
  } catch (err) {
    console.error("Failed to process spreadsheet:", err);
    return null;
  }
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

    // メール送信者の認証チェック
    let isVerifiedSender = false;
    let requiresVerification = false;

    if (companyId) {
      // 会社の登録済みメールアドレスリストを取得
      const { data: company } = await supabase
        .from("companies")
        .select("verified_email_addresses")
        .eq("id", companyId)
        .single();

      const verifiedEmails = company?.verified_email_addresses || [];
      
      // 登録ユーザーのメールアドレスも検証済みとして扱う
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      const userEmails = (authUsers?.users || [])
        .filter((u: any) => u.email)
        .map((u: any) => u.email!.toLowerCase());

      // 会社メンバーのメールアドレスを取得
      const { data: members } = await supabase
        .from("company_members")
        .select("user_id")
        .eq("company_id", companyId)
        .eq("is_active", true);

      const memberUserIds = (members || []).map((m: { user_id: string }) => m.user_id);
      const memberEmails = (authUsers?.users || [])
        .filter((u: any) => memberUserIds.includes(u.id) && u.email)
        .map((u: any) => u.email!.toLowerCase());

      const allVerifiedEmails = [...verifiedEmails.map((e: string) => e.toLowerCase()), ...memberEmails];
      const senderLower = fromEmail.toLowerCase();

      isVerifiedSender = allVerifiedEmails.includes(senderLower);
      
      console.log(`Sender ${fromEmail} verified: ${isVerifiedSender}`);

      if (!isVerifiedSender) {
        // 未承認の送信者の場合、承認リクエストが既にあるかチェック
        const { data: existingRequest } = await supabase
          .from("email_verification_requests")
          .select("id, status")
          .eq("company_id", companyId)
          .eq("from_email", fromEmail)
          .order("created_at", { ascending: false })
          .limit(1);

        if (!existingRequest || existingRequest.length === 0 || existingRequest[0].status === 'rejected') {
          requiresVerification = true;
          console.log(`Creating verification request for ${fromEmail}`);
        } else if (existingRequest[0].status === 'pending') {
          requiresVerification = true;
          console.log(`Pending verification request exists for ${fromEmail}`);
        } else if (existingRequest[0].status === 'approved') {
          isVerifiedSender = true;
          console.log(`Already approved: ${fromEmail}`);
        }
      }
    }

    let relatedType: string | null = null;
    let relatedId: string | null = null;
    let autoCreatedEntityType: string | null = null;
    let autoCreatedEntityId: string | null = null;

    // 認証済み送信者のみ自動処理を実行
    if (companyId && isVerifiedSender) {
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

    // メールのステータスを決定
    const emailStatus = requiresVerification ? "pending_verification" : "received";

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
        status: emailStatus,
        related_type: relatedType,
        related_id: relatedId,
        assigned_to: assignedTo,
        tags: requiresVerification ? ["要承認"] : [],
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

    console.log(`Email saved: ${savedEmail.id} from ${fromEmail} to ${toEmail}, status: ${emailStatus}`);

    // 未認証の送信者の場合、承認リクエストを作成
    if (requiresVerification && companyId) {
      const { data: existingPending } = await supabase
        .from("email_verification_requests")
        .select("id")
        .eq("company_id", companyId)
        .eq("from_email", fromEmail)
        .eq("status", "pending")
        .limit(1);

      if (!existingPending || existingPending.length === 0) {
        const { error: verifyError } = await supabase
          .from("email_verification_requests")
          .insert({
            company_id: companyId,
            inbound_email_id: savedEmail.id,
            from_email: fromEmail,
            from_name: fromName || null,
            status: "pending",
          });

        if (verifyError) {
          console.error("Failed to create verification request:", verifyError);
        } else {
          console.log(`Created verification request for ${fromEmail}`);
        }
      }

      // 管理者に通知を送信
      const admins = await getCompanyAdmins(supabase, companyId);
      for (const adminId of admins) {
        await supabase.from("notifications").insert({
          user_id: adminId,
          company_id: companyId,
          type: "warning",
          title: "📧 未登録アドレスからのメール",
          message: `${fromName || fromEmail} からのメールが届きました。処理するには送信者の承認が必要です。`,
          category: "email",
          link: "/inbound-emails",
          metadata: {
            email_id: savedEmail.id,
            from_email: fromEmail,
            subject: emailData.subject,
          },
        });
      }
    }

    // 認証済み送信者のみ添付ファイル処理を実行
    if (isVerifiedSender) {
      // 画像添付ファイルをOCR処理（非同期）
      const imageAttachments = (emailData.attachments || []).filter(
        att => att.type?.startsWith("image/") || 
               /\.(jpg|jpeg|png|gif|webp|heic|heif)$/i.test(att.filename)
      );

      if (imageAttachments.length > 0) {
        console.log(`Found ${imageAttachments.length} image attachments, processing as receipts`);
        
        // 並列でOCR処理（エラーをキャッチしてログ出力）
        for (const att of imageAttachments) {
          processReceiptAttachment(
            supabase, 
            att, 
            companyId, 
            savedEmail.id,
            notifyMode,
            assignedTo,
            fromEmail
          ).catch(err => {
            console.error(`Failed to process receipt attachment ${att.filename}:`, err);
          });
        }
      }
    } else {
      console.log("Skipping attachment processing for unverified sender");
    }

    // スプレッドシート添付ファイルを処理
    const spreadsheetAttachments = (emailData.attachments || []).filter(
      att => att.type === "text/csv" ||
             att.type === "application/vnd.ms-excel" ||
             att.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
             /\.(csv|xlsx?|xls)$/i.test(att.filename)
    );

    const spreadsheetDataList: { filename: string; formattedContent: string; rowCount: number }[] = [];
    
    if (spreadsheetAttachments.length > 0) {
      console.log(`Found ${spreadsheetAttachments.length} spreadsheet attachments`);
      
      for (const att of spreadsheetAttachments) {
        const data = await processSpreadsheetAttachment(att);
        if (data) {
          spreadsheetDataList.push({
            filename: data.filename,
            formattedContent: data.formattedContent,
            rowCount: data.rowCount,
          });
        }
      }
    }

    // AI処理（認証済み送信者のみ）
    if (isVerifiedSender && emailAddressConfig?.ai_processing_enabled !== false) {
      // AI分析をトリガー（非同期、エラーをキャッチ）
      triggerAIAnalysis(
        supabase,
        savedEmail.id,
        emailData.text || emailData.html || "",
        emailData.subject || null,
        spreadsheetDataList.length > 0 ? spreadsheetDataList : undefined
      ).catch(err => {
        console.error(`Failed to trigger AI analysis for email ${savedEmail.id}:`, err);
      });
      
      // AIコマンド処理を自動実行（件名や本文にコマンドがある場合）
      const commandText = emailData.subject || emailData.text || emailData.html || "";
      if (commandText && companyId) {
        // コマンド処理を非同期で実行（エラーをキャッチ）
        triggerAICommandProcessing(
          supabase,
          savedEmail.id,
          companyId,
          emailData.subject || null,
          emailData.text || emailData.html || "",
          assignedTo,
          fromEmail,
          fromName || null,
          spreadsheetDataList.length > 0 ? spreadsheetDataList : undefined
        ).catch(err => {
          console.error(`Failed to trigger AI command processing for email ${savedEmail.id}:`, err);
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        id: savedEmail.id,
        companyId: companyId,
        requiresVerification: requiresVerification,
        autoCreated: autoCreatedEntityType ? { type: autoCreatedEntityType, id: autoCreatedEntityId } : null,
        spreadsheetProcessing: spreadsheetDataList.length > 0 ? { count: spreadsheetDataList.length } : null
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
