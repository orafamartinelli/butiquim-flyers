import React from "react";
import { AbsoluteFill, Easing, Html5Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ARCHIVO, BIG } from "../fonts";
import { Grain, Vignette, clamp } from "../shared/fx";
import { Noite } from "../data";

// AVISO DE CASA FECHADA (23/10/2026): story 9:16 animado com as noites do fim de semana.
// Noite fechada = faixa fina (1/3) carimbada, sem efeito. Abertas ganham o espaço e um efeito cada:
//  · 1ª aberta: E04 "saindo da tela" — o artista sobe e rompe a borda de cima do quadro; o nome dá a volta por trás dele.
//  · 2ª aberta: artista saindo de um quadrado dentro da faixa; nome entra letra a letra e um brilho passa por ele.
const PRETO = "#0B0B09";
const OSSO = "#F2F0E6";
const LIMA = "#C8D200";
const COR: Record<Noite["key"], string> = { sexta: LIMA, sabado: "#FF2E93", domingo: "#F29A2E" };
export const FECHADO_DUR = 300;

type P = { noites: Noite[]; fechadas: string[]; titulo?: string };

const dataTxt = (n: Noite) => `${n.dia}.${n.data.slice(5, 7)}`;
const L = 60; // margem lateral das faixas
const W = 1080 - 2 * L;

const useA = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const spr = (d: number, cfg: Partial<{ damping: number; stiffness: number; mass: number }> = {}) => spring({ frame: frame - d, fps, config: { damping: 15, mass: 0.9, stiffness: 120, ...cfg } });
  const fade = (a: number, b: number) => interpolate(frame, [a, b], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  return { frame, spr, fade };
};

const FaixaFechada: React.FC<{ n: Noite; top: number; h: number; d: number }> = ({ n, top, h, d }) => {
  const a = useA();
  const s = a.spr(d);
  return (
    <div style={{ position: "absolute", left: L, width: W, top, height: h, borderRadius: 22, overflow: "hidden", background: "#1C1C19", border: "3px solid #3A3A35", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 44px", opacity: Math.min(1, s * 2), transform: `translateY(${(1 - s) * 30}px)` }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 22, opacity: 0.55 }}>
        <span style={{ fontFamily: ARCHIVO, fontWeight: 900, fontSize: 34, letterSpacing: "0.14em", color: OSSO }}>{n.diaSemana}</span>
        <span style={{ fontFamily: BIG, fontWeight: 900, fontSize: 64, lineHeight: 1, color: OSSO }}>{dataTxt(n)}</span>
      </div>
      <div style={{ transform: "rotate(-5deg)", border: `5px solid ${OSSO}`, borderRadius: 12, padding: "4px 20px 2px", fontFamily: BIG, fontWeight: 900, fontSize: 62, lineHeight: 1, color: OSSO, letterSpacing: "0.04em" }}>FECHADO</div>
    </div>
  );
};

// textos da esquerda (dia, data, nome, horário) com entrada em cascata
const Textos: React.FC<{ n: Noite; h: number; d: number; nome?: React.ReactNode }> = ({ n, h, d, nome }) => {
  const a = useA();
  const cor = COR[n.key];
  const e = (k: number) => { const s = a.spr(d + k * 5, { damping: 16 }); return { opacity: Math.min(1, s * 2), transform: `translateX(${(1 - s) * -60}px)` }; };
  // a data "acende": varredura de máscara da esquerda pra direita
  const rev = a.fade(d + 4, d + 22);
  return (
    <div style={{ position: "absolute", left: 48, top: 0, height: h, display: "flex", flexDirection: "column", justifyContent: "center", gap: 12, zIndex: 3 }}>
      <div style={{ fontFamily: ARCHIVO, fontWeight: 900, fontSize: 48, letterSpacing: "0.14em", color: cor, ...e(0) }}>{n.diaSemana}</div>
      <div style={{ fontFamily: BIG, fontWeight: 900, fontSize: 168, lineHeight: 0.82, color: OSSO, clipPath: `inset(0 ${(1 - rev) * 100}% 0 0)` }}>{dataTxt(n)}</div>
      {nome ?? <div style={{ fontFamily: BIG, fontWeight: 900, fontSize: n.artista.length > 12 ? 74 : 84, lineHeight: 0.92, color: OSSO, maxWidth: 520, marginTop: 10, ...e(2) }}>{n.artista}</div>}
      <div style={{ fontFamily: ARCHIVO, fontWeight: 800, fontSize: 36, letterSpacing: "0.12em", color: PRETO, background: cor, alignSelf: "flex-start", padding: "10px 22px", borderRadius: 12, marginTop: 6, ...e(3) }}>{`ABRE ${n.hora}`}</div>
    </div>
  );
};

// anel de letras girando em volta do artista: metade de trás fica atrás da foto, a da frente passa na frente (na altura do peito, nunca no rosto)
const Anel: React.FC<{ texto: string; cx: number; cy: number; rx: number; ry: number; lado: "tras" | "frente"; cor: string; t: number; op: number }> = ({ texto, cx, cy, rx, ry, lado, cor, t, op }) => {
  const letras = texto.split("");
  const passo = (Math.PI * 2) / letras.length;
  return (
    <>
      {letras.map((c, i) => {
        const ang = i * passo + t;
        const z = Math.sin(ang); // >0 = frente
        if ((lado === "frente") !== z > 0) return null;
        const x = cx - Math.cos(ang) * rx; // menos: na metade da frente o texto corre da esquerda pra direita
        const y = cy + z * ry;
        const k = 0.72 + 0.28 * (z + 1) / 2;
        return (
          <span key={i} style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${k}) scaleX(${0.3 + 0.7 * Math.abs(Math.sin(ang))})`, fontFamily: BIG, fontWeight: 900, fontSize: 64, color: z > 0 ? OSSO : cor, opacity: op * (z > 0 ? 1 : 0.55), textShadow: z > 0 ? `0 0 18px ${cor}` : "none", whiteSpace: "pre" }}>
            {c}
          </span>
        );
      })}
    </>
  );
};

// E04 — saindo da tela
const FaixaSaindo: React.FC<{ n: Noite; top: number; h: number; d: number }> = ({ n, top, h, d }) => {
  const a = useA();
  const cor = COR[n.key];
  const s = a.spr(d);
  const sobe = a.spr(d + 16, { damping: 13, stiffness: 90 });
  const quebra = 110; // quanto a cabeça passa da borda de cima
  const fotoH = n.foto.ratio < 0.5 ? h * 1.75 : h + 160;
  const fotoW = fotoH * n.foto.ratio;
  const fotoLeft = L + W - fotoW - 20;
  const fotoTop = top - quebra + (1 - sobe) * (h * 0.9);
  const mask = "linear-gradient(270deg, #000 70%, transparent 100%)";
  const anelOp = a.fade(d + 34, d + 50);
  const t = a.frame / 26;
  const anel = { texto: `${n.artista} ★ `, cx: fotoLeft + fotoW / 2, cy: fotoTop + fotoH * 0.42, rx: fotoW * 0.6, ry: 52, cor, t, op: anelOp };
  return (
    <>
      <div style={{ position: "absolute", left: L, width: W, top, height: h, borderRadius: 30, overflow: "hidden", background: "#16160F", border: `4px solid ${cor}`, boxShadow: `0 0 60px ${cor}33`, opacity: Math.min(1, s * 2), transform: `scale(${0.94 + 0.06 * s})` }}>
        <AbsoluteFill style={{ background: `radial-gradient(ellipse at 80% 60%, ${cor}2E 0%, transparent 60%)` }} />
        <Textos n={n} h={h} d={d + 6} />
      </div>
      <Anel {...anel} lado="tras" />
      {/* a foto mora numa janela que corta embaixo e nas laterais do quadro, mas é aberta em cima: a cabeça rompe a borda */}
      <div style={{ position: "absolute", left: L + 4, width: W - 8, top: top - quebra - 20, height: h + quebra + 20 - 4, overflow: "hidden", borderRadius: "0 0 26px 26px", pointerEvents: "none" }}>
        <Img src={staticFile(n.foto.src)} style={{ position: "absolute", left: fotoLeft - L - 4, top: fotoTop - (top - quebra - 20), height: fotoH, width: fotoW, WebkitMaskImage: mask, maskImage: mask, filter: `drop-shadow(0 18px 30px rgba(0,0,0,.6))` }} />
      </div>
      <Anel {...anel} lado="frente" />
    </>
  );
};

// artista saindo de um quadrado dentro da faixa + nome letra a letra com brilho
const FaixaQuadrado: React.FC<{ n: Noite; top: number; h: number; d: number }> = ({ n, top, h, d }) => {
  const a = useA();
  const cor = COR[n.key];
  const s = a.spr(d);
  const q = 290; // lado do quadrado
  const qx = W - q - 60;
  const qy = h - q - 34;
  const desenha = a.fade(d + 8, d + 30); // a moldura se desenha
  const sobe = a.spr(d + 20, { damping: 13, stiffness: 90 });
  // ombros cabem no quadrado (braço passa um pouco pros lados) e cabeça sai por cima
  const fotoW = q * 1.12;
  const fotoH = fotoW / n.foto.ratio;
  const fotoLeft = qx + q / 2 - fotoW / 2;
  const fotoTop = qy + q - fotoH + (1 - sobe) * q * 0.9;
  const per = 4 * q;
  const letras = n.artista.split("");
  const brilho = ((a.frame - (d + 60)) % 90) / 90; // passa a cada 3 s
  const nome = (
    <div style={{ position: "relative", fontFamily: BIG, fontWeight: 900, fontSize: n.artista.length > 12 ? 74 : 84, lineHeight: 0.92, color: OSSO, maxWidth: 520, marginTop: 10, whiteSpace: "nowrap" }}>
      {letras.map((c, i) => {
        const p = a.spr(d + 26 + i * 2.2, { damping: 11, stiffness: 160 });
        return <span key={i} style={{ display: "inline-block", whiteSpace: "pre", transform: `translateY(${(1 - p) * -70}px) rotate(${(1 - p) * -14}deg)`, opacity: Math.min(1, p * 2) }}>{c}</span>;
      })}
      {a.frame > d + 60 && (
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(100deg, transparent ${brilho * 140 - 30}%, rgba(255,214,150,.95) ${brilho * 140 - 15}%, transparent ${brilho * 140}%)`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", whiteSpace: "nowrap" }}>{n.artista}</div>
      )}
    </div>
  );
  return (
    <div style={{ position: "absolute", left: L, width: W, top, height: h, borderRadius: 30, overflow: "hidden", background: "#16160F", border: `4px solid ${cor}`, boxShadow: `0 0 60px ${cor}33`, opacity: Math.min(1, s * 2), transform: `scale(${0.94 + 0.06 * s})` }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 80% 70%, ${cor}2E 0%, transparent 60%)` }} />
      {/* fundo do quadrado */}
      <div style={{ position: "absolute", left: qx, top: qy, width: q, height: q, background: `linear-gradient(160deg, ${cor}55, ${cor}10)`, opacity: desenha }} />
      {/* borda de cima da moldura vem ANTES da foto: fica atrás do artista, que sai por ela */}
      <svg style={{ position: "absolute", left: qx - 4, top: qy - 4 }} width={q + 8} height={12}>
        <path d={`M 4 4 L ${q + 4} 4`} fill="none" stroke={cor} strokeWidth={8} strokeDasharray={per} strokeDashoffset={q * (1 - desenha)} />
      </svg>
      {/* corpo dentro do quadrado (corta na base do quadrado), cabeça passa por cima da borda */}
      <div style={{ position: "absolute", left: 0, top: 0, width: W, height: qy + q, overflow: "hidden" }}>
        <Img src={staticFile(n.foto.src)} style={{ position: "absolute", left: fotoLeft, top: fotoTop, height: fotoH, width: fotoW, filter: "drop-shadow(0 14px 22px rgba(0,0,0,.55))" }} />
      </div>
      {/* laterais e base da moldura na frente do artista */}
      <svg style={{ position: "absolute", left: qx - 4, top: qy - 4 }} width={q + 8} height={q + 8}>
        <path d={`M 4 4 L 4 ${q + 4} L ${q + 4} ${q + 4} L ${q + 4} 4`} fill="none" stroke={cor} strokeWidth={8} strokeDasharray={3 * q} strokeDashoffset={3 * q * (1 - desenha)} />
      </svg>
      <Textos n={n} h={h} d={d + 6} nome={nome} />
    </div>
  );
};

export const FechadoStory: React.FC<P> = ({ noites, fechadas, titulo = "AGENDA ATUALIZADA" }) => {
  const a = useA();
  const top0 = 450;
  const fim = 1730;
  const gapQuebra = 120; // espaço acima da faixa que tem o efeito "saindo da tela"
  const gap = 30;
  const nFech = noites.filter((n) => fechadas.includes(n.data)).length;
  const abertas = noites.filter((n) => !fechadas.includes(n.data));
  // gaps: o que fica antes da 1ª aberta é maior (a cabeça do artista sobe nele)
  const gaps = noites.slice(1).map((n) => (n === abertas[0] ? gapQuebra : gap));
  const unidade = (fim - top0 - gaps.reduce((s, g) => s + g, 0)) / (abertas.length * 3 + nFech);
  let y = top0;
  const pos = noites.map((n, i) => {
    const fechada = fechadas.includes(n.data);
    const h = fechada ? unidade : unidade * 3;
    const p = { n, fechada, top: y, h, ordem: abertas.indexOf(n) };
    y += h + (gaps[i] ?? 0);
    return p;
  });
  const tit = a.spr(2);
  // domingo fechado puxa o fds seguinte (dom → sex = 5 dias): aí não é mais "este fim de semana"
  const dias = (Date.parse(noites[noites.length - 1].data) - Date.parse(noites[0].data)) / 864e5;
  const sub = dias > 2 ? "PRÓXIMAS NOITES" : "ESTE FIM DE SEMANA";
  return (
    <AbsoluteFill style={{ background: PRETO, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 16%, rgba(200,210,0,.14) 0%, rgba(200,210,0,0) 60%)" }} />
      <Img src={staticFile("logos/butiquim-branco-h.png")} style={{ position: "absolute", left: 540 - 170, top: 170, width: 340, opacity: a.fade(0, 12) }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 280, textAlign: "center", fontFamily: BIG, fontWeight: 900, fontSize: 96, color: OSSO, lineHeight: 1, opacity: Math.min(1, tit * 2), transform: `translateY(${(1 - tit) * 30}px)` }}>{titulo}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 386, textAlign: "center", fontFamily: ARCHIVO, fontWeight: 700, fontSize: 28, letterSpacing: "0.3em", color: LIMA, opacity: a.fade(8, 20) }}>{sub}</div>
      {pos.map((p, i) =>
        p.fechada ? <FaixaFechada key={p.n.data} n={p.n} top={p.top} h={p.h} d={10} />
        : p.ordem === 0 ? <FaixaSaindo key={p.n.data} n={p.n} top={p.top} h={p.h} d={18} />
        : <FaixaQuadrado key={p.n.data} n={p.n} top={p.top} h={p.h} d={18 + 40 * i} />,
      )}
      <div style={{ position: "absolute", left: 0, right: 0, top: fim + 36, textAlign: "center", fontFamily: ARCHIVO, fontWeight: 800, fontSize: 30, letterSpacing: "0.24em", color: OSSO, opacity: a.fade(110, 130) }}>
        RESPONDA <span style={{ background: LIMA, color: PRETO, padding: "2px 14px", borderRadius: 8 }}>LISTA</span> PARA SE CADASTRAR
      </div>
      <Vignette strength={0.45} />
      <Grain opacity={0.1} />
    </AbsoluteFill>
  );
};

// trilha: metade de cada noite aberta, em sequência
export const TrilhaFechado: React.FC<{ noites: Noite[] }> = ({ noites }) => {
  const seg = Math.floor(FECHADO_DUR / noites.length);
  return (
    <>
      {noites.map((n, i) => {
        const dur = i === noites.length - 1 ? FECHADO_DUR - i * seg : seg + 10;
        return (
          <Sequence key={n.data} from={i * seg} durationInFrames={dur}>
            <Html5Audio src={staticFile(n.clip)} trimBefore={30} volume={(f) => interpolate(f, [0, 10, dur - 14, dur], [0, 1, 1, 0], clamp)} />
          </Sequence>
        );
      })}
    </>
  );
};
