# Totonos - 10-in-1 Business OS

> freee + SmartHR + Salesforce + Notion + クラウドサイン + HRMOS + 楽楽精算 + Asana + LMS + 会員管理 を1つに統合

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
| **LMS** | コース管理、受講進捗、テスト機能 | - |
| **会員管理** | 会員登録、チェックイン、予約管理 | - |
| **EMR（電子カルテ）** | 患者管理、HPKI電子署名、診療記録 | レセコン連携 |
| **不動産管理** | 物件管理、テナント管理、入居者対応 | - |

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

## デプロイ

様々なクラウドプラットフォームに対応しています。

| プラットフォーム | ワンクリックデプロイ |
|-----------------|---------------------|
| **Vercel** | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yukihamada/totonos) |
| **Netlify** | [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yukihamada/totonos) |
| **Cloudflare Pages** | `wrangler pages deploy dist` |
| **AWS Amplify** | AWS Console から GitHub 連携 |
| **Firebase** | `firebase deploy --only hosting` |
| **Fly.io** | `fly deploy` |
| **Railway** | GitHub 連携で自動デプロイ |
| **Render** | GitHub 連携で自動デプロイ |
| **Azure** | Static Web Apps で GitHub 連携 |
| **Docker** | `docker-compose up -d` |

詳細は [デプロイガイド](docs/DEPLOYMENT.md) を参照してください。

## 機能詳細

### 業種別テンプレート

初回ログイン時に業種を選択すると、その業種に最適化されたメニューと機能が自動設定されます。

| カテゴリ | 対応業種 |
|---------|---------|
| 小売 | 一般小売、アパレル、家具・インテリア、ペットショップ |
| サービス | 飲食店、美容室、フィットネス、ホテル |
| 専門サービス | 法律事務所、会計事務所、コンサルティング |
| 医療・福祉 | クリニック、歯科、薬局、介護施設 |
| 建設・不動産 | 建設会社、不動産仲介、リフォーム |
| IT | SaaS、Web制作、システム開発 |
| 物流 | 運送、倉庫、配送 |
| 教育 | 学習塾、語学学校、専門学校 |

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

### LMS（学習管理システム）

社内研修やeラーニングに対応した学習管理機能：

- コース作成・管理
- 受講者の進捗追跡
- テスト機能（タイマー付き）
- 学習履歴・成績レポート
- 修了証発行

### 会員管理

ジム・スクール・サロン向けの会員管理機能：

- 会員登録・プラン管理
- チェックイン記録
- クラス予約・スケジュール管理
- 購入履歴管理
- 会員ダッシュボード

### HPKI電子署名（EMR向け）

EMR機能では、HPKIカードを使用した電子署名に対応しています。

**HPKIブリッジアプリ**

電子署名機能を使用するには、ローカルブリッジアプリのインストールが必要です：

- [macOS版ダウンロード](https://github.com/yukihamada/totonos/releases/download/hpki-bridge-v1.0.0/hpki-bridge-macos.dmg)
- [Windows版ダウンロード](https://github.com/yukihamada/totonos/releases/download/hpki-bridge-v1.0.0/hpki-bridge-windows.exe)

**macOSでGatekeeper警告が出た場合：**

ダウンロードしたファイルを右クリック →「開く」→「開く」をクリック

**必要な環境：**
- ICカードリーダー
- HPKIカード
- OpenSCドライバ（[ダウンロード](https://github.com/OpenSC/OpenSC/releases)）

### セキュリティ

- Row Level Security (RLS) による データ分離
- 二要素認証 (2FA) 対応
- 監査ログ

## ディレクトリ構成

```
src/
├── components/     # UIコンポーネント
│   ├── chat/       # AIチャット
│   ├── emr/        # 電子カルテ
│   ├── lms/        # 学習管理
│   ├── layout/     # レイアウト
│   └── ui/         # shadcn/ui
├── hooks/          # カスタムフック
├── lib/            # ユーティリティ
├── pages/          # ページコンポーネント
│   └── membership/ # 会員管理
├── types/          # TypeScript型定義
├── test/           # テストファイル
│   ├── integration/  # インテグレーションテスト
│   ├── components/   # コンポーネントテスト
│   ├── hooks/        # フックテスト
│   └── types/        # 型・ユーティリティテスト
└── integrations/   # 外部サービス連携

e2e/                # E2Eテスト (Playwright)
screenshots/        # 自動生成スクリーンショット
docs/               # ドキュメント
```

## テスト

### テストカバレッジ

| カテゴリ | テスト数 | 説明 |
|---------|---------|------|
| Unit Tests | ~450 | ビジネスロジック、型、ユーティリティ |
| Integration Tests | 49 | フォーム入力・反映、状態管理 |
| E2E Tests | 58 | ユーザーフロー、スクリーンショット |
| **合計** | **~557** | |

### テスト実行

```bash
# 全ユニットテスト実行
npm test

# 特定のテストファイル
npm test -- src/test/types/hr.test.ts

# インテグレーションテストのみ
npm test -- src/test/integration/

# E2Eテスト
npm run test:e2e

# スクリーンショット取得
npm run test:e2e -- e2e/screenshots.authenticated.spec.ts
```

### ドキュメント

- [Test Report](docs/TEST_REPORT.md) - テスト一覧と詳細
- [Screenshots](docs/SCREENSHOTS.md) - 全画面スクリーンショット

## ライセンス

MIT License

## コントリビューション

Issue や Pull Request は歓迎です。

## サポート

- [GitHub Issues](https://github.com/yukihamada/totonos/issues)
- Email: support@totonos.jp

---
*Last updated: 2026-01-22 - Added LMS, Membership, Industry Templates*
