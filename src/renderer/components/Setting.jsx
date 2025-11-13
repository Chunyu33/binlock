/*
 * © 2025 Evan. All rights reserved.
 *
 * This software is licensed under the MIT License.
 * See the LICENSE file for more details.
 */

import React, { useState, useEffect, use } from "react";
import { Tabs, Switch, Space, Card, Select } from "antd";
import useTheme from "../hooks/useTheme";
import QuestionMark from "./QuestionMark";
import "./css/setting.css";

const SettingPage = () => {
  const [activeKey, setActiveKey] = useState("1");
  const [isDelete, setIsDelete] = useState(false);
  const [themeOption, setThemeOption] = useState("light");
  const { theme } = useTheme();

  useEffect(() => {
    setThemeOption(theme);
  }, [theme]);

  useEffect(() => {
    (async () => {
      const res = await window.electronAPI?.getDeleteOriginalFile();
      setIsDelete(res);
    })();
  }, []);
  const handleTabChange = (key) => {
    setActiveKey(key);
  };

  const handleThemeChange = async (value) => {
    setThemeOption(value);
    if (value === "auto") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      console.log("systemTheme===", systemTheme);
      document.documentElement.setAttribute("data-theme", systemTheme);
    } else {
      console.log("data-theme===", value);
      document.documentElement.setAttribute("data-theme", value);
    }
    await window.electronAPI?.setTheme?.(value);
  };

  const changeIsDelete = async (checked) => {
    console.log("changeIsDelete", checked);
    setIsDelete(checked);
    await window.electronAPI?.setDeleteOriginalFile?.(checked);
  };

  const items = [
    {
      key: "1",
      label: "常规设置",
      children: (
        <div className="item-container">
          <Card title="外观设置" size="small">
            <Select
              value={themeOption}
              onChange={handleThemeChange}
              style={{ width: "100%" }}
              size="small"
              options={[
                { value: "light", label: "浅色模式" },
                { value: "dark", label: "深色模式" },
                // { value: "auto", label: "跟随系统" },
              ]}
            />
          </Card>
          <Card title="功能设置" size="small" style={{ marginTop: "10px" }}>
            <Space direction="horizontal">
              <label
                title="加密或解密成功后，是否删除原文件"
                className="row-center "
              >
                删除原文件
                <QuestionMark size="13" />
              </label>
              <Switch value={isDelete} size="small" onChange={changeIsDelete} />
            </Space>
          </Card>
        </div>
      ),
    },
    {
      key: "2",
      label: "使用说明",
      children: (
        <div className="item-container">
          <p>1. 加密或解密之前务必输入密钥，否则无法操作。</p>
          <p>2. 选择输出目录后，鼠标悬浮在按钮上，可显示当前选择的目录信息。</p>
          <p>
            3. 加密时，若未选择输出目录，则默认输出到当前目录下的{" "}
            <strong>encrypted</strong>。
          </p>
          <p>
            4. 解密时，若未选择输出目录，则默认输出到当前目录下的{" "}
            <strong>decrypted</strong>。
          </p>
          <p>
            5. 若解密失败，通常是因为密钥错误。如有其他情况，请联系作者反馈。
          </p>
          <p>6. 请务必牢记你设置的密钥，否则无法解密。</p>
          <p>
            7.
            加密和解密操作会保留原始文件，你可以根据自己的情况手动删除原始文件。
          </p>
          <p>8. 所有加密解密操作均在本地运行，不会上传至服务器，安全高效。</p>
          <p>9. 本软件不支持第三方软件/平台加密过的文件的解密。</p>
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
            或者联系直接作者，微信：<strong>B_HH6050</strong> ，请务必备注来意。
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
            开发者: <strong>Evan Lau</strong>
          </p>
          <div className="copyright" style={{ bottom: "6px" }}>
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
