#!/bin/bash
#
# Totonos ワンコマンドセットアップ
#
# 完全自動:
#   1. CLIをインストール
#   2. Supabase プロジェクト作成 & 設定を自動取得
#   3. クラウドにデプロイ
#
# 使い方:
#   curl -fsSL https://raw.githubusercontent.com/yukihamada/totonos/main/quickstart.sh | bash
#

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

logo() {
  clear
  echo -e "${CYAN}"
  echo "  ████████╗ ██████╗ ████████╗ ██████╗ ███╗   ██╗ ██████╗ ███████╗"
  echo "  ╚══██╔══╝██╔═══██╗╚══██╔══╝██╔═══██╗████╗  ██║██╔═══██╗██╔════╝"
  echo "     ██║   ██║   ██║   ██║   ██║   ██║██╔██╗ ██║██║   ██║███████╗"
  echo "     ██║   ██║   ██║   ██║   ██║   ██║██║╚██╗██║██║   ██║╚════██║"
  echo "     ██║   ╚██████╔╝   ██║   ╚██████╔╝██║ ╚████║╚██████╔╝███████║"
  echo "     ╚═╝    ╚═════╝    ╚═╝    ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝ ╚══════╝"
  echo -e "${NC}"
  echo -e "${BOLD}  完全自動セットアップ${NC}"
  echo ""
}

step() { echo -e "${BLUE}▶${NC} $1"; }
success() { echo -e "${GREEN}✓${NC} $1"; }
error() { echo -e "${RED}✗${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC} $1"; }

check_command() { command -v $1 &> /dev/null; }

# ===================
# Node.js
# ===================
setup_node() {
  step "Node.js をチェック..."

  if check_command node; then
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge 18 ]; then
      success "Node.js $(node -v)"
      return 0
    fi
  fi

  warn "Node.js 18+ をインストール中..."

  if check_command brew; then
    brew install node
  elif check_command apt-get; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
  else
    error "Node.js を手動でインストールしてください: https://nodejs.org/"
    exit 1
  fi

  success "Node.js インストール完了"
}

# ===================
# Supabase CLI
# ===================
setup_supabase_cli() {
  step "Supabase CLI をチェック..."

  if check_command supabase; then
    success "Supabase CLI が見つかりました"
    return 0
  fi

  warn "Supabase CLI をインストール中..."

  if check_command brew; then
    brew install supabase/tap/supabase
  elif check_command npm; then
    npm i -g supabase
  else
    error "Supabase CLI をインストールできません"
    exit 1
  fi

  success "Supabase CLI インストール完了"
}

# ===================
# Supabase ログイン & プロジェクト作成
# ===================
setup_supabase_auto() {
  step "Supabase にログイン..."

  # ログイン状態確認
  if ! supabase projects list &>/dev/null; then
    echo ""
    echo "ブラウザが開きます。Supabase にログインしてください。"
    echo ""
    supabase login
  fi

  success "Supabase ログイン完了"

  # プロジェクト選択または作成
  echo ""
  echo -e "${BOLD}Supabase プロジェクト${NC}"
  echo ""
  echo "  1) 新規プロジェクトを作成"
  echo "  2) 既存プロジェクトを使用"
  echo ""
  read -p "選択 [1-2]: " project_choice

  if [ "$project_choice" = "1" ]; then
    create_supabase_project
  else
    select_supabase_project
  fi
}

# Supabase プロジェクト新規作成
create_supabase_project() {
  step "新規プロジェクトを作成..."

  # 組織一覧を取得
  echo ""
  echo "組織を選択:"
  ORGS=$(supabase orgs list --output json 2>/dev/null || echo "[]")

  if [ "$ORGS" = "[]" ]; then
    error "組織が見つかりません。https://supabase.com で組織を作成してください。"
    exit 1
  fi

  echo "$ORGS" | jq -r '.[] | "\(.id): \(.name)"'
  echo ""
  read -p "組織ID: " ORG_ID

  # プロジェクト名
  read -p "プロジェクト名 [totonos]: " PROJECT_NAME
  PROJECT_NAME=${PROJECT_NAME:-totonos}

  # DBパスワード生成
  DB_PASS=$(openssl rand -base64 24 | tr -d '/+=' | cut -c1-24)

  # リージョン
  echo ""
  echo "リージョン:"
  echo "  1) ap-northeast-1 (東京)"
  echo "  2) ap-southeast-1 (シンガポール)"
  echo "  3) us-west-1 (米国西部)"
  read -p "選択 [1]: " region_choice

  case $region_choice in
    2) REGION="ap-southeast-1" ;;
    3) REGION="us-west-1" ;;
    *) REGION="ap-northeast-1" ;;
  esac

  # プロジェクト作成
  step "プロジェクトを作成中 (数分かかります)..."

  PROJECT_OUTPUT=$(supabase projects create "$PROJECT_NAME" \
    --org-id "$ORG_ID" \
    --db-password "$DB_PASS" \
    --region "$REGION" \
    --output json 2>&1)

  PROJECT_ID=$(echo "$PROJECT_OUTPUT" | jq -r '.id // empty')

  if [ -z "$PROJECT_ID" ]; then
    error "プロジェクト作成に失敗しました"
    echo "$PROJECT_OUTPUT"
    exit 1
  fi

  success "プロジェクト作成完了: $PROJECT_ID"

  # API キー取得
  get_project_keys "$PROJECT_ID"
}

# 既存プロジェクト選択
select_supabase_project() {
  step "プロジェクト一覧を取得..."

  echo ""
  supabase projects list
  echo ""
  read -p "プロジェクトID (例: abcdefghijklmnop): " PROJECT_ID

  get_project_keys "$PROJECT_ID"
}

# APIキー取得
get_project_keys() {
  local PROJECT_ID=$1

  step "API キーを取得中..."

  # プロジェクトにリンク
  supabase link --project-ref "$PROJECT_ID" 2>/dev/null || true

  # API キー取得
  KEYS_OUTPUT=$(supabase projects api-keys --project-ref "$PROJECT_ID" --output json 2>/dev/null)

  if [ -z "$KEYS_OUTPUT" ]; then
    # 別の方法で取得
    warn "API キーを手動で入力してください"
    echo ""
    echo "https://supabase.com/dashboard/project/$PROJECT_ID/settings/api"
    echo ""
    read -p "Project URL: " SUPABASE_URL
    read -p "anon public key: " SUPABASE_ANON_KEY
  else
    SUPABASE_ANON_KEY=$(echo "$KEYS_OUTPUT" | jq -r '.[] | select(.name=="anon") | .api_key')
    SUPABASE_URL="https://${PROJECT_ID}.supabase.co"
  fi

  # .env 作成
  cat > .env << EOF
VITE_SUPABASE_URL=$SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY=$SUPABASE_ANON_KEY
EOF

  success "Supabase 設定完了"
  echo ""
  echo "  URL: $SUPABASE_URL"
  echo "  Key: ${SUPABASE_ANON_KEY:0:20}..."
  echo ""

  # マイグレーション
  run_migrations "$PROJECT_ID"
}

# マイグレーション
run_migrations() {
  local PROJECT_ID=$1

  step "データベースをセットアップ..."

  if [ -d "supabase/migrations" ]; then
    supabase db push --linked 2>/dev/null || supabase db push --project-ref "$PROJECT_ID" 2>/dev/null || true
    success "マイグレーション完了"
  fi
}

# ===================
# デプロイ先選択
# ===================
choose_deploy() {
  echo ""
  echo -e "${BOLD}デプロイ先を選択${NC}"
  echo ""
  echo "  1) Vercel      - 最速、推奨"
  echo "  2) Cloudflare  - 高速CDN"
  echo "  3) Netlify     - 簡単"
  echo "  4) ローカルのみ"
  echo ""
  read -p "選択 [1-4]: " deploy_choice

  case $deploy_choice in
    1) deploy_vercel ;;
    2) deploy_cloudflare ;;
    3) deploy_netlify ;;
    *) run_local ;;
  esac
}

# ===================
# Vercel デプロイ (自動設定)
# ===================
deploy_vercel() {
  step "Vercel にデプロイ..."

  # Vercel CLI インストール
  if ! check_command vercel; then
    npm i -g vercel
  fi

  # ログイン確認
  if ! vercel whoami &>/dev/null; then
    echo ""
    echo "Vercel にログインしてください:"
    vercel login
  fi

  # 環境変数を設定してデプロイ
  echo ""
  step "環境変数を設定..."

  # .env から読み込み
  source .env

  # デプロイ (初回は対話式、2回目以降は自動)
  vercel --prod \
    -e VITE_SUPABASE_URL="$VITE_SUPABASE_URL" \
    -e VITE_SUPABASE_PUBLISHABLE_KEY="$VITE_SUPABASE_PUBLISHABLE_KEY"

  echo ""
  success "Vercel デプロイ完了!"

  # デプロイURLを取得
  DEPLOY_URL=$(vercel inspect --output json 2>/dev/null | jq -r '.url // empty')
  if [ -n "$DEPLOY_URL" ]; then
    echo ""
    echo -e "${GREEN}🚀 https://$DEPLOY_URL${NC}"
  fi
}

# ===================
# Cloudflare デプロイ (自動設定)
# ===================
deploy_cloudflare() {
  step "Cloudflare Pages にデプロイ..."

  if ! check_command wrangler; then
    npm i -g wrangler
  fi

  # ログイン確認
  if ! wrangler whoami &>/dev/null; then
    echo ""
    wrangler login
  fi

  # ビルド
  npm run build

  # デプロイ
  wrangler pages deploy dist --project-name=totonos

  success "Cloudflare デプロイ完了!"
}

# ===================
# Netlify デプロイ (自動設定)
# ===================
deploy_netlify() {
  step "Netlify にデプロイ..."

  if ! check_command netlify; then
    npm i -g netlify-cli
  fi

  # ログイン確認
  if ! netlify status &>/dev/null; then
    netlify login
  fi

  # ビルド
  npm run build

  # 環境変数設定 & デプロイ
  source .env

  netlify deploy --prod --dir=dist \
    --build-env VITE_SUPABASE_URL="$VITE_SUPABASE_URL" \
    --build-env VITE_SUPABASE_PUBLISHABLE_KEY="$VITE_SUPABASE_PUBLISHABLE_KEY"

  success "Netlify デプロイ完了!"
}

# ===================
# ローカル実行
# ===================
run_local() {
  echo ""
  success "セットアップ完了!"
  echo ""
  echo "ローカル起動:"
  echo "  npm run dev"
  echo ""
  echo "ブラウザで http://localhost:5173 を開く"
  echo ""

  read -p "今すぐ起動? [Y/n]: " run_now
  if [ "$run_now" != "n" ] && [ "$run_now" != "N" ]; then
    npm run dev
  fi
}

# ===================
# リポジトリ準備
# ===================
prepare_repo() {
  if [ -f "package.json" ] && grep -q '"name": "totonos"' package.json 2>/dev/null; then
    step "既存プロジェクトを使用"
  else
    step "リポジトリをクローン..."
    git clone https://github.com/yukihamada/totonos.git
    cd totonos
  fi

  step "依存関係をインストール..."
  npm install --silent
  success "準備完了"
}

# ===================
# メイン
# ===================

logo

# 前提条件
setup_node
check_command git || { error "Git が必要です"; exit 1; }

# リポジトリ準備
prepare_repo

# Supabase セットアップ
setup_supabase_cli
setup_supabase_auto

# デプロイ
choose_deploy

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  🎉 完了！${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
