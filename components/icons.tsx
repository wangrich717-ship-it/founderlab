// 纯色单色图标（line 风格，继承 currentColor）。全站用它替代 emoji。
import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 24, ...rest }: P) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...rest,
  };
}

export const IconMail = (p: P) => (
  <svg {...base(p)}>
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="M4 7l8 6 8-6" />
  </svg>
);

export const IconCompass = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M15.5 8.5l-2.2 5.3-5.3 2.2 2.2-5.3z" />
  </svg>
);

export const IconPen = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 20h4L19 9l-4-4L4 16v4z" />
    <path d="M13.5 6.5l4 4" />
  </svg>
);

export const IconLoop = (p: P) => (
  <svg {...base(p)}>
    <path d="M20 11A8 8 0 1 0 18.2 16" />
    <path d="M20 5v6h-6" />
  </svg>
);

export const IconBulb = (p: P) => (
  <svg {...base(p)}>
    <path d="M9.5 18h5" />
    <path d="M10 21h4" />
    <path d="M12 3a6 6 0 0 0-3.8 10.6c.6.5.8 1 .8 2.4h6c0-1.4.2-1.9.8-2.4A6 6 0 0 0 12 3z" />
  </svg>
);

export const IconSpark = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3l1.9 5.6L19 10.5l-5.1 1.9L12 18l-1.9-5.6L5 10.5l5.1-1.9L12 3z" />
  </svg>
);

export const IconBook = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
    <path d="M4 5.5V20.5" />
  </svg>
);

export const IconClip = (p: P) => (
  <svg {...base(p)}>
    <path d="M21 10.5l-9 9a4.5 4.5 0 0 1-6.4-6.4l9-9a3 3 0 0 1 4.3 4.3l-9 9a1.5 1.5 0 0 1-2.1-2.1l8.3-8.3" />
  </svg>
);

export const IconArrowRight = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const IconArrowLeft = (p: P) => (
  <svg {...base(p)}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
);

/** 5 档心情脸（0=最差 … 4=最好），line 风格纯色图标 */
export function MoodFace({ level, ...p }: P & { level: number }) {
  const mouths = [
    "M8.5 16c1-1.6 2.2-2.4 3.5-2.4s2.5.8 3.5 2.4", // sad
    "M8.5 15.2c1-.9 2.2-1.3 3.5-1.3s2.5.4 3.5 1.3", // slight sad
    "M8.5 15h7", // flat
    "M8.5 14.4c1 1.1 2.2 1.7 3.5 1.7s2.5-.6 3.5-1.7", // slight smile
    "M8 13.8c1 1.6 2.4 2.4 4 2.4s3-.8 4-2.4", // happy
  ];
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="9" cy="10" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="15" cy="10" r="0.6" fill="currentColor" stroke="none" />
      <path d={mouths[level] ?? mouths[2]} />
    </svg>
  );
}
