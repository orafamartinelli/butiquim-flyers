import React from "react";
import { AbsoluteFill, OffthreadVideo, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FRAUNCES, ARCHIVO } from "../fonts";
import { Cutout, Grain, Logo, Nota, Vignette, clamp, useFade, useSpr } from "../shared/fx";
import { RingPx } from "../shared/Ring3D";
import { Formato, Noite, DIM, SUBESTILO } from "../data";

// SAIDEIRA — "Rótulo da Última Rodada": âmbar, creme e cobre; moldura de rótulo, faixa, selo e canhoto
const ESPRESSO = "#140A05";
const AMBAR = "#F29A2E";
const QUEIMADO = "#D9541E";
const CREME = "#F4E8D2";
const OURO = "#E8B560";

const Fundo: React.FC<{ cx: number; cy: number }> = ({ cx, cy }) => {
  const frame = useCurrentFrame();
  return (
    <>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at ${cx}px ${cy}px, #7A3210 0%, #3A170A 38%, #170B06 72%, ${ESPRESSO} 100%)` }} />
      <AbsoluteFill
        style={{
          background: `repeating-conic-gradient(from ${frame * 0.12}deg at ${cx}px ${cy}px, rgba(242,154,46,.13) 0deg 5deg, rgba(242,154,46,0) 5deg 12deg)`,
          WebkitMaskImage: `radial-gradient(circle at ${cx}px ${cy}px, #000 0%, rgba(0,0,0,.5) 35%, transparent 70%)`,
        }}
      />
      <AbsoluteFill style={{ backgroundImage: "repeating-linear-gradient(90deg, rgba(244,232,210,.035) 0 2px, transparent 2px 22px)" }} />
    </>
  );
};

// moldura dupla de rótulo, com losangos nos cantos
const Moldura: React.FC<{ w: number; h: number; inset: number; o: number }> = ({ w, h, inset, o }) => {
  const d = (x: number, y: number) => (
    <div style={{ position: "absolute", left: x - 9, top: y - 9, width: 18, height: 18, background: OURO, transform: "rotate(45deg)" }} />
  );
  return (
    <AbsoluteFill style={{ opacity: o, pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: inset, top: inset, width: w - inset * 2, height: h - inset * 2, border: `2px solid rgba(232,181,96,.8)` }} />
      <div style={{ position: "absolute", left: inset + 10, top: inset + 10, width: w - inset * 2 - 20, height: h - inset * 2 - 20, border: `1px solid rgba(232,181,96,.45)` }} />
      {d(inset, inset)}
      {d(w - inset, inset)}
      {d(inset, h - inset)}
      {d(w - inset, h - inset)}
    </AbsoluteFill>
  );
};

const Linha: React.FC<{ text: string; top: number; o: number; size?: number; w?: number }> = ({ text, top, o, size = 20, w = 120 }) => (
  <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 18, opacity: o }}>
    <div style={{ width: w, height: 1.5, background: OURO }} />
    <div style={{ fontFamily: ARCHIVO, fontWeight: 700, fontSize: size, letterSpacing: "0.38em", color: CREME, paddingLeft: "0.38em" }}>{text}</div>
    <div style={{ width: w, height: 1.5, background: OURO }} />
  </div>
);

const Saideira: React.FC<{ size: number; top: number; delay: number; left?: number; align?: "center" | "left" }> = ({ size, top, delay, left, align = "center" }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, 26], [0, 104], clamp);
  return (
    <div style={{ position: "absolute", top, left: left ?? 0, right: align === "center" ? 0 : undefined, textAlign: align }}>
      <div
        style={{
          display: "inline-block", fontFamily: FRAUNCES, fontStyle: "italic", fontWeight: 900, fontSize: size, lineHeight: 1, color: CREME, letterSpacing: "-0.02em",
          textShadow: `4px 5px 0 ${QUEIMADO}, 9px 11px 0 rgba(0,0,0,.45), 0 0 50px rgba(242,154,46,.35)`,
          clipPath: `inset(-20% ${100 - p}% -20% -5%)`, paddingRight: 24,
        }}
      >
        Saideira
      </div>
    </div>
  );
};

const DaSemana: React.FC<{ top: number; size: number; delay: number; left?: number; align?: "center" | "left" }> = ({ top, size, delay, left, align = "center" }) => {
  const o = useFade(delay, delay + 14);
  return (
    <div style={{ position: "absolute", top, left: left ?? 0, right: align === "center" ? 0 : undefined, display: "flex", alignItems: "center", justifyContent: align === "center" ? "center" : "flex-start", gap: 20, opacity: o }}>
      <div style={{ width: 90, height: 2, background: AMBAR }} />
      <div style={{ fontFamily: FRAUNCES, fontStyle: "italic", fontWeight: 400, fontSize: size, color: AMBAR }}>da Semana</div>
      <div style={{ width: 90, height: 2, background: AMBAR }} />
    </div>
  );
};

// faixa (fita) com o logo oficial do artista
const Faixa: React.FC<{ n: Noite; cx: number; top: number; w: number; delay: number }> = ({ n, cx, top, w, delay }) => {
  const s = useSpr(delay, { damping: 14 });
  const h = w * 0.2;
  return (
    <div style={{ position: "absolute", left: cx - w / 2, top, width: w, height: h, transform: `scaleX(${s})`, filter: "drop-shadow(0 14px 18px rgba(0,0,0,.55))" }}>
      <svg width={w} height={h} viewBox="0 0 700 112" preserveAspectRatio="none" style={{ position: "absolute", inset: 0 }}>
        <polygon points="0,30 110,30 110,108 0,108 34,69" fill="#2A1208" />
        <polygon points="700,30 590,30 590,108 700,108 666,69" fill="#2A1208" />
        <polygon points="70,86 110,108 110,86" fill="#0E0603" />
        <polygon points="630,86 590,108 590,86" fill="#0E0603" />
        <rect x="60" y="4" width="580" height="84" fill="#3E1B0B" />
        <rect x="60" y="10" width="580" height="2" fill={OURO} />
        <rect x="60" y="80" width="580" height="2" fill={OURO} />
      </svg>
      {/* nome composto em serifa: o "RIBEIRO" miúdo do logo oficial some nesse tamanho */}
      <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.1, height: h * 0.68, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FRAUNCES, fontWeight: 600, fontSize: h * 0.4, letterSpacing: "0.06em", color: CREME, whiteSpace: "nowrap" }}>{n.artista}</div>
    </div>
  );
};

// estilo musical no canto: etiqueta creme de rótulo
const Estilo: React.FC<{ n: Noite; x: number; y: number; delay: number; size?: number }> = ({ n, x, y, delay, size = 20 }) => {
  const s = useSpr(delay, { damping: 12 });
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `rotate(-3deg) scale(${s})`, transformOrigin: "left center", display: "flex", alignItems: "center", gap: 8, background: CREME, color: QUEIMADO, border: `2px solid ${OURO}`, outline: `1.5px solid rgba(244,232,210,.7)`, outlineOffset: 3, padding: "6px 16px 6px 10px", boxShadow: "0 10px 20px rgba(0,0,0,.45)" }}>
      <Nota size={size * 1.15} color={QUEIMADO} />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontFamily: ARCHIVO, fontWeight: 900, fontSize: size, lineHeight: 1.05, letterSpacing: "0.16em" }}>{n.estilo}</span>
        <span style={{ fontFamily: FRAUNCES, fontStyle: "italic", fontWeight: 600, fontSize: size * 0.7, lineHeight: 1.15, color: ESPRESSO, opacity: 0.75 }}>{SUBESTILO}</span>
      </div>
    </div>
  );
};

// selo redondo com a data
const Selo: React.FC<{ n: Noite; x: number; y: number; d: number; delay: number }> = ({ n, x, y, d, delay }) => {
  const s = useSpr(delay, { damping: 12, stiffness: 140 });
  const frame = useCurrentFrame();
  const sc = interpolate(s, [0, 1], [2.2, 1]);
  const rot = interpolate(s, [0, 1], [-40, -10]) + Math.sin(frame / 50) * 1.5;
  const txt = `${n.diaSemana} ● ÚLTIMA RODADA ● `;
  const circ = 2 * Math.PI * 74 - 4;
  return (
    <div style={{ position: "absolute", left: x - d / 2, top: y - d / 2, width: d, height: d, transform: `scale(${sc}) rotate(${rot}deg)`, opacity: Math.min(1, s * 1.5) }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: `radial-gradient(circle at 35% 30%, #FFC56E, ${AMBAR} 45%, #B9571A 100%)`, boxShadow: `0 16px 30px rgba(0,0,0,.55), inset 0 0 0 5px rgba(20,10,5,.85), inset 0 0 0 8px ${OURO}` }} />
      <svg width={d} height={d} viewBox="0 0 200 200" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <path id="circ" d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0" />
        </defs>
        <text fontFamily={ARCHIVO} fontWeight={800} fontSize="14" fill={ESPRESSO} textLength={circ} lengthAdjust="spacing">
          <textPath href="#circ" textLength={circ} lengthAdjust="spacing">{txt}</textPath>
        </text>
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: ESPRESSO, transform: "rotate(10deg)" }}>
        <div style={{ fontFamily: FRAUNCES, fontWeight: 900, fontSize: d * 0.3, lineHeight: 0.9 }}>{n.dia}</div>
        <div style={{ fontFamily: ARCHIVO, fontWeight: 900, fontSize: d * 0.1, letterSpacing: "0.14em" }}>{n.mes}</div>
        <div style={{ fontFamily: FRAUNCES, fontStyle: "italic", fontWeight: 600, fontSize: d * 0.11 }}>às {n.hora.toLowerCase()}</div>
      </div>
    </div>
  );
};

// canhoto de ingresso com a lista
const Canhoto: React.FC<{ n: Noite; x: number; y: number; w: number; h: number; delay: number; cta?: boolean }> = ({ n, x, y, w, h, delay, cta }) => {
  const s = useSpr(delay, { damping: 16 });
  const notch = `radial-gradient(circle at 0 50%, transparent 18px, #000 19px) left / 51% 100% no-repeat, radial-gradient(circle at 100% 50%, transparent 18px, #000 19px) right / 51% 100% no-repeat`;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, transform: `translateY(${(1 - s) * 140}px) rotate(-1deg)`, opacity: s, filter: "drop-shadow(0 16px 22px rgba(0,0,0,.55))" }}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, #F7EDDA, #EBD9B8)`, WebkitMask: notch, mask: notch, display: "flex", alignItems: "center" }}>
        <div style={{ width: h * 0.95, alignSelf: "stretch", display: "flex", alignItems: "center", justifyContent: "center", borderRight: `3px dashed rgba(20,10,5,.35)` }}>
          <div style={{ transform: "rotate(-90deg)", fontFamily: ARCHIVO, fontWeight: 900, fontSize: h * 0.2, letterSpacing: "0.22em", color: QUEIMADO }}>LISTA</div>
        </div>
        <div style={{ flex: 1, padding: "0 30px", color: ESPRESSO, textAlign: "center" }}>
          <div style={{ fontFamily: ARCHIVO, fontWeight: 900, fontSize: Math.min(h * 0.2, 27), letterSpacing: "0.02em", whiteSpace: "nowrap" }}>
            {n.lista[0].replace("LISTA ", "")} <span style={{ color: QUEIMADO }}>●</span> {n.lista[1].replace("LISTA ", "")}
          </div>
          <div style={{ fontFamily: ARCHIVO, fontWeight: 600, fontSize: Math.min(h * 0.125, 18), opacity: 0.8, marginTop: 6 }}>{n.obs}</div>
          {cta && <div style={{ fontFamily: FRAUNCES, fontStyle: "italic", fontWeight: 600, fontSize: Math.min(h * 0.15, 24), color: QUEIMADO, marginTop: 6 }}>nome na lista pelo link da bio</div>}
        </div>
      </div>
    </div>
  );
};

const useAnel = () => {
  const frame = useCurrentFrame();
  const inn = useSpr(0, { damping: 17, stiffness: 60 });
  return {
    rotY: interpolate(inn, [0, 1], [1.45, 0.26]) + Math.sin(frame / 45) * 0.09,
    rotX: Math.sin(frame / 60) * 0.05,
    grow: interpolate(inn, [0, 1], [0.6, 1]),
  };
};

// lâmpada acendendo no começo
const useAcende = () => {
  const frame = useCurrentFrame();
  const f = [0, 0.6, 0.15, 0.85, 0.5, 1];
  const i = Math.min(f.length - 1, Math.floor(frame / 3));
  return frame > 17 ? 1 : f[i];
};

type L = { frame: number; logoTop: number; logoW: number; lineY: number; ringCy: number; ringH: number; artH: number; artTop: number; faixaY: number; faixaW: number; titleY: number; titleSize: number; semanaY: number; semanaSize: number; seloX: number; seloY: number; seloD: number; tkY: number; tkH: number; cta?: boolean };

const LAYOUT: Record<"feed" | "story", L> = {
  feed: { frame: 26, logoTop: 52, logoW: 200, lineY: 108, ringCy: 540, ringH: 660, artH: 1090, artTop: 150, faixaY: 770, faixaW: 640, titleY: 842, titleSize: 228, semanaY: 1080, semanaSize: 54, seloX: 890, seloY: 300, seloD: 210, tkY: 1162, tkH: 128 },
  story: { frame: 30, logoTop: 214, logoW: 230, lineY: 276, ringCy: 790, ringH: 760, artH: 1300, artTop: 330, faixaY: 1080, faixaW: 700, titleY: 1160, titleSize: 250, semanaY: 1420, semanaSize: 60, seloX: 880, seloY: 520, seloD: 230, tkY: 1508, tkH: 160, cta: true },
};

export const Domingo: React.FC<{ n: Noite; fmt: Formato }> = ({ n, fmt }) => {
  if (fmt === "broll") return <DomingoBroll n={n} />;
  return <DomingoFlyer n={n} fmt={fmt} />;
};

const DomingoFlyer: React.FC<{ n: Noite; fmt: "feed" | "story" }> = ({ n, fmt }) => {
  const L = LAYOUT[fmt];
  const { w, h } = DIM[fmt];
  const frame = useCurrentFrame();
  const a = useAnel();
  const art = useSpr(12, { damping: 15 });
  const luz = useAcende();
  const o = useFade(4, 20);
  const push = interpolate(frame, [0, 240], [1, 1.035], clamp);
  return (
    <AbsoluteFill style={{ overflow: "hidden", filter: `brightness(${0.55 + 0.45 * luz})` }}>
      <Fundo cx={540} cy={L.ringCy} />
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        <RingPx width={w} height={h} look="cobre" cx={540} cy={L.ringCy} ringH={L.ringH * a.grow} rotY={a.rotY} rotX={a.rotX} envIntensity={1} lights={[{ color: "#ffb35c", pos: [-3, 2, 3], intensity: 4 }]} />
        <Cutout src={n.foto.src} ratio={n.foto.ratio} height={L.artH} cx={540} top={L.artTop + (1 - art) * 200} fadeFrom={0.66} filter="sepia(.16) saturate(1.1) contrast(1.05) drop-shadow(0 0 30px rgba(242,154,46,.35)) drop-shadow(0 30px 40px rgba(0,0,0,.6))" style={{ opacity: art }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(20,10,5,0) 52%, rgba(20,10,5,.75) 70%, rgba(20,10,5,.95) 84%)" }} />
      <Moldura w={w} h={h} inset={L.frame} o={o} />
      <Logo width={L.logoW} top={L.logoTop} />
      <Estilo n={n} x={fmt === "feed" ? 56 : 66} y={fmt === "feed" ? 46 : 206} delay={36} size={fmt === "feed" ? 24 : 27} />
      <Linha text="A ÚLTIMA RODADA DA SEMANA" top={L.lineY} o={o} size={fmt === "feed" ? 17 : 19} w={70} />
      <Faixa n={n} cx={540} top={L.faixaY} w={L.faixaW} delay={30} />
      <Saideira size={L.titleSize} top={L.titleY} delay={18} />
      <DaSemana top={L.semanaY} size={L.semanaSize} delay={34} />
      <Selo n={n} x={L.seloX} y={L.seloY} d={L.seloD} delay={40} />
      <Canhoto n={n} x={70} y={L.tkY} w={w - 140} h={L.tkH} delay={46} cta={L.cta} />
      <Grain opacity={0.16} />
      <Vignette strength={0.55} />
    </AbsoluteFill>
  );
};

// STORY com B-roll: o palco numa "foto de época" com borda creme; recorte do artista sai da foto
const DomingoBroll: React.FC<{ n: Noite }> = ({ n }) => {
  const { w, h } = DIM.broll;
  const a = useAnel();
  const art = useSpr(10, { damping: 15 });
  const luz = useAcende();
  const o = useFade(0, 16);
  const PX = 60, PY = 170, PW = w - 120, PH = 860;
  return (
    <AbsoluteFill style={{ overflow: "hidden", filter: `brightness(${0.55 + 0.45 * luz})` }}>
      <Fundo cx={800} cy={1350} />
      <div style={{ position: "absolute", left: PX, top: PY, width: PW, height: PH, background: CREME, padding: 16, transform: "rotate(-1.5deg)", boxShadow: "0 30px 60px rgba(0,0,0,.6)", opacity: o }}>
        <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
          <OffthreadVideo src={staticFile(n.clip)} style={{ width: PW - 32, height: (PW - 32) * (1920 / 1080), objectFit: "cover", marginTop: n.clipTop ?? -380, filter: "sepia(.38) saturate(1.25) contrast(1.08) brightness(1.02)" }} volume={(f) => interpolate(f, [0, 8, 285, 300], [0, 1, 1, 0], clamp)} />
          <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(40,15,5,.55) 100%)" }} />
          <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(20,10,5,.55) 0%, rgba(20,10,5,0) 25%)" }} />
        </div>
      </div>
      <Logo width={230} top={214} />
      <Estilo n={n} x={80} y={190} delay={16} size={25} />
      <RingPx width={w} height={h} look="cobre" cx={820} cy={1330} ringH={560 * a.grow} rotY={a.rotY} rotX={a.rotX} envIntensity={1} lights={[{ color: "#ffb35c", pos: [-3, 2, 3], intensity: 4 }]} />
      <Cutout src={n.foto.src} ratio={n.foto.ratio} height={960} cx={835} top={900 + (1 - art) * 200} fadeFrom={0.64} filter="sepia(.16) saturate(1.1) contrast(1.05) drop-shadow(0 0 30px rgba(242,154,46,.35)) drop-shadow(0 30px 40px rgba(0,0,0,.6))" style={{ opacity: art }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(20,10,5,0) 70%, rgba(20,10,5,.9) 80%)" }} />
      <Saideira size={168} top={1080} delay={14} left={36} align="left" />
      <DaSemana top={1262} size={44} delay={26} left={80} align="left" />
      <Faixa n={n} cx={330} top={1318} w={580} delay={22} />
      <Selo n={n} x={930} y={300} d={190} delay={32} />
      <Canhoto n={n} x={50} y={1470} w={w - 100} h={150} delay={38} cta />
      <Grain opacity={0.16} />
      <Vignette strength={0.5} />
    </AbsoluteFill>
  );
};
