import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { consumeCompanyCredits, getCompanyIdForUser } from "../_shared/credits.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// AI Bot constants - must match frontend src/lib/ai-bot.ts
const AI_BOT = {
  id: 'ai-assistant-minato',
  name: 'ミナト',
  displayName: 'ミナト (AI)',
};

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

// Call Lovable AI Gateway
async function callLovableAI(
  messages: Array<{ role: string; content: string }>,
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
      model: "google/gemini-3-flash-preview",
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
      throw new Error("Payment required. Please add credits.");
    }
    const text = await response.text();
    console.error("Lovable AI error:", response.status, text);
    throw new Error("AI gateway error");
  }

  const data = await response.json();
  const choice = data.choices?.[0];
  const message = choice?.message;

  interface ToolCallResponse {
    id: string;
    function: {
      name: string;
      arguments: string;
    };
  }

  if (message?.tool_calls && message.tool_calls.length > 0) {
    const toolCalls = message.tool_calls.map((tc: ToolCallResponse) => ({
      id: tc.id,
      name: tc.function.name,
      input: JSON.parse(tc.function.arguments || "{}"),
    }));

    return {
      content: message.content || "",
      toolCalls,
    };
  }

  return {
    content: message?.content || "",
    toolCalls: [] as Array<{ id: string; name: string; input: unknown }>,
  };
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    // Verify user authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "認証が必要です" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "認証が無効です" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = user.id;
    const { conversationId, message } = await req.json();

    if (!conversationId || !message) {
      return new Response(
        JSON.stringify({ error: "conversationId and message are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user is participant of conversation
    const { data: participant } = await supabaseAdmin
      .from("conversation_participants")
      .select("id")
      .eq("conversation_id", conversationId)
      .eq("user_id", userId)
      .maybeSingle();

    if (!participant) {
      return new Response(
        JSON.stringify({ error: "この会話へのアクセス権がありません" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Consume credits
    const companyId = await getCompanyIdForUser(supabaseAdmin, userId);
    if (companyId) {
      const creditResult = await consumeCompanyCredits(supabaseAdmin, companyId, "ai_chat", "メッセンジャーAI");
      if (!creditResult.success) {
        // Insert error as system message
        await supabaseAdmin.from("messages").insert({
          conversation_id: conversationId,
          sender_id: AI_BOT.id,
          content: `⚠️ ${creditResult.error}`,
          message_type: "system",
          is_ai_message: true,
        });
        return new Response(
          JSON.stringify({ error: creditResult.error }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Get conversation history (last 20 messages for context)
    const { data: historyMessages } = await supabaseAdmin
      .from("messages")
      .select("sender_id, content, is_ai_message, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(20);

    // Get sender profiles for context
    const senderIds = [...new Set(historyMessages?.map(m => m.sender_id) || [])].filter(id => id !== AI_BOT.id);
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("user_id, display_name")
      .in("user_id", senderIds);

    const profileMap = new Map(profiles?.map(p => [p.user_id, p.display_name]) || []);

    // Build messages array for AI
    const aiMessages: Array<{ role: string; content: string }> = [];
    
    for (const msg of historyMessages || []) {
      if (msg.is_ai_message) {
        aiMessages.push({ role: "assistant", content: msg.content });
      } else {
        const senderName = profileMap.get(msg.sender_id) || "ユーザー";
        aiMessages.push({ role: "user", content: `[${senderName}]: ${msg.content}` });
      }
    }

    // System prompt for messenger context
    const systemPrompt = `あなたはTotonosのAIアシスタント「ミナト」です。チームメッセンジャー内で呼び出されています。

【コンテキスト】
- チームメンバーとの会話の中で @ミナト でメンションされました
- 会話の流れを理解し、適切に応答してください
- 他のメンバーも会話を見ている可能性があります

【対応可能な機能】
- 契約書の作成・管理
- CRM（リード管理、案件管理）
- 会計（仕訳入力、経費精算）
- 人事（従業員管理、勤怠）
- 請求書・見積書管理
- プロジェクト・タスク管理
- その他業務支援

【重要なルール】
1. 簡潔に回答してください（メッセンジャー形式）
2. ツール実行時は結果を分かりやすく報告
3. 削除操作は必ず確認を取る
4. フレンドリーかつプロフェッショナルに

日本語で丁寧に回答してください。`;

    // Call AI (simplified - no tool execution for now)
    const result = await callLovableAI(aiMessages, systemPrompt, []);
    
    // Final response content
    const finalContent = result.content || "処理が完了しました。";

    // Save AI response as message
    const { error: insertError } = await supabaseAdmin.from("messages").insert({
      conversation_id: conversationId,
      sender_id: AI_BOT.id,
      content: finalContent,
      message_type: "text",
      is_ai_message: true,
    });

    if (insertError) {
      console.error("Failed to save AI message:", insertError);
      throw new Error("Failed to save AI response");
    }

    // Update conversation to mark AI inclusion
    await supabaseAdmin
      .from("conversations")
      .update({ includes_ai: true, updated_at: new Date().toISOString() })
      .eq("id", conversationId);

    return new Response(
      JSON.stringify({ success: true, content: finalContent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Messenger AI error:", error);
    
    // Try to save error as system message
    try {
      const { conversationId } = await req.clone().json();
      if (conversationId) {
        await supabaseAdmin.from("messages").insert({
          conversation_id: conversationId,
          sender_id: AI_BOT.id,
          content: `⚠️ エラーが発生しました: ${error instanceof Error ? error.message : "Unknown error"}`,
          message_type: "system",
          is_ai_message: true,
        });
      }
    } catch {
      // Ignore if we can't save error message
    }

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
