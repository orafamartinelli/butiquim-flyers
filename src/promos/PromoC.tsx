import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ANTON, ARCHIVO } from "../fonts";
import { Grain, Logo, Vignette, clamp, useSpr } from "../shared/fx";
import { DadosPromo, FmtPromo, Latas, PROMO_DUR } from "./Promo";

// MOTION 3 — "Cartaz de boteco": foge do preto e lima. Abre com cortes de cor batendo as palavras,
// depois cartaz com raios girando, garrafas pulando, faixa de papel, carimbo e letreiro correndo.
// A cor principal acompanha a promo (Smirnoff vermelho, Aperol laranja, Red Label âmbar...).
const PAPEL = "#F4EAD2", TINTA = "#14100C", AMARELO = "#FFD23F";

type L = { H: number; logoTop: number; logoW: number; tagY: number; gW: number; gTop: number; raioY: number; faixaY: number; faixaH: number; chamada: number; destaque: number; validade: number; letreiroY: number; legalY: number; seloX: number; seloY: number; selo: number };
const LAY: Record<FmtPromo, L> = {
  feed: { H: 1350, logoTop: 28, logoW: 200, tagY: 92, gW: 500, gTop: 130, raioY: 500, faixaY: 846, faixaH: 336, chamada: 54, destaque: 172, validade: 42, letreiroY: 1204, legalY: 1294, seloX: 846, seloY: 150, selo: 196 },
  story: { H: 1920, logoTop: 210, logoW: 230, tagY: 286, gW: 610, gTop: 330, raioY: 820, faixaY: 1216, faixaH: 374, chamada: 60, destaque: 190, validade: 46, letreiroY: 1606, legalY: 1700, seloX: 836, seloY: 372, selo: 214 },
};

const Raios: React.FC<{ cor: string; escuro: string; y: number }> = ({ cor, escuro, y }) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{ background: `repeating-conic-gradient(from ${frame * 0.5}deg at 50% ${y}px, ${cor} 0deg 11deg, ${escuro} 11deg 22deg)` }} />;
};

const Retícula: React.FC<{ y: number }> = ({ y }) => (
  <AbsoluteFill style={{ backgroundImage: "radial-gradient(circle, rgba(0,0,0,.34) 2.4px, transparent 2.9px)", backgroundSize: "13px 13px", WebkitMaskImage: `radial-gradient(circle at 50% ${y}px, rgba(0,0,0,0) 36%, rgba(0,0,0,.95) 82%)` }} />
);

// divide a chamada em duas linhas para os cortes de abertura
const duasLinhas = (t: string) => {
  const p = t.split(" ");
  const meio = Math.ceil(p.length / 2);
  return [p.slice(0, meio).join(" "), p.slice(meio).join(" ")].filter(Boolean);
};

const Corte: React.FC<{ fundo: string; cor: string; linhas: string[]; H: number; de: number; ate: number }> = ({ fundo, cor, linhas, H, de, ate }) => {
  const frame = useCurrentFrame();
  if (frame < de || frame >= ate) return null;
  const zoom = interpolate(frame, [de, ate], [1.14, 1], clamp);
  const maior = Math.max(...linhas.map((l) => l.length));
  const t = Math.min(H * 0.24, 1000 / (maior * 0.47));
  return (
    <AbsoluteFill style={{ background: fundo, alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      {linhas.map((l, i) => (
        <div key={i} style={{ fontFamily: ANTON, fontSize: t, lineHeight: 1.08, color: cor, transform: `scale(${zoom})`, whiteSpace: "nowrap" }}>{l}</div>
      ))}
    </AbsoluteFill>
  );
};

const Carimbo: React.FC<{ txt: string; x: number; y: number; d: number; cor: string; ini: number }> = ({ txt, x, y, d, cor, ini }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [ini, ini + 8], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const treme = frame > ini + 8 && frame < ini + 16 ? Math.sin(frame * 3) * 3 : 0;
  return (
    <div style={{ position: "absolute", left: x - d / 2, top: y, width: d, height: d, borderRadius: "50%", background: AMARELO, border: `7px solid ${TINTA}`, outline: `3px dashed ${TINTA}`, outlineOffset: -18, display: "flex", alignItems: "center", justifyContent: "center", color: cor, fontFamily: ANTON, fontSize: txt.length > 3 ? d * 0.26 : d * 0.5, lineHeight: 1, opacity: p > 0 ? 1 : 0, transform: `rotate(${-12 + treme}deg) scale(${interpolate(p, [0, 1], [2.6, 1])})`, boxShadow: "0 14px 28px rgba(0,0,0,.45)" }}>{txt}</div>
  );
};

const Letreiro: React.FC<{ y: number; txt: string }> = ({ y, txt }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, height: 72, background: TINTA, overflow: "hidden", display: "flex", alignItems: "center" }}>
      <div style={{ whiteSpace: "nowrap", fontFamily: ANTON, fontSize: 40, letterSpacing: "0.05em", color: AMARELO, transform: `translateX(${-(frame * 2.6) % 1400}px)` }}>{`${txt}  ★  `.repeat(6)}</div>
    </div>
  );
};

export const PromoC: React.FC<{ d: DadosPromo; fmt: FmtPromo; cor?: string; escuro?: string; selo?: string }> = ({ d, fmt, cor = "#C8102E", escuro = "#9E0B23", selo = "2X" }) => {
  const L = LAY[fmt];
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T0 = 36; // fim dos cortes de abertura
  const pula = (atraso: number) => spring({ frame: frame - T0 - atraso, fps, config: { damping: 9, stiffness: 120 } });
  const g1 = pula(2), g2 = pula(8);
  const faixa = useSpr(T0 + 14, { damping: 14, stiffness: 110 });
  const tag = useSpr(T0 + 22, { damping: 12 });
  const dist = d.duas ? L.gW * (d.dist ?? 0.27) : 0;
  const gW = L.gW * (d.fator ?? 1);
  const gTop = L.gTop + L.gW * (d.dy ?? 0);
  const balanco = Math.sin(frame / 18) * 1.6;
  const push = interpolate(frame, [T0, PROMO_DUR], [1, 1.04], clamp);
  const [l1, l2] = duasLinhas(d.chamada);
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: cor }}>
      <Raios cor={cor} escuro={escuro} y={L.raioY} />
      <Retícula y={L.raioY} />
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: `50% ${L.raioY}px` }}>
        {d.lata && <Latas src={d.lata} gW={L.gW} top={L.gTop} abre={1} entra={g2} />}
        {d.duas && <Img src={staticFile(d.garrafa)} style={{ position: "absolute", width: gW, left: 540 - dist - gW / 2, top: gTop, transform: `translateY(${(1 - g1) * 700}px) rotate(${-6 + balanco}deg)`, filter: "drop-shadow(0 26px 34px rgba(0,0,0,.55))" }} />}
        <Img src={staticFile(d.garrafa)} style={{ position: "absolute", width: gW, left: 540 + dist - gW / 2, top: gTop, transform: `translateY(${(1 - g2) * 700}px) rotate(${d.duas ? 6 - balanco : balanco * 0.5}deg)`, filter: "drop-shadow(0 26px 34px rgba(0,0,0,.55))" }} />
      </AbsoluteFill>
      <Logo width={L.logoW} top={L.logoTop} mono />
      <div style={{ position: "absolute", top: L.tagY, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ transform: `rotate(-2deg) scale(${tag})`, background: TINTA, color: PAPEL, fontFamily: ARCHIVO, fontWeight: 900, fontStyle: "italic", fontSize: 32, padding: "5px 20px 7px" }}>{d.noite}</div>
      </div>
      {/* faixa de papel com a oferta */}
      <div style={{ position: "absolute", left: -30, right: -30, top: L.faixaY, height: L.faixaH, background: PAPEL, transform: `rotate(-2deg) translateX(${(1 - faixa) * -1250}px)`, boxShadow: "0 22px 40px rgba(0,0,0,.5)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", clipPath: "polygon(0 2%, 100% 0, 100% 98%, 0 100%)" }}>
        <div style={{ fontFamily: ARCHIVO, fontWeight: 900, fontSize: L.chamada, color: TINTA, lineHeight: 1.1 }}>{d.chamada}</div>
        <div style={{ fontFamily: ANTON, fontSize: L.destaque, color: cor, lineHeight: 1.08, whiteSpace: "nowrap" }}>{d.destaque}</div>
        <div style={{ fontFamily: ARCHIVO, fontWeight: 900, fontSize: L.validade, color: TINTA, lineHeight: 1.1 }}>{d.validade}</div>
      </div>
      <Carimbo txt={selo} x={L.seloX} y={L.seloY} d={L.selo} cor={cor} ini={T0 + 36} />
      <Letreiro y={L.letreiroY} txt={`${d.noite}  ★  ${d.validade}  ★  TE VEJO NA ESQUINA`} />
      {!d.semLegal && <div style={{ position: "absolute", top: L.legalY, left: 0, right: 0, textAlign: "center", fontFamily: ARCHIVO, fontWeight: 700, fontSize: 25, color: PAPEL }}>Não guardamos bebidas promocionais</div>}
      <Grain opacity={0.1} />
      <Vignette strength={0.3} />
      {/* cortes de cor na abertura: a oferta inteira em 3 batidas */}
      <Corte fundo={PAPEL} cor={cor} linhas={[l1]} H={L.H} de={0} ate={12} />
      <Corte fundo={TINTA} cor={AMARELO} linhas={[l2 || l1]} H={L.H} de={12} ate={24} />
      <Corte fundo={cor} cor={PAPEL} linhas={[d.destaque]} H={L.H} de={24} ate={T0} />
    </AbsoluteFill>
  );
};
