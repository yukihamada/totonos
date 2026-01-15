// AI Settings Types

export type AIProvider = 'lovable' | 'openai' | 'anthropic';

export interface AIModelOption {
  id: string;
  name: string;
  description: string;
  recommended?: boolean;
}

export const LOVABLE_MODELS: AIModelOption[] = [
  { id: 'google/gemini-3-flash-preview', name: 'Gemini 3 Flash Preview', description: '高速・推奨', recommended: true },
  { id: 'google/gemini-3-pro-preview', name: 'Gemini 3 Pro Preview', description: '次世代高精度' },
  { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'バランス型' },
  { id: 'google/gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite', description: '最速・低コスト' },
  { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: '高精度マルチモーダル' },
  { id: 'google/gemini-3-pro-image-preview', name: 'Gemini 3 Pro Image', description: '画像生成' },
  { id: 'openai/gpt-5', name: 'GPT-5', description: '最高精度' },
  { id: 'openai/gpt-5-mini', name: 'GPT-5 Mini', description: 'コスト効率' },
  { id: 'openai/gpt-5-nano', name: 'GPT-5 Nano', description: '高速・軽量' },
  { id: 'openai/gpt-5.2', name: 'GPT-5.2', description: '最新・推論強化' },
];

export const OPENAI_MODELS: AIModelOption[] = [
  { id: 'gpt-4o', name: 'GPT-4o', description: '最新モデル', recommended: true },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: '高性能' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'コスト効率' },
];

export const ANTHROPIC_MODELS: AIModelOption[] = [
  { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', description: '最新モデル', recommended: true },
  { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', description: 'バランス型' },
  { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', description: '高速' },
];

export interface AISettings {
  id?: string;
  user_id: string;
  provider: AIProvider;
  model: string;
  custom_api_key?: string;
  created_at?: string;
  updated_at?: string;
}

export const DEFAULT_AI_SETTINGS: Omit<AISettings, 'user_id'> = {
  provider: 'lovable',
  model: 'google/gemini-3-flash-preview',
};
