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

    // Fetch open issues
    const response = await fetch(
      `https://api.github.com/repos/${githubOwner}/${githubRepo}/issues?state=open&per_page=50`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "Totonos-Bot",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("GitHub API error:", response.status, errorText);
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const issues = await response.json();

    // Filter out pull requests (GitHub API returns PRs as issues too)
    const filteredIssues = issues.filter((issue: any) => !issue.pull_request);

    return new Response(
      JSON.stringify({
        success: true,
        issues: filteredIssues.map((issue: any) => ({
          number: issue.number,
          title: issue.title,
          body: issue.body,
          labels: issue.labels.map((l: any) => l.name),
          state: issue.state,
          created_at: issue.created_at,
          url: issue.html_url,
        })),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching issues:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch issues" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
