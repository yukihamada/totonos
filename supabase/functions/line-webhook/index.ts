import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { consumeCompanyCredits, getCompanyIdForUser, CreditAction } from "../_shared/credits.ts";

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
    fileName?: string;
    fileSize?: number;
  };
}

interface LineWebhookBody {
  events: LineEvent[];
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

// Get content from LINE (image, file, etc.)
async function getLineContent(messageId: string, accessToken: string): Promise<ArrayBuffer | null> {
  try {
    const response = await fetch(`https://api-data.line.me/v2/bot/message/${messageId}/content`, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.error("Failed to get LINE content:", response.status);
      return null;
    }

    return response.arrayBuffer();
  } catch (error) {
    console.error("Error getting LINE content:", error);
    return null;
  }
}

// Convert ArrayBuffer to base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
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

// Call internal chat API for AI processing with tools and optional image
async function callChatAPIWithImage(
  messages: Array<{ role: string; content: string | unknown[] }>,
  supabaseUrl: string,
  serviceRoleKey: string,
  lineUserId: string,
  imageBase64?: string,
  imageType?: string,
  pdfBase64?: string
): Promise<string> {
  // Add LINE-specific system context
  const lineSystemMessage = {
    role: "system",
    content: `あなたはTotonosのAIアシスタントです。LINEを通じてユーザーと会話しています。
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
LINEの文字数制限があるため、回答は簡潔にまとめてください（2000文字以内）。

画像やPDFが送られた場合は、その内容を詳細に分析して説明してください。
- 請求書や見積書の場合：金額、日付、項目を抽出
- 名刺の場合：会社名、名前、連絡先を抽出
- 領収書の場合：日付、店名、金額を抽出
- その他のドキュメント：主要な情報を要約`
  };

  // Prepare messages with image if provided
  let apiMessages = [lineSystemMessage, ...messages];
  
  if (imageBase64 && imageType) {
    // Add image to the last user message
    const lastUserMsgIndex = apiMessages.findIndex((m, i) => 
      i === apiMessages.length - 1 || 
      (m.role === "user" && apiMessages[i + 1]?.role !== "user")
    );
    
    if (lastUserMsgIndex >= 0 && apiMessages[lastUserMsgIndex].role === "user") {
      const userContent = apiMessages[lastUserMsgIndex].content;
      apiMessages[lastUserMsgIndex] = {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: `data:${imageType};base64,${imageBase64}`,
            },
          },
          {
            type: "text",
            text: typeof userContent === "string" ? userContent : "この画像を分析してください。",
          },
        ],
      };
    }
  } else if (pdfBase64) {
    // For PDF, add instruction to analyze
    const lastUserMsgIndex = apiMessages.findIndex((m, i) => 
      i === apiMessages.length - 1 || 
      (m.role === "user" && apiMessages[i + 1]?.role !== "user")
    );
    
    if (lastUserMsgIndex >= 0 && apiMessages[lastUserMsgIndex].role === "user") {
      const userContent = apiMessages[lastUserMsgIndex].content;
      apiMessages[lastUserMsgIndex] = {
        role: "user",
        content: typeof userContent === "string" 
          ? `[PDFファイルを受信しました]\n${userContent}\n\nPDFの内容を分析して主要な情報を抽出してください。` 
          : "[PDFファイルを受信しました]\nこのPDFを分析してください。",
      };
    }
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${serviceRoleKey}`,
      "x-line-user-id": lineUserId,
    },
    body: JSON.stringify({ 
      messages: apiMessages
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Chat API error:", response.status, text);
    throw new Error(`Chat API error: ${response.status} - ${text}`);
  }

  // Check if response is streaming or JSON
  const contentType = response.headers.get("content-type") || "";
  
  if (contentType.includes("text/event-stream")) {
    // Handle streaming response - collect all content
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No response body");
    }
    
    let fullContent = "";
    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");
      
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          
          try {
            const parsed = JSON.parse(jsonStr);
            if (parsed.type === "content_block_delta" && parsed.delta?.text) {
              fullContent += parsed.delta.text;
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }
    
    return fullContent || "申し訳ありません。応答を生成できませんでした。";
  }

  const data = await response.json();
  return data.content || "申し訳ありません。応答を生成できませんでした。";
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

// Determine content type from message type
function getContentTypeFromMessageType(messageType: string, fileName?: string): string {
  if (messageType === "image") {
    return "image/jpeg"; // LINE images are typically JPEG
  }
  if (messageType === "file" && fileName) {
    const ext = fileName.toLowerCase().split(".").pop();
    if (ext === "pdf") return "application/pdf";
    if (ext === "png") return "image/png";
    if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
    if (ext === "gif") return "image/gif";
    if (ext === "webp") return "image/webp";
    if (ext === "csv") return "text/csv";
    if (ext === "xlsx") return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    if (ext === "xls") return "application/vnd.ms-excel";
  }
  return "application/octet-stream";
}

// Parse CSV content
function parseCSV(content: string): { headers: string[]; rows: string[][] } {
  const lines = content.split(/\r?\n/).filter(line => line.trim());
  if (lines.length === 0) return { headers: [], rows: [] };
  
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };
  
  const headers = parseCSVLine(lines[0]);
  const rows = lines.slice(1).map(line => parseCSVLine(line));
  
  return { headers, rows };
}

// Format spreadsheet data for AI analysis
function formatSpreadsheetForAI(data: { headers: string[]; rows: string[][] }, fileName: string): string {
  const { headers, rows } = data;
  const maxRows = 50; // Limit rows for AI processing
  const displayRows = rows.slice(0, maxRows);
  
  let formatted = `【ファイル: ${fileName}】\n`;
  formatted += `総行数: ${rows.length}行（ヘッダー除く）\n\n`;
  formatted += `■ ヘッダー:\n${headers.join(" | ")}\n\n`;
  formatted += `■ データ (${displayRows.length}件表示):\n`;
  
  displayRows.forEach((row, index) => {
    formatted += `${index + 1}. ${row.join(" | ")}\n`;
  });
  
  if (rows.length > maxRows) {
    formatted += `\n... 他 ${rows.length - maxRows} 件のデータがあります`;
  }
  
  return formatted;
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

    // Verify LINE signature - MANDATORY for security
    const signature = req.headers.get("x-line-signature");
    const bodyText = await req.text();

    if (!signature) {
      console.error("Missing LINE signature header");
      return new Response(
        JSON.stringify({ error: "Missing signature" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const isValid = await verifyLineSignature(bodyText, signature, LINE_CHANNEL_SECRET);
    if (!isValid) {
      console.error("Invalid LINE signature");
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: LineWebhookBody = JSON.parse(bodyText);
    console.log("Received LINE webhook:", JSON.stringify(body, null, 2));

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    for (const event of body.events) {
      if (event.type !== "message" || !event.message) {
        console.log("Skipping non-message event:", event.type);
        continue;
      }

      const messageType = event.message.type;
      const isTextMessage = messageType === "text";
      const isImageMessage = messageType === "image";
      const isFileMessage = messageType === "file";
      
      // Skip unsupported message types
      if (!isTextMessage && !isImageMessage && !isFileMessage) {
        console.log("Skipping unsupported message type:", messageType);
        continue;
      }

      const lineUserId = event.source.userId;
      if (!lineUserId) {
        console.log("No userId in event");
        continue;
      }

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

      // Get company ID for credit consumption
      const companyId = await getCompanyIdForUser(supabaseAdmin, systemUserId);

      // Handle image and file messages
      let imageBase64: string | undefined;
      let imageType: string | undefined;
      let pdfBase64: string | undefined;
      let userMessage = "";

      if (isTextMessage) {
        userMessage = event.message.text || "";
      } else if (isImageMessage) {
        // Download image from LINE
        const imageContent = await getLineContent(event.message.id, LINE_CHANNEL_ACCESS_TOKEN);
        if (imageContent) {
          imageBase64 = arrayBufferToBase64(imageContent);
          imageType = "image/jpeg";
          userMessage = "この画像を分析してください。";
          console.log(`Received image from ${lineUserId}, size: ${imageContent.byteLength} bytes`);
          
          // Consume credits for image analysis
          if (companyId) {
            const creditResult = await consumeCompanyCredits(
              supabaseAdmin, 
              companyId, 
              "ai_chat_image" as CreditAction, 
              "LINE画像解析"
            );
            if (!creditResult.success) {
              await replyMessage(
                event.replyToken!,
                [{
                  type: "text",
                  text: `クレジットが不足しています。画像解析には${3}クレジットが必要です。`,
                }],
                LINE_CHANNEL_ACCESS_TOKEN
              );
              continue;
            }
          }
        } else {
          await replyMessage(
            event.replyToken!,
            [{
              type: "text",
              text: "画像の取得に失敗しました。もう一度お試しください。",
            }],
            LINE_CHANNEL_ACCESS_TOKEN
          );
          continue;
        }
      } else if (isFileMessage) {
        const fileName = event.message.fileName || "";
        const contentType = getContentTypeFromMessageType("file", fileName);
        const isPdf = contentType === "application/pdf";
        const isImage = contentType.startsWith("image/");
        const isCsv = contentType === "text/csv";
        const isExcel = contentType.includes("spreadsheetml") || contentType.includes("ms-excel");
        const isSpreadsheet = isCsv || isExcel;

        if (!isPdf && !isImage && !isSpreadsheet) {
          await replyMessage(
            event.replyToken!,
            [{
              type: "text",
              text: "対応していないファイル形式です。画像（JPG, PNG）、PDF、CSV、またはExcelファイルを送信してください。",
            }],
            LINE_CHANNEL_ACCESS_TOKEN
          );
          continue;
        }

        // Download file from LINE
        const fileContent = await getLineContent(event.message.id, LINE_CHANNEL_ACCESS_TOKEN);
        if (fileContent) {
          if (isPdf) {
            pdfBase64 = arrayBufferToBase64(fileContent);
            userMessage = `ファイル「${fileName}」を受信しました。内容を分析してください。`;
            console.log(`Received PDF from ${lineUserId}, size: ${fileContent.byteLength} bytes`);
            
            // Consume credits for PDF analysis
            if (companyId) {
              const creditResult = await consumeCompanyCredits(
                supabaseAdmin, 
                companyId, 
                "ai_chat_pdf" as CreditAction, 
                "LINE PDF解析"
              );
              if (!creditResult.success) {
                await replyMessage(
                  event.replyToken!,
                  [{
                    type: "text",
                    text: `クレジットが不足しています。PDF解析には${5}クレジットが必要です。`,
                  }],
                  LINE_CHANNEL_ACCESS_TOKEN
                );
                continue;
              }
            }
          } else if (isSpreadsheet) {
            // Process CSV/Excel file
            console.log(`Received ${isCsv ? 'CSV' : 'Excel'} from ${lineUserId}, size: ${fileContent.byteLength} bytes`);
            
            if (isCsv) {
              // Decode CSV (try UTF-8, then Shift-JIS)
              let csvText: string;
              try {
                csvText = new TextDecoder("utf-8").decode(fileContent);
                // Check for garbled text (common with Shift-JIS encoded as UTF-8)
                if (csvText.includes("�")) {
                  throw new Error("UTF-8 decode failed");
                }
              } catch {
                // Try Shift-JIS for Japanese CSVs
                csvText = new TextDecoder("shift-jis").decode(fileContent);
              }
              const spreadsheetData = parseCSV(csvText);
              
              if (spreadsheetData.headers.length > 0) {
                // Format CSV for AI analysis
                userMessage = formatSpreadsheetForAI(spreadsheetData, fileName);
                userMessage += "\n\nこのCSVデータを分析してください。データの概要、重要なポイント、経費精算や仕訳登録が必要な場合はその提案をお願いします。";
              } else {
                userMessage = `CSVファイル「${fileName}」を受信しましたが、データが空か解析できませんでした。`;
              }
            } else {
              // For Excel, inform AI about the file
              userMessage = `Excelファイル「${fileName}」を受信しました。Excelファイルの解析にはWebアプリでのアップロードをお勧めします。CSVに変換して再送信いただければ、内容を詳細に分析できます。`;
            }
            
            // Consume credits for file analysis
            if (companyId) {
              const creditResult = await consumeCompanyCredits(
                supabaseAdmin, 
                companyId, 
                "ai_chat" as CreditAction, 
                `LINE ${isCsv ? 'CSV' : 'Excel'}ファイル解析`
              );
              if (!creditResult.success) {
                await replyMessage(
                  event.replyToken!,
                  [{
                    type: "text",
                    text: `クレジットが不足しています。ファイル解析にはクレジットが必要です。`,
                  }],
                  LINE_CHANNEL_ACCESS_TOKEN
                );
                continue;
              }
            }
          } else if (isImage) {
            imageBase64 = arrayBufferToBase64(fileContent);
            imageType = contentType;
            userMessage = `ファイル「${fileName}」を受信しました。内容を分析してください。`;
            console.log(`Received image file from ${lineUserId}, size: ${fileContent.byteLength} bytes`);
            
            // Consume credits for image analysis
            if (companyId) {
              const creditResult = await consumeCompanyCredits(
                supabaseAdmin, 
                companyId, 
                "ai_chat_image" as CreditAction, 
                "LINE画像解析"
              );
              if (!creditResult.success) {
                await replyMessage(
                  event.replyToken!,
                  [{
                    type: "text",
                    text: `クレジットが不足しています。画像解析には${3}クレジットが必要です。`,
                  }],
                  LINE_CHANNEL_ACCESS_TOKEN
                );
                continue;
              }
            }
          }
        } else {
          await replyMessage(
            event.replyToken!,
            [{
              type: "text",
              text: "ファイルの取得に失敗しました。もう一度お試しください。",
            }],
            LINE_CHANNEL_ACCESS_TOKEN
          );
          continue;
        }
      }

      console.log(`Message from ${lineUserId}: ${userMessage} (type: ${messageType})`);

      // Save user message to history
      await supabaseAdmin.from("line_chat_history").insert({
        line_user_id: lineUserId,
        user_id: systemUserId,
        role: "user",
        content: userMessage,
        reply_token: event.replyToken,
        message_id: event.message.id,
        message_type: messageType,
        has_attachment: !!imageBase64 || !!pdfBase64,
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
        // Process with AI via chat API (with image/PDF if provided)
        const aiResponse = await callChatAPIWithImage(
          messages, 
          supabaseUrl, 
          supabaseServiceRoleKey,
          lineUserId,
          imageBase64,
          imageType,
          pdfBase64
        );

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
