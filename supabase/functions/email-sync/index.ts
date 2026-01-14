import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, provider, organizationId } = await req.json();

    switch (action) {
      case "get_auth_url": {
        // Generate OAuth URL for email provider
        const authUrl = await getOAuthUrl(provider, user.id, organizationId);
        return new Response(JSON.stringify({ url: authUrl }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "callback": {
        // Handle OAuth callback
        const { code } = await req.json();
        const result = await handleOAuthCallback(provider, code, user.id, organizationId, supabaseClient);
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "sync": {
        // Sync emails
        const result = await syncEmails(user.id, organizationId, supabaseClient);
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "disconnect": {
        // Disconnect email integration
        await supabaseClient
          .from("email_integrations")
          .delete()
          .eq("user_id", user.id)
          .eq("organization_id", organizationId)
          .eq("provider", provider);

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function getOAuthUrl(
  provider: string,
  userId: string,
  organizationId: string
): Promise<string> {
  const redirectUri = `${Deno.env.get("APP_URL")}/api/email-callback`;
  const state = btoa(JSON.stringify({ userId, organizationId, provider }));

  switch (provider) {
    case "google": {
      const clientId = Deno.env.get("GOOGLE_CLIENT_ID");
      const scopes = [
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/calendar.readonly",
      ].join(" ");

      return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scopes)}&state=${state}&access_type=offline&prompt=consent`;
    }

    case "microsoft": {
      const clientId = Deno.env.get("MICROSOFT_CLIENT_ID");
      const scopes = [
        "Mail.Read",
        "Calendars.Read",
        "offline_access",
      ].join(" ");

      return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scopes)}&state=${state}`;
    }

    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

async function handleOAuthCallback(
  provider: string,
  code: string,
  userId: string,
  organizationId: string,
  supabaseClient: any
) {
  const redirectUri = `${Deno.env.get("APP_URL")}/api/email-callback`;

  let tokenData: any;

  switch (provider) {
    case "google": {
      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: Deno.env.get("GOOGLE_CLIENT_ID")!,
          client_secret: Deno.env.get("GOOGLE_CLIENT_SECRET")!,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });
      tokenData = await response.json();
      break;
    }

    case "microsoft": {
      const response = await fetch(
        "https://login.microsoftonline.com/common/oauth2/v2.0/token",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            code,
            client_id: Deno.env.get("MICROSOFT_CLIENT_ID")!,
            client_secret: Deno.env.get("MICROSOFT_CLIENT_SECRET")!,
            redirect_uri: redirectUri,
            grant_type: "authorization_code",
          }),
        }
      );
      tokenData = await response.json();
      break;
    }

    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }

  if (tokenData.error) {
    throw new Error(tokenData.error_description || tokenData.error);
  }

  // Store tokens
  await supabaseClient.from("email_integrations").upsert({
    user_id: userId,
    organization_id: organizationId,
    provider,
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
  });

  return { success: true };
}

async function syncEmails(
  userId: string,
  organizationId: string,
  supabaseClient: any
) {
  // Get integration
  const { data: integration } = await supabaseClient
    .from("email_integrations")
    .select("*")
    .eq("user_id", userId)
    .eq("organization_id", organizationId)
    .single();

  if (!integration) {
    throw new Error("No email integration found");
  }

  // Refresh token if needed
  if (new Date(integration.expires_at) < new Date()) {
    // Token refresh logic here
  }

  let emails: any[] = [];

  switch (integration.provider) {
    case "google": {
      const response = await fetch(
        "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=20",
        {
          headers: { Authorization: `Bearer ${integration.access_token}` },
        }
      );
      const data = await response.json();

      // Fetch individual messages
      for (const msg of data.messages || []) {
        const msgResponse = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
          {
            headers: { Authorization: `Bearer ${integration.access_token}` },
          }
        );
        const msgData = await msgResponse.json();
        emails.push(parseGmailMessage(msgData));
      }
      break;
    }

    case "microsoft": {
      const response = await fetch(
        "https://graph.microsoft.com/v1.0/me/messages?$top=20",
        {
          headers: { Authorization: `Bearer ${integration.access_token}` },
        }
      );
      const data = await response.json();
      emails = (data.value || []).map(parseOutlookMessage);
      break;
    }
  }

  // Store emails
  for (const email of emails) {
    await supabaseClient.from("synced_emails").upsert({
      ...email,
      user_id: userId,
      organization_id: organizationId,
    });
  }

  return { synced: emails.length };
}

function parseGmailMessage(msg: any) {
  const headers = msg.payload?.headers || [];
  const getHeader = (name: string) =>
    headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value;

  return {
    external_id: msg.id,
    subject: getHeader("subject"),
    from_address: getHeader("from"),
    to_address: getHeader("to"),
    date: new Date(parseInt(msg.internalDate)).toISOString(),
    snippet: msg.snippet,
    thread_id: msg.threadId,
    labels: msg.labelIds,
  };
}

function parseOutlookMessage(msg: any) {
  return {
    external_id: msg.id,
    subject: msg.subject,
    from_address: msg.from?.emailAddress?.address,
    to_address: msg.toRecipients?.[0]?.emailAddress?.address,
    date: msg.receivedDateTime,
    snippet: msg.bodyPreview,
    thread_id: msg.conversationId,
    labels: msg.categories,
  };
}
