# 多模块项目架构设计与工程化最佳实践

针对 `BAITR_LEDSYSTEM` 这种包含 **WebSocket 桥接、静态服务、React 单页应用、传统原生 JS 模块** 等多种功能的复合型项目，本指南提供了最佳的架构建议，以避免目录混乱并简化打包流程。

---

## 1. 推荐的目录结构 (层级分明)

不要将所有东西都堆在根目录。应采用“动静分离、功能模块化”的思路：

```text
/my-project
├── /src                   # 后端核心源码 (Node.js/TS)
│   ├── /services          # 业务逻辑 (TUIO, WebSocket, UDP)
│   ├── /middleware        # 静态服务映射、权限等中间件
│   ├── index.ts           # 后端入口
│   └── config.ts          # 统一常量配置
├── /packages              # 独立的大型子模块 (如 React/Vite 应用)
│   └── /animation-studio  # 完整的 React 项目
├── /public                # 公共静态资源 (核心关键！)
│   ├── /common            # 共享的 CSS/JS
│   ├── /tuio              # TUIO 模块 HTML/JS/CSS
│   ├── /text-control      # 文字控制模块 HTML/JS/CSS
│   └── /assets            # 图片、图标等
├── /dist                  # 编译输出目录 (Git 忽略)
├── package.json           # 根目录配置与工作区管理
└── esbuild.config.mjs     # 统一构建配置
```

---

## 2. 核心架构设计原则

### A. 动静分离 (Static & Logic Separation)
- **后端 (Logic)**：仅负责数据流转（WebSocket, UDP）。使用 `esbuild` 将其编译为单文件，方便二进制封装。
- **前端 (Static)**：所有通过浏览器访问的文件必须存放在 `public/` 目录下。后端静态服务器应仅“观察”这一个目录，不要四处分散。

### B. 模块化路由映射
不要在服务器里硬编码 `animation.html` 等路径。建议使用**路由清单**：
```javascript
const ROUTES = {
  '/animation': 'dist-animation/index.html',
  '/tuio': 'tuio/index.html',
  '/text': 'text-control/index.html'
};
```

### C. 统一的环境变量与端口管理
创建一个 `common/constants.js`，让前端和后端共享同一个端口配置，避免出现前端连接 `8080` 后端却改成 `8081` 的情况。

---

## 3. 高效构建工作流 (Modern Workflow)

### 使用 Monorepo (pnpm workspaces)
如果项目包含多个框架（如 React + Vue + 原生 JS），使用 `pnpm workspaces`。
- 优点：子模块可以独立编译，互不干扰。
- 优点：根目录可以一键运行所有模块 `pnpm run dev --parallel`。

### 自动化构建同步
在构建 EXE 前，应有一个总控脚本执行以下流程：
1.  **清理**：删除旧的 `dist` 和 `public/dist-animation`。
2.  **前端构建**：运行 Vite 编译子项目，输出到 `public/`。
3.  **后端构建**：运行 esbuild 混淆并捆绑 Node 代码。
4.  **封装**：运行 `pkg` 将整个 `public` 文件夹和后端代码塞进 EXE。

---

## 4. 为什么要这么做？ (对比优势)

| 维度 | “野蛮合并” (原有模式) | “工程化架构” (推荐模式) |
| :--- | :--- | :--- |
| **路径解析** | 充满 `../../` 且容易因执行路径不同而 404 | 统一基准路径 `public/`，逻辑极其简单 |
| **代码冲突** | 多个 HTML 共享根目录，资产容易覆盖 | 每个功能有独立文件夹锁定作用域 |
| **扩展性** | 每新增一个 HTML 都得修改 `pkg` 的 `assets` | `pkg` 仅需包含 `public/**/*`，一劳永逸 |
| **本地开发** | 必须同时开启多个命令行，配置碎片化 | 一条命令启动工作区，统一配置中心 |

---

## 5. 什么时候该重新设计？

当你发现自己需要写特殊的 **`if (filePath === '...')`** 来处理某个文件的 404 问题时，这就是架构已经“腐烂”的信号。此时建议：
1.  提取出共同的静态资源根目录。
2.  将逻辑代码与具体业务解耦。

---
*总结：一个好的架构，应该让打包工具（如 pkg）像扫描普通文件夹一样自然，而不是需要不断打补丁。*
