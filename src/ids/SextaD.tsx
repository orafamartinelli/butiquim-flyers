import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { BEBAS, MARKER, ARCHIVO } from "../fonts";
import { Grain, Logo, Nota, Vignette, clamp, useFade, useSpr } from "../shared/fx";
import { RingPx } from "../shared/Ring3D";
import { rnd } from "../shared/icones";
import { DIM, Formato, Noite, SUBESTILO } from "../data";

// SEXTA D — "Mesa do Butica": a mesa do bar vista de cima — polaroid do artista, bolacha de chope com o "O",
// guardanapo com o nome escrito à caneta, tampinha com a hora, "SEXTA" estampado na mesa
const LIMA = "#C8D200";
const PRETO = "#0B0B09";
const PAPEL = "#F6F3EC";
const MESA = "#1C1917";
const TINTA = "#14120F";

const Mesa: React.FC<{ w: number; h: number }> = ({ w, h }) => (
  <>
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 30% 20%, #2e2a26 0%, ${MESA} 55%, #0e0d0b 100%)` }} />
    <AbsoluteFill style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,.025) 0 1px, transparent 1px 9px), repeating-linear-gradient(90deg, rgba(0,0,0,.25) 0 2px, transparent 2px 210px)" }} />
    {/* marcas de copo e migalhas */}
    {[[880, 230, 200], [210, 1180, 170], [960, 1230, 120]].map(([x, y, d], i) => (
      <div key={i} style={{ position: "absolute", left: x - d / 2, top: y - d / 2, width: d, height: d, borderRadius: "50%", border: "12px solid rgba(255,245,210,.07)" }} />
    ))}
    {Array.from({ length: 40 }, (_, i) => <div key={i} style={{ position: "absolute", left: rnd(i) * w, top: rnd(i + 50) * h, width: 2 + rnd(i + 9) * 4, height: 2 + rnd(i + 9) * 4, borderRadius: "50%", background: "rgba(255,240,200,.18)" }} />)}
  </>
);

// "SEXTA" estampado na mesa (tinta lima gasta)
const Estampa: React.FC<{ top: number; size: number; delay: number }> = ({ top, size, delay }) => {
  const o = useFade(delay, delay + 12);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: BEBAS, fontSize: size, lineHeight: 0.8, color: LIMA, letterSpacing: "0.02em", opacity: o * 0.95, WebkitMaskImage: "radial-gradient(ellipse at 40% 50%, #000 55%, rgba(0,0,0,.7) 100%)" }}>SEXTA</div>
  );
};

// polaroid com o artista (recorte em cor sobre fundo escuro) e legenda à caneta
const Polaroid: React.FC<{ n: Noite; x: number; y: number; w: number; h: number; delay: number; rot: number }> = ({ n, x, y, w, h, delay, rot }) => {
  const s = useSpr(delay, { damping: 13, stiffness: 80 });
  const fotoH = h - 150;
  const fotoW = w - 40;
  const artH = fotoH * 1.06;
  const artW = artH * n.foto.ratio;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, transform: `rotate(${rot}deg) translateY(${(1 - s) * -80}px)`, opacity: s, background: PAPEL, padding: 20, boxSizing: "border-box", boxShadow: "0 30px 50px rgba(0,0,0,.65), 0 2px 0 rgba(255,255,255,.3) inset" }}>
      <div style={{ position: "relative", width: fotoW, height: fotoH, background: "radial-gradient(ellipse at 50% 35%, #2a2622 0%, #0d0c0a 70%)", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: "50%", top: "22%", width: 600, height: 600, marginLeft: -300, borderRadius: "50%", background: "rgba(200,210,0,.22)", filter: "blur(90px)" }} />
        <Img src={staticFile(n.foto.src)} style={{ position: "absolute", height: artH, width: artW, left: fotoW / 2 - artW / 2, top: 10, filter: "saturate(1.08) contrast(1.04) drop-shadow(0 20px 30px rgba(0,0,0,.6))", WebkitMaskImage: "linear-gradient(180deg, #000 86%, transparent 100%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(255,255,255,.08) 0%, rgba(255,255,255,0) 40%)" }} />
      </div>
      <div style={{ position: "absolute", left: 24, right: 24, bottom: 26, display: "flex", justifyContent: "space-between", alignItems: "baseline", fontFamily: MARKER, color: TINTA }}>
        <span style={{ fontSize: 40, transform: "rotate(-1.5deg)", display: "inline-block" }}>sexta do butica</span>
        <span style={{ fontSize: 34, opacity: 0.85 }}>{n.dia}/{String(["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"].indexOf(n.mes) + 1).padStart(2, "0")}</span>
      </div>
      {/* fita no canto */}
      <div style={{ position: "absolute", left: -30, top: -16, width: 150, height: 40, transform: "rotate(-28deg)", background: "rgba(245,240,220,.6)", backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,.3) 0 3px, transparent 3px 9px)", boxShadow: "0 2px 5px rgba(0,0,0,.25)" }} />
    </div>
  );
};

// guardanapo com o nome do artista e a lista escritos à caneta
const Guardanapo: React.FC<{ n: Noite; x: number; y: number; w: number; h: number; delay: number; rot: number; cta?: boolean }> = ({ n, x, y, w, h, delay, rot, cta }) => {
  const s = useSpr(delay, { damping: 14 });
  const nomeSize = Math.min(96, (w - 70) / (n.artista.length * 0.58));
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, transform: `rotate(${rot}deg) translateY(${(1 - s) * 90}px)`, opacity: s, backgroundColor: "#F4F0E6", backgroundImage: "repeating-linear-gradient(45deg, rgba(0,0,0,.025) 0 6px, transparent 6px 14px), linear-gradient(135deg, #FBF9F3 0%, #ECE7DA 100%)", boxShadow: "0 24px 40px rgba(0,0,0,.6)", padding: "26px 34px", boxSizing: "border-box" }}>
      <div style={{ position: "absolute", inset: 10, border: "1.5px dashed rgba(20,18,15,.18)" }} />
      <div style={{ fontFamily: MARKER, fontSize: 26, color: TINTA, opacity: 0.8, transform: "rotate(-1deg)" }}>hoje no palco:</div>
      <div style={{ fontFamily: MARKER, fontSize: nomeSize, lineHeight: 1.05, color: TINTA, whiteSpace: "nowrap", transform: "rotate(-1.5deg)", marginTop: 2 }}>{n.artista}</div>
      <div style={{ width: "92%", height: 5, background: LIMA, transform: "rotate(-1deg) skewX(-20deg)", margin: "4px 0 14px", opacity: 0.9 }} />
      <div style={{ fontFamily: MARKER, fontSize: 30, color: TINTA, lineHeight: 1.3 }}>
        lista fem. <span style={{ background: LIMA, padding: "0 8px" }}>FREE</span> até {n.lista[0].split("ATÉ ")[1].toLowerCase()}
        <br />
        lista masc. <span style={{ background: LIMA, padding: "0 8px" }}>R$ 20</span> até {n.lista[1].split("ATÉ ")[1].toLowerCase()}
      </div>
      <div style={{ fontFamily: ARCHIVO, fontWeight: 500, fontSize: 16, color: TINTA, opacity: 0.65, marginTop: 8 }}>{n.obs}</div>
      {cta && <div style={{ fontFamily: MARKER, fontSize: 28, color: TINTA, marginTop: 8 }}>→ nome na lista: link na bio</div>}
    </div>
  );
};

// tampinha de garrafa com a hora
const Tampinha: React.FC<{ x: number; y: number; d: number; hora: string; delay: number }> = ({ x, y, d, hora, delay }) => {
  const s = useSpr(delay, { damping: 10, stiffness: 160 });
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: x - d / 2, top: y - d / 2, width: d, height: d, transform: `scale(${interpolate(s, [0, 1], [1.6, 1])}) rotate(${interpolate(s, [0, 1], [80, 14]) + Math.sin(frame / 50)}deg)`, opacity: Math.min(1, s * 1.5), filter: "drop-shadow(0 12px 16px rgba(0,0,0,.6))" }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: `repeating-conic-gradient(${PRETO} 0deg 7deg, #3a3a36 7deg 14deg)` }} />
      <div style={{ position: "absolute", inset: d * 0.09, borderRadius: "50%", background: `radial-gradient(circle at 35% 30%, #e6ee55, ${LIMA} 50%, #9aa300 100%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: PRETO }}>
        <div style={{ fontFamily: ARCHIVO, fontWeight: 900, fontSize: d * 0.11, letterSpacing: "0.12em" }}>ABRE</div>
        <div style={{ fontFamily: BEBAS, fontSize: d * 0.42, lineHeight: 0.9 }}>{hora}</div>
      </div>
    </div>
  );
};

// adesivo redondo do estilo, colado na polaroid
const Estilo: React.FC<{ n: Noite; x: number; y: number; d: number; delay: number }> = ({ n, x, y, d, delay }) => {
  const s = useSpr(delay, { damping: 11 });
  return (
    <div style={{ position: "absolute", left: x - d / 2, top: y - d / 2, width: d, height: d, borderRadius: "50%", background: PRETO, color: LIMA, transform: `rotate(-12deg) scale(${s})`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 20px rgba(0,0,0,.5), inset 0 0 0 4px rgba(200,210,0,.9), inset 0 0 0 7px rgba(11,11,9,1)" }}>
      <Nota size={d * 0.2} color={LIMA} />
      <div style={{ fontFamily: BEBAS, fontSize: d * 0.22, lineHeight: 1, letterSpacing: "0.06em", marginTop: 2 }}>{n.estilo}</div>
      <div style={{ fontFamily: ARCHIVO, fontWeight: 700, fontSize: d * 0.1, color: PAPEL, opacity: 0.85 }}>{SUBESTILO}</div>
    </div>
  );
};

type L = { estTop: number; estSize: number; polX: number; polY: number; polW: number; polH: number; guaX: number; guaY: number; guaW: number; guaH: number; bolX: number; bolY: number; bolH: number; tamX: number; tamY: number; cta?: boolean };
const LAYOUT: Record<"feed" | "story", L> = {
  feed: { estTop: 44, estSize: 370, polX: 70, polY: 250, polW: 640, polH: 760, guaX: 60, guaY: 1000, guaW: 700, guaH: 320, bolX: 880, bolY: 1090, bolH: 290, tamX: 950, tamY: 640 },
  story: { estTop: 260, estSize: 460, polX: 70, polY: 380, polW: 680, polH: 860, guaX: 60, guaY: 1300, guaW: 720, guaH: 420, bolX: 880, bolY: 1470, bolH: 320, tamX: 950, tamY: 820, cta: true },
};

export const SextaD: React.FC<{ n: Noite; fmt: Formato }> = ({ n, fmt }) => {
  const f = fmt === "broll" ? "story" : fmt;
  const L = LAYOUT[f];
  const { w, h } = DIM[f];
  const frame = useCurrentFrame();
  const anel = useSpr(30, { damping: 13, stiffness: 100 });
  const push = interpolate(frame, [0, 240], [1, 1.03], clamp);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Mesa w={w} h={h} />
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "40% 40%" }}>
        <Estampa top={L.estTop} size={L.estSize} delay={2} />
        <Polaroid n={n} x={L.polX} y={L.polY} w={L.polW} h={L.polH} delay={8} rot={-4} />
        <Estilo n={n} x={L.polX + L.polW - 30} y={L.polY + 40} d={170} delay={40} />
        <Guardanapo n={n} x={L.guaX} y={L.guaY} w={L.guaW} h={L.guaH} delay={24} rot={2} cta={L.cta} />
        {/* bolacha de chope lima com o "O" em relevo */}
        <div style={{ position: "absolute", left: L.bolX - L.bolH / 2, top: L.bolY - L.bolH / 2, width: L.bolH, height: L.bolH, borderRadius: "50%", background: `radial-gradient(circle at 40% 35%, #d9e23a, ${LIMA} 60%, #a8b000 100%)`, boxShadow: "0 22px 36px rgba(0,0,0,.65), inset 0 0 0 10px rgba(11,11,9,.9), inset 0 0 0 14px rgba(200,210,0,1)", opacity: anel, transform: `scale(${interpolate(anel, [0, 1], [1.4, 1])})` }} />
        <RingPx width={w} height={h} look="cromo" cx={L.bolX} cy={L.bolY} ringH={L.bolH * 0.62} rotY={0.25 + Math.sin(frame / 45) * 0.06} rotX={0.5} envIntensity={1.1} lights={[{ color: "#fff2c0", pos: [-3, 3, 3], intensity: 4 }]} style={{ opacity: anel, filter: "drop-shadow(0 10px 12px rgba(0,0,0,.5))" }} />
        <Tampinha x={L.tamX} y={L.tamY} d={150} hora={n.hora} delay={46} />
      </AbsoluteFill>
      <Logo width={f === "feed" ? 190 : 230} top={f === "feed" ? 34 : 200} left={f === "feed" ? 850 : 810} />
      <Grain opacity={0.14} />
      <Vignette strength={0.6} />
    </AbsoluteFill>
  );
};
