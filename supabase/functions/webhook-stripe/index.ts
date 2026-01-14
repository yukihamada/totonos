import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@13.6.0?target=deno";

serve(async (req) => {
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
    apiVersion: "2023-10-16",
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
        const organizationId = session.metadata?.organization_id;
        const subscriptionId = session.subscription as string;

        if (organizationId && subscriptionId) {
          // Get subscription details
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const priceId = subscription.items.data[0]?.price.id;

          // Determine plan from price
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

        // Find organization by customer ID
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

        // Find organization by customer ID
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

        // Find organization and notify
        const { data: org } = await supabaseClient
          .from("organizations")
          .select("id, name")
          .eq("stripe_customer_id", customerId)
          .single();

        if (org) {
          console.log(`Payment failed for organization ${org.name} (${org.id})`);
          // TODO: Send notification email
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
