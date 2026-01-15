import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";

serve(async (req) => {
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
    apiVersion: "2025-08-27.basil",
  });

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const signature = req.headers.get("stripe-signature")!;
  const body = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", errorMessage);
    return new Response(JSON.stringify({ error: "Invalid signature" }), {
      status: 400,
    });
  }

  console.log("Processing event:", event.type);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("Checkout session completed:", session.id);
        console.log("Session metadata:", JSON.stringify(session.metadata));

        // クレジット購入の処理
        if (session.metadata?.pack_id && session.metadata?.credits) {
          const credits = parseInt(session.metadata.credits, 10);
          const userId = session.metadata.user_id;
          const packId = session.metadata.pack_id;

          console.log(`Processing credit purchase: ${credits} credits for user ${userId}`);

          // ユーザーの会社を取得
          const { data: membership } = await supabaseClient
            .from("company_members")
            .select("company_id")
            .eq("user_id", userId)
            .eq("is_active", true)
            .single();

          if (membership?.company_id) {
            // company_creditsテーブルのcharged_creditsを増加
            const { data: currentCredits } = await supabaseClient
              .from("company_credits")
              .select("charged_credits")
              .eq("company_id", membership.company_id)
              .single();

            if (currentCredits) {
              const newChargedCredits = (currentCredits.charged_credits || 0) + credits;
              
              const { error: updateError } = await supabaseClient
                .from("company_credits")
                .update({ 
                  charged_credits: newChargedCredits,
                  updated_at: new Date().toISOString()
                })
                .eq("company_id", membership.company_id);

              if (updateError) {
                console.error("Error updating company_credits:", updateError);
              } else {
                console.log(`Updated company_credits: +${credits} credits, new total: ${newChargedCredits}`);
              }

              // 残高計算（月額 + 購入クレジット - 使用済み）
              const { data: creditData } = await supabaseClient
                .from("company_credits")
                .select("monthly_credits, charged_credits, used_this_month")
                .eq("company_id", membership.company_id)
                .single();

              const balanceAfter = creditData 
                ? (creditData.monthly_credits || 0) + (creditData.charged_credits || 0) - (creditData.used_this_month || 0)
                : credits;

              // トランザクションログ記録
              await supabaseClient.from("credit_transactions").insert({
                company_id: membership.company_id,
                user_id: userId,
                transaction_type: "charge",
                amount: credits,
                balance_after: balanceAfter,
                description: `${credits}クレジット購入（¥${session.amount_total?.toLocaleString()}）`,
                action: "credit_purchase",
                metadata: {
                  session_id: session.id,
                  pack_id: packId,
                  payment_amount: session.amount_total,
                },
              });

              console.log(`Credit transaction logged for company ${membership.company_id}`);
            }
          } else {
            console.log("No active company membership found for user:", userId);
          }
        }

        // サブスクリプションの処理（既存のロジック）
        const organizationId = session.metadata?.organization_id;
        const subscriptionId = session.subscription as string;

        if (organizationId && subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const priceId = subscription.items.data[0]?.price.id;

          let plan = "free";
          const proPriceId = Deno.env.get("STRIPE_PRO_PRICE_ID");
          const enterprisePriceId = Deno.env.get("STRIPE_ENTERPRISE_PRICE_ID");

          if (priceId === proPriceId) {
            plan = "pro";
          } else if (priceId === enterprisePriceId) {
            plan = "enterprise";
          }

          await supabaseClient
            .from("organizations")
            .update({
              stripe_subscription_id: subscriptionId,
              plan: plan,
            })
            .eq("id", organizationId);

          console.log(`Organization ${organizationId} upgraded to ${plan}`);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { data: org } = await supabaseClient
          .from("organizations")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (org) {
          const priceId = subscription.items.data[0]?.price.id;
          let plan = "free";
          const proPriceId = Deno.env.get("STRIPE_PRO_PRICE_ID");
          const enterprisePriceId = Deno.env.get("STRIPE_ENTERPRISE_PRICE_ID");

          if (priceId === proPriceId) {
            plan = "pro";
          } else if (priceId === enterprisePriceId) {
            plan = "enterprise";
          }

          await supabaseClient
            .from("organizations")
            .update({ plan: plan })
            .eq("id", org.id);

          console.log(`Organization ${org.id} plan updated to ${plan}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { data: org } = await supabaseClient
          .from("organizations")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (org) {
          await supabaseClient
            .from("organizations")
            .update({
              plan: "free",
              stripe_subscription_id: null,
            })
            .eq("id", org.id);

          console.log(`Organization ${org.id} downgraded to free`);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const { data: org } = await supabaseClient
          .from("organizations")
          .select("id, name")
          .eq("stripe_customer_id", customerId)
          .single();

        if (org) {
          console.log(`Payment failed for organization ${org.name} (${org.id})`);
        }
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
    });
  }
});
