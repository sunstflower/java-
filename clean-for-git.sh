#!/bin/bash
# 清理项目以准备提交到Git

echo "🧹 开始清理项目文件..."

# 清理前端构建产物
if [ -d "frontend/dist" ]; then
    echo "删除前端构建产物..."
    rm -rf frontend/dist/
fi

if [ -d "frontend/build" ]; then
    echo "删除前端构建文件..."
    rm -rf frontend/build/
fi

# 清理后端构建产物
if [ -d "backend/target" ]; then
    echo "删除后端构建产物..."
    rm -rf backend/target/
fi

# 清理macOS系统文件
echo "清理macOS系统文件..."
find . -name ".DS_Store" -delete

# 清理node_modules
if [ -d "frontend/node_modules" ]; then
    echo "删除node_modules..."
    rm -rf frontend/node_modules/
fi

# 清理日志文件
find . -name "*.log" -delete

# 清理临时文件
find . -name "*.tmp" -delete
find . -name "*.temp" -delete

echo "✅ 清理完成！"
echo "现在可以安全地提交到Git仓库了。"

echo ""
echo "建议的Git命令："
echo "git add ."
echo "git commit -m \"Initial commit: Student Management System\""
echo "git push" 