# Totonos - 8-in-1 Business OS

> freee + SmartHR + Salesforce + Notion + クラウドサイン + HRMOS + 楽楽精算 + Asana を1つに統合

## 概要

Totonos は、中小企業・スタートアップ向けの統合ビジネスプラットフォームです。複数のSaaSツールを契約する必要なく、1つのプラットフォームで業務を完結できます。

### 主な機能

| カテゴリ | 機能 | 競合サービス |
|---------|------|-------------|
| **CRM** | リード管理、商談管理、取引先管理 | Salesforce |
| **請求・見積** | 請求書作成、見積書作成、自動リマインド | freee、MFクラウド |
| **契約** | 電子契約、契約書管理、期限アラート | クラウドサイン |
| **HR** | 従業員管理、勤怠管理、給与計算 | SmartHR、HRMOS |
| **経費** | 経費精算、領収書OCR、仕訳自動化 | 楽楽精算 |
| **会計** | 仕訳帳、勘定科目、財務レポート | freee、MFクラウド |
| **Wiki** | ナレッジベース、ドキュメント管理 | Notion |
| **プロジェクト** | タスク管理、進捗追跡 | Asana |
| **AIアシスタント** | チャットボット、自動化 | - |

## 技術スタック

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **AI**: Anthropic Claude API
- **決済**: Stripe

## セットアップ

### 必要条件

- Node.js 18+
- npm または pnpm
- Supabase アカウント

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/yukihamada/totonos.git
cd totonos

# 依存関係をインストール
npm install

# 環境変数を設定
cp .env.example .env
# .env ファイルを編集して必要な値を設定

# 開発サーバーを起動
npm run dev
```

### 環境変数

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

## 機能詳細

### AIアシスタント

- 日本語IME対応（変換確定時の誤送信防止）
- Markdown レンダリング対応
- クレジット制による従量課金

### クレジットシステム

| 機能 | 消費クレジット |
|------|---------------|
| AIチャット | 1 |
| AI売上予測 | 5 |
| AIリードスコアリング | 3 |
| 領収書OCR | 2 |
| PDF生成 | 1 |

### セキュリティ

- Row Level Security (RLS) による データ分離
- 二要素認証 (2FA) 対応
- 監査ログ

## ディレクトリ構成

```
src/
├── components/     # UIコンポーネント
│   ├── chat/       # AIチャット
│   ├── layout/     # レイアウト
│   └── ui/         # shadcn/ui
├── hooks/          # カスタムフック
├── lib/            # ユーティリティ
├── pages/          # ページコンポーネント
├── types/          # TypeScript型定義
└── integrations/   # 外部サービス連携
```

## ライセンス

MIT License

## コントリビューション

Issue や Pull Request は歓迎です。

## サポート

- [GitHub Issues](https://github.com/yukihamada/totonos/issues)
- Email: support@totonos.jp

---
*Last updated: 2026-01-19*
