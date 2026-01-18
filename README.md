# TUIO WebSocket Bridge & LED Control System

这是一个高效、低延迟的交互式 LED 控制系统中心，集成了 TUIO 多点触控桥接、实时文字控制以及动画工作站。

## 🚀 核心功能

- **TUIO 桥接器**：支持 UDP/TCP 入站 TUIO 消息，并通过 WebSocket 实时分发至前端应用。
- **文字输出面板**：可视化文字编辑，支持多种中文字体、颜色、滚动速度及停留时间配置。
- **动画工作站 (Animation Studio)**：内置基于 React 的动画编辑器，支持素材上传、实时预览及 LED 矩阵映射。
- **单进程封装**：所有服务（静态 Web、WebSocket、UDP 服务器）均集成在一个二进制 EXE 中，实现绿色运行。

## 📁 目录结构 (重构后)

```text
/BAITR_LEDSYSTEM
├── /public                # 静态资源根目录 (所有前端文件在此)
│   ├── /dist-animation    # 动画工作站编译产物
│   ├── tuio.html          # TUIO 测试与配置页
│   ├── text-display.html  # 文字控制面板
│   ├── app.js             # TUIO 前端逻辑
│   └── text-display.js    # 文字控制前端逻辑
├── /animation-studio      # 动画工作站 React 源码
├── backend.cjs            # 捆绑后的后端核心 (CommonJS)
├── start.js               # 开发环境启动入口
├── server.js              # TUIO & WebSocket 逻辑核心
├── static-server.js       # 静态资源服务器逻辑
├── package.json           # 项目配置与构建脚本
└── /dist-product          # 最终产品输出目录
```

## 🛠 开发与构建

### 开发模式 (ESM)
```bash
# 安装依赖
pnpm install

# 启动所有服务 (自动清理端口冲突)
pnpm start
```

### 产品打包 (.exe)
```bash
# 一键编译前端、捆绑后端并生成单一 EXE
pnpm run product:build
```
生成的成品位于 `dist-product/TuioBridge_Final.exe`。

## 📖 技术细节

- **后端**：Node.js + WebSocket + UDP (dgram)
- **前端**：Vanilla JS (TUIO/Text) + React/Vite (Animation Studio)
- **打包工具**：`esbuild` (后端捆绑) + `pkg` (二进制封装)

---
*更多细节请参考 [QUICKSTART.md](QUICKSTART.md) 或 [PKG_PACKAGING_GUIDE.md](PKG_PACKAGING_GUIDE.md)*
