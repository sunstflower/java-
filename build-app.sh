#!/bin/bash
# 学生管理系统Electron应用构建脚本

set -e  # 遇到错误立即退出

echo "🎓 开始构建学生管理系统应用程序..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

echo -e "${BLUE}项目根目录: $PROJECT_ROOT${NC}"

# 检查Java环境
echo -e "${BLUE}检查Java环境...${NC}"
if ! command -v java &> /dev/null; then
    echo -e "${RED}错误: 未找到Java环境，请安装Java 11或更高版本${NC}"
    exit 1
fi

JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d '"' -f 2)
echo -e "${GREEN}Java版本: $JAVA_VERSION${NC}"

# 检查Maven环境
echo -e "${BLUE}检查Maven环境...${NC}"
if ! command -v mvn &> /dev/null; then
    echo -e "${RED}错误: 未找到Maven，请安装Maven${NC}"
    exit 1
fi

MVN_VERSION=$(mvn -version | head -n 1)
echo -e "${GREEN}$MVN_VERSION${NC}"

# 检查Node.js环境
echo -e "${BLUE}检查Node.js环境...${NC}"
if ! command -v npm &> /dev/null; then
    echo -e "${RED}错误: 未找到Node.js/npm，请安装Node.js${NC}"
    exit 1
fi

NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
echo -e "${GREEN}Node.js版本: $NODE_VERSION${NC}"
echo -e "${GREEN}npm版本: $NPM_VERSION${NC}"

# 1. 构建后端
echo -e "${YELLOW}步骤 1/4: 构建后端应用...${NC}"
cd "$BACKEND_DIR"
echo "当前目录: $(pwd)"

if [ -f "pom.xml" ]; then
    echo "开始Maven构建..."
    mvn clean package -DskipTests
    
    # 检查JAR文件是否生成
    JAR_FILE="$BACKEND_DIR/target/system-0.0.1-SNAPSHOT.jar"
    if [ -f "$JAR_FILE" ]; then
        echo -e "${GREEN}✅ 后端JAR文件构建成功: $JAR_FILE${NC}"
        echo "文件大小: $(du -h "$JAR_FILE" | cut -f1)"
    else
        echo -e "${RED}❌ 后端JAR文件未找到${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ 未找到pom.xml文件${NC}"
    exit 1
fi

# 2. 安装前端依赖
echo -e "${YELLOW}步骤 2/4: 安装前端依赖...${NC}"
cd "$FRONTEND_DIR"
echo "当前目录: $(pwd)"

if [ -f "package.json" ]; then
    echo "安装npm依赖..."
    npm install
    echo -e "${GREEN}✅ 前端依赖安装完成${NC}"
else
    echo -e "${RED}❌ 未找到package.json文件${NC}"
    exit 1
fi

# 3. 构建前端
echo -e "${YELLOW}步骤 3/4: 构建前端应用...${NC}"
echo "开始React应用构建..."
npm run build

if [ -d "build" ]; then
    echo -e "${GREEN}✅ 前端构建成功${NC}"
    echo "构建文件数量: $(find build -type f | wc -l)"
else
    echo -e "${RED}❌ 前端构建失败${NC}"
    exit 1
fi

# 4. Electron打包
echo -e "${YELLOW}步骤 4/4: 打包Electron应用...${NC}"

# 检查是否需要下载Electron
if [ ! -d "node_modules/electron" ]; then
    echo "Electron未找到，重新安装..."
    npm install electron electron-builder --save-dev
fi

# 开始打包
echo "开始Electron应用打包..."
echo "目标平台: macOS (支持Intel和Apple Silicon)"

# 只打包macOS版本
npm run electron:build -- --mac

# 检查打包结果
DIST_DIR="$FRONTEND_DIR/dist"
if [ -d "$DIST_DIR" ]; then
    echo -e "${GREEN}🎉 应用打包成功！${NC}"
    echo -e "${BLUE}打包文件位置:${NC}"
    
    # 列出所有生成的文件
    find "$DIST_DIR" -name "*.dmg" -o -name "*.app" | while read -r file; do
        echo -e "${GREEN}  📦 $(basename "$file")${NC}"
        echo -e "     路径: $file"
        if [ -f "$file" ]; then
            echo -e "     大小: $(du -h "$file" | cut -f1)"
        fi
        echo
    done
    
    # 打开Finder显示结果
    if command -v open &> /dev/null; then
        echo -e "${BLUE}正在打开Finder显示打包结果...${NC}"
        open "$DIST_DIR"
    fi
    
else
    echo -e "${RED}❌ 打包失败，未找到dist目录${NC}"
    exit 1
fi

echo -e "${GREEN}🎓 学生管理系统应用构建完成！${NC}"
echo
echo -e "${YELLOW}使用说明:${NC}"
echo "1. 在dist目录中找到生成的.dmg文件"
echo "2. 双击.dmg文件安装应用"
echo "3. 应用启动时会自动启动后端服务"
echo "4. 首次运行可能需要在系统偏好设置中允许运行"
echo
echo -e "${BLUE}注意事项:${NC}"
echo "• 应用包含完整的前后端服务"
echo "• 无需单独安装Java或其他依赖"
echo "• 应用数据存储在本地H2数据库中"
echo "• 如需帮助，请查看应用菜单中的帮助选项" 