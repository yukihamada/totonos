#!/bin/bash
#
# Totonos デプロイスクリプト
# 使い方: ./deploy.sh [platform]
#
# 対応プラットフォーム:
#   vercel, cloudflare, netlify, firebase, fly, railway, render, docker
#

set -e

# 色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ロゴ
logo() {
  echo -e "${BLUE}"
  echo "  ╔════════════════════════════════════╗"
  echo "  ║        Totonos Deploy CLI          ║"
  echo "  ╚════════════════════════════════════╝"
  echo -e "${NC}"
}

# ヘルプ
help() {
  logo
  echo "使い方: ./deploy.sh [platform] [options]"
  echo ""
  echo "プラットフォーム:"
  echo "  vercel      Vercel にデプロイ"
  echo "  cloudflare  Cloudflare Pages にデプロイ"
  echo "  netlify     Netlify にデプロイ"
  echo "  firebase    Firebase Hosting にデプロイ"
  echo "  fly         Fly.io にデプロイ"
  echo "  railway     Railway にデプロイ"
  echo "  render      Render にデプロイ (ブラウザで開く)"
  echo "  docker      Docker イメージをビルド"
  echo "  supabase    Self-hosted Supabase を起動"
  echo ""
  echo "オプション:"
  echo "  --prod      本番環境にデプロイ"
  echo "  --setup     初期セットアップ (CLI インストール等)"
  echo ""
  echo "例:"
  echo "  ./deploy.sh vercel --prod"
  echo "  ./deploy.sh cloudflare --setup"
  echo "  ./deploy.sh docker"
}

# CLI がインストールされているかチェック
check_cli() {
  if ! command -v $1 &> /dev/null; then
    echo -e "${RED}✗ $1 がインストールされていません${NC}"
    return 1
  fi
  echo -e "${GREEN}✓ $1 が見つかりました${NC}"
  return 0
}

# 環境変数チェック
check_env() {
  if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_PUBLISHABLE_KEY" ]; then
    if [ -f .env ]; then
      source .env
    fi
  fi

  if [ -z "$VITE_SUPABASE_URL" ]; then
    echo -e "${YELLOW}⚠ VITE_SUPABASE_URL が設定されていません${NC}"
    echo "  .env ファイルを作成するか、環境変数を設定してください"
    return 1
  fi
  echo -e "${GREEN}✓ 環境変数OK${NC}"
  return 0
}

# ビルド
build() {
  echo -e "${BLUE}→ ビルド中...${NC}"
  npm run build
  echo -e "${GREEN}✓ ビルド完了${NC}"
}

# ===================
# Vercel
# ===================
deploy_vercel() {
  echo -e "${BLUE}▶ Vercel にデプロイ${NC}"

  if ! check_cli vercel; then
    echo "インストール: npm i -g vercel"
    if [ "$SETUP" = true ]; then
      npm i -g vercel
    else
      exit 1
    fi
  fi

  if [ "$PROD" = true ]; then
    vercel --prod
  else
    vercel
  fi

  echo -e "${GREEN}✓ Vercel デプロイ完了${NC}"
}

# ===================
# Cloudflare Pages
# ===================
deploy_cloudflare() {
  echo -e "${BLUE}▶ Cloudflare Pages にデプロイ${NC}"

  if ! check_cli wrangler; then
    echo "インストール: npm i -g wrangler"
    if [ "$SETUP" = true ]; then
      npm i -g wrangler
      wrangler login
    else
      exit 1
    fi
  fi

  build
  wrangler pages deploy dist --project-name=totonos

  echo -e "${GREEN}✓ Cloudflare デプロイ完了${NC}"
}

# ===================
# Netlify
# ===================
deploy_netlify() {
  echo -e "${BLUE}▶ Netlify にデプロイ${NC}"

  if ! check_cli netlify; then
    echo "インストール: npm i -g netlify-cli"
    if [ "$SETUP" = true ]; then
      npm i -g netlify-cli
      netlify login
    else
      exit 1
    fi
  fi

  build

  if [ "$PROD" = true ]; then
    netlify deploy --prod --dir=dist
  else
    netlify deploy --dir=dist
  fi

  echo -e "${GREEN}✓ Netlify デプロイ完了${NC}"
}

# ===================
# Firebase
# ===================
deploy_firebase() {
  echo -e "${BLUE}▶ Firebase Hosting にデプロイ${NC}"

  if ! check_cli firebase; then
    echo "インストール: npm i -g firebase-tools"
    if [ "$SETUP" = true ]; then
      npm i -g firebase-tools
      firebase login
    else
      exit 1
    fi
  fi

  build
  firebase deploy --only hosting

  echo -e "${GREEN}✓ Firebase デプロイ完了${NC}"
}

# ===================
# Fly.io
# ===================
deploy_fly() {
  echo -e "${BLUE}▶ Fly.io にデプロイ${NC}"

  if ! check_cli flyctl; then
    echo "インストール: curl -L https://fly.io/install.sh | sh"
    if [ "$SETUP" = true ]; then
      curl -L https://fly.io/install.sh | sh
      export PATH="$HOME/.fly/bin:$PATH"
      flyctl auth login
    else
      exit 1
    fi
  fi

  # 初回は launch
  if [ ! -f fly.toml ] || [ "$SETUP" = true ]; then
    flyctl launch --no-deploy
  fi

  flyctl deploy

  echo -e "${GREEN}✓ Fly.io デプロイ完了${NC}"
}

# ===================
# Railway
# ===================
deploy_railway() {
  echo -e "${BLUE}▶ Railway にデプロイ${NC}"

  if ! check_cli railway; then
    echo "インストール: npm i -g @railway/cli"
    if [ "$SETUP" = true ]; then
      npm i -g @railway/cli
      railway login
    else
      exit 1
    fi
  fi

  railway up

  echo -e "${GREEN}✓ Railway デプロイ完了${NC}"
}

# ===================
# Render
# ===================
deploy_render() {
  echo -e "${BLUE}▶ Render にデプロイ${NC}"
  echo ""
  echo "Render は GitHub 連携でデプロイします。"
  echo "ブラウザで Render ダッシュボードを開きます..."
  echo ""

  if command -v open &> /dev/null; then
    open "https://dashboard.render.com/select-repo?type=static"
  elif command -v xdg-open &> /dev/null; then
    xdg-open "https://dashboard.render.com/select-repo?type=static"
  else
    echo "以下のURLを開いてください:"
    echo "https://dashboard.render.com/select-repo?type=static"
  fi
}

# ===================
# Docker
# ===================
deploy_docker() {
  echo -e "${BLUE}▶ Docker イメージをビルド${NC}"

  if ! check_cli docker; then
    echo "Docker をインストールしてください: https://docs.docker.com/get-docker/"
    exit 1
  fi

  check_env || exit 1

  docker build \
    --build-arg VITE_SUPABASE_URL="$VITE_SUPABASE_URL" \
    --build-arg VITE_SUPABASE_PUBLISHABLE_KEY="$VITE_SUPABASE_PUBLISHABLE_KEY" \
    -t totonos .

  echo ""
  echo -e "${GREEN}✓ Docker イメージ作成完了${NC}"
  echo ""
  echo "実行方法:"
  echo "  docker run -p 3000:80 totonos"
  echo ""
  echo "Docker Hub にプッシュ:"
  echo "  docker tag totonos your-username/totonos"
  echo "  docker push your-username/totonos"
}

# ===================
# Self-hosted Supabase
# ===================
deploy_supabase() {
  echo -e "${BLUE}▶ Self-hosted Supabase を起動${NC}"

  if ! check_cli docker; then
    echo "Docker をインストールしてください"
    exit 1
  fi

  if [ ! -f .env.supabase ]; then
    echo -e "${YELLOW}⚠ .env.supabase が見つかりません${NC}"
    echo "テンプレートからコピーします..."
    cp .env.supabase.example .env.supabase
    echo -e "${YELLOW}⚠ .env.supabase を編集してシークレットを設定してください${NC}"
    exit 1
  fi

  # .env.supabase を読み込む
  export $(cat .env.supabase | grep -v '^#' | xargs)

  docker-compose -f docker-compose.supabase.yml up -d

  echo ""
  echo -e "${GREEN}✓ Supabase 起動完了${NC}"
  echo ""
  echo "アクセス:"
  echo "  Totonos:         http://localhost:3000"
  echo "  Supabase API:    http://localhost:8000"
  echo "  Supabase Studio: http://localhost:3001"
  echo ""
  echo "停止: docker-compose -f docker-compose.supabase.yml down"
}

# ===================
# メイン
# ===================

PROD=false
SETUP=false
PLATFORM=""

# 引数パース
for arg in "$@"; do
  case $arg in
    --prod)
      PROD=true
      ;;
    --setup)
      SETUP=true
      ;;
    -h|--help|help)
      help
      exit 0
      ;;
    *)
      if [ -z "$PLATFORM" ]; then
        PLATFORM=$arg
      fi
      ;;
  esac
done

# プラットフォーム未指定
if [ -z "$PLATFORM" ]; then
  help
  exit 0
fi

logo

# デプロイ実行
case $PLATFORM in
  vercel)
    deploy_vercel
    ;;
  cloudflare|cf)
    deploy_cloudflare
    ;;
  netlify)
    deploy_netlify
    ;;
  firebase|fb)
    deploy_firebase
    ;;
  fly|flyio)
    deploy_fly
    ;;
  railway)
    deploy_railway
    ;;
  render)
    deploy_render
    ;;
  docker)
    deploy_docker
    ;;
  supabase|sb)
    deploy_supabase
    ;;
  *)
    echo -e "${RED}✗ 不明なプラットフォーム: $PLATFORM${NC}"
    echo ""
    help
    exit 1
    ;;
esac
