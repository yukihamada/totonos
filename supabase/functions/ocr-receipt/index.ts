import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
  rawText: string;
  confidence: number;
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

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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

    // Convert image to base64
    const imageBuffer = await imageFile.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));

    // Call Google Cloud Vision API
    const visionApiKey = Deno.env.get("GOOGLE_CLOUD_VISION_API_KEY");

    if (!visionApiKey) {
      // Fallback: Return mock data for development
      const mockResult: OCRResult = {
        vendor: "サンプル店舗",
        date: new Date().toISOString().split("T")[0],
        total: 1080,
        taxAmount: 80,
        items: [
          { name: "商品A", quantity: 1, price: 500 },
          { name: "商品B", quantity: 2, price: 250 },
        ],
        rawText: "サンプルレシート\n商品A 500円\n商品B x2 500円\n小計 1000円\n消費税 80円\n合計 1080円",
        confidence: 0.85,
      };

      return new Response(JSON.stringify(mockResult), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const visionResponse = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${visionApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: [
            {
              image: { content: base64Image },
              features: [
                { type: "TEXT_DETECTION" },
                { type: "DOCUMENT_TEXT_DETECTION" },
              ],
            },
          ],
        }),
      }
    );

    const visionData = await visionResponse.json();
    const textAnnotations = visionData.responses?.[0]?.textAnnotations;

    if (!textAnnotations || textAnnotations.length === 0) {
      return new Response(JSON.stringify({ error: "No text detected" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rawText = textAnnotations[0].description;

    // Parse receipt data from raw text
    const result = parseReceiptText(rawText);

    // Save to database
    const { data: receipt, error: saveError } = await supabaseClient
      .from("receipts")
      .insert({
        organization_id: organizationId,
        user_id: user.id,
        vendor: result.vendor,
        date: result.date,
        total: result.total,
        tax_amount: result.taxAmount,
        items: result.items,
        raw_text: rawText,
        confidence: result.confidence,
        status: "pending",
      })
      .select()
      .single();

    if (saveError) {
      console.error("Save error:", saveError);
    }

    return new Response(JSON.stringify({ ...result, id: receipt?.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function parseReceiptText(text: string): OCRResult {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

  // Extract vendor (usually first line)
  const vendor = lines[0] || null;

  // Extract date (look for common date patterns)
  let date: string | null = null;
  const datePatterns = [
    /(\d{4})[\/\-年](\d{1,2})[\/\-月](\d{1,2})/,
    /(\d{1,2})[\/\-月](\d{1,2})[\/\-日]/,
  ];

  for (const line of lines) {
    for (const pattern of datePatterns) {
      const match = line.match(pattern);
      if (match) {
        if (match.length === 4) {
          date = `${match[1]}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}`;
        }
        break;
      }
    }
    if (date) break;
  }

  // Extract total (look for 合計, 計, total patterns)
  let total: number | null = null;
  let taxAmount: number | null = null;

  const totalPatterns = [
    /合計[:\s]*[¥￥]?([0-9,]+)/,
    /計[:\s]*[¥￥]?([0-9,]+)/,
    /TOTAL[:\s]*[¥￥]?([0-9,]+)/i,
  ];

  const taxPatterns = [
    /消費税[:\s]*[¥￥]?([0-9,]+)/,
    /税[:\s]*[¥￥]?([0-9,]+)/,
    /TAX[:\s]*[¥￥]?([0-9,]+)/i,
  ];

  for (const line of lines) {
    for (const pattern of totalPatterns) {
      const match = line.match(pattern);
      if (match) {
        total = parseInt(match[1].replace(/,/g, ""), 10);
        break;
      }
    }
    for (const pattern of taxPatterns) {
      const match = line.match(pattern);
      if (match) {
        taxAmount = parseInt(match[1].replace(/,/g, ""), 10);
        break;
      }
    }
  }

  // Extract items (basic pattern matching)
  const items: Array<{ name: string; quantity: number; price: number }> = [];
  const itemPattern = /(.+?)\s*[xX×]?\s*(\d+)?\s*[¥￥]?([0-9,]+)円?$/;

  for (const line of lines) {
    const match = line.match(itemPattern);
    if (match && !line.includes("合計") && !line.includes("小計") && !line.includes("税")) {
      const name = match[1].trim();
      const quantity = match[2] ? parseInt(match[2], 10) : 1;
      const price = parseInt(match[3].replace(/,/g, ""), 10);

      if (name && price > 0 && price < 1000000) {
        items.push({ name, quantity, price });
      }
    }
  }

  // Calculate confidence based on extracted data
  let confidence = 0;
  if (vendor) confidence += 0.2;
  if (date) confidence += 0.2;
  if (total) confidence += 0.3;
  if (items.length > 0) confidence += 0.3;

  return {
    vendor,
    date,
    total,
    taxAmount,
    items,
    rawText: text,
    confidence,
  };
}
