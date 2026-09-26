import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const useSpr = (delay: number, config: Partial<{ damping: number; mass: number; stiffness: number }> = {}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping: 14, mass: 0.9, stiffness: 120, ...config } });
};

export const useFade = (a: number, b: number) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [a, b], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
};

// granulação de filme (semente muda por quadro no vídeo)
export const Grain: React.FC<{ opacity?: number; blend?: React.CSSProperties["mixBlendMode"]; freq?: number }> = ({ opacity = 0.12, blend = "overlay", freq = 0.9 }) => {
  const frame = useCurrentFrame();
  const id = `g${frame % 12}`;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity, mixBlendMode: blend }}>
      <svg width="100%" height="100%">
        <filter id={id}>
          <feTurbulence type="fractalNoise" baseFrequency={freq} numOctaves={2} seed={frame % 12} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${id})`} />
      </svg>
    </AbsoluteFill>
  );
};

export const Vignette: React.FC<{ strength?: number; color?: string }> = ({ strength = 0.65, color = "0,0,0" }) => (
  <AbsoluteFill style={{ pointerEvents: "none", background: `radial-gradient(ellipse at 50% 45%, rgba(${color},0) 45%, rgba(${color},${strength}) 100%)` }} />
);

export const Logo: React.FC<{ width: number; top: number; left?: number; opacity?: number; mono?: boolean }> = ({ width, top, left, opacity = 1, mono }) => (
  <Img
    src={staticFile(mono ? "logos/butiquim-mono-branco-h.png" : "logos/butiquim-branco-h.png")}
    style={{ position: "absolute", width, top, left: left ?? `calc(50% - ${width / 2}px)`, opacity }}
  />
);

// recorte oficial do artista, ancorado pelo pé ou pelo topo, com fade embaixo
export const Cutout: React.FC<{
  src: string;
  ratio: number;
  height: number;
  cx: number;
  top: number;
  fadeFrom?: number;
  style?: React.CSSProperties;
  filter?: string;
}> = ({ src, ratio, height, cx, top, fadeFrom = 0.8, style, filter }) => {
  const w = height * ratio;
  const mask = `linear-gradient(180deg, #000 ${fadeFrom * 100}%, transparent 100%)`;
  return (
    <Img
      src={staticFile(src)}
      style={{
        position: "absolute",
        height,
        width: w,
        left: cx - w / 2,
        top,
        WebkitMaskImage: mask,
        maskImage: mask,
        filter,
        ...style,
      }}
    />
  );
};

export const Ticker: React.FC<{ text: string; top: number; height: number; bg: string; color: string; font: string; size: number; speed?: number; rotate?: number; weight?: number; spacing?: string }> = ({
  text, top, height, bg, color, font, size, speed = 4, rotate = 0, weight = 900, spacing = "0.04em",
}) => {
  const frame = useCurrentFrame();
  const row = Array.from({ length: 8 }, () => text).join("");
  return (
    <div style={{ position: "absolute", left: -40, right: -40, top, height, background: bg, overflow: "hidden", transform: `rotate(${rotate}deg)`, display: "flex", alignItems: "center" }}>
      <div style={{ whiteSpace: "nowrap", fontFamily: font, fontWeight: weight, fontSize: size, color, letterSpacing: spacing, transform: `translateX(${-frame * speed}px)` }}>{row}</div>
    </div>
  );
};
