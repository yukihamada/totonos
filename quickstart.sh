#!/bin/bash
#
# Totonos ワンコマンドセットアップ
#
# これ1つで:
#   1. 依存関係インストール
#   2. Supabase プロジェクト作成
#   3. データベースマイグレーション
#   4. 選択したクラウドにデプロイ
#
# 使い方:
#   curl -fsSL https://raw.githubusercontent.com/yukihamada/totonos/main/quickstart.sh | bash
#   または
#   ./quickstart.sh
#

set -e

# 色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# ロゴ
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
  echo -e "${BOLD}  10-in-1 Business OS - ワンコマンドセットアップ${NC}"
  echo ""
}

# スピナー
spinner() {
  local pid=$1
  local delay=0.1
  local spinstr='|/-\'
  while [ "$(ps a | awk '{print $1}' | grep $pid)" ]; do
    local temp=${spinstr#?}
    printf " [%c]  " "$spinstr"
    local spinstr=$temp${spinstr%"$temp"}
    sleep $delay
    printf "\b\b\b\b\b\b"
  done
  printf "    \b\b\b\b"
}

# ステップ表示
step() {
  echo -e "${BLUE}▶${NC} $1"
}

# 成功表示
success() {
  echo -e "${GREEN}✓${NC} $1"
}

# エラー表示
error() {
  echo -e "${RED}✗${NC} $1"
}

# 警告表示
warn() {
  echo -e "${YELLOW}⚠${NC} $1"
}

# コマンド存在チェック
check_command() {
  if command -v $1 &> /dev/null; then
    return 0
  else
    return 1
  fi
}

# Node.js チェック・インストール
setup_node() {
  step "Node.js をチェック..."

  if check_command node; then
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge 18 ]; then
      success "Node.js $(node -v) が見つかりました"
      return 0
    fi
  fi

  warn "Node.js 18+ が必要です"
  echo ""
  echo "インストール方法:"
  echo "  macOS:   brew install node"
  echo "  Ubuntu:  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs"
  echo "  Windows: https://nodejs.org/ からダウンロード"
  echo ""
  exit 1
}

# Git チェック
setup_git() {
  step "Git をチェック..."

  if check_command git; then
    success "Git が見つかりました"
    return 0
  fi

  error "Git がインストールされていません"
  exit 1
}

# リポジトリクローン
clone_repo() {
  step "リポジトリをクローン..."

  if [ -d "totonos" ]; then
    warn "totonos ディレクトリが既に存在します"
    cd totonos
    git pull origin main
  else
    git clone https://github.com/yukihamada/totonos.git
    cd totonos
  fi

  success "リポジトリ準備完了"
}

# 依存関係インストール
install_deps() {
  step "依存関係をインストール..."
  npm install --silent
  success "依存関係インストール完了"
}

# Supabase セットアップ
setup_supabase() {
  echo ""
  echo -e "${BOLD}Supabase のセットアップ${NC}"
  echo ""
  echo "Supabase はデータベースと認証を提供します。"
  echo ""
  echo "選択してください:"
  echo "  1) Supabase Cloud を使用 (推奨・無料枠あり)"
  echo "  2) 既存の Supabase プロジェクトを使用"
  echo "  3) Self-hosted Supabase (Docker)"
  echo "  4) デモモード (機能制限あり)"
  echo ""
  read -p "選択 [1-4]: " supabase_choice

  case $supabase_choice in
    1)
      setup_supabase_cloud
      ;;
    2)
      setup_supabase_existing
      ;;
    3)
      setup_supabase_selfhosted
      ;;
    4)
      setup_demo_mode
      ;;
    *)
      setup_supabase_cloud
      ;;
  esac
}

# Supabase Cloud 新規作成
setup_supabase_cloud() {
  step "Supabase Cloud をセットアップ..."

  echo ""
  echo "1. https://supabase.com にアクセス"
  echo "2. GitHub でサインアップ/ログイン"
  echo "3. 「New Project」をクリック"
  echo "4. プロジェクト名: totonos"
  echo "5. パスワードを設定"
  echo "6. リージョン: Northeast Asia (Tokyo)"
  echo "7. 「Create new project」をクリック"
  echo ""
  echo "プロジェクト作成後、Settings > API から:"
  echo ""

  read -p "Project URL を入力: " SUPABASE_URL
  read -p "anon public key を入力: " SUPABASE_ANON_KEY

  # .env 作成
  cat > .env << EOF
VITE_SUPABASE_URL=$SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY=$SUPABASE_ANON_KEY
EOF

  success "Supabase 設定完了"

  # マイグレーション
  run_migrations
}

# 既存 Supabase
setup_supabase_existing() {
  step "既存の Supabase プロジェクトを設定..."

  read -p "Project URL (例: https://xxxxx.supabase.co): " SUPABASE_URL
  read -p "anon public key: " SUPABASE_ANON_KEY

  cat > .env << EOF
VITE_SUPABASE_URL=$SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY=$SUPABASE_ANON_KEY
EOF

  success "Supabase 設定完了"
  run_migrations
}

# Self-hosted Supabase
setup_supabase_selfhosted() {
  step "Self-hosted Supabase をセットアップ..."

  if ! check_command docker; then
    error "Docker が必要です"
    echo "インストール: https://docs.docker.com/get-docker/"
    exit 1
  fi

  # 環境変数生成
  JWT_SECRET=$(openssl rand -base64 32)
  POSTGRES_PASSWORD=$(openssl rand -base64 24)

  cat > .env.supabase << EOF
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
POSTGRES_DB=postgres
JWT_SECRET=$JWT_SECRET
JWT_EXPIRY=3600
ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
SITE_URL=http://localhost:3000
API_EXTERNAL_URL=http://localhost:8000
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_ADMIN_EMAIL=admin@example.com
DISABLE_SIGNUP=false
ENABLE_EMAIL_AUTOCONFIRM=true
ENABLE_EMAIL_SIGNUP=true
EOF

  cat > .env << EOF
VITE_SUPABASE_URL=http://localhost:8000
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
EOF

  step "Docker コンテナを起動..."
  docker-compose -f docker-compose.supabase.yml up -d

  echo "Supabase の起動を待機中..."
  sleep 30

  success "Self-hosted Supabase 起動完了"
}

# デモモード
setup_demo_mode() {
  step "デモモードを設定..."

  warn "デモモードでは一部機能が制限されます"

  cat > .env << EOF
VITE_SUPABASE_URL=https://demo.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=demo-key
VITE_DEMO_MODE=true
EOF

  success "デモモード設定完了"
}

# マイグレーション実行
run_migrations() {
  step "データベースマイグレーションを実行..."

  if check_command supabase; then
    supabase db push --linked || true
    success "マイグレーション完了"
  else
    warn "Supabase CLI がないためマイグレーションをスキップ"
    echo "  手動で実行: npx supabase db push"
  fi
}

# デプロイ先選択
choose_deploy() {
  echo ""
  echo -e "${BOLD}デプロイ先を選択${NC}"
  echo ""
  echo "  1) Vercel (推奨・最速)"
  echo "  2) Cloudflare Pages"
  echo "  3) Netlify"
  echo "  4) Firebase Hosting"
  echo "  5) Fly.io"
  echo "  6) ローカルで実行のみ"
  echo ""
  read -p "選択 [1-6]: " deploy_choice

  case $deploy_choice in
    1) deploy_to_vercel ;;
    2) deploy_to_cloudflare ;;
    3) deploy_to_netlify ;;
    4) deploy_to_firebase ;;
    5) deploy_to_fly ;;
    6) run_local ;;
    *) deploy_to_vercel ;;
  esac
}

# Vercel デプロイ
deploy_to_vercel() {
  step "Vercel にデプロイ..."

  if ! check_command vercel; then
    npm i -g vercel
  fi

  vercel --prod

  success "Vercel デプロイ完了!"
}

# Cloudflare デプロイ
deploy_to_cloudflare() {
  step "Cloudflare Pages にデプロイ..."

  if ! check_command wrangler; then
    npm i -g wrangler
    wrangler login
  fi

  npm run build
  wrangler pages deploy dist --project-name=totonos

  success "Cloudflare デプロイ完了!"
}

# Netlify デプロイ
deploy_to_netlify() {
  step "Netlify にデプロイ..."

  if ! check_command netlify; then
    npm i -g netlify-cli
    netlify login
  fi

  npm run build
  netlify deploy --prod --dir=dist

  success "Netlify デプロイ完了!"
}

# Firebase デプロイ
deploy_to_firebase() {
  step "Firebase にデプロイ..."

  if ! check_command firebase; then
    npm i -g firebase-tools
    firebase login
  fi

  npm run build
  firebase deploy --only hosting

  success "Firebase デプロイ完了!"
}

# Fly.io デプロイ
deploy_to_fly() {
  step "Fly.io にデプロイ..."

  if ! check_command flyctl; then
    curl -L https://fly.io/install.sh | sh
    export PATH="$HOME/.fly/bin:$PATH"
    flyctl auth login
  fi

  flyctl launch --now

  success "Fly.io デプロイ完了!"
}

# ローカル実行
run_local() {
  step "ローカルサーバーを起動..."

  echo ""
  echo -e "${GREEN}セットアップ完了!${NC}"
  echo ""
  echo "以下のコマンドでローカル起動:"
  echo ""
  echo "  cd totonos"
  echo "  npm run dev"
  echo ""
  echo "ブラウザで http://localhost:5173 を開く"
  echo ""

  read -p "今すぐ起動しますか? [y/N]: " run_now

  if [ "$run_now" = "y" ] || [ "$run_now" = "Y" ]; then
    npm run dev
  fi
}

# 完了メッセージ
finish() {
  echo ""
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}  🎉 セットアップ完了!${NC}"
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo "次のステップ:"
  echo "  1. デプロイされたURLにアクセス"
  echo "  2. アカウントを作成"
  echo "  3. 業種を選択して開始!"
  echo ""
  echo "ドキュメント: https://github.com/yukihamada/totonos"
  echo ""
}

# ===================
# メイン処理
# ===================

logo

# 前提条件チェック
setup_node
setup_git

echo ""

# 既にtotonos内にいるか確認
if [ -f "package.json" ] && grep -q '"name": "totonos"' package.json; then
  step "既存のプロジェクトを使用..."
else
  clone_repo
fi

install_deps
setup_supabase
choose_deploy
finish
