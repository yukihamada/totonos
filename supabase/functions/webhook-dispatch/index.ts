import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WebhookDelivery {
  id: string;
  webhook_id: string;
  event: string;
  payload: Record<string, unknown>;
  attempt_number: number;
}

interface Webhook {
  id: string;
  url: string;
  secret: string;
  headers: Record<string, string>;
  max_retries: number;
  timeout_seconds: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { deliveryId } = await req.json();

    if (!deliveryId) {
      return new Response(JSON.stringify({ error: "Missing deliveryId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get delivery details
    const { data: delivery, error: deliveryError } = await supabaseClient
      .from("webhook_deliveries")
      .select(`
        id,
        webhook_id,
        event,
        payload,
        attempt_number,
        webhook:webhooks(id, url, secret, headers, max_retries, timeout_seconds)
      `)
      .eq("id", deliveryId)
      .single();

    if (deliveryError || !delivery) {
      console.error("Delivery not found:", deliveryError);
      return new Response(JSON.stringify({ error: "Delivery not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const webhook = (delivery.webhook as unknown) as Webhook;
    if (!webhook) {
      console.error("Webhook not found for delivery:", deliveryId);
      return new Response(JSON.stringify({ error: "Webhook not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Prepare payload with metadata
    const webhookPayload = {
      id: crypto.randomUUID(),
      event: delivery.event,
      created_at: new Date().toISOString(),
      data: delivery.payload,
    };

    const payloadString = JSON.stringify(webhookPayload);

    // Generate HMAC-SHA256 signature
    const signature = await generateSignature(payloadString, webhook.secret);

    // Prepare headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": "Totonos-Webhook/1.0",
      "X-Webhook-Id": webhook.id,
      "X-Webhook-Event": delivery.event,
      "X-Webhook-Signature": signature,
      "X-Webhook-Timestamp": new Date().toISOString(),
      ...(webhook.headers || {}),
    };

    // Send webhook
    const startTime = Date.now();
    let success = false;
    let statusCode: number | null = null;
    let responseBody: string | null = null;
    let responseHeaders: Record<string, string> | null = null;
    let errorMessage: string | null = null;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        (webhook.timeout_seconds || 30) * 1000
      );

      const response = await fetch(webhook.url, {
        method: "POST",
        headers,
        body: payloadString,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      statusCode = response.status;
      responseBody = await response.text();
      responseHeaders = Object.fromEntries(response.headers.entries());

      // Consider 2xx status codes as success
      success = statusCode >= 200 && statusCode < 300;

      if (!success) {
        errorMessage = `HTTP ${statusCode}: ${responseBody.substring(0, 500)}`;
      }
    } catch (fetchErr) {
      const fe = fetchErr as Error;
      if (fe.name === "AbortError") {
        errorMessage = `Timeout after ${webhook.timeout_seconds} seconds`;
      } else {
        errorMessage = fe.message || "Unknown error";
      }
    }

    const durationMs = Date.now() - startTime;

    // Update delivery record
    await supabaseClient.rpc("complete_webhook_delivery", {
      p_delivery_id: deliveryId,
      p_success: success,
      p_status_code: statusCode,
      p_response_body: responseBody?.substring(0, 10000), // Limit response body size
      p_response_headers: responseHeaders,
      p_duration_ms: durationMs,
      p_error_message: errorMessage,
    });

    // Schedule retry if failed and attempts remaining
    if (!success && delivery.attempt_number < webhook.max_retries) {
      const retryDelay = Math.pow(2, delivery.attempt_number) * 60000; // Exponential backoff
      const nextRetryAt = new Date(Date.now() + retryDelay);

      // Create new delivery record for retry
      await supabaseClient.from("webhook_deliveries").insert({
        webhook_id: webhook.id,
        event: delivery.event,
        payload: delivery.payload,
        attempt_number: delivery.attempt_number + 1,
        next_retry_at: nextRetryAt.toISOString(),
      });

      console.log(`Scheduled retry ${delivery.attempt_number + 1} at ${nextRetryAt.toISOString()}`);
    }

    return new Response(JSON.stringify({
      success,
      deliveryId,
      statusCode,
      durationMs,
      error: errorMessage,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook dispatch error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function generateSignature(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload)
  );

  return "sha256=" + Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}
