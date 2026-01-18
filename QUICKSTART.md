# 快速入门指南

本指南将帮助您快速运行或构建 TUIO LED 控制系统。

## 1. 快速启动 (使用二进制)

如果您不需要修改代码，直接运行以下文件：
- **路径**：`dist-product/TuioBridge_Final.exe`
- **默认地址**：启动后浏览器将自动打开 `http://localhost:8001`

---

## 2. 开发环境运行

### 必备条件
- **Node.js**: v18.0 或更高
- **包管理器**: pnpm (推荐)

### 步骤
1. **安装依赖**：
   ```bash
   pnpm install
   ```
2. **启动服务**：
   ```bash
   pnpm start
   ```
   *注意：此操作会自动尝试终止占用 8001, 8080, 3333 端口的残留进程。*

---

## 3. 构建自己的二进制文件

如果您修改了代码并想生成新的 `.exe`：

```bash
pnpm run product:build
```

**构建流程说明：**
1. 编译 `animation-studio` 并将其输出至 `public/dist-animation/`。
2. 使用 `esbuild` 将所有后端逻辑合并为单个 `backend.cjs` 以保证 `pkg` 兼容性。
3. `pkg` 将整个 `public/` 目录及其内容（HTML/JS/动画产物）打包进最终的二进制文件。

---

## 4. 常见问题 (FAQ)

- **无法加载动画模块？**
  请确保 `public/dist-animation/` 中存在 `index.html`。
- **404 错误？**
  所有前端文件必须存放在 `public/` 目录中。在 `pkg` 环境下，服务器会自动映射 `C:\snapshot\...` 路径。
- **端口被占用？**
  启动脚本会尝试自动修复。如果失败，请手动在任务管理器中结束 `TuioBridge_Final.exe` 或 `node.exe`。

---
*重构与打包的最佳实践请参阅：[PKG_PACKAGING_GUIDE.md](PKG_PACKAGING_GUIDE.md)*
