/*
 * © 2025 Evan. All rights reserved.
 *
 * This software is licensed under the MIT License.
 * See the LICENSE file for more details.
 */
import React, { useMemo, useState } from "react";
import { Modal } from "antd";
import "./css/header.css";
import { IconSetting, IconMinimize, IconClose } from "./Icon";
import Setting from "./Setting";
import AppIcon from "../../assets/app.png";
import AppWhiteIcon from "../../assets/app-white.png";
import useTheme from "../hooks/useTheme";

const IconButton = ({ title, onClick, children }) => (
  <button className="header-btn" onClick={onClick} title={title}>
    {children}
  </button>
);

const Header = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
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

  // 打开设置 Modal
  const handleOpenSettings = () => {
    setIsModalVisible(true);
  };

  // 关闭设置 Modal
  const handleCloseSettings = () => {
    setIsModalVisible(false);
  };
  
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
        <IconButton title="设置" onClick={handleOpenSettings}>
          <IconSetting />
        </IconButton>
        <IconButton title="最小化" onClick={handleMinimize}>
          <IconMinimize />
        </IconButton>
        <IconButton title="关闭" onClick={handleClose}>
          <IconClose />
        </IconButton>
      </div>

      {/* Modal 显示设置页面 */}
      <Modal
        title=""
        open={isModalVisible}
        onCancel={handleCloseSettings}
        footer={null}
        width="60%"
      >
        <Setting />
      </Modal>
    </div>
  );
};

export default Header;
