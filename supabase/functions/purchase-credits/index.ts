import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// クレジットパック設定（月額サブスクリプション）
const CREDIT_PACKS = {
  pack_100: {
    priceId: "price_1SptQ3DqLakc8NxkMsicIIoO",
    credits: 100,
    price: 50000, // ¥500.00
  },
  pack_500: {
    priceId: "price_1SptQ5DqLakc8NxkmfJR5Xwj",
    credits: 500,
    price: 200000, // ¥2,000.00
  },
  pack_1000: {
    priceId: "price_1SptQ7DqLakc8NxkgCnNBuD1",
    credits: 1000,
    price: 350000, // ¥3,500.00
  },
  pack_5000: {
    priceId: "price_1SptQ8DqLakc8NxkIdRWUeZJ",
    credits: 5000,
    price: 1500000, // ¥15,000.00
  },
} as const;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const { packId } = await req.json();
    console.log("Creating subscription checkout for pack:", packId);

    // パック検証
    const pack = CREDIT_PACKS[packId as keyof typeof CREDIT_PACKS];
    if (!pack) {
      throw new Error("Invalid pack ID");
    }

    // ユーザー認証
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user?.email) {
      throw new Error("User not authenticated or email not available");
    }
    
    const user = userData.user;
    console.log("User authenticated:", user.id, user.email);

    // Stripe初期化
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // 既存顧客チェック
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log("Existing customer found:", customerId);
    }

    // チェックアウトセッション作成（サブスクリプションモード）
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: pack.priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/credits?success=true&pack=${packId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/credits?canceled=true`,
      metadata: {
        user_id: user.id,
        pack_id: packId,
        credits: pack.credits.toString(),
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          pack_id: packId,
          credits: pack.credits.toString(),
        },
      },
    });

    console.log("Subscription checkout session created:", session.id);

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error creating checkout:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
