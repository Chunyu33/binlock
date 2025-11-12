/*
 * © 2025 Evan. All rights reserved.
 *
 * This software is licensed under the MIT License.
 * See the LICENSE file for more details.
 */
import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: "light",
  initialized: false,

  initTheme: async () => {
    const _theme = await window.electronAPI.getTheme?.();
    set({ theme: _theme || "light", initialized: true });
  },

  setTheme: async (newTheme) => {
    set({ theme: newTheme }); // 更新 Zustand 状态
  },
}));
