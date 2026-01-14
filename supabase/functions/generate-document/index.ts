import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { 
  consumeCompanyCredits, 
  getCompanyIdForUser,
  CREDIT_COSTS 
} from "../_shared/credits.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GenerateDocumentRequest {
  documentType: "contract" | "estimate" | "invoice" | "purchase_order";
  prompt: string;
  existingData?: Record<string, unknown>;
  clientInfo?: { id: string; name: string };
  mode: "create" | "edit";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "認証が必要です" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "認証に失敗しました" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get company ID
    const companyId = await getCompanyIdForUser(supabase, user.id);
    if (!companyId) {
      return new Response(JSON.stringify({ error: "企業情報が見つかりません" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Consume credits
    const creditResult = await consumeCompanyCredits(
      supabase,
      companyId,
      "ai_document_generate",
      "AI文書生成"
    );

    if (!creditResult.success) {
      return new Response(JSON.stringify({ error: creditResult.error }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { documentType, prompt, existingData, clientInfo, mode } = await req.json() as GenerateDocumentRequest;

    // Validate prompt length
    if (prompt.length > 2000) {
      return new Response(JSON.stringify({ error: "プロンプトは2000文字以内で入力してください" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build system prompt based on document type
    const systemPrompts: Record<string, string> = {
      contract: `あなたは契約書作成のエキスパートです。ユーザーの指示に基づいて、日本の商慣習に沿った契約書データを生成してください。
必ず generate_contract ツールを使用して構造化されたデータを返してください。`,
      estimate: `あなたは見積書作成のエキスパートです。ユーザーの指示に基づいて、適切な見積書データを生成してください。
必ず generate_estimate ツールを使用して構造化されたデータを返してください。`,
      invoice: `あなたは請求書作成のエキスパートです。ユーザーの指示に基づいて、適切な請求書データを生成してください。
必ず generate_invoice ツールを使用して構造化されたデータを返してください。`,
      purchase_order: `あなたは発注書作成のエキスパートです。ユーザーの指示に基づいて、適切な発注書データを生成してください。
必ず generate_purchase_order ツールを使用して構造化されたデータを返してください。`,
    };

    // Build user prompt
    let userPrompt = `【指示】\n${prompt}\n`;
    
    if (clientInfo) {
      userPrompt += `\n【取引先情報】\n名前: ${clientInfo.name}\nID: ${clientInfo.id}\n`;
    }
    
    if (mode === "edit" && existingData) {
      userPrompt += `\n【既存データ（編集対象）】\n${JSON.stringify(existingData, null, 2)}\n`;
      userPrompt += "\n上記の既存データを参考に、指示に従って必要な部分を修正・追加してください。";
    }

    // Define tools based on document type
    const tools = getToolsForDocumentType(documentType);

    // Call Lovable AI Gateway
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompts[documentType] },
          { role: "user", content: userPrompt },
        ],
        tools,
        tool_choice: { type: "function", function: { name: getToolName(documentType) } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "レート制限に達しました。しばらく待ってから再試行してください。" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "AI生成に失敗しました" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = await response.json();
    
    // Extract tool call result
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      console.error("No tool call in response:", aiResponse);
      return new Response(JSON.stringify({ error: "AIからの応答を解析できませんでした" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const generatedData = JSON.parse(toolCall.function.arguments);
    
    console.log(`Document generated for ${documentType}:`, generatedData);

    return new Response(JSON.stringify({ 
      success: true, 
      data: generatedData,
      creditsUsed: CREDIT_COSTS.ai_document_generate.cost,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("generate-document error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function getToolName(documentType: string): string {
  const names: Record<string, string> = {
    contract: "generate_contract",
    estimate: "generate_estimate",
    invoice: "generate_invoice",
    purchase_order: "generate_purchase_order",
  };
  return names[documentType];
}

function getToolsForDocumentType(documentType: string) {
  const baseItemProperties = {
    description: { type: "string", description: "品目・項目の説明" },
    quantity: { type: "number", description: "数量" },
    unit_price: { type: "number", description: "単価（円）" },
  };

  const contractItemProperties = {
    title: { type: "string", description: "条項タイトル（例: 目的、委託業務、報酬）" },
    content: { type: "string", description: "条項の内容" },
  };

  const tools: Record<string, object[]> = {
    contract: [
      {
        type: "function",
        function: {
          name: "generate_contract",
          description: "契約書データを生成する",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string", description: "契約書タイトル" },
              client_id: { type: "string", description: "取引先ID（指定された場合）" },
              content: { type: "string", description: "契約概要・前文" },
              amount: { type: "number", description: "契約金額（税抜、円）" },
              valid_until: { type: "string", description: "有効期限（YYYY-MM-DD形式）" },
              items: {
                type: "array",
                description: "契約条項リスト",
                items: {
                  type: "object",
                  properties: contractItemProperties,
                  required: ["title", "content"],
                },
              },
            },
            required: ["title", "items"],
          },
        },
      },
    ],
    estimate: [
      {
        type: "function",
        function: {
          name: "generate_estimate",
          description: "見積書データを生成する",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string", description: "見積書タイトル" },
              client_id: { type: "string", description: "取引先ID（指定された場合）" },
              description: { type: "string", description: "備考・見積条件" },
              valid_until: { type: "string", description: "有効期限（YYYY-MM-DD形式）" },
              items: {
                type: "array",
                description: "明細項目リスト",
                items: {
                  type: "object",
                  properties: baseItemProperties,
                  required: ["description", "quantity", "unit_price"],
                },
              },
            },
            required: ["title", "valid_until", "items"],
          },
        },
      },
    ],
    invoice: [
      {
        type: "function",
        function: {
          name: "generate_invoice",
          description: "請求書データを生成する",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string", description: "請求書タイトル" },
              client_id: { type: "string", description: "取引先ID（指定された場合）" },
              description: { type: "string", description: "備考" },
              due_date: { type: "string", description: "支払期限（YYYY-MM-DD形式）" },
              items: {
                type: "array",
                description: "明細項目リスト",
                items: {
                  type: "object",
                  properties: baseItemProperties,
                  required: ["description", "quantity", "unit_price"],
                },
              },
            },
            required: ["title", "due_date", "items"],
          },
        },
      },
    ],
    purchase_order: [
      {
        type: "function",
        function: {
          name: "generate_purchase_order",
          description: "発注書データを生成する",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string", description: "発注書タイトル" },
              client_id: { type: "string", description: "発注先ID（指定された場合）" },
              description: { type: "string", description: "備考・発注条件" },
              delivery_date: { type: "string", description: "納品希望日（YYYY-MM-DD形式）" },
              items: {
                type: "array",
                description: "明細項目リスト",
                items: {
                  type: "object",
                  properties: baseItemProperties,
                  required: ["description", "quantity", "unit_price"],
                },
              },
            },
            required: ["title", "items"],
          },
        },
      },
    ],
  };

  return tools[documentType];
}
