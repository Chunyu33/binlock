import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Table, Button, Input, message, Progress } from "antd";
import {
  PlusOutlined,
  FolderOpenOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import "./css/main.css";

const MainPage = () => {
  const [fileList, setFileList] = useState([]);
  const [password, setPassword] = useState("");
  const [outputDir, setOutputDir] = useState("");
  const tableWrapperRef = useRef(null);
  const [tableHeight, setTableHeight] = useState(400);

  // 动态计算表格剩余高度
  // useEffect(() => {
  //   const updateHeight = () => {
  //     const topOffset = tableWrapperRef.current?.getBoundingClientRect().top || 0;
  //     const windowHeight = window.innerHeight;
  //     setTableHeight(windowHeight - topOffset - 20); // 底部间距
  //   };
  //   updateHeight();
  //   window.addEventListener("resize", updateHeight);
  //   return () => window.removeEventListener("resize", updateHeight);
  // }, []);
  useLayoutEffect(() => {
    const updateHeight = () => {
      const topOffset =
        tableWrapperRef.current?.getBoundingClientRect().top || 0;
      const windowHeight = window.innerHeight;
      setTableHeight(windowHeight - topOffset - 20);
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
      const { canceled, filePaths } =
        await window.electronAPI.selectFolder();
      if (!canceled && filePaths.length > 0) {
        setOutputDir(filePaths[0]);
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
    if (!fileList.length) {
      message.warning("请先选择文件");
      return;
    }

    const updatedList = fileList.map((f) => ({
      ...f,
      status: mode === "encrypt" ? "encrypting" : "decrypting",
      percent: 0,
      error: null,
      outputPath: null,
    }));
    setFileList(updatedList);

    try {
      const results = await window.electronAPI.processFiles({
        files: updatedList.map((f) => ({ uid: f.uid, path: f.path })),
        mode,
        password,
        outputDir: outputDir || null,
      });

      setFileList((prev) =>
        prev.map((f) => {
          const r = results.find((rr) => rr.uid === f.uid);
          if (!r) return f;
          if (r.success)
            return {
              ...f,
              status: "done",
              percent: 100,
              outputPath: r.outputPath,
            };
          else return { ...f, status: "error", percent: 100, error: r.error };
        })
      );
      message.success(`${mode === "encrypt" ? "加密" : "解密"}完成`);
    } catch (err) {
      message.error("处理失败：" + err.message);
    }
  };

  const handleEncrypt = () => handleProcess("encrypt");
  const handleDecrypt = () => handleProcess("decrypt");

  const columns = [
    {
      title: "文件名",
      dataIndex: "name",
      key: "name",
      render: (text) => <span style={{ color: "#222" }}>{text}</span>,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (_, record) => {
        let color = "#333";
        if (record.status === "encrypting") color = "#1890ff";
        if (record.status === "decrypting") color = "#faad14";
        if (record.status === "done") color = "#52c41a";
        if (record.status === "error") color = "#f5222d";
        return <span style={{ color }}>{record.status}</span>;
      },
    },
    {
      title: "进度",
      dataIndex: "percent",
      key: "percent",
      width: 150,
      render: (percent) => (
        <Progress percent={percent} size="small" strokeColor="#1890ff" />
      ),
    },
    {
      title: "输出路径",
      dataIndex: "outputPath",
      key: "outputPath",
      render: (text) => <span style={{ color: "#ccc" }}>{text || "-"}</span>,
    },
  ];

  return (
    <div className="main">
      {/* 工具栏 */}
      <div style={{ marginBottom: 12, display: "flex", gap: 8 }}>
        <Button icon={<PlusOutlined />} onClick={handleSelectFiles}>
          选择文件
        </Button>
        <Button icon={<FolderOpenOutlined />} onClick={handleSelectOutput}>
          输出目录
        </Button>
        <Input.Password
          placeholder="输入密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: 200 }}
        />
        <Button type="primary" onClick={handleEncrypt}>
          开始加密
        </Button>
        <Button type="primary" onClick={handleDecrypt}>
          开始解密
        </Button>
        <Button danger icon={<ClearOutlined />} onClick={handleClear}>
          清空列表
        </Button>
      </div>

      {/* 文件表格 */}
      <div ref={tableWrapperRef} className="table-container">
        <Table
          dataSource={fileList}
          columns={columns}
          rowKey="uid"
          pagination={false}
          scroll={{ y: tableHeight }}
          bordered
          style={{
            height: "calc(100% - 10px)",
            borderRadius: 8,
          }}
        />
      </div>
    </div>
  );
};

export default MainPage;
