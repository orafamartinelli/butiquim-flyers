import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame } from "remotion";
import { YELLOWTAIL, MONOTON, BARLOW, ARCHIVO } from "../fonts";
import { Grain, Logo, Nota, Vignette, clamp, useFade, useSpr } from "../shared/fx";
import { Ico, Icone, rnd } from "../shared/icones";
import { O_PATH } from "../shared/oPath";
import { DIM, Formato, Noite, SUBESTILO } from "../data";

// SAIDEIRA B — "Letreiro Neon": parede de tijolo, néons acendendo um a um (o "O" do logo vira néon)
const ROSA = "#FF3EA5";
const AZUL = "#36C9FF";
const AMBAR = "#FFB23E";
const QUENTE = "#FFF1DC";
const LIMA = "#D4E83A";

const glow = (c: string, k = 1) => `drop-shadow(0 0 ${2 * k}px ${c}) drop-shadow(0 0 ${8 * k}px ${c}) drop-shadow(0 0 ${22 * k}px ${c})`;

// néon: apagado até acender, pisca ao ligar e dá uma falhada de vez em quando
const useNeon = (liga: number, seed: number) => {
  const frame = useCurrentFrame();
  if (frame < liga) return 0.08;
  const t = frame - liga;
  if (t < 10) return rnd(seed * 17 + t) > 0.45 ? 1 : 0.15;
  const ciclo = (frame + Math.floor(rnd(seed) * 90)) % 110;
  if (ciclo < 3 && rnd(seed + frame) > 0.3) return 0.35;
  return 1;
};

const Parede: React.FC<{ glows: { x: number; y: number; c: string; r: number }[] }> = ({ glows }) => (
  <>
    <AbsoluteFill>
      <svg width="100%" height="100%">
        <defs>
          <pattern id="tijolo" width="210" height="84" patternUnits="userSpaceOnUse">
            <rect width="210" height="84" fill="#26121a" />
            <rect x="3" y="3" width="99" height="36" fill="#2d161e" />
            <rect x="108" y="3" width="99" height="36" fill="#29141b" />
            <rect x="-52" y="45" width="99" height="36" fill="#2b151d" />
            <rect x="55" y="45" width="99" height="36" fill="#301820" />
            <rect x="160" y="45" width="99" height="36" fill="#28131a" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#tijolo)" />
      </svg>
    </AbsoluteFill>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(10,4,8,.05) 0%, rgba(10,4,8,.7) 80%)" }} />
    {glows.map((g, i) => (
      <AbsoluteFill key={i} style={{ background: `radial-gradient(circle at ${g.x}px ${g.y}px, ${g.c}55 0%, ${g.c}00 ${g.r}px)`, mixBlendMode: "screen" }} />
    ))}
  </>
);

// o "O" oficial desenhado em néon lima
const ONeon: React.FC<{ cx: number; cy: number; w: number; liga: number }> = ({ cx, cy, w, liga }) => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame - liga, [0, 22], [0, 1], clamp);
  const on = useNeon(liga + 22, 3);
  const h = w * (1671 / 2000);
  return (
    <svg width={w} height={h} viewBox="0 0 2000 1671" style={{ position: "absolute", left: cx - w / 2, top: cy - h / 2, overflow: "visible", filter: glow(LIMA, 1.2), opacity: Math.max(on, draw > 0 && draw < 1 ? 1 : 0.08) }}>
      <path d={O_PATH} fill="none" stroke="#F4FFB0" strokeWidth={22} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
    </svg>
  );
};

const IconeNeon: React.FC<{ i: Icone; x: number; y: number; size: number; cor: string; liga: number; seed: number; rot?: number }> = ({ i, x, y, size, cor, liga, seed, rot = 0 }) => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame - liga, [0, 16], [0, 1], clamp);
  const on = useNeon(liga + 16, seed);
  return (
    <div style={{ position: "absolute", left: x - size / 2, top: y - size / 2, transform: `rotate(${rot + Math.sin(frame / 40 + seed) * 2}deg)`, opacity: Math.max(on, draw > 0 && draw < 1 ? 1 : 0.08) }}>
      <Ico i={i} size={size} color="#FFFFFF" stroke={1.1} glow={cor} draw={draw} />
    </div>
  );
};

const SaideiraNeon: React.FC<{ cx: number; y: number; size: number; liga: number }> = ({ cx, y, size, liga }) => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame - liga, [0, 30], [0, 1], clamp);
  const on = useNeon(liga + 30, 7);
  const W = size * 4.2;
  return (
    <svg width={W} height={size * 1.3} style={{ position: "absolute", left: cx - W / 2, top: y, overflow: "visible", filter: glow(LIMA, 1.3), opacity: Math.max(on, draw > 0 && draw < 1 ? 1 : 0.1) }}>
      <text x={W / 2} y={size} textAnchor="middle" fontFamily={YELLOWTAIL} fontSize={size} fill="rgba(212,232,58,.16)" stroke="#F6FFC2" strokeWidth={size * 0.028} strokeDasharray={size * 6} strokeDashoffset={size * 6 * (1 - draw)} strokeLinejoin="round">
        Saideira
      </text>
    </svg>
  );
};

const DaSemana: React.FC<{ cx: number; y: number; size: number; liga: number }> = ({ cx, y, size, liga }) => {
  const on = useNeon(liga, 11);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, textAlign: "center", fontFamily: MONOTON, fontSize: size, color: "#F6FFC2", letterSpacing: "0.08em", filter: glow(LIMA, 1), opacity: on, transform: `translateX(${cx - 540}px)` }}>DA SEMANA</div>
  );
};

const Nomes: React.FC<{ n: Noite; cx: number; y: number; size: number; liga: number }> = ({ n, cx, y, size, liga }) => {
  const frame = useCurrentFrame();
  const on = useNeon(liga, 19);
  const letras = n.artista.split("");
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center", transform: `translateX(${cx - 540}px)`, filter: glow(AMBAR, 0.9), opacity: on }}>
      {letras.map((c, i) => {
        const p = interpolate(frame - liga - i * 1.5, [0, 6], [0, 1], clamp);
        return (
          <span key={i} style={{ fontFamily: BARLOW, fontWeight: 800, fontSize: size, color: QUENTE, letterSpacing: "0.06em", opacity: p, whiteSpace: "pre" }}>
            {c}
          </span>
        );
      })}
    </div>
  );
};

// placa néon com a data
const Data: React.FC<{ n: Noite; x: number; y: number; w: number; h: number; liga: number }> = ({ n, x, y, w, h, liga }) => {
  const on = useNeon(liga, 23);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 18, border: `4px solid #D8F4FF`, filter: glow(AZUL, 1), opacity: on, display: "flex", alignItems: "center", justifyContent: "center", gap: 14, color: "#D8F4FF" }}>
      <div style={{ fontFamily: BARLOW, fontWeight: 700, fontSize: h * 0.22, letterSpacing: "0.18em", writingMode: "vertical-rl", transform: "rotate(180deg)" }}>{n.diaSemana.slice(0, 3)}</div>
      <div style={{ fontFamily: BARLOW, fontWeight: 800, fontSize: h * 0.62, lineHeight: 1 }}>{n.dia}.10</div>
      <div style={{ width: 3, alignSelf: "stretch", margin: `${h * 0.2}px 0`, background: "#D8F4FF" }} />
      <div style={{ fontFamily: BARLOW, fontWeight: 800, fontSize: h * 0.4, lineHeight: 1 }}>{n.hora}</div>
    </div>
  );
};

const Lista: React.FC<{ n: Noite; x: number; y: number; w: number; size: number; delay: number; cta?: boolean }> = ({ n, x, y, w, size, delay, cta }) => {
  const o = useFade(delay, delay + 14);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, opacity: o, color: QUENTE, fontFamily: ARCHIVO }}>
      <div style={{ fontWeight: 800, fontSize: size, lineHeight: 1.3 }}>{n.lista[0]}</div>
      <div style={{ fontWeight: 800, fontSize: size, lineHeight: 1.3 }}>{n.lista[1]}</div>
      <div style={{ fontWeight: 500, fontSize: size * 0.62, opacity: 0.75, marginTop: 6, lineHeight: 1.3 }}>{n.obs}</div>
      {cta && <div style={{ fontWeight: 800, fontSize: size * 0.72, marginTop: 10, color: ROSA, letterSpacing: "0.1em", filter: glow(ROSA, 0.5) }}>NOME NA LISTA: LINK NA BIO</div>}
    </div>
  );
};

const Estilo: React.FC<{ n: Noite; x: number; y: number; liga: number; size?: number }> = ({ n, x, y, liga, size = 24 }) => {
  const on = useNeon(liga, 29);
  return (
    <div style={{ position: "absolute", left: x, top: y, display: "flex", alignItems: "center", gap: 10, padding: "8px 18px 9px 12px", borderRadius: 12, border: `3px solid #FFE1F1`, filter: glow(ROSA, 0.8), opacity: on, color: "#FFE1F1" }}>
      <Nota size={size * 1.1} color="#FFE1F1" />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontFamily: BARLOW, fontWeight: 800, fontSize: size * 1.25, lineHeight: 1, letterSpacing: "0.1em" }}>{n.estilo}</span>
        <span style={{ fontFamily: ARCHIVO, fontWeight: 600, fontSize: size * 0.56, lineHeight: 1.15, opacity: 0.85, marginTop: 2 }}>{SUBESTILO}</span>
      </div>
    </div>
  );
};

const Dupla: React.FC<{ n: Noite; cx: number; bottom: number; w: number; delay: number }> = ({ n, cx, bottom, w, delay }) => {
  const s = useSpr(delay, { damping: 16 });
  const h = w / n.foto.ratio;
  const mask = "linear-gradient(180deg, #000 70%, transparent 98%)";
  return (
    <Img src={staticFile(n.foto.src)} style={{ position: "absolute", width: w, height: h, left: cx - w / 2, top: bottom - h + (1 - s) * 120, opacity: s, WebkitMaskImage: mask, maskImage: mask, filter: `drop-shadow(-10px 0 18px rgba(255,62,165,.55)) drop-shadow(10px 0 18px rgba(54,201,255,.5)) contrast(1.06) brightness(.95)` }} />
  );
};

export const DomingoB: React.FC<{ n: Noite; fmt: Formato }> = ({ n, fmt }) => {
  if (fmt === "broll") return <DomingoBBroll n={n} />;
  const feed = fmt === "feed";
  const Y = feed ? 0 : 250;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Parede glows={[{ x: 540, y: Y + 330, c: LIMA, r: 420 }, { x: 540, y: Y + 960, c: LIMA, r: 520 }, { x: 150, y: Y + 300, c: AMBAR, r: 260 }, { x: 930, y: Y + 320, c: AZUL, r: 260 }]} />
      <ONeon cx={540} cy={Y + 330} w={feed ? 520 : 600} liga={4} />
      <IconeNeon i="chapeu" x={150} y={Y + 260} size={feed ? 150 : 170} cor={AMBAR} liga={20} seed={1} rot={-10} />
      <IconeNeon i="violao" x={935} y={Y + 300} size={feed ? 160 : 180} cor={AZUL} liga={28} seed={2} rot={12} />
      <IconeNeon i="chope" x={120} y={Y + 640} size={feed ? 120 : 140} cor={AMBAR} liga={36} seed={3} rot={-6} />
      <IconeNeon i="notas" x={955} y={Y + 650} size={feed ? 120 : 140} cor={ROSA} liga={42} seed={4} rot={8} />
      <Dupla n={n} cx={540} bottom={Y + (feed ? 960 : 1130)} w={feed ? 820 : 960} delay={10} />
      <SaideiraNeon cx={540} y={Y + (feed ? 760 : 900)} size={feed ? 220 : 250} liga={30} />
      <DaSemana cx={540} y={Y + (feed ? 1030 : 1210)} size={feed ? 40 : 46} liga={62} />
      <Nomes n={n} cx={540} y={Y + (feed ? 1090 : 1280)} size={feed ? 50 : 58} liga={56} />
      <Data n={n} x={feed ? 50 : 60} y={Y + (feed ? 1180 : 1390)} w={feed ? 360 : 400} h={feed ? 120 : 130} liga={70} />
      <Lista n={n} x={feed ? 440 : 500} y={Y + (feed ? 1180 : 1386)} w={feed ? 600 : 540} size={feed ? 25 : 26} delay={72} cta={!feed} />
      <Logo width={feed ? 210 : 240} top={feed ? 34 : 214} />
      <Estilo n={n} x={feed ? 26 : 44} y={feed ? 20 : 196} liga={14} size={feed ? 23 : 26} />
      <Grain opacity={0.12} />
      <Vignette strength={0.5} />
    </AbsoluteFill>
  );
};

// STORY com B-roll: o show numa moldura de néon; o letreiro fica embaixo
const DomingoBBroll: React.FC<{ n: Noite }> = ({ n }) => {
  const vid = useFade(0, 10);
  const moldura = useNeon(6, 31);
  const MX = 70, MY = 180, MW = 940, MH = 820;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Parede glows={[{ x: 540, y: 600, c: ROSA, r: 600 }, { x: 540, y: 1400, c: AZUL, r: 500 }, { x: 540, y: 1250, c: LIMA, r: 300 }]} />
      <div style={{ position: "absolute", left: MX, top: MY, width: MW, height: MH, borderRadius: 30, overflow: "hidden", opacity: vid }}>
        <OffthreadVideo src={staticFile(n.clip)} style={{ width: MW, height: MW * (1920 / 1080), objectFit: "cover", marginTop: -330, filter: "contrast(1.05) saturate(1.1)" }} volume={(f) => interpolate(f, [0, 8, 285, 300], [0, 1, 1, 0], clamp)} />
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,4,8,.55) 0%, rgba(10,4,8,0) 24%)" }} />
      </div>
      <div style={{ position: "absolute", left: MX - 10, top: MY - 10, width: MW + 20, height: MH + 20, borderRadius: 38, border: "5px solid #FFE1F1", filter: glow(ROSA, 1.2), opacity: moldura }} />
      <Logo width={240} top={214} />
      <Estilo n={n} x={90} y={200} liga={10} size={24} />
      <ONeon cx={250} cy={1150} w={300} liga={8} />
      <Dupla n={n} cx={790} bottom={1440} w={560} delay={10} />
      <IconeNeon i="chapeu" x={110} y={1330} size={110} cor={AMBAR} liga={24} seed={1} rot={-10} />
      <IconeNeon i="notas" x={420} y={1330} size={96} cor={AZUL} liga={34} seed={4} rot={8} />
      <SaideiraNeon cx={540} y={1300} size={200} liga={20} />
      <DaSemana cx={540} y={1482} size={34} liga={44} />
      <Nomes n={n} cx={540} y={1530} size={48} liga={48} />
      <Data n={n} x={60} y={1610} w={340} h={112} liga={58} />
      <Lista n={n} x={440} y={1602} w={600} size={23} delay={60} cta />
      <Grain opacity={0.12} />
      <Vignette strength={0.45} />
    </AbsoluteFill>
  );
};
