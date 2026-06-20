import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppNav } from "@/components/app-nav";
import { ReportSections } from "@/components/report-sections";
import { IconArrowLeft } from "@/components/icons";

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { id } = await params;

  const profile = await prisma.profile.findUnique({ where: { id } });
  if (!profile || profile.userId !== session.uid) notFound();

  return (
    <div>
      <AppNav />

      <div style={{ maxWidth: 780, margin: "0 auto", padding: "1.5rem 1.5rem 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/dashboard" aria-label="返回" style={{ width: 38, height: 38, borderRadius: 999, border: "1.5px solid var(--line)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--ink)", background: "var(--bg-card)", textDecoration: "none" }}>
          <IconArrowLeft size={18} />
        </Link>
        <Link href="/assessment" className="btn" style={{ padding: ".5rem 1.2rem" }}>重新测评</Link>
      </div>

      <div style={{ maxWidth: 780, margin: "1.2rem auto 0", padding: "0 1.5rem" }}>
        <div style={{ borderRadius: 18, background: "linear-gradient(135deg, #26251f 0%, #6e5656 58%, #b56b6b 100%)", padding: "2.6rem 2rem", textAlign: "center" }}>
          <p className="kicker" style={{ color: "rgba(255,255,255,.75)" }}>Founder Profile · Personal Report</p>
          <h1 className="font-serif-d" style={{ fontSize: "clamp(1.9rem,5vw,2.9rem)", fontWeight: 700, color: "#fff", marginTop: ".6rem" }}>创业者画像</h1>
          <p style={{ fontSize: ".82rem", color: "rgba(255,255,255,.8)", marginTop: ".6rem" }}>生成于 {profile.createdAt.toLocaleString("zh-CN")}</p>
        </div>
      </div>

      <main style={{ maxWidth: 780, margin: "0 auto", padding: "1.8rem 1.5rem 5rem" }}>
        {(() => {
          const m = profile.contentMd.match(/^\s*关键词[:：]\s*(.+)$/m);
          const keywords = m ? m[1].split(/[、,，;；\s]+/).filter(Boolean).slice(0, 10) : [];
          const body = m ? profile.contentMd.replace(m[0], "").trim() : profile.contentMd;
          return (
            <>
              {keywords.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: ".55rem", marginBottom: "1.8rem" }}>
                  {keywords.map((k) => (
                    <span key={k} style={{ fontSize: ".88rem", fontWeight: 700, padding: ".4rem .95rem", borderRadius: 999, background: "var(--rose-soft)", color: "var(--rose-deep)" }}>
                      {k}
                    </span>
                  ))}
                </div>
              )}
              <ReportSections content={body} />
            </>
          );
        })()}
      </main>
    </div>
  );
}
