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
  | 'clients'
  | 'accounting'
  | 'hr'
  | 'wiki'
  | 'it_assets'
  | 'invoices'
  | 'estimates'
  | 'projects'
  | 'purchase_orders'
  | 'emails';

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
  { id: 'list-invoices', label: '請求書一覧', prompt: '請求書の一覧を見せてください', category: 'invoices' },
  { id: 'list-estimates', label: '見積書一覧', prompt: '見積書の一覧を表示してください', category: 'estimates' },
  { id: 'list-leads', label: 'リード一覧', prompt: 'リードの一覧を表示してください', category: 'crm' },
  { id: 'list-clients', label: '取引先一覧', prompt: '取引先の一覧を見せてください', category: 'clients' },
  { id: 'list-deals', label: '案件一覧', prompt: '現在の案件一覧を見せてください', category: 'crm' },
  { id: 'list-projects', label: 'プロジェクト一覧', prompt: 'プロジェクトの一覧を表示してください', category: 'projects' },
  { id: 'list-tasks', label: 'タスク一覧', prompt: '未完了のタスクを見せてください', category: 'projects' },
  { id: 'trial-balance', label: '試算表', prompt: '今月の試算表を出してください', category: 'accounting' },
  { id: 'list-employees', label: '従業員一覧', prompt: '従業員の一覧を表示してください', category: 'hr' },
  { id: 'list-emails', label: '未読メール', prompt: '未読のメールを見せてください', category: 'emails' },
  { id: 'search-wiki', label: 'Wiki検索', prompt: 'Wikiを検索したいです', category: 'wiki' },
  { id: 'list-assets', label: 'IT資産一覧', prompt: 'IT資産の一覧を表示してください', category: 'it_assets' },
  { id: 'list-po', label: '発注書一覧', prompt: '発注書の一覧を見せてください', category: 'purchase_orders' },
];
