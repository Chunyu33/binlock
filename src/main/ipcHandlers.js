const {
  quit,
  setMainWindow,
  setMainWindowRef,
  showWindow,
  hideWindow,
  minimizeWindow,
  setTheme,
  getTheme,
  openFiles,
  openPath,
  selectFolder,
  processFiles,
} = require("./window");

function registerIPC(ipcMain, mainWindow) {
  // 初始化主窗口引用
  setMainWindow(mainWindow);
  setMainWindowRef(mainWindow);

  // --------- IPC: dialogs ----------
  ipcMain.handle("dialog:openFiles", async (_, options = {}) =>
    openFiles(options)
  );

  ipcMain.handle("dialog:selectFolder", async () => selectFolder());

  // --------- IPC: start processing ----------
  /**
   * payload: { files: [{uid, path}], mode: 'encrypt'|'decrypt', outputDir: string|null, password: string }
   * We will send incremental progress events via channel 'process-progress'
   */
  ipcMain.handle("process-files", async (event, payload) =>
    processFiles(event, payload)
  );

  // open output folder
  ipcMain.handle("open-path", async (_, p) => openPath(p));

  // ======================
  // 主窗口操作
  // ======================
  ipcMain.handle("minimize-window", () => minimizeWindow());
  ipcMain.handle("show-window", () => showWindow());
  ipcMain.handle("hide-window", (_) => hideWindow());

  // ======================
  // 主窗口关闭
  // ======================
  ipcMain.handle("close-window", (_) => quit());

  // ======================
  // 主题管理
  // ======================
  ipcMain.handle("get-theme", () => getTheme());
  ipcMain.handle("set-theme", (_, theme) => setTheme(theme));
}

module.exports = registerIPC;
