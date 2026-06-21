import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recordTypeLabel } from "@/lib/labels";
import { ModuleShell } from "@/components/module-shell";
import { RecordFilter } from "@/components/record-filter";
import { DeleteButton } from "@/components/delete-button";
import { MoodFace, IconClip } from "@/components/icons";

const WD = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
function period(h: number) {
  if (h < 5) return "夜里";
  if (h < 8) return "清晨";
  if (h < 11) return "上午";
  if (h < 13) return "中午";
  if (h < 17) return "下午";
  if (h < 19) return "傍晚";
  return "晚上";
}
const TYPE_BG: Record<string, string> = {
  note: "linear-gradient(180deg,#e9f1fb,#f8fbff)",
  decision: "linear-gradient(180deg,#fbecd4,#fffbf2)",
  pitfall: "linear-gradient(180deg,#f8e1e1,#fdf6f6)",
  comm: "linear-gradient(180deg,#deefe3,#f5fbf7)",
  review: "linear-gradient(180deg,#ebe5f6,#faf7ff)",
};

function parseKeywords(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const k = JSON.parse(raw) as { emotions?: string[]; people?: string[]; topics?: string[] };
    return [...(k.emotions || []), ...(k.people || []), ...(k.topics || [])].filter(Boolean).slice(0, 10);
  } catch {
    return [];
  }
}

export default async function RecordsHistoryPage({ searchParams }: { searchParams: Promise<{ type?: string; date?: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const sp = await searchParams;
  const type = sp.type || "";
  const date = sp.date && /^\d{4}-\d{2}-\d{2}$/.test(sp.date) ? sp.date : "";

  const where: { userId: string; type?: string; createdAt?: { gte: Date; lt: Date } } = { userId: session.uid };
  if (type) where.type = type;
  if (date) {
    const start = new Date(`${date}T00:00:00`);
    where.createdAt = { gte: start, lt: new Date(start.getTime() + 86400000) };
  }

  const records = await prisma.record.findMany({ where, orderBy: { createdAt: "desc" }, take: 300 });

  return (
    <ModuleShell
      no="02"
      en="Records · History"
      title="历史记录"
      desc="你写过的所有手账。按分类或日期筛选。"
      back="/records"
      action={<Link href="/records" className="btn btn-pri">+ 写记录</Link>}
    >
      <RecordFilter type={type} date={date} />

      {records.length === 0 ? (
        <div className="card" style={{ padding: "2rem", textAlign: "center", color: "var(--ink2)" }}>
          {type || date ? "这个筛选下还没有记录。" : <>还没有记录。<Link href="/records" style={{ color: "var(--rose-deep)", fontWeight: 800 }}>写第一条 →</Link></>}
        </div>
      ) : (
        <div>
          {records.map((r, i) => {
            const d = r.createdAt;
            const next = records[i + 1];
            const gapDays = next ? Math.floor((d.getTime() - next.createdAt.getTime()) / 86400000) : 0;
            const kws = parseKeywords(r.keywords);
            return (
              <div key={r.id} style={{ display: "flex" }}>
                {/* 时间线轨道 */}
                <div style={{ width: 16, position: "relative", flexShrink: 0 }}>
                  <div style={{ position: "absolute", left: 6, top: 4, bottom: 0, width: 2, background: "var(--line)" }} />
                  <div style={{ position: "absolute", left: 2, top: 6, width: 10, height: 10, borderRadius: 999, background: "var(--rose)", border: "2px solid var(--bg)" }} />
                </div>

                <div style={{ flex: 1, minWidth: 0, paddingBottom: "1.4rem", paddingLeft: ".6rem" }}>
                  {/* 日期头 */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: ".5rem", gap: "1rem" }}>
                    <span className="font-serif-d" style={{ fontSize: "1.4rem", fontWeight: 700 }}>{d.getMonth() + 1}/{d.getDate()}</span>
                    <span style={{ fontSize: ".78rem", color: "var(--muted)" }}>
                      {WD[d.getDay()]} {String(d.getHours()).padStart(2, "0")}:{String(d.getMinutes()).padStart(2, "0")} {period(d.getHours())}
                    </span>
                  </div>

                  {/* 卡片 */}
                  <div style={{ borderRadius: 14, background: TYPE_BG[r.type] || TYPE_BG.note, boxShadow: "0 4px 16px rgba(32,32,29,.06)", padding: "1.1rem 1.3rem", position: "relative" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: ".8rem" }}>
                      <p style={{ fontSize: "1rem", lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word", flex: 1 }}>
                        {r.mood !== null && r.mood !== "" && !isNaN(Number(r.mood)) && (
                          <span style={{ display: "inline-flex", verticalAlign: "-5px", marginRight: ".4rem", color: "var(--rose)" }}>
                            <MoodFace level={Number(r.mood)} size={20} />
                          </span>
                        )}
                        {r.content}
                      </p>
                      <DeleteButton url={`/api/records/${r.id}`} />
                    </div>

                    {/* AI 关键词 */}
                    {kws.length > 0 && (
                      <div style={{ marginTop: ".8rem", display: "flex", flexWrap: "wrap", gap: ".4rem" }}>
                        {kws.map((k, j) => (
                          <span key={j} style={{ fontSize: ".72rem", fontWeight: 700, color: "var(--ink2)", background: "rgba(255,255,255,.65)", border: "1px solid var(--line)", borderRadius: 999, padding: ".12rem .55rem" }}>
                            {k}
                          </span>
                        ))}
                      </div>
                    )}

                    <div style={{ marginTop: ".9rem", display: "flex", alignItems: "center", gap: ".4rem", color: "var(--ink2)", opacity: 0.7 }}>
                      <IconClip size={14} />
                      <span style={{ fontSize: ".74rem", fontWeight: 700 }}>{recordTypeLabel(r.type)}</span>
                      {!r.aiProcessed && <span style={{ fontSize: ".68rem", color: "var(--muted)" }}>· AI 待处理</span>}
                    </div>
                  </div>

                  {gapDays >= 1 && (
                    <div style={{ marginTop: "1rem" }}>
                      <span style={{ fontSize: ".72rem", fontWeight: 700, color: "var(--muted)", border: "1px solid var(--line)", borderRadius: 999, padding: ".15rem .6rem", background: "var(--bg-card)" }}>
                        {gapDays} 天
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ModuleShell>
  );
}
