/*
 * © 2025 Evan. All rights reserved.
 *
 * This software is licensed under the MIT License.
 * See the LICENSE file for more details.
 */
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // 窗口操作
  minimizeWindow: () => ipcRenderer.invoke("minimize-window"),
  closeWindow: () => ipcRenderer.invoke("close-window"),
  hideWindow: () => ipcRenderer.invoke("hide-window"),
  showWindow: () => ipcRenderer.invoke("show-window"),

  // 核心功能 加解密
  selectFiles: (options) => ipcRenderer.invoke("dialog:openFiles", options),
  selectFolder: () => ipcRenderer.invoke("dialog:selectFolder"),

  processFiles: (payload) => ipcRenderer.invoke("process-files", payload), // returns final results array

  onProcessProgress: (cb) => {
    const handler = (_, data) => cb(data);
    ipcRenderer.on("process-progress", handler);
    return () => ipcRenderer.removeListener("process-progress", handler);
  },

  openPath: (p) => ipcRenderer.invoke("open-path", p),

  // 主题切换
  setTheme: (theme) => ipcRenderer.invoke("set-theme", theme),
  getTheme: () => ipcRenderer.invoke("get-theme"),
  onThemeChanged: (callback) => {
    const handler = (_, theme) => callback(theme); // 只传递 theme
    ipcRenderer.on("theme-changed", handler);
    return () => ipcRenderer.removeListener("theme-changed", handler); // 返回取消函数
  },
});
