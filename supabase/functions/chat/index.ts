import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { allTools, executeToolCall } from "./tools/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AISettings {
  provider: string;
  model: string;
  custom_api_key?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getAISettings(userId: string, supabase: any): Promise<AISettings> {
  try {
    const { data, error } = await supabase
      .from("user_ai_settings")
      .select("provider, model, custom_api_key")
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) {
      return {
        provider: "lovable",
        model: "google/gemini-3-flash-preview",
      };
    }

    return data as AISettings;
  } catch {
    return {
      provider: "lovable",
      model: "google/gemini-3-flash-preview",
    };
  }
}

// Call Lovable AI Gateway
async function callLovableAI(messages: Array<{ role: string; content: string }>, model: string, systemPrompt: string) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY is not configured");
  }

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
    }),
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("Rate limit exceeded. Please try again later.");
    }
    if (response.status === 402) {
      throw new Error("Payment required. Please add credits to your workspace.");
    }
    const text = await response.text();
    console.error("Lovable AI error:", response.status, text);
    throw new Error("AI gateway error");
  }

  const data = await response.json();
  return {
    content: data.choices?.[0]?.message?.content || "",
    toolCalls: [],
  };
}

// Call OpenAI API
async function callOpenAI(messages: Array<{ role: string; content: string }>, model: string, apiKey: string, systemPrompt: string) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("OpenAI error:", response.status, text);
    throw new Error("OpenAI API error: " + text);
  }

  const data = await response.json();
  return {
    content: data.choices?.[0]?.message?.content || "",
    toolCalls: [],
  };
}

// Call Anthropic API
async function callAnthropic(messages: Array<{ role: string; content: string }>, model: string, apiKey: string, systemPrompt: string, tools: unknown[]) {
  const Anthropic = (await import("https://esm.sh/@anthropic-ai/sdk@0.27.0")).default;
  const anthropic = new Anthropic({ apiKey });

  const claudeMessages = messages.map((msg) => ({
    role: (msg.role === "user" ? "user" : "assistant") as "user" | "assistant",
    content: msg.content,
  }));

  const response = await anthropic.messages.create({
    model,
    max_tokens: 4096,
    system: systemPrompt,
    tools: tools as any,
    messages: claudeMessages,
  });

  let content = "";
  const toolCalls: Array<{ id: string; name: string; input: unknown }> = [];

  for (const block of response.content) {
    if (block.type === "text") {
      content += block.text;
    } else if (block.type === "tool_use") {
      toolCalls.push({
        id: block.id,
        name: block.name,
        input: block.input,
      });
    }
  }

  return { content, toolCalls, rawResponse: response };
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "認証が必要です" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract the token from the Authorization header
    const token = authHeader.replace("Bearer ", "");
    
    // Create a client with service role to verify the user
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      console.error("Auth error:", userError?.message);
      return new Response(
        JSON.stringify({ error: "認証が無効です。再度ログインしてください。" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Create client with user's token for RLS
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { authorization: authHeader } },
    });

    const { messages, test } = await req.json();
    
    // Handle test connection
    if (test) {
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!messages || !Array.isArray(messages)) {
      throw new Error("Invalid request: messages array required");
    }

    // Get user's AI settings
    const aiSettings = await getAISettings(user.id, supabase);
    console.log("Using AI settings:", aiSettings.provider, aiSettings.model);

    const systemPrompt = `あなたはTotonosのAIアシスタントです。
このシステムでは以下の機能を操作できます：
- 契約書の作成・管理
- CRM（リード管理、案件管理、活動記録）
- 会計（仕訳入力、試算表、財務諸表）
- 人事（従業員管理、勤怠管理、給与計算）
- Wiki（社内ナレッジベース）
- IT資産管理
- 請求書管理

ユーザーからの要望に応じて適切に対応してください。
日本語で丁寧に回答してください。
データを取得した場合は、わかりやすく要約して説明してください。`;

    let result: { content: string; toolCalls: Array<{ id: string; name: string; input: unknown }> };
    let toolResults: Array<{ toolCallId: string; toolName: string; result: unknown; isError?: boolean }> = [];

    // Route to appropriate AI provider
    if (aiSettings.provider === "lovable") {
      result = await callLovableAI(messages, aiSettings.model, systemPrompt);
    } else if (aiSettings.provider === "openai") {
      if (!aiSettings.custom_api_key) {
        throw new Error("OpenAI API key is not configured");
      }
      result = await callOpenAI(messages, aiSettings.model, aiSettings.custom_api_key, systemPrompt);
    } else if (aiSettings.provider === "anthropic") {
      if (!aiSettings.custom_api_key) {
        throw new Error("Anthropic API key is not configured");
      }
      const anthropicResult = await callAnthropic(messages, aiSettings.model, aiSettings.custom_api_key, systemPrompt, allTools);
      result = anthropicResult;

      // Process tool calls for Anthropic
      if (result.toolCalls.length > 0) {
        for (const toolCall of result.toolCalls) {
          try {
            const toolResult = await executeToolCall(
              toolCall.name,
              toolCall.input as Record<string, unknown>,
              user.id,
              supabase
            );
            toolResults.push({
              toolCallId: toolCall.id,
              toolName: toolCall.name,
              result: toolResult,
            });
          } catch (error) {
            toolResults.push({
              toolCallId: toolCall.id,
              toolName: toolCall.name,
              result: { error: error instanceof Error ? error.message : "Unknown error" },
              isError: true,
            });
          }
        }

        // Send tool results back to Claude
        if (toolResults.length > 0 && anthropicResult.rawResponse) {
          const Anthropic = (await import("https://esm.sh/@anthropic-ai/sdk@0.27.0")).default;
          const anthropic = new Anthropic({ apiKey: aiSettings.custom_api_key });

          const toolResultMessages = [
            ...messages.map((msg: { role: string; content: string }) => ({
              role: (msg.role === "user" ? "user" : "assistant") as "user" | "assistant",
              content: msg.content,
            })),
            {
              role: "assistant" as const,
              content: anthropicResult.rawResponse.content,
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
            model: aiSettings.model,
            max_tokens: 4096,
            system: systemPrompt,
            tools: allTools as any,
            messages: toolResultMessages,
          });

          for (const block of finalResponse.content) {
            if (block.type === "text") {
              result.content = block.text;
            }
          }
        }
      }
    } else {
      throw new Error(`Unknown provider: ${aiSettings.provider}`);
    }

    return new Response(
      JSON.stringify({
        id: crypto.randomUUID(),
        role: "assistant",
        content: result.content,
        toolCalls: result.toolCalls.length > 0 ? result.toolCalls : undefined,
        stopReason: "end_turn",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
