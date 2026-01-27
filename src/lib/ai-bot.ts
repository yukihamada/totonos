// AI Bot virtual user definition
// This represents the AI assistant "Minato" as a pseudo-user in the messenger

export const AI_BOT = {
  id: 'ai-assistant-minato',
  name: 'ミナト',
  displayName: 'ミナト (AI)',
  avatarUrl: null,
  isAI: true,
  mentionTrigger: '@ミナト'
} as const;

export type AIBotType = typeof AI_BOT;

// Check if a sender_id is the AI bot
export function isAIBot(senderId: string | null | undefined): boolean {
  return senderId === AI_BOT.id;
}

// Check if content contains AI mention
export function containsAIMention(content: string): boolean {
  return content.includes(AI_BOT.mentionTrigger) || content.includes('@ミナト');
}

// Get AI bot as a selectable member format
export function getAIBotAsMember() {
  return {
    user_id: AI_BOT.id,
    isAI: true,
    displayName: AI_BOT.displayName,
    name: AI_BOT.name
  };
}
