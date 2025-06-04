#!/bin/bash
# 测试打包后的应用程序

set -e

echo "🧪 测试学生管理系统应用程序..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
APP_PATH="$FRONTEND_DIR/dist/mac/Student Management System.app"

echo -e "${BLUE}项目根目录: $PROJECT_ROOT${NC}"

# 1. 检查应用是否存在
echo -e "${YELLOW}步骤 1/5: 检查应用文件...${NC}"
if [ -d "$APP_PATH" ]; then
    echo -e "${GREEN}✅ 应用文件存在: $APP_PATH${NC}"
else
    echo -e "${RED}❌ 应用文件不存在，请先运行打包命令${NC}"
    exit 1
fi

# 2. 检查JAR文件是否存在
echo -e "${YELLOW}步骤 2/5: 检查JAR文件...${NC}"
JAR_PATH="$PROJECT_ROOT/backend/target/system-0.0.1-SNAPSHOT.jar"
if [ -f "$JAR_PATH" ]; then
    echo -e "${GREEN}✅ JAR文件存在: $JAR_PATH${NC}"
    echo "文件大小: $(du -h "$JAR_PATH" | cut -f1)"
else
    echo -e "${RED}❌ JAR文件不存在，正在构建...${NC}"
    cd "$PROJECT_ROOT/backend"
    mvn clean package -DskipTests
    if [ -f "$JAR_PATH" ]; then
        echo -e "${GREEN}✅ JAR文件构建成功${NC}"
    else
        echo -e "${RED}❌ JAR文件构建失败${NC}"
        exit 1
    fi
fi

# 3. 检查Java环境
echo -e "${YELLOW}步骤 3/5: 检查Java环境...${NC}"
if command -v java &> /dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | head -n 1)
    echo -e "${GREEN}✅ Java可用: $JAVA_VERSION${NC}"
else
    echo -e "${RED}❌ Java未安装或不在PATH中${NC}"
    echo "请安装Java 11或更高版本"
    exit 1
fi

# 4. 测试JAR文件是否可以独立运行
echo -e "${YELLOW}步骤 4/5: 测试JAR文件...${NC}"
echo "正在测试后端服务启动..."

# 启动后端测试
java -jar "$JAR_PATH" --server.port=8888 --spring.profiles.active=test &
BACKEND_PID=$!

# 等待服务启动
sleep 10

# 检查服务是否运行
if kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${GREEN}✅ 后端服务启动成功${NC}"
    
    # 测试API
    if curl -s http://localhost:8888/api/auth/test > /dev/null 2>&1; then
        echo -e "${GREEN}✅ API响应正常${NC}"
    else
        echo -e "${YELLOW}⚠️  API测试失败，但服务正在运行${NC}"
    fi
    
    # 停止测试服务
    kill $BACKEND_PID
    wait $BACKEND_PID 2>/dev/null || true
    echo -e "${GREEN}✅ 测试服务已停止${NC}"
else
    echo -e "${RED}❌ 后端服务启动失败${NC}"
    exit 1
fi

# 5. 测试应用启动
echo -e "${YELLOW}步骤 5/5: 测试应用启动...${NC}"

# 检查应用签名状态
echo "检查应用签名状态..."
codesign -dv "$APP_PATH" 2>&1 | head -5 || echo "未签名"

echo -e "${BLUE}正在启动应用进行测试...${NC}"
echo "请在应用窗口中查看是否正常启动"
echo "检查控制台输出是否有错误信息"

# 启动应用
open "$APP_PATH"

echo -e "${GREEN}🎉 测试完成！${NC}"
echo
echo -e "${YELLOW}测试结果:${NC}"
echo "• ✅ 应用文件存在"
echo "• ✅ JAR文件正常"
echo "• ✅ Java环境可用"
echo "• ✅ 后端服务可启动"
echo "• 🚀 应用已启动（请手动验证界面）"
echo
echo -e "${BLUE}故障排除提示:${NC}"
echo "1. 如果应用无法启动，请查看控制台应用的错误日志"
echo "2. 如果显示安全警告，请右键点击应用选择'打开'"
echo "3. 如果端口冲突，请关闭占用8080端口的其他程序"
echo "4. 可以使用 Console.app 查看详细的应用日志"
echo
echo -e "${GREEN}如果应用正常显示界面并能够操作，则测试通过！${NC}" 