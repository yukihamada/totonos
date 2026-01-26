
# メッセンジャー機能・PDF日本語修正・招待フロー改善プラン

## 概要

3つの主要な改善を実施します：
1. アプリ内メッセンジャー機能の実装
2. PDF日本語文字化けの根本修正
3. 請求書詳細ページのタイトル表示修正と招待ワンクリック完了

---

## 1. アプリ内メッセンジャー機能

### 現状
現在のチャット機能（`src/components/chat/`）はAIアシスタント専用です。チームメンバー間でメッセージをやり取りする機能はありません。

### 実装内容

#### データベーステーブル
```sql
-- 会話（グループチャット/DM対応）
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT, -- グループ名（DMの場合はNULL）
  type TEXT NOT NULL DEFAULT 'direct' CHECK (type IN ('direct', 'group', 'channel')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 会話参加者
CREATE TABLE public.conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  last_read_at TIMESTAMPTZ,
  UNIQUE(conversation_id, user_id)
);

-- メッセージ
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'system')),
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- リアルタイム対応
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
```

#### RLSポリシー
- 会話参加者のみがメッセージを閲覧・投稿可能
- 同じ会社のメンバーのみが会話を作成可能

#### フロントエンド実装

**新規ファイル:**
| ファイル | 説明 |
|----------|------|
| `src/pages/Messages.tsx` | メッセンジャーメインページ |
| `src/components/messenger/ConversationList.tsx` | 会話一覧サイドバー |
| `src/components/messenger/MessageThread.tsx` | メッセージスレッド表示 |
| `src/components/messenger/MessageInput.tsx` | メッセージ入力欄 |
| `src/components/messenger/NewConversationDialog.tsx` | 新規DM/グループ作成 |
| `src/hooks/useMessages.ts` | メッセージ取得・送信・リアルタイム |
| `src/hooks/useConversations.ts` | 会話一覧取得・作成 |

**UI設計:**
```
┌─────────────────────────────────────────────────────┐
│ 📨 メッセージ                     [+ 新規会話]     │
├──────────────┬──────────────────────────────────────┤
│ 検索...       │ 田中太郎さんとの会話                │
├──────────────┤                                      │
│ ● 田中太郎   │ ┌────────────────────────────────┐ │
│   昨日の件... │ │ 田中: お疲れ様です         14:30│ │
│              │ ├────────────────────────────────┤ │
│   山田花子   │ │ 自分: 確認しました         14:32│ │
│   了解です   │ └────────────────────────────────┘ │
│              │                                      │
│   #営業チーム │ ┌──────────────────────────────────┐│
│   新規案件   │ │ メッセージを入力...         [送信]││
│              │ └──────────────────────────────────┘│
└──────────────┴──────────────────────────────────────┘
```

**機能:**
- ダイレクトメッセージ（1対1）
- グループチャット
- リアルタイム更新（Supabase Realtime）
- 未読バッジ表示
- ファイル添付

---

## 2. PDF日本語文字化け修正

### 根本原因
現在のCDN URL (`https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-jp@5.2.9/files/noto-sans-jp-japanese-400-normal.ttf`) が正しいフォントファイルを返していないか、Base64変換時にデータ破損している可能性が高い。

### 修正方法

#### フォントURL変更
```typescript
// src/lib/fonts/noto-sans-jp.ts
// 変更前
export const NOTO_SANS_JP_URL = 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-jp@5.2.9/files/noto-sans-jp-japanese-400-normal.ttf';

// 変更後 - Google Fontsの公式リポジトリから直接取得
export const NOTO_SANS_JP_URL = 'https://raw.githubusercontent.com/googlefonts/noto-cjk/main/Sans/OTF/Japanese/NotoSansCJKjp-Regular.otf';
```

#### Base64変換の改善
```typescript
// より堅牢な変換方法
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  
  // Use smaller chunks and validate
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  
  // btoa can fail on large strings in some browsers
  // Use a fallback approach if needed
  try {
    return btoa(binary);
  } catch (e) {
    // For very large files, use a different approach
    const base64 = [];
    const chunkSize = 1024 * 64;
    for (let i = 0; i < binary.length; i += chunkSize) {
      base64.push(btoa(binary.slice(i, i + chunkSize)));
    }
    return base64.join('');
  }
}
```

#### 代替アプローチ：事前埋め込みBase64
最も確実な方法として、動作確認済みのフォントファイルをBase64としてプロジェクトに含めます：

```typescript
// src/lib/fonts/noto-sans-jp-base64.ts
// この文字列は事前に変換済み（約2.5MB）
export const NOTO_SANS_JP_BASE64 = 'AAEAAAASAQAA...（省略）...';
```

---

## 3. 請求書詳細ページの修正

### タイトル改行問題
**現状** (line 100-109):
```tsx
<div className="flex items-center gap-3">
  <h1 className="text-3xl font-bold">{invoice.title}</h1>
  <Badge variant={status.variant}>...</Badge>
</div>
```

**修正後:**
```tsx
<div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
  <h1 className="text-3xl font-bold truncate max-w-[400px] md:max-w-none">
    {invoice.title}
  </h1>
  <Badge variant={status.variant} className="shrink-0">...</Badge>
</div>
```

---

## 4. 招待ワンクリック完了

### 現状の問題
`src/pages/Invite.tsx:26-28` で自動受諾を呼び出していますが、UIには「招待を受諾する」ボタンがまだ表示されています（102-105行目）。

### 修正
自動受諾中は処理中UIを表示し、ボタンを非表示にします：

```tsx
// src/pages/Invite.tsx
return (
  <div className="min-h-screen flex items-center justify-center bg-background p-4">
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>
          {status === "success" ? (
            <span className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              参加完了
            </span>
          ) : status === "error" ? (
            <span className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              エラー
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              チームに参加しています...
            </span>
          )}
        </CardTitle>
        <CardDescription>
          {status === "success"
            ? "ダッシュボードへ移動します..."
            : status === "error"
            ? errorMessage
            : "招待を処理中です。少々お待ちください..."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* idle状態のボタンを削除 - 自動処理のため不要 */}
        {status === "accepting" && (
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        {status === "error" && (
          <Button onClick={() => navigate("/")} variant="outline" className="w-full">
            ホームへ戻る
          </Button>
        )}
      </CardContent>
    </Card>
  </div>
);
```

---

## 実装ファイル一覧

### 新規作成
| ファイル | 説明 |
|----------|------|
| `supabase/migrations/XXXXXX_messenger.sql` | メッセンジャーテーブル |
| `src/pages/Messages.tsx` | メッセンジャーページ |
| `src/components/messenger/ConversationList.tsx` | 会話一覧 |
| `src/components/messenger/MessageThread.tsx` | メッセージスレッド |
| `src/components/messenger/MessageInput.tsx` | 入力欄 |
| `src/components/messenger/NewConversationDialog.tsx` | 新規作成ダイアログ |
| `src/hooks/useMessages.ts` | メッセージフック |
| `src/hooks/useConversations.ts` | 会話フック |

### 修正
| ファイル | 変更内容 |
|----------|----------|
| `src/lib/fonts/noto-sans-jp.ts` | フォントURL変更・変換改善 |
| `src/pages/InvoiceDetail.tsx` | タイトル改行修正 |
| `src/pages/Invite.tsx` | 自動処理UI改善 |
| `src/App.tsx` | `/messages` ルート追加 |
| `src/components/layout/AppSidebar.tsx` | メッセージメニュー追加 |

---

## 実装優先順位

1. **PDF日本語修正** - 即座に対応
2. **請求書タイトル・招待フロー** - シンプルな修正
3. **メッセンジャー機能** - 新規機能（DB作成から）

---

## テスト項目

### PDF
- 請求書PDFをダウンロードし、「請求書」「発行日」などの日本語が正しく表示されることを確認
- 取引先名（漢字）、品目名が正しく表示されることを確認

### 招待
- 招待リンクをクリックすると自動的に処理が開始されること
- 「招待を受諾する」ボタンが表示されないこと
- 処理完了後、自動でダッシュボードへ移動すること

### メッセンジャー
- 新規DM作成・送信ができること
- メッセージがリアルタイムで更新されること
- 未読バッジが正しく表示されること
