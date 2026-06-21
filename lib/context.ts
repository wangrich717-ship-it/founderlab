import { prisma } from "./prisma";
import { recordTypeLabel } from "./labels";

const TZ = "Asia/Shanghai";

/** 统一把时间格式化为北京时间（含星期与时分），供 AI 做时间相关分析。 */
export function fmtTime(d: Date) {
  // 例：2026/06/21 周六 14:30
  return d.toLocaleString("zh-CN", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/** 仅日期（北京时间）。 */
export function fmtDate(d: Date) {
  return d.toLocaleDateString("zh-CN", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
}

/** 当前时间区块，作为所有时间敏感的 AI 调用的锚点。 */
export function nowBlock() {
  return `【当前时间】${fmtTime(new Date())}（北京时间）\n请在分析时结合各条内容的发生时间，关注近况、频率、节奏与变化趋势。\n\n`;
}

/** 取用户最新的创业者画像（作为所有 AI 调用的上下文底座）。 */
export async function latestProfile(userId: string) {
  return prisma.profile.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

type UserInfo = { nickname?: string | null; gender?: string | null; age?: number | null; background?: string | null };

/** 用户的基础背景信息，作为所有 AI 调用的上下文。 */
export function userInfoBlock(user?: UserInfo | null) {
  if (!user) return "";
  const lines: string[] = [];
  if (user.nickname) lines.push(`昵称：${user.nickname}`);
  if (user.gender) lines.push(`性别：${user.gender}`);
  if (user.age != null) lines.push(`年龄：${user.age}`);
  if (user.background) lines.push(`经历/背景：${user.background}`);
  return lines.length ? `【关于这个人（背景）】\n${lines.join("\n")}\n\n` : "";
}

export function profileBlock(contentMd?: string | null) {
  if (!contentMd) return "";
  // 控制长度，避免超 token
  const trimmed = contentMd.length > 3000 ? contentMd.slice(0, 3000) + "…" : contentMd;
  return `【这位创业者的画像（供你参考，不要照抄）】\n${trimmed}\n\n`;
}

type RecordLike = {
  type: string;
  content: string;
  mood?: string | null;
  createdAt: Date;
};

export function recordsBlock(records: RecordLike[]) {
  if (!records.length) return "（这段时间没有记录）\n";
  return records
    .map((r) => {
      const t = fmtTime(r.createdAt);
      const mood = r.mood ? ` 心情${r.mood}` : "";
      return `· [${t}·${recordTypeLabel(r.type)}]${mood} ${r.content}`;
    })
    .join("\n");
}
