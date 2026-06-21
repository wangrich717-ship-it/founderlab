"use client";

import { useEffect, useState } from "react";

type Item = { id: string; label: string; count: number };

export function MethodNav({ items }: { items: Item[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const vis = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: "-15% 0px -75% 0px", threshold: 0 }
    );
    items.forEach((it) => {
      const el = document.getElementById(it.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [items]);

  function go(e: React.MouseEvent, id: string) {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActive(id);
  }

  return (
    <nav className="tb-nav">
      <style>{`
        .tb-wrap { display: flex; gap: 2rem; align-items: flex-start; }
        .tb-nav { position: sticky; top: 1.4rem; align-self: flex-start; width: 148px; flex-shrink: 0; }
        .tb-nav-title { font-size: .64rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: var(--muted); padding: 0 .6rem .5rem; }
        .tb-nav ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: .12rem; }
        .tb-nav a { display: flex; justify-content: space-between; align-items: center; gap: .4rem; padding: .42rem .6rem; border-radius: 8px; text-decoration: none; font-size: .86rem; font-weight: 700; color: var(--ink2); border-left: 2px solid transparent; transition: background .15s; }
        .tb-nav a:hover { background: var(--bg-card); }
        .tb-nav a.on { color: var(--rose-deep); background: var(--rose-soft); border-left-color: var(--rose); }
        .tb-nav a .ct { font-size: .7rem; color: var(--muted); font-weight: 700; }
        @media (max-width: 820px) {
          .tb-wrap { display: block; }
          .tb-nav { position: sticky; top: 0; width: auto; z-index: 5; background: var(--bg); margin: 0 -1.5rem 1rem; padding: .5rem 0; border-bottom: 1px solid var(--line); }
          .tb-nav-title { display: none; }
          .tb-nav ul { flex-direction: row; overflow-x: auto; gap: .3rem; padding: 0 1.5rem; }
          .tb-nav a { white-space: nowrap; border-left: none; border-bottom: 2px solid transparent; padding: .35rem .7rem; }
          .tb-nav a.on { border-left: none; border-bottom-color: var(--rose); }
          .tb-nav a .ct { display: none; }
        }
      `}</style>
      <p className="tb-nav-title">目录</p>
      <ul>
        {items.map((it) => (
          <li key={it.id}>
            <a href={`#${it.id}`} className={active === it.id ? "on" : ""} onClick={(e) => go(e, it.id)}>
              <span>{it.label}</span>
              <span className="ct">{it.count}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
