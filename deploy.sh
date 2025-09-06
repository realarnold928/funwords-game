#!/bin/bash

echo "🚀 FunWords 部署脚本"
echo "===================="

# 检查是否安装了必要的工具
if ! command -v git &> /dev/null; then
    echo "❌ 错误: 未安装 Git"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未安装 npm"
    exit 1
fi

echo "📦 安装依赖..."
npm install

echo "🔨 构建项目..."
npm run build

echo "✅ 构建完成！"
echo ""
echo "📁 build文件夹已准备好部署"
echo ""
echo "🌐 部署选项:"
echo "1. Vercel (推荐):"
echo "   - 安装 Vercel CLI: npm i -g vercel"
echo "   - 登录: vercel login"
echo "   - 部署: vercel --prod"
echo ""
echo "2. Netlify:"
echo "   - 将 build 文件夹拖拽到 netlify.com"
echo ""
echo "3. GitHub Pages:"
echo "   - 推送代码到 GitHub"
echo "   - 在仓库设置中启用 GitHub Pages"
echo ""
echo "🎉 Happy coding!"