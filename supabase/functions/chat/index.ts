import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.27.0";
import { allTools, executeToolCall } from "./tools/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get API key from environment
    const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicApiKey) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }

    // Get Supabase credentials
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Get user from JWT
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Parse request body
    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      throw new Error("Invalid request: messages array required");
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({ apiKey: anthropicApiKey });

    // System prompt for the AI assistant
    const systemPrompt = `あなたはPulse Finance OSのAIアシスタントです。
このシステムでは以下の機能を操作できます：
- 契約書の作成・管理
- CRM（リード管理、案件管理、活動記録）
- 会計（仕訳入力、試算表、財務諸表）
- 人事（従業員管理、勤怠管理、給与計算）
- Wiki（社内ナレッジベース）
- IT資産管理

ユーザーからの要望に応じて適切なツールを使用してください。
日本語で丁寧に回答してください。
データを取得した場合は、わかりやすく要約して説明してください。`;

    // Prepare messages for Claude
    const claudeMessages = messages.map((msg: { role: string; content: string }) => ({
      role: (msg.role === "user" ? "user" : "assistant") as "user" | "assistant",
      content: msg.content,
    }));

    // Call Claude API
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemPrompt,
      tools: allTools,
      messages: claudeMessages,
    });

    // Process tool calls if any
    let finalContent = "";
    const toolCalls: Array<{ id: string; name: string; input: unknown }> = [];
    const toolResults: Array<{ toolCallId: string; toolName: string; result: unknown; isError?: boolean }> = [];

    for (const block of response.content) {
      if (block.type === "text") {
        finalContent += block.text;
      } else if (block.type === "tool_use") {
        toolCalls.push({
          id: block.id,
          name: block.name,
          input: block.input,
        });

        // Execute tool call
        try {
          const result = await executeToolCall(
            block.name,
            block.input as Record<string, unknown>,
            user.id,
            supabase
          );
          toolResults.push({
            toolCallId: block.id,
            toolName: block.name,
            result,
          });
        } catch (error) {
          toolResults.push({
            toolCallId: block.id,
            toolName: block.name,
            result: { error: error instanceof Error ? error.message : "Unknown error" },
            isError: true,
          });
        }
      }
    }

    // If there were tool calls, send tool results back to Claude for final response
    if (toolResults.length > 0) {
      const toolResultMessages = [
        ...claudeMessages,
        {
          role: "assistant" as const,
          content: response.content,
        },
        {
          role: "user" as const,
          content: toolResults.map((tr) => ({
            type: "tool_result" as const,
            tool_use_id: tr.toolCallId,
            content: JSON.stringify(tr.result),
            is_error: tr.isError,
          })),
        },
      ];

      const finalResponse = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: systemPrompt,
        tools: allTools,
        messages: toolResultMessages,
      });

      for (const block of finalResponse.content) {
        if (block.type === "text") {
          finalContent = block.text;
        }
      }
    }

    return new Response(
      JSON.stringify({
        id: response.id,
        role: "assistant",
        content: finalContent,
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        stopReason: response.stop_reason,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
