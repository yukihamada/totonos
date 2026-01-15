import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Note: This function calls the main chat endpoint internally for tool execution

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-line-signature",
};

interface LineEvent {
  type: string;
  replyToken?: string;
  source: {
    type: string;
    userId?: string;
  };
  message?: {
    type: string;
    id: string;
    text?: string;
  };
}

interface LineWebhookBody {
  events: LineEvent[];
}

interface ToolCall {
  id: string;
  name: string;
  input: unknown;
}

// Verify LINE signature using HMAC-SHA256 with Web Crypto API
async function verifyLineSignature(body: string, signature: string, secret: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBytes = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
    const expectedSignature = btoa(String.fromCharCode(...new Uint8Array(signatureBytes)));
    return signature === expectedSignature;
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

// Send LINE reply message
async function replyMessage(replyToken: string, messages: Array<{ type: string; text: string }>, accessToken: string) {
  const response = await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      replyToken,
      messages,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("LINE reply error:", response.status, text);
    throw new Error(`LINE API error: ${response.status}`);
  }

  return response.json();
}

// Send LINE push message (for long responses)
async function pushMessage(userId: string, messages: Array<{ type: string; text: string }>, accessToken: string) {
  const response = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      to: userId,
      messages,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("LINE push error:", response.status, text);
    throw new Error(`LINE API error: ${response.status}`);
  }

  return response.json();
}

// Get LINE user profile
async function getLineProfile(userId: string, accessToken: string) {
  const response = await fetch(`https://api.line.me/v2/bot/profile/${userId}`, {
    headers: {
      "Authorization": `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    console.error("Failed to get LINE profile:", response.status);
    return null;
  }

  return response.json();
}

// Convert tools to OpenAI format
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

// Call internal chat API for AI processing with tools
async function callChatAPI(
  messages: Array<{ role: string; content: string }>,
  supabaseUrl: string,
  serviceRoleKey: string
): Promise<string> {
  const response = await fetch(`${supabaseUrl}/functions/v1/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${serviceRoleKey}`,
    },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Chat API error:", response.status, text);
    throw new Error("Chat API error");
  }

  const data = await response.json();
  return data.content || "申し訳ありません。応答を生成できませんでした。";
}
  const systemPrompt = `あなたはTotonosのAIアシスタントです。LINEを通じてユーザーと会話しています。
このシステムでは以下の機能を操作できます：
- 契約書の作成・管理
- CRM（リード管理、案件管理、活動記録）
- 会計（仕訳入力、試算表、財務諸表）
- 人事（従業員管理、勤怠管理、給与計算）
- Wiki（社内ナレッジベース）
- IT資産管理
- 請求書・見積書管理
- プロジェクト・タスク管理
- 発注書管理
- メール管理

ユーザーからの要望に応じて、適切なツールを使用してデータを作成・取得・更新してください。
ツールを使用してデータを操作した場合は、その結果をわかりやすく説明してください。
日本語で丁寧に回答してください。
LINEの文字数制限があるため、回答は簡潔にまとめてください（2000文字以内）。`;

  let result = await callLovableAI(messages, systemPrompt, allTools);
  const toolResults: Array<{ toolCallId: string; toolName: string; result: unknown; isError?: boolean }> = [];

  // Process tool calls
  if (result.toolCalls.length > 0) {
    console.log("Processing tool calls:", result.toolCalls.map((tc: ToolCall) => tc.name));
    
    for (const toolCall of result.toolCalls) {
      try {
        const toolResult = await executeToolCall(
          toolCall.name,
          toolCall.input as Record<string, unknown>,
          userId,
          supabaseAdmin
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

    // Send tool results back to AI
    if (toolResults.length > 0) {
      const messagesWithToolResults: Array<{ role: string; content: string }> = [
        ...messages,
        {
          role: "assistant",
          content: result.content || "",
        },
        {
          role: "user",
          content: `ツール実行結果:\n${toolResults.map(tr => 
            `${tr.toolName}: ${JSON.stringify(tr.result)}`
          ).join("\n")}`,
        },
      ];

      const finalResult = await callLovableAI(messagesWithToolResults, systemPrompt, allTools);
      result = finalResult;

      // Process additional tool calls (max 2 more rounds)
      let rounds = 0;
      while (result.toolCalls.length > 0 && rounds < 2) {
        rounds++;
        const additionalResults: typeof toolResults = [];
        
        for (const toolCall of result.toolCalls) {
          try {
            const toolResult = await executeToolCall(
              toolCall.name,
              toolCall.input as Record<string, unknown>,
              userId,
              supabaseAdmin
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

        const nextMessages: Array<{ role: string; content: string }> = [
          ...messagesWithToolResults,
          {
            role: "assistant",
            content: result.content || "",
          },
          {
            role: "user",
            content: `追加ツール実行結果:\n${additionalResults.map(tr => 
              `${tr.toolName}: ${JSON.stringify(tr.result)}`
            ).join("\n")}`,
          },
        ];

        const nextResult = await callLovableAI(nextMessages, systemPrompt, allTools);
        result = nextResult;

        if (result.toolCalls.length === 0) break;
      }
    }
  }

  return result.content;
}

// Split message into chunks
function splitMessage(text: string, maxLength: number): string[] {
  if (text.length <= maxLength) {
    return [text];
  }

  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= maxLength) {
      chunks.push(remaining);
      break;
    }

    // Find a good breaking point
    let breakPoint = remaining.lastIndexOf("\n", maxLength);
    if (breakPoint === -1 || breakPoint < maxLength / 2) {
      breakPoint = remaining.lastIndexOf("。", maxLength);
    }
    if (breakPoint === -1 || breakPoint < maxLength / 2) {
      breakPoint = remaining.lastIndexOf(" ", maxLength);
    }
    if (breakPoint === -1 || breakPoint < maxLength / 2) {
      breakPoint = maxLength;
    }

    chunks.push(remaining.substring(0, breakPoint + 1));
    remaining = remaining.substring(breakPoint + 1);
  }

  return chunks;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const LINE_CHANNEL_ACCESS_TOKEN = Deno.env.get("LINE_CHANNEL_ACCESS_TOKEN");
  const LINE_CHANNEL_SECRET = Deno.env.get("LINE_CHANNEL_SECRET");
  
  if (!LINE_CHANNEL_ACCESS_TOKEN || !LINE_CHANNEL_SECRET) {
    console.error("LINE credentials not configured");
    return new Response(
      JSON.stringify({ error: "LINE integration not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify LINE signature
    const signature = req.headers.get("x-line-signature");
    const bodyText = await req.text();

    if (signature) {
      const isValid = await verifyLineSignature(bodyText, signature, LINE_CHANNEL_SECRET);
      if (!isValid) {
        console.error("Invalid LINE signature");
        return new Response(
          JSON.stringify({ error: "Invalid signature" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const body: LineWebhookBody = JSON.parse(bodyText);
    console.log("Received LINE webhook:", JSON.stringify(body, null, 2));

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    for (const event of body.events) {
      if (event.type !== "message" || !event.message || event.message.type !== "text") {
        console.log("Skipping non-text event:", event.type);
        continue;
      }

      const lineUserId = event.source.userId;
      if (!lineUserId) {
        console.log("No userId in event");
        continue;
      }

      const userMessage = event.message.text;
      console.log(`Message from ${lineUserId}: ${userMessage}`);

      // Get or create LINE user record
      let { data: lineUser } = await supabaseAdmin
        .from("line_users")
        .select("*")
        .eq("line_user_id", lineUserId)
        .maybeSingle();

      if (!lineUser) {
        // Get LINE profile
        const profile = await getLineProfile(lineUserId, LINE_CHANNEL_ACCESS_TOKEN);
        
        const { data: newUser, error: insertError } = await supabaseAdmin
          .from("line_users")
          .insert({
            line_user_id: lineUserId,
            display_name: profile?.displayName,
            picture_url: profile?.pictureUrl,
            status_message: profile?.statusMessage,
          })
          .select()
          .single();

        if (insertError) {
          console.error("Failed to create LINE user:", insertError);
        } else {
          lineUser = newUser;
        }
      }

      // Check if user is linked to a system account
      const systemUserId = lineUser?.user_id;

      if (!systemUserId) {
        // User not linked - send linking instructions
        await replyMessage(
          event.replyToken!,
          [{
            type: "text",
            text: "Totonosとの連携がまだ完了していません。\n\nアプリにログイン後、設定画面からLINE連携を行ってください。\n\n連携用コード: " + lineUserId.substring(0, 8),
          }],
          LINE_CHANNEL_ACCESS_TOKEN
        );
        continue;
      }

      // Save user message to history
      await supabaseAdmin.from("line_chat_history").insert({
        line_user_id: lineUserId,
        user_id: systemUserId,
        role: "user",
        content: userMessage,
        reply_token: event.replyToken,
        message_id: event.message.id,
      });

      // Get recent chat history (last 10 messages)
      const { data: history } = await supabaseAdmin
        .from("line_chat_history")
        .select("role, content")
        .eq("line_user_id", lineUserId)
        .order("created_at", { ascending: false })
        .limit(10);

      const messages: Array<{ role: string; content: string }> = (history || [])
        .reverse()
        .map((h: { role: string; content: string }) => ({
          role: h.role,
          content: h.content,
        }));

      try {
        // Process with AI (using service role for tool execution)
        const aiResponse = await processChat(messages, systemUserId, supabaseAdmin);

        // Split long responses (LINE has 5000 char limit per message)
        const responseChunks = splitMessage(aiResponse, 4500);

        // Save assistant response
        await supabaseAdmin.from("line_chat_history").insert({
          line_user_id: lineUserId,
          user_id: systemUserId,
          role: "assistant",
          content: aiResponse,
        });

        // Reply with first chunk
        if (event.replyToken && responseChunks.length > 0) {
          await replyMessage(
            event.replyToken,
            [{ type: "text", text: responseChunks[0] }],
            LINE_CHANNEL_ACCESS_TOKEN
          );

          // Push remaining chunks
          for (let i = 1; i < responseChunks.length; i++) {
            await pushMessage(
              lineUserId,
              [{ type: "text", text: responseChunks[i] }],
              LINE_CHANNEL_ACCESS_TOKEN
            );
          }
        }
      } catch (error) {
        console.error("AI processing error:", error);
        await replyMessage(
          event.replyToken!,
          [{
            type: "text",
            text: "申し訳ありません。処理中にエラーが発生しました。しばらくしてからもう一度お試しください。",
          }],
          LINE_CHANNEL_ACCESS_TOKEN
        );
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
