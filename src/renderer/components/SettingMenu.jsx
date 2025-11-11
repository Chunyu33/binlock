import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Slider,
  Switch,
  Tooltip,
  Select,
  ConfigProvider,
  theme as antdTheme,
} from "antd";
import QuestionMark from "./QuestionMark";
import "./css/setting.css";

// 主题选项
const themeOptions = [
  { label: "亮色模式", value: "light" },
  { label: "暗色模式", value: "dark" },
  // { label: "跟随系统", value: "auto" },
];

const SettingMenu = ({ onClose }) => {
  const [theme, setTheme] = useState("auto"); // 本地状态

  useEffect(() => {
    // 初始化时读取设置
    const fetchSettings = async () => {
      const [th] = await Promise.all([
        window.electronAPI.getTheme?.(),
      ]);
      if (th !== undefined) {
        setTheme(th);
        applyThemeToDOM(th);
      }
    };
    fetchSettings();
  }, []);



  // 将主题应用到当前页面
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

  // 切换主题
  const handleThemeChange = async (value) => {
    setTheme(value);
    applyThemeToDOM(value);
    await window.electronAPI?.setTheme?.(value); // 通知主进程
  };
  const antdConfig = useMemo(() => {
    console.log("\n setting theme", theme);
    if (theme === "auto") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      console.log("systemTheme", systemTheme);
      return systemTheme === "dark"
        ? { algorithm: antdTheme.darkAlgorithm }
        : { algorithm: antdTheme.defaultAlgorithm };
    }
    return theme === "dark"
      ? { algorithm: antdTheme.darkAlgorithm }
      : { algorithm: antdTheme.defaultAlgorithm };
  }, [theme]);


  // 关闭窗口
  const handleClose = () => {
    if (onClose) onClose();
  };

  const formatTip = (tipValue) => {
    if (tipValue == null) {
      return null;
    }
    return `${Math.round(tipValue * 100)}%`;
  };

  return (
    <ConfigProvider
      theme={{
        ...antdConfig,
        token: {
          colorPrimary: "#4caf50",
          colorBgBase: theme === "dark" ? "#000" : "#fff",
        },
      }}
    >
      <div className="setting-menu">
        <div className="setting-header">
          <span className="setting-title">设置</span>
          <button className="close-btn" onClick={handleClose}>
            ✕
          </button>
        </div>


        {/* 主题选择 */}
        <div className="setting-item">
          <span className="setting-label row-center">主题设置</span>
          <div className="range-input">
            <Select
              value={theme}
              onChange={handleThemeChange}
              options={themeOptions}
              style={{ width: "100%" }}
            />
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default SettingMenu;
