import { fileURLToPath } from 'url';
import path, { dirname, join } from 'path';
import fs from 'fs';
import { exec, execSync } from 'child_process';

// 兼容 ESM 和 CJS (用于 pkg 打包)
let _rootValue;
try {
  _rootValue = __dirname;
} catch (e) {
  _rootValue = (import.meta && import.meta.url) ? dirname(fileURLToPath(import.meta.url)) : process.cwd();
}
const PROJECT_ROOT = _rootValue;
const __dirname_fix = PROJECT_ROOT;

// 颜色输出辅助函数
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function timestamp() {
  return new Date().toLocaleTimeString('zh-CN', { hour12: false });
}

function log(module, message, color = 'reset') {
  const colorCode = colors[color] || colors.reset;
  console.log(`${colorCode}[${timestamp()}] [${module}] ${message}${colors.reset}`);
}

// 自动打开浏览器函数
function openBrowser(url) {
  const command = process.platform === 'win32' ? `start ${url}` :
    process.platform === 'darwin' ? `open ${url}` :
      `xdg-open ${url}`;
  exec(command);
  log('主进程', `已自动打开浏览器: ${url}`, 'green');
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

  // 1秒后强制退出主进程
  setTimeout(() => {
    log('主进程', '所有服务已关闭', 'green');
    process.exit(0);
  }, 1000);
}

// 捕获退出信号
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

import { startBridge } from './server.js';
import { startStaticServer } from './static-server.js';

// 启动所有服务
if (!process.pkg) {
  // 在打包后的二进制中跳过编译
  const animStudioPath = join(PROJECT_ROOT, 'animation-studio');
  if (fs.existsSync(animStudioPath)) {
    log('主进程', '正在编译 animation-studio 模块...', 'cyan');
    try {
      execSync('pnpm --filter led-animation-studio build', { cwd: PROJECT_ROOT, stdio: 'inherit' });
      log('主进程', 'animation-studio 编译完成', 'green');
    } catch (error) {
      log('主进程', `编译失败: ${error.message}`, 'red');
    }
  } else {
    log('主进程', '未找到 animation-studio 模块，跳过编译', 'yellow');
  }
} else {
  log('主进程', '运行在封装模式，跳过编译步骤', 'cyan');
}

log('主进程', '开始启动核心服务...', 'bright');

// 1. 启动 WebSocket 桥接服务器 (端口 8080)
log('TUIO Bridge', '启动中...', 'cyan');
try {
  startBridge({
    wsPort: 8080,
    udpHost: '127.0.0.1',
    udpPort: 3333,
    tcpPort: 3333,
    udpListenPort: 3333
  });
} catch (error) {
  log('TUIO Bridge', `启动失败: ${error.message}`, 'red');
}

// 等待一小段时间确保服务启动
setTimeout(() => {
  // 2. 启动静态文件服务器 (端口 8001，默认打开 login.html)
  log('Static Server', '启动中...', 'cyan');
  try {
    startStaticServer({ port: 8001 });
  } catch (error) {
    log('Static Server', `启动失败: ${error.message}`, 'red');
  }

  // 启动后自动打开浏览器
  setTimeout(() => {
    openBrowser('http://localhost:8001');
  }, 1000);

  // 显示启动信息
  setTimeout(() => {
    console.log('\n' + '='.repeat(60));
    log('主进程', '所有服务已启动！', 'green');
    console.log('\n访问地址:');
    console.log(`  ${colors.cyan}静态文件服务器:${colors.reset} http://localhost:8001 (登录页面)`);
    console.log(`  ${colors.cyan}WebSocket 服务器:${colors.reset} ws://localhost:8080`);
    console.log(`  ${colors.cyan}动画播放/导览:${colors.reset}  http://localhost:8001/navigation.html`);
    console.log('\n' + '='.repeat(60));
    console.log(`\n按 ${colors.yellow}Ctrl+C${colors.reset} 停止所有服务\n`);
  }, 2000);
}, 1000);
