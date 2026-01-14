import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface FeedbackRequest {
  type: "feature" | "bug" | "improvement" | "other";
  title: string;
  details?: string;
  email?: string;
  page?: string;
}

const typeLabels: Record<string, { label: string; ghLabel: string }> = {
  feature: { label: "機能要望", ghLabel: "enhancement" },
  bug: { label: "バグ報告", ghLabel: "bug" },
  improvement: { label: "改善提案", ghLabel: "enhancement" },
  other: { label: "その他", ghLabel: "question" },
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

    const body: FeedbackRequest = await req.json();
    const { type, title, details, email, page } = body;

    if (!title?.trim()) {
      return new Response(
        JSON.stringify({ error: "Title is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const typeInfo = typeLabels[type] || typeLabels.other;
    const timestamp = new Date().toISOString();

    // Build issue body in markdown
    const issueBody = `## フィードバック種類
${typeInfo.label}

## 詳細
${details?.trim() || "詳細なし"}

## 投稿者情報
- **ページ**: \`${page || "不明"}\`
- **日時**: ${timestamp}
${email ? `- **メール**: ${email}` : ""}

---
*このIssueはTotonosアプリから自動作成されました*`;

    // Create GitHub Issue
    const response = await fetch(
      `https://api.github.com/repos/${githubOwner}/${githubRepo}/issues`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
          "User-Agent": "Totonos-Feedback-Bot",
        },
        body: JSON.stringify({
          title: `[${typeInfo.label}] ${title}`,
          body: issueBody,
          labels: ["user-feedback", typeInfo.ghLabel],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("GitHub API error:", response.status, errorText);
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const issue = await response.json();

    return new Response(
      JSON.stringify({
        success: true,
        issueNumber: issue.number,
        issueUrl: issue.html_url,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating feedback:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create feedback" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
