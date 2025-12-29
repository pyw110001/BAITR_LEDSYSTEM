import WebSocket from 'ws';
import { WebSocketServer } from 'ws';
import dgram from 'dgram';
import net from 'net';
import osc from 'osc-min';
import os from 'os';

/**
 * TUIO Bridge Server
 * 双向桥接：
 * 1. 前端 WebSocket -> OSC/UDP (原有功能)
 * 2. 手机 TUIOpad (TCP/UDP) -> OSC -> WebSocket -> 前端 (新增功能)
 */
class TuioBridgeServer {
  constructor(options = {}) {
    this.wsPort = options.wsPort || 8080;
    this.udpHost = options.udpHost || '127.0.0.1';
    this.udpPort = options.udpPort || 3333;
    this.tcpPort = options.tcpPort || 3333;
    this.udpListenPort = options.udpListenPort || 3333;
    this.wss = null;
    this.wsClients = new Set(); // 存储所有WebSocket客户端
    this.udpClient = null;
    this.udpServer = null; // UDP服务器（接收来自手机的UDP消息）
    this.tcpServer = null; // TCP服务器（接收来自手机的TCP消息）
    this.frameId = 0;
    this.activeCursors = new Map();
    this.activeObjects = new Map();
    this.activeBlobs = new Map();
  }

  /**
   * 启动服务器
   */
  start() {
    // 创建 UDP 客户端（用于发送OSC消息到目标应用）
    this.udpClient = dgram.createSocket('udp4');

    // 创建 UDP 服务器（用于接收来自手机的UDP OSC消息）
    this.udpServer = dgram.createSocket('udp4');
    
    this.udpServer.on('message', (msg, rinfo) => {
      console.log(`\n[UDP Server] ===== 收到UDP消息 =====`);
      console.log(`[UDP Server] 来源: ${rinfo.address}:${rinfo.port}`);
      console.log(`[UDP Server] 消息长度: ${msg.length} 字节`);
      console.log(`[UDP Server] 时间戳: ${new Date().toISOString()}`);
      this.handleOSCMessage(msg, `UDP:${rinfo.address}:${rinfo.port}`);
      console.log(`[UDP Server] ========================\n`);
    });
    
    this.udpServer.on('error', (err) => {
      console.error('[UDP Server] 错误:', err);
      console.error('[UDP Server] 错误详情:', err.message, err.code);
    });
    
    this.udpServer.on('listening', () => {
      const address = this.udpServer.address();
      console.log(`\n[TUIO Bridge] ==========================================`);
      console.log(`[TUIO Bridge] ✓ UDP 服务器已启动`);
      console.log(`[TUIO Bridge]   监听地址: ${address.address}`);
      console.log(`[TUIO Bridge]   监听端口: ${address.port}`);
      console.log(`[TUIO Bridge]   协议: UDP/IPv4`);
      console.log(`[TUIO Bridge]   准备接收来自手机的TUIO消息...`);
      
      // 获取本机IP地址用于提示
      const interfaces = os.networkInterfaces();
      const ips = [];
      for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
          if (iface.family === 'IPv4' && !iface.internal) {
            ips.push(iface.address);
          }
        }
      }
      if (ips.length > 0) {
        console.log(`[TUIO Bridge] 提示: 请在手机TUIOpad中配置以下IP地址之一:`);
        ips.forEach(ip => console.log(`[TUIO Bridge]   - Host: ${ip}, Port: ${address.port}, Protocol: UDP`));
      }
      console.log(`[TUIO Bridge] ==========================================\n`);
    });
    
    // 绑定到0.0.0.0以接收来自所有网络接口的消息
    this.udpServer.bind(this.udpListenPort, '0.0.0.0', (err) => {
      if (err) {
        console.error(`[TUIO Bridge] ✗ UDP 服务器绑定失败:`, err);
        console.error(`[TUIO Bridge] 错误详情:`, err.message, err.code);
        if (err.code === 'EADDRINUSE') {
          console.error(`[TUIO Bridge] 端口 ${this.udpListenPort} 已被占用！`);
        }
      } else {
        // 绑定成功，但listening事件会触发，这里只记录错误
      }
    });

    // 创建 TCP 服务器（用于接收来自手机的TCP OSC消息）
    this.tcpServer = net.createServer((socket) => {
      const clientInfo = `${socket.remoteAddress}:${socket.remotePort}`;
      console.log(`[TCP Server] 新客户端连接: ${clientInfo}`);
      
      let buffer = Buffer.alloc(0);
      
      socket.on('data', (data) => {
        console.log(`[TCP Server] 收到数据来自 ${clientInfo}, 长度: ${data.length} 字节`);
        buffer = Buffer.concat([buffer, data]);
        // OSC消息可能分多个TCP包发送，需要处理
        this.processTCPBuffer(buffer, (remainingBuffer) => {
          buffer = remainingBuffer;
        }, clientInfo);
      });

      socket.on('close', () => {
        console.log(`[TCP Server] 客户端断开连接: ${clientInfo}`);
      });

      socket.on('error', (err) => {
        console.error(`[TCP Server] 错误 (${clientInfo}):`, err);
      });
    });
    // 绑定到0.0.0.0以接收来自所有网络接口的连接
    this.tcpServer.listen(this.tcpPort, '0.0.0.0', () => {
      const address = this.tcpServer.address();
      console.log(`[TUIO Bridge] TCP 服务器监听在 ${address.address}:${address.port} (接收来自手机的TCP消息)`);
    });
    this.tcpServer.on('error', (err) => {
      console.error('[TCP Server] 服务器错误:', err);
    });

    // 创建 WebSocket 服务器
    try {
      this.wss = new WebSocketServer({ port: this.wsPort });

      this.wss.on('connection', (ws) => {
        console.log(`[WebSocket] 新客户端连接: ${ws._socket.remoteAddress}`);
        this.wsClients.add(ws);
        
        ws.on('message', (data) => {
          try {
            const message = JSON.parse(data.toString());
            // 根据消息来源判断模式
            // 如果消息有source字段且为'tuio-app'，说明是接收模式的消息（从服务器转发）
            // 否则是发送模式的消息（从前端发送）
            this.handleWebSocketMessage(message);
          } catch (error) {
            console.error('[错误] 解析 WebSocket 消息失败:', error);
          }
        });

        ws.on('close', () => {
          console.log('[WebSocket] 客户端断开连接');
          this.wsClients.delete(ws);
          // 清理所有活动对象
          this.sendAliveMessage();
        });

        ws.on('error', (error) => {
          console.error('[WebSocket] 客户端错误:', error);
          this.wsClients.delete(ws);
        });
      });

      this.wss.on('error', (error) => {
        console.error(`[WebSocket Server] 服务器错误:`, error);
        if (error.code === 'EADDRINUSE') {
          console.error(`[错误] 端口 ${this.wsPort} 已被占用，请关闭占用该端口的程序或更改端口`);
        }
      });

      this.wss.on('listening', () => {
        console.log(`[TUIO Bridge] WebSocket 服务器启动在端口 ${this.wsPort}`);
        console.log(`[TUIO Bridge] UDP 目标: ${this.udpHost}:${this.udpPort}`);
        console.log(`[TUIO Bridge] 等待客户端连接...`);
        console.log(`[TUIO Bridge] 支持两种模式:`);
        console.log(`  - 发送模式: 前端 → WebSocket → UDP/OSC`);
        console.log(`  - 接收模式: 手机TUIOpad → TCP/UDP → WebSocket → 前端`);
      });

    } catch (error) {
      console.error(`[TUIO Bridge] 启动WebSocket服务器失败:`, error);
      if (error.code === 'EADDRINUSE') {
        console.error(`[错误] 端口 ${this.wsPort} 已被占用`);
      }
      throw error;
    }
  }

  /**
   * 处理来自手机的OSC消息（TCP/UDP）
   * 支持单个OSC消息和OSC bundle格式
   */
  handleOSCMessage(buffer, source) {
    try {
      console.log(`[OSC] 收到消息 (${source}), 缓冲区长度: ${buffer.length} 字节`);
      console.log(`[OSC] 缓冲区前32字节 (hex):`, buffer.slice(0, Math.min(32, buffer.length)).toString('hex'));
      
      // 检查是否是OSC bundle格式（以 "#bundle" 开头）
      const isBundle = buffer.length >= 8 && buffer.slice(0, 8).toString('ascii').startsWith('#bundle');
      
      if (isBundle) {
        console.log(`[OSC] 检测到OSC Bundle格式`);
        this.handleOSCBundle(buffer, source);
      } else {
        // 单个OSC消息
        const oscMessage = osc.fromBuffer(buffer);
        console.log(`[OSC] ✓ 解析成功: 地址=${oscMessage.address}, 参数数量=${oscMessage.args?.length || 0}`);
        
        if (oscMessage.args && oscMessage.args.length > 0) {
          console.log(`[OSC] 第一个参数类型: ${oscMessage.args[0].type}, 值: ${oscMessage.args[0].value}`);
        }
        
        this.processOSCMessage(oscMessage, source);
      }
    } catch (error) {
      console.error(`[OSC] ✗ 解析错误 (${source}):`, error.message);
      console.error(`[OSC] 错误堆栈:`, error.stack);
      console.error(`[OSC] 缓冲区内容 (前64字节 hex):`, buffer.slice(0, Math.min(64, buffer.length)).toString('hex'));
      console.error(`[OSC] 缓冲区内容 (前64字节 ascii):`, buffer.slice(0, Math.min(64, buffer.length)).toString('ascii').replace(/[^\x20-\x7E]/g, '.'));
    }
  }

  /**
   * 处理OSC Bundle格式
   * OSC Bundle格式: "#bundle" + 时间戳 + [长度(4字节) + OSC消息]...
   */
  handleOSCBundle(buffer, source) {
    try {
      let offset = 8; // 跳过 "#bundle" (8字节)
      
      // 读取时间戳（8字节，OSC时间戳格式）
      const timeTag = buffer.slice(offset, offset + 8);
      offset += 8;
      
      console.log(`[OSC Bundle] 时间戳:`, timeTag.toString('hex'));
      
      // 解析bundle中的所有消息
      while (offset < buffer.length) {
        if (offset + 4 > buffer.length) {
          break; // 没有足够的数据读取长度
        }
        
        // 读取消息长度（4字节，大端序）
        const messageLength = buffer.readUInt32BE(offset);
        offset += 4;
        
        if (messageLength === 0 || offset + messageLength > buffer.length) {
          break; // 无效长度或数据不完整
        }
        
        // 提取OSC消息
        const messageBuffer = buffer.slice(offset, offset + messageLength);
        offset += messageLength;
        
        // 对齐到4字节边界
        offset = Math.ceil(offset / 4) * 4;
        
        try {
          // 解析单个OSC消息
          const oscMessage = osc.fromBuffer(messageBuffer);
          console.log(`[OSC Bundle] ✓ 解析bundle中的消息: 地址=${oscMessage.address}, 参数数量=${oscMessage.args?.length || 0}`);
          this.processOSCMessage(oscMessage, source);
        } catch (error) {
          console.error(`[OSC Bundle] ✗ 解析bundle中的消息失败:`, error.message);
        }
      }
      
      const messageCount = Math.floor((offset - 16) / 4);
      console.log(`[OSC Bundle] ✓ Bundle处理完成`);
    } catch (error) {
      console.error(`[OSC Bundle] ✗ Bundle处理错误:`, error.message);
      console.error(`[OSC Bundle] 错误堆栈:`, error.stack);
    }
  }

  /**
   * 处理TCP缓冲区（OSC消息可能分多个TCP包）
   * OSC消息在TCP中通常以长度前缀（4字节）开头，然后是OSC消息内容
   */
  processTCPBuffer(buffer, callback, source) {
    let offset = 0;
    
    while (offset + 4 <= buffer.length) {
      try {
        // 读取消息长度（4字节，大端序）
        const messageLength = buffer.readUInt32BE(offset);
        
        // 检查是否有足够的数据
        if (offset + 4 + messageLength > buffer.length) {
          // 消息不完整，等待更多数据
          break;
        }
        
        // 提取OSC消息内容
        const oscBuffer = buffer.slice(offset + 4, offset + 4 + messageLength);
        
        // 解析OSC消息
        const oscMessage = osc.fromBuffer(oscBuffer);
        this.processOSCMessage(oscMessage, source);
        
        // 移动到下一个消息
        offset += 4 + messageLength;
      } catch (error) {
        // 如果解析失败，尝试直接解析（某些TUIO实现可能不使用长度前缀）
        try {
          const oscMessage = osc.fromBuffer(buffer.slice(offset));
          const messageLength = osc.toBuffer(oscMessage).length;
          this.processOSCMessage(oscMessage, source);
          
          // OSC消息长度必须是4的倍数，对齐到4字节边界
          offset += Math.ceil(messageLength / 4) * 4;
        } catch (error2) {
          // 如果两种方式都失败，可能是消息不完整，等待更多数据
          break;
        }
      }
    }
    
    callback(buffer.slice(offset));
  }

  /**
   * 处理解析后的OSC消息，转换为JSON并通过WebSocket广播
   */
  processOSCMessage(oscMessage, source) {
    const address = oscMessage.address;
    console.log(`[TUIO] 处理消息: ${address} (来源: ${source})`);
    
    // 只处理TUIO协议的消息
    if (!address.startsWith('/tuio/')) {
      console.log(`[TUIO] 跳过非TUIO消息: ${address}`);
      return;
    }

    const args = oscMessage.args || [];
    if (args.length === 0) {
      return;
    }

    const command = args[0].value; // 'set', 'alive', 'fseq'

    // 处理光标消息
    if (address === '/tuio/2Dcur') {
      console.log(`[TUIO] 处理2Dcur消息, 命令: ${command}, 参数数量: ${args.length}`);
      
      if (command === 'set' && args.length >= 6) {
        const sessionId = args[1].value;
        const x = args[2].value;
        const y = args[3].value;
        const xSpeed = args[4].value;
        const ySpeed = args[5].value;
        const motionAccel = args[6]?.value || 0;

        console.log(`[TUIO] 2Dcur set: sessionId=${sessionId}, x=${x}, y=${y}`);

        // 判断是新增还是更新
        const isNew = !this.activeCursors.has(sessionId);
        
        // 更新本地状态
        this.activeCursors.set(sessionId, { x, y, xSpeed, ySpeed, motionAccel });

        // 广播给所有WebSocket客户端
        this.broadcastToWebSocket({
          type: 'cursor',
          action: isNew ? 'add' : 'update',
          sessionId,
          x,
          y,
          xSpeed,
          ySpeed,
          motionAccel,
          source: 'tuio-app'
        });
      } else if (command === 'alive') {
        console.log(`[TUIO] 2Dcur alive: ${args.length - 1} 个活动光标`);
        // alive消息包含所有活动的sessionId列表
        const aliveIds = args.slice(1).map(arg => arg.value);
        const currentIds = Array.from(this.activeCursors.keys());
        
        // 找出需要移除的
        const toRemove = currentIds.filter(id => !aliveIds.includes(id));
        toRemove.forEach(sessionId => {
          this.activeCursors.delete(sessionId);
          this.broadcastToWebSocket({
            type: 'cursor',
            action: 'remove',
            sessionId,
            source: 'tuio-app'
          });
        });
      } else if (command === 'fseq') {
        // 帧序列号，可以忽略或用于同步
        this.frameId = args[1]?.value || this.frameId;
        console.log(`[TUIO] 2Dcur fseq: frameId=${this.frameId}`);
      } else {
        console.log(`[TUIO] 2Dcur 未知命令: ${command}, 参数数量: ${args.length}`);
      }
    }
    // 处理对象消息
    else if (address === '/tuio/2Dobj') {
      if (command === 'set' && args.length >= 9) {
        const sessionId = args[1].value;
        const symbolId = args[2].value;
        const x = args[3].value;
        const y = args[4].value;
        const angle = args[5].value;
        const xSpeed = args[6].value;
        const ySpeed = args[7].value;
        const rotationSpeed = args[8].value;
        const motionAccel = args[9]?.value || 0;
        const rotationAccel = args[10]?.value || 0;

        const isNew = !this.activeObjects.has(sessionId);
        this.activeObjects.set(sessionId, { symbolId, x, y, angle, xSpeed, ySpeed, rotationSpeed, motionAccel, rotationAccel });

        this.broadcastToWebSocket({
          type: 'object',
          action: isNew ? 'add' : 'update',
          sessionId,
          symbolId,
          x,
          y,
          angle,
          xSpeed,
          ySpeed,
          rotationSpeed,
          motionAccel,
          rotationAccel,
          source: 'tuio-app'
        });
      } else if (command === 'alive') {
        const aliveIds = args.slice(1).map(arg => arg.value);
        const currentIds = Array.from(this.activeObjects.keys());
        const toRemove = currentIds.filter(id => !aliveIds.includes(id));
        toRemove.forEach(sessionId => {
          this.activeObjects.delete(sessionId);
          this.broadcastToWebSocket({
            type: 'object',
            action: 'remove',
            sessionId,
            source: 'tuio-app'
          });
        });
      }
    }
    // 处理Blob消息
    else if (address === '/tuio/2Dblb') {
      if (command === 'set' && args.length >= 11) {
        const sessionId = args[1].value;
        const x = args[2].value;
        const y = args[3].value;
        const angle = args[4].value;
        const width = args[5].value;
        const height = args[6].value;
        const area = args[7].value;
        const xSpeed = args[8].value;
        const ySpeed = args[9].value;
        const rotationSpeed = args[10].value;
        const motionAccel = args[11]?.value || 0;
        const rotationAccel = args[12]?.value || 0;

        const isNew = !this.activeBlobs.has(sessionId);
        this.activeBlobs.set(sessionId, { x, y, angle, width, height, area, xSpeed, ySpeed, rotationSpeed, motionAccel, rotationAccel });

        this.broadcastToWebSocket({
          type: 'blob',
          action: isNew ? 'add' : 'update',
          sessionId,
          x,
          y,
          angle,
          width,
          height,
          area,
          xSpeed,
          ySpeed,
          rotationSpeed,
          motionAccel,
          rotationAccel,
          source: 'tuio-app'
        });
      } else if (command === 'alive') {
        const aliveIds = args.slice(1).map(arg => arg.value);
        const currentIds = Array.from(this.activeBlobs.keys());
        const toRemove = currentIds.filter(id => !aliveIds.includes(id));
        toRemove.forEach(sessionId => {
          this.activeBlobs.delete(sessionId);
          this.broadcastToWebSocket({
            type: 'blob',
            action: 'remove',
            sessionId,
            source: 'tuio-app'
          });
        });
      }
    }
  }

  /**
   * 广播消息给所有WebSocket客户端
   */
  broadcastToWebSocket(message) {
    const data = JSON.stringify(message);
    const clientCount = this.wsClients.size;
    console.log(`[WebSocket] 广播消息给 ${clientCount} 个客户端:`, message.type, message.action || '');
    this.wsClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(data);
        } catch (error) {
          console.error('[WebSocket] 广播消息失败:', error);
        }
      } else {
        console.warn(`[WebSocket] 客户端状态不是OPEN: ${client.readyState}`);
      }
    });
  }

  /**
   * 处理 WebSocket 消息
   */
  handleWebSocketMessage(message) {
    switch (message.type) {
      case 'cursor':
        this.handleCursor(message);
        break;
      case 'object':
        this.handleObject(message);
        break;
      case 'blob':
        this.handleBlob(message);
        break;
      case 'frame':
        this.sendFrame();
        break;
      case 'reset':
        this.reset();
        break;
      default:
        console.warn('[警告] 未知的消息类型:', message.type);
    }
  }

  /**
   * 处理光标（触摸点）消息
   */
  handleCursor(message) {
    const { action, sessionId, x, y, xSpeed, ySpeed, motionAccel } = message;
    
    switch (action) {
      case 'add':
        this.activeCursors.set(sessionId, { x, y, xSpeed, ySpeed, motionAccel });
        this.sendCursorMessage('set', sessionId, x, y, xSpeed, ySpeed, motionAccel);
        break;
      case 'update':
        if (this.activeCursors.has(sessionId)) {
          this.activeCursors.set(sessionId, { x, y, xSpeed, ySpeed, motionAccel });
          this.sendCursorMessage('set', sessionId, x, y, xSpeed, ySpeed, motionAccel);
        }
        break;
      case 'remove':
        if (this.activeCursors.has(sessionId)) {
          this.sendCursorMessage('alive', sessionId);
          this.activeCursors.delete(sessionId);
        }
        break;
    }
  }

  /**
   * 处理对象（标记物）消息
   */
  handleObject(message) {
    const { action, sessionId, symbolId, x, y, angle, xSpeed, ySpeed, rotationSpeed, motionAccel, rotationAccel } = message;
    
    switch (action) {
      case 'add':
        this.activeObjects.set(sessionId, { symbolId, x, y, angle, xSpeed, ySpeed, rotationSpeed, motionAccel, rotationAccel });
        this.sendObjectMessage('set', sessionId, symbolId, x, y, angle, xSpeed, ySpeed, rotationSpeed, motionAccel, rotationAccel);
        break;
      case 'update':
        if (this.activeObjects.has(sessionId)) {
          this.activeObjects.set(sessionId, { symbolId, x, y, angle, xSpeed, ySpeed, rotationSpeed, motionAccel, rotationAccel });
          this.sendObjectMessage('set', sessionId, symbolId, x, y, angle, xSpeed, ySpeed, rotationSpeed, motionAccel, rotationAccel);
        }
        break;
      case 'remove':
        if (this.activeObjects.has(sessionId)) {
          this.sendObjectMessage('alive', sessionId);
          this.activeObjects.delete(sessionId);
        }
        break;
    }
  }

  /**
   * 处理 Blob 消息
   */
  handleBlob(message) {
    const { action, sessionId, x, y, angle, width, height, area, xSpeed, ySpeed, rotationSpeed, motionAccel, rotationAccel } = message;
    
    switch (action) {
      case 'add':
        this.activeBlobs.set(sessionId, { x, y, angle, width, height, area, xSpeed, ySpeed, rotationSpeed, motionAccel, rotationAccel });
        this.sendBlobMessage('set', sessionId, x, y, angle, width, height, area, xSpeed, ySpeed, rotationSpeed, motionAccel, rotationAccel);
        break;
      case 'update':
        if (this.activeBlobs.has(sessionId)) {
          this.activeBlobs.set(sessionId, { x, y, angle, width, height, area, xSpeed, ySpeed, rotationSpeed, motionAccel, rotationAccel });
          this.sendBlobMessage('set', sessionId, x, y, angle, width, height, area, xSpeed, ySpeed, rotationSpeed, motionAccel, rotationAccel);
        }
        break;
      case 'remove':
        if (this.activeBlobs.has(sessionId)) {
          this.sendBlobMessage('alive', sessionId);
          this.activeBlobs.delete(sessionId);
        }
        break;
    }
  }

  /**
   * 发送光标 OSC 消息
   */
  sendCursorMessage(type, sessionId, x = 0, y = 0, xSpeed = 0, ySpeed = 0, motionAccel = 0) {
    if (type === 'alive') {
      // 发送 alive 消息（只包含 sessionId）
      const oscMessage = {
        address: '/tuio/2Dcur',
        args: [
          { type: 's', value: 'alive' },
          { type: 'i', value: sessionId }
        ]
      };
      this.sendOSCMessage(oscMessage);
    } else {
      // 发送 set 消息
      const oscMessage = {
        address: '/tuio/2Dcur',
        args: [
          { type: 's', value: 'set' },
          { type: 'i', value: sessionId },
          { type: 'f', value: x },
          { type: 'f', value: y },
          { type: 'f', value: xSpeed },
          { type: 'f', value: ySpeed },
          { type: 'f', value: motionAccel }
        ]
      };
      this.sendOSCMessage(oscMessage);
    }
  }

  /**
   * 发送对象 OSC 消息
   */
  sendObjectMessage(type, sessionId, symbolId = 0, x = 0, y = 0, angle = 0, xSpeed = 0, ySpeed = 0, rotationSpeed = 0, motionAccel = 0, rotationAccel = 0) {
    if (type === 'alive') {
      const oscMessage = {
        address: '/tuio/2Dobj',
        args: [
          { type: 's', value: 'alive' },
          { type: 'i', value: sessionId }
        ]
      };
      this.sendOSCMessage(oscMessage);
    } else {
      const oscMessage = {
        address: '/tuio/2Dobj',
        args: [
          { type: 's', value: 'set' },
          { type: 'i', value: sessionId },
          { type: 'i', value: symbolId },
          { type: 'f', value: x },
          { type: 'f', value: y },
          { type: 'f', value: angle },
          { type: 'f', value: xSpeed },
          { type: 'f', value: ySpeed },
          { type: 'f', value: rotationSpeed },
          { type: 'f', value: motionAccel },
          { type: 'f', value: rotationAccel }
        ]
      };
      this.sendOSCMessage(oscMessage);
    }
  }

  /**
   * 发送 Blob OSC 消息
   */
  sendBlobMessage(type, sessionId, x = 0, y = 0, angle = 0, width = 0, height = 0, area = 0, xSpeed = 0, ySpeed = 0, rotationSpeed = 0, motionAccel = 0, rotationAccel = 0) {
    if (type === 'alive') {
      const oscMessage = {
        address: '/tuio/2Dblb',
        args: [
          { type: 's', value: 'alive' },
          { type: 'i', value: sessionId }
        ]
      };
      this.sendOSCMessage(oscMessage);
    } else {
      const oscMessage = {
        address: '/tuio/2Dblb',
        args: [
          { type: 's', value: 'set' },
          { type: 'i', value: sessionId },
          { type: 'f', value: x },
          { type: 'f', value: y },
          { type: 'f', value: angle },
          { type: 'f', value: width },
          { type: 'f', value: height },
          { type: 'f', value: area },
          { type: 'f', value: xSpeed },
          { type: 'f', value: ySpeed },
          { type: 'f', value: rotationSpeed },
          { type: 'f', value: motionAccel },
          { type: 'f', value: rotationAccel }
        ]
      };
      this.sendOSCMessage(oscMessage);
    }
  }

  /**
   * 发送 OSC 消息到 UDP
   */
  sendOSCMessage(oscMessage) {
    try {
      const buffer = osc.toBuffer(oscMessage);
      this.udpClient.send(buffer, 0, buffer.length, this.udpPort, this.udpHost, (err) => {
        if (err) {
          console.error('[UDP] 发送错误:', err);
        }
      });
    } catch (error) {
      console.error('[OSC] 消息构建错误:', error);
    }
  }

  /**
   * 发送帧消息
   */
  sendFrame() {
    // 发送 alive 消息（所有活动的 sessionId）
    const aliveCursors = Array.from(this.activeCursors.keys());
    const aliveObjects = Array.from(this.activeObjects.keys());
    const aliveBlobs = Array.from(this.activeBlobs.keys());

    if (aliveCursors.length > 0) {
      const aliveArgs = [
        { type: 's', value: 'alive' },
        ...aliveCursors.map(id => ({ type: 'i', value: id }))
      ];
      const aliveMessage = {
        address: '/tuio/2Dcur',
        args: aliveArgs
      };
      this.sendOSCMessage(aliveMessage);
    }

    if (aliveObjects.length > 0) {
      const aliveArgs = [
        { type: 's', value: 'alive' },
        ...aliveObjects.map(id => ({ type: 'i', value: id }))
      ];
      const aliveMessage = {
        address: '/tuio/2Dobj',
        args: aliveArgs
      };
      this.sendOSCMessage(aliveMessage);
    }

    if (aliveBlobs.length > 0) {
      const aliveArgs = [
        { type: 's', value: 'alive' },
        ...aliveBlobs.map(id => ({ type: 'i', value: id }))
      ];
      const aliveMessage = {
        address: '/tuio/2Dblb',
        args: aliveArgs
      };
      this.sendOSCMessage(aliveMessage);
    }

    // 发送 fseq 消息（帧序列号）
    const fseqMessage = {
      address: '/tuio/2Dcur',
      args: [
        { type: 's', value: 'fseq' },
        { type: 'i', value: this.frameId }
      ]
    };
    this.sendOSCMessage(fseqMessage);
    
    const fseqObjMessage = {
      address: '/tuio/2Dobj',
      args: [
        { type: 's', value: 'fseq' },
        { type: 'i', value: this.frameId }
      ]
    };
    this.sendOSCMessage(fseqObjMessage);
    
    const fseqBlbMessage = {
      address: '/tuio/2Dblb',
      args: [
        { type: 's', value: 'fseq' },
        { type: 'i', value: this.frameId }
      ]
    };
    this.sendOSCMessage(fseqBlbMessage);

    this.frameId++;
  }

  /**
   * 发送 alive 消息（用于清理）
   */
  sendAliveMessage() {
    // 发送空的 alive 消息
    const aliveMessage = {
      address: '/tuio/2Dcur',
      args: [{ type: 's', value: 'alive' }]
    };
    this.sendOSCMessage(aliveMessage);
    this.sendFrame();
  }

  /**
   * 重置所有状态
   */
  reset() {
    this.activeCursors.clear();
    this.activeObjects.clear();
    this.activeBlobs.clear();
    this.frameId = 0;
    this.sendAliveMessage();
    console.log('[TUIO Bridge] 状态已重置');
  }

  /**
   * 停止服务器
   */
  stop() {
    if (this.wss) {
      this.wss.close();
    }
    if (this.udpClient) {
      this.udpClient.close();
    }
    if (this.udpServer) {
      this.udpServer.close();
    }
    if (this.tcpServer) {
      this.tcpServer.close();
    }
    console.log('[TUIO Bridge] 服务器已停止');
  }
}

// 启动服务器
const server = new TuioBridgeServer({
  wsPort: process.env.WS_PORT || 8080,
  udpHost: process.env.UDP_HOST || '127.0.0.1',
  udpPort: process.env.UDP_PORT || 3333,
  tcpPort: process.env.TCP_PORT || 3333, // TCP服务器端口（接收来自手机的TCP消息）
  udpListenPort: process.env.UDP_LISTEN_PORT || 3333 // UDP服务器端口（接收来自手机的UDP消息）
});

try {
  server.start();
  console.log('\n' + '='.repeat(60));
  console.log('[TUIO Bridge] 服务器启动成功！');
  console.log('[TUIO Bridge] 架构说明：');
  console.log('  - 发送模式: 前端 → WebSocket(8080) → UDP/OSC');
  console.log('  - 接收模式: 手机TUIOpad → TCP/UDP(3333) → WebSocket(8080) → 前端');
  console.log('[TUIO Bridge] 两种模式共用同一个WebSocket服务器，这是正确的设计');
  console.log('='.repeat(60) + '\n');
} catch (error) {
  console.error('[TUIO Bridge] 服务器启动失败:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`[错误] 端口已被占用，请检查：`);
    console.error(`  - WebSocket端口 ${process.env.WS_PORT || 8080}`);
    console.error(`  - TCP端口 ${process.env.TCP_PORT || 3333}`);
    console.error(`  - UDP端口 ${process.env.UDP_LISTEN_PORT || 3333}`);
  }
  process.exit(1);
}

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n[TUIO Bridge] 正在关闭服务器...');
  server.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n[TUIO Bridge] 正在关闭服务器...');
  server.stop();
  process.exit(0);
});

