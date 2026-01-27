

# 開発用自動ログイン機能（Supabase対応版）

## 概要

現在のE2Eテストバイパスは**モックセッション**を使っているため、Supabaseの機能（データベース、RLS、Edge Functions）が使えません。本物のSupabase認証を通すように改善します。

---

## 現状の問題

| 項目 | 現状 | 問題 |
|------|------|------|
| access_token | `'e2e-test-access-token'` | Supabaseが認識しない偽トークン |
| セッション | localStorageに保存 | Supabase SDKはこれを使わない |
| RLSポリシー | `auth.uid()` | モックユーザーIDは認識されない |
| データベース操作 | 不可 | RLSで全てブロックされる |

---

## 解決策：Edge Function経由で本物の認証を行う

```text
┌─────────────────────────────────────────────────────────────────┐
│                     認証フロー（改善後）                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   [ブラウザ]                    [Edge Function]                 │
│       │                              │                          │
│       │ E2Eメールで送信              │                          │
│       ├──────────────────────────────>                          │
│       │                              │                          │
│       │                        E2E_TEST_KEY検証                 │
│       │                              │                          │
│       │                        admin.createUser()               │
│       │                        または                            │
│       │                        signInWithPassword()             │
│       │                              │                          │
│       │                        admin.generateLink()             │
│       │                              │                          │
│       │<─────────────────────────────┤                          │
│       │   本物のマジックリンクURL     │                          │
│       │                              │                          │
│       │ URLにアクセス                │                          │
│       ├──────────────────────────────>                          │
│       │                              │                          │
│       │   本物のセッションを取得      │                          │
│       │   (Supabase Auth経由)        │                          │
│       │                              │                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 実装内容

### 1. 新規Edge Function: `dev-auth`

**目的**: E2Eテスト用メールアドレスを受け取り、本物のSupabase認証を行う

**ファイル**: `supabase/functions/dev-auth/index.ts`

```typescript
// 主要なロジック
const E2E_TEST_KEY = Deno.env.get("VITE_E2E_TEST_KEY");

// 1. E2Eテストキーの検証
const isValidE2EEmail = email.includes(`+e2e-${E2E_TEST_KEY}@`);
if (!isValidE2EEmail) {
  return error("Invalid test email");
}

// 2. ユーザーが存在するか確認、なければ作成
const { data: users } = await supabase.auth.admin.listUsers();
let user = users.users.find(u => u.email === email);

if (!user) {
  const { data: newUser } = await supabase.auth.admin.createUser({
    email,
    password: 'e2e-test-password-secure',
    email_confirm: true, // 即座に確認済み
    user_metadata: { display_name: 'E2E Test User' }
  });
  user = newUser.user;
}

// 3. 本物のマジックリンクを生成
const { data: linkData } = await supabase.auth.admin.generateLink({
  type: 'magiclink',
  email: user.email,
});

// 4. トークンを返す
return { 
  token: linkData.properties.hashed_token,
  email: user.email 
};
```

### 2. フロントエンド側の変更

**ファイル**: `src/hooks/useAuth.tsx`

E2Eメールを検出したら、Edge Functionを呼び出して本物のセッションを取得：

```typescript
// E2E Test: 本物のSupabase認証を使用
if (isE2ETestEmail(email)) {
  // Edge Functionで本物のマジックリンクを取得
  const { data } = await supabase.functions.invoke('dev-auth', {
    body: { email }
  });
  
  // 本物のトークンでセッションを確立
  const { data: session } = await supabase.auth.verifyOtp({
    email,
    token: data.token,
    type: 'magiclink'
  });
  
  return { error: null, isE2ELogin: true };
}
```

### 3. supabase/config.toml への追加

```toml
# Dev Auth: E2Eテスト用自動認証（内部でシークレット検証）
[functions.dev-auth]
verify_jwt = false
```

---

## セキュリティ対策

| 対策 | 説明 |
|------|------|
| シークレットキー検証 | `VITE_E2E_TEST_KEY`がメールに含まれているか確認 |
| 本番環境での無効化 | `IS_PRODUCTION`フラグで本番では動作しない |
| 専用テストユーザー | 通常ユーザーとは分離されたテスト用アカウント |
| 限定的な権限 | テストユーザーは特定のパターンのメールのみ |

---

## 実装ファイル一覧

| ファイル | 変更内容 |
|----------|----------|
| `supabase/functions/dev-auth/index.ts` | 新規作成 - E2E認証Edge Function |
| `src/hooks/useAuth.tsx` | E2Eログイン時にEdge Functionを呼び出し |
| `supabase/config.toml` | dev-auth関数の設定追加 |

---

## 使用方法

### ブラウザ自動化テスト

```typescript
// Playwrightテスト
await page.goto('/auth');
await page.fill('[type="email"]', 'test+e2e-YOUR_SECRET_KEY@totonos.jp');
await page.click('button[type="submit"]');
// → 自動的にダッシュボードにリダイレクト
// → Supabaseの全機能が使用可能！
```

### 手動テスト

1. `/auth`ページにアクセス
2. メールアドレス入力: `yourname+e2e-{シークレットキー}@totonos.jp`
3. ログインボタンをクリック
4. 自動的にダッシュボードに移動
5. **Supabaseのデータベース、RLS、Edge Functionsが全て動作！**

---

## 期待される結果

| 機能 | 改善前 | 改善後 |
|------|--------|--------|
| データベース読み取り | ❌ RLSでブロック | ✅ 正常に動作 |
| データベース書き込み | ❌ RLSでブロック | ✅ 正常に動作 |
| Edge Functions | ❌ 認証エラー | ✅ 正常に動作 |
| AIチャット（ミナト） | ❌ ツール実行失敗 | ✅ 全ツール動作 |
| プロファイル作成 | ❌ トリガー未発火 | ✅ 自動作成される |

