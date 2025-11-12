/*
 * © 2025 Evan. All rights reserved.
 *
 * This software is licensed under the MIT License.
 * See the LICENSE file for more details.
 */
import React, { useMemo } from "react";
import { ConfigProvider, theme as antdTheme } from "antd";
import Header from "./components/Header";
import MainPage from "./pages/main";
import useTheme from "./hooks/useTheme";

const bgStyles = {};

const App = () => {

  // 获取主题状态和更新逻辑
  const { theme } = useTheme();


  // 动态控制 antd 主题：根据当前主题切换 light/dark algorithm
  const antdConfig = useMemo(() => {
    if (theme === "auto") {
      // 检测系统主题
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      return systemTheme === "dark"
        ? { algorithm: antdTheme.darkAlgorithm }
        : { algorithm: antdTheme.defaultAlgorithm };
    }
    return theme === "dark"
      ? { algorithm: antdTheme.darkAlgorithm }
      : { algorithm: antdTheme.defaultAlgorithm };
  }, [theme]);

  // 根据窗口类型渲染
  const mainDom = () => {
    return (
      <>
        <Header />
        <div className="content-container">
          <MainPage />
        </div>
      </>
    );
  };

  const appDom = () => {
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
        <div className="app-container" style={bgStyles}>
          {mainDom()}
        </div>
      </ConfigProvider>
    );
  };

  return appDom();
};

export default App;
