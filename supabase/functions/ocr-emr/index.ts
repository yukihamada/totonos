import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PatientOCRResult {
  name: string | null;
  name_kana: string | null;
  birth_date: string | null;
  gender: "male" | "female" | "other" | null;
  insurance_type: string | null;
  insurance_number: string | null;
  phone: string | null;
  address: string | null;
  allergies: string[];
  notes: string | null;
  confidence: number;
}

interface MedicalRecordOCRResult {
  record_date: string | null;
  subjective: string | null;
  objective: string | null;
  assessment: string | null;
  plan: string | null;
  vital_signs: {
    blood_pressure?: string;
    pulse?: number;
    temperature?: number;
    spo2?: number;
    weight?: number;
    height?: number;
  };
  prescriptions: Array<{
    medicine_name: string;
    dosage: string;
    frequency: string;
    days: number;
  }>;
  confidence: number;
}

interface RequestBody {
  imageBase64: string;
  type: "patient" | "record";
  patientId?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "認証が必要です" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "認証に失敗しました" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: RequestBody = await req.json();
    const { imageBase64, type, patientId } = body;

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "画像データが必要です" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build prompt based on type
    const prompt = type === "patient" 
      ? buildPatientPrompt()
      : buildRecordPrompt();

    // Call AI Gateway
    const response = await fetch("https://ai-gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", errorText);
      return new Response(
        JSON.stringify({ error: "OCR処理に失敗しました" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: "OCR結果を取得できませんでした" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse JSON response
    let result;
    try {
      result = JSON.parse(content);
    } catch {
      // Try to extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Invalid JSON response");
      }
    }

    // Calculate confidence
    const confidence = type === "patient"
      ? calculatePatientConfidence(result)
      : calculateRecordConfidence(result);

    return new Response(
      JSON.stringify({
        type,
        result: { ...result, confidence },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("OCR error:", err);
    const errorMessage = err instanceof Error ? err.message : "OCR処理中にエラーが発生しました";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function buildPatientPrompt(): string {
  return `あなたは医療書類のOCR専門AIです。
この画像は患者登録用の書類（問診票、保険証、紹介状など）です。
以下の情報を抽出してJSON形式で返してください。

抽出項目:
- name: 患者氏名（漢字）
- name_kana: フリガナ（カタカナ）
- birth_date: 生年月日（YYYY-MM-DD形式）
- gender: 性別（"male", "female", "other"のいずれか）
- insurance_type: 保険種別（"national_health"=国保, "employee_health"=社保, "late_elderly"=後期高齢, "welfare"=生保, "self_pay"=自費）
- insurance_number: 保険証番号
- phone: 電話番号
- address: 住所
- allergies: アレルギー情報（配列）
- notes: その他特記事項

注意:
- 読み取れない項目はnullにしてください
- 日付は必ずYYYY-MM-DD形式に変換してください
- 電話番号はハイフン付きで統一してください

JSON形式で出力:`;
}

function buildRecordPrompt(): string {
  return `あなたは医療カルテのOCR専門AIです。
この画像は診療記録・カルテです。
以下の情報を抽出してSOAP形式のJSON形式で返してください。

抽出項目:
- record_date: 診療日（YYYY-MM-DD形式）
- subjective: S（主観的情報）- 患者の訴え、症状
- objective: O（客観的情報）- 診察所見、バイタルサイン、検査結果
- assessment: A（評価）- 診断名、病態評価
- plan: P（計画）- 治療方針、処方、次回予定
- vital_signs: バイタルサイン（オブジェクト）
  - blood_pressure: 血圧（例: "120/80"）
  - pulse: 脈拍（数値）
  - temperature: 体温（数値）
  - spo2: SpO2（数値）
  - weight: 体重（数値）
  - height: 身長（数値）
- prescriptions: 処方薬（配列）
  - medicine_name: 薬品名
  - dosage: 用量
  - frequency: 用法
  - days: 日数

注意:
- 読み取れない項目はnullにしてください
- 日付は必ずYYYY-MM-DD形式に変換してください
- 手書きの場合は読み取れる範囲で抽出してください

JSON形式で出力:`;
}

function calculatePatientConfidence(result: Partial<PatientOCRResult>): number {
  let score = 0;
  let total = 0;
  
  const fields = ['name', 'name_kana', 'birth_date', 'gender', 'insurance_type', 'phone', 'address'];
  
  for (const field of fields) {
    total += 1;
    if (result[field as keyof PatientOCRResult]) {
      score += 1;
    }
  }
  
  return Math.round((score / total) * 100) / 100;
}

function calculateRecordConfidence(result: Partial<MedicalRecordOCRResult>): number {
  let score = 0;
  let total = 0;
  
  const fields = ['record_date', 'subjective', 'objective', 'assessment', 'plan'];
  
  for (const field of fields) {
    total += 1;
    if (result[field as keyof MedicalRecordOCRResult]) {
      score += 1;
    }
  }
  
  return Math.round((score / total) * 100) / 100;
}
