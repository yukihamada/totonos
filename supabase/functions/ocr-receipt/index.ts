import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OCRResult {
  vendor: string | null;
  date: string | null;
  total: number | null;
  taxAmount: number | null;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  category: string | null;
  rawText: string;
  confidence: number;
}

interface RequestBody {
  imageBase64?: string;
  imageUrl?: string;
  source?: "upload" | "email" | "camera";
  sourceEmailId?: string;
  companyId?: string;
  saveToDb?: boolean;
  applyLegalTimestamp?: boolean;
}

// 電子帳簿保存法に準拠したハッシュ生成
async function generateLegalHash(imageData: string, timestamp: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(imageData + timestamp);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// 電子帳簿保存法の保存期間を計算（7年間）
function calculateRetentionDate(): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 7);
  return date.toISOString().split("T")[0];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // リクエストの形式を判定
    const contentType = req.headers.get("content-type") || "";
    let body: RequestBody;
    let userId: string | null = null;
    let imageBase64: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      // フォームデータ形式（既存の互換性維持）
      const authHeader = req.headers.get("Authorization");
      if (authHeader) {
        const token = authHeader.replace("Bearer ", "");
        const { data: { user } } = await supabaseClient.auth.getUser(token);
        userId = user?.id || null;
      }

      const formData = await req.formData();
      const imageFile = formData.get("image") as File;
      const organizationId = formData.get("organizationId") as string;

      if (!imageFile) {
        return new Response(JSON.stringify({ error: "No image provided" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const imageBuffer = await imageFile.arrayBuffer();
      imageBase64 = `data:${imageFile.type};base64,${btoa(String.fromCharCode(...new Uint8Array(imageBuffer)))}`;
      
      body = {
        source: "upload",
        companyId: organizationId,
        saveToDb: true,
      };
    } else {
      // JSON形式（新しいAPI）
      body = await req.json();
      
      const authHeader = req.headers.get("Authorization");
      if (authHeader) {
        const token = authHeader.replace("Bearer ", "");
        const { data: { user } } = await supabaseClient.auth.getUser(token);
        userId = user?.id || null;
      }

      imageBase64 = body.imageBase64 || null;
    }

    if (!imageBase64) {
      return new Response(JSON.stringify({ error: "No image provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Processing receipt OCR...");

    // Lovable AI Gateway を使用してOCR処理
    const projectId = Deno.env.get("LOVABLE_API_KEY") || Deno.env.get("SUPABASE_URL")?.split("//")[1]?.split(".")[0];
    
    const aiResponse = await fetch("https://ai-gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Project-Id": projectId || "",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{
          role: "user",
          content: [
            {
              type: "text",
              text: `このレシート/領収書画像から以下の情報を日本語で抽出してください。JSONのみで回答してください。

必要な情報:
- vendor: 店舗名/発行者名
- date: 日付（YYYY-MM-DD形式）
- total: 合計金額（数値のみ、円記号なし）
- taxAmount: 消費税額（数値のみ）
- items: 商品明細の配列（各項目: name, quantity, price）
- category: カテゴリ（交通費/飲食費/消耗品/通信費/その他から選択）

回答形式:
{
  "vendor": "店舗名",
  "date": "2024-01-15",
  "total": 1080,
  "taxAmount": 80,
  "items": [{"name": "商品名", "quantity": 1, "price": 1000}],
  "category": "飲食費"
}

読み取れない項目はnullにしてください。`
            },
            {
              type: "image_url",
              image_url: { url: imageBase64 }
            }
          ]
        }],
        response_format: { type: "json_object" },
        max_tokens: 2000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", errorText);
      throw new Error("AI処理に失敗しました");
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("AI応答が空です");
    }

    console.log("AI response:", content);

    let parsedResult: Partial<OCRResult>;
    try {
      parsedResult = JSON.parse(content);
    } catch {
      console.error("Failed to parse AI response:", content);
      parsedResult = {};
    }

    const result: OCRResult = {
      vendor: parsedResult.vendor || null,
      date: parsedResult.date || null,
      total: typeof parsedResult.total === "number" ? parsedResult.total : null,
      taxAmount: typeof parsedResult.taxAmount === "number" ? parsedResult.taxAmount : null,
      items: Array.isArray(parsedResult.items) ? parsedResult.items : [],
      category: parsedResult.category || null,
      rawText: content,
      confidence: calculateConfidence(parsedResult),
    };

    console.log("Parsed result:", result);

    // DBに保存
    let savedReceipt = null;
    if (body.saveToDb !== false) {
      const legalTimestamp = new Date().toISOString();
      const legalHash = body.applyLegalTimestamp 
        ? await generateLegalHash(imageBase64, legalTimestamp)
        : null;
      const retentionUntil = body.applyLegalTimestamp 
        ? calculateRetentionDate() 
        : null;

      const insertData: Record<string, any> = {
        user_id: userId || "00000000-0000-0000-0000-000000000000", // システムユーザー
        company_id: body.companyId || null,
        source: body.source || "upload",
        source_email_id: body.sourceEmailId || null,
        vendor: result.vendor,
        receipt_date: result.date,
        total_amount: result.total,
        tax_amount: result.taxAmount,
        items: result.items,
        category: result.category,
        raw_text: result.rawText,
        confidence: result.confidence,
        status: "processed",
      };

      // 電子帳簿保存法対応フィールド
      if (body.applyLegalTimestamp) {
        insertData.legal_timestamp = legalTimestamp;
        insertData.legal_hash = legalHash;
        insertData.legal_verified = true;
        insertData.retention_until = retentionUntil;
      }

      const { data: receipt, error: saveError } = await supabaseClient
        .from("receipts")
        .insert(insertData)
        .select()
        .single();

      if (saveError) {
        console.error("Save error:", saveError);
      } else {
        savedReceipt = receipt;
        console.log("Receipt saved:", receipt.id);
      }
    }

    return new Response(
      JSON.stringify({ 
        result,
        receipt: savedReceipt,
      }), 
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function calculateConfidence(parsed: Partial<OCRResult>): number {
  let confidence = 0;
  if (parsed.vendor) confidence += 0.2;
  if (parsed.date) confidence += 0.2;
  if (typeof parsed.total === "number") confidence += 0.3;
  if (Array.isArray(parsed.items) && parsed.items.length > 0) confidence += 0.2;
  if (parsed.category) confidence += 0.1;
  return Math.min(confidence, 1);
}