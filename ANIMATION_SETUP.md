# 动画播放模块设置说明

## 已完成的工作

1. ✅ 已将动画播放模块文件复制到 `animation-studio` 目录
2. ✅ 已更新 `package.json` 添加必要依赖
3. ✅ 已更新 `navigation.html` 跳转路径

## 需要完成的步骤

### 1. 安装依赖

在项目根目录运行：

```bash
npm install
```

这将安装以下依赖：
- React 19.2.0
- React DOM 19.2.0
- TypeScript 5.8.2
- Vite 6.2.0
- @vitejs/plugin-react 5.0.0
- lucide-react 0.555.0
- @types/node 22.14.0

### 2. 运行动画播放模块

由于动画播放模块使用 Vite + React，需要单独运行开发服务器：

```bash
npm run animation:dev
```

或者：

```bash
cd animation-studio
npm install
npm run dev
```

开发服务器将在 `http://localhost:3000` 启动。

### 3. 访问动画播放页面

有两种方式：

**方式一：通过导览页面**
1. 打开 `navigation.html`
2. 点击"动画播放"模块
3. 页面会跳转到 `animation-studio/index.html`（需要 Vite 服务器运行）

**方式二：直接访问**
- 在浏览器中打开 `http://localhost:3000`（需要先运行 Vite 开发服务器）

## 注意事项

- 动画播放模块需要 Vite 开发服务器才能正常工作（因为使用了 ES 模块）
- 如果直接打开 HTML 文件，可能会因为模块导入问题而无法正常工作
- 建议在开发时同时运行主服务器和 Vite 开发服务器

## 构建生产版本（可选）

如果需要构建静态文件：

```bash
npm run animation:build
```

构建后的文件将在 `animation-studio/dist` 目录中。

