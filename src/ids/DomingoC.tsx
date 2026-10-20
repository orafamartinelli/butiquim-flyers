import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { COURIER, BEBAS, ARCHIVO } from "../fonts";
import { Grain, Vignette, clamp, useFade, useSpr } from "../shared/fx";
import { RingPx } from "../shared/Ring3D";
import { rnd } from "../shared/icones";
import { DIM, Formato, Noite, SUBESTILO } from "../data";

// SAIDEIRA C — "Comanda": a conta da última rodada saindo da impressora térmica, em cima da mesa de madeira;
// o artista impresso na comanda (risografia preto + lima), o "O" do logo como peso de papel
const PAPEL = "#F7F4EA";
const TINTA = "#1C1A17";
const LIMA = "#C8D200";
const MADEIRA = "#2B1A10";

const Mesa: React.FC = () => (
  <>
    <AbsoluteFill style={{ background: `linear-gradient(180deg, #3a2316 0%, ${MADEIRA} 50%, #150b06 100%)` }} />
    <AbsoluteFill style={{ backgroundImage: "repeating-linear-gradient(94deg, rgba(0,0,0,.22) 0 3px, transparent 3px 14px, rgba(255,255,255,.03) 14px 16px, transparent 16px 41px)", opacity: 0.9 }} />
    <AbsoluteFill style={{ backgroundImage: "repeating-linear-gradient(90deg, rgba(0,0,0,.35) 0 2px, transparent 2px 180px)" }} />
    {/* marcas de copo */}
    {[[160, 300, 190], [900, 1180, 160], [820, 120, 120]].map(([x, y, d], i) => (
      <div key={i} style={{ position: "absolute", left: x - d / 2, top: y - d / 2, width: d, height: d, borderRadius: "50%", border: "14px solid rgba(255,230,180,.07)", boxShadow: "0 0 10px rgba(255,230,180,.05)" }} />
    ))}
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 35%, rgba(255,200,120,.16) 0%, rgba(0,0,0,0) 60%)" }} />
  </>
);

// serrilha do papel térmico (topo e pé)
const serrilha = (dentes: number, prof: number) => {
  const pts: string[] = [];
  for (let i = 0; i <= dentes; i++) pts.push(`${(i / dentes) * 100}% ${i % 2 ? 0 : prof}%`);
  for (let i = dentes; i >= 0; i--) pts.push(`${(i / dentes) * 100}% ${100 - (i % 2 ? 0 : prof)}%`);
  return `polygon(${pts.join(",")})`;
};

const Linha: React.FC<{ a: string; b: string; size?: number; bold?: boolean; o?: number }> = ({ a, b, size = 27, bold, o = 1 }) => (
  <div style={{ display: "flex", alignItems: "baseline", gap: 10, fontFamily: COURIER, fontWeight: bold ? 700 : 400, fontSize: size, color: TINTA, opacity: o, lineHeight: 1.25 }}>
    <span style={{ whiteSpace: "nowrap" }}>{a}</span>
    <span style={{ flex: 1, borderBottom: `2px dotted rgba(28,26,23,.55)`, transform: "translateY(-6px)" }} />
    <span style={{ whiteSpace: "nowrap", fontWeight: 700 }}>{b}</span>
  </div>
);

const Tracos: React.FC<{ m?: number }> = ({ m = 8 }) => (
  <div style={{ fontFamily: COURIER, fontSize: 22, color: TINTA, opacity: 0.7, letterSpacing: "0.02em", margin: `${m}px 0`, whiteSpace: "nowrap", overflow: "hidden" }}>- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -</div>
);

const Barras: React.FC<{ w: number; h: number }> = ({ w, h }) => (
  <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: h, width: w }}>
    {Array.from({ length: 58 }, (_, i) => <div key={i} style={{ width: 2 + Math.floor(rnd(i + 5) * 4) * 2, height: "100%", background: TINTA, opacity: rnd(i + 9) > 0.15 ? 1 : 0 }} />)}
  </div>
);

// carimbo "SAIDEIRA" em lima, tinta falhada
const Carimbo: React.FC<{ x: number; y: number; delay: number; rot?: number }> = ({ x, y, delay, rot = -12 }) => {
  const s = useSpr(delay, { damping: 9, stiffness: 170 });
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `rotate(${rot}deg) scale(${interpolate(s, [0, 1], [1.9, 1])})`, opacity: Math.min(1, s * 1.4), mixBlendMode: "multiply" }}>
      <div style={{ border: `6px solid ${LIMA}`, borderRadius: 14, padding: "6px 18px 8px", textAlign: "center", WebkitMaskImage: "radial-gradient(circle at 60% 40%, #000 55%, rgba(0,0,0,.7) 100%)" }}>
        <div style={{ fontFamily: BEBAS, fontSize: 86, lineHeight: 0.9, color: LIMA, letterSpacing: "0.04em" }}>SAIDEIRA</div>
        <div style={{ fontFamily: ARCHIVO, fontWeight: 900, fontSize: 18, letterSpacing: "0.3em", color: LIMA, paddingLeft: "0.3em" }}>ÚLTIMA RODADA</div>
      </div>
    </div>
  );
};

type L = { px: number; py: number; pw: number; ph: number; fotoH: number; ringCx: number; ringCy: number; ringH: number; cta?: boolean };
const LAYOUT: Record<"feed" | "story", L> = {
  feed: { px: 150, py: -24, pw: 780, ph: 1340, fotoH: 470, ringCx: 975, ringCy: 640, ringH: 270 },
  story: { px: 150, py: 120, pw: 780, ph: 1700, fotoH: 700, ringCx: 975, ringCy: 900, ringH: 290, cta: true },
};

export const DomingoC: React.FC<{ n: Noite; fmt: Formato }> = ({ n, fmt }) => {
  const f = fmt === "broll" ? "story" : fmt;
  const L = LAYOUT[f];
  const { w, h } = DIM[f];
  const frame = useCurrentFrame();
  // a comanda sai da impressora: desce de cima revelando linha a linha
  const sai = interpolate(frame, [0, 70], [0, 1], { ...clamp });
  const anel = useSpr(40, { damping: 14, stiffness: 90 });
  const foto = useFade(24, 40);
  const nomeSize = Math.min(100, (L.pw - 90) / (n.artista.length * 0.44));
  const num = `0${n.dia}${n.mes.slice(0, 1)}`;
  const linhaOk = (i: number) => (sai > 0.3 + i * 0.07 ? 1 : 0);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Mesa />
      <div style={{ position: "absolute", left: L.px, top: L.py - (1 - sai) * L.ph, width: L.pw, height: L.ph, transform: "rotate(1.2deg)", transformOrigin: "50% 0%", filter: "drop-shadow(0 30px 40px rgba(0,0,0,.6))" }}>
        <div style={{ position: "absolute", inset: 0, background: PAPEL, clipPath: serrilha(38, 1.1), padding: "48px 46px 40px", boxSizing: "border-box", backgroundImage: "repeating-linear-gradient(180deg, rgba(0,0,0,.025) 0 1px, transparent 1px 5px)" }}>
          {/* cabeçalho */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: linhaOk(0) }}>
            <Img src={staticFile("logos/butiquim-mono-branco-h.png")} style={{ width: 250, filter: "invert(1) brightness(0.1)" }} />
            <div style={{ fontFamily: COURIER, fontSize: 20, color: TINTA, letterSpacing: "0.1em", marginTop: 8, opacity: 0.8 }}>MARINGÁ · PR  ·  A ESQUINA</div>
          </div>
          <Tracos />
          <div style={{ opacity: linhaOk(1) }}>
            <Linha a={`COMANDA Nº ${num}`} b={`MESA: ESQUINA`} size={24} />
            <Linha a={`${n.diaSemana} ${n.dia}/${String(["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"].indexOf(n.mes) + 1).padStart(2, "0")}`} b={`ABRE ${n.hora}`} size={24} />
          </div>
          <Tracos />
          {/* o artista impresso: risografia preto + lima */}
          <div style={{ position: "relative", height: L.fotoH, margin: "4px 0 10px", overflow: "hidden", opacity: foto }}>
            <div style={{ position: "absolute", left: "8%", right: "8%", top: 30, bottom: 0, background: LIMA, transform: "skewY(-2deg)", opacity: 0.9 }} />
            <Img src={staticFile(n.foto.src)} style={{ position: "absolute", height: L.fotoH * 1.12, width: L.fotoH * 1.12 * n.foto.ratio, left: `calc(50% - ${(L.fotoH * 1.12 * n.foto.ratio) / 2}px)`, top: 0, filter: "grayscale(1) contrast(1.4) brightness(1.05)", mixBlendMode: "multiply", WebkitMaskImage: "linear-gradient(180deg, #000 85%, transparent 100%)" }} />
            {/* retícula de impressão */}
            <AbsoluteFill style={{ backgroundImage: "radial-gradient(circle, rgba(247,244,234,.9) 0.9px, transparent 1.4px)", backgroundSize: "5px 5px", opacity: 0.35, mixBlendMode: "screen" }} />
          </div>
          <div style={{ fontFamily: COURIER, fontSize: 21, color: TINTA, opacity: 0.8 * linhaOk(2), letterSpacing: "0.1em" }}>ATRAÇÃO DA NOITE:</div>
          <div style={{ fontFamily: BEBAS, fontSize: nomeSize, lineHeight: 0.95, color: TINTA, letterSpacing: "0.02em", whiteSpace: "nowrap", opacity: linhaOk(2), marginBottom: 6 }}>{n.artista}</div>
          <div style={{ opacity: linhaOk(3) }}>
            <Linha a="1x  SAIDEIRA DA SEMANA" b={`${n.hora}`} />
            <Linha a={`1x  ${n.estilo} ${SUBESTILO.toUpperCase()}`} b="A NOITE TODA" />
          </div>
          <Tracos />
          <div style={{ opacity: linhaOk(4) }}>
            <Linha a={`LISTA FEM. ATÉ ${n.lista[0].split("ATÉ ")[1]}`} b="FREE" bold />
            <Linha a={`LISTA MASC. ATÉ ${n.lista[1].split("ATÉ ")[1]}`} b="R$ 20" bold />
            <div style={{ fontFamily: COURIER, fontSize: 16, color: TINTA, opacity: 0.75, marginTop: 4, lineHeight: 1.2, whiteSpace: "nowrap" }}>* {n.obs}</div>
            {L.cta && <div style={{ fontFamily: COURIER, fontWeight: 700, fontSize: 22, color: TINTA, marginTop: 8 }}>&gt;&gt; NOME NA LISTA: LINK NA BIO</div>}
          </div>
          <Tracos />
          <div style={{ opacity: linhaOk(5) }}>
            <Linha a="TOTAL" b="SAUDADE DE SEGUNDA" size={30} bold />
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 18, opacity: linhaOk(6) }}>
            <Barras w={L.pw - 160} h={62} />
            <div style={{ fontFamily: COURIER, fontSize: 20, color: TINTA, letterSpacing: "0.3em", marginTop: 8 }}>*** TE VEJO NA ESQUINA ***</div>
          </div>
        </div>
      </div>
      <Carimbo x={L.px + L.pw - 440} y={L.py + L.ph - 250} delay={60} rot={-8} />
      {/* o "O" do logo pousa na comanda como peso de papel */}
      <RingPx width={w} height={h} look="lima" cx={L.ringCx} cy={L.ringCy + 60 * sai} ringH={L.ringH * interpolate(anel, [0, 1], [1.3, 1])} rotY={interpolate(anel, [0, 1], [1.4, 0.4]) + Math.sin(frame / 50) * 0.06} rotX={0.35} envIntensity={1} lights={[{ color: "#ffd9a0", pos: [-3, 3, 3], intensity: 4 }]} style={{ opacity: anel, filter: "drop-shadow(0 26px 28px rgba(0,0,0,.55))" }} />
      <Grain opacity={0.14} />
      <Vignette strength={0.55} />
    </AbsoluteFill>
  );
};
