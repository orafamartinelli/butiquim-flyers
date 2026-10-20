import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { UNB, BEBAS, LEAGUE, ARCHIVO } from "../fonts";
import { Cutout, Grain, Logo, Nota, Vignette, clamp, useFade, useSpr } from "../shared/fx";
import { RingPx } from "../shared/Ring3D";
import { DIM, Formato, Noite, SUBESTILO } from "../data";

// SABADÁ D — "Pôster de Cinema": cartaz de estreia — holofotes cruzando o céu, título metálico, "ESTRELANDO",
// data "em cartaz" e o bloco de créditos condensado no pé, como nos pôsteres de filme
const LIMA = "#C8D200";
const PRETO = "#050609";
const BRANCO = "#F5F3EE";

const Ceu: React.FC<{ h: number }> = ({ h }) => {
  const frame = useCurrentFrame();
  const facho = (x: number, base: number, amp: number, speed: number, phase: number, cor: string) => {
    const a = base + Math.sin(frame / speed + phase) * amp;
    return <div style={{ position: "absolute", left: x - 160, bottom: -200, width: 320, height: h * 1.3, transformOrigin: "50% 100%", transform: `rotate(${a}deg)`, background: `linear-gradient(0deg, ${cor} 0%, rgba(0,0,0,0) 85%)`, clipPath: "polygon(44% 100%, 56% 100%, 100% 0, 0 0)", filter: "blur(10px)", mixBlendMode: "screen", opacity: 0.5 }} />;
  };
  return (
    <>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, #0b0d16 0%, ${PRETO} 55%, #0a0b10 100%)` }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(200,210,0,.28) 0%, rgba(200,210,0,0) 55%)" }} />
      {facho(120, -28, 7, 33, 0, "rgba(200,210,0,.9)")}
      {facho(960, 28, 7, 29, 1.6, "rgba(200,210,0,.9)")}
      {facho(380, -8, 10, 41, 0.8, "rgba(245,243,238,.7)")}
      {facho(700, 8, 10, 37, 2.4, "rgba(245,243,238,.7)")}
      <AbsoluteFill style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,.35) 0.6px, transparent 1.2px)", backgroundSize: "90px 90px", opacity: 0.5, WebkitMaskImage: "linear-gradient(180deg, #000 0%, transparent 45%)" }} />
    </>
  );
};

// título metálico (lima → branco → lima), com brilho correndo
const Metal: React.FC<{ text: string; size: number; top: number; delay: number; font?: string; spacing?: string }> = ({ text, size, top, delay, font = UNB, spacing = "-0.02em" }) => {
  const frame = useCurrentFrame();
  const s = useSpr(delay, { damping: 14, stiffness: 90 });
  const sw = interpolate((frame - 50 + 1500) % 150, [0, 40], [-60, 160], clamp);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", transform: `scale(${interpolate(s, [0, 1], [1.3, 1])})`, opacity: s }}>
      <div style={{ position: "relative", display: "inline-block", fontFamily: font, fontWeight: 900, fontSize: size, lineHeight: 0.9, letterSpacing: spacing, background: `linear-gradient(180deg, #f6ffb0 0%, ${LIMA} 38%, #7f8800 50%, #e3ee45 62%, #b9c400 100%)`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", filter: "drop-shadow(0 6px 0 rgba(0,0,0,.55)) drop-shadow(0 0 40px rgba(200,210,0,.35))" }}>
        {text}
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(100deg, rgba(255,255,255,0) ${sw - 12}%, rgba(255,255,255,.75) ${sw}%, rgba(255,255,255,0) ${sw + 12}%)`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{text}</div>
      </div>
    </div>
  );
};

// bloco de créditos de cinema: rótulos miúdos e nomes altos, tudo condensado
const Creditos: React.FC<{ n: Noite; top: number; delay: number; size?: number; cta?: boolean }> = ({ n, top, delay, size = 19, cta }) => {
  const o = useFade(delay, delay + 16);
  const R = (t: string) => <span style={{ fontFamily: ARCHIVO, fontWeight: 700, fontSize: size * 0.55, letterSpacing: "0.1em", opacity: 0.7, verticalAlign: "middle" }}>{t} </span>;
  const N = (t: string) => <span style={{ fontFamily: LEAGUE, fontSize: size * 1.35, letterSpacing: "0.06em", verticalAlign: "middle" }}>{t}  </span>;
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top, textAlign: "center", color: BRANCO, opacity: o, lineHeight: 1.5, textTransform: "uppercase" }}>
      <div>{R("O Butiquim apresenta")}{N("uma noite de Sabadá do Butica")}{R("com")}{N(n.artista)}{R("trilha")}{N(`${n.estilo} ${SUBESTILO}`)}</div>
      <div>{R("lista feminina")}{N(`free até ${n.lista[0].split("ATÉ ")[1]}`)}{R("lista masculina")}{N(`R$ 20 até ${n.lista[1].split("ATÉ ")[1]}`)}{R("depois da 1ª hora")}{N("desconto na portaria pra quem está na lista")}</div>
      <div>{R("direção")}{N("a esquina")}{R("produção")}{N("Butica")}{R("classificação")}{N("livre pra dançar")}{cta ? <>{R("ingresso")}{N("nome na lista: link na bio")}</> : <>{R("sessão única")}{N(`${n.diaSemana} ${n.dia} ${n.mes} · ${n.hora}`)}</>}</div>
    </div>
  );
};

// selo de classificação, como o do cinema
const Classificacao: React.FC<{ x: number; y: number; delay: number; size?: number }> = ({ x, y, delay, size = 92 }) => {
  const s = useSpr(delay, { damping: 11 });
  return (
    <div style={{ position: "absolute", left: x, top: y, display: "flex", alignItems: "center", gap: 12, transform: `scale(${s})`, transformOrigin: "left center" }}>
      <div style={{ width: size, height: size, background: LIMA, color: PRETO, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: UNB, fontWeight: 900, fontSize: size * 0.6, boxShadow: "0 10px 20px rgba(0,0,0,.5)" }}>L</div>
      <div style={{ fontFamily: ARCHIVO, fontWeight: 800, fontSize: size * 0.2, letterSpacing: "0.12em", color: BRANCO, lineHeight: 1.25 }}>LIVRE<br />PRA<br />DANÇAR</div>
    </div>
  );
};

const Estilo: React.FC<{ n: Noite; x: number; y: number; delay: number; size?: number }> = ({ n, x, y, delay, size = 24 }) => {
  const s = useSpr(delay, { damping: 12 });
  return (
    <div style={{ position: "absolute", right: x, top: y, transform: `translateY(${(1 - s) * -60}px)`, opacity: Math.min(1, s * 3), display: "flex", alignItems: "center", gap: 10, border: `2px solid ${LIMA}`, color: BRANCO, borderRadius: 8, padding: "7px 16px 8px 12px", background: "rgba(5,6,9,.6)" }}>
      <Nota size={size * 1.1} color={LIMA} />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontFamily: BEBAS, fontSize: size * 1.5, lineHeight: 1, letterSpacing: "0.08em", color: LIMA }}>{n.estilo}</span>
        <span style={{ fontFamily: ARCHIVO, fontWeight: 700, fontSize: size * 0.56, opacity: 0.8 }}>{SUBESTILO}</span>
      </div>
    </div>
  );
};

type L = { titleTop: number; titleSize: number; subTop: number; ringCy: number; ringH: number; artH: number; artTop: number; estrTop: number; nomeSize: number; dataTop: number; credTop: number; credSize: number; classY: number; cta?: boolean };
const LAYOUT: Record<"feed" | "story", L> = {
  feed: { titleTop: 118, titleSize: 210, subTop: 318, ringCy: 640, ringH: 640, artH: 900, artTop: 330, estrTop: 1000, nomeSize: 96, dataTop: 1120, credTop: 1215, credSize: 17, classY: 1070 },
  story: { titleTop: 300, titleSize: 230, subTop: 520, ringCy: 900, ringH: 760, artH: 1080, artTop: 560, estrTop: 1330, nomeSize: 104, dataTop: 1460, credTop: 1590, credSize: 19, classY: 1410, cta: true },
};

export const SabadoD: React.FC<{ n: Noite; fmt: Formato }> = ({ n, fmt }) => {
  const f = fmt === "broll" ? "story" : fmt;
  const L = LAYOUT[f];
  const { w, h } = DIM[f];
  const frame = useCurrentFrame();
  const art = useSpr(14, { damping: 15 });
  const anel = useSpr(0, { damping: 17, stiffness: 60 });
  const nome = useFade(32, 46);
  const push = interpolate(frame, [0, 240], [1, 1.03], clamp);
  const nomeSize = Math.min(L.nomeSize, (w - 120) / (n.artista.length * 0.82));
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Ceu h={h} />
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "50% 45%" }}>
        <RingPx width={w} height={h} look="cromo" cx={540} cy={L.ringCy} ringH={L.ringH * interpolate(anel, [0, 1], [0.6, 1])} rotY={interpolate(anel, [0, 1], [1.4, 0.26]) + Math.sin(frame / 45) * 0.09} rotX={Math.sin(frame / 60) * 0.05} envIntensity={1.3} lights={[{ color: LIMA, pos: [-3, -3, 3], intensity: 7 }, { color: "#ffffff", pos: [3, 3, 2], intensity: 4 }]} />
        <Cutout src={n.foto.src} ratio={n.foto.ratio} height={L.artH} cx={540} top={L.artTop + (1 - art) * 200} fadeFrom={0.7} filter="contrast(1.08) saturate(1.05) drop-shadow(0 0 2px rgba(200,210,0,.9)) drop-shadow(0 0 40px rgba(200,210,0,.35)) drop-shadow(0 30px 40px rgba(0,0,0,.7))" style={{ opacity: art }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(5,6,9,0) 62%, rgba(5,6,9,.85) 76%, rgba(5,6,9,1) 90%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: f === "feed" ? 40 : 206, textAlign: "center", fontFamily: ARCHIVO, fontWeight: 700, fontSize: 18, letterSpacing: "0.42em", color: BRANCO, opacity: useFade(0, 14) * 0.8 }}>O BUTIQUIM APRESENTA</div>
      <Logo width={f === "feed" ? 170 : 200} top={f === "feed" ? 66 : 232} />
      <Metal text="SABADÁ" size={L.titleSize} top={L.titleTop} delay={6} />
      <div style={{ position: "absolute", left: 0, right: 0, top: L.subTop, textAlign: "center", fontFamily: BEBAS, fontSize: 44, letterSpacing: "0.5em", paddingLeft: "0.5em", color: BRANCO, opacity: useFade(16, 30) * 0.9 }}>DO BUTICA</div>
      <Estilo n={n} x={44} y={f === "feed" ? 40 : 206} delay={24} size={f === "feed" ? 20 : 23} />
      {/* ESTRELANDO + nome */}
      <div style={{ position: "absolute", left: 0, right: 0, top: L.estrTop, textAlign: "center", opacity: nome }}>
        <div style={{ fontFamily: ARCHIVO, fontWeight: 700, fontSize: 18, letterSpacing: "0.5em", paddingLeft: "0.5em", color: LIMA }}>ESTRELANDO</div>
        <div style={{ fontFamily: UNB, fontWeight: 900, fontSize: nomeSize, lineHeight: 1, color: BRANCO, whiteSpace: "nowrap", marginTop: 4, textShadow: "0 6px 30px rgba(0,0,0,.8)" }}>{n.artista}</div>
      </div>
      <Metal text={`EM CARTAZ ${n.dia} DE ${n.mesExtenso} · ${n.hora}`} size={f === "feed" ? 54 : 60} top={L.dataTop} delay={40} font={BEBAS} spacing="0.06em" />
      <Classificacao x={44} y={f === "feed" ? 40 : 206} delay={44} size={f === "feed" ? 60 : 70} />
      <Creditos n={n} top={L.credTop} delay={50} size={L.credSize} cta={L.cta} />
      <Grain opacity={0.14} />
      <Vignette strength={0.5} />
    </AbsoluteFill>
  );
};
