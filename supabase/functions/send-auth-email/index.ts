import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AuthEmailRequest {
  type: "magic_link" | "welcome" | "password_reset";
  email: string;
  token?: string;
  redirectUrl?: string;
}

const APP_NAME = "Totonos";
const APP_FEATURES = [
  {
    icon: "📄",
    title: "請求書・見積書管理",
    description: "請求書や見積書を簡単に作成・送付。PDFエクスポートやメール送信もワンクリック。"
  },
  {
    icon: "📝",
    title: "契約書管理",
    description: "電子署名対応の契約書を作成。OTPやブロックチェーン署名で安全に締結。"
  },
  {
    icon: "👥",
    title: "顧客・リード管理",
    description: "CRM機能で顧客情報を一元管理。商談パイプラインで営業活動を可視化。"
  },
  {
    icon: "👨‍💼",
    title: "従業員・勤怠管理",
    description: "従業員情報、勤怠、シフト、給与計算までHR業務をまとめて管理。"
  },
  {
    icon: "💰",
    title: "会計・経費管理",
    description: "仕訳入力から試算表まで。経費精算やレシートOCRも対応。"
  },
  {
    icon: "🤖",
    title: "AIアシスタント",
    description: "チャットで質問するだけ。請求書作成や顧客検索などAIがサポート。"
  },
  {
    icon: "📱",
    title: "LINE連携",
    description: "LINEからも操作可能。外出先でもスマホでかんたん業務処理。"
  },
  {
    icon: "📊",
    title: "プロジェクト管理",
    description: "タスク管理、ガントチャート、工数管理でプロジェクトを効率的に進行。"
  }
];

const generateMagicLinkEmail = (token: string, redirectUrl: string) => {
  const loginUrl = `${redirectUrl}?token=${token}`;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
        .logo { font-size: 28px; font-weight: bold; letter-spacing: 1px; }
        .content { padding: 40px 30px; background: white; }
        .button { display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 20px 0; }
        .button:hover { opacity: 0.9; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; background: #f9f9f9; border-radius: 0 0 12px 12px; }
        .note { background: #f0f4ff; padding: 15px; border-radius: 8px; font-size: 14px; color: #4c5563; margin-top: 20px; }
        h2 { color: #1a1a1a; margin-bottom: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">${APP_NAME}</div>
          <p style="margin: 10px 0 0 0; opacity: 0.8;">ビジネスをもっとスマートに</p>
        </div>
        <div class="content">
          <h2>ログインリンク</h2>
          <p>以下のボタンをクリックして${APP_NAME}にログインしてください。</p>
          
          <div style="text-align: center;">
            <a href="${loginUrl}" class="button">ログインする</a>
          </div>
          
          <div class="note">
            <strong>⚠️ セキュリティに関するお知らせ</strong><br>
            このリンクは30分間有効です。リンクを共有したり、心当たりのないログインリクエストの場合は無視してください。
          </div>
          
          <p style="font-size: 12px; color: #888; margin-top: 20px;">
            ボタンが機能しない場合は、以下のURLをブラウザにコピー＆ペーストしてください：<br>
            <a href="${loginUrl}" style="color: #6366f1; word-break: break-all;">${loginUrl}</a>
          </p>
        </div>
        <div class="footer">
          <p>このメールは${APP_NAME}から自動送信されています。</p>
          <p>© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const generateWelcomeEmail = (email: string) => {
  const featuresHtml = APP_FEATURES.map(feature => `
    <div style="display: flex; align-items: flex-start; margin-bottom: 15px; padding: 15px; background: #f9fafb; border-radius: 8px;">
      <div style="font-size: 24px; margin-right: 15px;">${feature.icon}</div>
      <div>
        <div style="font-weight: bold; color: #1a1a1a; margin-bottom: 4px;">${feature.title}</div>
        <div style="font-size: 14px; color: #6b7280;">${feature.description}</div>
      </div>
    </div>
  `).join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0; }
        .logo { font-size: 32px; font-weight: bold; letter-spacing: 1px; }
        .content { padding: 40px 30px; background: white; }
        .button { display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 16px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; background: #f9f9f9; border-radius: 0 0 12px 12px; }
        h1 { color: #1a1a1a; margin-bottom: 10px; }
        h2 { color: #1a1a1a; margin-top: 30px; margin-bottom: 20px; font-size: 20px; }
        .welcome-badge { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 8px 20px; border-radius: 20px; font-size: 14px; display: inline-block; margin-bottom: 20px; }
        .cta-section { text-align: center; margin: 30px 0; padding: 30px; background: linear-gradient(135deg, #f0f4ff 0%, #faf5ff 100%); border-radius: 12px; }
        .quick-links { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin-top: 20px; }
        .quick-link { background: white; border: 1px solid #e5e7eb; padding: 10px 20px; border-radius: 6px; color: #374151; text-decoration: none; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">${APP_NAME}</div>
          <p style="margin: 15px 0 0 0; opacity: 0.9; font-size: 18px;">ビジネスをもっとスマートに</p>
        </div>
        <div class="content">
          <div style="text-align: center;">
            <span class="welcome-badge">🎉 ようこそ！</span>
            <h1>ご登録ありがとうございます</h1>
            <p style="color: #6b7280; font-size: 16px;">
              ${APP_NAME}へのご登録、誠にありがとうございます。<br>
              これからあなたのビジネスをサポートできることを楽しみにしています。
            </p>
          </div>
          
          <h2>📌 ${APP_NAME}でできること</h2>
          ${featuresHtml}
          
          <div class="cta-section">
            <h3 style="margin-top: 0;">さっそく始めましょう！</h3>
            <p style="color: #6b7280;">まずはダッシュボードから各機能をお試しください。</p>
            <a href="${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '.lovable.app') || '#'}" class="button">ダッシュボードを開く</a>
          </div>
          
          <div style="margin-top: 30px; padding: 20px; background: #fef3c7; border-radius: 8px;">
            <strong>💡 ヒント：AIアシスタントを活用しよう</strong>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #92400e;">
              右下のチャットボタンからAIアシスタントに話しかけてみてください。
              「請求書を作成して」「今月の売上は？」など、自然な言葉で指示できます。
            </p>
          </div>
          
          <div style="margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px;">
            <p>ご不明な点がありましたら、いつでもお気軽にお問い合わせください。</p>
          </div>
        </div>
        <div class="footer">
          <p>このメールは${APP_NAME}から自動送信されています。</p>
          <p>© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const generatePasswordResetEmail = (token: string, redirectUrl: string) => {
  const resetUrl = `${redirectUrl}?token=${token}&type=recovery`;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
        .logo { font-size: 28px; font-weight: bold; letter-spacing: 1px; }
        .content { padding: 40px 30px; background: white; }
        .button { display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; background: #f9f9f9; border-radius: 0 0 12px 12px; }
        .note { background: #fef2f2; padding: 15px; border-radius: 8px; font-size: 14px; color: #991b1b; margin-top: 20px; }
        h2 { color: #1a1a1a; margin-bottom: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">${APP_NAME}</div>
        </div>
        <div class="content">
          <h2>🔐 パスワードリセット</h2>
          <p>パスワードリセットのリクエストを受け付けました。<br>以下のボタンをクリックして新しいパスワードを設定してください。</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">パスワードをリセット</a>
          </div>
          
          <div class="note">
            <strong>⚠️ 重要</strong><br>
            このリンクは1時間有効です。心当たりのないリクエストの場合は、このメールを無視してください。パスワードは変更されません。
          </div>
        </div>
        <div class="footer">
          <p>このメールは${APP_NAME}から自動送信されています。</p>
          <p>© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
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
    const { type, email, token, redirectUrl }: AuthEmailRequest = await req.json();

    console.log(`Sending ${type} email to ${email}`);

    let subject: string;
    let html: string;

    switch (type) {
      case "magic_link":
        if (!token || !redirectUrl) {
          throw new Error("Token and redirectUrl are required for magic link");
        }
        subject = `【${APP_NAME}】ログインリンク`;
        html = generateMagicLinkEmail(token, redirectUrl);
        break;
      case "welcome":
        subject = `【${APP_NAME}】ご登録ありがとうございます 🎉`;
        html = generateWelcomeEmail(email);
        break;
      case "password_reset":
        if (!token || !redirectUrl) {
          throw new Error("Token and redirectUrl are required for password reset");
        }
        subject = `【${APP_NAME}】パスワードリセット`;
        html = generatePasswordResetEmail(token, redirectUrl);
        break;
      default:
        throw new Error("Invalid email type");
    }

    // Send email via Resend
    // Note: In production, you should use a verified domain
    const emailResponse = await resend.emails.send({
      from: `${APP_NAME} <onboarding@resend.dev>`,
      to: [email],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, data: emailResponse }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-auth-email function:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
