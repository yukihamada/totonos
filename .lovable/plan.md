
# トトノスAI「ミナト」のメッセンジャー統合プラン

## 概要

現在のメッセンジャー機能にAIアシスタント「ミナト」を1ユーザーとして統合し、Slack/Chatworkのような体験を実現します。

## 実装内容

### 1. AIボットユーザーの仮想表現

AIは実際のauth.usersには存在しないため、**仮想ユーザー**として扱います。

```typescript
// src/lib/ai-bot.ts
export const AI_BOT = {
  id: 'ai-assistant-minato',
  name: 'ミナト',
  displayName: 'ミナト (AI)',
  avatarUrl: null,
  isAI: true,
  mentionTrigger: '@ミナト'
} as const;
```

### 2. データベース変更

#### 2.1 メッセージテーブルの拡張
```sql
-- AIからのメッセージを識別するためのカラム追加
ALTER TABLE public.messages
ADD COLUMN is_ai_message BOOLEAN DEFAULT false,
ADD COLUMN ai_metadata JSONB;
```

#### 2.2 会話テーブルの拡張
```sql
-- AI参加フラグ
ALTER TABLE public.conversations
ADD COLUMN includes_ai BOOLEAN DEFAULT false;
```

### 3. AIの参加方法

#### 3.1 新規会話作成時にAIを追加可能に
NewConversationDialogにAIを選択肢として表示：

```
┌─────────────────────────────────────────┐
│ 新規会話                                │
├─────────────────────────────────────────┤
│ ダイレクト | グループ                    │
├─────────────────────────────────────────┤
│ 🤖 ミナト (AI)              ✓           │ ← AI選択
│ 👤 田中太郎                              │
│ 👤 山田花子                              │
└─────────────────────────────────────────┘
```

#### 3.2 メンションでのAI呼び出し
グループチャットまたはDMで `@ミナト` を含むメッセージを送信すると、AIが応答：

```
自分: @ミナト 今月の請求書一覧を教えて
ミナト: 今月の請求書一覧を取得しています...
        ■ INV202601-0001: ¥150,000 (未払い)
        ■ INV202601-0002: ¥80,000 (支払済)
```

### 4. メッセージフローの変更

#### 4.1 メッセージ送信時のAI検知
**修正ファイル**: `src/hooks/useMessages.ts`

```typescript
export function useSendMessage() {
  return useMutation({
    mutationFn: async ({ conversationId, content }) => {
      // 1. メッセージを保存
      const { data: message } = await supabase
        .from('messages')
        .insert({ conversation_id: conversationId, sender_id: user.id, content })
        .select().single();

      // 2. @ミナト メンションを検出
      if (content.includes('@ミナト') || conversation.includes_ai) {
        // AIへのリクエストをトリガー（非同期）
        triggerAIResponse(conversationId, content);
      }

      return message;
    },
  });
}
```

#### 4.2 AI応答処理
**新規ファイル**: `src/hooks/useMessengerAI.ts`

```typescript
export function useMessengerAI() {
  const triggerAIResponse = async (conversationId: string, userMessage: string) => {
    // 1. 会話履歴を取得
    const history = await getConversationHistory(conversationId);
    
    // 2. Edge Functionを呼び出し
    const response = await supabase.functions.invoke('messenger-ai', {
      body: { conversationId, message: userMessage, history }
    });
    
    // 3. AIの応答はEdge Function側でメッセージテーブルに保存される
    // 4. Realtimeで自動的にUIに反映
  };
}
```

### 5. 新規Edge Function

**ファイル**: `supabase/functions/messenger-ai/index.ts`

```typescript
serve(async (req) => {
  const { conversationId, message, history } = await req.json();
  
  // 既存のchat Edge Functionのロジックを再利用
  const aiResponse = await callLovableAI(history, model, systemPrompt, tools);
  
  // AIの応答をメッセージとして保存
  await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_id: AI_BOT.id,
    content: aiResponse.content,
    is_ai_message: true,
    ai_metadata: { tool_calls: aiResponse.toolCalls }
  });
  
  return new Response(JSON.stringify({ success: true }));
});
```

### 6. UIコンポーネントの変更

#### 6.1 会話一覧でのAI表示
**修正ファイル**: `src/components/messenger/ConversationList.tsx`

- AIとのDMには🤖アイコンを表示
- AIが参加しているグループは特別なバッジを表示

#### 6.2 メッセージスレッドでのAI表示
**修正ファイル**: `src/components/messenger/MessageThread.tsx`

```tsx
// AIメッセージの特別表示
{message.is_ai_message ? (
  <div className="flex gap-2">
    <Avatar className="bg-gradient-to-br from-blue-500 to-purple-600">
      <Bot className="h-4 w-4 text-white" />
    </Avatar>
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl px-4 py-2">
      <p className="text-xs text-blue-600 font-medium mb-1">ミナト (AI)</p>
      <p className="whitespace-pre-wrap">{message.content}</p>
    </div>
  </div>
) : (
  // 通常のメッセージ表示
)}
```

#### 6.3 メッセージ入力でのメンション補完
**修正ファイル**: `src/components/messenger/MessageInput.tsx`

- `@` 入力時にメンション候補を表示
- メンバー一覧 + 「ミナト (AI)」を候補に含める

#### 6.4 新規会話ダイアログの更新
**修正ファイル**: `src/components/messenger/NewConversationDialog.tsx`

- メンバー選択リストの先頭にAIを追加
- 「AIとダイレクトメッセージ」専用のクイックアクション

### 7. ツール実行結果の表示

AIがツールを実行した場合、結果をリッチに表示：

```
┌──────────────────────────────────────────────┐
│ ミナト (AI)                                   │
├──────────────────────────────────────────────┤
│ 📊 請求書一覧を取得しました                    │
│ ┌────────────────────────────────────────┐   │
│ │ INV202601-0001 | ¥150,000 | 未払い      │   │
│ │ INV202601-0002 | ¥80,000  | 支払済      │   │
│ └────────────────────────────────────────┘   │
│                                              │
│ 合計2件の請求書があります。                   │
└──────────────────────────────────────────────┘
```

---

## 実装ファイル一覧

### 新規作成
| ファイル | 説明 |
|----------|------|
| `supabase/migrations/XXXXXX_messenger_ai.sql` | AI関連カラム追加 |
| `supabase/functions/messenger-ai/index.ts` | メッセンジャー用AI Edge Function |
| `src/lib/ai-bot.ts` | AIボット定数定義 |
| `src/hooks/useMessengerAI.ts` | メッセンジャーAI連携フック |
| `src/components/messenger/MentionPopup.tsx` | メンション補完UI |
| `src/components/messenger/AIMessageBubble.tsx` | AI専用メッセージ表示 |
| `src/components/messenger/ToolResultCard.tsx` | ツール実行結果カード |

### 修正
| ファイル | 変更内容 |
|----------|----------|
| `src/hooks/useMessages.ts` | AIメンション検知・トリガー追加 |
| `src/hooks/useConversations.ts` | AI会話対応 |
| `src/components/messenger/MessageThread.tsx` | AIメッセージ表示対応 |
| `src/components/messenger/MessageInput.tsx` | メンション補完追加 |
| `src/components/messenger/ConversationList.tsx` | AI会話の表示対応 |
| `src/components/messenger/NewConversationDialog.tsx` | AI選択追加 |

---

## 技術的考慮事項

### AIメッセージの保存
- `sender_id` には固定のAI識別子（`ai-assistant-minato`）を使用
- RLSポリシーはAIのメッセージ挿入を許可するよう調整

### リアルタイム更新
- AIの応答もSupabase Realtimeで配信
- ユーザーは自動的に最新メッセージを受信

### クレジット消費
- メンションでAIを呼び出すたびにクレジットを消費
- 既存の`ai_chat`クレジットロジックを再利用

### エラーハンドリング
- AI応答に失敗した場合、システムメッセージとしてエラーを表示
- `message_type: 'system'` でエラーメッセージを保存

---

## UI/UX改善点

### 1. AIとの会話開始を簡単に
- メッセージ画面に「🤖 ミナトに相談」ボタンを追加
- ワンクリックでAIとのDMを開始

### 2. メンション入力の補助
- `@` を入力すると候補がポップアップ
- 矢印キーで選択、Enterで確定

### 3. AIの「入力中」表示
- AIが応答を生成中は「ミナトが入力しています...」を表示

---

## 実装優先順位

1. **DB変更** - `is_ai_message`, `includes_ai` カラム追加
2. **AIボット定数** - `src/lib/ai-bot.ts` 作成
3. **新規会話でAI選択** - NewConversationDialog更新
4. **メッセージ表示** - MessageThread でAIメッセージ対応
5. **AI応答Edge Function** - `messenger-ai` 作成
6. **メンション機能** - MessageInput にメンション補完追加

---

## テスト項目

1. **AIとの1対1チャット**
   - 新規会話でAIを選択し、メッセージを送信
   - AIが応答を返すことを確認

2. **グループでのメンション**
   - グループチャットで `@ミナト` を含むメッセージを送信
   - AIが応答することを確認

3. **リアルタイム更新**
   - 複数ブラウザで同じ会話を開き、AIの応答がリアルタイムで表示されることを確認

4. **ツール実行**
   - 「請求書一覧を見せて」等のリクエストを送信
   - ツール実行結果がリッチに表示されることを確認
