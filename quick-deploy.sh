#!/bin/bash

# MiniPlus 应用一键部署脚本
# 使用方法: ./quick-deploy.sh YOUR_GITHUB_USERNAME

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查参数
if [ $# -eq 0 ]; then
    echo -e "${RED}错误: 请提供GitHub用户名${NC}"
    echo -e "${YELLOW}使用方法: $0 YOUR_GITHUB_USERNAME${NC}"
    exit 1
fi

GITHUB_USERNAME=$1
REPO_NAME="miniplus-app"
REMOTE_URL="https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"

echo -e "${BLUE}🚀 MiniPlus 应用一键部署脚本${NC}"
echo "=================================="

# 检查Git是否已安装
if ! command -v git &> /dev/null; then
    echo -e "${RED}错误: Git未安装，请先安装Git${NC}"
    exit 1
fi

# 检查是否在正确目录
if [ ! -f "package.json" ]; then
    echo -e "${RED}错误: 请在MiniPlus项目根目录运行此脚本${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 步骤1: 初始化Git仓库${NC}"
if [ ! -d ".git" ]; then
    git init
    echo "✅ Git仓库已初始化"
else
    echo "✅ Git仓库已存在"
fi

echo -e "${YELLOW}📝 步骤2: 配置Git用户信息${NC}"
read -p "请输入您的GitHub邮箱: " GITHUB_EMAIL
git config user.email "$GITHUB_EMAIL"
git config user.name "$GITHUB_USERNAME"

echo -e "${YELLOW}🔧 步骤3: 安装依赖并构建${NC}"
npm install
npm run build
echo "✅ 应用构建完成"

echo -e "${YELLOW}📤 步骤4: 添加文件到Git${NC}"
git add .
git commit -m "MiniPlus营养健康应用 - 集成Gemini AI

✨ 功能特性:
- 三种用户界面 (家庭管理员/成员/单身)
- Gemini AI 驱动的智能食谱推荐
- PWA 原生应用体验
- 响应式移动端设计
- 家庭健康数据管理
- 个性化营养分析

🤖 AI功能:
- 智能对话助手
- 个性化食谱推荐
- 营养成分分析
- 饮食建议生成

📱 移动端优化:
- PWA配置
- 离线功能
- 添加到桌面
- 抹茶绿主题设计"

echo -e "${YELLOW}🔗 步骤5: 配置远程仓库${NC}"
echo -e "${BLUE}请先在GitHub创建仓库: https://github.com/new${NC}"
echo -e "${BLUE}仓库名称: $REPO_NAME${NC}"
echo -e "${BLUE}设置为Public，勾选 'Add a README file'${NC}"
echo ""
read -p "创建完成后按Enter继续..."

# 检查远程仓库是否已配置
if git remote get-url origin &> /dev/null; then
    echo "远程仓库已配置: $(git remote get-url origin)"
else
    git remote add origin "$REMOTE_URL"
    echo "✅ 远程仓库已添加: $REMOTE_URL"
fi

echo -e "${YELLOW}🚀 步骤6: 推送到GitHub${NC}"
git branch -M main
git push -u origin main
echo "✅ 代码已推送到GitHub"

echo ""
echo -e "${GREEN}🎉 GitHub仓库配置完成!${NC}"
echo "=================================="
echo -e "${BLUE}仓库地址: https://github.com/${GITHUB_USERNAME}/${REPO_NAME}${NC}"
echo ""
echo -e "${YELLOW}📋 下一步 - 在Cloudflare Pages部署:${NC}"
echo "1. 访问 https://dash.cloudflare.com/pages"
echo "2. 点击 'Create a project' > 'Connect to Git'"
echo "3. 选择 '$REPO_NAME' 仓库"
echo "4. 设置构建设置:"
echo "   - Framework preset: Vite"
echo "   - Build command: npm run build"
echo "   - Build output directory: dist"
echo "5. 添加环境变量:"
echo "   VITE_SUPABASE_URL: https://uwpgbynmxteretbjssfh.supabase.co"
echo "   VITE_SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
echo "6. 点击 'Save and Deploy'"
echo ""
echo -e "${YELLOW}📧 在Supabase设置Gemini AI密钥:${NC}"
echo "1. 访问 https://supabase.com/dashboard"
echo "2. 选择项目: mmx-agent-1762072770923"
echo "3. 进入 Settings > Edge Functions > Environment variables"
echo "4. 添加: GEMINI_API_KEY = AIzaSyDU2lcbEp1Kgx9dbbBJM2OPFeNG8VHy6N0"
echo ""
echo -e "${GREEN}🎯 部署成功后，访问您的自定义域名即可使用!${NC}"