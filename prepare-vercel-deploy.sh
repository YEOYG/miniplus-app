#!/bin/bash

# MiniPlus Vercel部署准备脚本
# 此脚本将准备项目并生成部署所需的文件

echo "🚀 MiniPlus Vercel部署准备中..."

# 进入项目目录
cd /workspace/miniplus

echo "📦 安装依赖包..."
pnpm install

echo "🔧 构建项目..."
pnpm run build

echo "✅ 构建完成！"
echo ""
echo "📋 接下来您需要："
echo "1. 在GitHub创建新仓库"
echo "2. 将代码推送到GitHub"
echo "3. 在Vercel导入GitHub仓库"
echo "4. 配置环境变量"
echo ""
echo "🔍 部署URL预览："
ls -la dist/

echo ""
echo "🎯 详细部署指南请查看：/workspace/Vercel部署指南.md"