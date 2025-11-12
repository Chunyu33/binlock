/*
 * © 2025 Evan. All rights reserved.
 *
 * This software is licensed under the MIT License.
 * See the LICENSE file for more details.
 */

import React, { useState, useEffect } from "react";
import { Tabs, Radio, Switch, Space } from "antd";
import useTheme from "../hooks/useTheme";
import "./css/setting.css";

const SettingPage = () => {
  const [activeKey, setActiveKey] = useState("1");
  const [themeOption, setThemeOption] = useState("light");
  const { theme } = useTheme();

  useEffect(() => {
    setThemeOption(theme);
  }, [theme]);
  const handleTabChange = (key) => {
    setActiveKey(key);
  };

  const handleThemeChange = async (e) => {
    const value = e.target.value;
    setThemeOption(value);
    if (value === "auto") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      document.documentElement.setAttribute("data-theme", systemTheme);
    } else {
      document.documentElement.setAttribute("data-theme", value);
    }
    await window.electronAPI?.setTheme?.(value);
  };

  const items = [
    {
      key: "1",
      label: "主题设置",
      children: (
        <div className="item-container">
          <Radio.Group value={themeOption} onChange={handleThemeChange}>
            <Space direction="vertical">
              <Radio value="light">亮色模式</Radio>
              <Radio value="dark">暗色模式</Radio>
              {/* <Radio value="auto">跟随系统</Radio> */}
            </Space>
          </Radio.Group>
        </div>
      ),
    },
    {
      key: "2",
      label: "使用说明",
      children: (
        <div className="item-container">
          <p>1. 加密或解密之前务必输入密钥，否则无法操作。</p>
          <p>
            2. 选择输出目录后，鼠标悬浮在按钮上，可显示当前选择的目录信息。
          </p>
          <p>
            3. 加密时，若未选择输出目录，则默认输出到当前目录下的 <strong>encrypted</strong>。
          </p>
          <p>
            4. 解密时，若未选择输出目录，则默认输出到当前目录下的 <strong>decrypted</strong>。
          </p>
          <p>5. 若解密失败，通常是因为密钥错误。如有其他情况，请联系作者反馈。</p>
          <p>6. 所有加密解密操作均在本机运行，不会上传至服务器，安全高效。</p>
          <p>7. 请务必牢记你设置的密钥，否则无法解密。</p>
          <p>8. 本软件不支持第三方软件/平台加密过的文件的解密。</p>
          <p>9. 加密和解密操作会保留原始文件，你可以根据自己的情况手动删除原始文件。</p>
          <p>10. 本软件仅供学习交流，请勿用于商业用途。</p>
        </div>
      ),
    },
    {
      key: "3",
      label: "意见反馈",
      children: (
        <div className="item-container">
          <p>
            请将您的宝贵意见发送至邮箱：<strong>1378813463@qq.com</strong>
          </p>
          <p>
            QQ群：<strong>646123989</strong>
          </p>
          <p>
            或者联系直接作者，微信：<strong>B_HH6050</strong>
          </p>
        </div>
      ),
    },
    {
      key: "4",
      label: "关于Binlock",
      children: (
        <div className="item-container">
          <p>BinLock 是一款简单、安全的文件加密工具，帮助你保护敏感数据。</p>
          <p>
            版本: <strong>1.0.0</strong>
          </p>
          <p>
            开发者: <strong>Evan</strong>
          </p>
          <div className="copyright">
            Copyright © {new Date().getFullYear()} Evan. All rights reserved.
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="setting-page">
      <Tabs
        tabPosition="left"
        activeKey={activeKey}
        onChange={handleTabChange}
        style={{ height: "100%" }}
        items={items}
      />
    </div>
  );
};

export default SettingPage;
