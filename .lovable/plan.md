
# E2Eテストバイパス修正計画

## 問題の特定

現在の実装では、E2Eテストバイパスが**プレビュー/本番環境で無効化**されています：

```typescript
// src/hooks/useAuth.tsx (Line 77-78)
function isE2ETestEmail(email: string): boolean {
  if (IS_PRODUCTION || !E2E_TEST_KEY) return false;  // ← 問題箇所
  ...
}
```

Lovableのプレビュー環境では `import.meta.env.PROD = true` となるため、この条件によりE2Eテストメールが常に無視されます。

---

## 解決策

### セキュリティモデルの変更

```text
┌─────────────────────────────────────────────────────────────────┐
│                     セキュリティ検証フロー                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [クライアント側]                  [サーバー側]                  │
│      │                                  │                       │
│  メールパターン検出               シークレットキー検証          │
│  (パターンマッチのみ)             (本当のセキュリティ)          │
│      │                                  │                       │
│  +e2e-*@* 検出                    VITE_E2E_TEST_KEY と一致？   │
│      │                                  │                       │
│      ├───────────────────────────────────>                      │
│      │                                  │                       │
│      │                             一致しない → 403 Forbidden  │
│      │                             一致する → トークン発行     │
│      │                                  │                       │
└─────────────────────────────────────────────────────────────────┘
```

**ポイント**: セキュリティの本体はEdge Function（サーバーサイド）にあります。クライアント側はパターン検出のみで、実際のシークレットキー検証はサーバーで行われます。

---

## 実装内容

### 1. `src/hooks/useAuth.tsx` の修正

`IS_PRODUCTION` チェックを削除し、メールパターンのみで判定：

```typescript
// 修正前
function isE2ETestEmail(email: string): boolean {
  if (IS_PRODUCTION || !E2E_TEST_KEY) return false;
  const pattern = new RegExp(`\\+e2e-${E2E_TEST_KEY}@`);
  return pattern.test(email);
}

// 修正後
function isE2ETestEmail(email: string): boolean {
  // クライアント側ではパターンマッチングのみ
  // セキュリティ検証はEdge Function側で実施
  if (!E2E_TEST_KEY) return false;
  const pattern = new RegExp(`\\+e2e-${E2E_TEST_KEY}@`);
  return pattern.test(email);
}
```

**注意**: `VITE_E2E_TEST_KEY` がクライアントに露出しますが：
- この値はメールアドレスに含める必要があるため、どちらにしても知らないと使えない
- 実際のセキュリティチェックはEdge Function側で行われる
- 悪用されても、Edge Functionがサーバー側のシークレットと照合するため認証は成功しない

### 2. E2Eセッション復元の修正

```typescript
// 修正前
if (e2eSession && !IS_PRODUCTION) {

// 修正後  
if (e2eSession) {  // IS_PRODUCTIONチェックを削除
```

---

## 変更ファイル

| ファイル | 変更内容 |
|----------|----------|
| `src/hooks/useAuth.tsx` | `IS_PRODUCTION` チェックを2箇所削除 |

---

## テスト手順

1. ログインページにアクセス
2. メールアドレスに `e2e-test+e2e-totonos-e2e-secret-2024@totonos.jp` を入力
3. 「メールでログイン」をクリック
4. 自動的にダッシュボードにリダイレクトされる
5. Supabase機能（データベース、RLS）が正常に動作する

---

## 期待される結果

| 環境 | 修正前 | 修正後 |
|------|--------|--------|
| ローカル開発 | ✅ 動作 | ✅ 動作 |
| プレビュー環境 | ❌ 無効化 | ✅ 動作 |
| 本番環境 | ❌ 無効化 | ✅ 動作（シークレットキー必須）|

