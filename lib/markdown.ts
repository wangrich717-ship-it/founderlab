// 轻量 Markdown → HTML（仅用于渲染我们自己 AI 生成的报告/洞察）。
// 支持 ## / ### 标题、有序/无序列表、**粗体** *斜体* 与段落。

export function mdToHtml(txt: string): string {
  const lines = (txt || "").split("\n");
  let h = "";
  let inUL = false;
  let inOL = false;

  const closeLists = () => {
    if (inUL) {
      h += "</ul>";
      inUL = false;
    }
    if (inOL) {
      h += "</ol>";
      inOL = false;
    }
  };

  const fmt = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>");

  for (const ln of lines) {
    if (/^##\s+(.+)/.test(ln)) {
      closeLists();
      h += `<h2>${fmt(ln.replace(/^##\s+/, ""))}</h2>`;
    } else if (/^###\s+(.+)/.test(ln)) {
      closeLists();
      h += `<h3>${fmt(ln.replace(/^###\s+/, ""))}</h3>`;
    } else if (/^[-•*]\s+(.+)/.test(ln)) {
      if (inOL) {
        h += "</ol>";
        inOL = false;
      }
      if (!inUL) {
        h += "<ul>";
        inUL = true;
      }
      h += `<li>${fmt(ln.replace(/^[-•*]\s+/, ""))}</li>`;
    } else if (/^\d+[.)]\s+(.+)/.test(ln)) {
      if (inUL) {
        h += "</ul>";
        inUL = false;
      }
      if (!inOL) {
        h += "<ol>";
        inOL = true;
      }
      h += `<li>${fmt(ln.replace(/^\d+[.)]\s+/, ""))}</li>`;
    } else if (ln.trim() === "") {
      closeLists();
    } else {
      closeLists();
      h += `<p>${fmt(ln)}</p>`;
    }
  }
  closeLists();
  return h;
}
