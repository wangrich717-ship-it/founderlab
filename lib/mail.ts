import nodemailer from "nodemailer";

const HOST = process.env.SMTP_HOST;
const PORT = Number(process.env.SMTP_PORT || 465);
const USER = process.env.SMTP_USER;
const PASS = process.env.SMTP_PASS;
const FROM = process.env.SMTP_FROM || USER;

function transport() {
  if (!HOST || !USER || !PASS) return null;
  return nodemailer.createTransport({
    host: HOST,
    port: PORT,
    secure: PORT === 465,
    auth: { user: USER, pass: PASS },
  });
}

/** 发送验证码邮件。未配置 SMTP 时把验证码打印到控制台（开发可用）。 */
export async function sendCodeEmail(to: string, code: string, purpose: "verify" | "reset") {
  const title = purpose === "reset" ? "重置密码验证码" : "邮箱验证码";
  const t = transport();
  if (!t) {
    console.log(`\n[未配置 SMTP] 给 ${to} 的${title}：${code}（10 分钟内有效）\n`);
    return { sent: false };
  }
  await t.sendMail({
    from: `创业者手札 <${FROM}>`,
    to,
    subject: `【创业者手札】${title}：${code}`,
    html: `
      <div style="font-family:-apple-system,system-ui,sans-serif;max-width:460px;margin:0 auto;padding:24px;color:#20201d">
        <h2 style="font-weight:700;margin:0 0 8px">${title}</h2>
        <p style="color:#6b675f;line-height:1.7;margin:0 0 20px">请在页面上输入以下验证码完成操作：</p>
        <div style="font-size:34px;font-weight:800;letter-spacing:10px;background:#f5f3ef;border-radius:12px;padding:18px 0;text-align:center;color:#20201d">${code}</div>
        <p style="color:#a8a49b;font-size:13px;line-height:1.7;margin:18px 0 0">验证码 10 分钟内有效。如果不是你本人操作，请忽略本邮件。</p>
      </div>`,
  });
  return { sent: true };
}
