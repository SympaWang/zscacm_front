# ZSCACM 前端

电子科技大学中山学院 ACM 集训队平台前端(从服务器 dist 反推还原,可继续开发)。

## 技术栈

- Vue 3 + Vite 5 + Element Plus + Vuex + Vue Router 4 + ECharts + Axios

## 快速开始

```bash
# 安装依赖(首次)
npm install

# 本地开发(http://localhost:5173,已配置 /api 代理到后端 175.178.237.61:8848)
npm run dev

# 生产构建(产物在 dist/)
npm run build

# 预览构建产物
npm run preview
```

## 目录结构

```
src/
├── main.js              # 入口(Element Plus / 全局样式 / router / store)
├── App.vue              # 布局(顶部导航 / 内容区 / 页脚)
├── assets/global.css    # 全局样式规范(配色 / 卡片 / 间距)
├── api/
│   ├── request.js       # axios 封装(开发走 /api 代理,生产直连后端)
│   └── index.js         # 全部后端接口
├── router/index.js      # 17 个路由
├── store/index.js       # Vuex(登录态 / 帖子传参)
├── components/          # MyChart(Rating曲线) / Reply(两级评论)
├── views/               # 页面组件
└── utils/rankStyle.js   # CF rating 颜色映射
public/static/           # 静态资源(logo / 历史图片)
```

## 接口说明

- 开发环境:axios 请求 `/api/xxx`,由 `vite.config.js` 代理到 `http://175.178.237.61:8848` 并去掉 `/api` 前缀;
- 生产构建:`src/api/request.js` 中 `import.meta.env.DEV ? '/api' : 'http://175.178.237.61:8848/'`,即生产直接请求完整后端地址(与原版 dist 行为一致)。

## 部署

```bash
npm run build
# 将 dist/ 内容(assets / static / index.html)拷贝到 nginx 站点根目录
# nginx 需配置 history 路由 fallback:
#   location / { try_files $uri $uri/ /index.html; }
```

## 还原说明与已知限制

本项目由服务器原版 dist(无 sourcemap)反推还原:

- 已还原:登录 / 忘记密码 / 首页(比赛+排行+Rating曲线) / 题目检索 / 做题统计(CF/洛谷/VJ) / Rating(用户/比赛) / 论坛(发帖/列表/详情/两级评论) / 消息 / 个人中心 / 修改密码 / 关于 / 帖子管理 / 用户管理(简化版) / 考勤(功能已停用) / 平台信息;
- 与原版差异:论坛发帖编辑器简化为 textarea;用户管理为简化版;考勤功能后端已停用;
- 静态资源路径使用根路径绝对路径(如 `/static/acmdq.jpg`),适配 history 路由子路径。
