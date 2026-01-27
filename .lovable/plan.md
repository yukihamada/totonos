
# メッセンジャーAI統合 - 残り実装プラン

## 概要

前回完了した部分（DB変更、AIボット定義、Edge Function、AIMessageBubble等）に加えて、以下の残りの機能を実装します。

## 実装内容

### 1. NewConversationDialog - AI選択オプション追加

**ファイル**: `src/components/messenger/NewConversationDialog.tsx`

**変更内容**:
- AI_BOTをインポートして選択肢として表示
- AIが選択された場合は`includes_ai: true`フラグを設定
- AI専用のアイコン（Bot）を表示

```typescript
import { AI_BOT } from "@/lib/ai-bot";
import { Bot } from "lucide-react";

// 選択可能なメンバーリストにAIを追加
const selectableMembers = [
  {
    user_id: AI_BOT.id,
    isAI: true,
    displayName: AI_BOT.displayName,
  },
  ...otherMembers
];
```

### 2. useConversations - AI会話対応

**ファイル**: `src/hooks/useConversations.ts`

**変更内容**:
- `includes_ai`フラグをクエリに追加
- AI会話作成時に`includes_ai: true`を設定
- AIユーザーの場合は参加者として追加しない（仮想ユーザーのため）

```typescript
// AI会話作成時
const { data: conversation } = await supabase
  .from('conversations')
  .insert({
    company_id: company.id,
    name: includesAI ? 'ミナト (AI)' : name,
    type,
    created_by: user.id,
    includes_ai: includesAI
  })
```

### 3. ConversationList - AI会話の表示対応

**ファイル**: `src/components/messenger/ConversationList.tsx`

**変更内容**:
- AI会話には特別なアイコン（Bot）を表示
- AIとのDMの場合は名前を「ミナト (AI)」に設定

```typescript
import { Bot } from "lucide-react";
import { AI_BOT, isAIBot } from "@/lib/ai-bot";

// 会話名の取得時
const getConversationName = (conv: Conversation) => {
  if (conv.includes_ai && conv.type === 'direct') {
    return AI_BOT.displayName;
  }
  // ... 既存ロジック
};

// アバター表示時
{conv.includes_ai && conv.type === 'direct' ? (
  <Bot className="h-4 w-4" />
) : conv.type === 'group' ? (
  <Users className="h-4 w-4" />
) : (
  getInitials(name)
)}
```

### 4. MessageInput - メンション補完機能

**ファイル**: `src/components/messenger/MessageInput.tsx`

**変更内容**:
- `@`入力時にメンション候補をポップアップ表示
- MentionPopupコンポーネントを使用
- 矢印キーで選択、Enterで確定
- メンバー一覧 + AI「ミナト」を候補に表示

```typescript
import { MentionPopup, createMentionCandidates } from "./MentionPopup";
import { useConversation } from "@/hooks/useConversations";
import { useCompanyMembers } from "@/hooks/useCompany";

// メンション状態管理
const [showMentionPopup, setShowMentionPopup] = useState(false);
const [mentionQuery, setMentionQuery] = useState("");
const [selectedIndex, setSelectedIndex] = useState(0);

// @入力検知
const handleChange = (e) => {
  const value = e.target.value;
  setContent(value);
  
  // @の後のテキストを検出
  const lastAtIndex = value.lastIndexOf('@');
  if (lastAtIndex !== -1) {
    const query = value.slice(lastAtIndex + 1);
    if (!query.includes(' ')) {
      setMentionQuery(query);
      setShowMentionPopup(true);
    }
  } else {
    setShowMentionPopup(false);
  }
};

// メンション選択時
const handleSelectMention = (candidate) => {
  const lastAtIndex = content.lastIndexOf('@');
  const newContent = content.slice(0, lastAtIndex) + '@' + candidate.name + ' ';
  setContent(newContent);
  setShowMentionPopup(false);
};
```

### 5. useSendMessage - AI応答トリガー追加

**ファイル**: `src/hooks/useMessages.ts`

**変更内容**:
- メッセージ送信後に`@ミナト`を検出
- 会話に`includes_ai`がある場合もAI応答をトリガー
- `useMessengerAI`フックを使用

```typescript
import { useMessengerAI, shouldTriggerAI } from "@/hooks/useMessengerAI";
import { containsAIMention } from "@/lib/ai-bot";

// useSendMessage内
const { triggerAIResponse } = useMessengerAI();

// メッセージ送信後
if (shouldTriggerAI(content, conversation.includes_ai)) {
  triggerAIResponse(conversationId, content, conversation.includes_ai);
}
```

## 実装ファイル一覧

### 修正ファイル
| ファイル | 変更内容 |
|----------|----------|
| `src/components/messenger/NewConversationDialog.tsx` | AI選択オプション追加、Botアイコン表示 |
| `src/components/messenger/ConversationList.tsx` | AI会話のアイコン・名前表示対応 |
| `src/components/messenger/MessageInput.tsx` | メンション補完機能追加 |
| `src/hooks/useConversations.ts` | includes_aiフラグ対応、AI会話作成対応 |
| `src/hooks/useMessages.ts` | AI応答トリガー統合 |
| `src/lib/ai-bot.ts` | ヘルパー関数追加（containsAIMention等） |

## テスト項目

1. **新規会話でAI選択**
   - ダイアログでミナト(AI)が選択肢として表示される
   - AI選択でDM作成時、includes_ai=trueで保存される

2. **会話一覧でAI表示**
   - AIとのDMにBotアイコンが表示される
   - 会話名が「ミナト (AI)」と表示される

3. **メンション補完**
   - `@`入力でポップアップが表示される
   - 候補にミナト(AI)が含まれる
   - 選択で`@ミナト `がテキストに挿入される

4. **AI応答トリガー**
   - メンション送信後、AIから応答がリアルタイムで表示される
