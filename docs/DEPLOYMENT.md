# デプロイガイド

Totonos は様々なクラウドプラットフォームにデプロイできます。

## 目次

- [クイックスタート（1コマンド）](#クイックスタート1コマンド)
- [必要条件](#必要条件)
- [Supabase セットアップ](#supabaseセットアップ)
- [デプロイCLI](#デプロイcli)
- [各プラットフォーム詳細](#各プラットフォーム詳細)
- [CI/CD（自動デプロイ）](#cicd自動デプロイ)
- [トラブルシューティング](#トラブルシューティング)

---

## クイックスタート（1コマンド）

### 完全自動セットアップ

```bash
# インターネットから直接実行
curl -fsSL https://raw.githubusercontent.com/yukihamada/totonos/main/quickstart.sh | bash

# または、リポジトリをクローン後
./quickstart.sh
```

### セットアップモード

| モード | コマンド | 説明 |
|--------|---------|------|
| 対話モード | `./quickstart.sh` | 質問に答えながらセットアップ |
| 完全自動 | `./quickstart.sh --auto` | Supabase自動設定 → Vercelデプロイ |
| ローカルのみ | `./quickstart.sh --local` | ローカル開発サーバーのみ起動 |

### quickstart.sh が行うこと

1. **環境チェック**: Node.js, Git, jq の確認・インストール
2. **依存関係インストール**: `npm install`
3. **Supabase CLI セットアップ**: 自動インストール
4. **Supabase 設定**:
   - ログイン（ブラウザ認証）
   - プロジェクト選択 or 新規作成
   - API キー自動取得
   - `.env` ファイル自動生成
5. **データベースセットアップ**: マイグレーション実行
6. **デプロイ**: 選択したプラットフォームにデプロイ

---

## 必要条件

### 最小要件

| ソフトウェア | バージョン | 確認コマンド |
|-------------|-----------|-------------|
| Node.js | 18以上 | `node -v` |
| npm | 9以上 | `npm -v` |
| Git | 2.x | `git --version` |

### オプション（プラットフォーム別）

| ツール | 用途 | インストール |
|--------|------|-------------|
| Supabase CLI | DB セットアップ | `brew install supabase/tap/supabase` |
| Vercel CLI | Vercel デプロイ | `npm i -g vercel` |
| Wrangler | Cloudflare デプロイ | `npm i -g wrangler` |
| Netlify CLI | Netlify デプロイ | `npm i -g netlify-cli` |
| Firebase CLI | Firebase デプロイ | `npm i -g firebase-tools` |
| Docker | コンテナデプロイ | [docker.com](https://docker.com) |
| flyctl | Fly.io デプロイ | `curl -L https://fly.io/install.sh \| sh` |

---

## Supabaseセットアップ

Totonos のバックエンドは Supabase を使用します。3つの選択肢があります。

### アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                    クライアント (ブラウザ)                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│           フロントエンド (React/Vite)                         │
│  Vercel / Cloudflare / Netlify / AWS / Firebase / Docker    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              バックエンド (Supabase)                          │
│     Supabase Cloud / Self-hosted (Docker)                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │PostgreSQL│ │   Auth   │ │ Storage  │ │ Realtime │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└─────────────────────────────────────────────────────────────┘
```

### Option 1: Supabase Cloud（推奨）

最も簡単な方法です。

#### 手動セットアップ

1. [supabase.com](https://supabase.com) にアクセス
2. 「Start your project」→ GitHub でサインアップ
3. 「New Project」をクリック
4. 設定:
   - **Name**: `totonos` など任意
   - **Database Password**: 強力なパスワードを設定
   - **Region**: `Northeast Asia (Tokyo)` を推奨
5. プロジェクト作成後、**Project Settings** → **API** から以下を取得:

```bash
# .env ファイルを作成
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### CLI で自動セットアップ

```bash
# Supabase CLI インストール
brew install supabase/tap/supabase
# または
npm i -g supabase

# ログイン（ブラウザが開きます）
supabase login

# プロジェクト一覧を確認
supabase projects list

# 既存プロジェクトにリンク
supabase link --project-ref your-project-id

# API キーを取得
supabase projects api-keys --project-ref your-project-id

# マイグレーション実行
supabase db push
```

#### 料金

| プラン | 料金 | 含まれるもの |
|--------|------|-------------|
| Free | $0 | 500MB DB, 1GB Storage, 2GB Transfer, 50K MAU |
| Pro | $25/月 | 8GB DB, 100GB Storage, 250GB Transfer |
| Team | $599/月 | 無制限 |

### Option 2: Self-hosted Supabase

完全なコントロールが必要な場合、Docker で自前運用できます。

#### セットアップ

```bash
# 環境変数テンプレートをコピー
cp .env.supabase.example .env.supabase

# .env.supabase を編集してシークレットを設定
nano .env.supabase
```

#### .env.supabase の設定項目

```bash
# === 必須設定 ===
# JWT シークレット（32文字以上のランダム文字列）
JWT_SECRET=your-super-secret-jwt-token-with-at-least-32-characters

# anon キー（JWTトークン）
ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# service_role キー（JWTトークン）
SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# PostgreSQL パスワード
POSTGRES_PASSWORD=your-secure-database-password

# === オプション ===
# SMTP設定（メール認証用）
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password
SMTP_SENDER_NAME=Totonos
```

**JWT キーの生成方法:**

```bash
# JWT_SECRET を生成
openssl rand -base64 32

# ANON_KEY と SERVICE_ROLE_KEY は以下で生成
# https://supabase.com/docs/guides/self-hosting#api-keys
```

#### 起動

```bash
# Supabase スタックを起動
docker-compose -f docker-compose.supabase.yml up -d

# ログを確認
docker-compose -f docker-compose.supabase.yml logs -f
```

#### アクセス先

| サービス | URL | 説明 |
|----------|-----|------|
| Totonos アプリ | http://localhost:3000 | メインアプリ |
| Supabase API | http://localhost:8000 | REST/GraphQL API |
| Supabase Studio | http://localhost:3001 | 管理UI |
| PostgreSQL | localhost:5432 | データベース直接接続 |

#### 停止・リセット

```bash
# 停止
docker-compose -f docker-compose.supabase.yml down

# データも含めて完全削除
docker-compose -f docker-compose.supabase.yml down -v
```

#### 必要リソース

- **メモリ**: 4GB 以上推奨
- **ストレージ**: 20GB 以上
- **CPU**: 2コア以上推奨

### Option 3: 他のマネージドDB

Supabase の代わりに以下も使用可能（要カスタマイズ）:

| サービス | 特徴 |
|----------|------|
| [Neon](https://neon.tech) | Serverless PostgreSQL、無料枠あり |
| [PlanetScale](https://planetscale.com) | MySQL互換、スケーラブル |
| AWS RDS | フルマネージド PostgreSQL |
| Google Cloud SQL | GCP 統合 |
| Azure Database | Azure 統合 |

---

## デプロイCLI

### deploy.sh

各プラットフォームへのデプロイを簡単に行うCLIスクリプトです。

```bash
# ヘルプを表示
./deploy.sh --help

# Vercel にデプロイ
./deploy.sh vercel
./deploy.sh vercel --prod    # 本番環境

# Cloudflare Pages にデプロイ
./deploy.sh cloudflare
./deploy.sh cf               # 短縮形

# Netlify にデプロイ
./deploy.sh netlify
./deploy.sh netlify --prod

# Firebase にデプロイ
./deploy.sh firebase
./deploy.sh fb               # 短縮形

# Fly.io にデプロイ
./deploy.sh fly

# Railway にデプロイ
./deploy.sh railway

# Docker イメージをビルド
./deploy.sh docker

# Self-hosted Supabase を起動
./deploy.sh supabase
```

### npm スクリプト

```bash
# 各プラットフォームへのデプロイ
npm run deploy:vercel
npm run deploy:cloudflare
npm run deploy:netlify
npm run deploy:firebase
npm run deploy:fly
npm run deploy:railway
npm run deploy:docker
npm run deploy:supabase
```

### オプション

| オプション | 説明 |
|-----------|------|
| `--prod` | 本番環境にデプロイ |
| `--setup` | CLIツールのインストールも行う |

---

## 各プラットフォーム詳細

### 必要な環境変数

すべてのプラットフォームで以下を設定:

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `VITE_SUPABASE_URL` | Supabase プロジェクトURL | `https://xxx.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key | `eyJhbGci...` |

---

### Vercel（推奨）

最も簡単なデプロイ方法です。

#### ワンクリックデプロイ

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yukihamada/totonos&env=VITE_SUPABASE_URL,VITE_SUPABASE_PUBLISHABLE_KEY)

#### CLI でデプロイ

```bash
# Vercel CLI インストール
npm i -g vercel

# ログイン
vercel login

# デプロイ（プレビュー）
vercel

# 本番デプロイ
vercel --prod

# 環境変数付きでデプロイ
vercel --prod \
  -e VITE_SUPABASE_URL=your_url \
  -e VITE_SUPABASE_PUBLISHABLE_KEY=your_key
```

#### 環境変数設定（Dashboard）

1. Vercel Dashboard → プロジェクト選択
2. Settings → Environment Variables
3. 以下を追加:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`

#### 設定ファイル

`vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}
```

---

### Cloudflare Pages

高速なグローバルCDN。無料枠が充実。

#### Wrangler CLI でデプロイ

```bash
# Wrangler インストール
npm i -g wrangler

# ログイン
wrangler login

# ビルド
npm run build

# デプロイ
wrangler pages deploy dist --project-name=totonos
```

#### GitHub 連携（推奨）

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) → Pages
2. 「Create a project」→「Connect to Git」
3. GitHub リポジトリを選択
4. ビルド設定:
   - **Framework preset**: None
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. 環境変数を設定

#### 設定ファイル

`wrangler.toml`:
```toml
name = "totonos"
compatibility_date = "2024-01-01"

[site]
bucket = "./dist"
```

---

### Netlify

継続的デプロイメントに最適。

#### ワンクリックデプロイ

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yukihamada/totonos)

#### CLI でデプロイ

```bash
# Netlify CLI インストール
npm i -g netlify-cli

# ログイン
netlify login

# サイト作成（初回のみ）
netlify init

# ビルド
npm run build

# デプロイ（プレビュー）
netlify deploy --dir=dist

# 本番デプロイ
netlify deploy --prod --dir=dist
```

#### 設定ファイル

`netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### AWS Amplify

AWSエコシステムとの統合に最適。

#### Console からデプロイ

1. [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. 「Host web app」→「From GitHub」
3. リポジトリとブランチを選択
4. ビルド設定は `amplify.yml` から自動検出
5. 環境変数を設定
6. 「Save and deploy」

#### 設定ファイル

`amplify.yml`:
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

---

### Firebase Hosting

Google Cloud との統合に最適。

#### デプロイ手順

```bash
# Firebase CLI インストール
npm i -g firebase-tools

# ログイン
firebase login

# プロジェクト初期化（初回のみ）
firebase init hosting
# → 既存プロジェクトを選択 or 新規作成
# → public directory: dist
# → Single-page app: Yes

# ビルド
npm run build

# デプロイ
firebase deploy --only hosting
```

#### 設定ファイル

`firebase.json`:
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  }
}
```

---

### Docker

コンテナベースのデプロイ。Kubernetes、ECS、Cloud Run などに対応。

#### ローカルでビルド・実行

```bash
# イメージをビルド
docker build \
  --build-arg VITE_SUPABASE_URL=your_url \
  --build-arg VITE_SUPABASE_PUBLISHABLE_KEY=your_key \
  -t totonos .

# コンテナを実行
docker run -p 3000:80 totonos

# バックグラウンドで実行
docker run -d -p 3000:80 --name totonos totonos
```

#### Docker Compose

```bash
# .env ファイルを作成
cp .env.example .env
# .env を編集

# 起動
docker-compose up -d

# ログを確認
docker-compose logs -f

# 停止
docker-compose down
```

#### レジストリにプッシュ

```bash
# Docker Hub
docker tag totonos your-username/totonos
docker push your-username/totonos

# GitHub Container Registry
docker tag totonos ghcr.io/your-username/totonos
docker push ghcr.io/your-username/totonos

# AWS ECR
aws ecr get-login-password | docker login --username AWS --password-stdin xxx.dkr.ecr.ap-northeast-1.amazonaws.com
docker tag totonos xxx.dkr.ecr.ap-northeast-1.amazonaws.com/totonos
docker push xxx.dkr.ecr.ap-northeast-1.amazonaws.com/totonos
```

#### Kubernetes にデプロイ

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: totonos
spec:
  replicas: 2
  selector:
    matchLabels:
      app: totonos
  template:
    metadata:
      labels:
        app: totonos
    spec:
      containers:
      - name: totonos
        image: your-registry/totonos:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "64Mi"
            cpu: "100m"
          limits:
            memory: "128Mi"
            cpu: "200m"
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: totonos
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 80
  selector:
    app: totonos
```

```bash
kubectl apply -f k8s/deployment.yaml
```

---

### Fly.io

グローバルエッジコンピューティング。東京リージョンあり。

#### デプロイ手順

```bash
# Fly CLI インストール
curl -L https://fly.io/install.sh | sh

# ログイン
fly auth login

# アプリ作成（初回のみ）
fly launch --no-deploy
# → アプリ名を入力
# → Tokyo リージョンを選択

# 環境変数設定
fly secrets set VITE_SUPABASE_URL=your_url
fly secrets set VITE_SUPABASE_PUBLISHABLE_KEY=your_key

# デプロイ
fly deploy

# ログを確認
fly logs
```

#### 設定ファイル

`fly.toml`:
```toml
app = "totonos"
primary_region = "nrt"  # 東京

[build]

[http_service]
  internal_port = 80
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 256
```

---

### Railway

シンプルなPaaS。GitHub連携で自動デプロイ。

#### Dashboard からデプロイ

1. [Railway](https://railway.app/) にログイン
2. 「New Project」→「Deploy from GitHub repo」
3. リポジトリを選択
4. 環境変数を Variables タブで設定
5. 自動デプロイ開始

#### CLI でデプロイ

```bash
# Railway CLI インストール
npm i -g @railway/cli

# ログイン
railway login

# プロジェクト初期化
railway init

# 環境変数設定
railway variables set VITE_SUPABASE_URL=your_url
railway variables set VITE_SUPABASE_PUBLISHABLE_KEY=your_key

# デプロイ
railway up
```

---

### Render

無料枠が充実したPaaS。

#### Dashboard からデプロイ

1. [Render](https://render.com/) にログイン
2. 「New」→「Static Site」
3. リポジトリを接続
4. 設定:
   - **Name**: `totonos`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
5. 環境変数を設定

#### 設定ファイル

`render.yaml`:
```yaml
services:
  - type: web
    name: totonos
    env: static
    buildCommand: npm install && npm run build
    staticPublishPath: ./dist
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
```

---

### Azure Static Web Apps

Microsoft Azure でのホスティング。

#### Azure Portal からデプロイ

1. Azure Portal → Static Web Apps → Create
2. GitHub を接続
3. ビルド設定:
   - **App location**: `/`
   - **Output location**: `dist`
4. 環境変数を Configuration で設定

#### Azure CLI でデプロイ

```bash
# Azure CLI インストール後
az login

# Static Web App 作成
az staticwebapp create \
  --name totonos \
  --resource-group your-rg \
  --source https://github.com/yukihamada/totonos \
  --branch main \
  --app-location "/" \
  --output-location "dist"
```

---

## CI/CD（自動デプロイ）

### GitHub Actions

`.github/workflows/deploy.yml` で自動デプロイを設定済みです。

#### 設定手順

1. GitHub リポジトリ → Settings → Secrets and variables → Actions
2. 以下のシークレットを追加:

| シークレット名 | 説明 | 必須 |
|---------------|------|------|
| `VITE_SUPABASE_URL` | Supabase URL | ✅ |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key | ✅ |
| `VERCEL_TOKEN` | Vercel アクセストークン | Vercel使用時 |
| `VERCEL_ORG_ID` | Vercel 組織ID | Vercel使用時 |
| `VERCEL_PROJECT_ID` | Vercel プロジェクトID | Vercel使用時 |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API トークン | CF使用時 |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare アカウントID | CF使用時 |
| `NETLIFY_AUTH_TOKEN` | Netlify アクセストークン | Netlify使用時 |
| `NETLIFY_SITE_ID` | Netlify サイトID | Netlify使用時 |
| `FIREBASE_SERVICE_ACCOUNT` | Firebase サービスアカウント JSON | Firebase使用時 |
| `FIREBASE_PROJECT_ID` | Firebase プロジェクトID | Firebase使用時 |

#### 動作

- **main ブランチへの push**: 自動的に Vercel にデプロイ
- **手動実行**: Actions タブから任意のプラットフォームを選択してデプロイ

#### Vercel トークンの取得方法

1. [Vercel Dashboard](https://vercel.com/account/tokens) → Create Token
2. トークンをコピー
3. `VERCEL_ORG_ID` と `VERCEL_PROJECT_ID` は `.vercel/project.json` から取得:
   ```bash
   vercel link  # プロジェクトをリンク
   cat .vercel/project.json
   ```

---

## 比較表

| プラットフォーム | 無料枠 | CDN | カスタムドメイン | 自動デプロイ | 特徴 |
|-----------------|--------|-----|-----------------|-------------|------|
| Vercel | ◎ | ○ | ○ | ○ | 最も簡単、Next.js最適化 |
| Cloudflare Pages | ◎ | ◎ | ○ | ○ | 最速CDN、無制限帯域 |
| Netlify | ◎ | ○ | ○ | ○ | 豊富な機能、Forms対応 |
| AWS Amplify | △ | ○ | ○ | ○ | AWS統合、エンタープライズ |
| Firebase | ○ | ○ | ○ | ○ | Google統合、Analytics |
| Fly.io | ○ | ○ | ○ | ○ | エッジコンピューティング |
| Railway | ○ | △ | ○ | ○ | シンプル、DB統合 |
| Render | ○ | ○ | ○ | ○ | 無料枠充実 |
| Azure | △ | ○ | ○ | ○ | Microsoft統合 |
| Docker | - | - | - | - | 完全なコントロール |

---

## トラブルシューティング

### ルーティングが動作しない

SPAのクライアントサイドルーティングには、サーバー側でフォールバック設定が必要です。

**確認ポイント:**
- 各プラットフォームの設定ファイル（vercel.json, netlify.toml など）が存在するか
- リダイレクト設定が正しいか

### 環境変数が反映されない

- Vite は `VITE_` プレフィックスの環境変数のみクライアントに公開します
- **ビルド時**に環境変数が設定されている必要があります（ランタイムではない）
- デプロイ後、キャッシュをクリアしてください

**確認方法:**
```bash
# ローカルでビルドして確認
VITE_SUPABASE_URL=test npm run build
grep -r "test" dist/  # 環境変数が埋め込まれているか確認
```

### ビルドエラー

```bash
# ローカルでビルドを確認
npm run build

# TypeScript エラーをチェック
npm run typecheck

# 依存関係を再インストール
rm -rf node_modules package-lock.json
npm install
```

### Supabase 接続エラー

```bash
# 環境変数を確認
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_PUBLISHABLE_KEY

# .env ファイルを確認
cat .env

# Supabase の状態を確認
curl https://your-project.supabase.co/rest/v1/ \
  -H "apikey: your-anon-key"
```

### Docker ビルドエラー

```bash
# キャッシュなしでビルド
docker build --no-cache -t totonos .

# ログを詳細に表示
docker build --progress=plain -t totonos .
```

### Vercel デプロイエラー

```bash
# ローカルでVercelビルドを確認
vercel build

# プロジェクト設定を確認
vercel env ls
```

---

## サポート

- [GitHub Issues](https://github.com/yukihamada/totonos/issues)
- Email: support@totonos.jp
