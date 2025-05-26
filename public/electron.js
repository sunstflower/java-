// Electron主进程文件
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

// 保持window对象的全局引用，避免JavaScript对象被垃圾回收时，窗口被自动关闭
let mainWindow;

// 创建浏览器窗口函数
function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      // 启用Node.js集成
      nodeIntegration: true,
      // 允许在渲染进程中使用require
      contextIsolation: false,
      // 预加载脚本
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // 加载应用
  mainWindow.loadURL(
    isDev
      ? 'http://localhost:3000' // 开发环境
      : `file://${path.join(__dirname, '../build/index.html')}` // 生产环境
  );

  // 打开开发者工具（仅在开发环境）
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // 当窗口关闭时触发
  mainWindow.on('closed', () => {
    // 解除窗口对象的引用
    mainWindow = null;
  });
}

// 当Electron初始化完成，准备创建浏览器窗口时，调用这个方法
app.whenReady().then(createWindow);

// 所有窗口关闭时退出应用
app.on('window-all-closed', () => {
  // 在macOS上通常用户关闭窗口后，点击dock上的应用图标会重新创建一个窗口
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // 在macOS上，当点击dock上的应用图标且没有其它打开的窗口时，
  // 重新创建一个窗口
  if (mainWindow === null) {
    createWindow();
  }
});

// 可以在这里定义进程间通信的处理函数
ipcMain.on('message-from-renderer', (event, arg) => {
  console.log(arg); // 打印来自渲染进程的消息
  event.reply('message-from-main', 'Response from main process');
}); 