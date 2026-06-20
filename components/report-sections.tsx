import { mdToHtml } from "@/lib/markdown";

const ACCENTS = [
  { bar: "#b56b6b", chip: "rgba(181,107,107,.14)" },
  { bar: "#3f93c4", chip: "rgba(82,159,205,.14)" },
  { bar: "#5e9c77", chip: "rgba(110,162,126,.16)" },
  { bar: "#b97a26", chip: "rgba(215,151,59,.16)" },
  { bar: "#7a5ea8", chip: "rgba(122,94,168,.14)" },
];

type Section = { title: string; body: string };

function parse(content: string): { intro: string; sections: Section[] } {
  const lines = (content || "").split("\n");
  const sections: Section[] = [];
  const intro: string[] = [];
  let cur: Section | null = null;
  for (const ln of lines) {
    const m = ln.match(/^##\s+(.+)/);
    if (m) {
      if (cur) sections.push(cur);
      cur = { title: m[1].replace(/\*\*/g, "").replace(/[#＃]/g, "").trim(), body: "" };
    } else if (cur) {
      cur.body += ln + "\n";
    } else {
      intro.push(ln);
    }
  }
  if (cur) sections.push(cur);
  return { intro: intro.join("\n").trim(), sections: sections.map((s) => ({ title: s.title, body: s.body.trim() })) };
}

export function ReportSections({ content }: { content: string }) {
  const { intro, sections } = parse(content);

  // 无明显分节则回退到普通渲染
  if (sections.length === 0) {
    return <div className="prose-report card" style={{ padding: "1.6rem 1.7rem" }} dangerouslySetInnerHTML={{ __html: mdToHtml(content) }} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {intro && (
        <p className="font-serif-d" style={{ fontSize: "1.15rem", fontStyle: "italic", color: "var(--ink2)", lineHeight: 1.8, padding: "0 .2rem" }}>
          {intro}
        </p>
      )}
      {sections.map((s, i) => {
        const a = ACCENTS[i % ACCENTS.length];
        return (
          <article key={i} className="card" style={{ padding: 0, overflow: "hidden", display: "flex" }}>
            <div style={{ width: 5, background: a.bar, flexShrink: 0 }} />
            <div style={{ padding: "1.4rem 1.6rem", flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: ".7rem", marginBottom: ".8rem" }}>
                <span style={{ fontFamily: "var(--fd)", fontWeight: 700, fontSize: ".95rem", color: a.bar, background: a.chip, width: 30, height: 30, borderRadius: 9, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="font-serif-d" style={{ fontSize: "1.4rem", fontWeight: 700, margin: 0 }}>{s.title}</h2>
              </div>
              <div className="prose-report" style={{ paddingLeft: "2.7rem" }} dangerouslySetInnerHTML={{ __html: mdToHtml(s.body) }} />
            </div>
          </article>
        );
      })}
    </div>
  );
}
