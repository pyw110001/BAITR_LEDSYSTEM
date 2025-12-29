# TUIO WebSocket Bridge - 集成项目

基于 Web 的 TUIO 通信应用，将前端 WebSocket 数据实时转换为 OSC 消息，通过 UDP 协议传递给支持 TUIO 协议的目标软件。

## 项目结构

本项目采用 **pnpm workspace** Monorepo 架构，包含以下模块：

```
.
├── server.js              # WebSocket 到 TUIO/OSC 桥接服务器 (端口 8080)
├── static-server.js       # 静态文件服务器 (端口 8081，默认打开 login.html)
├── start.js               # 统一启动脚本
├── login.html             # 登录页面（默认入口）
├── navigation.html        # 导航页面
├── animation-studio/      # Animation Studio 子项目 (端口 3000)
│   ├── App.tsx
│   ├── vite.config.ts
│   └── package.json
├── pnpm-workspace.yaml    # pnpm workspace 配置
└── package.json           # 根项目配置
```

## 功能特性

- ✅ **WebSocket 通信**: 前端通过 WebSocket 实时发送触摸/交互数据
- ✅ **OSC 协议转换**: 自动将 WebSocket 消息转换为标准 OSC 格式
- ✅ **UDP 传输**: 通过 UDP 协议发送 OSC 消息到目标应用
- ✅ **多点触控支持**: 支持同时处理多个触摸点（光标）
- ✅ **实时可视化**: 前端界面实时显示触摸点位置
- ✅ **TUIO 2D 协议**: 完整支持 TUIO 2D 协议（光标、对象、Blob）
- ✅ **Monorepo 架构**: 使用 pnpm workspace 管理多项目
- ✅ **统一启动**: 一个命令启动所有服务

## 系统要求

- Node.js 18.0 或更高版本
- pnpm 8.0 或更高版本
- 现代浏览器（支持 WebSocket 和触摸事件）

## 快速开始

### 1. 安装依赖

```bash
# 安装 pnpm（如果还没有安装）
npm install -g pnpm

# 安装所有依赖（包括子项目）
pnpm install
```

### 2. 启动所有服务

```bash
# 使用统一启动命令
pnpm start
# 或
npm run start
```

启动后，所有服务将同时运行：

- **静态文件服务器**: http://localhost:8081 (默认打开 login.html)
- **WebSocket 服务器**: ws://localhost:8080
- **Animation Studio**: http://localhost:3000

### 3. 单独启动服务

如果需要单独启动某个服务：

```bash
# 只启动 WebSocket 桥接服务器
pnpm run server:bridge

# 只启动静态文件服务器
pnpm run server:static

# 只启动 Animation Studio
pnpm run animation:dev
```

## 使用方法

### 登录系统

1. 启动服务后，浏览器会自动打开或访问 http://localhost:8081（默认打开 login.html）
2. 在用户名或密码字段输入任意字符
3. 点击"LOGIN"按钮或按回车键
4. 系统会自动跳转到导航界面

### 访问不同功能

- **登录页面**: http://localhost:8081/login.html
- **导航页面**: http://localhost:8081/navigation.html
- **Animation Studio**: http://localhost:3000

### TUIO 功能使用

1. 在导航页面中，点击进入 TUIO 主界面
2. 在控制面板中输入 WebSocket 服务器地址（默认: `ws://localhost:8080`）
3. 配置 UDP 目标地址和端口（默认: `127.0.0.1:3333`）
4. 点击"连接服务器"按钮
5. 在触摸区域进行交互，触摸点会实时显示并转换为 TUIO 消息发送

## 配置选项

### 环境变量

可以通过环境变量配置服务器端口：

```bash
# WebSocket 端口
WS_PORT=8080

# 静态文件服务器端口
STATIC_PORT=8081

# UDP 目标主机
UDP_HOST=127.0.0.1

# UDP 目标端口
UDP_PORT=3333
```

### Animation Studio 配置

Animation Studio 的配置位于 `animation-studio/vite.config.ts`，默认端口为 3000。

## 开发说明

### 项目架构

- **Monorepo**: 使用 pnpm workspace 管理多个子项目
- **独立运行**: 每个子项目可以独立运行，互不干扰
- **统一管理**: 通过根目录的 `start.js` 统一启动所有服务

### 添加新功能

1. **添加新的 TUIO 类型**: 在 `server.js` 中添加对应的处理方法
2. **扩展前端界面**: 修改 HTML 文件和 JavaScript 代码
3. **自定义消息格式**: 修改 WebSocket 消息处理逻辑

### 调试

- 查看服务器控制台输出（每个服务都有独立的日志标识）
- 查看浏览器控制台日志
- 使用 OSC 监控工具检查 UDP 消息

## 常见问题

### Q: pnpm 命令未找到？

A: 需要先安装 pnpm: `npm install -g pnpm`

### Q: 端口被占用？

A: 修改环境变量或配置文件中的端口号，确保端口未被其他程序占用。

### Q: Animation Studio 无法启动？

A: 确保已安装所有依赖：`pnpm install`，然后可以单独测试：`pnpm run animation:dev`

### Q: 如何只运行某个服务？

A: 使用对应的单独启动命令，如 `pnpm run server:bridge` 或 `pnpm run animation:dev`

## 技术栈

- **后端**: Node.js, WebSocket (ws), OSC (osc-min), UDP (dgram)
- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **Animation Studio**: React, TypeScript, Vite
- **协议**: TUIO 1.1, OSC 1.0, UDP
- **包管理**: pnpm workspace

## 许可证

MIT License

## 参考资源

- [TUIO 协议规范](http://www.tuio.org/)
- [OSC 协议](https://opensoundcontrol.org/)
- [pnpm workspace 文档](https://pnpm.io/workspaces)
