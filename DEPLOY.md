# 部署到 Vercel + Neon（免费）

本项目是**一个 Next.js 全栈应用**（前端 + 后端 API 在一起），部署成一个服务即可。

数据库已从 SQLite 改为 **Postgres**，AI 配置已搬进数据库，可直接上 Vercel。

---

## 一、建数据库（Neon，免费）

1. 打开 https://neon.tech ，用 GitHub 登录，新建一个 Project（区域选离你近的，如 Singapore）。
2. 进入 **Connection string**，复制**带 `-pooler` 的「Pooled connection」**那一条（serverless 用连接池更稳），形如：
   `postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require`

## 二、初始化数据库（部署时自动完成，无需本地操作）

国内网络通常连不上 Neon 的 5432 端口，所以**不在本地建表**。已配好 `vercel-build` 脚本：
Vercel 部署时会自动 `prisma db push`（建表）+ seed（灌入题库/方法卡/灵感/提示词），
这些跑在 Vercel 的海外网络里，能正常连到 Neon。你本地什么都不用跑。

## 三、推到 GitHub

```bash
git add -A && git commit -m "ready for deploy" && git push
```

## 四、Vercel 部署

1. 打开 https://vercel.com ，用 GitHub 登录 → **Add New → Project** → 选你的 `founderlab` 仓库。
2. **Root Directory** 选到 `founder-app`（如果仓库根目录不是它）。Framework 会自动识别为 Next.js。
3. 展开 **Environment Variables**，逐项填入（参照 `.env.example`）：

   | 变量 | 值 |
   |---|---|
   | `DATABASE_URL` | Neon **带 `-pooler`** 的连接串（运行时连接池） |
   | `DIRECT_URL` | Neon **不带 `-pooler`** 的连接串（迁移用） |
   | `JWT_SECRET` | 一段长随机串（`openssl rand -hex 32`） |
   | `DEEPSEEK_API_KEY` | 你的 DeepSeek key |
   | `DEEPSEEK_BASE_URL` | `https://api.deepseek.com/v1` |
   | `AI_DEFAULT_MODEL` | `deepseek-chat` |
   | `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` | 你的 163 配置 |
   | `APP_URL` | 先随便填，部署后改成真实域名 |

4. 点 **Deploy**。首次构建会自动跑 `prisma generate`（已配 postinstall）。

## 五、收尾

1. 部署成功后拿到域名（如 `https://founderlab.vercel.app`），把 `APP_URL` 改成它，**Redeploy** 一次。
2. 打开域名**注册一个账号**。
3. 把自己设为管理员：去 Neon 控制台的 **SQL Editor**（浏览器里，走 HTTPS，不受 5432 限制），执行：
   `UPDATE "User" SET role='admin', "emailVerified"=true WHERE email='你注册的邮箱';`
   然后访问 `/admin`。

---

## 注意事项

- **函数时长**：AI 出报告要十几秒，已给相关接口设 `maxDuration = 60`（Vercel Hobby 上限 60 秒）。
- **163 发信**：云服务器 IP 发 163 邮件可能被限流/拦截。线上若收不到验证码，改用 **Resend**（免费额度，注册后把 SMTP 换成它的，或用其 API）。
- **冷启动**：免费版闲置后首次访问会慢几秒，属正常。
- AI 配置也可登录后在 `/admin/ai` 在线改（存数据库，立即生效）。
