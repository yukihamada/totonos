import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SSOConfig {
  id: string;
  organization_id: string;
  provider: "okta" | "azure" | "google" | "custom";
  entity_id: string;
  sso_url: string;
  certificate: string;
  attribute_mapping: {
    email: string;
    name: string;
    groups?: string;
  };
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

    const url = new URL(req.url);
    const action = url.pathname.split("/").pop();

    switch (action) {
      case "init": {
        // Initialize SSO login
        const { organizationSlug } = await req.json();

        // Get organization's SSO config
        const { data: org } = await supabaseClient
          .from("organizations")
          .select("id")
          .eq("slug", organizationSlug)
          .single();

        if (!org) {
          return new Response(JSON.stringify({ error: "Organization not found" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { data: ssoConfig } = await supabaseClient
          .from("sso_configs")
          .select("*")
          .eq("organization_id", org.id)
          .eq("enabled", true)
          .single();

        if (!ssoConfig) {
          return new Response(JSON.stringify({ error: "SSO not configured" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Generate SAML request
        const samlRequest = generateSAMLRequest(ssoConfig);
        const redirectUrl = `${ssoConfig.sso_url}?SAMLRequest=${encodeURIComponent(samlRequest)}`;

        return new Response(JSON.stringify({ redirectUrl }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "callback": {
        // Handle SAML response
        const formData = await req.formData();
        const samlResponse = formData.get("SAMLResponse") as string;
        const relayState = formData.get("RelayState") as string;

        if (!samlResponse) {
          return new Response("Missing SAML response", { status: 400 });
        }

        // Decode and validate SAML response
        const decoded = atob(samlResponse);
        const userData = parseSAMLResponse(decoded);

        if (!userData.email) {
          return new Response("Invalid SAML response", { status: 400 });
        }

        // Get organization from relay state
        const organizationId = relayState;

        // Get SSO config to verify
        const { data: ssoConfig } = await supabaseClient
          .from("sso_configs")
          .select("*")
          .eq("organization_id", organizationId)
          .single();

        if (!ssoConfig) {
          return new Response("Invalid SSO configuration", { status: 400 });
        }

        // Create or get user
        let user;
        const { data: existingUser } = await supabaseClient
          .from("auth.users")
          .select("*")
          .eq("email", userData.email)
          .single();

        if (existingUser) {
          user = existingUser;
        } else {
          // Create new user via admin API
          const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
            email: userData.email,
            email_confirm: true,
            user_metadata: {
              full_name: userData.name,
              sso_provider: ssoConfig.provider,
            },
          });

          if (createError) throw createError;
          user = newUser.user;

          // Add to organization
          await supabaseClient.from("organization_members").insert({
            organization_id: organizationId,
            user_id: user.id,
            role: "member",
          });
        }

        // Generate session token
        const { data: session, error: sessionError } = await supabaseClient.auth.admin.generateLink({
          type: "magiclink",
          email: userData.email,
        });

        if (sessionError) throw sessionError;

        // Redirect to app with token
        const appUrl = Deno.env.get("APP_URL");
        const redirectUrl = `${appUrl}/auth/callback?token=${session.properties?.hashed_token}`;

        return new Response(null, {
          status: 302,
          headers: {
            Location: redirectUrl,
          },
        });
      }

      case "metadata": {
        // Return service provider metadata
        const appUrl = Deno.env.get("APP_URL");
        const entityId = `${appUrl}/sso`;

        const metadata = `<?xml version="1.0"?>
<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata"
    entityID="${entityId}">
  <md:SPSSODescriptor AuthnRequestsSigned="false" WantAssertionsSigned="true"
      protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <md:NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</md:NameIDFormat>
    <md:AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
        Location="${appUrl}/api/sso/callback" index="0" isDefault="true"/>
  </md:SPSSODescriptor>
</md:EntityDescriptor>`;

        return new Response(metadata, {
          status: 200,
          headers: { "Content-Type": "application/xml" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: "Invalid endpoint" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function generateSAMLRequest(config: SSOConfig): string {
  const appUrl = Deno.env.get("APP_URL");
  const id = "_" + crypto.randomUUID();
  const issueInstant = new Date().toISOString();

  const request = `<?xml version="1.0"?>
<samlp:AuthnRequest xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
    ID="${id}"
    Version="2.0"
    IssueInstant="${issueInstant}"
    Destination="${config.sso_url}"
    AssertionConsumerServiceURL="${appUrl}/api/sso/callback">
  <saml:Issuer xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion">${appUrl}/sso</saml:Issuer>
</samlp:AuthnRequest>`;

  return btoa(request);
}

function parseSAMLResponse(xml: string): { email: string; name: string } {
  // Simple XML parsing - in production, use a proper XML library and validate signature
  const emailMatch = xml.match(/<saml:NameID[^>]*>([^<]+)<\/saml:NameID>/);
  const nameMatch = xml.match(/<saml:Attribute Name="name"[^>]*>.*?<saml:AttributeValue[^>]*>([^<]+)<\/saml:AttributeValue>/s);

  return {
    email: emailMatch?.[1] || "",
    name: nameMatch?.[1] || "",
  };
}
