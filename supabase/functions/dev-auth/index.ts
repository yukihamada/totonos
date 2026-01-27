import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DevAuthRequest {
  email: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const E2E_TEST_KEY = Deno.env.get("VITE_E2E_TEST_KEY");
    
    if (!E2E_TEST_KEY) {
      console.error("VITE_E2E_TEST_KEY not configured");
      return new Response(
        JSON.stringify({ error: "E2E testing not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { email }: DevAuthRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate E2E test email pattern: anything+e2e-{SECRET_KEY}@anyhost.com
    const pattern = new RegExp(`\\+e2e-${E2E_TEST_KEY}@`);
    if (!pattern.test(email)) {
      console.error("Invalid E2E test email pattern");
      return new Response(
        JSON.stringify({ error: "Invalid test email" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create admin Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Check if user already exists
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error("Error listing users:", listError);
      return new Response(
        JSON.stringify({ error: "Failed to check existing users" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let user = existingUsers.users.find((u) => u.email === email);

    // Create user if not exists
    if (!user) {
      console.log("Creating new E2E test user:", email);
      const { data: newUserData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: `e2e-test-${E2E_TEST_KEY}-secure`,
        email_confirm: true,
        user_metadata: {
          display_name: "E2E Test User",
          company_name: "Test Company",
        },
      });

      if (createError) {
        console.error("Error creating user:", createError);
        return new Response(
          JSON.stringify({ error: "Failed to create test user" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      user = newUserData.user;
    }

    if (!user) {
      return new Response(
        JSON.stringify({ error: "User not found or created" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate a real magic link for the user
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: user.email!,
    });

    if (linkError || !linkData) {
      console.error("Error generating magic link:", linkError);
      return new Response(
        JSON.stringify({ error: "Failed to generate authentication link" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Generated magic link for E2E user:", user.email);

    // Return the token hash that can be used with verifyOtp
    return new Response(
      JSON.stringify({
        token: linkData.properties.hashed_token,
        email: user.email,
        type: "magiclink",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in dev-auth function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
