import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { ARCHIVO, BIG } from "../fonts";
import { Grain, Vignette } from "../shared/fx";
import { Noite } from "../data";

// AVISO DE CASA FECHADA (23/10/2026): story 9:16 com as 3 noites do fim de semana —
// a noite fechada apagada e carimbada, as outras com foto e horário na cor da identidade.
const PRETO = "#0B0B09";
const OSSO = "#F2F0E6";
const LIMA = "#C8D200";
const COR: Record<Noite["key"], string> = { sexta: LIMA, sabado: "#FF2E93", domingo: "#F29A2E" };

type P = { noites: Noite[]; fechadas: string[]; titulo?: string };

const Faixa: React.FC<{ n: Noite; fechada: boolean; top: number; h: number }> = ({ n, fechada, top, h }) => {
  const cor = COR[n.key];
  // foto de corpo inteiro (estreita) amplia e prende no alto pra o rosto caber na faixa
  const alta = n.foto.ratio < 0.5;
  const fotoH = alta ? h * 2.1 : h + 70;
  const fotoW = fotoH * n.foto.ratio;
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top, height: h, borderRadius: 28, overflow: "hidden", background: fechada ? "#1C1C19" : "#16160F", border: `3px solid ${fechada ? "#3A3A35" : cor}` }}>
      {!fechada && (
        <Img src={staticFile(n.foto.src)} style={{ position: "absolute", right: alta ? 10 : -fotoW * 0.08, ...(alta ? { top: 14 } : { bottom: 0 }), height: fotoH, width: fotoW, WebkitMaskImage: "linear-gradient(270deg, #000 55%, transparent 100%)", maskImage: "linear-gradient(270deg, #000 55%, transparent 100%)" }} />
      )}
      <div style={{ position: "absolute", left: 44, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 10, opacity: fechada ? 0.55 : 1 }}>
        <div style={{ fontFamily: ARCHIVO, fontWeight: 900, fontSize: 40, letterSpacing: "0.14em", color: fechada ? OSSO : cor }}>{n.diaSemana}</div>
        <div style={{ fontFamily: BIG, fontWeight: 900, fontSize: 120, lineHeight: 0.85, color: OSSO }}>{`${n.dia}.${n.data.slice(5, 7)}`}</div>
        {!fechada && (
          <>
            <div style={{ fontFamily: BIG, fontWeight: 900, fontSize: n.artista.length > 12 ? 58 : 66, lineHeight: 0.95, color: OSSO, maxWidth: 520, marginTop: 6 }}>{n.artista}</div>
            <div style={{ fontFamily: ARCHIVO, fontWeight: 800, fontSize: 30, letterSpacing: "0.12em", color: PRETO, background: cor, alignSelf: "flex-start", padding: "8px 18px", borderRadius: 10, marginTop: 4 }}>{`ABRE ${n.hora}`}</div>
          </>
        )}
      </div>
      {fechada && (
        <div style={{ position: "absolute", right: 56, top: "50%", transform: "translateY(-50%) rotate(-8deg)", border: `8px solid ${OSSO}`, borderRadius: 18, padding: "10px 30px 6px", fontFamily: BIG, fontWeight: 900, fontSize: 120, lineHeight: 1, color: OSSO, letterSpacing: "0.04em" }}>
          FECHADO
        </div>
      )}
    </div>
  );
};

export const FechadoStory: React.FC<P> = ({ noites, fechadas, titulo = "AGENDA ATUALIZADA" }) => {
  const h = 380;
  const gap = 32;
  const top0 = 500;
  return (
    <AbsoluteFill style={{ background: PRETO, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 18%, rgba(200,210,0,.14) 0%, rgba(200,210,0,0) 60%)" }} />
      <Img src={staticFile("logos/butiquim-branco-h.png")} style={{ position: "absolute", left: 540 - 170, top: 200, width: 340 }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 320, textAlign: "center", fontFamily: BIG, fontWeight: 900, fontSize: 96, color: OSSO, lineHeight: 1 }}>{titulo}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 426, textAlign: "center", fontFamily: ARCHIVO, fontWeight: 700, fontSize: 28, letterSpacing: "0.3em", color: LIMA }}>ESTE FIM DE SEMANA</div>
      {noites.map((n, i) => (
        <Faixa key={n.data} n={n} fechada={fechadas.includes(n.data)} top={top0 + i * (h + gap)} h={h} />
      ))}
      <div style={{ position: "absolute", left: 0, right: 0, top: top0 + noites.length * (h + gap) + 20, textAlign: "center", fontFamily: ARCHIVO, fontWeight: 800, fontSize: 30, letterSpacing: "0.24em", color: OSSO }}>TE VEJO NA ESQUINA</div>
      <Vignette strength={0.45} />
      <Grain opacity={0.1} />
    </AbsoluteFill>
  );
};
