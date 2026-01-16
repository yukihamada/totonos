import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendInvitationRequest {
  invitationId: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Authenticate the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("認証が必要です");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("認証に失敗しました");
    }

    const { invitationId }: SendInvitationRequest = await req.json();

    if (!invitationId) {
      throw new Error("招待IDが必要です");
    }

    // Fetch the invitation with company info
    const { data: invitation, error: invitationError } = await supabase
      .from("company_invitations")
      .select(`
        *,
        companies (
          id,
          name,
          display_name
        )
      `)
      .eq("id", invitationId)
      .single();

    if (invitationError || !invitation) {
      console.error("Invitation error:", invitationError);
      throw new Error("招待が見つかりません");
    }

    // Verify the user is allowed to send this invitation
    const { data: membership, error: memberError } = await supabase
      .from("company_members")
      .select("role")
      .eq("company_id", invitation.company_id)
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (memberError || !membership || !["owner", "admin"].includes(membership.role)) {
      throw new Error("この招待を送信する権限がありません");
    }

    const companyName = invitation.companies?.display_name || invitation.companies?.name || "チーム";
    const appUrl = Deno.env.get("APP_URL") || "https://totonos.lovable.app";
    const acceptUrl = `${appUrl}/invite?token=${invitation.token}`;

    const roleLabels: Record<string, string> = {
      admin: "管理者",
      member: "メンバー",
      viewer: "閲覧者",
    };

    const roleLabel = roleLabels[invitation.role] || invitation.role;

    // Send email via Resend
    if (resendApiKey) {
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: "ミナト - Totonos <minato@totonos.jp>",
          to: [invitation.email],
          subject: `【招待】${companyName}への参加招待`,
          html: `
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff;">
              <div style="text-align: center; margin-bottom: 32px;">
                <h1 style="color: #1a1a1a; font-size: 24px; margin: 0;">Totonos</h1>
              </div>
              
              <h2 style="color: #1a1a1a; font-size: 20px; margin-bottom: 16px;">チームへの招待</h2>
              
              <p style="color: #4a4a4a; line-height: 1.6; margin-bottom: 16px;">
                <strong>${companyName}</strong>への参加招待が届いています。
              </p>
              
              <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                <p style="margin: 0 0 8px 0; color: #666;">
                  <strong>会社名:</strong> ${companyName}
                </p>
                <p style="margin: 0; color: #666;">
                  <strong>役割:</strong> ${roleLabel}
                </p>
              </div>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="${acceptUrl}" 
                   style="display: inline-block; background: #000; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 500;">
                  招待を受諾する
                </a>
              </div>
              
              <p style="color: #888; font-size: 12px; line-height: 1.5; margin-top: 32px;">
                この招待は7日間有効です。招待に心当たりがない場合は、このメールを無視してください。
              </p>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
              
              <p style="color: #888; font-size: 12px; text-align: center;">
                このメールはTotonosから自動送信されています。
              </p>
            </div>
          `,
        }),
      });

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        console.error("Resend API error:", errorText);
        throw new Error("メール送信に失敗しました");
      }

      console.log("Invitation email sent successfully to:", invitation.email);
    } else {
      console.log("RESEND_API_KEY not configured, skipping email send");
      console.log("Invitation URL for manual sending:", acceptUrl);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "招待メールを送信しました",
        acceptUrl: resendApiKey ? undefined : acceptUrl  // Return URL if no email was sent
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-invitation function:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
