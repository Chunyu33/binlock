/*
 * © 2025 Evan. All rights reserved.
 *
 * This software is licensed under the MIT License.
 * See the LICENSE file for more details.
 */
const { BrowserWindow, dialog, shell, app } = require("electron");
const store = require("./store"); // 持久化 store
const fileCrypto = require("../utils/fileCrypto");

let mainWindow = null;

// -----------------------------
// 设置主窗口引用
// -----------------------------
function setMainWindow(win) {
  mainWindow = win;
}

async function openFiles(options) {
  const res = await dialog.showOpenDialog(mainWindow, {
    properties: ["openFile", "multiSelections"],
    ...options,
  });
  console.log("\n [openFiles] res=", res);
  return res;
}

async function selectFolder() {
  const res = await dialog.showOpenDialog(mainWindow, {
    properties: ["openDirectory", "createDirectory"],
  });
  console.log("\n [selectFolder] res=", res);
  return res;
}

async function openPath(path) {
  if (!path) return;
  await shell.openPath(path);
}

// 处理文件
async function processFiles(event, payload) {
  const { files, mode, outputDir, password } = payload;
  const sendProgress = (data) => {
    event.sender.send("process-progress", data);
  };
  // 是否删除原文件 直接读取配置
  const isDel = store.get("deleteOriginalFile", false)
  if (mode === "encrypt") {
    const res = await fileCrypto.encryptFiles(
      files,
      outputDir,
      password,
      sendProgress,
      isDel
    );
    return res;
  } else if (mode === "decrypt") {
    const res = await fileCrypto.decryptFiles(
      files,
      outputDir,
      password,
      sendProgress,
      isDel
    );
    return res;
  } else {
    throw new Error("Unknown mode");
  }
}

function quit() {
  const allWindows = BrowserWindow.getAllWindows();
  for (const win of allWindows) {
    try {
      win.destroy(); // 直接销毁，不触发渲染进程事件
    } catch (e) {}
  }

  setTimeout(() => {
    app.exit(0);
  }, 100);
}

// 显示窗口
function showWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) return;

  mainWindow.show(); // 原来的抢焦点方式
  // mainWindow.showInactive(); // 不抢焦点
}

// 隐藏窗口
function hideWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) return;

  mainWindow.hide();
}

// 最小化窗口
function minimizeWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.minimize();
}


// 设置主题
function setTheme(theme) {
  store.set("theme", theme);
  console.log(`\n [setTheme] theme=${theme}`);
  if (!mainWindowRef) return;
  mainWindowRef.setBackgroundColor(theme === "dark" ? "#1E1E1E" : "#FFFFFF");
  mainWindowRef.webContents.send("theme-changed", theme);
}
// 获取当前主题
function getTheme() {
  return store.get("theme", "light");
}

// 设置删除原文件
function setDeleteOriginalFile(value) {
  console.log(`\n [setDeleteOriginalFile] value=${value}`);
  store.set("deleteOriginalFile", value);
}

// 获取是否删除原文件
function getDeleteOriginalFile() {
  return store.get("deleteOriginalFile", false);
}

module.exports = {
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
};
