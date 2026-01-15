import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Get user from authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "認証が必要です" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: { Authorization: authHeader },
      },
    });

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "ユーザー認証に失敗しました" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { linkCode, action } = await req.json();
    
    // Use service role for accessing unlinked LINE users
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    if (action === "link") {
      if (!linkCode || linkCode.length < 6) {
        return new Response(
          JSON.stringify({ error: "連携コードを入力してください（6文字以上）" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check if user already has a LINE connection
      const { data: existingConnection } = await supabaseAdmin
        .from("line_users")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingConnection) {
        return new Response(
          JSON.stringify({ error: "すでにLINEアカウントと連携されています" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Find unlinked LINE user by code prefix (case insensitive)
      const { data: lineUsers, error: searchError } = await supabaseAdmin
        .from("line_users")
        .select("*")
        .is("user_id", null)
        .ilike("line_user_id", `${linkCode}%`);

      if (searchError) {
        console.error("Search error:", searchError);
        return new Response(
          JSON.stringify({ error: "検索に失敗しました" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!lineUsers || lineUsers.length === 0) {
        return new Response(
          JSON.stringify({ 
            error: "連携コードが見つかりません。LINEで何かメッセージを送信してから、もう一度お試しください。"
          }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Link the first matching user
      const targetLineUser = lineUsers[0];
      
      const { error: updateError } = await supabaseAdmin
        .from("line_users")
        .update({
          user_id: user.id,
          linked_at: new Date().toISOString(),
        })
        .eq("id", targetLineUser.id);

      if (updateError) {
        console.error("Update error:", updateError);
        return new Response(
          JSON.stringify({ error: "連携に失敗しました" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Return the linked user
      const { data: linkedUser } = await supabaseAdmin
        .from("line_users")
        .select("*")
        .eq("id", targetLineUser.id)
        .single();

      console.log(`LINE account linked: ${targetLineUser.line_user_id} -> ${user.id}`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "LINE連携が完了しました！",
          lineUser: linkedUser
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } else if (action === "unlink") {
      // Find user's LINE connection
      const { data: lineUser, error: findError } = await supabaseAdmin
        .from("line_users")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (findError || !lineUser) {
        return new Response(
          JSON.stringify({ error: "LINE連携が見つかりません" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error: updateError } = await supabaseAdmin
        .from("line_users")
        .update({
          user_id: null,
          linked_at: null,
        })
        .eq("id", lineUser.id);

      if (updateError) {
        console.error("Unlink error:", updateError);
        return new Response(
          JSON.stringify({ error: "連携解除に失敗しました" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`LINE account unlinked: ${lineUser.line_user_id} from ${user.id}`);

      return new Response(
        JSON.stringify({ success: true, message: "LINE連携を解除しました" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } else if (action === "status") {
      // Get current LINE connection status
      const { data: lineUser } = await supabaseAdmin
        .from("line_users")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      return new Response(
        JSON.stringify({ lineUser }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "無効なアクションです" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "サーバーエラーが発生しました" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
