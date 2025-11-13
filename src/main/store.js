/*
 * © 2025 Evan. All rights reserved.
 *
 * This software is licensed under the MIT License.
 * See the LICENSE file for more details.
 */
const StoreImport = require("electron-store");
const Store = StoreImport.default || StoreImport;

const store = new Store({
  name: "settings",
  defaults: {
    theme: "light", // 主题
    deleteOriginalFile: false, // 删除原始文件
  },
});

module.exports = store;
