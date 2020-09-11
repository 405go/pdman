/* eslint-disable */
const {app, BrowserWindow, Menu, ipcMain} = require('electron');
const path = require('path');
const url = require('url');
/*let oraclePath = '';
if (process.env.NODE_ENV === 'development') {
  oraclePath = 'oracledb';
} else {
  oraclePath = './oracledb/index.js'
}
var oracledb = require(oraclePath);*/

// 设置菜单
const template = [
  {
    label: 'Edit',
    submenu: [
      {role: 'undo'},
      {role: 'redo'},
      {type: 'separator'},
      {role: 'cut'},
      {role: 'copy'},
      {role: 'paste'},
      {role: 'pasteandmatchstyle'},
      {role: 'delete'},
      {role: 'selectall'}
    ]
  },
  {
    label: 'View',
    submenu: [
      {role: 'reload'},
      {role: 'forcereload'},
      {role: 'toggledevtools'},
      {type: 'separator'},
      {role: 'resetzoom'},
      {role: 'zoomin'},
      {role: 'zoomout'},
      {type: 'separator'},
      {role: 'togglefullscreen'}
    ]
  },
  {
    role: 'window',
    submenu: [
      {role: 'minimize'},
      {role: 'close'}
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click () { require('electron').shell.openExternal('https://electronjs.org') }
      }
    ]
  }
];

if (process.platform === 'darwin') {
  template.unshift({
    label: app.getName(),
    submenu: [
      {role: 'about'},
      {type: 'separator'},
      {role: 'services', submenu: []},
      {type: 'separator'},
      {role: 'hide'},
      {role: 'hideothers'},
      {role: 'unhide'},
      {type: 'separator'},
      {role: 'quit'}
    ]
  });

  // Edit menu
  template[1].submenu.push(
    {type: 'separator'},
    {
      label: 'Speech',
      submenu: [
        {role: 'startspeaking'},
        {role: 'stopspeaking'}
      ]
    }
  );

  // Window menu
  template[3].submenu = [
    {role: 'close'},
    {role: 'minimize'},
    {role: 'zoom'},
    {type: 'separator'},
    {role: 'front'}
  ]
}

// 保持一个对于 window 对象的全局引用，如果你不这样做，
// 当 JavaScript 对象被垃圾回收， window 会被自动地关闭
let win;

function createWindow() {
  // 创建浏览器窗口。
  win = new BrowserWindow({width: 1048, height: 700, minWidth: 1048, minHeight: 700, frame: false, resizable: false});

  // 然后加载应用的 index.html。
  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:3005/index.html');
    // 打开开发者工具。
    win.webContents.openDevTools();
  } else {
    // win.webContents.openDevTools();
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true,
    }));
  }


  // 当 window 被关闭，这个事件会被触发。
  win.on('closed', () => {
    // 取消引用 window 对象，如果你的应用支持多窗口的话，
    // 通常会把多个 window 对象存放在一个数组里面，
    // 与此同时，你应该删除相应的元素。
    win = null;
  });

  if (process.env.NODE_ENV === 'development') {
    // 窗口创建之后再创建菜单
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  } else {
    let prjMenu = [];
    let menu = null;
    if (process.platform === 'darwin') {
      // 解决关闭菜单无法复制粘贴的问题，MAC如果关闭所有的菜单，则默认的复制粘贴无效
      prjMenu = [].concat({
        label: 'Edit',
          submenu: [
        {role: 'undo'},
        {role: 'redo'},
        {type: 'separator'},
        {role: 'cut'},
        {role: 'copy'},
        {role: 'paste'},
        {role: 'pasteandmatchstyle'},
        {role: 'delete'},
        {role: 'selectall'}
      ]
      });
      menu = Menu.buildFromTemplate(prjMenu);
    }
    Menu.setApplicationMenu(menu);
  }

  ipcMain.on("jarPath", (event) => {
    let jarPath = '';
    if (process.env.NODE_ENV === 'development') {
      jarPath = path.join(__dirname, '../public/jar/pdman-java-connector.jar');
    } else {
      jarPath = path.join(__dirname, '../../app.asar.unpacked/build/jar/pdman-java-connector.jar')
    }
    event.returnValue = jarPath;
  });
  ipcMain.on("wordPath", (event) => {
    let wordPath = '';
    if (process.env.NODE_ENV === 'development') {
      wordPath = path.join(__dirname, '../public/word/template.docx');
    } else {
      wordPath = path.join(__dirname, '../../app.asar.unpacked/build/word/template.docx')
    }
    event.returnValue = wordPath;
  });
  // 添加主线程监听
  ipcMain.on("loadingSuccess", (event) => {
    win.setResizable(true);
    event.returnValue = 'setSuccess'
  });
  ipcMain.on("headerType", (event, args) => {
    switch (args) {
      case 'minimize': win.minimize();break;
      case 'restore':
        if (process.platform === 'darwin') {
          if (win.isFullScreen()) {
            win.setFullScreen(false);
          }
        }
          win.unmaximize();
        break;
      case 'maximize':
        if (process.platform === 'darwin') {
          win.setFullScreen(true);
        } else {
          win.maximize();
        }
        break;
      case 'close': win && win.close();break;
      case 'openDev': win.webContents.openDevTools();break;
      case 'backHome':
        if (process.platform === 'darwin') {
          win.setFullScreen(false);
        }
        win.setSize(1048, 700);win.setResizable(false);win.center();break;
      default: break;
    }
    event.returnValue = 'setSuccess'
  });
}

// Electron 会在初始化后并准备
// 创建浏览器窗口时，调用这个函数。
// 部分 API 在 ready 事件触发后才能使用。
app.on('ready', createWindow);

// 当全部窗口关闭时退出。
app.on('window-all-closed', () => {
  // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
  // 否则绝大部分应用及其菜单栏会保持激活。
  if (process.platform !== 'darwin') {
  app.quit();
}
});

app.on('activate', () => {
  // 在macOS上，当单击dock图标并且没有其他窗口打开时，
  // 通常在应用程序中重新创建一个窗口。
  if (win === null) {
  createWindow();
}
});
