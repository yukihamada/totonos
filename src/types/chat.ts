// Chat Types for AI Assistant

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface ToolResult {
  toolCallId: string;
  toolName: string;
  result: unknown;
  isError?: boolean;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
  timestamp: Date;
  isStreaming?: boolean;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SendMessageRequest {
  messages: {
    role: MessageRole;
    content: string;
  }[];
  stream?: boolean;
}

export interface ChatResponse {
  id: string;
  role: 'assistant';
  content: string;
  toolCalls?: ToolCall[];
  stopReason?: 'end_turn' | 'tool_use' | 'max_tokens';
}

export interface StreamChunk {
  type: 'content_block_delta' | 'message_delta' | 'tool_use' | 'tool_result' | 'error';
  delta?: {
    type: 'text_delta';
    text: string;
  };
  toolCall?: ToolCall;
  error?: string;
}

// MCP Tool definitions
export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description?: string;
      enum?: string[];
    }>;
    required?: string[];
  };
}

// Available tool categories
export type ToolCategory =
  | 'contracts'
  | 'crm'
  | 'accounting'
  | 'hr'
  | 'wiki'
  | 'it_assets';

// Quick action suggestions
export interface QuickAction {
  id: string;
  label: string;
  prompt: string;
  category: ToolCategory;
  icon?: string;
}

export const QUICK_ACTIONS: QuickAction[] = [
  { id: 'list-contracts', label: '契約一覧', prompt: '契約書の一覧を見せてください', category: 'contracts' },
  { id: 'list-leads', label: 'リード一覧', prompt: 'リードの一覧を表示してください', category: 'crm' },
  { id: 'list-deals', label: '案件一覧', prompt: '現在の案件一覧を見せてください', category: 'crm' },
  { id: 'trial-balance', label: '試算表', prompt: '今月の試算表を出してください', category: 'accounting' },
  { id: 'list-employees', label: '従業員一覧', prompt: '従業員の一覧を表示してください', category: 'hr' },
  { id: 'search-wiki', label: 'Wiki検索', prompt: 'Wikiを検索したいです', category: 'wiki' },
];
