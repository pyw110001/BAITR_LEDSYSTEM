import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 颜色输出辅助函数
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(service, message, color = 'reset') {
  const timestamp = new Date().toLocaleTimeString();
  const colorCode = colors[color] || colors.reset;
  console.log(`${colorCode}[${timestamp}] [${service}]${colors.reset} ${message}`);
}

// 存储子进程
const processes = [];

// 启动服务函数
function startService(name, command, args, options = {}) {
  log(name, `启动中...`, 'cyan');
  
  const process = spawn(command, args, {
    ...options,
    stdio: 'inherit',
    shell: true,
  });

  process.on('error', (error) => {
    log(name, `启动失败: ${error.message}`, 'red');
  });

  process.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      log(name, `进程退出，代码: ${code}`, 'yellow');
    }
  });

  processes.push({ name, process });
  return process;
}

// 优雅关闭处理
function shutdown() {
  log('主进程', '正在关闭所有服务...', 'yellow');
  
  processes.forEach(({ name, process }) => {
    try {
      log(name, '正在停止...', 'yellow');
      process.kill('SIGTERM');
    } catch (error) {
      log(name, `关闭错误: ${error.message}`, 'red');
    }
  });

  setTimeout(() => {
    log('主进程', '所有服务已关闭', 'green');
    process.exit(0);
  }, 1000);
}

// 捕获退出信号
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// 启动所有服务
log('主进程', '开始启动所有服务...', 'bright');

// 1. 启动 WebSocket 桥接服务器 (端口 8080)
startService('TUIO Bridge', 'node', ['server.js'], {
  cwd: __dirname,
  env: { ...process.env, WS_PORT: '8080' },
});

// 等待一小段时间确保服务启动
setTimeout(() => {
  // 2. 启动静态文件服务器 (端口 8081，默认打开 login.html)
  startService('Static Server', 'node', ['static-server.js'], {
    cwd: __dirname,
    env: { ...process.env, STATIC_PORT: '8081' },
  });

  // 等待一小段时间
  setTimeout(() => {
    // 3. 启动 Animation Studio (端口 3000)
    // 使用 pnpm workspace filter 方式启动
    startService('Animation Studio', 'pnpm', ['--filter', 'led-animation-studio', 'dev'], {
      cwd: __dirname,
    });

    // 显示启动信息
    setTimeout(() => {
      console.log('\n' + '='.repeat(60));
      log('主进程', '所有服务已启动！', 'green');
      console.log('\n访问地址:');
      console.log(`  ${colors.cyan}静态文件服务器:${colors.reset} http://localhost:8081 (默认打开 login.html)`);
      console.log(`  ${colors.cyan}WebSocket 服务器:${colors.reset} ws://localhost:8080`);
      console.log(`  ${colors.cyan}Animation Studio:${colors.reset} http://localhost:3000`);
      console.log('\n' + '='.repeat(60));
      console.log(`\n按 ${colors.yellow}Ctrl+C${colors.reset} 停止所有服务\n`);
    }, 2000);
  }, 1000);
}, 1000);
