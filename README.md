# ant-codex

基于 `React + Vite + TypeScript + Ant Design` 的后台静态原型工程，用于还原“白名单管理”页面，并验证 GitHub Pages 预览链路。

## 本地运行

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
npm run preview
```

## 部署

仓库内已包含 GitHub Pages 工作流：

- 推送到 `main` 或 `master` 会触发 Actions 构建
- `vite.config.ts` 已配置 `base: /ant-codex/`
- 产物目录为 `dist`

## 当前页面

- 顶部深色导航栏
- 左侧风控菜单
- 白名单管理页标题与说明
- `账号 / 设备 / IP` 页签
- 查询筛选区
- 账号白名单表格
- 新增白名单 / 批量导入操作区
