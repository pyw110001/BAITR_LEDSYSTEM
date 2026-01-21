import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

// 兼容 ESM 和 CJS (用于 pkg 打包)
let _rootValue;
try {
  _rootValue = __dirname;
} catch (e) {
  _rootValue = (import.meta && import.meta.url) ? path.dirname(fileURLToPath(import.meta.url)) : process.cwd();
}
const PROJECT_ROOT = _rootValue;

export function startStaticServer(options = {}) {
  const PORT = options.port || process.env.STATIC_PORT || 8001;

  const server = http.createServer((req, res) => {

    // 解析请求路径
    let filePath = '.' + req.url;

    // 默认访问 login.html
    if (filePath === './') {
      filePath = './login.html';
    }

    // 移除查询参数
    filePath = filePath.split('?')[0];

    // 构建完整文件路径
    // 如果请求的是 /animation.html 或以 /assets/ 开头，特殊处理
    let fullPath;
    if (filePath === './animation.html') {
      fullPath = path.join(PROJECT_ROOT, 'public/dist-animation/index.html');
    } else if (filePath.startsWith('./assets/') && !fs.existsSync(path.join(PROJECT_ROOT, 'public', filePath))) {
      // 尝试在 dist-animation 找
      const animAssetsPath = path.join(PROJECT_ROOT, 'public/dist-animation', filePath);
      if (fs.existsSync(animAssetsPath)) {
        fullPath = animAssetsPath;
      } else {
        fullPath = path.join(PROJECT_ROOT, 'public', filePath);
      }
    } else {
      fullPath = path.join(PROJECT_ROOT, 'public', filePath);
    }

    console.log(`[静态文件服务器] 请求: ${req.url} -> 映射路径: ${fullPath}`);

    // 获取文件扩展名
    const extname = String(path.extname(fullPath)).toLowerCase();
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';

    // 检查文件是否存在
    fs.readFile(fullPath, (error, content) => {
      if (error) {
        if (error.code === 'ENOENT') {
          // 文件不存在，返回 404
          console.error(`[静态文件服务器] 404 - 文件未找到: ${fullPath}`);
          res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(`<h1>404 - 文件未找到</h1><p>尝试路径: ${fullPath}</p>`, 'utf-8');
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

  return server;
}


// 优雅关闭在 start.js 中处理
