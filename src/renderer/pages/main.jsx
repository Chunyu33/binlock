/*
 * © 2025 Evan. All rights reserved.
 *
 * This software is licensed under the MIT License.
 * See the LICENSE file for more details.
 */
import React, { useState, useEffect, useRef } from "react";
import { App, Button, Input, Progress, Tooltip } from "antd";
import Table from "../components/Table";
import {
  PlusOutlined,
  FolderOpenOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import "./css/main.css";

const MainPage = () => {
  const { message } = App.useApp(); // ✅ 从 App context 获取实例
  const [fileList, setFileList] = useState([]);
  const [password, setPassword] = useState("");
  const [outputDir, setOutputDir] = useState("");
  const tableWrapperRef = useRef(null);
  const [tableHeight, setTableHeight] = useState(400);


  // 动态计算表格剩余高度
  useEffect(() => {
    const updateHeight = () => {
      const topOffset =
        tableWrapperRef.current?.getBoundingClientRect().top || 0;
      const windowHeight = window.innerHeight;
      setTableHeight(windowHeight - topOffset - 20); // 底部间距
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  // 选择文件，每次选择都会清空上一次列表
  const handleSelectFiles = async () => {
    try {
      const { canceled, filePaths } = await window.electronAPI.selectFiles();
      if (!canceled && filePaths.length > 0) {
        const newFiles = filePaths.map((fp, idx) => ({
          uid: Date.now() + idx,
          path: fp,
          name: fp.split(/[/\\]/).pop(),
          status: "pending",
          percent: 0,
          error: null,
          outputPath: null,
        }));
        setFileList(newFiles);
      }
    } catch (err) {
      message.error("选择文件失败：" + err.message);
    }
  };

  // 选择输出目录
  const handleSelectOutput = async () => {
    try {
      const { canceled, filePaths } = await window.electronAPI.selectFolder();
      if (!canceled && filePaths.length > 0) {
        setOutputDir(filePaths[0]);
        message.info(`当前输出目录: ${filePaths[0]}`, 5);
      } else {
        setOutputDir("");
      }
    } catch (err) {
      message.error("选择输出目录失败：" + err.message);
    }
  };

  // 清空列表
  const handleClear = () => {
    setFileList([]);
  };

  // 批量处理（加密/解密）
  const handleProcess = async (mode) => {
    if (fileList.length < 1) {
      message.warning("请选择文件");
      return;
    }
    if (!password) {
      message.warning("请输入密码");
      return;
    }

    // 初始化文件状态
    const updatedList = fileList.map((f) => ({
      ...f,
      status: mode === "encrypt" ? "encrypting" : "decrypting", // 加密/解密
      percent: 0, // 初始化进度
      error: null, // 初始化错误信息
      outputPath: null, // 初始化输出路径
    }));

    setFileList(updatedList);

    let errorFiles = []; // 用于存储失败的文件
    let successfulFiles = []; // 用于存储成功的文件

    try {
      // 调用主进程进行文件处理
      const results = await window.electronAPI.processFiles({
        files: updatedList.map((f) => ({ uid: f.uid, path: f.path })),
        mode,
        password,
        outputDir: outputDir || null,
      });

      // 更新文件列表状态并进行统计
      const updatedResults = updatedList.map((f) => {
        const result = results.find((rr) => rr.uid === f.uid); // 获取对应文件的处理结果
        if (!result) return f; // 如果没有找到对应的结果，则返回原文件

        if (result.success) {
          successfulFiles.push(f); // 记录成功的文件
          return {
            ...f,
            status: "done", // 处理成功
            percent: 100, // 完成
            outputPath: result.outputPath,
          };
        } else {
          errorFiles.push(f); // 记录失败的文件
          return {
            ...f,
            status: "error", // 处理失败
            percent: 0, // 失败时进度不显示为 100
            error: result.error || "处理失败", // 错误信息
            outputPath: null,
          };
        }
      });

      // 更新文件列表状态
      setFileList(updatedResults);

      // 成功的文件处理完后的提示
      if (successfulFiles.length > 0) {
        message.success(`${mode === "encrypt" ? "加密" : "解密"}完成`);
      }

      // 如果有失败的文件，合并错误信息后一次性提示
      if (errorFiles.length > 0) {
        // const errorFileNames = errorFiles.map((f) => f.name).join(", ");
        // message.error(`以下文件处理失败: ${errorFileNames}`);
        message.error(`共有 ${errorFiles.length} 个文件处理失败`);
      }
      // console.log("\nsuccessfulFiles:", successfulFiles);
      // console.log("\nerrorFiles:", errorFiles);
    } catch (err) {
      // 如果在处理过程中发生错误，显示错误信息
      message.error("处理失败：" + err.message);
      setFileList((prev) =>
        prev.map((f) => ({
          ...f,
          status: "error",
          percent: 0,
          error: err.message || "未知错误", // 错误信息
          outputPath: null,
        }))
      );
    }
  };

  const handleEncrypt = () => handleProcess("encrypt");
  const handleDecrypt = () => handleProcess("decrypt");

  const stringStatus = (status) => {
    switch (status) {
      case "pending":
        return "待处理";
      case "encrypting":
        return "加密中";
      case "decrypting":
        return "解密中";
      case "done":
        return "完成";
      case "error":
        return "错误";
      default:
        return "未知";
    }
  };

  const columns = [
    {
      title: "文件名",
      dataIndex: "name",
      key: "name",
      render: (text) => (
        <span style={{ color: "var(--text-color)" }} title={text}>
          {text}
        </span>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (_, record) => {
        let color = "var(--text-color)";
        if (record.status === "encrypting") color = "#1890ff";
        if (record.status === "decrypting") color = "#faad14";
        if (record.status === "done") color = "#52c41a";
        if (record.status === "error") color = "#f5222d";
        return <span style={{ color }}>{stringStatus(record.status)}</span>;
      },
    },
    {
      title: "进度",
      dataIndex: "percent",
      key: "percent",
      render: (percent) => (
        <Progress percent={percent} size="small" strokeColor="#52c41a" />
      ),
    },
    {
      title: "输出路径",
      dataIndex: "outputPath",
      key: "outputPath",
      render: (text) => (
        <span style={{ color: "#ccc" }} title={text}>
          {text || "-"}
        </span>
      ),
    },
  ];

  return (
    <div className="main">
      {/* 工具栏 */}
      <div style={{ marginBottom: 12, display: "flex", gap: 8 }}>
        <Button icon={<PlusOutlined />} onClick={handleSelectFiles}>
          选择文件
        </Button>
        <Tooltip
          title={outputDir ? outputDir : "请选择输出目录"}
          color="var(--text-color)"
          styles={{ body: { color: "var(--background-color)" } }}
        >
          <Button icon={<FolderOpenOutlined />} onClick={handleSelectOutput}>
            输出目录
          </Button>
        </Tooltip>
        <Input.Password
          placeholder="输入密钥"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: 200 }}
        />
        <Tooltip
          title={!fileList.length || !password ? "请选择文件并且输入密钥" : ""}
          color="var(--text-color)"
          styles={{ body: { color: "var(--background-color)" } }}
        >
          <Button
            type="primary"
            onClick={handleEncrypt}
            disabled={!fileList.length || !password}
          >
            开始加密
          </Button>
        </Tooltip>
        <Tooltip
          title={!fileList.length || !password ? "请选择文件并且输入密钥" : ""}
          color="var(--text-color)"
          styles={{ body: { color: "var(--background-color)" } }}
        >
          <Button
            type="primary"
            onClick={handleDecrypt}
            disabled={!fileList.length || !password}
          >
            开始解密
          </Button>
        </Tooltip>
        <Button danger icon={<ClearOutlined />} onClick={handleClear}>
          清空列表
        </Button>
      </div>

      {/* 文件表格 */}
      <div ref={tableWrapperRef} className="table-container">
        <Table
          columns={columns}
          dataSource={fileList}
          height={`calc(${tableHeight}px)`}
        />
      </div>
    </div>
  );
};

export default MainPage;
