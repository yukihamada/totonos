import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendEmailRequest {
  type: "invoice" | "reminder" | "payment_confirmation";
  invoiceId: string;
  recipientEmail: string;
  recipientName?: string;
  customMessage?: string;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
  }).format(amount);
};

const generateInvoiceEmailHtml = (invoice: any, customMessage?: string) => {
  const dueDate = new Date(invoice.due_date).toLocaleDateString("ja-JP");
  const issueDate = new Date(invoice.issue_date).toLocaleDateString("ja-JP");
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1a1a1a; color: white; padding: 20px; text-align: center; }
        .logo { font-size: 24px; font-weight: bold; }
        .content { padding: 30px 20px; background: #f9f9f9; }
        .invoice-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .detail-row:last-child { border-bottom: none; }
        .label { color: #666; }
        .value { font-weight: bold; }
        .total { font-size: 24px; color: #1a1a1a; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .message { background: #e8f4fd; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Totonos</div>
        </div>
        <div class="content">
          <h2>請求書のご送付</h2>
          ${customMessage ? `<div class="message">${customMessage}</div>` : ""}
          <p>${invoice.client?.name || "お客様"} 様</p>
          <p>いつもお世話になっております。<br>下記の通り請求書をお送りいたします。</p>
          
          <div class="invoice-details">
            <div class="detail-row">
              <span class="label">請求書番号</span>
              <span class="value">${invoice.invoice_number}</span>
            </div>
            <div class="detail-row">
              <span class="label">件名</span>
              <span class="value">${invoice.title}</span>
            </div>
            <div class="detail-row">
              <span class="label">発行日</span>
              <span class="value">${issueDate}</span>
            </div>
            <div class="detail-row">
              <span class="label">お支払期限</span>
              <span class="value">${dueDate}</span>
            </div>
            <div class="detail-row">
              <span class="label">小計</span>
              <span class="value">${formatCurrency(invoice.amount)}</span>
            </div>
            <div class="detail-row">
              <span class="label">消費税</span>
              <span class="value">${formatCurrency(invoice.tax_amount || 0)}</span>
            </div>
            <div class="detail-row">
              <span class="label">合計金額</span>
              <span class="value total">${formatCurrency(invoice.total_amount)}</span>
            </div>
          </div>
          
          <p>ご不明な点がございましたら、お気軽にお問い合わせください。</p>
        </div>
        <div class="footer">
          <p>このメールはTotonosから自動送信されています。</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const generateReminderEmailHtml = (invoice: any) => {
  const dueDate = new Date(invoice.due_date).toLocaleDateString("ja-JP");
  const isOverdue = new Date(invoice.due_date) < new Date();
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${isOverdue ? "#dc2626" : "#f59e0b"}; color: white; padding: 20px; text-align: center; }
        .logo { font-size: 24px; font-weight: bold; }
        .content { padding: 30px 20px; background: #f9f9f9; }
        .invoice-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .total { font-size: 24px; color: #1a1a1a; font-weight: bold; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .alert { background: ${isOverdue ? "#fef2f2" : "#fffbeb"}; border: 1px solid ${isOverdue ? "#fecaca" : "#fde68a"}; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Totonos</div>
        </div>
        <div class="content">
          <h2>${isOverdue ? "【重要】お支払い期限超過のお知らせ" : "お支払い期限のお知らせ"}</h2>
          <div class="alert">
            ${isOverdue 
              ? `お支払い期限（${dueDate}）を過ぎております。お早めのお支払いをお願いいたします。`
              : `お支払い期限（${dueDate}）が近づいております。`
            }
          </div>
          <p>${invoice.client?.name || "お客様"} 様</p>
          
          <div class="invoice-details">
            <div class="detail-row">
              <span>請求書番号</span>
              <span>${invoice.invoice_number}</span>
            </div>
            <div class="detail-row">
              <span>件名</span>
              <span>${invoice.title}</span>
            </div>
            <div class="detail-row">
              <span>お支払期限</span>
              <span>${dueDate}</span>
            </div>
            <div class="detail-row">
              <span>合計金額</span>
              <span class="total">${formatCurrency(invoice.total_amount)}</span>
            </div>
          </div>
          
          <p>既にお支払い済みの場合は、本メールをご容赦ください。</p>
        </div>
        <div class="footer">
          <p>このメールはTotonosから自動送信されています。</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const generatePaymentConfirmationHtml = (invoice: any) => {
  const paidDate = invoice.paid_date 
    ? new Date(invoice.paid_date).toLocaleDateString("ja-JP")
    : new Date().toLocaleDateString("ja-JP");
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #16a34a; color: white; padding: 20px; text-align: center; }
        .logo { font-size: 24px; font-weight: bold; }
        .content { padding: 30px 20px; background: #f9f9f9; }
        .success { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
        .success-icon { font-size: 48px; }
        .invoice-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Totonos</div>
        </div>
        <div class="content">
          <div class="success">
            <div class="success-icon">✓</div>
            <h2>ご入金を確認いたしました</h2>
          </div>
          <p>${invoice.client?.name || "お客様"} 様</p>
          <p>この度はお支払いいただき、誠にありがとうございます。<br>下記の請求書へのご入金を確認いたしました。</p>
          
          <div class="invoice-details">
            <div class="detail-row">
              <span>請求書番号</span>
              <span>${invoice.invoice_number}</span>
            </div>
            <div class="detail-row">
              <span>件名</span>
              <span>${invoice.title}</span>
            </div>
            <div class="detail-row">
              <span>入金確認日</span>
              <span>${paidDate}</span>
            </div>
            <div class="detail-row">
              <span>お支払い金額</span>
              <span>${formatCurrency(invoice.total_amount)}</span>
            </div>
          </div>
          
          <p>今後ともよろしくお願いいたします。</p>
        </div>
        <div class="footer">
          <p>このメールはTotonosから自動送信されています。</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

serve(async (req) => {
  // Handle CORS preflight requests
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
      throw new Error("認証が必要です");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("認証に失敗しました");
    }

    const { type, invoiceId, recipientEmail, recipientName, customMessage }: SendEmailRequest = await req.json();

    console.log(`Sending ${type} email for invoice ${invoiceId} to ${recipientEmail}`);

    // Fetch invoice with client info
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select(`
        *,
        client:clients(id, name, email)
      `)
      .eq("id", invoiceId)
      .single();

    if (invoiceError || !invoice) {
      throw new Error("請求書が見つかりません");
    }

    // Generate email content based on type
    let subject: string;
    let html: string;

    switch (type) {
      case "invoice":
        subject = `【請求書】${invoice.title} - ${invoice.invoice_number}`;
        html = generateInvoiceEmailHtml(invoice, customMessage);
        break;
      case "reminder":
        const isOverdue = new Date(invoice.due_date) < new Date();
        subject = isOverdue
          ? `【重要】お支払い期限超過のお知らせ - ${invoice.invoice_number}`
          : `【お知らせ】お支払い期限について - ${invoice.invoice_number}`;
        html = generateReminderEmailHtml(invoice);
        break;
      case "payment_confirmation":
        subject = `【入金確認】${invoice.title} - ${invoice.invoice_number}`;
        html = generatePaymentConfirmationHtml(invoice);
        break;
      default:
        throw new Error("不正なメールタイプです");
    }

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: "Totonos <onboarding@resend.dev>",
      to: [recipientEmail],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    // Log the email
    const { error: logError } = await supabase
      .from("email_logs")
      .insert({
        user_id: user.id,
        invoice_id: invoiceId,
        recipient_email: recipientEmail,
        recipient_name: recipientName || invoice.client?.name,
        subject,
        email_type: type,
        status: "sent",
      });

    if (logError) {
      console.error("Failed to log email:", logError);
    }

    return new Response(
      JSON.stringify({ success: true, data: emailResponse }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-email function:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
