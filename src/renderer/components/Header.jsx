import React, { useMemo } from "react";
import "./css/header.css";
import { IconSetting, IconMinimize, IconClose } from "./Icon";
import AppIcon from "../../assets/app.png";
import AppWhiteIcon from "../../assets/app-white.png";
import useTheme from "../hooks/useTheme";

// 独立 SVG 组件
const IconButton = ({ title, onClick, children }) => (
  <button className="header-btn" onClick={onClick} title={title}>
    {children}
  </button>
);

const Header = ({ onOpenSettings }) => {
  const handleMinimize = () => window.electronAPI?.minimizeWindow();
  const handleClose = () => window.electronAPI?.closeWindow();

  const { theme } = useTheme();

  const iconSrc = useMemo(() => {
    if (theme === "auto") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      return systemTheme === "dark"
        ? AppWhiteIcon
        : AppIcon;
    }
    return theme === "dark"
      ? AppWhiteIcon
      : AppIcon;
  }, [theme]);
  
  return (
    <div className="header-bar">
      <div className="header-left">
        <div className="header-title">
          <img
            src={iconSrc}
            alt=""
            style={{ width: "18px", height: "18px", borderRadius: "2px" }}
          />
          BinLock
        </div>
      </div>

      {/* 右侧操作按钮 */}
      <div className="header-actions">
        <IconButton title="设置" onClick={onOpenSettings}>
          <IconSetting />
        </IconButton>
        <IconButton title="最小化" onClick={handleMinimize}>
          <IconMinimize />
        </IconButton>
        <IconButton title="关闭" onClick={handleClose}>
          <IconClose />
        </IconButton>
      </div>
    </div>
  );
};

export default Header;
