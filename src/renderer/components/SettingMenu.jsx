import React, { useState, useEffect, useMemo, forwardRef } from "react";
import { Select } from "antd";
import "./css/setting.css";

const themeOptions = [
  { label: "亮色模式", value: "light" },
  { label: "暗色模式", value: "dark" },
  // { label: "跟随系统", value: "auto" },
];

const SettingMenu = forwardRef(({ onClose }, ref) => {
  const [theme, setTheme] = useState("auto");

  // 初始化读取主题
  useEffect(() => {
    const fetchSettings = async () => {
      const th = await window.electronAPI.getTheme?.();
      if (th !== undefined) {
        setTheme(th);
        applyThemeToDOM(th);
      }
    };
    fetchSettings();
  }, []);

  // 应用主题到 DOM
  const applyThemeToDOM = (value) => {
    if (value === "auto") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.setAttribute(
        "data-theme",
        isDark ? "dark" : "light"
      );
    } else {
      document.documentElement.setAttribute("data-theme", value);
    }
  };

  const handleThemeChange = async (value) => {
    setTheme(value);
    applyThemeToDOM(value);
    await window.electronAPI?.setTheme?.(value);
  };

  const handleClose = () => {
    if (onClose) onClose();
  };

  // 点击外部或按 ESC 关闭
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref?.current && !ref.current.contains(e.target)) {
        handleClose();
      }
    };
    const handleEsc = (e) => {
      if (e.key === "Escape") handleClose();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [ref]);


  return (
    <div className="setting-menu" ref={ref}>
      {/* 主题选择 */}
      <div className="setting-item">
        <span className="setting-label">主题</span>
        <Select
          size="small"
          value={theme}
          onChange={handleThemeChange}
          options={themeOptions}
          style={{ width: "100%" }}
          getPopupContainer={(triggerNode) => triggerNode.parentNode}
        />
      </div>
    </div>
  );
});

export default SettingMenu;
