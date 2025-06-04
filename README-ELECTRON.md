# 学生管理系统 Electron 应用打包指南

本文档说明如何将学生管理系统（前端React + 后端Spring Boot）打包为macOS桌面应用程序。

## 📋 系统要求

### 必需环境
- **macOS** 10.15 或更高版本
- **Java** 11 或更高版本
- **Maven** 3.6 或更高版本  
- **Node.js** 14 或更高版本
- **npm** 6 或更高版本

### 检查环境
```bash
# 检查Java版本
java -version

# 检查Maven版本
mvn -version

# 检查Node.js版本
node --version
npm --version
```

## 🚀 快速开始

### 方法一：使用自动构建脚本（推荐）

1. **给脚本执行权限**
   ```bash
   chmod +x build-app.sh
   ```

2. **运行构建脚本**
   ```bash
   ./build-app.sh
   ```

脚本将自动完成以下步骤：
- ✅ 检查所有必需环境
- ✅ 构建后端Spring Boot应用
- ✅ 安装前端依赖
- ✅ 构建前端React应用
- ✅ 打包Electron应用
- ✅ 生成macOS .dmg安装包

### 方法二：手动构建

如果自动脚本遇到问题，可以手动执行以下步骤：

#### 1. 构建后端
```bash
cd backend
mvn clean package -DskipTests
```
确认生成了 `target/system-0.0.1-SNAPSHOT.jar` 文件。

#### 2. 构建前端
```bash
cd frontend
npm install
npm run build
```
确认生成了 `build/` 目录。

#### 3. 打包应用
```bash
# 在frontend目录下
npm run package
```

## 📦 打包输出

成功构建后，在 `frontend/dist/` 目录下会生成：

```
dist/
├── mac/
│   └── Student Management System.app
└── Student Management System-1.0.0.dmg
```

- **`.app`**: macOS应用程序包
- **`.dmg`**: macOS磁盘映像安装文件（推荐分发格式）

## 🔧 配置说明

### Electron配置文件
- **主进程**: `frontend/public/electron.js`
- **打包配置**: `frontend/package.json` 中的 `build` 字段

### 关键特性
- ✅ 自动启动后端Spring Boot服务
- ✅ 集成前端React应用  
- ✅ 端口冲突检测
- ✅ 优雅的服务关闭
- ✅ macOS原生菜单
- ✅ 防止多实例运行
- ✅ 错误处理和用户提示

## 📱 应用特性

### 启动流程
1. 检查端口8080是否可用
2. 启动内嵌的Spring Boot后端服务
3. 启动Electron窗口加载前端
4. 显示完整的学生管理系统界面

### 数据存储
- 使用H2内嵌数据库
- 数据文件存储在用户目录下
- 支持数据持久化

### 网络配置
- 后端服务：`localhost:8080`
- 前端界面：Electron窗口加载
- API通信：前端通过axios调用后端接口

## 🐛 故障排除

### 常见问题

#### 1. Java版本错误
```bash
错误: 未找到Java环境
```
**解决方案**: 安装Java 11+
```bash
# 使用Homebrew安装
brew install openjdk@11
```

#### 2. Maven未找到
```bash
错误: 未找到Maven
```
**解决方案**: 安装Maven
```bash
# 使用Homebrew安装
brew install maven
```

#### 3. 端口被占用
```bash
端口 8080 已被占用
```
**解决方案**: 
- 关闭占用8080端口的程序
- 或在应用中选择重试

#### 4. 后端启动失败
**可能原因**:
- JAR文件未找到
- Java版本不兼容
- 端口权限问题

**解决方案**:
- 确保后端构建成功
- 检查Java版本（需要11+）
- 检查系统防火墙设置

#### 5. 前端构建警告
Source map相关警告是正常的，不影响应用功能。

### 调试模式

开发模式下运行（用于调试）：
```bash
cd frontend
npm run electron-dev
```

这会启动热重载模式，便于开发调试。

## 🔒 安全说明

### macOS安全设置
首次运行应用时，macOS可能显示安全警告：

1. **方法一**: 右键点击应用 → 选择"打开"
2. **方法二**: 系统偏好设置 → 安全性与隐私 → 允许运行

### 网络权限
应用需要本地网络权限：
- 启动后端服务（端口8080）
- 前后端通信

## 📈 性能优化

### 应用大小优化
- 使用生产模式构建
- 排除开发依赖
- 压缩资源文件

### 启动速度优化
- 优化后端启动时间
- 使用应用缓存
- 延迟加载非关键组件

## 🔄 更新发布

### 版本更新
1. 更新 `frontend/package.json` 中的版本号
2. 重新构建应用
3. 分发新的.dmg文件

### 自动更新
当前配置支持自动更新检查，但需要配置更新服务器。

## 📞 技术支持

如果遇到问题：

1. **查看日志**: 应用启动时的控制台输出
2. **检查环境**: 确保所有依赖正确安装
3. **重新构建**: 清理缓存后重新构建
4. **查看错误**: 注意错误提示信息

## 📚 相关资源

- [Electron官方文档](https://www.electronjs.org/docs)
- [electron-builder文档](https://www.electron.build/)
- [Spring Boot打包文档](https://spring.io/guides/gs/spring-boot/)
- [React构建优化](https://create-react-app.dev/docs/production-build/)

---

**注意**: 本应用为教育管理系统，请确保在安全的环境中使用，并定期备份重要数据。 