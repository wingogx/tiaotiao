# 1000天赚1000万 实盘跟踪日记

这是新的第一版站点代码，已经替换旧的静态看板结构。

当前技术栈：

- `Next.js App Router`
- `Supabase Auth + Postgres`
- `Vercel` 部署

## 当前功能

- 公开首页 / 落地页
- 文章列表与详情
- 邮箱登录
- 会员查看文章正文
- 管理员今日录入区
- 项目管理
- 收入登记
- 任务模板与当日任务清单
- 用户权限管理

## 本地开发

准备好 `.env.local` 后执行：

```bash
npm install
npm run dev
```

本地地址：`http://localhost:3000`

## 数据库

初始化 SQL：

- `supabase/migrations/20260511_init.sql`

该迁移包含：

- 项目表
- 收入记录表
- 任务模板表
- 当日任务表
- 文章表
- 用户角色表
- 每日任务自动生成函数

## 产品文档

PRD：

- `docs/PRD-1000days-1000wan-v1.md`

## 部署

线上域名：

- `https://tiaotiao.ailoveai.shop/`

Vercel 环境变量需要与本地 `.env.local` 保持一致。

## 安全提醒

由于开发阶段使用过临时敏感配置，正式上线后建议执行以下收尾：

- 重置数据库密码
- 轮换 `SUPABASE_SERVICE_ROLE_KEY`
- 删除临时 `VERCEL_TOKEN`
