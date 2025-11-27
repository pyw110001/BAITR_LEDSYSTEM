# TUIO WebSocket Bridge

基于 Web 的 TUIO 通信应用，将前端 WebSocket 数据实时转换为 OSC 消息，通过 UDP 协议传递给支持 TUIO 协议的目标软件。

## 功能特性

- ✅ **WebSocket 通信**: 前端通过 WebSocket 实时发送触摸/交互数据
- ✅ **OSC 协议转换**: 自动将 WebSocket 消息转换为标准 OSC 格式
- ✅ **UDP 传输**: 通过 UDP 协议发送 OSC 消息到目标应用
- ✅ **多点触控支持**: 支持同时处理多个触摸点（光标）
- ✅ **实时可视化**: 前端界面实时显示触摸点位置
- ✅ **TUIO 2D 协议**: 完整支持 TUIO 2D 协议（光标、对象、Blob）

## 系统要求

- Node.js 14.0 或更高版本
- 现代浏览器（支持 WebSocket 和触摸事件）

## 安装步骤

1. **安装依赖**

```bash
npm install
```

2. **启动服务器**

```bash
npm start
```

服务器将在以下端口启动：
- WebSocket 服务器: `http://localhost:8080`
- UDP 目标: `127.0.0.1:3333` (默认)

3. **打开前端页面**

在浏览器中打开 `index.html` 文件，或使用本地服务器：

```bash
# 使用 Python
python -m http.server 3000

# 或使用 Node.js http-server
npx http-server -p 3000
```

然后在浏览器中访问 `http://localhost:3000`

## 使用方法

### 1. 连接服务器

1. 在控制面板中输入 WebSocket 服务器地址（默认: `ws://localhost:8080`）
2. 配置 UDP 目标地址和端口（默认: `127.0.0.1:3333`）
3. 点击"连接服务器"按钮

### 2. 发送触摸数据

- **鼠标操作**: 在触摸区域点击并拖动
- **触摸操作**: 在触摸屏设备上使用多点触控
- 触摸点会实时显示在界面上，并自动转换为 TUIO 消息发送

### 3. 监控状态

- **连接状态**: 顶部状态栏显示 WebSocket 连接状态
- **活动光标**: 显示当前活动的触摸点数量
- **总帧数**: 显示已发送的帧数
- **日志**: 实时显示操作日志

## 配置选项

### 环境变量

可以通过环境变量配置服务器：

```bash
# WebSocket 端口
WS_PORT=8080

# UDP 目标主机
UDP_HOST=127.0.0.1

# UDP 目标端口
UDP_PORT=3333
```

### 消息格式

前端发送的 WebSocket 消息格式：

```json
{
  "type": "cursor",
  "action": "add|update|remove",
  "sessionId": 123,
  "x": 0.5,
  "y": 0.5,
  "xSpeed": 0.0,
  "ySpeed": 0.0,
  "motionAccel": 0.0
}
```

### TUIO 协议支持

本应用支持以下 TUIO 消息类型：

- **2Dcur** (光标): `/tuio/2Dcur`
- **2Dobj** (对象): `/tuio/2Dobj`
- **2Dblb** (Blob): `/tuio/2Dblb`

## 与 TUIO 应用集成

### 接收端配置

确保你的 TUIO 应用监听以下端口：
- **UDP 端口**: 3333 (默认)
- **协议**: OSC over UDP

### 测试工具

可以使用以下工具测试 TUIO 消息接收：

1. **TUIO Simulator**: 用于模拟 TUIO 输入
2. **OSC Monitor**: 用于监控 OSC 消息
3. **Processing/OpenFrameworks**: 支持 TUIO 的创意编程框架

## 项目结构

```
.
├── server.js          # Node.js 后端服务器
├── index.html         # 前端 HTML 页面
├── app.js            # 前端 JavaScript 客户端
├── package.json       # 项目依赖配置
└── README.md         # 项目文档
```

## 技术栈

- **后端**: Node.js, WebSocket (ws), OSC (osc), UDP (dgram)
- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **协议**: TUIO 1.1, OSC 1.0, UDP

## 开发说明

### 添加新功能

1. **添加新的 TUIO 类型**: 在 `server.js` 中添加对应的处理方法
2. **扩展前端界面**: 修改 `index.html` 和 `app.js`
3. **自定义消息格式**: 修改 WebSocket 消息处理逻辑

### 调试

- 查看服务器控制台输出
- 查看浏览器控制台日志
- 使用 OSC 监控工具检查 UDP 消息

## 常见问题

### Q: WebSocket 连接失败？

A: 检查服务器是否已启动，端口是否被占用，防火墙设置是否正确。

### Q: UDP 消息未收到？

A: 检查目标应用的 UDP 端口配置，确保防火墙允许 UDP 通信。

### Q: 触摸点不显示？

A: 确保浏览器支持触摸事件，检查 JavaScript 控制台是否有错误。

## 许可证

MIT License

## 参考资源

- [TUIO 协议规范](http://www.tuio.org/)
- [OSC 协议](https://opensoundcontrol.org/)
- [TUIO11_NET 项目](https://github.com/mkalten/TUIO11_NET)

## 贡献

欢迎提交 Issue 和 Pull Request！

