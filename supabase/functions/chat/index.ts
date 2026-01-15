import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { allTools, executeToolCall } from "./tools/index.ts";
import { consumeCompanyCredits, getCompanyIdForUser } from "../_shared/credits.ts";

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

// Convert tools to OpenAI format for Lovable AI Gateway
function convertToolsToOpenAIFormat(tools: unknown[]) {
  return (tools as Array<{ name: string; description: string; input_schema: unknown }>).map((tool) => ({
    type: "function" as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.input_schema,
    },
  }));
}

// Call Lovable AI Gateway with tool support
async function callLovableAI(
  messages: Array<{ role: string; content: string | unknown[] }>,
  model: string,
  systemPrompt: string,
  tools: unknown[]
) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY is not configured");
  }

  const openaiTools = convertToolsToOpenAIFormat(tools);

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
      tools: openaiTools,
      tool_choice: "auto",
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
  const choice = data.choices?.[0];
  const message = choice?.message;

  // Define the tool call type
  interface ToolCallResponse {
    id: string;
    function: {
      name: string;
      arguments: string;
    };
  }

  // Check for tool calls
  if (message?.tool_calls && message.tool_calls.length > 0) {
    const toolCalls = message.tool_calls.map((tc: ToolCallResponse) => ({
      id: tc.id,
      name: tc.function.name,
      input: JSON.parse(tc.function.arguments || "{}"),
    }));

    return {
      content: message.content || "",
      toolCalls,
      rawMessage: message,
    };
  }

  return {
    content: message?.content || "",
    toolCalls: [] as Array<{ id: string; name: string; input: unknown }>,
    rawMessage: message,
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
    
    // Check if this is a LINE webhook call (using service role key with x-line-user-id header)
    const lineUserId = req.headers.get("x-line-user-id");
    const isServiceRoleCall = token === supabaseServiceRoleKey;
    
    let userId: string;
    let supabase;
    
    if (isServiceRoleCall && lineUserId) {
      // LINE webhook call - look up user ID from line_users table
      const { data: lineUserData } = await supabaseAdmin
        .from("line_users")
        .select("user_id")
        .eq("line_user_id", lineUserId)
        .maybeSingle();
      
      if (!lineUserData?.user_id) {
        console.error("LINE user not linked:", lineUserId);
        return new Response(
          JSON.stringify({ error: "LINEアカウントがリンクされていません" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      userId = lineUserData.user_id;
      console.log("LINE webhook call for user:", userId);
      
      // Use service role client for LINE calls
      supabase = supabaseAdmin;
    } else {
      // Regular user call - verify JWT
      const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
      
      if (userError || !user) {
        console.error("Auth error:", userError?.message);
        return new Response(
          JSON.stringify({ error: "認証が無効です。再度ログインしてください。" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      userId = user.id;
      
      // Create client with user's token for RLS
      supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { authorization: authHeader } },
      });
    }

    const { messages, test, stream } = await req.json();
    
    // Handle test connection
    if (test) {
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Input validation
    if (!messages || !Array.isArray(messages)) {
      throw new Error("Invalid request: messages array required");
    }

    // Limit message history size to prevent resource exhaustion
    const MAX_MESSAGES = 50;
    const MAX_MESSAGE_LENGTH = 10000;
    
    if (messages.length > MAX_MESSAGES) {
      throw new Error(`Too many messages in history (max ${MAX_MESSAGES})`);
    }

    for (const msg of messages) {
      if (typeof msg.content === "string" && msg.content.length > MAX_MESSAGE_LENGTH) {
        throw new Error(`Message too long (max ${MAX_MESSAGE_LENGTH} characters)`);
      }
    }

    // Consume credits for AI chat (skip for LINE as it's already consumed in webhook)
    const companyId = await getCompanyIdForUser(supabaseAdmin, userId);
    if (companyId && !lineUserId) {
      const creditResult = await consumeCompanyCredits(supabaseAdmin, companyId, "ai_chat", "AIチャット");
      if (!creditResult.success) {
        return new Response(
          JSON.stringify({ error: creditResult.error }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Get user's AI settings
    const aiSettings = await getAISettings(userId, supabase);
    console.log("Using AI settings:", aiSettings.provider, aiSettings.model);

    const systemPrompt = `あなたはTotonosのAIアシスタント「ミナト」です。

【重要なルール - 必ず守ってください】
1. タスク管理: 複雑な依頼を受けた場合は、まずタスクリストを作成し、1つずつ順番に実行してください。
   例: 「請求書を作成して送付」→ ①クライアント確認 ②請求書作成 ③送付確認

2. 削除操作は必ず確認: データを削除する前に必ず確認を取ってください。
   「○○を削除しますか？確認のため「はい」と返信してください」と聞いてから実行。

3. 禁止操作（以下は絶対に実行しないでください）:
   - 「全てのデータを削除」「全件削除」「リセット」
   - 100件以上のデータを一括で削除・更新する操作
   - データベース全体に影響する操作
   - 「全部消して」「すべて削除」などの曖昧な大量削除指示
   これらの依頼には「セキュリティ上の理由でその操作は実行できません」と丁寧にお断りしてください。

4. 安全第一: 不明確な指示の場合は、必ず確認を取ってから実行してください。

5. 表現ルール（重要）:
   - 「システムの不具合」などの曖昧な言い方は禁止。原因が「入力不足」ならそう明言し、DB/権限などの失敗ならエラー内容を短く提示してください。
   - 「〜を実行中…」など進捗を文章で書かないでください（画面側で進捗が表示されます）。
   - ツールの実行結果を受け取る前に「登録しました」「作成しました」と断定しないでください。

【対応可能な機能】
- 契約書の作成・管理・電子署名
- CRM（リード管理、案件管理、活動記録）
- 会計（仕訳入力、試算表、財務諸表、経費精算）
- 人事（従業員管理、勤怠管理、給与計算）
- Wiki（社内ナレッジベース）
- IT資産管理
- 請求書・見積書管理
- メール送受信
- プロジェクト・タスク管理
- 発注書管理

【便利な使い方のヒント】
- 会社（クライアント）を先に登録すると、請求書・契約書の作成がスムーズです
- 領収書をメールに添付すると自動で経費登録できます
- メールアドレス minato@totos.jp からも同様に操作できます

日本語で丁寧に回答してください。`;

    let result: { content: string; toolCalls: Array<{ id: string; name: string; input: unknown }> };
    let toolResults: Array<{ toolCallId: string; toolName: string; result: unknown; isError?: boolean }> = [];

    // Streaming (SSE): tool status (実行中→完了/失敗) を自然に表現するため
    if (stream) {
      const encoder = new TextEncoder();

      const sseHeaders = {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      };

      const body = new ReadableStream({
        start: async (controller) => {
          const send = (chunk: unknown) => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
          };

          try {
            // Route to appropriate AI provider
            if (aiSettings.provider === "lovable") {
              // First call with tools
              const first = await callLovableAI(messages, aiSettings.model, systemPrompt, allTools);

              // Initial content (confirmation/questions) if present
              if (first.content) {
                send({
                  type: "content_block_delta",
                  delta: { type: "text_delta", text: first.content },
                });
              }

              // Tool calls
              for (const tc of first.toolCalls) {
                send({ type: "tool_use", toolCall: tc });
              }

              // Execute tools and stream results
              const streamedToolResults: typeof toolResults = [];
              for (const toolCall of first.toolCalls) {
                try {
                  const toolResult = await executeToolCall(
                    toolCall.name,
                    toolCall.input as Record<string, unknown>,
                    userId,
                    supabase
                  );
                  const tr = { toolCallId: toolCall.id, toolName: toolCall.name, result: toolResult };
                  streamedToolResults.push(tr);
                  send({ type: "tool_result", toolResult: tr });
                } catch (error) {
                  const tr = {
                    toolCallId: toolCall.id,
                    toolName: toolCall.name,
                    result: { error: error instanceof Error ? error.message : "Unknown error" },
                    isError: true,
                  };
                  streamedToolResults.push(tr);
                  send({ type: "tool_result", toolResult: tr });
                }
              }

              // Final response (use tool results as context)
              if (first.toolCalls.length > 0) {
                const messagesWithToolResults = [
                  ...messages,
                  {
                    role: "assistant",
                    content: first.content || null,
                    tool_calls: first.toolCalls.map((tc) => ({
                      id: tc.id,
                      type: "function",
                      function: {
                        name: tc.name,
                        arguments: JSON.stringify(tc.input),
                      },
                    })),
                  },
                  ...streamedToolResults.map((tr) => ({
                    role: "tool",
                    tool_call_id: tr.toolCallId,
                    content: JSON.stringify(tr.result),
                  })),
                ];

                const final = await callLovableAI(messagesWithToolResults, aiSettings.model, systemPrompt, allTools);
                if (final.content) {
                  send({
                    type: "content_block_delta",
                    delta: { type: "text_delta", text: final.content },
                  });
                }
              }
            } else if (aiSettings.provider === "openai") {
              if (!aiSettings.custom_api_key) {
                throw new Error("OpenAI API key is not configured");
              }
              const openaiRes = await callOpenAI(messages, aiSettings.model, aiSettings.custom_api_key, systemPrompt);
              send({
                type: "content_block_delta",
                delta: { type: "text_delta", text: openaiRes.content },
              });
            } else if (aiSettings.provider === "anthropic") {
              if (!aiSettings.custom_api_key) {
                throw new Error("Anthropic API key is not configured");
              }
              const anth = await callAnthropic(messages, aiSettings.model, aiSettings.custom_api_key, systemPrompt, allTools);
              send({
                type: "content_block_delta",
                delta: { type: "text_delta", text: anth.content },
              });
            } else {
              throw new Error(`Unknown provider: ${aiSettings.provider}`);
            }

            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          } catch (e) {
            send({ type: "error", error: e instanceof Error ? e.message : "Internal server error" });
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          }
        },
      });

      return new Response(body, { headers: sseHeaders });
    }

    // Route to appropriate AI provider
    if (aiSettings.provider === "lovable") {
      // First call with tools
      result = await callLovableAI(messages, aiSettings.model, systemPrompt, allTools);

      // Process tool calls for Lovable AI
      if (result.toolCalls.length > 0) {
        console.log("Processing tool calls:", result.toolCalls.map(tc => tc.name));
        
        for (const toolCall of result.toolCalls) {
          try {
            const toolResult = await executeToolCall(
              toolCall.name,
              toolCall.input as Record<string, unknown>,
              userId,
              supabase
            );
            toolResults.push({
              toolCallId: toolCall.id,
              toolName: toolCall.name,
              result: toolResult,
            });
            console.log(`Tool ${toolCall.name} executed successfully`);
          } catch (error) {
            console.error(`Tool ${toolCall.name} error:`, error);
            toolResults.push({
              toolCallId: toolCall.id,
              toolName: toolCall.name,
              result: { error: error instanceof Error ? error.message : "Unknown error" },
              isError: true,
            });
          }
        }

        // Send tool results back to AI for final response
        if (toolResults.length > 0) {
          const messagesWithToolResults = [
            ...messages,
            {
              role: "assistant",
              content: result.content || null,
              tool_calls: result.toolCalls.map(tc => ({
                id: tc.id,
                type: "function",
                function: {
                  name: tc.name,
                  arguments: JSON.stringify(tc.input),
                },
              })),
            },
            ...toolResults.map(tr => ({
              role: "tool",
              tool_call_id: tr.toolCallId,
              content: JSON.stringify(tr.result),
            })),
          ];

          const finalResult = await callLovableAI(
            messagesWithToolResults,
            aiSettings.model,
            systemPrompt,
            allTools
          );
          result.content = finalResult.content;
          
          // If more tool calls are needed, process them (recursive, max 3 rounds)
          type ToolCallType = { id: string; name: string; input: unknown };
          let rounds = 0;
          while (finalResult.toolCalls.length > 0 && rounds < 3) {
            rounds++;
            console.log(`Processing additional tool calls (round ${rounds}):`, finalResult.toolCalls.map((tc: ToolCallType) => tc.name));
            
            const additionalResults: typeof toolResults = [];
            for (const toolCall of finalResult.toolCalls) {
              try {
                const toolResult = await executeToolCall(
                  toolCall.name,
                  toolCall.input as Record<string, unknown>,
                  userId,
                  supabase
                );
                additionalResults.push({
                  toolCallId: toolCall.id,
                  toolName: toolCall.name,
                  result: toolResult,
                });
              } catch (error) {
                additionalResults.push({
                  toolCallId: toolCall.id,
                  toolName: toolCall.name,
                  result: { error: error instanceof Error ? error.message : "Unknown error" },
                  isError: true,
                });
              }
            }
            
            toolResults.push(...additionalResults);
            
            // Continue conversation with new tool results
            const nextMessages = [
              ...messagesWithToolResults,
              {
                role: "assistant",
                content: finalResult.content || null,
                tool_calls: finalResult.toolCalls.map((tc: ToolCallType) => ({
                  id: tc.id,
                  type: "function",
                  function: {
                    name: tc.name,
                    arguments: JSON.stringify(tc.input),
                  },
                })),
              },
              ...additionalResults.map(tr => ({
                role: "tool",
                tool_call_id: tr.toolCallId,
                content: JSON.stringify(tr.result),
              })),
            ];
            
            const nextResult = await callLovableAI(nextMessages, aiSettings.model, systemPrompt, allTools);
            result.content = nextResult.content;
            
            if (nextResult.toolCalls.length === 0) break;
            Object.assign(finalResult, nextResult);
          }
        }
      }
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
              userId,
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
        toolResults: toolResults.length > 0 ? toolResults : undefined,
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
