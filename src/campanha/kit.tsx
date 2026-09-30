import React, { createContext, useContext } from "react";
import { AbsoluteFill, Easing, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame } from "remotion";
import { loadFont as anton } from "@remotion/google-fonts/Anton";
import { loadFont as outfit } from "@remotion/google-fonts/Outfit";
import { loadFont as rockSalt } from "@remotion/google-fonts/RockSalt";
import { loadFont as courier } from "@remotion/google-fonts/CourierPrime";
import { loadFont as caveat } from "@remotion/google-fonts/Caveat";
import { Grain, clamp, useSpr } from "../shared/fx";
import { Ico, rnd } from "../shared/icones";

// Campanha "A CASA TE DEVE" — a caderneta de fiado ao contrário.
// Identidade própria (não usa as IDs das noites): noite preta + papel de caderneta,
// caneta azul, carimbo magenta, lima da marca nos títulos.

const latin: ("latin" | "latin-ext")[] = ["latin", "latin-ext"];
export const F = {
  display: anton("normal", { weights: ["400"], subsets: latin }).fontFamily,
  texto: outfit("normal", { weights: ["300", "400", "500", "600", "700", "800"], subsets: latin }).fontFamily,
  mao: rockSalt("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily,
  comanda: courier("normal", { weights: ["400", "700"], subsets: latin }).fontFamily,
  caneta: caveat("normal", { weights: ["500", "600", "700"], subsets: latin }).fontFamily,
};

export const C = {
  noite: "#0B0B0D",
  carvao: "#161619",
  papel: "#F2ECDB",
  papelEsc: "#E4DBC3",
  pauta: "rgba(88,128,184,0.42)",
  margem: "#D8493B",
  caneta: "#1C3C8C",
  lima: "#C8D200",
  rosa: "#E91E8C",
  branco: "#F5F5F0",
  cinza: "#A5A5AD",
  recibo: "#FBFAF5",
  capa: "#141612",
};

// ---------- animação: nas peças estáticas tudo aparece no estado final ----------
export const Parado = createContext(false);
export const useP = (a: number, b: number, ease: (t: number) => number = Easing.out(Easing.cubic)) => {
  const parado = useContext(Parado);
  const f = useCurrentFrame();
  const v = interpolate(f, [a, b], [0, 1], { ...clamp, easing: ease });
  return parado ? 1 : v;
};
export const useS = (delay: number, cfg: Partial<{ damping: number; mass: number; stiffness: number }> = {}) => {
  const parado = useContext(Parado);
  const s = useSpr(delay, cfg);
  return parado ? 1 : s;
};
export const useFrame = () => {
  const parado = useContext(Parado);
  const f = useCurrentFrame();
  return parado ? 9999 : f;
};

// ---------- fundo ----------
export const Fundo: React.FC<{ video?: string; videoOpacity?: number; from?: number; brilho?: boolean }> = ({ video, videoOpacity = 0.42, from = 0, brilho = true }) => (
  <AbsoluteFill style={{ background: C.noite }}>
    {video && (
      <OffthreadVideo
        src={staticFile(video)}
        muted
        startFrom={from}
        style={{ width: "100%", height: "100%", objectFit: "cover", opacity: videoOpacity, filter: "grayscale(.3) brightness(.7) contrast(1.15)" }}
      />
    )}
    {video && <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(11,11,13,.55) 0%, rgba(11,11,13,.15) 40%, rgba(11,11,13,.85) 100%)" }} />}
    {brilho && <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 108%, rgba(200,210,0,.16), transparent 58%)" }} />}
    <Grain opacity={0.09} />
  </AbsoluteFill>
);

// ---------- papel de caderneta (com espiral no alto) ----------
export const Papel: React.FC<{
  w: number;
  h: number;
  rot?: number;
  espiral?: boolean;
  pauta?: number;
  topo?: number;
  margem?: number | false;
  cor?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ w, h, rot = 0, espiral = true, pauta = 58, topo = 110, margem = 96, cor = C.papel, style, children }) => {
  const furos = Math.max(4, Math.floor((w - 60) / 46));
  return (
    <div style={{ position: "relative", width: w, height: h, transform: `rotate(${rot}deg)`, flex: "0 0 auto", ...style }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: cor,
          borderRadius: 8,
          boxShadow: "0 40px 70px rgba(0,0,0,.55), 0 6px 14px rgba(0,0,0,.35)",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", left: 0, right: 0, top: topo, bottom: 0, backgroundImage: `repeating-linear-gradient(180deg, transparent 0 ${pauta - 2}px, ${C.pauta} ${pauta - 2}px ${pauta}px)` }} />
        {margem !== false && <div style={{ position: "absolute", left: margem, top: 0, bottom: 0, width: 3, background: C.margem, opacity: 0.75 }} />}
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 30% 20%, rgba(255,255,255,.35), transparent 60%), radial-gradient(ellipse at 90% 100%, rgba(120,90,40,.16), transparent 55%)" }} />
        <Grain opacity={0.16} blend="multiply" freq={0.75} />
        {espiral &&
          Array.from({ length: furos }, (_, i) => (
            <div key={i} style={{ position: "absolute", top: 26, left: 40 + i * ((w - 80) / (furos - 1)) - 9, width: 18, height: 18, borderRadius: 9, background: "#1b1b1e", boxShadow: "inset 0 2px 3px rgba(0,0,0,.8)" }} />
          ))}
      </div>
      {espiral &&
        Array.from({ length: furos }, (_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: -22,
              left: 40 + i * ((w - 80) / (furos - 1)) - 6,
              width: 12,
              height: 60,
              borderRadius: 8,
              border: "4px solid #9c9ca6",
              borderBottomColor: "transparent",
              background: "transparent",
              boxShadow: "0 2px 3px rgba(0,0,0,.4)",
            }}
          />
        ))}
      <div style={{ position: "absolute", inset: 0 }}>{children}</div>
    </div>
  );
};

// ---------- escrita à mão, aparecendo da esquerda para a direita ----------
export const Escrita: React.FC<{
  children: React.ReactNode;
  start: number;
  dur?: number;
  font?: string;
  size: number;
  color?: string;
  weight?: number;
  style?: React.CSSProperties;
}> = ({ children, start, dur = 18, font = F.caneta, size, color = C.caneta, weight = 700, style }) => {
  const p = useP(start, start + dur, Easing.inOut(Easing.quad));
  return (
    <div
      style={{
        fontFamily: font,
        fontSize: size,
        fontWeight: weight,
        color,
        lineHeight: 1.05,
        whiteSpace: "nowrap",
        clipPath: `inset(-20% ${(1 - p) * 100}% -20% -2%)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ---------- risco de caneta por cima de um texto ----------
export const Risco: React.FC<{ start: number; dur?: number; color?: string; width?: number; top?: string; seed?: number }> = ({
  start,
  dur = 10,
  color = C.rosa,
  width = 9,
  top = "52%",
  seed = 1,
}) => {
  const p = useP(start, start + dur, Easing.out(Easing.quad));
  const y1 = 8 + rnd(seed) * 6;
  const y2 = 12 - rnd(seed + 1) * 6;
  return (
    <svg viewBox="0 0 100 20" preserveAspectRatio="none" style={{ position: "absolute", left: "-4%", width: "108%", top, height: 40, marginTop: -20, overflow: "visible", pointerEvents: "none" }}>
      <path
        d={`M0 ${y1} C 30 ${y1 + 4}, 60 ${y2 - 4}, 100 ${y2}`}
        stroke={color}
        strokeWidth={width / 4}
        fill="none"
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - p}
        vectorEffect="non-scaling-stroke"
        style={{ strokeWidth: width }}
      />
    </svg>
  );
};

// ---------- carimbo (entra "batendo" no papel) ----------
export const Carimbo: React.FC<{
  linhas: string[];
  cor?: string;
  size?: number;
  rot?: number;
  start?: number;
  redondo?: boolean;
  seed?: number;
  style?: React.CSSProperties;
}> = ({ linhas, cor = C.rosa, size = 260, rot = -12, start = 0, redondo = false, seed = 3, style }) => {
  const s = useS(start, { damping: 11, stiffness: 220, mass: 0.7 });
  const f = useFrame();
  const vis = f >= start ? 1 : 0;
  const escala = interpolate(s, [0, 1], [1.9, 1]);
  const fs = redondo ? size * 0.17 : size * 0.2;
  // tinta gasta: máscara de ruído que abre falhas no carimbo (sem pintar nada fora dele)
  const ruido = `url("data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='360' height='360'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' seed='${seed}'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -5.2 0 0 0 3.75'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`,
  ).replace(/%2523/g, "%23")}")`;
  return (
    <div
      style={{
        position: "relative",
        width: redondo ? size : undefined,
        height: redondo ? size : undefined,
        padding: redondo ? 0 : `${size * 0.06}px ${size * 0.1}px`,
        border: `${Math.max(5, size * 0.028)}px solid ${cor}`,
        borderRadius: redondo ? "50%" : size * 0.05,
        outline: redondo ? `${Math.max(2, size * 0.01)}px solid ${cor}` : undefined,
        outlineOffset: redondo ? -size * 0.07 : undefined,
        color: cor,
        fontFamily: F.display,
        textTransform: "uppercase",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        lineHeight: 1.02,
        opacity: vis * interpolate(s, [0, 0.35], [0, 0.92], clamp),
        transform: `rotate(${rot}deg) scale(${escala})`,
        mixBlendMode: "multiply",
        WebkitMaskImage: ruido,
        WebkitMaskSize: "360px 360px",
        WebkitMaskRepeat: "repeat",
        flex: "0 0 auto",
        ...style,
      }}
    >
      {linhas.map((l, i) => (
        <div key={i} style={{ fontSize: i === 0 && linhas.length > 1 && l.length <= 7 ? fs * 1.55 : fs, letterSpacing: "0.03em", whiteSpace: "nowrap" }}>
          {l}
        </div>
      ))}
    </div>
  );
};

// ---------- tipografia ----------
export type Seg = { t: string; c?: string };
export const Titulo: React.FC<{ linhas: (string | Seg[])[]; size: number; color?: string; start?: number; stagger?: number; align?: "left" | "center"; style?: React.CSSProperties }> = ({
  linhas,
  size,
  color = C.branco,
  start = 0,
  stagger = 4,
  align = "left",
  style,
}) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: align === "center" ? "center" : "flex-start", ...style }}>
    {linhas.map((l, i) => (
      <Linha key={i} i={i} start={start + i * stagger} size={size} color={color} align={align}>
        {typeof l === "string" ? l : l.map((s, k) => <span key={k} style={{ color: s.c ?? color }}>{s.t}</span>)}
      </Linha>
    ))}
  </div>
);
const Linha: React.FC<{ children: React.ReactNode; i: number; start: number; size: number; color: string; align: string }> = ({ children, start, size, color, align }) => {
  const s = useS(start, { damping: 16, stiffness: 140 });
  return (
    <div style={{ overflow: "hidden", paddingTop: size * 0.04 }}>
      <div
        style={{
          fontFamily: F.display,
          fontSize: size,
          lineHeight: 0.98,
          color,
          textTransform: "uppercase",
          letterSpacing: "0.005em",
          textAlign: align as "left" | "center",
          transform: `translateY(${(1 - s) * 105}%)`,
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const Texto: React.FC<{ children: React.ReactNode; size?: number; color?: string; start?: number; weight?: number; style?: React.CSSProperties }> = ({
  children,
  size = 40,
  color = C.branco,
  start = 0,
  weight = 400,
  style,
}) => {
  const p = useP(start, start + 12);
  return (
    <div style={{ fontFamily: F.texto, fontSize: size, lineHeight: 1.28, fontWeight: weight, color, opacity: p, transform: `translateY(${(1 - p) * 18}px)`, textWrap: "balance", ...style }}>
      {children}
    </div>
  );
};

export const Eyebrow: React.FC<{ children: React.ReactNode; color?: string; size?: number; start?: number }> = ({ children, color = C.lima, size = 26, start = 0 }) => {
  const p = useP(start, start + 10);
  return (
    <div style={{ fontFamily: F.texto, fontWeight: 700, fontSize: size, letterSpacing: "0.18em", textTransform: "uppercase", color, opacity: p }}>{children}</div>
  );
};

// selo da marca da campanha
export const SeloCasa: React.FC<{ size?: number; color?: string }> = ({ size = 34, color = C.lima }) => (
  <div style={{ display: "flex", alignItems: "baseline", gap: size * 0.28, fontFamily: F.display, textTransform: "uppercase", color, fontSize: size, lineHeight: 1 }}>
    <span>A casa</span>
    <span style={{ fontFamily: F.mao, fontSize: size * 0.72, textTransform: "none", color: C.branco, transform: "rotate(-4deg)", display: "inline-block" }}>te deve</span>
  </div>
);

export const Logo: React.FC<{ width?: number; style?: React.CSSProperties }> = ({ width = 220, style }) => (
  <Img src={staticFile("logos/butiquim-branco-h.png")} style={{ width, display: "block", ...style }} />
);

// adesivo "sexta e domingo valem mais"
export const SeloSexDom: React.FC<{ size?: number; rot?: number; start?: number; texto?: string[] }> = ({ size = 230, rot = 10, start = 0, texto = ["SEXTA", "E DOMINGO", "VALEM MAIS"] }) => {
  const s = useS(start, { damping: 10, stiffness: 180 });
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: C.rosa,
        color: C.branco,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: F.display,
        lineHeight: 0.95,
        textAlign: "center",
        transform: `rotate(${rot}deg) scale(${s})`,
        boxShadow: "0 18px 40px rgba(233,30,140,.35)",
        flex: "0 0 auto",
      }}
    >
      {texto.map((t, i) => (
        <div key={i} style={{ fontSize: size * (i === 0 ? 0.2 : 0.14) }}>
          {t}
        </div>
      ))}
    </div>
  );
};

// chamada final (pílula lima)
export const Cta: React.FC<{ acao: string; detalhe?: string; size?: number; start?: number }> = ({ acao, detalhe, size = 50, start = 0 }) => {
  const s = useS(start, { damping: 14, stiffness: 160 });
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 14, transform: `translateY(${(1 - s) * 40}px)`, opacity: s }}>
      <div style={{ background: C.lima, color: C.noite, fontFamily: F.display, fontSize: size, textTransform: "uppercase", padding: `${size * 0.22}px ${size * 0.5}px`, borderRadius: size, lineHeight: 1 }}>{acao}</div>
      {detalhe && <div style={{ fontFamily: F.texto, fontSize: size * 0.56, color: C.cinza, fontWeight: 500 }}>{detalhe}</div>}
    </div>
  );
};

// ---------- ícones extras ----------
export const Balde: React.FC<{ size: number; color: string; stroke?: number }> = ({ size, color, stroke = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block", overflow: "visible" }}>
    {[
      "M3.5 10.5h17",
      "M4.3 10.5l1.5 9a2 2 0 0 0 2 1.7h8.4a2 2 0 0 0 2-1.7l1.5-9",
      "M7.2 10.5V6.8c0-.7.7-1 .7-1.7V3.2h1.3v1.9c0 .7.7 1 .7 1.7v3.7",
      "M11.2 10.5V5.8c0-.7.7-1 .7-1.7V2.2h1.3v1.9c0 .7.7 1 .7 1.7v4.7",
      "M15.2 10.5V7.3c0-.7.7-1 .7-1.7V3.7h1.3v1.9c0 .7.7 1 .7 1.7v3.2",
      "M6.5 14.5h11",
    ].map((d, k) => (
      <path key={k} d={d} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
    ))}
  </svg>
);
export { Ico };

// ---------- objetos da campanha ----------

// comanda impressa (volta paga)
export const Comanda: React.FC<{ w?: number; linhas: [string, string][]; total: [string, string]; numero?: string; start?: number; rot?: number; carimbo?: React.ReactNode }> = ({
  w = 600,
  linhas,
  total,
  numero = "0417",
  start = 0,
  rot = -3,
  carimbo,
}) => {
  const s = useS(start, { damping: 18, stiffness: 110 });
  const fs = w * 0.05;
  const dente = 18;
  return (
    <div style={{ position: "relative", width: w, transform: `rotate(${rot}deg) translateY(${(1 - s) * 120}px)`, opacity: s, flex: "0 0 auto" }}>
      <div
        style={{
          background: C.recibo,
          padding: `${fs * 1.4}px ${fs * 1.3}px ${fs * 1.6}px`,
          fontFamily: F.comanda,
          color: "#222",
          fontSize: fs,
          lineHeight: 1.5,
          boxShadow: "0 30px 60px rgba(0,0,0,.5)",
          WebkitMaskImage: `linear-gradient(#000,#000), conic-gradient(from -45deg at 50% 100%, transparent 90deg, #000 0)`,
          WebkitMaskSize: `100% calc(100% - ${dente}px), ${dente * 2}px ${dente}px`,
          WebkitMaskPosition: `top, bottom`,
          WebkitMaskRepeat: "no-repeat, repeat-x",
        }}
      >
        <div style={{ textAlign: "center", fontWeight: 700, fontSize: fs * 1.15, letterSpacing: "0.12em" }}>O BUTIQUIM</div>
        <div style={{ textAlign: "center", fontSize: fs * 0.8 }}>COMANDA Nº {numero}</div>
        <div style={{ borderTop: "3px dashed #999", margin: `${fs * 0.6}px 0` }} />
        {linhas.map(([a, b], i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <span>{a}</span>
            <span style={{ whiteSpace: "nowrap" }}>{b}</span>
          </div>
        ))}
        <div style={{ borderTop: "3px dashed #999", margin: `${fs * 0.6}px 0` }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: fs * 1.15 }}>
          <span>{total[0]}</span>
          <span>{total[1]}</span>
        </div>
        <div style={{ textAlign: "center", fontSize: fs * 0.75, marginTop: fs * 0.8, color: "#666" }}>obrigado pela preferência · volte sempre</div>
      </div>
      {carimbo && <div style={{ position: "absolute", right: -w * 0.1, bottom: -w * 0.06 }}>{carimbo}</div>}
    </div>
  );
};

// passaporte (capa)
export const PassaporteCapa: React.FC<{ w?: number; rot?: number; start?: number }> = ({ w = 420, rot = -6, start = 0 }) => {
  const s = useS(start, { damping: 15, stiffness: 120 });
  const h = w * 1.4;
  return (
    <div
      style={{
        width: w,
        height: h,
        background: `linear-gradient(135deg, #1d201a 0%, ${C.capa} 60%, #0d0e0b 100%)`,
        borderRadius: w * 0.05,
        boxShadow: "0 40px 70px rgba(0,0,0,.6), inset 0 0 0 3px rgba(200,210,0,.18), inset 10px 0 18px rgba(0,0,0,.5)",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: `${w * 0.1}px ${w * 0.08}px`,
        color: C.lima,
        transform: `rotate(${rot}deg) scale(${interpolate(s, [0, 1], [0.8, 1])})`,
        opacity: s,
        flex: "0 0 auto",
        overflow: "hidden",
      }}
    >
      <Grain opacity={0.25} blend="overlay" freq={1.1} />
      <div style={{ fontFamily: F.texto, fontWeight: 700, fontSize: w * 0.052, letterSpacing: "0.2em", textAlign: "center", lineHeight: 1.4 }}>
        REPÚBLICA
        <br />
        DA ESQUINA
      </div>
      <Img src={staticFile("logos/o-simbolo.png")} style={{ width: w * 0.42, filter: "brightness(0) saturate(100%) invert(79%) sepia(62%) saturate(1200%) hue-rotate(20deg) brightness(95%)", opacity: 0.95 }} />
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: F.display, fontSize: w * 0.14, letterSpacing: "0.06em", lineHeight: 1 }}>PASSAPORTE</div>
        <div style={{ fontFamily: F.texto, fontWeight: 600, fontSize: w * 0.055, letterSpacing: "0.3em", marginTop: w * 0.03 }}>O BUTIQUIM</div>
      </div>
    </div>
  );
};

// página interna do passaporte com o carimbo do crédito
export const PassaportePagina: React.FC<{ w?: number; rot?: number; start?: number; valor?: string; sexdom?: string }> = ({ w = 520, rot = 4, start = 0, valor = "R$ 20", sexdom = "R$ 40" }) => {
  const s = useS(start, { damping: 16, stiffness: 120 });
  const h = w * 1.3;
  return (
    <div
      style={{
        width: w,
        height: h,
        background: C.papel,
        borderRadius: w * 0.03,
        position: "relative",
        boxShadow: "0 40px 70px rgba(0,0,0,.55)",
        overflow: "hidden",
        transform: `rotate(${rot}deg) translateY(${(1 - s) * 80}px)`,
        opacity: s,
        flex: "0 0 auto",
        padding: w * 0.07,
        fontFamily: F.comanda,
        color: "#2a2a2a",
      }}
    >
      <AbsoluteFill style={{ backgroundImage: "repeating-radial-gradient(circle at 30% 40%, rgba(28,60,140,.07) 0 2px, transparent 2px 14px)" }} />
      <Grain opacity={0.14} blend="multiply" />
      <div style={{ position: "relative", fontSize: w * 0.04, letterSpacing: "0.15em", color: "#666" }}>VISTOS · ENTRADAS · SAÍDAS</div>
      <div style={{ position: "relative", marginTop: w * 0.06, fontSize: w * 0.045, lineHeight: 1.7 }}>
        <div>TITULAR ........ VOCÊ</div>
        <div>1ª VISITA ...... ✓ OK</div>
        <div>VOLTA ATÉ ...... 21 DIAS</div>
      </div>
      <div style={{ position: "absolute", left: w * 0.08, bottom: w * 0.34 }}>
        <Carimbo linhas={[valor, "de volta"]} cor={C.caneta} size={w * 0.46} rot={-10} start={start + 12} seed={5} />
      </div>
      <div style={{ position: "absolute", right: w * 0.06, bottom: w * 0.08 }}>
        <Carimbo linhas={[sexdom, "sex · dom"]} cor={C.rosa} size={w * 0.42} rot={8} redondo start={start + 22} seed={7} />
      </div>
    </div>
  );
};

// cartela de carimbos do CPF
export const Cartela: React.FC<{ w?: number; carimbos?: number; start?: number; rot?: number; dobro?: boolean }> = ({ w = 900, carimbos = 2, start = 0, rot = -2, dobro = false }) => {
  const s = useS(start, { damping: 16, stiffness: 120 });
  const d = w * 0.24;
  return (
    <div
      style={{
        width: w,
        background: C.papel,
        borderRadius: w * 0.025,
        position: "relative",
        boxShadow: "0 40px 70px rgba(0,0,0,.55)",
        transform: `rotate(${rot}deg) translateY(${(1 - s) * 80}px)`,
        opacity: s,
        padding: `${w * 0.05}px ${w * 0.055}px ${w * 0.06}px`,
        overflow: "hidden",
        flex: "0 0 auto",
      }}
    >
      <Grain opacity={0.14} blend="multiply" />
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={{ fontFamily: F.display, fontSize: w * 0.06, color: C.noite, letterSpacing: "0.02em" }}>CARIMBO NO CPF</div>
        <div style={{ fontFamily: F.comanda, fontSize: w * 0.032, color: "#555" }}>CPF ***.482.***-10</div>
      </div>
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", marginTop: w * 0.05 }}>
        {[0, 1, 2].map((i) => {
          const feito = i < carimbos;
          const premio = i === 2;
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: w * 0.018 }}>
              <div
                style={{
                  width: d,
                  height: d,
                  borderRadius: "50%",
                  border: `${w * 0.006}px dashed rgba(0,0,0,.35)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                {!feito && premio && (
                  <div style={{ display: "flex", gap: d * 0.06, alignItems: "flex-end", opacity: 0.55 }}>
                    <Balde size={d * 0.42} color={C.noite} />
                    <Ico i="garrafa" size={d * 0.42} color={C.noite} stroke={1.5} />
                  </div>
                )}
                {feito && (
                  <div style={{ position: "absolute" }}>
                    <Carimbo linhas={dobro && i === 1 ? ["2X", "domingo"] : [["SEX", "SÁB"][i] ?? "SÁB", "carimbado"]} cor={dobro && i === 1 ? C.rosa : C.caneta} size={d * 0.95} redondo rot={-14 + i * 11} start={start + 10 + i * 10} seed={11 + i} />
                  </div>
                )}
              </div>
              <div style={{ fontFamily: F.display, fontSize: w * 0.04, color: premio ? C.rosa : "#444" }}>{premio ? "3ª GANHA" : `${i + 1}ª VISITA`}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// caderneta de fiado (o "antes": o cliente devendo)
export const CadernetaFiado: React.FC<{ w: number; h: number; start?: number; rot?: number; virar?: boolean; virarEm?: number }> = ({ w, h, start = 0, rot = -3, virar = true, virarEm = 50 }) => {
  const nomes: [string, string][] = [
    ["Zé da moto", "R$ 42,00"],
    ["Carlinhos", "R$ 18,50"],
    ["Tiago (irmão)", "R$ 63,00"],
  ];
  const ps = 58;
  const x0 = 120;
  return (
    <Papel w={w} h={h} rot={rot} pauta={ps} topo={130}>
      <div style={{ position: "absolute", left: x0, top: 46 }}>
        <Escrita start={start} size={70} font={F.caneta} dur={10}>
          Fiado
        </Escrita>
      </div>
      {nomes.map(([n, v], i) => (
        <div key={i} style={{ position: "absolute", left: x0, right: 46, top: 130 + ps * (i + 1) - 52, display: "flex", justifyContent: "space-between" }}>
          <Escrita start={start + 8 + i * 8} size={50} dur={10}>
            {n}
          </Escrita>
          <Escrita start={start + 12 + i * 8} size={50} dur={8}>
            {v}
          </Escrita>
        </div>
      ))}
      <div style={{ position: "absolute", left: x0, right: 46, top: 130 + ps * 4 - 52, display: "flex", justifyContent: "space-between" }}>
        <div style={{ position: "relative" }}>
          <Escrita start={start + 36} size={50} dur={8}>
            Você
          </Escrita>
          {virar && <Risco start={virarEm} seed={2} width={8} />}
        </div>
        <div style={{ position: "relative" }}>
          <Escrita start={start + 40} size={50} dur={8}>
            R$ 57,00
          </Escrita>
          {virar && <Risco start={virarEm + 4} seed={4} width={8} />}
        </div>
      </div>
      {virar && (
        <div style={{ position: "absolute", left: x0 - 20, top: 130 + ps * 5 - 30 }}>
          <Escrita start={virarEm + 12} size={Math.min(92, w * 0.1)} font={F.mao} color={C.rosa} weight={400} dur={22} style={{ transform: "rotate(-4deg)" }}>
            A casa te deve!
          </Escrita>
        </div>
      )}
    </Papel>
  );
};

// valor riscado trocando por um maior (bônus de sexta e domingo)
export const Troca: React.FC<{ de: string; para: string; start?: number; size?: number; corDe?: string; corPara?: string }> = ({ de, para, start = 0, size = 150, corDe = C.branco, corPara = C.rosa }) => (
  <div style={{ display: "flex", alignItems: "center", gap: size * 0.3 }}>
    <div style={{ position: "relative", fontFamily: F.display, fontSize: size, color: corDe, lineHeight: 1, opacity: 0.8, whiteSpace: "nowrap" }}>
      {de}
      <Risco start={start} seed={9} width={size * 0.07} color={C.rosa} />
    </div>
    <Escrita start={start + 10} size={size * 0.72} font={F.mao} color={corPara} weight={400} dur={16} style={{ transform: "rotate(-5deg)", paddingBottom: size * 0.1 }}>
      {para}
    </Escrita>
  </div>
);

// lista de passos numerados (é uma sequência de verdade)
export const Passos: React.FC<{ itens: string[]; size?: number; start?: number; cor?: string }> = ({ itens, size = 40, start = 0, cor = C.lima }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: size * 0.8 }}>
    {itens.map((t, i) => (
      <Passo key={i} n={i + 1} start={start + i * 6} size={size} cor={cor}>
        {t}
      </Passo>
    ))}
  </div>
);
const Passo: React.FC<{ n: number; start: number; size: number; cor: string; children: React.ReactNode }> = ({ n, start, size, cor, children }) => {
  const p = useP(start, start + 12);
  return (
    <div style={{ display: "flex", gap: size * 0.7, alignItems: "flex-start", opacity: p, transform: `translateX(${(1 - p) * -30}px)` }}>
      <div style={{ width: size * 1.7, height: size * 1.7, borderRadius: "50%", background: cor, color: C.noite, fontFamily: F.display, fontSize: size * 1.05, display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto" }}>{n}</div>
      <div style={{ fontFamily: F.texto, fontSize: size, lineHeight: 1.3, color: C.branco, paddingTop: size * 0.18 }}>{children}</div>
    </div>
  );
};

export const Regras: React.FC<{ itens: string[]; size?: number; start?: number; color?: string }> = ({ itens, size = 32, start = 0, color = C.branco }) => {
  const p = useP(start, start + 14);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: size * 0.55, opacity: p }}>
      {itens.map((t, i) => (
        <div key={i} style={{ display: "flex", gap: size * 0.6, fontFamily: F.texto, fontSize: size, lineHeight: 1.35, color }}>
          <span style={{ color: C.lima, fontWeight: 800 }}>—</span>
          <span>{t}</span>
        </div>
      ))}
    </div>
  );
};

// transição de cena (entra/sai com deslize + fade)
export const Cena: React.FC<{ dur: number; children: React.ReactNode; sai?: boolean }> = ({ dur, children, sai = true }) => {
  const f = useCurrentFrame();
  const entra = interpolate(f, [0, 8], [0, 1], clamp);
  const saida = sai ? interpolate(f, [dur - 8, dur], [1, 0], clamp) : 1;
  return <AbsoluteFill style={{ opacity: Math.min(entra, saida), transform: `translateY(${(1 - entra) * 30}px)` }}>{children}</AbsoluteFill>;
};
