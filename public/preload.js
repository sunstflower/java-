// 预加载脚本，在渲染进程启动前执行
// 可以在这里公开Electron API给渲染进程

window.ipcRenderer = require('electron').ipcRenderer;

// 可以在这里定义与主进程通信的函数
window.electronAPI = {
  // 发送消息到主进程
  sendMessage: (message) => {
    ipcRenderer.send('message-from-renderer', message);
  },
  
  // 监听主进程的消息
  onMessage: (callback) => {
    ipcRenderer.on('message-from-main', (event, message) => {
      callback(message);
    });
  },
  
  // 其他API可以根据需要添加
}; 