import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.STATIC_PORT || 8001;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'application/font-woff',
  '.woff2': 'application/font-woff2',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
};

const server = http.createServer((req, res) => {
  // 解析请求路径
  let filePath = '.' + req.url;

  // 默认访问 login.html
  if (filePath === './') {
    filePath = './login.html';
  }

  // 移除查询参数
  filePath = filePath.split('?')[0];

  // 特殊路由处理：将 animation.html 映射到 dist-animation/index.html
  if (filePath === './animation.html') {
    filePath = './dist-animation/index.html';
  } else if (filePath.startsWith('./assets/') && !fs.existsSync(path.join(__dirname, filePath))) {
    // 如果根目录找不到 assets，尝试在 dist-animation 找
    const animAssetsPath = path.join(__dirname, 'dist-animation', filePath);
    if (fs.existsSync(animAssetsPath)) {
      filePath = './dist-animation' + filePath.substring(1);
    }
  }

  // 获取文件扩展名
  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';

  // 构建完整文件路径
  const fullPath = path.join(__dirname, filePath);

  // 检查文件是否存在
  fs.readFile(fullPath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // 文件不存在，返回 404
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>404 - 文件未找到</h1>', 'utf-8');
      } else {
        // 服务器错误
        res.writeHead(500);
        res.end(`服务器错误: ${error.code}`, 'utf-8');
      }
    } else {
      // 成功读取文件
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`[静态文件服务器] 启动在端口 ${PORT}`);
  console.log(`[静态文件服务器] 访问地址: http://localhost:${PORT}`);
  console.log(`[静态文件服务器] 登录页面: http://localhost:${PORT}/login.html`);
  console.log(`[静态文件服务器] 导览页面: http://localhost:${PORT}/navigation.html`);
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n[静态文件服务器] 正在关闭...');
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n[静态文件服务器] 正在关闭...');
  server.close(() => {
    process.exit(0);
  });
});

