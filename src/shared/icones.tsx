import React from "react";

// ícones de traço (viewBox 24) — bebidas, música e sertanejo; usados nas identidades B
export type Icone = "chope" | "caipirinha" | "drink" | "nota" | "notas" | "chapeu" | "violao" | "garrafa";

const TRACOS: Record<Icone, string[]> = {
  chope: [
    "M5 8.5h9V19a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z",
    "M14 11h2.4a2 2 0 0 1 2 2v2.2a2 2 0 0 1-2 2H14",
    "M4.6 8.5c-.4-1.9 1.2-3.2 2.8-2.7.5-1.4 2.3-1.9 3.4-1 1.2-.8 3.3-.1 3.6 1.5.9.2 1.2 1.3.7 2.2",
    "M8 12v5.5M11 12v5.5",
  ],
  caipirinha: ["M5.5 9h13l-1.5 10.3a2 2 0 0 1-2 1.7H9a2 2 0 0 1-2-1.7z", "M14.5 3.5 12.6 14", "M13.2 9a3.2 3.2 0 0 1 5.9-1.8", "M7.5 14h9"],
  drink: ["M4 4.5h16L12 13z", "M12 13v7", "M8 20.5h8", "M15.5 2.5l-2 4.5"],
  garrafa: ["M10 2.5h4", "M10.5 2.5v4.2c0 .8-.6 1.2-1.2 1.8C8.5 9.3 8 10 8 11v8.5A1.5 1.5 0 0 0 9.5 21h5a1.5 1.5 0 0 0 1.5-1.5V11c0-1-.5-1.7-1.3-2.5-.6-.6-1.2-1-1.2-1.8V2.5", "M8 13h8v4H8"],
  nota: ["M9 18.5a2.6 2.6 0 1 1-1.8-2.5V5l10-2v4l-8.2 1.6"],
  notas: ["M8.5 18.5a2.5 2.5 0 1 1-1.8-2.4V6.5l11-2.3v11.9", "M17.7 16.1a2.5 2.5 0 1 1-1.8-2.4", "M6.7 9.5l11-2.3"],
  chapeu: ["M2.5 14.8c2.8 2.6 16.2 2.6 19 0", "M6.8 14.6c.2-4.3 1.1-7.6 2.6-7.6 1 0 1.6.9 2.6.9s1.6-.9 2.6-.9c1.5 0 2.4 3.3 2.6 7.6", "M7 12.6c3 .9 7 .9 10 0"],
  violao: ["M14.2 9.8 20 4", "M18.4 2.6l3 3", "M10.6 9.6a3 3 0 0 1 3.8 3.8 2.6 2.6 0 0 1 1.1 3.9c-1.7 2.2-5.6 2.1-8-.3s-2.5-6.3-.3-8a2.6 2.6 0 0 1 3.4.6z", "M10.2 14.1a1.5 1.5 0 1 0 0-.01"],
};

export const Ico: React.FC<{ i: Icone; size: number; color: string; stroke?: number; glow?: string; draw?: number; style?: React.CSSProperties }> = ({
  i, size, color, stroke = 1.6, glow, draw = 1, style,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block", overflow: "visible", filter: glow ? `drop-shadow(0 0 3px ${glow}) drop-shadow(0 0 10px ${glow})` : undefined, ...style }}>
    {TRACOS[i].map((d, k) => (
      <path key={k} d={d} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.max(0, Math.min(1, draw))} />
    ))}
  </svg>
);

// aleatório determinístico (mesmo resultado em todo render)
export const rnd = (seed: number) => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};
