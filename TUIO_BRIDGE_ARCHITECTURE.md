# TUIO WebSocket 桥接架构文档

## 问题总结

### 本次开发中遇到的关键问题

#### 1. ES模块 vs CommonJS ⚠️ **关键问题**
   - **问题**：`package.json` 中设置了 `"type": "module"`，但代码使用了 CommonJS 的 `require`
   - **错误信息**：`ReferenceError: require is not defined in ES module scope`
   - **解决**：改为使用 ES 模块的 `import` 语法
   - **教训**：统一模块系统，避免混用。如果使用 ES 模块，所有文件都必须使用 `import/export`

#### 2. OSC Bundle 格式处理 ⚠️ **核心问题 - 导致无法接收信号**
   - **问题**：TUIOpad 发送的是 OSC Bundle 格式（包含多个 OSC 消息），而不是单个 OSC 消息
   - **现象**：UDP 消息能收到，但 OSC 解析失败，前端收不到信号
   - **原因**：Bundle 格式以 `#bundle` 开头，包含时间戳和多个 OSC 消息，需要特殊处理
   - **解决**：添加了 `handleOSCBundle()` 方法来检测和解析 Bundle 格式
   - **教训**：TUIO 协议通常使用 Bundle 格式发送多个消息（source、alive、set、fseq），必须支持 Bundle 解析

#### 3. UDP 服务器绑定地址 ⚠️ **网络问题**
   - **问题**：初始实现可能只绑定到 `127.0.0.1`，无法接收来自其他设备的消息
   - **现象**：本地测试可以，但手机无法连接
   - **解决**：绑定到 `0.0.0.0` 以接收所有网络接口的消息
   - **教训**：服务器需要监听所有网络接口，而不仅仅是本地回环。`127.0.0.1` 只能接收本机消息，`0.0.0.0` 可以接收所有网络接口的消息

#### 4. 防火墙配置
   - **问题**：Windows 防火墙可能阻止 UDP 端口
   - **解决**：添加防火墙规则允许 UDP 3333 端口
   - **教训**：生产环境需要考虑防火墙和网络安全配置

#### 5. 调试工具的重要性
   - **问题**：难以定位 UDP 接收和 OSC 解析问题
   - **解决**：创建了独立的 UDP 测试工具 (`test-udp-receive.js`)
   - **教训**：独立的测试工具可以帮助快速定位问题，区分网络问题和协议解析问题

---

## 技术架构

### 整体架构图

```
┌─────────────────┐         ┌──────────────────┐         ┌──────────────┐
│   前端浏览器     │         │   Node.js 桥接   │         │  目标应用     │
│                 │         │     服务器       │         │              │
│  (发送模式)     │◄───────►│                  │────────►│  (UDP/OSC)   │
│  WebSocket      │         │  WebSocket:8080  │         │              │
│                 │         │  UDP Client      │         │              │
└─────────────────┘         └──────────────────┘         └──────────────┘
                                      ▲
                                      │
                            ┌─────────┴─────────┐
                            │                   │
                    ┌───────▼──────┐   ┌───────▼──────┐
                    │  手机TUIOpad  │   │  手机TUIOpad  │
                    │   (UDP)      │   │   (TCP)      │
                    │   Port:3333  │   │   Port:3333  │
                    └──────────────┘   └──────────────┘
                            │                   │
                            └─────────┬─────────┘
                                      │
                            ┌─────────▼─────────┐
                            │  UDP/TCP Server   │
                            │   Port:3333       │
                            │   0.0.0.0        │
                            └───────────────────┘
                                      │
                            ┌─────────▼─────────┐
                            │  OSC 解析         │
                            │  (Bundle/Message) │
                            └───────────────────┘
                                      │
                            ┌─────────▼─────────┐
                            │  WebSocket广播    │
                            │  Port:8080        │
                            └───────────────────┘
                                      │
                            ┌─────────▼─────────┐
                            │   前端浏览器       │
                            │  (接收模式)       │
                            └───────────────────┘
```

### 数据流向

#### 发送模式（前端 → 目标应用）
```
前端触摸事件 
  → WebSocket (JSON) 
  → 服务器解析 
  → OSC消息构建 
  → UDP发送 
  → 目标应用
```

#### 接收模式（手机 → 前端）
```
手机TUIOpad触摸 
  → UDP/TCP (OSC Bundle) 
  → 服务器接收 
  → OSC Bundle解析 
  → 提取多个OSC消息 
  → 转换为JSON 
  → WebSocket广播 
  → 前端显示
```

---

## 核心组件

### 1. WebSocket 服务器
- **端口**: 8080
- **功能**: 
  - 接收前端发送的 JSON 消息（发送模式）
  - 广播 OSC 转换后的 JSON 消息给前端（接收模式）
- **实现要点**:
  - 使用 `ws` 库的 `WebSocketServer`
  - 维护客户端连接集合 (`Set<WebSocket>`)
  - 支持多客户端同时连接

### 2. UDP 服务器（接收）
- **端口**: 3333
- **绑定地址**: `0.0.0.0`（重要！）
- **功能**: 接收来自手机 TUIOpad 的 UDP OSC 消息
- **实现要点**:
  - 使用 `dgram.createSocket('udp4')`
  - 绑定到 `0.0.0.0` 而非 `127.0.0.1`
  - 处理 OSC Bundle 格式

### 3. TCP 服务器（接收）
- **端口**: 3333
- **绑定地址**: `0.0.0.0`
- **功能**: 接收来自手机 TUIOpad 的 TCP OSC 消息
- **实现要点**:
  - 使用 `net.createServer()`
  - 处理 TCP 流式数据（消息可能分多个包）
  - 支持长度前缀和直接 OSC 消息两种格式

### 4. UDP 客户端（发送）
- **功能**: 将 OSC 消息发送到目标应用
- **实现要点**:
  - 使用 `dgram.createSocket('udp4')` 作为客户端
  - 使用 `osc-min` 库构建 OSC 消息

### 5. OSC 消息处理
- **支持格式**:
  - 单个 OSC 消息
  - OSC Bundle（包含多个 OSC 消息）
- **TUIO 协议支持**:
  - `/tuio/2Dcur` - 光标（触摸点）
  - `/tuio/2Dobj` - 对象（标记物）
  - `/tuio/2Dblb` - Blob（区域）

---

## 关键技术点

### 1. OSC Bundle 格式处理

OSC Bundle 格式结构：
```
#bundle (8字节)
+ 时间戳 (8字节)
+ [消息长度(4字节) + OSC消息]...
+ [消息长度(4字节) + OSC消息]...
```

**关键代码**:
```javascript
// 检测 Bundle 格式
const isBundle = buffer.length >= 8 && 
  buffer.slice(0, 8).toString('ascii').startsWith('#bundle');

if (isBundle) {
  // 解析 Bundle
  let offset = 8; // 跳过 "#bundle"
  offset += 8; // 跳过时间戳
  
  while (offset < buffer.length) {
    const messageLength = buffer.readUInt32BE(offset);
    offset += 4;
    const messageBuffer = buffer.slice(offset, offset + messageLength);
    offset += messageLength;
    offset = Math.ceil(offset / 4) * 4; // 4字节对齐
    
    // 解析单个 OSC 消息
    const oscMessage = osc.fromBuffer(messageBuffer);
    this.processOSCMessage(oscMessage, source);
  }
}
```

### 2. 网络绑定地址

**错误做法**:
```javascript
// 只能接收本地消息
server.bind(3333, '127.0.0.1');
```

**正确做法**:
```javascript
// 接收所有网络接口的消息
server.bind(3333, '0.0.0.0');
```

### 3. TCP 流式数据处理

TCP 是流式协议，OSC 消息可能分多个 TCP 包发送：

```javascript
let buffer = Buffer.alloc(0);

socket.on('data', (data) => {
  buffer = Buffer.concat([buffer, data]);
  
  // 尝试解析消息
  while (offset < buffer.length) {
    // 读取长度前缀
    const messageLength = buffer.readUInt32BE(offset);
    if (offset + 4 + messageLength > buffer.length) {
      break; // 消息不完整，等待更多数据
    }
    // 解析消息...
  }
});
```

### 4. 模块系统一致性

**package.json**:
```json
{
  "type": "module"  // 使用 ES 模块
}
```

**代码中**:
```javascript
// ✅ 正确
import WebSocket from 'ws';
import dgram from 'dgram';

// ❌ 错误
const WebSocket = require('ws');
const dgram = require('dgram');
```

---

## 开发检查清单

### 服务器端

- [ ] **UDP 服务器绑定到 `0.0.0.0`**
  - 确保可以接收来自所有网络接口的消息
  - 不仅仅是 `127.0.0.1`

- [ ] **TCP 服务器绑定到 `0.0.0.0`**
  - 同上

- [ ] **支持 OSC Bundle 格式**
  - TUIO 协议通常使用 Bundle
  - 必须能够解析 Bundle 中的多个消息

- [ ] **TCP 流式数据处理**
  - 处理消息分多个 TCP 包的情况
  - 正确处理长度前缀

- [ ] **错误处理和日志**
  - 详细的调试日志
  - 错误捕获和报告

- [ ] **WebSocket 客户端管理**
  - 维护连接集合
  - 处理连接断开
  - 广播消息给所有客户端

### 前端

- [ ] **模式切换**
  - 发送模式：前端 → 服务器 → UDP
  - 接收模式：服务器 → 前端

- [ ] **消息过滤**
  - 根据 `source` 字段区分消息来源
  - 只处理来自 TUIO app 的消息（接收模式）

- [ ] **坐标转换**
  - TUIO 使用归一化坐标 (0-1)
  - 前端需要转换为像素坐标

- [ ] **状态管理**
  - 维护活动光标/对象/Blob 的映射
  - 正确处理 add/update/remove 操作

### 网络配置

- [ ] **防火墙规则**
  - 允许 UDP 3333 端口入站
  - 允许 TCP 3333 端口入站
  - 允许 WebSocket 8080 端口

- [ ] **IP 地址配置**
  - 自动检测本机 IP 地址
  - 提供手动修改选项
  - 显示给用户用于手机配置

---

## 最佳实践

### 1. 错误处理

```javascript
// ✅ 好的做法
try {
  const oscMessage = osc.fromBuffer(buffer);
  this.processOSCMessage(oscMessage, source);
} catch (error) {
  console.error(`[OSC] 解析错误:`, error.message);
  console.error(`[OSC] 缓冲区内容:`, buffer.toString('hex'));
  // 不要抛出，继续处理其他消息
}
```

### 2. 日志记录

```javascript
// ✅ 详细的日志
console.log(`[UDP Server] 收到消息来自 ${rinfo.address}:${rinfo.port}`);
console.log(`[OSC] 检测到OSC Bundle格式`);
console.log(`[TUIO] 处理消息: ${address}`);

// ❌ 避免
console.log('收到消息'); // 太简单
```

### 3. 性能优化

- 使用 `Set` 管理 WebSocket 客户端（O(1) 查找）
- 批量处理 Bundle 中的消息
- 避免在消息处理中进行阻塞操作

### 4. 安全性

- 验证 OSC 消息格式
- 限制消息大小
- 考虑添加身份验证（生产环境）

---

## 关键代码实现

### OSC Bundle 检测和解析

```javascript
handleOSCMessage(buffer, source) {
  // 检测是否是 Bundle 格式
  const isBundle = buffer.length >= 8 && 
    buffer.slice(0, 8).toString('ascii').startsWith('#bundle');
  
  if (isBundle) {
    this.handleOSCBundle(buffer, source);
  } else {
    // 单个 OSC 消息
    const oscMessage = osc.fromBuffer(buffer);
    this.processOSCMessage(oscMessage, source);
  }
}

handleOSCBundle(buffer, source) {
  let offset = 8; // 跳过 "#bundle"
  offset += 8; // 跳过时间戳
  
  while (offset < buffer.length) {
    const messageLength = buffer.readUInt32BE(offset);
    offset += 4;
    const messageBuffer = buffer.slice(offset, offset + messageLength);
    offset += messageLength;
    offset = Math.ceil(offset / 4) * 4; // 4字节对齐
    
    const oscMessage = osc.fromBuffer(messageBuffer);
    this.processOSCMessage(oscMessage, source);
  }
}
```

### UDP 服务器正确绑定

```javascript
// ✅ 正确：接收所有网络接口的消息
this.udpServer.bind(this.udpListenPort, '0.0.0.0', (err) => {
  if (err) {
    console.error('绑定失败:', err);
  }
});

// ❌ 错误：只能接收本地消息
this.udpServer.bind(this.udpListenPort, '127.0.0.1');
```

### WebSocket 广播

```javascript
broadcastToWebSocket(message) {
  const data = JSON.stringify(message);
  this.wsClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(data);
      } catch (error) {
        console.error('广播失败:', error);
      }
    }
  });
}
```

---

## 常见问题排查

### 问题 1: 收不到 UDP 消息

**可能原因**:
1. 防火墙阻止
2. 绑定地址错误（使用了 `127.0.0.1`）
3. 手机 IP 配置错误
4. 网络不在同一子网

**排查步骤**:
1. 检查 UDP 端口是否监听：`netstat -ano | findstr :3333`
2. 检查绑定地址：应该是 `0.0.0.0`
3. 检查防火墙规则
4. 使用测试工具验证 UDP 接收

### 问题 2: OSC 消息解析失败

**可能原因**:
1. 消息是 Bundle 格式但未处理
2. 消息格式不符合 OSC 规范
3. 缓冲区数据不完整

**排查步骤**:
1. 检查消息前 8 字节是否为 `#bundle`
2. 查看十六进制转储
3. 添加详细的解析日志

### 问题 3: WebSocket 消息未到达前端

**可能原因**:
1. WebSocket 客户端未连接
2. 消息格式错误
3. 前端消息过滤逻辑问题

**排查步骤**:
1. 检查 `wsClients.size` 是否 > 0
2. 检查消息的 `source` 字段
3. 查看浏览器控制台日志

---

## 依赖库

### 必需依赖

- **ws**: WebSocket 服务器和客户端
- **osc-min**: OSC 消息构建和解析
- **dgram** (Node.js 内置): UDP 通信
- **net** (Node.js 内置): TCP 通信

### 安装

```bash
pnpm add ws osc-min
```

---

## 端口配置

| 服务 | 端口 | 协议 | 方向 | 说明 |
|------|------|------|------|------|
| WebSocket 服务器 | 8080 | TCP | 双向 | 前端 ↔ 服务器 |
| UDP 接收服务器 | 3333 | UDP | 入站 | 接收手机消息 |
| TCP 接收服务器 | 3333 | TCP | 入站 | 接收手机消息 |
| UDP 发送客户端 | 3333 | UDP | 出站 | 发送到目标应用 |
| 静态文件服务器 | 8081 | HTTP | 入站 | 前端页面 |

---

## 消息格式

### 前端 → 服务器 (JSON)

```json
{
  "type": "cursor",
  "action": "add",
  "sessionId": 1,
  "x": 0.5,
  "y": 0.5,
  "xSpeed": 0.0,
  "ySpeed": 0.0,
  "motionAccel": 0.0
}
```

### 服务器 → 前端 (JSON)

```json
{
  "type": "cursor",
  "action": "add",
  "sessionId": 1,
  "x": 0.5,
  "y": 0.5,
  "xSpeed": 0.0,
  "ySpeed": 0.0,
  "motionAccel": 0.0,
  "source": "tuio-app"
}
```

### OSC 消息格式

```
/tuio/2Dcur
  set <sessionId> <x> <y> <xSpeed> <ySpeed> <motionAccel>
  alive <sessionId1> <sessionId2> ...
  fseq <frameId>
```

---

## 测试工具

### UDP 接收测试工具

创建 `test-udp-receive.js` 用于独立测试 UDP 接收：

```javascript
import dgram from 'dgram';

const server = dgram.createSocket('udp4');

server.on('message', (msg, rinfo) => {
  console.log(`收到UDP消息来自 ${rinfo.address}:${rinfo.port}`);
  console.log(`消息长度: ${msg.length} 字节`);
  console.log(`消息内容 (hex): ${msg.toString('hex')}`);
});

server.bind(3333, '0.0.0.0', () => {
  console.log('UDP测试服务器已启动，监听 0.0.0.0:3333');
});
```

---

## 部署注意事项

1. **防火墙配置**: 确保开放必要端口
2. **网络配置**: 确保服务器和客户端在同一网络
3. **IP 地址**: 使用实际网络 IP，不是 `127.0.0.1`
4. **日志**: 生产环境考虑日志级别和轮转
5. **错误处理**: 添加优雅的错误处理和恢复机制

---

## 扩展建议

1. **支持更多 TUIO 类型**: 3D 对象、手势等
2. **消息队列**: 处理高频率消息
3. **身份验证**: WebSocket 连接认证
4. **配置管理**: 支持配置文件和环境变量
5. **监控和统计**: 消息计数、延迟统计等

---

## 参考资料

- [TUIO 协议规范](http://www.tuio.org/)
- [OSC 协议](https://opensoundcontrol.org/)
- [Node.js dgram 文档](https://nodejs.org/api/dgram.html)
- [Node.js net 文档](https://nodejs.org/api/net.html)
- [ws 库文档](https://github.com/websockets/ws)

