# 快速启动指南

## 前置要求

1. 安装 Node.js (18.0+)
2. 安装 pnpm: `npm install -g pnpm`

## 安装步骤

```bash
# 1. 安装所有依赖
pnpm install

# 2. 启动所有服务
pnpm start
```

## 服务端口

启动成功后，以下服务将同时运行：

- **静态文件服务器**: http://localhost:8081 (默认打开 login.html)
- **WebSocket 服务器**: ws://localhost:8080
- **Animation Studio**: http://localhost:3000

## 访问页面

- 登录页面: http://localhost:8081/login.html
- 导航页面: http://localhost:8081/navigation.html
- Animation Studio: http://localhost:3000

## 停止服务

按 `Ctrl+C` 停止所有服务。

## 单独启动服务

如果需要单独启动某个服务：

```bash
# WebSocket 桥接服务器
pnpm run server:bridge

# 静态文件服务器
pnpm run server:static

# Animation Studio
pnpm run animation:dev
```
