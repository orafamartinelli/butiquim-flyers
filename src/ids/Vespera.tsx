import React from "react";
import { AbsoluteFill, Easing, Img, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ANTON, ARCHIVO, BARLOW } from "../fonts";
import { Grain, Logo, Nota, Ticker, Vignette, clamp, useFade, useSpr } from "../shared/fx";
import { RingPx } from "../shared/Ring3D";
import { rnd } from "../shared/icones";
import { O_PATH } from "../shared/oPath";
import { DIM, Formato, Noite, SUBESTILO, feriadoSeguinte } from "../data";

// VÉSPERA DE FERIADO — "Folhinha": a folhinha de parede do Butiquim, pendurada no "O" 3D.
// A página de DOMINGO 11 é arrancada e revela a SEGUNDA 12 em lima (circulada com o "O" do logo e carimbada FERIADO);
// a página arrancada cai e vira o cartão da data. Confete de "O"s e o despertador de segunda sendo desligado.
const LIMA = "#C8D200";
const LIMA_CLARO = "#E2EC3C";
const NOITE = "#0A0B07";
const PAPEL = "#F3EFE2";
const PAPEL_ESC = "#D9D2BE";
const TINTA = "#141510";

// linha do tempo (quadros): tudo entra até ~90; o estático é o quadro 150
const T = { pad: 0, titulo: 4, dupla: 8, estilo: 14, puxa: 28, rasga: 38, fita: 50, carimbo: 54, nome: 56, circulo: 62, lista: 64, alarme: 80 };
const PUXA = 9; // graus que a página gira (presa pelo canto) antes de soltar

const SEMANA = ["DOMINGO", "SEGUNDA-FEIRA", "TERÇA-FEIRA", "QUARTA-FEIRA", "QUINTA-FEIRA", "SEXTA-FEIRA", "SÁBADO"];
const MESES = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];

type Fer = { dia: string; semana: string; mes: string; ano: number; nome: string; hojeSemana: string; hojeMes: string };

// o dia seguinte (feriado) e o próprio dia da noite, para as duas páginas da folhinha
const feriadoDe = (n: Noite): Fer => {
  const f = feriadoSeguinte(n.data);
  const hoje = new Date(`${n.data}T12:00:00Z`);
  const d = new Date(hoje);
  d.setUTCDate(d.getUTCDate() + 1);
  return {
    dia: String(d.getUTCDate()).padStart(2, "0"),
    semana: SEMANA[d.getUTCDay()],
    mes: MESES[d.getUTCMonth()],
    ano: d.getUTCFullYear(),
    nome: f?.nome ?? "",
    hojeSemana: SEMANA[hoje.getUTCDay()],
    hojeMes: MESES[hoje.getUTCMonth()],
  };
};

const rotPt = (x: number, y: number, deg: number): [number, number] => {
  const r = (deg * Math.PI) / 180;
  return [x * Math.cos(r) - y * Math.sin(r), x * Math.sin(r) + y * Math.cos(r)];
};

// borda serrilhada (picote rasgado), em px a partir da borda
const serrilha = (seed: number, n: number, amp: number) => Array.from({ length: n + 1 }, (_, i) => [(i / n) * 100, 2 + rnd(seed + i * 1.7) * amp] as const);

// ---------------------------------------------------------------- fundo, filtros, confete

const Filtros: React.FC<{ uid: string }> = ({ uid }) => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    <filter id={`tinta-${uid}`}>
      <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves={2} seed={4} result="r" />
      <feColorMatrix in="r" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -4.2 3" result="m" />
      <feComposite in="SourceGraphic" in2="m" operator="in" />
    </filter>
  </svg>
);

const Fundo: React.FC<{ gx: number; gy: number }> = ({ gx, gy }) => (
  <>
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 55% at ${gx}px ${gy}px, #2B3006 0%, #151806 45%, ${NOITE} 100%)` }} />
    <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(243,239,226,.05) 1.2px, transparent 1.4px)", backgroundSize: "26px 26px" }} />
  </>
);

// o "O" do logo, chapado (confete e círculo de caneta)
const OChapado: React.FC<{ w: number; h: number; color: string; style?: React.CSSProperties }> = ({ w, h, color, style }) => (
  <svg width={w} height={h} viewBox="233 117 1614 1395" preserveAspectRatio="none" style={{ display: "block", overflow: "visible", ...style }}>
    <path d={O_PATH} fill={color} fillRule="evenodd" />
  </svg>
);

const CORES = [LIMA, PAPEL, "#FFFFFF", LIMA_CLARO, LIMA];

// estouro de confete no instante do rasgo
const Confete: React.FC<{ ox: number; oy: number; t0: number; qtd: number; seed: number; h: number; forca?: number }> = ({ ox, oy, t0, qtd, seed, h, forca = 1 }) => {
  const frame = useCurrentFrame();
  const t = frame - t0;
  if (t < 0) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: qtd }, (_, i) => {
        const r = (k: number) => rnd(seed * 100 + i * 7 + k);
        const tau = 8 + r(1) * 6;
        const vx = (r(2) - 0.5) * 60 * forca;
        const vy = -(8 + r(3) * 22) * forca;
        const vt = 6 + r(4) * 4;
        const e = 1 - Math.exp(-t / tau);
        const x = ox + vx * tau * e + Math.sin(t / 7 + i) * 12 * Math.min(1, t / 18);
        const y = oy + (vy - vt) * tau * e + vt * t;
        if (y > h + 60 || t > 106) return null;
        const rot = r(5) * 360 + t * (r(6) - 0.5) * 22;
        const flip = Math.cos(t / (3 + r(7) * 4) + i);
        const cor = CORES[i % CORES.length];
        const tipo = i % 4;
        const s = 0.8 + r(8) * 0.7;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, opacity: interpolate(t, [80, 106], [1, 0], clamp), transform: `rotate(${rot}deg) scaleY(${flip})` }}>
            {tipo === 0 ? <OChapado w={30 * s} h={26 * s} color={cor} /> : <div style={{ width: (tipo === 1 ? 22 : 13) * s, height: (tipo === 1 ? 6 : 9) * s, background: cor, borderRadius: 1 }} />}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// garoa de confete depois da festa (contínua, atrás de tudo)
const Garoa: React.FC<{ w: number; h: number; qtd: number; seed: number; t0: number }> = ({ w, h, qtd, seed, t0 }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [t0, t0 + 24], [0, 0.75], clamp);
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{ opacity: o, pointerEvents: "none" }}>
      {Array.from({ length: qtd }, (_, i) => {
        const r = (k: number) => rnd(seed * 50 + i * 5 + k);
        const v = 1.3 + r(1) * 1.5;
        const y = ((frame * v + r(2) * (h + 120)) % (h + 120)) - 60;
        const x = r(3) * w + Math.sin(frame / 22 + i) * 18;
        const rot = r(4) * 360 + frame * (r(5) - 0.5) * 8;
        const flip = Math.cos(frame / (5 + r(6) * 5) + i);
        const cor = CORES[i % CORES.length];
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, transform: `rotate(${rot}deg) scaleY(${flip})` }}>
            {i % 3 === 0 ? <OChapado w={22} h={19} color={cor} /> : <div style={{ width: 14, height: 7, background: cor, borderRadius: 1 }} />}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- a folhinha

type PadL = { nx: number; ny: number; w: number; ph: number; rot: number; ringH: number };

const geo = (p: PadL) => {
  const hTop = p.ringH * 0.56;
  const hh = Math.round(p.w * 0.15);
  const pTop = hTop + hh;
  return { hTop, hh, pTop };
};

// ângulo da folhinha: balança ao chegar, dá um tranco no rasgo e fica respirando
const anguloPad = (f: number, rot: number) => {
  const ent = f < 0 ? 0 : 5 * Math.exp(-f / 12) * Math.sin(f / 3.4);
  const puxa = interpolate(f, [T.puxa, T.rasga], [0, 2.5], clamp) * (f < T.rasga ? 1 : 0);
  const t = f - T.rasga;
  const tranco = t < 0 ? 0 : 8 * Math.exp(-t / 15) * Math.sin(t / 4.2 + 0.4);
  return rot + ent + puxa + tranco + Math.sin(f / 38) * 0.6;
};

// página de hoje (DOMINGO 11): o que a folhinha mostra antes do rasgo — depois vira o cartão da data
const PaginaHoje: React.FC<{ n: Noite; fer: Fer; w: number; h: number; rasgada?: boolean }> = ({ n, fer, w, h, rasgada }) => {
  const dentes = serrilha(3, 26, 9);
  const clip = rasgada ? `polygon(${dentes.map(([x, y]) => `${x}% ${y}px`).join(", ")}, 100% 100%, 0% 100%)` : undefined;
  const faixa = h * 0.13;
  return (
    <div style={{ position: "absolute", inset: 0, background: `linear-gradient(172deg, #FFFCF3 0%, ${PAPEL} 55%, #E6DFCB 100%)`, clipPath: clip, borderRadius: "0 0 6px 6px", overflow: "hidden", color: TINTA }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: faixa, background: TINTA, display: "flex", alignItems: "center", justifyContent: "center", paddingTop: rasgada ? 6 : 0 }}>
        <span style={{ fontFamily: BARLOW, fontWeight: 800, fontSize: faixa * 0.56, letterSpacing: "0.22em", paddingLeft: "0.22em", color: PAPEL }}>{fer.hojeSemana}</span>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.11, textAlign: "center", fontFamily: ANTON, fontSize: h * 0.56, lineHeight: 1.1, letterSpacing: "-0.01em" }}>{n.dia}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.73, textAlign: "center", fontFamily: BARLOW, fontWeight: 800, fontSize: h * 0.058, letterSpacing: "0.26em", paddingLeft: "0.26em", opacity: 0.75 }}>
        {fer.hojeMes} · {fer.ano}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: h * 0.16, background: TINTA, display: "flex", alignItems: "center", justifyContent: "center", gap: h * 0.03 }}>
        <span style={{ fontFamily: BARLOW, fontWeight: 800, fontSize: h * 0.06, letterSpacing: "0.18em", color: PAPEL }}>ÀS</span>
        <span style={{ fontFamily: ANTON, fontSize: h * 0.105, color: LIMA, letterSpacing: "0.02em" }}>{n.hora}</span>
      </div>
    </div>
  );
};

// círculo de caneta em volta do dia: o "O" do logo sendo desenhado
const Circulo: React.FC<{ cx: number; cy: number; w: number; h: number; t0: number }> = ({ cx, cy, w, h, t0 }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - t0, [0, 16], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  if (p <= 0) return null;
  const m = `conic-gradient(from 290deg at 50% 50%, #000 ${p * 360}deg, transparent ${p * 360 + 0.5}deg)`;
  return (
    <div style={{ position: "absolute", left: cx - w / 2, top: cy - h / 2, width: w, height: h, WebkitMaskImage: m, maskImage: m, transform: "rotate(-6deg)" }}>
      <OChapado w={w} h={h} color={TINTA} style={{ opacity: 0.93 }} />
    </div>
  );
};

// carimbo FERIADO batendo na página
const Carimbo: React.FC<{ cx: number; cy: number; size: number; t0: number; uid: string; texto: string }> = ({ cx, cy, size, t0, uid, texto }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < t0) return null;
  const s = spring({ frame: frame - t0, fps, config: { damping: 11, stiffness: 220, mass: 0.6 } });
  const sc = interpolate(s, [0, 1], [2.4, 1]);
  return (
    <div style={{ position: "absolute", left: cx, top: cy, transform: `translate(-50%, -50%) rotate(-9deg) scale(${sc})`, opacity: Math.min(1, s * 2.5) }}>
      <div style={{ filter: `url(#tinta-${uid})`, border: `${size * 0.075}px solid ${TINTA}`, borderRadius: size * 0.14, padding: `${size * 0.02}px ${size * 0.2}px ${size * 0.04}px`, outline: `${size * 0.035}px solid ${TINTA}`, outlineOffset: -size * 0.16, fontFamily: ANTON, fontSize: size, lineHeight: 1.12, letterSpacing: "0.06em", color: TINTA, whiteSpace: "nowrap" }}>
        {texto}
      </div>
    </div>
  );
};

// página do feriado (SEGUNDA 12): o dia lima da folhinha
const PaginaFeriado: React.FC<{ fer: Fer; w: number; h: number; uid: string }> = ({ fer, w, h, uid }) => {
  // o "12" (Anton) ocupa de 0,125 a 0,97 do corpo: centro em top + 0,55·F
  const F = h * 0.44;
  const cy = h * 0.435;
  const OW = w * 0.9;
  return (
    <div style={{ position: "absolute", inset: 0, color: TINTA }}>
      <div style={{ position: "absolute", top: h * 0.045, left: 0, right: 0, textAlign: "center", fontFamily: BARLOW, fontWeight: 800, fontSize: w * 0.072, letterSpacing: "0.14em", paddingLeft: "0.14em" }}>{fer.semana}</div>
      {/* o furo do "O" fica um pouco à direita do centro do desenho; o número fica por cima */}
      <Circulo cx={w * 0.5 - OW * 0.06} cy={cy + h * 0.005} w={OW} h={h * 0.56} t0={T.circulo} />
      <div style={{ position: "absolute", top: cy - F * 0.55, left: w * 0.03, right: 0, textAlign: "center", fontFamily: ANTON, fontSize: F, lineHeight: 1.1, letterSpacing: "-0.01em", textShadow: `0 0 0 ${LIMA}, 3px 0 0 ${LIMA}, -3px 0 0 ${LIMA}` }}>{fer.dia}</div>
      <Carimbo cx={w * 0.5} cy={h * 0.79} size={h * 0.12} t0={T.carimbo} uid={uid} texto="FERIADO" />
      <div style={{ position: "absolute", bottom: h * 0.028, left: 0, right: 0, textAlign: "center", fontFamily: BARLOW, fontWeight: 700, fontSize: w * 0.04, letterSpacing: "0.12em", opacity: 0.7 }}>{fer.nome.toUpperCase()}</div>
    </div>
  );
};

// a folhinha inteira: prego, argola ("O" 3D), cabeçalho, bloco de páginas
const Folhinha: React.FC<{ n: Noite; fer: Fer; p: PadL; uid: string; deLado?: boolean }> = ({ n, fer, p, uid, deLado }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const g = geo(p);
  const drop = spring({ frame: frame - T.pad, fps, config: { damping: 14, stiffness: 70 } });
  const ang = anguloPad(frame, p.rot);
  const rasgou = frame >= T.rasga;
  const puxa = interpolate(frame, [T.puxa, T.rasga], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const rc = p.ringH * 2;
  const rebarba = serrilha(3, 26, 9);
  const oRot = Math.sin(frame / 30) * 0.12;
  return (
    // entra caindo do alto (feed/story) ou deslizando pela direita (B-roll, pra não passar por cima do vídeo)
    <div style={{ position: "absolute", left: p.nx, top: p.ny, width: 0, height: 0, transform: deLado ? `translateX(${(1 - drop) * 560}px) rotate(${ang}deg)` : `translateY(${(1 - drop) * -(p.ny + p.ph + 500)}px) rotate(${ang}deg)`, transformOrigin: "0 0" }}>
      {/* argola: o "O" 3D do logo pendurando a folhinha no prego */}
      <RingPx width={rc} height={rc} look="lima" cx={rc / 2} cy={rc / 2} ringH={p.ringH} rotY={0.55 + oRot} rotZ={-0.12} envIntensity={1} style={{ left: -rc / 2, top: p.ringH * 0.36 - rc / 2 }} />
      {/* bloco de páginas (espessura embaixo) */}
      {[5, 4, 3, 2, 1].map((i) => (
        <div key={i} style={{ position: "absolute", left: -p.w / 2 + 1, top: g.pTop + i * 3.5, width: p.w - 2, height: p.ph, background: i % 2 ? PAPEL_ESC : PAPEL, borderRadius: "0 0 7px 7px", boxShadow: i === 5 ? "0 28px 50px rgba(0,0,0,.6), 0 6px 14px rgba(0,0,0,.45)" : "0 1px 0 rgba(0,0,0,.18)" }} />
      ))}
      {/* página do feriado (lima) */}
      <div style={{ position: "absolute", left: -p.w / 2, top: g.pTop, width: p.w, height: p.ph, overflow: "hidden", borderRadius: "0 0 6px 6px", background: `linear-gradient(168deg, #DCE62A 0%, ${LIMA} 50%, #AEB800 100%)` }}>
        <PaginaFeriado fer={fer} w={p.w} h={p.ph} uid={uid} />
        {/* sombra da página de cima enquanto ela descola */}
        {!rasgou && puxa > 0 && <AbsoluteFill style={{ background: `rgba(0,0,0,${0.35 * puxa})` }} />}
        {rasgou && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 14, background: PAPEL, clipPath: `polygon(0% 0%, 100% 0%, ${rebarba.slice().reverse().map(([x, y]) => `${x}% ${y}px`).join(", ")})`, filter: "drop-shadow(0 2px 1px rgba(0,0,0,.25))" }} />
        )}
      </div>
      {/* página de hoje, antes de ser arrancada */}
      {!rasgou && (
        <div style={{ position: "absolute", left: -p.w / 2, top: g.pTop, width: p.w, height: p.ph, transformOrigin: "0 0", transform: `rotate(${PUXA * puxa}deg)`, boxShadow: `0 ${4 + 18 * puxa}px ${8 + 26 * puxa}px rgba(0,0,0,${0.18 + 0.35 * puxa})`, borderRadius: "0 0 6px 6px" }}>
          <PaginaHoje n={n} fer={fer} w={p.w} h={p.ph} />
        </div>
      )}
      {/* cabeçalho da folhinha, com o picote */}
      <div style={{ position: "absolute", left: -p.w / 2 - 6, top: g.hTop, width: p.w + 12, height: g.hh, borderRadius: "12px 12px 3px 3px", background: "linear-gradient(180deg, #2A2C24 0%, #121310 100%)", boxShadow: "0 8px 16px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.08)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: `0 ${p.w * 0.06}px` }}>
        <span style={{ fontFamily: BARLOW, fontWeight: 800, fontSize: g.hh * 0.36, letterSpacing: "0.2em", color: LIMA }}>{fer.mes}</span>
        <span style={{ fontFamily: BARLOW, fontWeight: 800, fontSize: g.hh * 0.36, letterSpacing: "0.2em", color: PAPEL }}>{fer.ano}</span>
        {/* furo da argola */}
        <div style={{ position: "absolute", left: "50%", top: g.hh * 0.2, width: g.hh * 0.28, height: g.hh * 0.28, marginLeft: -g.hh * 0.14, borderRadius: "50%", background: "#000", boxShadow: "inset 0 2px 3px rgba(0,0,0,.9), 0 1px 0 rgba(255,255,255,.12)" }} />
        {/* picote */}
        <div style={{ position: "absolute", left: 8, right: 8, bottom: -3, height: 6, backgroundImage: `radial-gradient(circle, ${NOITE} 2px, transparent 2.4px)`, backgroundSize: "12px 6px" }} />
      </div>
      {/* prego */}
      <div style={{ position: "absolute", left: -9, top: -9, width: 18, height: 18, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, #F4F4F0, #9A9B94 55%, #4A4B45 100%)", boxShadow: "0 4px 6px rgba(0,0,0,.6)" }} />
    </div>
  );
};

type Alvo = { cx: number; cy: number; s: number; rot: number; ctrl: [number, number] };

// a página arrancada voa e pousa como cartão da data
const PaginaVoando: React.FC<{ n: Noite; fer: Fer; p: PadL; alvo: Alvo }> = ({ n, fer, p, alvo }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < T.rasga) return null;
  const g = geo(p);
  const a0 = anguloPad(T.rasga - 0.01, p.rot);
  const [ox, oy] = rotPt(p.w / 2, p.ph / 2, PUXA);
  const [rx, ry] = rotPt(-p.w / 2 + ox, g.pTop + oy, a0);
  const c0: [number, number] = [p.nx + rx, p.ny + ry];
  const k = spring({ frame: frame - T.rasga, fps, config: { damping: 15, stiffness: 62, mass: 0.9 } });
  const bz = (a: number, b: number, c: number) => (1 - k) * (1 - k) * a + 2 * (1 - k) * k * b + k * k * c;
  const cx = bz(c0[0], alvo.ctrl[0], alvo.cx);
  const cy = bz(c0[1], alvo.ctrl[1], alvo.cy);
  const rot = interpolate(k, [0, 1], [a0 + PUXA, alvo.rot]) + Math.sin(Math.min(1, k) * Math.PI) * 28;
  const sc = interpolate(k, [0, 0.45, 1], [1, 1.08, alvo.s]);
  return (
    <div style={{ position: "absolute", left: cx - p.w / 2, top: cy - p.ph / 2, width: p.w, height: p.ph, transform: `rotate(${rot}deg) scale(${sc})`, filter: "drop-shadow(0 18px 26px rgba(0,0,0,.6)) drop-shadow(0 3px 5px rgba(0,0,0,.4))" }}>
      <PaginaHoje n={n} fer={fer} w={p.w} h={p.ph} rasgada />
    </div>
  );
};

// ---------------------------------------------------------------- textos e peças soltas

const Titulo: React.FC<{ x: number; y: number; s1: number; s2: number; t0: number; linhas?: [string, string] }> = ({ x, y, s1, s2, t0, linhas = ["VÉSPERA", "DE FERIADO"] }) => {
  const frame = useCurrentFrame();
  const sobe = (d: number) => interpolate(frame - t0 - d, [0, 15], [115, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  const lin = (txt: string, size: number, cor: string, d: number) => (
    <div style={{ overflow: "hidden", paddingTop: size * 0.2, marginTop: -size * 0.2 }}>
      <div style={{ fontFamily: ANTON, fontSize: size, lineHeight: 1.02, color: cor, whiteSpace: "nowrap", transform: `translateY(${sobe(d)}%)`, textShadow: "0 8px 30px rgba(0,0,0,.55)" }}>{txt}</div>
    </div>
  );
  return (
    <div style={{ position: "absolute", left: x, top: y }}>
      {lin(linhas[0], s1, "#FFFFFF", 0)}
      {lin(linhas[1], s2, LIMA, 6)}
    </div>
  );
};

// fita lima colada: o nome da noite
const Fita: React.FC<{ x: number; y: number; size: number; t0: number; rot?: number }> = ({ x, y, size, t0, rot = -3 }) => {
  const s = useSpr(t0, { damping: 15, stiffness: 150 });
  const d = serrilha(9, 8, 6);
  const esq = d.map(([p, v]) => `${v}px ${p}%`).join(", ");
  const dir = d.slice().reverse().map(([p, v]) => `calc(100% - ${v}px) ${p}%`).join(", ");
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `rotate(${rot}deg) scaleX(${s})`, transformOrigin: "left center", filter: "drop-shadow(0 6px 10px rgba(0,0,0,.45))" }}>
      <div style={{ background: `linear-gradient(180deg, ${LIMA_CLARO}, ${LIMA})`, clipPath: `polygon(${esq}, ${dir})`, padding: `${size * 0.16}px ${size * 0.7}px ${size * 0.18}px`, fontFamily: BARLOW, fontStyle: "italic", fontWeight: 900, fontSize: size, lineHeight: 1, letterSpacing: "0.06em", color: TINTA, whiteSpace: "nowrap" }}>
        SAIDEIRA DA SEMANA
      </div>
    </div>
  );
};

const Nome: React.FC<{ n: Noite; x: number; y: number; size: number; t0: number }> = ({ n, x, y, size, t0 }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - t0, [0, 14], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const partes = n.artista.split("&");
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: p, transform: `translateX(${(1 - p) * -40}px)`, fontFamily: BARLOW, fontWeight: 900, fontSize: size, lineHeight: 1, letterSpacing: "0.02em", color: "#FFFFFF", whiteSpace: "nowrap", textShadow: "0 6px 20px rgba(0,0,0,.6)" }}>
      {partes.map((pt, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span style={{ color: LIMA }}>&</span>}
          {pt}
        </React.Fragment>
      ))}
    </div>
  );
};

const Lista: React.FC<{ n: Noite; x: number; y: number; w: number; size: number; t0: number; cta?: boolean }> = ({ n, x, y, w, size, t0, cta }) => {
  const o = useFade(t0, t0 + 14);
  // valor da lista (FREE / R$ 20) em lima
  const linha = (t: string) => {
    const m = t.match(/^(.*?) (FREE|R\$ \d+) (.*)$/);
    return (
      <div style={{ fontFamily: ARCHIVO, fontWeight: 800, fontSize: size, lineHeight: 1.28, color: PAPEL, whiteSpace: "nowrap" }}>
        {m ? (
          <>
            {m[1]} <span style={{ color: LIMA }}>{m[2]}</span> {m[3]}
          </>
        ) : (
          t
        )}
      </div>
    );
  };
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, opacity: o, transform: `translateY(${(1 - o) * 20}px)` }}>
      {linha(n.lista[0])}
      {linha(n.lista[1])}
      <div style={{ fontFamily: ARCHIVO, fontWeight: 500, fontSize: size * 0.64, lineHeight: 1.3, color: PAPEL, opacity: 0.72, marginTop: 6 }}>{n.obs}</div>
      {cta && (
        <div style={{ display: "inline-block", marginTop: size * 0.5, background: LIMA, color: TINTA, fontFamily: BARLOW, fontWeight: 900, fontSize: size * 0.9, letterSpacing: "0.1em", padding: `${size * 0.14}px ${size * 0.45}px`, borderRadius: 4 }}>NOME NA LISTA: LINK NA BIO</div>
      )}
    </div>
  );
};

const Estilo: React.FC<{ n: Noite; x: number; y: number; size: number; t0: number }> = ({ n, x, y, size, t0 }) => {
  const s = useSpr(t0, { damping: 12 });
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translateY(${(1 - s) * -70}px) rotate(-2deg)`, opacity: Math.min(1, s * 3), display: "flex", alignItems: "center", gap: 10, background: TINTA, border: `2px solid ${LIMA}`, borderRadius: 8, padding: "7px 16px 8px 11px", boxShadow: "0 8px 20px rgba(0,0,0,.5)" }}>
      <Nota size={size * 1.15} color={LIMA} />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontFamily: BARLOW, fontWeight: 900, fontSize: size * 1.22, lineHeight: 1, letterSpacing: "0.08em", color: LIMA }}>{n.estilo}</span>
        <span style={{ fontFamily: ARCHIVO, fontWeight: 600, fontSize: size * 0.56, lineHeight: 1.15, color: PAPEL, opacity: 0.85, marginTop: 2 }}>{SUBESTILO}</span>
      </div>
    </div>
  );
};

// despertador de segunda sendo desligado
const Despertador: React.FC<{ x: number; y: number; s: number; t0: number }> = ({ x, y, s, t0 }) => {
  const frame = useCurrentFrame();
  const e = useSpr(t0 - 14, { damping: 14 });
  const off = interpolate(frame, [t0, t0 + 7], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const toca = frame >= t0 - 14 && frame < t0 ? Math.sin(frame * 2.2) * 14 : 0;
  const sw = s * 2.3;
  const sh = s * 1.36;
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: Math.min(1, e * 2), transform: `translateY(${(1 - e) * 30}px)`, display: "flex", alignItems: "center", gap: s * 0.55, background: "rgba(24,25,20,.92)", border: "1.5px solid rgba(243,239,226,.16)", borderRadius: s * 1.2, padding: `${s * 0.42}px ${s * 0.55}px ${s * 0.42}px ${s * 0.6}px`, boxShadow: "0 14px 30px rgba(0,0,0,.55)" }}>
      <svg width={s * 1.5} height={s * 1.5} viewBox="0 0 24 24" style={{ transform: `rotate(${toca}deg)`, flex: "0 0 auto" }}>
        <g fill="none" stroke={off > 0.5 ? "#8C8D84" : PAPEL} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="13" r="7.3" />
          <path d="M12 9.3V13l2.6 1.7" />
          <path d="M3.6 6.6 6.8 3.8M20.4 6.6 17.2 3.8" />
          <path d="M7.4 19.6 6 21.4M16.6 19.6 18 21.4" />
        </g>
      </svg>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontFamily: BARLOW, fontWeight: 700, fontSize: s * 0.78, lineHeight: 1, letterSpacing: "0.08em", color: PAPEL, whiteSpace: "nowrap", opacity: 1 - off * 0.45, textDecoration: off > 0.5 ? "line-through" : "none", textDecorationColor: LIMA, textDecorationThickness: 2 }}>SEGUNDA · 07:00</span>
        <span style={{ fontFamily: BARLOW, fontWeight: 800, fontSize: s * 1.02, lineHeight: 1.1, letterSpacing: "0.03em", color: off > 0.5 ? LIMA : PAPEL, marginTop: 4, whiteSpace: "nowrap" }}>{off > 0.5 ? "AMANHÃ SEM DESPERTADOR" : "DESPERTADOR"}</span>
      </div>
      <div style={{ position: "relative", width: sw, height: sh, borderRadius: sh, background: off > 0.5 ? "#3A3B34" : LIMA, flex: "0 0 auto", marginLeft: s * 0.2 }}>
        <div style={{ position: "absolute", top: 3, left: 3 + (1 - off) * (sw - sh), width: sh - 6, height: sh - 6, borderRadius: "50%", background: "#FFFFFF", boxShadow: "0 2px 4px rgba(0,0,0,.4)" }} />
      </div>
    </div>
  );
};

// a dupla (foto oficial, corte reto embaixo) subindo
const Dupla: React.FC<{ n: Noite; w: number; left: number; top: number; t0: number }> = ({ n, w, left, top, t0 }) => {
  const s = useSpr(t0, { damping: 16 });
  const h = w / n.foto.ratio;
  const mask = "linear-gradient(180deg, #000 74%, transparent 97%)";
  return (
    <Img
      src={staticFile(n.foto.src)}
      style={{ position: "absolute", width: w, height: h, left, top: top + (1 - s) * 160, opacity: Math.min(1, s * 1.6), WebkitMaskImage: mask, maskImage: mask, filter: "drop-shadow(0 0 1.5px rgba(200,210,0,.7)) drop-shadow(0 0 26px rgba(200,210,0,.22)) drop-shadow(0 30px 40px rgba(0,0,0,.6)) contrast(1.04)" }}
    />
  );
};

// ---------------------------------------------------------------- composições

type Lay = {
  selo: { x: number; y: number; size: number };
  logo: { w: number; top: number };
  titulo: { x: number; y: number; s1: number; s2: number };
  pad: PadL;
  dupla: { w: number; left: number; top: number };
  grad: [number, number];
  glow: [number, number];
  card: Alvo;
  fita: { x: number; y: number; size: number };
  nome: { x: number; y: number; size: number };
  lista: { x: number; y: number; w: number; size: number };
  alarme?: { x: number; y: number; s: number };
  cta?: boolean;
};

const LAY: Record<"feed" | "story", Lay> = {
  feed: {
    selo: { x: 28, y: 22, size: 24 },
    logo: { w: 210, top: 34 },
    titulo: { x: 44, y: 104, s1: 170, s2: 106 },
    pad: { nx: 866, ny: 116, w: 350, ph: 430, rot: 3.5, ringH: 124 },
    dupla: { w: 790, left: -6, top: 404 },
    grad: [860, 1070],
    glow: [420, 700],
    card: { cx: 172, cy: 1168, s: 0.7, rot: -6, ctrl: [980, 1180] },
    fita: { x: 324, y: 1000, size: 34 },
    nome: { x: 330, y: 1062, size: 58 },
    lista: { x: 332, y: 1138, w: 720, size: 26 },
    alarme: { x: 332, y: 1250, s: 21 },
  },
  story: {
    selo: { x: 46, y: 200, size: 27 },
    logo: { w: 240, top: 214 },
    titulo: { x: 50, y: 300, s1: 184, s2: 118 },
    pad: { nx: 872, ny: 306, w: 360, ph: 430, rot: 3.5, ringH: 126 },
    dupla: { w: 900, left: -40, top: 700 },
    grad: [1240, 1460],
    glow: [420, 1000],
    card: { cx: 186, cy: 1540, s: 0.68, rot: -6, ctrl: [1000, 1560] },
    fita: { x: 344, y: 1368, size: 38 },
    nome: { x: 350, y: 1436, size: 62 },
    lista: { x: 352, y: 1518, w: 700, size: 28 },
    alarme: { x: 50, y: 626, s: 22 },
    cta: true,
  },
};

export const Vespera: React.FC<{ n: Noite; fmt: Formato }> = ({ n, fmt }) => (fmt === "broll" ? <VesperaBroll n={n} /> : <VesperaFlyer n={n} fmt={fmt} />);

const VesperaFlyer: React.FC<{ n: Noite; fmt: "feed" | "story" }> = ({ n, fmt }) => {
  const L = LAY[fmt];
  const { w, h } = DIM[fmt];
  const fer = feriadoDe(n);
  const frame = useCurrentFrame();
  const push = interpolate(frame, [0, 240], [1, 1.03], clamp);
  const g = geo(L.pad);
  const o = useFade(0, 12);
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: NOITE }}>
      <Filtros uid={fmt} />
      <AbsoluteFill style={{ opacity: o }}>
        <Fundo gx={L.glow[0]} gy={L.glow[1]} />
      </AbsoluteFill>
      <Garoa w={w} h={h} qtd={fmt === "feed" ? 22 : 30} seed={5} t0={T.rasga + 20} />
      <Folhinha n={n} fer={fer} p={L.pad} uid={fmt} />
      <Confete ox={L.pad.nx} oy={L.pad.ny + g.pTop + L.pad.ph * 0.4} t0={T.rasga} qtd={54} seed={11} h={h} />
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "40% 70%" }}>
        <Dupla n={n} w={L.dupla.w} left={L.dupla.left} top={L.dupla.top} t0={T.dupla} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(10,11,7,0) ${L.grad[0]}px, rgba(10,11,7,.8) ${(L.grad[0] + L.grad[1]) / 2}px, rgba(10,11,7,.96) ${L.grad[1]}px)` }} />
      <Titulo {...L.titulo} t0={T.titulo} />
      <Fita {...L.fita} t0={T.fita} />
      <Nome n={n} {...L.nome} t0={T.nome} />
      <Lista n={n} {...L.lista} t0={T.lista} cta={L.cta} />
      {L.alarme && <Despertador {...L.alarme} t0={T.alarme} />}
      <PaginaVoando n={n} fer={fer} p={L.pad} alvo={L.card} />
      <Logo width={L.logo.w} top={L.logo.top} />
      <Estilo n={n} {...L.selo} t0={T.estilo} />
      <Grain opacity={0.1} />
      <Vignette strength={0.42} />
    </AbsoluteFill>
  );
};

// STORY com B-roll: o show é a "foto" da folhinha; embaixo a dupla com o título, a folhinha, o cartão da data e a lista
const VesperaBroll: React.FC<{ n: Noite }> = ({ n }) => {
  const { w, h } = DIM.broll;
  const fer = feriadoDe(n);
  const vid = useFade(0, 10);
  const MX = 54, MY = 176, MW = 972, MH = 690;
  const pad: PadL = { nx: 872, ny: 946, w: 320, ph: 352, rot: 3.5, ringH: 104 };
  const g = geo(pad);
  const card: Alvo = { cx: 150, cy: 1594, s: 0.56, rot: -5, ctrl: [1020, 1640] };
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: NOITE }}>
      <Filtros uid="broll" />
      <Fundo gx={330} gy={1250} />
      <Garoa w={w} h={h} qtd={20} seed={7} t0={T.rasga + 20} />
      {/* moldura de papel: a "foto" da folhinha */}
      <div style={{ position: "absolute", left: MX - 14, top: MY - 14, width: MW + 28, height: MH + 28, background: PAPEL, borderRadius: 6, boxShadow: "0 30px 60px rgba(0,0,0,.65)", opacity: vid }} />
      <div style={{ position: "absolute", left: MX, top: MY, width: MW, height: MH, overflow: "hidden", borderRadius: 3, opacity: vid }}>
        <OffthreadVideo src={staticFile(n.clip)} style={{ width: MW, height: MW * (1920 / 1080), objectFit: "cover", marginTop: n.clipTop ?? -330, filter: "contrast(1.05) saturate(1.06)" }} volume={(f) => interpolate(f, [0, 8, 285, 300], [0, 1, 1, 0], clamp)} />
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,11,7,.6) 0%, rgba(10,11,7,0) 24%, rgba(10,11,7,0) 80%, rgba(10,11,7,.4) 100%)" }} />
      </div>
      <Ticker text="AMANHÃ É FERIADO ● NINGUÉM ACORDA CEDO ● TE VEJO NA ESQUINA ● " top={MY + MH - 34} height={72} bg={LIMA} color={TINTA} font={ANTON} size={42} rotate={-2} speed={3} weight={400} spacing="0.03em" />
      {/* dupla e folhinha não se encostam: o degradê escurece só a dupla, a folhinha fica por cima */}
      <Dupla n={n} w={620} left={-12} top={944} t0={T.dupla} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,11,7,0) 1240px, rgba(10,11,7,.78) 1360px, rgba(10,11,7,.96) 1470px)" }} />
      <Folhinha n={n} fer={fer} p={pad} uid="broll" deLado />
      <Confete ox={pad.nx} oy={pad.ny + g.pTop + pad.ph * 0.4} t0={T.rasga} qtd={40} seed={13} h={h} forca={0.8} />
      <Fita x={36} y={1246} size={28} t0={T.fita} rot={-3} />
      <Titulo x={40} y={1294} s1={92} s2={92} t0={T.titulo + 8} linhas={["VÉSPERA DE", "FERIADO"]} />
      <Despertador x={648} y={1440} s={18} t0={T.alarme} />
      <Nome n={n} x={292} y={1512} size={44} t0={T.nome} />
      <Lista n={n} x={294} y={1566} w={760} size={22} t0={T.lista} cta />
      <PaginaVoando n={n} fer={fer} p={pad} alvo={card} />
      <Logo width={240} top={214} />
      <Estilo n={n} x={84} y={200} size={25} t0={T.estilo} />
      <Grain opacity={0.1} />
      <Vignette strength={0.4} />
    </AbsoluteFill>
  );
};
