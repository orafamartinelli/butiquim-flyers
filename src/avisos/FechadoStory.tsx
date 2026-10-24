import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { ARCHIVO, BIG } from "../fonts";
import { Grain, Vignette } from "../shared/fx";
import { Noite } from "../data";

// AVISO DE CASA FECHADA (23/10/2026): story 9:16 com as noites do fim de semana —
// a noite fechada vira uma faixa fina (1/3 da altura) carimbada; as abertas ganham o espaço, com foto e horário na cor da identidade.
const PRETO = "#0B0B09";
const OSSO = "#F2F0E6";
const LIMA = "#C8D200";
const COR: Record<Noite["key"], string> = { sexta: LIMA, sabado: "#FF2E93", domingo: "#F29A2E" };

type P = { noites: Noite[]; fechadas: string[]; titulo?: string };

const dataTxt = (n: Noite) => `${n.dia}.${n.data.slice(5, 7)}`;

const FaixaFechada: React.FC<{ n: Noite; top: number; h: number }> = ({ n, top, h }) => (
  <div style={{ position: "absolute", left: 60, right: 60, top, height: h, borderRadius: 22, overflow: "hidden", background: "#1C1C19", border: "3px solid #3A3A35", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 44px" }}>
    <div style={{ display: "flex", alignItems: "baseline", gap: 22, opacity: 0.55 }}>
      <span style={{ fontFamily: ARCHIVO, fontWeight: 900, fontSize: 34, letterSpacing: "0.14em", color: OSSO }}>{n.diaSemana}</span>
      <span style={{ fontFamily: BIG, fontWeight: 900, fontSize: 64, lineHeight: 1, color: OSSO }}>{dataTxt(n)}</span>
    </div>
    <div style={{ transform: "rotate(-5deg)", border: `5px solid ${OSSO}`, borderRadius: 12, padding: "4px 20px 2px", fontFamily: BIG, fontWeight: 900, fontSize: 62, lineHeight: 1, color: OSSO, letterSpacing: "0.04em" }}>FECHADO</div>
  </div>
);

const FaixaAberta: React.FC<{ n: Noite; top: number; h: number }> = ({ n, top, h }) => {
  const cor = COR[n.key];
  // foto de corpo inteiro (estreita) amplia e prende no alto pra o rosto caber na faixa
  const alta = n.foto.ratio < 0.5;
  const fotoH = alta ? h * 1.75 : h + 60;
  const fotoW = fotoH * n.foto.ratio;
  const mask = "linear-gradient(270deg, #000 55%, transparent 100%)";
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top, height: h, borderRadius: 30, overflow: "hidden", background: "#16160F", border: `4px solid ${cor}`, boxShadow: `0 0 60px ${cor}33` }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 80% 60%, ${cor}2E 0%, transparent 60%)` }} />
      <Img src={staticFile(n.foto.src)} style={{ position: "absolute", right: alta ? 0 : -fotoW * 0.06, ...(alta ? { top: 16 } : { bottom: 0 }), height: fotoH, width: fotoW, WebkitMaskImage: mask, maskImage: mask }} />
      <div style={{ position: "absolute", left: 48, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 12 }}>
        <div style={{ fontFamily: ARCHIVO, fontWeight: 900, fontSize: 48, letterSpacing: "0.14em", color: cor }}>{n.diaSemana}</div>
        <div style={{ fontFamily: BIG, fontWeight: 900, fontSize: 168, lineHeight: 0.82, color: OSSO }}>{dataTxt(n)}</div>
        <div style={{ fontFamily: BIG, fontWeight: 900, fontSize: n.artista.length > 12 ? 74 : 84, lineHeight: 0.92, color: OSSO, maxWidth: 520, marginTop: 10 }}>{n.artista}</div>
        <div style={{ fontFamily: ARCHIVO, fontWeight: 800, fontSize: 36, letterSpacing: "0.12em", color: PRETO, background: cor, alignSelf: "flex-start", padding: "10px 22px", borderRadius: 12, marginTop: 6 }}>{`ABRE ${n.hora}`}</div>
      </div>
    </div>
  );
};

export const FechadoStory: React.FC<P> = ({ noites, fechadas, titulo = "AGENDA ATUALIZADA" }) => {
  const top0 = 500;
  const fim = 1730;
  const gap = 30;
  const nFech = noites.filter((n) => fechadas.includes(n.data)).length;
  const nAb = noites.length - nFech;
  // aberta = 3 partes, fechada = 1 parte
  const unidade = (fim - top0 - gap * (noites.length - 1)) / (nAb * 3 + nFech);
  let y = top0;
  const pos = noites.map((n) => {
    const fechada = fechadas.includes(n.data);
    const h = fechada ? unidade : unidade * 3;
    const p = { n, fechada, top: y, h };
    y += h + gap;
    return p;
  });
  return (
    <AbsoluteFill style={{ background: PRETO, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 18%, rgba(200,210,0,.14) 0%, rgba(200,210,0,0) 60%)" }} />
      <Img src={staticFile("logos/butiquim-branco-h.png")} style={{ position: "absolute", left: 540 - 170, top: 200, width: 340 }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 320, textAlign: "center", fontFamily: BIG, fontWeight: 900, fontSize: 96, color: OSSO, lineHeight: 1 }}>{titulo}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 426, textAlign: "center", fontFamily: ARCHIVO, fontWeight: 700, fontSize: 28, letterSpacing: "0.3em", color: LIMA }}>ESTE FIM DE SEMANA</div>
      {pos.map((p) => (p.fechada ? <FaixaFechada key={p.n.data} n={p.n} top={p.top} h={p.h} /> : <FaixaAberta key={p.n.data} n={p.n} top={p.top} h={p.h} />))}
      <div style={{ position: "absolute", left: 0, right: 0, top: fim + 36, textAlign: "center", fontFamily: ARCHIVO, fontWeight: 800, fontSize: 30, letterSpacing: "0.24em", color: OSSO }}>TE VEJO NA ESQUINA</div>
      <Vignette strength={0.45} />
      <Grain opacity={0.1} />
    </AbsoluteFill>
  );
};
