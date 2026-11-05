import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { ARCHIVO, BIG } from "../fonts";
import { Grain, Logo, Vignette, clamp, useSpr } from "../shared/fx";
import { RingPx } from "../shared/Ring3D";
import { rnd } from "../shared/icones";

// ARTES DE PROMO (sem designer, dez/2026): 1 estática + 2 motions por promo, com efeitos do nosso repertório.
// Efeito A = persiana + partículas · Efeito B = camadas + letras recortadas.
const LIMA = "#C8D200", PRETO = "#0B0B09", OSSO = "#F2F0E6";

export type FmtPromo = "feed" | "story";
export type Efeito = "parado" | "A" | "B";
export const PROMO_DUR = 240;

export type DadosPromo = {
  noite: string; // "SABADÁ DO BUTICA"
  chamada: string; // "GARRAFA DE SMIRNOFF"
  destaque: string; // "EM DOBRO"
  validade: string; // "VÁLIDO ATÉ 00H30"
  garrafa: string; // arquivo em public/
  duas?: boolean; // duas garrafas = promo "em dobro"
};

export const SMIRNOFF_DOBRO: DadosPromo = { noite: "SABADÁ DO BUTICA", chamada: "GARRAFA DE SMIRNOFF", destaque: "EM DOBRO", validade: "VÁLIDO ATÉ 00H30", garrafa: "promos/smirnoff.png", duas: true };

type L = { H: number; logoTop: number; logoW: number; tagY: number; gW: number; gTop: number; ringY: number; ringH: number; chamadaY: number; chamadaT: number; destaqueY: number; destaqueT: number; pilulaY: number; legalY: number };
const LAY: Record<FmtPromo, L> = {
  feed: { H: 1350, logoTop: 30, logoW: 200, tagY: 100, gW: 500, gTop: 140, ringY: 480, ringH: 660, chamadaY: 868, chamadaT: 62, destaqueY: 944, destaqueT: 232, pilulaY: 1196, legalY: 1282 },
  story: { H: 1920, logoTop: 210, logoW: 230, tagY: 290, gW: 610, gTop: 330, ringY: 800, ringH: 800, chamadaY: 1236, chamadaT: 70, destaqueY: 1320, destaqueT: 240, pilulaY: 1600, legalY: 1690 },
};

// a imagem da garrafa tem folga em volta: a garrafa ocupa ~40% da largura do arquivo
const Garrafa: React.FC<{ src: string; w: number; cx: number; top: number; rot?: number; style?: React.CSSProperties }> = ({ src, w, cx, top, rot = 0, style }) => (
  <Img src={staticFile(src)} style={{ position: "absolute", width: w, left: cx - w / 2, top, transform: `rotate(${rot}deg)`, filter: "drop-shadow(0 26px 40px rgba(0,0,0,.65))", ...style }} />
);

const Fundo: React.FC<{ L: L }> = ({ L }) => (
  <>
    <AbsoluteFill style={{ background: PRETO }} />
    <AbsoluteFill style={{ background: `radial-gradient(circle at 540px ${L.ringY}px, rgba(200,210,0,.30) 0%, rgba(200,210,0,0) 56%)` }} />
    <AbsoluteFill style={{ backgroundImage: "radial-gradient(circle, rgba(200,210,0,.5) 1.7px, transparent 2.3px)", backgroundSize: "15px 15px", WebkitMaskImage: `radial-gradient(circle at 540px ${L.ringY}px, rgba(0,0,0,.8) 0%, rgba(0,0,0,0) 60%)`, opacity: 0.32 }} />
  </>
);

const Tag: React.FC<{ txt: string; y: number; s?: number }> = ({ txt, y, s = 1 }) => (
  <div style={{ position: "absolute", top: y, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
    <div style={{ transform: `rotate(-2deg) scale(${s})`, background: LIMA, color: PRETO, fontFamily: ARCHIVO, fontWeight: 900, fontStyle: "italic", fontSize: 34, padding: "5px 20px 7px", letterSpacing: "0.02em", boxShadow: "0 12px 26px rgba(0,0,0,.5)" }}>{txt}</div>
  </div>
);

const Rodape: React.FC<{ L: L; d: DadosPromo; o?: number }> = ({ L, d, o = 1 }) => (
  <>
    <div style={{ position: "absolute", top: L.pilulaY, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ background: OSSO, color: PRETO, borderRadius: 40, padding: "9px 34px 11px", fontFamily: ARCHIVO, fontWeight: 900, fontSize: 40, letterSpacing: "0.04em" }}>{d.validade}</div>
    </div>
    <div style={{ position: "absolute", top: L.legalY, left: 0, right: 0, textAlign: "center", fontFamily: ARCHIVO, fontWeight: 600, fontSize: 25, color: OSSO, opacity: 0.75 * o }}>Não guardamos bebidas promocionais</div>
  </>
);

// ---------- EFEITO A: persiana + partículas ----------
const Persiana: React.FC<{ H: number; n?: number }> = ({ H, n = 10 }) => {
  const frame = useCurrentFrame();
  if (frame > 44) return null;
  const alt = H / n;
  return (
    <AbsoluteFill style={{ perspective: 1800 }}>
      {Array.from({ length: n }, (_, i) => {
        const p = interpolate(frame, [4 + i * 2.2, 18 + i * 2.2], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
        return <div key={i} style={{ position: "absolute", left: 0, right: 0, top: i * alt, height: alt + 1, background: i % 2 ? LIMA : "#D6E014", transformOrigin: "50% 0%", transform: `rotateX(${p * 90}deg)`, opacity: p >= 1 ? 0 : 1 }} />;
      })}
    </AbsoluteFill>
  );
};

const Particulas: React.FC<{ H: number }> = ({ H }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: 34 }, (_, i) => {
        const v = 1.1 + rnd(i * 5 + 1) * 2.2;
        const ciclo = H + 120;
        const y = ((((rnd(i * 5 + 2) * ciclo - frame * v) % ciclo) + ciclo) % ciclo) - 60;
        const x = rnd(i * 5 + 3) * 1080 + Math.sin(frame / 22 + i) * 14;
        const r = 4 + rnd(i * 5 + 4) * 15;
        const op = interpolate(frame, [20, 44], [0, 0.22 + rnd(i * 5 + 6) * 0.42], clamp);
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: r, height: r, borderRadius: "50%", border: `2px solid ${i % 3 ? "rgba(242,240,230,.9)" : LIMA}`, opacity: op }} />;
      })}
    </AbsoluteFill>
  );
};

const LetrasSobem: React.FC<{ txt: string; y: number; t: number; ini: number }> = ({ txt, y, t, ini }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", top: y, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 6, fontFamily: BIG, fontWeight: 900, fontSize: t, lineHeight: 0.9, color: LIMA, textShadow: "0 0 44px rgba(200,210,0,.35)" }}>
      {txt.split("").map((c, i) => {
        const p = interpolate(frame, [ini + i * 2, ini + 13 + i * 2], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.7)) });
        return <span key={i} style={{ display: "inline-block", minWidth: c === " " ? t * 0.2 : undefined, transform: `translateY(${(1 - p) * 90}px)`, opacity: Math.min(1, p * 2) }}>{c}</span>;
      })}
    </div>
  );
};

// ---------- EFEITO B: camadas + letras recortadas ----------
const COR_RECORTE = [[LIMA, PRETO], [OSSO, PRETO], [PRETO, LIMA]] as const;
const Recortes: React.FC<{ txt: string; y: number; t: number; ini: number }> = ({ txt, y, t, ini }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", top: y, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 8 }}>
      {txt.split("").map((c, i) => {
        if (c === " ") return <div key={i} style={{ width: t * 0.16 }} />;
        const p = interpolate(frame, [ini + i * 4, ini + 7 + i * 4], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
        const [bg, fg] = COR_RECORTE[i % 3];
        const rot = (rnd(i * 7 + 2) - 0.5) * 11;
        return (
          <div key={i} style={{ background: bg, color: fg, fontFamily: BIG, fontWeight: 900, fontSize: t * 0.8, lineHeight: 1, padding: `${t * 0.04}px ${t * 0.055}px ${t * 0.06}px`, border: bg === PRETO ? `4px solid ${LIMA}` : "none", transform: `rotate(${rot}deg) scale(${interpolate(p, [0, 1], [2.3, 1])})`, opacity: p, boxShadow: "0 12px 22px rgba(0,0,0,.55)", clipPath: "polygon(1% 3%, 98% 0, 100% 97%, 3% 100%)" }}>{c}</div>
        );
      })}
    </div>
  );
};

export const Promo: React.FC<{ d: DadosPromo; fmt: FmtPromo; efeito: Efeito }> = ({ d, fmt, efeito }) => {
  const L = LAY[fmt];
  const frame = useCurrentFrame();
  const parado = efeito === "parado";
  const entra = useSpr(parado ? -60 : efeito === "A" ? 16 : 6, { damping: 13, stiffness: 90 });
  const entra2 = useSpr(parado ? -60 : efeito === "A" ? 26 : 52, { damping: 12, stiffness: 110 });
  const tag = useSpr(parado ? -60 : 30, { damping: 12 });
  const chamada = useSpr(parado ? -60 : efeito === "A" ? 34 : 62, { damping: 16 });
  const pe = useSpr(parado ? -60 : efeito === "A" ? 72 : 112, { damping: 16 });
  const flutua = parado ? 0 : Math.sin(frame / 26) * 7;
  const push = parado ? 1 : interpolate(frame, [0, PROMO_DUR], [1, 1.04], clamp);
  // B: uma garrafa no centro se divide em duas ("em dobro"), com clarão
  const abre = efeito === "B" ? interpolate(frame, [48, 66], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.5)) }) : 1;
  const clarao = efeito === "B" ? interpolate(frame, [48, 52, 66], [0, 0.75, 0], clamp) : 0;
  const dist = (d.duas ? L.gW * 0.27 : 0) * abre;
  const paralaxe = efeito === "B" ? Math.sin(frame / 40) * 14 : 0;
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: PRETO }}>
      <Fundo L={L} />
      {/* camada de trás: 2X gigante em contorno */}
      {efeito === "B" && (
        <div style={{ position: "absolute", top: L.ringY - 330 + paralaxe, left: 0, right: 0, textAlign: "center", fontFamily: BIG, fontWeight: 900, fontSize: 700, lineHeight: 0.9, color: "transparent", WebkitTextStroke: "3px rgba(200,210,0,.45)", opacity: abre, transform: `scale(${0.8 + abre * 0.2})` }}>2X</div>
      )}
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: `50% ${L.ringY}px` }}>
        {efeito !== "B" && <RingPx width={1080} height={L.H} look="lima" flat cx={540} cy={L.ringY} ringH={L.ringH * (parado ? 1 : 0.6 + entra * 0.4)} rotY={parado ? 0.28 : 0.28 + Math.sin(frame / 30) * 0.12} envIntensity={0.9} />}
        {d.duas && <Garrafa src={d.garrafa} w={L.gW} cx={540 - dist} top={L.gTop + (1 - entra) * 500 + flutua} rot={-6 * abre} style={{ opacity: Math.min(1, entra * 2) }} />}
        <Garrafa src={d.garrafa} w={L.gW} cx={540 + dist} top={L.gTop + (1 - (efeito === "A" ? entra2 : entra)) * 500 - flutua} rot={6 * abre} style={{ opacity: Math.min(1, (efeito === "A" ? entra2 : entra) * 2) }} />
      </AbsoluteFill>
      {clarao > 0 && <AbsoluteFill style={{ background: LIMA, opacity: clarao }} />}
      {/* base escura para o texto */}
      <div style={{ position: "absolute", left: 0, right: 0, top: L.chamadaY - 130, bottom: 0, background: "linear-gradient(180deg, rgba(11,11,9,0) 0%, rgba(11,11,9,.93) 26%, #0B0B09 100%)" }} />
      {efeito === "A" && <Particulas H={L.H} />}
      <Logo width={L.logoW} top={L.logoTop} />
      <Tag txt={d.noite} y={L.tagY} s={tag} />
      <div style={{ position: "absolute", top: L.chamadaY, left: 0, right: 0, textAlign: "center", fontFamily: ARCHIVO, fontWeight: 900, fontSize: L.chamadaT, color: OSSO, letterSpacing: "0.01em", opacity: chamada, transform: `translateY(${(1 - chamada) * 30}px)` }}>{d.chamada}</div>
      {parado && <div style={{ position: "absolute", top: L.destaqueY, left: 0, right: 0, textAlign: "center", fontFamily: BIG, fontWeight: 900, fontSize: L.destaqueT, lineHeight: 0.9, whiteSpace: "nowrap", color: LIMA, textShadow: "0 0 44px rgba(200,210,0,.35)" }}>{d.destaque}</div>}
      {efeito === "A" && <LetrasSobem txt={d.destaque} y={L.destaqueY} t={L.destaqueT} ini={44} />}
      {efeito === "B" && <Recortes txt={d.destaque} y={L.destaqueY - 8} t={L.destaqueT} ini={72} />}
      <Rodape L={L} d={d} o={pe} />
      {efeito === "A" && <Persiana H={L.H} />}
      <Grain opacity={0.1} />
      <Vignette strength={0.42} />
    </AbsoluteFill>
  );
};
