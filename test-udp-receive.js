import dgram from 'dgram';

// 简单的UDP接收测试
const server = dgram.createSocket('udp4');

server.on('message', (msg, rinfo) => {
  console.log(`\n[测试] ===== 收到UDP消息 =====`);
  console.log(`[测试] 来源: ${rinfo.address}:${rinfo.port}`);
  console.log(`[测试] 消息长度: ${msg.length} 字节`);
  console.log(`[测试] 消息内容 (hex): ${msg.toString('hex')}`);
  console.log(`[测试] 消息内容 (前32字节): ${msg.slice(0, Math.min(32, msg.length)).toString('hex')}`);
  console.log(`[测试] ========================\n`);
});

server.on('error', (err) => {
  console.error('[测试] UDP错误:', err);
});

server.on('listening', () => {
  const address = server.address();
  console.log(`[测试] ✓ UDP测试服务器已启动`);
  console.log(`[测试]   监听地址: ${address.address}`);
  console.log(`[测试]   监听端口: ${address.port}`);
  console.log(`[测试]   等待接收UDP消息...`);
  console.log(`[测试]   请在手机TUIOpad中配置: Host=你的PC_IP, Port=3333, Protocol=UDP\n`);
});

// 绑定到0.0.0.0:3333
server.bind(3333, '0.0.0.0', (err) => {
  if (err) {
    console.error('[测试] ✗ 绑定失败:', err);
    process.exit(1);
  }
});

// 保持运行
process.on('SIGINT', () => {
  console.log('\n[测试] 正在关闭...');
  server.close();
  process.exit(0);
});

