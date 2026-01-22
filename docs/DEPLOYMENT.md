# デプロイガイド

Totonos は様々なクラウドプラットフォームにデプロイできます。

## 必要な環境変数

すべてのプラットフォームで以下の環境変数を設定してください：

| 変数名 | 説明 |
|--------|------|
| `VITE_SUPABASE_URL` | Supabase プロジェクトURL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key |

---

## Vercel

最も簡単なデプロイ方法です。

### ワンクリックデプロイ

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yukihamada/totonos)

### CLI でデプロイ

```bash
# Vercel CLI インストール
npm i -g vercel

# デプロイ
vercel

# 本番環境にデプロイ
vercel --prod
```

### 環境変数設定

Vercel Dashboard → Settings → Environment Variables で設定

---

## Cloudflare Pages

高速なグローバルCDNでホスティング。

### Wrangler CLI でデプロイ

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

### GitHub 連携

1. Cloudflare Dashboard → Pages → Create a project
2. GitHub リポジトリを接続
3. ビルド設定:
   - Build command: `npm run build`
   - Build output directory: `dist`
4. 環境変数を設定

---

## Netlify

継続的デプロイメントに最適。

### ワンクリックデプロイ

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yukihamada/totonos)

### CLI でデプロイ

```bash
# Netlify CLI インストール
npm i -g netlify-cli

# ログイン
netlify login

# デプロイ（プレビュー）
netlify deploy

# 本番デプロイ
netlify deploy --prod
```

---

## AWS Amplify

AWSエコシステムとの統合に最適。

### AWS Console からデプロイ

1. AWS Amplify Console を開く
2. 「Host web app」→「GitHub」を選択
3. リポジトリとブランチを選択
4. ビルド設定は自動検出（amplify.yml）
5. 環境変数を設定
6. デプロイ

### Amplify CLI でデプロイ

```bash
# Amplify CLI インストール
npm i -g @aws-amplify/cli

# 初期化
amplify init

# ホスティング追加
amplify add hosting

# デプロイ
amplify publish
```

### リダイレクト設定

Amplify Console → Rewrites and redirects:
- Source: `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json)$)([^.]+$)/>`
- Target: `/index.html`
- Type: `200 (Rewrite)`

---

## Firebase Hosting

Google Cloud との統合に最適。

### デプロイ手順

```bash
# Firebase CLI インストール
npm i -g firebase-tools

# ログイン
firebase login

# プロジェクト初期化（初回のみ）
firebase init hosting

# ビルド
npm run build

# デプロイ
firebase deploy --only hosting
```

### .firebaserc の設定

```json
{
  "projects": {
    "default": "your-project-id"
  }
}
```

---

## Docker / Kubernetes

コンテナベースのデプロイ。

### ローカルでビルド・実行

```bash
# イメージをビルド
docker build \
  --build-arg VITE_SUPABASE_URL=your_url \
  --build-arg VITE_SUPABASE_PUBLISHABLE_KEY=your_key \
  -t totonos .

# コンテナを実行
docker run -p 3000:80 totonos
```

### Docker Compose で実行

```bash
# .env ファイルを作成
cp .env.example .env
# .env を編集

# 起動
docker-compose up -d

# 開発モード
docker-compose --profile dev up
```

### Kubernetes にデプロイ

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
        livenessProbe:
          httpGet:
            path: /health
            port: 80
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

---

## Fly.io

グローバルエッジコンピューティング。

### デプロイ手順

```bash
# Fly CLI インストール
curl -L https://fly.io/install.sh | sh

# ログイン
fly auth login

# アプリ作成（初回のみ）
fly launch

# 環境変数設定
fly secrets set VITE_SUPABASE_URL=your_url
fly secrets set VITE_SUPABASE_PUBLISHABLE_KEY=your_key

# デプロイ
fly deploy
```

---

## Railway

シンプルなPaaS。

### デプロイ手順

1. [Railway](https://railway.app/) にログイン
2. 「New Project」→「Deploy from GitHub repo」
3. リポジトリを選択
4. 環境変数を設定
5. 自動デプロイ開始

### CLI でデプロイ

```bash
# Railway CLI インストール
npm i -g @railway/cli

# ログイン
railway login

# プロジェクト初期化
railway init

# デプロイ
railway up
```

---

## Render

無料枠が充実したPaaS。

### デプロイ手順

1. [Render](https://render.com/) にログイン
2. 「New」→「Static Site」
3. リポジトリを接続
4. 設定:
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
5. 環境変数を設定

---

## Azure Static Web Apps

Microsoft Azure でのホスティング。

### Azure Portal からデプロイ

1. Azure Portal → Static Web Apps → Create
2. GitHub を接続
3. ビルド設定:
   - App location: `/`
   - Output location: `dist`
4. 環境変数を Configuration で設定

### Azure CLI でデプロイ

```bash
# Azure CLI インストール後
az login

az staticwebapp create \
  --name totonos \
  --resource-group your-rg \
  --source https://github.com/yukihamada/totonos \
  --branch main \
  --app-location "/" \
  --output-location "dist"
```

---

## GitHub Pages

無料の静的サイトホスティング。

### GitHub Actions でデプロイ

`.github/workflows/deploy.yml` を作成:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install and Build
        run: |
          npm ci
          npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_PUBLISHABLE_KEY: ${{ secrets.VITE_SUPABASE_PUBLISHABLE_KEY }}

      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

`vite.config.ts` に base を追加:

```typescript
export default defineConfig({
  base: '/totonos/',  // リポジトリ名
  // ...
})
```

---

## 比較表

| プラットフォーム | 無料枠 | CDN | カスタムドメイン | 自動デプロイ |
|-----------------|--------|-----|-----------------|-------------|
| Vercel | ○ | ○ | ○ | ○ |
| Cloudflare Pages | ○ | ○ | ○ | ○ |
| Netlify | ○ | ○ | ○ | ○ |
| AWS Amplify | △ | ○ | ○ | ○ |
| Firebase | ○ | ○ | ○ | ○ |
| Fly.io | ○ | ○ | ○ | ○ |
| Railway | ○ | △ | ○ | ○ |
| Render | ○ | ○ | ○ | ○ |
| Azure | △ | ○ | ○ | ○ |
| GitHub Pages | ○ | ○ | ○ | ○ |

---

## トラブルシューティング

### ルーティングが動作しない

SPAのクライアントサイドルーティングには、サーバー側でフォールバック設定が必要です。各プラットフォームの設定ファイルで対応済みですが、問題がある場合は `index.html` へのリダイレクト設定を確認してください。

### 環境変数が反映されない

- Vite は `VITE_` プレフィックスの環境変数のみクライアントに公開します
- ビルド時に環境変数が設定されている必要があります
- デプロイ後、キャッシュをクリアしてください

### ビルドエラー

```bash
# ローカルでビルドを確認
npm run build

# TypeScript エラーをチェック
npm run typecheck
```
