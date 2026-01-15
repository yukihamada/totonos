import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId } = await req.json();
    console.log("Verifying payment for session:", sessionId);

    // Stripe初期化
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // セッション取得
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log("Session status:", session.payment_status);

    if (session.payment_status === "paid") {
      const credits = parseInt(session.metadata?.credits || "0", 10);
      const packId = session.metadata?.pack_id || "";
      const userId = session.metadata?.user_id || "";

      console.log("Payment verified - credits:", credits, "user:", userId);

      // Supabaseクライアント（サービスロール）
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      // company_creditsテーブルを更新（存在する場合）
      // まず会社メンバーシップを取得
      const { data: membership } = await supabaseAdmin
        .from("company_members")
        .select("company_id")
        .eq("user_id", userId)
        .eq("is_active", true)
        .single();

      if (membership?.company_id) {
        // company_creditsテーブルのcharged_creditsを増加
        const { error: updateError } = await supabaseAdmin.rpc("add_charged_credits", {
          p_company_id: membership.company_id,
          p_credits: credits,
        });

        if (updateError) {
          console.log("Could not update company_credits via RPC, trying direct update");
          // RPCがない場合は直接更新
          await supabaseAdmin
            .from("company_credits")
            .update({ 
              charged_credits: supabaseAdmin.rpc("add_to_column", { 
                column_name: "charged_credits", 
                amount: credits 
              }) 
            })
            .eq("company_id", membership.company_id);
        }

        // トランザクションログ記録
        await supabaseAdmin.from("credit_transactions").insert({
          company_id: membership.company_id,
          user_id: userId,
          transaction_type: "charge",
          amount: credits,
          balance_after: 0, // 実際の残高は別途計算
          description: `${credits}クレジット購入（¥${session.amount_total?.toLocaleString()}）`,
          action: "credit_purchase",
          metadata: {
            session_id: sessionId,
            pack_id: packId,
            payment_amount: session.amount_total,
          },
        });
      }

      return new Response(
        JSON.stringify({
          success: true,
          paid: true,
          credits,
          packId,
          userId,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        paid: false,
        status: session.payment_status,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error verifying payment:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
