import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const githubToken = Deno.env.get("GITHUB_TOKEN");
    const githubOwner = Deno.env.get("GITHUB_OWNER");
    const githubRepo = Deno.env.get("GITHUB_REPO");

    if (!githubToken || !githubOwner || !githubRepo) {
      console.error("Missing GitHub configuration");
      return new Response(
        JSON.stringify({ error: "GitHub integration not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { issue_number, comment } = await req.json();

    if (!issue_number) {
      return new Response(
        JSON.stringify({ error: "issue_number is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Closing issue #${issue_number} with comment: ${comment || 'No comment'}`);

    // Add comment if provided
    if (comment) {
      const commentResponse = await fetch(
        `https://api.github.com/repos/${githubOwner}/${githubRepo}/issues/${issue_number}/comments`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${githubToken}`,
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "Totonos-Bot",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ body: comment }),
        }
      );

      if (!commentResponse.ok) {
        const errorText = await commentResponse.text();
        console.error("Failed to add comment:", commentResponse.status, errorText);
      }
    }

    // Close the issue
    const closeResponse = await fetch(
      `https://api.github.com/repos/${githubOwner}/${githubRepo}/issues/${issue_number}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "Totonos-Bot",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ state: "closed" }),
      }
    );

    if (!closeResponse.ok) {
      const errorText = await closeResponse.text();
      console.error("GitHub API error:", closeResponse.status, errorText);
      throw new Error(`GitHub API error: ${closeResponse.status}`);
    }

    const closedIssue = await closeResponse.json();
    console.log(`Successfully closed issue #${issue_number}`);

    return new Response(
      JSON.stringify({
        success: true,
        issue: {
          number: closedIssue.number,
          title: closedIssue.title,
          state: closedIssue.state,
          url: closedIssue.html_url,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error closing issue:", error);
    return new Response(
      JSON.stringify({ error: "Failed to close issue" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
