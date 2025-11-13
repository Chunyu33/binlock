/*
 * © 2025 Evan. All rights reserved.
 *
 * This software is licensed under the MIT License.
 * See the LICENSE file for more details.
 */
const {
  quit,
  setMainWindow,
  showWindow,
  hideWindow,
  minimizeWindow,
  setTheme,
  getTheme,
  openFiles,
  openPath,
  selectFolder,
  processFiles,
  setDeleteOriginalFile,
  getDeleteOriginalFile,
} = require("./window");

function registerIPC(ipcMain, mainWindow) {
  // 初始化主窗口引用
  setMainWindow(mainWindow);

  // --------- IPC: dialogs ----------
  ipcMain.handle("dialog:openFiles", async (_, options = {}) =>
    openFiles(options)
  );

  ipcMain.handle("dialog:selectFolder", async () => selectFolder());

  // --------- 文件处理 ----------
  ipcMain.handle("process-files", async (event, payload) =>
    processFiles(event, payload)
  );
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

  // ======================
  // 设置-是否删除原文件
  // ======================
  ipcMain.handle("get-delete-original-file", () => getDeleteOriginalFile());
  ipcMain.handle("set-delete-original-file", (_, del) => setDeleteOriginalFile(del));
}

module.exports = registerIPC;
