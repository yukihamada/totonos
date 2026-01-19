import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DeliveryNoteItem {
  jan_code: string | null;
  product_name: string;
  quantity: number;
  unit_price: number | null;
  amount: number | null;
}

interface OCRResult {
  delivery_note_number: string | null;
  supplier_name: string | null;
  delivery_date: string | null;
  items: DeliveryNoteItem[];
  subtotal: number | null;
  tax_amount: number | null;
  total_amount: number | null;
  raw_text: string;
  confidence: number;
}

interface RequestBody {
  imageBase64?: string;
  purchaseOrderId?: string;
  supplierId?: string;
  companyId?: string;
  saveToDb?: boolean;
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

    const body: RequestBody = await req.json();
    
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabaseClient.auth.getUser(token);
      userId = user?.id || null;
    }

    if (!body.imageBase64) {
      return new Response(JSON.stringify({ error: "No image provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Processing delivery note OCR...");

    // Use Lovable AI Gateway
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
              text: `この納品書画像から以下の情報を日本語で抽出してください。JSONのみで回答してください。

必要な情報:
- delivery_note_number: 納品書番号
- supplier_name: 仕入先/発行者名
- delivery_date: 納品日（YYYY-MM-DD形式）
- items: 商品明細の配列（各項目: jan_code, product_name, quantity, unit_price, amount）
  - jan_code: JANコード/バーコード（8桁または13桁の数字、なければnull）
  - product_name: 商品名
  - quantity: 数量（数値のみ）
  - unit_price: 単価（数値のみ）
  - amount: 金額（数値のみ）
- subtotal: 小計（数値のみ）
- tax_amount: 消費税額（数値のみ）
- total_amount: 合計金額（数値のみ）

回答形式:
{
  "delivery_note_number": "DN-2024-001",
  "supplier_name": "株式会社サンプル",
  "delivery_date": "2024-01-15",
  "items": [
    {"jan_code": "4901234567890", "product_name": "商品A", "quantity": 10, "unit_price": 100, "amount": 1000}
  ],
  "subtotal": 1000,
  "tax_amount": 100,
  "total_amount": 1100
}

読み取れない項目はnullにしてください。JANコードは数字のみで、チェックディジットを含む8桁または13桁の形式です。`
            },
            {
              type: "image_url",
              image_url: { url: body.imageBase64 }
            }
          ]
        }],
        response_format: { type: "json_object" },
        max_tokens: 4000,
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
      delivery_note_number: parsedResult.delivery_note_number || null,
      supplier_name: parsedResult.supplier_name || null,
      delivery_date: parsedResult.delivery_date || null,
      items: Array.isArray(parsedResult.items) ? parsedResult.items.map(item => ({
        jan_code: item.jan_code || null,
        product_name: item.product_name || "不明",
        quantity: typeof item.quantity === "number" ? item.quantity : 0,
        unit_price: typeof item.unit_price === "number" ? item.unit_price : null,
        amount: typeof item.amount === "number" ? item.amount : null,
      })) : [],
      subtotal: typeof parsedResult.subtotal === "number" ? parsedResult.subtotal : null,
      tax_amount: typeof parsedResult.tax_amount === "number" ? parsedResult.tax_amount : null,
      total_amount: typeof parsedResult.total_amount === "number" ? parsedResult.total_amount : null,
      raw_text: content,
      confidence: calculateConfidence(parsedResult),
    };

    console.log("Parsed result:", result);

    // Save to DB if requested
    let savedDeliveryNote = null;
    let savedItems: unknown[] = [];
    
    if (body.saveToDb !== false && userId) {
      // Create delivery note
      const { data: deliveryNote, error: noteError } = await supabaseClient
        .from("delivery_notes")
        .insert({
          user_id: userId,
          company_id: body.companyId || null,
          delivery_note_number: result.delivery_note_number,
          supplier_id: body.supplierId || null,
          supplier_name: result.supplier_name,
          purchase_order_id: body.purchaseOrderId || null,
          delivery_date: result.delivery_date || new Date().toISOString().split("T")[0],
          subtotal: result.subtotal,
          tax_amount: result.tax_amount,
          total_amount: result.total_amount,
          ocr_result: result,
          ocr_processed_at: new Date().toISOString(),
          status: "review",
        })
        .select()
        .single();

      if (noteError) {
        console.error("Save delivery note error:", noteError);
        throw new Error("納品書の保存に失敗しました");
      }

      savedDeliveryNote = deliveryNote;
      console.log("Delivery note saved:", deliveryNote.id);

      // Match products by JAN code and create items
      if (result.items.length > 0) {
        const itemsToInsert = [];
        
        for (const item of result.items) {
          let productId = null;
          let matchConfidence = 0;
          
          // Try to match by JAN code
          if (item.jan_code) {
            const { data: products } = await supabaseClient
              .from("products")
              .select("id")
              .eq("user_id", userId)
              .eq("jan_code", item.jan_code)
              .limit(1);
            
            if (products && products.length > 0) {
              productId = products[0].id;
              matchConfidence = 1.0;
            }
          }
          
          // Try to match by product name if no JAN match
          if (!productId && item.product_name) {
            const { data: products } = await supabaseClient
              .from("products")
              .select("id, name")
              .eq("user_id", userId)
              .ilike("name", `%${item.product_name}%`)
              .limit(1);
            
            if (products && products.length > 0) {
              productId = products[0].id;
              matchConfidence = 0.7;
            }
          }
          
          itemsToInsert.push({
            delivery_note_id: deliveryNote.id,
            product_id: productId,
            jan_code: item.jan_code,
            product_name: item.product_name,
            quantity: item.quantity,
            unit_price: item.unit_price,
            amount: item.amount,
            is_matched: productId !== null,
            match_confidence: matchConfidence,
          });
        }

        const { data: insertedItems, error: itemsError } = await supabaseClient
          .from("delivery_note_items")
          .insert(itemsToInsert)
          .select();

        if (itemsError) {
          console.error("Save items error:", itemsError);
        } else {
          savedItems = insertedItems || [];
          console.log(`${savedItems.length} items saved`);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        result,
        deliveryNote: savedDeliveryNote,
        items: savedItems,
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
  if (parsed.supplier_name) confidence += 0.15;
  if (parsed.delivery_date) confidence += 0.15;
  if (parsed.delivery_note_number) confidence += 0.1;
  if (typeof parsed.total_amount === "number") confidence += 0.2;
  if (Array.isArray(parsed.items) && parsed.items.length > 0) {
    confidence += 0.3;
    // Bonus for items with JAN codes
    const itemsWithJan = parsed.items.filter(i => i.jan_code).length;
    confidence += Math.min(itemsWithJan / parsed.items.length * 0.1, 0.1);
  }
  return Math.min(confidence, 1);
}
