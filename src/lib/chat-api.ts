import { supabase } from "@/integrations/supabase/client";
import { ChatResponse, StreamChunk } from "@/types/chat";
import * as XLSX from "xlsx";

const CHAT_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

export interface AttachedFile {
  file: File;
  type: 'image' | 'pdf' | 'csv' | 'excel' | 'other';
  preview?: string;
}

export interface SendChatMessageOptions {
  messages: { role: string; content: string | unknown[] }[];
  signal?: AbortSignal;
  files?: AttachedFile[];
}

// Parse CSV file
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

// Parse Excel file
async function parseExcel(file: File): Promise<{ headers: string[]; rows: string[][] }> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  
  // Convert to array of arrays
  const data: string[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
  
  if (data.length === 0) return { headers: [], rows: [] };
  
  const headers = data[0].map(h => String(h));
  const rows = data.slice(1).map(row => row.map(cell => String(cell)));
  
  return { headers, rows };
}

// Format spreadsheet data for AI
function formatSpreadsheetForAI(data: { headers: string[]; rows: string[][] }, fileName: string): string {
  const { headers, rows } = data;
  const maxRows = 100; // Limit rows for AI processing
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

// Convert file to base64
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Process files and prepare message content
export async function processFilesForMessage(
  userMessage: string,
  files?: AttachedFile[]
): Promise<{ role: string; content: string | unknown[] }> {
  if (!files || files.length === 0) {
    return { role: "user", content: userMessage };
  }

  const contentParts: unknown[] = [];
  let textContent = userMessage;

  for (const attachedFile of files) {
    const { file, type } = attachedFile;

    if (type === 'image') {
      // Add image as base64
      const base64 = await fileToBase64(file);
      contentParts.push({
        type: "image_url",
        image_url: {
          url: `data:${file.type};base64,${base64}`,
        },
      });
    } else if (type === 'csv') {
      // Parse CSV and add as text
      const text = await file.text();
      const data = parseCSV(text);
      const formatted = formatSpreadsheetForAI(data, file.name);
      textContent += `\n\n${formatted}\n\nこのデータを分析してください。`;
    } else if (type === 'excel') {
      // Parse Excel and add as text
      try {
        const data = await parseExcel(file);
        const formatted = formatSpreadsheetForAI(data, file.name);
        textContent += `\n\n${formatted}\n\nこのデータを分析してください。`;
      } catch (error) {
        textContent += `\n\nExcelファイル「${file.name}」を受信しましたが、解析に失敗しました。`;
      }
    } else if (type === 'pdf') {
      // PDF - add instruction (actual parsing would need server-side)
      textContent += `\n\nPDFファイル「${file.name}」を受信しました。内容を分析してください。`;
      // For now, we can't easily parse PDFs on client side
      // The AI will handle this as best it can
    }
  }

  // If we have images, use multimodal format
  if (contentParts.length > 0) {
    contentParts.push({
      type: "text",
      text: textContent || "このファイルを分析してください。",
    });
    return { role: "user", content: contentParts };
  }

  // Text only
  return { role: "user", content: textContent };
}

export async function sendChatMessage({
  messages,
  signal,
}: SendChatMessageOptions): Promise<ChatResponse> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("認証が必要です");
  }

  const response = await fetch(CHAT_FUNCTION_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages }),
    signal,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `エラーが発生しました (${response.status})`);
  }

  return response.json();
}

export async function* streamChatMessage({
  messages,
  signal,
}: SendChatMessageOptions): AsyncGenerator<StreamChunk> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("認証が必要です");
  }

  const response = await fetch(CHAT_FUNCTION_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify({ messages, stream: true }),
    signal,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `エラーが発生しました (${response.status})`);
  }

  if (!response.body) {
    throw new Error("ストリームレスポンスが利用できません");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") {
            return;
          }
          try {
            const chunk = JSON.parse(data) as StreamChunk;
            yield chunk;
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
