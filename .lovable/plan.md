
# AI CRMツールの lead_source enum 修正計画

## 問題

AIアシスタント（ミナト）がリードを作成しようとすると、`lead_source`フィールドに無効な値（`"Web"`, `"その他"`）を送信し、データベースエラーが発生します。

## 根本原因

`supabase/functions/chat/tools/crm.ts`のツール定義で、`source`フィールドにenum制約がなく、AIが自由な文字列を生成しています。

## 修正内容

### 1. ツール定義に enum 制約を追加

**ファイル**: `supabase/functions/chat/tools/crm.ts` (Line 63-65)

```typescript
// 修正前
source: {
  type: "string",
  description: "リードソース（例：Web、紹介、展示会）",
},

// 修正後
source: {
  type: "string",
  enum: ["website", "referral", "exhibition", "cold_call", "advertising", "other"],
  description: "リードソース: website(ウェブサイト), referral(紹介), exhibition(展示会), cold_call(コールド), advertising(広告), other(その他)",
},
```

### 2. デフォルト値を修正

**ファイル**: `supabase/functions/chat/tools/crm.ts` (Line 274)

```typescript
// 修正前
source: input.source || "その他",

// 修正後
source: input.source || "other",
```

## 変更ファイル

| ファイル | 変更内容 |
|----------|----------|
| `supabase/functions/chat/tools/crm.ts` | enum制約追加、デフォルト値修正 |

## 期待される結果

AIアシスタントが正しい英語のenum値（`website`, `referral`など）を使用してリードを作成できるようになります。
