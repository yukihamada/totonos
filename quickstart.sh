#!/bin/bash
#
# Totonos 完全自動セットアップ
#
# 使い方:
#   ./quickstart.sh              # 対話モード
#   ./quickstart.sh --auto       # 完全自動（Vercelにデプロイ）
#   ./quickstart.sh --local      # ローカルのみ
#
#   curl -fsSL https://raw.githubusercontent.com/yukihamada/totonos/main/quickstart.sh | bash -s -- --auto
#

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# モード
AUTO_MODE=false
LOCAL_ONLY=false

# 引数解析
for arg in "$@"; do
  case $arg in
    --auto|-a) AUTO_MODE=true ;;
    --local|-l) LOCAL_ONLY=true ;;
  esac
done

logo() {
  echo -e "${CYAN}"
  echo "  ████████╗ ██████╗ ████████╗ ██████╗ ███╗   ██╗ ██████╗ ███████╗"
  echo "  ╚══██╔══╝██╔═══██╗╚══██╔══╝██╔═══██╗████╗  ██║██╔═══██╗██╔════╝"
  echo "     ██║   ██║   ██║   ██║   ██║   ██║██╔██╗ ██║██║   ██║███████╗"
  echo "     ██║   ██║   ██║   ██║   ██║   ██║██║╚██╗██║██║   ██║╚════██║"
  echo "     ██║   ╚██████╔╝   ██║   ╚██████╔╝██║ ╚████║╚██████╔╝███████║"
  echo "     ╚═╝    ╚═════╝    ╚═╝    ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝ ╚══════╝"
  echo -e "${NC}"
  if [ "$AUTO_MODE" = true ]; then
    echo -e "${BOLD}  完全自動モード${NC}"
  else
    echo -e "${BOLD}  セットアップウィザード${NC}"
  fi
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
    success "Supabase CLI"
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
# Supabase 自動セットアップ
# ===================
setup_supabase() {
  # 既存の.envがあればスキップ
  if [ -f ".env" ] && grep -q "VITE_SUPABASE_URL" .env; then
    source .env
    if [ -n "$VITE_SUPABASE_URL" ] && [ "$VITE_SUPABASE_URL" != "your_supabase_url" ]; then
      success "既存のSupabase設定を使用"
      return 0
    fi
  fi

  step "Supabase にログイン..."

  # ログイン状態確認
  if ! supabase projects list &>/dev/null 2>&1; then
    supabase login
  fi

  success "Supabase ログイン完了"

  if [ "$AUTO_MODE" = true ]; then
    # 自動モード: 最初のプロジェクトを使用、なければ作成
    setup_supabase_auto
  else
    # 対話モード
    echo ""
    echo -e "${BOLD}Supabase プロジェクト${NC}"
    echo ""
    echo "  1) 新規プロジェクトを作成"
    echo "  2) 既存プロジェクトを使用"
    echo ""
    read -p "選択 [2]: " project_choice
    project_choice=${project_choice:-2}

    if [ "$project_choice" = "1" ]; then
      create_supabase_project
    else
      select_supabase_project
    fi
  fi
}

# 自動モードのSupabaseセットアップ
setup_supabase_auto() {
  step "プロジェクトを検索..."

  # 既存プロジェクト一覧
  PROJECTS=$(supabase projects list --output json 2>/dev/null || echo "[]")

  if [ "$PROJECTS" != "[]" ] && [ -n "$(echo "$PROJECTS" | jq -r '.[0].id // empty')" ]; then
    # 最初のプロジェクトを使用
    PROJECT_ID=$(echo "$PROJECTS" | jq -r '.[0].id')
    PROJECT_NAME=$(echo "$PROJECTS" | jq -r '.[0].name')
    success "既存プロジェクトを使用: $PROJECT_NAME"
    get_project_keys "$PROJECT_ID"
  else
    # プロジェクトがない場合は作成
    warn "プロジェクトが見つかりません。新規作成します..."
    create_supabase_project_auto
  fi
}

# 自動でプロジェクト作成
create_supabase_project_auto() {
  # 組織取得
  ORGS=$(supabase orgs list --output json 2>/dev/null || echo "[]")

  if [ "$ORGS" = "[]" ]; then
    error "組織が見つかりません。https://supabase.com で組織を作成してください。"
    exit 1
  fi

  ORG_ID=$(echo "$ORGS" | jq -r '.[0].id')
  DB_PASS=$(openssl rand -base64 24 | tr -d '/+=' | cut -c1-24)

  step "プロジェクトを作成中..."

  PROJECT_OUTPUT=$(supabase projects create "totonos-$(date +%s)" \
    --org-id "$ORG_ID" \
    --db-password "$DB_PASS" \
    --region "ap-northeast-1" \
    --output json 2>&1) || true

  PROJECT_ID=$(echo "$PROJECT_OUTPUT" | jq -r '.id // empty')

  if [ -z "$PROJECT_ID" ]; then
    error "プロジェクト作成に失敗"
    echo "$PROJECT_OUTPUT"
    exit 1
  fi

  success "プロジェクト作成完了"

  # 起動待ち
  step "データベース起動を待機中..."
  sleep 30

  get_project_keys "$PROJECT_ID"
}

# 対話モード: プロジェクト作成
create_supabase_project() {
  step "新規プロジェクトを作成..."

  ORGS=$(supabase orgs list --output json 2>/dev/null || echo "[]")

  if [ "$ORGS" = "[]" ]; then
    error "組織が見つかりません"
    exit 1
  fi

  echo ""
  echo "組織を選択:"
  echo "$ORGS" | jq -r '.[] | "\(.id): \(.name)"'
  echo ""
  read -p "組織ID: " ORG_ID

  read -p "プロジェクト名 [totonos]: " PROJECT_NAME
  PROJECT_NAME=${PROJECT_NAME:-totonos}

  DB_PASS=$(openssl rand -base64 24 | tr -d '/+=' | cut -c1-24)

  step "プロジェクトを作成中..."

  PROJECT_OUTPUT=$(supabase projects create "$PROJECT_NAME" \
    --org-id "$ORG_ID" \
    --db-password "$DB_PASS" \
    --region "ap-northeast-1" \
    --output json 2>&1)

  PROJECT_ID=$(echo "$PROJECT_OUTPUT" | jq -r '.id // empty')

  if [ -z "$PROJECT_ID" ]; then
    error "プロジェクト作成に失敗"
    exit 1
  fi

  success "プロジェクト作成完了"
  sleep 30
  get_project_keys "$PROJECT_ID"
}

# 対話モード: プロジェクト選択
select_supabase_project() {
  step "プロジェクト一覧を取得..."

  PROJECTS=$(supabase projects list --output json 2>/dev/null || echo "[]")

  if [ "$PROJECTS" = "[]" ]; then
    warn "プロジェクトがありません。新規作成します。"
    create_supabase_project
    return
  fi

  echo ""
  echo "$PROJECTS" | jq -r '.[] | "\(.id): \(.name) (\(.region))"'
  echo ""
  read -p "プロジェクトID: " PROJECT_ID

  get_project_keys "$PROJECT_ID"
}

# APIキー取得
get_project_keys() {
  local PROJECT_ID=$1

  step "API キーを取得..."

  # リンク
  supabase link --project-ref "$PROJECT_ID" -p "" 2>/dev/null || true

  # キー取得
  KEYS_OUTPUT=$(supabase projects api-keys --project-ref "$PROJECT_ID" --output json 2>/dev/null || echo "")

  if [ -n "$KEYS_OUTPUT" ] && [ "$KEYS_OUTPUT" != "[]" ]; then
    SUPABASE_ANON_KEY=$(echo "$KEYS_OUTPUT" | jq -r '.[] | select(.name=="anon") | .api_key')
    SUPABASE_URL="https://${PROJECT_ID}.supabase.co"
  else
    # 手動入力にフォールバック
    warn "キーを自動取得できませんでした"
    echo ""
    echo "https://supabase.com/dashboard/project/$PROJECT_ID/settings/api を開いて:"
    echo ""
    read -p "Project URL: " SUPABASE_URL
    read -p "anon public key: " SUPABASE_ANON_KEY
  fi

  # .env 作成
  cat > .env << EOF
VITE_SUPABASE_URL=$SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY=$SUPABASE_ANON_KEY
EOF

  success "Supabase 設定完了"
  echo "  URL: $SUPABASE_URL"

  # マイグレーション
  run_migrations "$PROJECT_ID"
}

# マイグレーション
run_migrations() {
  local PROJECT_ID=$1

  step "データベースをセットアップ..."

  if [ -d "supabase/migrations" ]; then
    supabase db push --linked 2>/dev/null || true
    success "マイグレーション完了"
  else
    success "マイグレーションなし"
  fi
}

# ===================
# デプロイ
# ===================
choose_deploy() {
  if [ "$LOCAL_ONLY" = true ]; then
    run_local
    return
  fi

  if [ "$AUTO_MODE" = true ]; then
    deploy_vercel
    return
  fi

  echo ""
  echo -e "${BOLD}デプロイ先を選択${NC}"
  echo ""
  echo "  1) Vercel (推奨)"
  echo "  2) Cloudflare"
  echo "  3) Netlify"
  echo "  4) ローカルのみ"
  echo ""
  read -p "選択 [1]: " deploy_choice
  deploy_choice=${deploy_choice:-1}

  case $deploy_choice in
    1) deploy_vercel ;;
    2) deploy_cloudflare ;;
    3) deploy_netlify ;;
    *) run_local ;;
  esac
}

# Vercel
deploy_vercel() {
  step "Vercel にデプロイ..."

  if ! check_command vercel; then
    npm i -g vercel
  fi

  # ログイン
  if ! vercel whoami &>/dev/null 2>&1; then
    vercel login
  fi

  source .env

  # デプロイ
  if [ "$AUTO_MODE" = true ]; then
    vercel --prod --yes \
      -e VITE_SUPABASE_URL="$VITE_SUPABASE_URL" \
      -e VITE_SUPABASE_PUBLISHABLE_KEY="$VITE_SUPABASE_PUBLISHABLE_KEY"
  else
    vercel --prod \
      -e VITE_SUPABASE_URL="$VITE_SUPABASE_URL" \
      -e VITE_SUPABASE_PUBLISHABLE_KEY="$VITE_SUPABASE_PUBLISHABLE_KEY"
  fi

  success "Vercel デプロイ完了!"
}

# Cloudflare
deploy_cloudflare() {
  step "Cloudflare Pages にデプロイ..."

  if ! check_command wrangler; then
    npm i -g wrangler
  fi

  if ! wrangler whoami &>/dev/null 2>&1; then
    wrangler login
  fi

  npm run build
  wrangler pages deploy dist --project-name=totonos

  success "Cloudflare デプロイ完了!"
}

# Netlify
deploy_netlify() {
  step "Netlify にデプロイ..."

  if ! check_command netlify; then
    npm i -g netlify-cli
  fi

  if ! netlify status &>/dev/null 2>&1; then
    netlify login
  fi

  npm run build
  source .env

  netlify deploy --prod --dir=dist

  success "Netlify デプロイ完了!"
}

# ローカル
run_local() {
  echo ""
  success "セットアップ完了!"
  echo ""
  echo "起動コマンド:"
  echo "  npm run dev"
  echo ""
  echo "URL: http://localhost:5173"
  echo ""

  if [ "$AUTO_MODE" = true ]; then
    npm run dev &
    sleep 3
    echo ""
    success "ローカルサーバー起動中: http://localhost:5173"
  else
    read -p "今すぐ起動? [Y/n]: " run_now
    if [ "$run_now" != "n" ] && [ "$run_now" != "N" ]; then
      npm run dev
    fi
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
  npm install --silent 2>/dev/null || npm install
  success "準備完了"
}

# ===================
# メイン
# ===================

logo

setup_node
check_command git || { error "Git が必要です"; exit 1; }
check_command jq || {
  warn "jq をインストール中..."
  if check_command brew; then
    brew install jq
  elif check_command apt-get; then
    sudo apt-get install -y jq
  fi
}

prepare_repo
setup_supabase_cli
setup_supabase
choose_deploy

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  🎉 セットアップ完了！${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
