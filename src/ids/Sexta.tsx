import React from "react";
import { AbsoluteFill, OffthreadVideo, interpolate, staticFile, useCurrentFrame } from "remotion";
import { BIG, ARCHIVO } from "../fonts";
import { Cutout, Grain, Logo, Nota, Ticker, Vignette, clamp, useFade, useSpr } from "../shared/fx";
import { RingPx } from "../shared/Ring3D";
import { Formato, Noite, DIM, SUBESTILO } from "../data";

// SEXTA — "Placa de Esquina": preto + lima, tipografia de sinalização, placa de rua
const LIMA = "#C8D200";
const PRETO = "#0B0B09";
const OSSO = "#F2F0E6";

type L = {
  logoTop: number; logoW: number;
  titleTop: number; titleSize: number;
  tagX: number; tagY: number; tagSize: number;
  ringCx: number; ringCy: number; ringH: number;
  artH: number; artTop: number; artCx: number;
  plateX: number; plateY: number; plateW: number; nameSize: number;
  dateX: number; dateY: number;
  infoY: number; cta?: number;
};

const LAYOUT: Record<"feed" | "story", L> = {
  feed: {
    logoTop: 34, logoW: 210,
    titleTop: 108, titleSize: 345,
    tagX: 640, tagY: 350, tagSize: 36,
    ringCx: 548, ringCy: 560, ringH: 800,
    artH: 1320, artTop: 300, artCx: 540,
    plateX: 110, plateY: 1022, plateW: 860, nameSize: 150,
    dateX: 752, dateY: 930,
    infoY: 1228,
  },
  story: {
    logoTop: 214, logoW: 240,
    titleTop: 290, titleSize: 350,
    tagX: 650, tagY: 548, tagSize: 40,
    ringCx: 548, ringCy: 860, ringH: 930,
    artH: 1640, artTop: 520, artCx: 540,
    plateX: 90, plateY: 1352, plateW: 900, nameSize: 160,
    dateX: 752, dateY: 1256,
    infoY: 1580, cta: 1668,
  },
};

const Titulo: React.FC<{ size: number; top: number; delay: number }> = ({ size, top, delay }) => {
  const frame = useCurrentFrame();
  const letras = "SEXTA".split("");
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", justifyContent: "center", fontFamily: BIG, fontWeight: 900, fontSize: size, lineHeight: 0.78, color: OSSO, letterSpacing: "-0.01em" }}>
      {letras.map((l, i) => {
        const p = interpolate(frame - delay - i * 3, [0, 10], [0, 1], clamp);
        const y = interpolate(p, [0, 1], [-size * 0.9, 0]);
        return (
          <span key={i} style={{ display: "inline-block", transform: `translateY(${y}px)`, opacity: p, textShadow: "0 10px 40px rgba(0,0,0,.45)" }}>
            {l}
          </span>
        );
      })}
    </div>
  );
};

const Tag: React.FC<{ x: number; y: number; size: number; delay: number }> = ({ x, y, size, delay }) => {
  const s = useSpr(delay, { damping: 9 });
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `rotate(-6deg) scale(${s})`, transformOrigin: "left center", background: LIMA, color: PRETO, fontFamily: ARCHIVO, fontWeight: 900, fontStyle: "italic", fontSize: size, padding: "6px 18px 8px", letterSpacing: "0.02em", boxShadow: "0 12px 30px rgba(0,0,0,.45)" }}>
      DO BUTICA
    </div>
  );
};

// placa de rua: "NA ESQUINA COM / ARTISTA"
export const Placa: React.FC<{ x: number; y: number; w: number; nameSize: number; artista: string; delay: number; sweep?: boolean }> = ({ x, y, w, nameSize, artista, delay, sweep = true }) => {
  const frame = useCurrentFrame();
  const s = useSpr(delay, { damping: 7, stiffness: 90 });
  const rot = interpolate(s, [0, 1], [-100, 0]);
  const sw = sweep ? interpolate((frame - 70 + 1200) % 120, [0, 30], [-40, 140], clamp) : -60;
  const screw = (side: "left" | "right") => (
    <div style={{ position: "absolute", top: "50%", [side]: 22, width: 16, height: 16, marginTop: -8, borderRadius: 8, background: "radial-gradient(circle at 35% 35%, #fff 0 20%, #8d8f7a 60%, #3c3d33 100%)", boxShadow: "inset 0 0 0 1px rgba(0,0,0,.4)" }} />
  );
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, perspective: 1400 }}>
      <div style={{ transform: `rotate(-2deg) rotateX(${rot}deg)`, transformOrigin: "50% 0%", opacity: s > 0.01 ? 1 : 0 }}>
        <div style={{ position: "relative", background: LIMA, borderRadius: 22, padding: "22px 60px 18px", boxShadow: "0 26px 50px rgba(0,0,0,.6), inset 0 2px 0 rgba(255,255,255,.35), inset 0 -3px 0 rgba(0,0,0,.18)", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 10, border: `5px solid ${PRETO}`, borderRadius: 14 }} />
          {screw("left")}
          {screw("right")}
          <div style={{ fontFamily: ARCHIVO, fontWeight: 800, fontSize: nameSize * 0.19, letterSpacing: "0.34em", color: PRETO, textAlign: "center", marginTop: 6 }}>NA ESQUINA COM</div>
          <div style={{ fontFamily: BIG, fontWeight: 900, fontSize: nameSize, lineHeight: 0.86, color: PRETO, textAlign: "center", letterSpacing: "0.01em", whiteSpace: "nowrap" }}>{artista}</div>
          <div style={{ position: "absolute", top: 0, bottom: 0, left: `${sw}%`, width: "18%", background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.55), rgba(255,255,255,0))", transform: "skewX(-20deg)" }} />
        </div>
      </div>
    </div>
  );
};

const Data: React.FC<{ x: number; y: number; n: Noite; delay: number; scale?: number }> = ({ x, y, n, delay, scale = 1 }) => {
  const s = useSpr(delay, { damping: 11 });
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: Math.min(1, s * 3), transform: `translateX(${(1 - s) * 400}px) rotate(3deg) scale(${scale})`, transformOrigin: "left top", background: OSSO, color: PRETO, borderRadius: 12, padding: "10px 22px 12px", textAlign: "center", boxShadow: "0 16px 30px rgba(0,0,0,.5)", border: `4px solid ${PRETO}` }}>
      <div style={{ fontFamily: BIG, fontWeight: 900, fontSize: 78, lineHeight: 0.9 }}>
        {n.dia}.{n.mes}
      </div>
      <div style={{ fontFamily: ARCHIVO, fontWeight: 800, fontSize: 22, letterSpacing: "0.18em" }}>ÀS {n.hora}</div>
    </div>
  );
};

export const Info: React.FC<{ n: Noite; y: number; cta?: number; delay: number; align?: "center" | "left"; x?: number; size?: number; color?: string; accent?: string; font?: string; ctaColor?: string }> = ({
  n, y, cta, delay, align = "center", x = 0, size = 30, color = OSSO, accent = LIMA, font = ARCHIVO, ctaColor = PRETO,
}) => {
  const o = useFade(delay, delay + 14);
  return (
    <>
      <div style={{ position: "absolute", top: y, left: align === "center" ? 0 : x, right: align === "center" ? 0 : undefined, textAlign: align, opacity: o, transform: `translateY(${(1 - o) * 20}px)` }}>
        <div style={{ fontFamily: font, fontWeight: 800, fontSize: size, color, letterSpacing: "0.04em" }}>
          {n.lista[0]} <span style={{ color: accent }}>●</span> {n.lista[1]}
        </div>
        <div style={{ fontFamily: font, fontWeight: 500, fontSize: size * 0.64, color, opacity: 0.78, marginTop: 8, letterSpacing: "0.03em" }}>{n.obs}</div>
      </div>
      {cta !== undefined && (
        <div style={{ position: "absolute", top: cta, left: 0, right: 0, textAlign: "center", opacity: o }}>
          <span style={{ fontFamily: font, fontWeight: 800, fontSize: size * 0.8, color: ctaColor, background: accent, padding: "8px 20px", letterSpacing: "0.12em" }}>NOME NA LISTA: LINK NA BIO</span>
        </div>
      )}
    </>
  );
};

// estilo musical no canto: plaquinha preta com borda lima
const Estilo: React.FC<{ n: Noite; x: number; y: number; delay: number; size?: number }> = ({ n, x, y, delay, size = 26 }) => {
  const s = useSpr(delay, { damping: 12 });
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translateX(${(1 - s) * -320}px)`, opacity: Math.min(1, s * 3), display: "flex", alignItems: "center", gap: 10, background: PRETO, border: `3px solid ${LIMA}`, borderRadius: 10, padding: "7px 16px 7px 11px", boxShadow: "0 10px 24px rgba(0,0,0,.5)" }}>
      <Nota size={size * 1.05} color={LIMA} />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontFamily: BIG, fontWeight: 900, fontSize: size * 1.3, lineHeight: 1, color: LIMA, letterSpacing: "0.06em" }}>{n.estilo}</span>
        <span style={{ fontFamily: ARCHIVO, fontWeight: 700, fontSize: size * 0.56, lineHeight: 1.1, color: OSSO, opacity: 0.72, letterSpacing: "0.03em", marginTop: 2 }}>{SUBESTILO}</span>
      </div>
    </div>
  );
};

const Fundo: React.FC<{ cx: number; cy: number }> = ({ cx, cy }) => (
  <>
    <AbsoluteFill style={{ background: PRETO }} />
    <AbsoluteFill style={{ background: `radial-gradient(circle at ${cx}px ${cy}px, rgba(200,210,0,.22) 0%, rgba(200,210,0,0) 48%)` }} />
    <AbsoluteFill
      style={{
        backgroundImage: "radial-gradient(circle, rgba(200,210,0,.55) 1.7px, transparent 2.3px)",
        backgroundSize: "15px 15px",
        WebkitMaskImage: `radial-gradient(circle at ${cx}px ${cy}px, rgba(0,0,0,.9) 0%, rgba(0,0,0,0) 55%)`,
        opacity: 0.35,
      }}
    />
  </>
);

const Slogan: React.FC<{ h: number }> = ({ h }) => (
  <div style={{ position: "absolute", top: h / 2 - 12, right: -h / 2 + 34, width: h, transform: "rotate(90deg)", textAlign: "center", fontFamily: ARCHIVO, fontWeight: 800, fontSize: 17, letterSpacing: "0.5em", color: LIMA, opacity: 0.8 }}>
    TE VEJO NA ESQUINA ● #NÃOTEMERRO
  </div>
);

const useRingMotion = () => {
  const frame = useCurrentFrame();
  const inn = useSpr(0, { damping: 16, stiffness: 70 });
  return {
    rotY: interpolate(inn, [0, 1], [1.5, 0.22]) + Math.sin(frame / 38) * 0.08,
    rotX: Math.sin(frame / 55) * 0.05,
    grow: interpolate(inn, [0, 1], [0.55, 1]),
  };
};

export const Sexta: React.FC<{ n: Noite; fmt: Formato }> = ({ n, fmt }) => {
  if (fmt === "broll") return <SextaBroll n={n} />;
  return <SextaFlyer n={n} fmt={fmt} />;
};

const SextaFlyer: React.FC<{ n: Noite; fmt: "feed" | "story" }> = ({ n, fmt }) => {
  const L = LAYOUT[fmt];
  const { w, h } = DIM[fmt];
  const frame = useCurrentFrame();
  const r = useRingMotion();
  const art = useSpr(12, { damping: 15 });
  const push = interpolate(frame, [0, 240], [1, 1.035], clamp);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Fundo cx={L.ringCx} cy={L.ringCy} />
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        <RingPx width={w} height={h} look="lima" flat cx={L.ringCx} cy={L.ringCy} ringH={L.ringH * r.grow} rotY={r.rotY} rotX={r.rotX} envIntensity={0.9} />
        <Titulo size={L.titleSize} top={L.titleTop} delay={6} />
        <Cutout src={n.foto.src} ratio={n.foto.ratio} height={L.artH} cx={L.artCx} top={L.artTop + (1 - art) * 220} fadeFrom={0.62} filter="drop-shadow(0 30px 50px rgba(0,0,0,.55)) contrast(1.04)" style={{ opacity: art }} />
      </AbsoluteFill>
      <Tag x={L.tagX} y={L.tagY} size={L.tagSize} delay={26} />
      <Logo width={L.logoW} top={L.logoTop} />
      <Estilo n={n} x={fmt === "feed" ? 28 : 46} y={fmt === "feed" ? 20 : 200} delay={34} size={fmt === "feed" ? 27 : 32} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(11,11,9,0) 72%, rgba(11,11,9,.92) 88%)" }} />
      <Placa x={L.plateX} y={L.plateY} w={L.plateW} nameSize={L.nameSize} artista={n.artista} delay={30} />
      <Data x={L.dateX} y={L.dateY} n={n} delay={40} />
      <Info n={n} y={L.infoY} cta={L.cta} delay={46} />
      <Slogan h={h} />
      <Grain opacity={0.14} />
      <Vignette strength={0.5} />
    </AbsoluteFill>
  );
};

// STORY com B-roll: vídeo do artista em cima, flyer embaixo; o recorte "sai" do flyer pra dentro do vídeo
const SextaBroll: React.FC<{ n: Noite }> = ({ n }) => {
  const { w, h } = DIM.broll;
  const r = useRingMotion();
  const art = useSpr(8, { damping: 15 });
  const vid = useFade(0, 10);
  const tit = useFade(10, 22);
  const VH = 1000;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Fundo cx={830} cy={1330} />
      <div style={{ position: "absolute", left: 0, top: 0, width: w, height: VH, overflow: "hidden", opacity: vid }}>
        <OffthreadVideo src={staticFile(n.clip)} style={{ width: w, height: 1920, objectFit: "cover", marginTop: -110, filter: "contrast(1.06) saturate(1.05)" }} volume={(f) => interpolate(f, [0, 8, 285, 300], [0, 1, 1, 0], clamp)} />
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,0) 26%, rgba(0,0,0,0) 80%, rgba(11,11,9,.85) 100%)" }} />
      </div>
      <Logo width={240} top={214} />
      <Estilo n={n} x={40} y={204} delay={14} size={33} />
      <RingPx width={w} height={h} look="lima" flat cx={830} cy={1330} ringH={580 * r.grow} rotY={r.rotY} rotX={r.rotX} envIntensity={0.9} />
      <Ticker text={`  ${n.noite.toUpperCase()}  ●  ${n.artista}  ●  ${n.dia}.${n.mes}  ●  ${n.hora}  ●  TE VEJO NA ESQUINA  ●`} top={VH - 34} height={68} bg={LIMA} color={PRETO} font={BIG} size={46} speed={3.2} rotate={-2} />
      <Cutout src={n.foto.src} ratio={n.foto.ratio} height={1060} cx={840} top={905 + (1 - art) * 200} fadeFrom={0.7} filter="drop-shadow(0 30px 50px rgba(0,0,0,.6)) contrast(1.04)" style={{ opacity: art }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(11,11,9,0) 76%, rgba(11,11,9,.96) 83%)" }} />
      <div style={{ position: "absolute", left: 50, top: 1086, fontFamily: BIG, fontWeight: 900, fontSize: 182, lineHeight: 0.8, color: OSSO, opacity: tit, textShadow: "0 10px 30px rgba(0,0,0,.6)" }}>SEXTA</div>
      <Tag x={54} y={1248} size={32} delay={20} />
      <Data x={318} y={1226} n={n} delay={28} scale={0.7} />
      <Placa x={34} y={1392} w={720} nameSize={118} artista={n.artista} delay={24} />
      <Info n={n} y={1590} cta={1672} delay={36} size={24} />
      <Grain opacity={0.14} />
      <Vignette strength={0.4} />
    </AbsoluteFill>
  );
};
