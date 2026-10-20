import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame } from "remotion";
import { BANGERS, LUCKIEST, ARCHIVO } from "../fonts";
import { Cutout, clamp, useFade, useSpr } from "../shared/fx";
import { RingPx } from "../shared/Ring3D";
import { DIM, Formato, Noite, SUBESTILO } from "../data";

// SABADÁ D — "Gibi do Butica": página de história em quadrinhos — amarelo, vermelho e azul, retícula de pontos,
// raios pop, balão de fala "SABADÁ!", onomatopeia com o estilo e caixas de legenda. Paleta própria: o lima da
// marca fica só no "O" pequeno. (Substitui o "Pôster de Cinema", reprovado 20/10: parecido com outra ID e
// tudo preto/branco/verde.)
const AMARELO = "#FFD60A";
const VERMELHO = "#E63946";
const AZUL = "#1E8BD9";
const CIANO = "#5BD1F5";
const NAVY = "#141A3A";
const BRANCO = "#FFFDF5";

// contorno grosso de quadrinho (branco + navy) em volta do recorte
const CONTORNO = [0, 45, 90, 135, 180, 225, 270, 315].map((a) => `drop-shadow(${Math.cos((a * Math.PI) / 180) * 7}px ${Math.sin((a * Math.PI) / 180) * 7}px 0 ${BRANCO})`).join(" ") + " " + [0, 90, 180, 270].map((a) => `drop-shadow(${Math.cos((a * Math.PI) / 180) * 12}px ${Math.sin((a * Math.PI) / 180) * 12}px 0 ${NAVY})`).join(" ");

const Pagina: React.FC<{ w: number; h: number; cx: number; cy: number }> = ({ w, h, cx, cy }) => {
  const frame = useCurrentFrame();
  return (
    <>
      <AbsoluteFill style={{ background: AMARELO }} />
      {/* raios pop girando devagar */}
      <AbsoluteFill style={{ background: `repeating-conic-gradient(from ${frame * 0.15}deg at ${cx}px ${cy}px, ${AZUL} 0deg 9deg, ${CIANO} 9deg 18deg)`, opacity: 0.95 }} />
      {/* retícula vermelha, mais densa embaixo */}
      <AbsoluteFill style={{ backgroundImage: `radial-gradient(circle, ${VERMELHO} 2.4px, transparent 3px)`, backgroundSize: "16px 16px", opacity: 0.55, WebkitMaskImage: "linear-gradient(180deg, transparent 20%, #000 75%)" }} />
      <AbsoluteFill style={{ backgroundImage: `radial-gradient(circle, ${NAVY} 1.6px, transparent 2.2px)`, backgroundSize: "12px 12px", opacity: 0.18 }} />
      {/* moldura do quadrinho */}
      <div style={{ position: "absolute", inset: 18, border: `10px solid ${NAVY}`, boxShadow: `inset 0 0 0 6px ${BRANCO}` }} />
    </>
  );
};

// balão de fala com "SABADÁ!"
const Balao: React.FC<{ x: number; y: number; w: number; size: number; delay: number }> = ({ x, y, w, size, delay }) => {
  const s = useSpr(delay, { damping: 9, stiffness: 140 });
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, transform: `scale(${s}) rotate(-3deg)`, transformOrigin: "50% 100%" }}>
      <div style={{ position: "relative", background: BRANCO, border: `9px solid ${NAVY}`, borderRadius: 60, padding: "14px 30px 20px", textAlign: "center", boxShadow: `12px 12px 0 ${NAVY}` }}>
        <div style={{ fontFamily: BANGERS, fontSize: size, lineHeight: 0.9, color: NAVY, letterSpacing: "0.04em", textShadow: `5px 5px 0 ${VERMELHO}` }}>SABADÁ!</div>
        <div style={{ fontFamily: LUCKIEST, fontSize: size * 0.3, lineHeight: 1, color: VERMELHO, marginTop: 6, letterSpacing: "0.04em" }}>DO BUTICA</div>
      </div>
      <svg width={120} height={90} viewBox="0 0 120 90" style={{ position: "absolute", left: w * 0.1, bottom: -74 }}>
        <polygon points="10,0 110,0 40,86" fill={BRANCO} stroke={NAVY} strokeWidth={9} strokeLinejoin="round" />
        <rect x={10} y={-10} width={100} height={20} fill={BRANCO} />
      </svg>
    </div>
  );
};

// onomatopeia estrelada com o estilo musical
const Estouro: React.FC<{ n: Noite; x: number; y: number; d: number; delay: number }> = ({ n, x, y, d, delay }) => {
  const s = useSpr(delay, { damping: 8, stiffness: 180 });
  const frame = useCurrentFrame();
  const pts = Array.from({ length: 24 }, (_, i) => { const a = (i * Math.PI) / 12; const r = i % 2 ? 0.72 : 1; return `${50 + Math.cos(a) * 50 * r},${50 + Math.sin(a) * 50 * r}`; }).join(" ");
  return (
    <div style={{ position: "absolute", left: x - d / 2, top: y - d / 2, width: d, height: d, transform: `scale(${s}) rotate(${-8 + Math.sin(frame / 30) * 3}deg)` }}>
      <svg width={d} height={d} viewBox="0 0 100 100" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <polygon points={pts} fill={VERMELHO} stroke={NAVY} strokeWidth={4} strokeLinejoin="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: BRANCO, textAlign: "center" }}>
        <div style={{ fontFamily: BANGERS, fontSize: d * 0.26, lineHeight: 0.9, letterSpacing: "0.04em", textShadow: `3px 3px 0 ${NAVY}` }}>{n.estilo}!</div>
        <div style={{ fontFamily: LUCKIEST, fontSize: d * 0.1, color: AMARELO, marginTop: 2 }}>{SUBESTILO}</div>
      </div>
    </div>
  );
};

// caixa de legenda de quadrinho (amarela, borda navy)
const Legenda: React.FC<{ x?: number; y: number; w?: number; delay: number; children: React.ReactNode; rot?: number; bg?: string; align?: "left" | "center" }> = ({ x, y, w, delay, children, rot = 0, bg = AMARELO, align = "left" }) => {
  const s = useSpr(delay, { damping: 13 });
  return (
    <div style={{ position: "absolute", left: x ?? 0, right: x === undefined ? 0 : undefined, top: y, width: w, marginLeft: x === undefined ? "auto" : undefined, marginRight: x === undefined ? "auto" : undefined, transform: `rotate(${rot}deg) translateY(${(1 - s) * 40}px)`, opacity: s, background: bg, border: `7px solid ${NAVY}`, boxShadow: `9px 9px 0 ${NAVY}`, padding: "12px 22px 14px", textAlign: align, boxSizing: "border-box" }}>
      {children}
    </div>
  );
};

type L = { balX: number; balY: number; balW: number; balSize: number; artH: number; artTop: number; estX: number; estY: number; estD: number; dataY: number; nomeY: number; listaY: number; cta?: boolean };
const LAYOUT: Record<"feed" | "story", L> = {
  feed: { balX: 40, balY: 60, balW: 520, balSize: 118, artH: 930, artTop: 340, estX: 890, estY: 230, estD: 290, dataY: 560, nomeY: 1000, listaY: 1190 },
  story: { balX: 60, balY: 250, balW: 660, balSize: 160, artH: 1180, artTop: 470, estX: 890, estY: 440, estD: 320, dataY: 790, nomeY: 1330, listaY: 1560, cta: true },
};

export const SabadoD: React.FC<{ n: Noite; fmt: Formato }> = ({ n, fmt }) => {
  const video = fmt === "broll";
  const f = video ? "story" : fmt;
  const L = LAYOUT[f];
  const { w, h } = DIM[f];
  const frame = useCurrentFrame();
  const art = useSpr(14, { damping: 12, stiffness: 110 });
  const anel = useSpr(50, { damping: 10, stiffness: 150 });
  const push = interpolate(frame, [0, 240], [1, 1.025], clamp);
  const nomeSize = Math.min(132, (w - 160) / (n.artista.length * 0.5));
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Pagina w={w} h={h} cx={540} cy={L.artTop + L.artH * 0.4} />
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "50% 45%" }}>
        {video ? (
          <div style={{ position: "absolute", left: 60, top: 500, width: 960, height: 790, transform: `rotate(-1deg) scale(${art})`, border: `10px solid ${NAVY}`, boxShadow: `inset 0 0 0 6px ${BRANCO}, 12px 12px 0 ${NAVY}`, background: NAVY, overflow: "hidden" }}>
            <OffthreadVideo src={staticFile(n.clip)} style={{ position: "absolute", inset: 6, width: "calc(100% - 12px)", height: "calc(100% - 12px)", objectFit: "cover", objectPosition: `50% ${Math.max(0, Math.round(((-(n.clipTop ?? -380)) * 0.96 / 917) * 100))}%`, filter: "saturate(1.25) contrast(1.1)" }} volume={(fr) => interpolate(fr, [0, 8, 285, 300], [0, 1, 1, 0], clamp)} />
            <AbsoluteFill style={{ backgroundImage: `radial-gradient(circle, ${NAVY} 1.2px, transparent 1.8px)`, backgroundSize: "9px 9px", opacity: 0.12 }} />
          </div>
        ) : (
          <Cutout src={n.foto.src} ratio={n.foto.ratio} height={L.artH} cx={540} top={L.artTop + (1 - art) * 220} fadeFrom={0.78} filter={`saturate(1.25) contrast(1.12) ${CONTORNO}`} style={{ opacity: art }} />
        )}
      </AbsoluteFill>
      {/* logo em navy no canto */}
      <Img src={staticFile("logos/butiquim-mono-branco-h.png")} style={{ position: "absolute", width: f === "feed" ? 190 : 220, right: 54, top: f === "feed" ? 52 : 220, filter: "invert(1) brightness(0.35) sepia(1) hue-rotate(200deg) saturate(3)" }} />
      <Balao x={L.balX} y={L.balY} w={L.balW} size={L.balSize} delay={6} />
      <Estouro n={n} x={L.estX} y={video ? 330 : L.estY} d={L.estD} delay={26} />
      <Legenda x={w - 330} y={video ? 1130 : L.dataY} w={290} delay={32} rot={4}>
        <div style={{ fontFamily: LUCKIEST, fontSize: 20, color: NAVY, letterSpacing: "0.06em" }}>ENQUANTO ISSO, NO {n.diaSemana}...</div>
        <div style={{ fontFamily: BANGERS, fontSize: 96, lineHeight: 0.9, color: VERMELHO, textShadow: `4px 4px 0 ${NAVY}` }}>{n.dia} {n.mes}</div>
        <div style={{ fontFamily: LUCKIEST, fontSize: 30, color: NAVY }}>ÀS {n.hora}</div>
      </Legenda>
      {/* nome do artista: faixa vermelha torta, letra de gibi */}
      <Legenda y={L.nomeY} w={w - 100} delay={40} rot={-2} bg={VERMELHO} align="center">
        <div style={{ fontFamily: LUCKIEST, fontSize: 22, color: AMARELO, letterSpacing: "0.12em" }}>NO PALCO DO BUTICA</div>
        <div style={{ fontFamily: BANGERS, fontSize: nomeSize, lineHeight: 0.95, color: BRANCO, letterSpacing: "0.04em", whiteSpace: "nowrap", textShadow: `6px 6px 0 ${NAVY}` }}>{n.artista}</div>
      </Legenda>
      <Legenda y={L.listaY} w={w - 100} delay={48} bg={BRANCO} align="center">
        <div style={{ fontFamily: LUCKIEST, fontSize: 30, color: NAVY, letterSpacing: "0.02em", whiteSpace: "nowrap" }}>
          {n.lista[0]} <span style={{ color: VERMELHO }}>★</span> {n.lista[1]}
        </div>
        <div style={{ fontFamily: ARCHIVO, fontWeight: 600, fontSize: 18, color: NAVY, opacity: 0.75, marginTop: 4 }}>{n.obs}</div>
        {L.cta && <div style={{ fontFamily: LUCKIEST, fontSize: 26, color: VERMELHO, marginTop: 6 }}>NOME NA LISTA: LINK NA BIO!</div>}
      </Legenda>
      {/* o "O" do logo como adesivo lima, único verde da peça */}
      <RingPx width={w} height={h} look="lima" flat cx={95} cy={h - 70} ringH={120 * interpolate(anel, [0, 1], [1.6, 1])} rotY={0.3} rotZ={-0.2} envIntensity={0.9} style={{ opacity: anel, filter: `drop-shadow(0 0 0 ${NAVY}) drop-shadow(5px 5px 0 ${NAVY})` }} />
    </AbsoluteFill>
  );
};
