const { app, BrowserWindow, ipcMain, Tray, Menu, screen } = require("electron");
const path = require("node:path");
const coreWin = require("./window");
const autoUpdate = require("./autoUpdate");
const registerIpcHandlers = require("./ipcHandlers");
const { registerShortcuts, unregisterShortcuts } = require("./shortcuts");

if (require("electron-squirrel-startup")) app.quit();

let mainWindow;
let tray;
let isDev = process.env.NODE_ENV === "development";

const createWindow = () => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    x: width - 820,
    y: height - 620,
    minWidth: 350, // 限制最小宽度
    frame: false,
    hasShadow: false,
    transparent: false,
    icon: getIconPath(),
    webPreferences: {
      sandbox: true,
      webSecurity: true,
      contextIsolation: true,
      nodeIntegration: false,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  if (isDev) mainWindow.webContents.openDevTools();
  // 加载核心功能
  coreWin.setMainWindow(mainWindow);
  // 加载自动更新功能
  autoUpdate.checkUpdate(mainWindow);
};

// 获取图标路径
const getIconPath = () => {
  // 开发环境和打包环境路径一致，Webpack 会拷贝 assets
  return path.join(__dirname, "assets", "app.ico");
};

const createTray = () => {
  tray = new Tray(getIconPath());

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "显示窗口",
      click: () => {
        coreWin.showWindow();
      },
    },
    { label: "隐藏窗口", click: () => coreWin.hideWindow() },
    { type: "separator" },
    {
      label: "退出",
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setToolTip("BinLock");
  tray.setContextMenu(contextMenu);

  tray.on("click", () =>
    mainWindow.isVisible()
      ? coreWin.hideWindow()
      : coreWin.showWindow()
  );
};

app.whenReady().then(() => {
  createWindow();
  createTray();

  // 注册IPC事件
  registerIpcHandlers(ipcMain, mainWindow);
  // 注册快捷键
  registerShortcuts();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// 清理快捷键
app.on("will-quit", () => {
  unregisterShortcuts();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
