# 创业者手札 · Founder Lab

懂你的创业反思工具。MVP 实现了：**邮箱注册登录 + 创业者测评（固定 18 题 → AI 画像报告）+ 方法库**，并为记录 / 复盘 / 洞察 / 灵感预留了数据结构。

完整产品规划见上级目录的 `PRD-创业者工具-v1.md`。

## 技术栈

- **Next.js 16**（App Router，Turbopack 默认）+ React 19 + TypeScript
- **Prisma 6 + SQLite**（本地开发；上线切 Postgres 只需改 `prisma/schema.prisma` 的 datasource 与 `.env`）
- 自建邮箱密码认证：bcrypt 哈希 + JWT（jose）存 httpOnly cookie
- AI：服务端调用 DeepSeek（OpenAI 兼容接口），密钥仅在后端

> 注意：本仓库的 Next 16 中 `cookies()` / `headers()` / 路由与页面的 `params`、`searchParams` 均为**异步**（Promise），需 `await`。

## 一键启动（推荐）

- **双击 `start.bat`** —— 首次会自动装依赖、建库、灌种子，之后直接启动并打开浏览器。
- 或在终端运行 `./start.ps1`（PowerShell）。

脚本是幂等的：已装好就跳过安装/建库，秒级拉起服务。

## 手动运行

```bash
npm install
npx prisma generate
npx prisma db push      # 创建本地 SQLite 表
npm run seed            # 灌入 18 题 / 10 条灵感小问 / 3 张方法卡 / 5 套 AI 提示词
npm run dev             # http://localhost:3000
```

## 启用 AI（可选）

在 `.env` 填入：

```
DEEPSEEK_API_KEY="sk-..."
```

不填也能跑通全流程——测评回答会正常保存，画像报告显示「报告待生成」占位；填入后重新测评即生成完整报告。

## 目录速览

- `app/` 页面与 API 路由（`api/auth/*`、`api/assessment/submit`）
- `lib/` `prisma.ts`（客户端单例）、`auth.ts`（会话）、`ai.ts`（AI 调用 + 日志）、`prompts-default.ts`（内置提示词）、`markdown.ts`
- `prisma/schema.prisma` 数据模型 · `prisma/seed.ts` 种子数据
- `components/` 复用 UI

## 已完成 / 待办

- [x] 账号体系（注册 / 登录 / 登出 / 邮箱验证打桩）
- [x] 测评闭环（答题 → AI 画像 → 入库 → 历史）
- [x] 方法库浏览
- [x] 记录（速记 + 类型，含「复盘」类型 + 模板；复盘已并入记录）
- [x] 目标（方向/北极星/关键赌注，洞察对照它盘点）
- [x] 洞察（整体盘点：记录+目标+灵感+练习+画像；**增量投喂**——每次只喂上次盘点后的新内容 + 上一次盘点）
- [x] 灵感（今日小问 / 随手记 → AI 灵感卡 → 生命周期 → 连点成线）
- [x] 邮箱注册改为验证码 + 验证码改密码（/reset）
- [x] 后台管理 `/admin`：AI 配置、提示词管理、用户管理（角色/删除）、用户 AI 历史（画像 查看/编辑/删除/重新生成）
      - 进入后台：`npm run make-admin <邮箱>` 把账号设为管理员，登录后访问 `/admin`
- [x] 工具箱 30 张方法卡，每张配「练习 + AI 反馈」（/methods/[id]，记录在 MethodExercise）
- [x] 后台方法卡管理（/admin/methods，含练习字段的增删改）
- [ ] 后台补充：题库 / 灵感小问 的增删改
- [ ] 真实邮件服务、限频与成本上限、上线切 Postgres
