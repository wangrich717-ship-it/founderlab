import nodemailer from "nodemailer";

// 发信优先级：Brevo HTTP API（云端友好）> SMTP（本地/备用）> 控制台打印。
const BREVO_KEY = process.env.BREVO_API_KEY;
const MAIL_FROM = process.env.MAIL_FROM || process.env.SMTP_FROM || process.env.SMTP_USER || "";
const MAIL_FROM_NAME = process.env.MAIL_FROM_NAME || "创业者手札";

// SMTP 备用配置
const HOST = process.env.SMTP_HOST;
const PORT = Number(process.env.SMTP_PORT || 465);
const USER = process.env.SMTP_USER;
const PASS = process.env.SMTP_PASS;

function buildHtml(title: string, code: string) {
  return `
    <div style="font-family:-apple-system,system-ui,sans-serif;max-width:460px;margin:0 auto;padding:24px;color:#20201d">
      <h2 style="font-weight:700;margin:0 0 8px">${title}</h2>
      <p style="color:#6b675f;line-height:1.7;margin:0 0 20px">请在页面上输入以下验证码完成操作：</p>
      <div style="font-size:34px;font-weight:800;letter-spacing:10px;background:#f5f3ef;border-radius:12px;padding:18px 0;text-align:center;color:#20201d">${code}</div>
      <p style="color:#a8a49b;font-size:13px;line-height:1.7;margin:18px 0 0">验证码 10 分钟内有效。如果不是你本人操作，请忽略本邮件。</p>
    </div>`;
}

async function sendViaBrevo(to: string, subject: string, html: string) {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": BREVO_KEY as string, "Content-Type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      sender: { name: MAIL_FROM_NAME, email: MAIL_FROM },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Brevo 发送失败 HTTP ${res.status}: ${t}`);
  }
}

async function sendViaSmtp(to: string, subject: string, html: string) {
  const t = nodemailer.createTransport({
    host: HOST,
    port: PORT,
    secure: PORT === 465,
    auth: { user: USER, pass: PASS },
  });
  await t.sendMail({ from: `${MAIL_FROM_NAME} <${MAIL_FROM}>`, to, subject, html });
}

/** 发送验证码邮件。 */
export async function sendCodeEmail(to: string, code: string, purpose: "verify" | "reset") {
  const title = purpose === "reset" ? "重置密码验证码" : "邮箱验证码";
  const subject = `【创业者手札】${title}：${code}`;
  const html = buildHtml(title, code);

  if (BREVO_KEY && MAIL_FROM) {
    await sendViaBrevo(to, subject, html);
    return { sent: true };
  }
  if (HOST && USER && PASS) {
    await sendViaSmtp(to, subject, html);
    return { sent: true };
  }
  console.log(`\n[未配置邮件] 给 ${to} 的${title}：${code}（10 分钟内有效）\n`);
  return { sent: false };
}
