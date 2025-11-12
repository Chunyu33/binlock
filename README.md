


# BinLock

BinLock 是一个基于 AES-GCM 加密算法的文件加密/解密工具，旨在提供便捷的文件加密保护。用户可以使用密码加密敏感文件，或使用相同的密码进行解密，保护个人数据的安全。

## 版权声明

© 2025 Evan. 保留所有权利。

## 功能

- **文件加密**：支持单个或批量加密文件，生成加密后的 `.binlock` 文件。
- **文件解密**：使用密码解密 `.binlock` 文件，恢复原始文件。
- **密码保护**：通过密码对文件进行加密和解密，确保文件安全。

## 安装与使用

### 1. 克隆代码

首先，克隆本项目到本地：

```bash
git clone git@github.com:Chunyu33/binlock.git
cd binlock
```


### 2. 安装依赖

确保已安装 `Node.js` 和 `npm`。然后安装项目的依赖：

```bash
npm install
```

### 3. 启动项目

使用 `npm start` 启动应用：

```bash
npm start
```

### 4. 使用说明

* 在应用中选择需要加密或解密的文件。
* 输入密码后点击相应的加密或解密按钮。
* 输出目录将在文件列表中显示，用户可以选择保存位置。

## 贡献

如果你想为该项目做贡献，请遵循以下步骤：

1. Fork 本仓库。
2. 创建你的特性分支：`git checkout -b feature-name`。
3. 提交你的更改：`git commit -am 'Add new feature'`。
4. 推送到分支：`git push origin feature-name`。
5. 创建一个新的 Pull Request。

## 许可证

本项目采用  **MIT 许可证** ，详情请查看 [LICENSE](https://chatgpt.com/c/LICENSE) 文件。
