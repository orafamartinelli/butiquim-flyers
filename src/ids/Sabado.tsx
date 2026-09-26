import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame } from "remotion";
import { UNB, ARCHIVO } from "../fonts";
import { Cutout, Grain, Logo, Vignette, clamp, useFade, useSpr } from "../shared/fx";
import { RingPx } from "../shared/Ring3D";
import { Formato, Noite, DIM } from "../data";

// SABADÁ — "Esquina de Vidro": noite violeta com as luzes do palco, cromo furta-cor e vidro fosco
const MAGENTA = "#FF2E93";
const LIMA = "#C8D200";
const LILAS = "#A58BFF";
const BRANCO = "#F6F2FF";

const LUZES = [
  { color: MAGENTA, pos: [-3, 2.5, 3] as [number, number, number], intensity: 7 },
  { color: LIMA, pos: [3, -2, 3] as [number, number, number], intensity: 5 },
  { color: "#5b6bff", pos: [0, 3, -2] as [number, number, number], intensity: 6 },
];

const Facho: React.FC<{ x: number; base: number; amp: number; speed: number; color: string; w: number; h: number; phase?: number }> = ({ x, base, amp, speed, color, w, h, phase = 0 }) => {
  const frame = useCurrentFrame();
  const a = base + Math.sin(frame / speed + phase) * amp;
  return (
    <div
      style={{
        position: "absolute", left: x - w / 2, top: -60, width: w, height: h, transformOrigin: "50% 0%", transform: `rotate(${a}deg)`,
        background: `linear-gradient(180deg, ${color} 0%, rgba(0,0,0,0) 88%)`,
        clipPath: "polygon(46% 0, 54% 0, 100% 100%, 0 100%)", filter: "blur(9px)", mixBlendMode: "screen", opacity: 0.42,
      }}
    />
  );
};

const Palco: React.FC<{ h: number; intro: number }> = ({ h, intro }) => (
  <>
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #0D0624 0%, #1C0B45 52%, #0A0520 100%)" }} />
    <AbsoluteFill style={{ opacity: intro }}>
      <div style={{ position: "absolute", left: -260, top: -120, width: 820, height: 820, borderRadius: "50%", background: MAGENTA, filter: "blur(170px)", opacity: 0.45 }} />
      <div style={{ position: "absolute", right: -300, top: h * 0.5, width: 760, height: 760, borderRadius: "50%", background: LIMA, filter: "blur(190px)", opacity: 0.22 }} />
      <div style={{ position: "absolute", right: -200, top: -200, width: 700, height: 700, borderRadius: "50%", background: "#3b4bff", filter: "blur(180px)", opacity: 0.4 }} />
      <Facho x={180} base={-22} amp={7} speed={31} color={LILAS} w={380} h={h * 1.1} />
      <Facho x={420} base={-6} amp={9} speed={27} color={LIMA} w={300} h={h * 1.05} phase={1.3} />
      <Facho x={690} base={10} amp={8} speed={35} color={MAGENTA} w={340} h={h * 1.1} phase={2.2} />
      <Facho x={930} base={24} amp={6} speed={29} color={LILAS} w={380} h={h * 1.1} phase={0.7} />
    </AbsoluteFill>
  </>
);

const Cromo: React.FC<{ text: string; size: number; top: number; delay: number; font?: string; left?: number; align?: "center" | "left" }> = ({ text, size, top, delay, font = UNB, left, align = "center" }) => {
  const frame = useCurrentFrame();
  const shine = interpolate((frame + 2000 - 60) % 110, [0, 40], [120, -20], clamp);
  const base: React.CSSProperties = { fontFamily: font, fontWeight: 900, fontSize: size, lineHeight: 0.95, letterSpacing: "-0.02em", whiteSpace: "nowrap" };
  return (
    <div style={{ position: "absolute", top, left: left ?? 0, right: align === "center" ? 0 : undefined, display: "flex", justifyContent: align === "center" ? "center" : "flex-start" }}>
      <div style={{ position: "relative", filter: `drop-shadow(0 0 22px rgba(255,46,147,.55)) drop-shadow(0 8px 0 rgba(38,10,84,.95))` }}>
        <div style={{ display: "flex" }}>
          {text.split("").map((c, i) => {
            const p = interpolate(frame - delay - i * 2.5, [0, 14], [0, 1], clamp);
            return (
              <span key={i} style={{ ...base, display: "inline-block", opacity: p, filter: `blur(${(1 - p) * 18}px)`, transform: `scale(${1 + (1 - p) * 0.35})`, background: "linear-gradient(180deg, #ffffff 0%, #f1eaff 36%, #a58bff 50%, #ffffff 63%, #d9ccff 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                {c}
              </span>
            );
          })}
        </div>
        <div style={{ ...base, position: "absolute", inset: 0, background: `linear-gradient(100deg, rgba(255,255,255,0) 40%, rgba(255,255,255,.95) 50%, rgba(255,255,255,0) 60%)`, backgroundSize: "300% 100%", backgroundPosition: `${shine}% 0`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", mixBlendMode: "screen", opacity: frame > delay + 20 ? 1 : 0 }}>
          {text}
        </div>
      </div>
    </div>
  );
};

const Pill: React.FC<{ x?: number; y: number; delay: number; size?: number; center?: boolean }> = ({ x, y, delay, size = 30, center }) => {
  const s = useSpr(delay, { damping: 10 });
  return (
    <div style={{ position: "absolute", top: y, left: center ? 0 : x, right: center ? 0 : undefined, display: "flex", justifyContent: center ? "center" : "flex-start" }}>
      <div style={{ transform: `scale(${s})`, background: MAGENTA, color: "#fff", fontFamily: UNB, fontWeight: 700, fontSize: size, padding: "8px 26px 10px", borderRadius: 999, letterSpacing: "0.06em", boxShadow: `0 0 30px rgba(255,46,147,.8), inset 0 1px 0 rgba(255,255,255,.5)` }}>DO BUTICA</div>
    </div>
  );
};

const LogoArtista: React.FC<{ n: Noite; w: number; top: number; delay: number; cx: number }> = ({ n, w, top, delay, cx }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, 22], [0, 100], clamp);
  if (!n.artistaLogo) return null;
  return (
    <div style={{ position: "absolute", width: w, left: cx - w / 2, top, filter: "drop-shadow(0 0 16px rgba(255,46,147,.9)) drop-shadow(0 0 40px rgba(165,139,255,.6)) drop-shadow(0 6px 10px rgba(0,0,0,.6))" }}>
      <Img src={staticFile(n.artistaLogo.src)} style={{ width: w, display: "block", clipPath: `inset(0 ${100 - p}% 0 0)` }} />
    </div>
  );
};

const Vidro: React.FC<{ n: Noite; x: number; y: number; w: number; h: number; delay: number; big?: number }> = ({ n, x, y, w, h, delay, big = 104 }) => {
  const s = useSpr(delay, { damping: 16 });
  return (
    <div
      style={{
        position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 34, overflow: "hidden",
        transform: `translateY(${(1 - s) * 120}px)`, opacity: s,
        backdropFilter: "blur(22px) saturate(170%)", WebkitBackdropFilter: "blur(22px) saturate(170%)",
        background: "linear-gradient(135deg, rgba(255,255,255,.2), rgba(255,255,255,.05) 60%, rgba(255,46,147,.08))",
        border: "1.5px solid rgba(255,255,255,.38)",
        boxShadow: "0 30px 60px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.55), inset 0 0 40px rgba(165,139,255,.15)",
        display: "flex", alignItems: "center",
      }}
    >
      <div style={{ position: "absolute", left: -40, top: -120, width: w * 0.6, height: 200, background: "linear-gradient(90deg, rgba(255,255,255,.28), rgba(255,255,255,0))", transform: "rotate(-12deg)" }} />
      <div style={{ flex: "0 0 auto", padding: "0 34px 0 44px", textAlign: "center" }}>
        <div style={{ fontFamily: UNB, fontWeight: 900, fontSize: big, lineHeight: 0.95, color: BRANCO, letterSpacing: "-0.03em", textShadow: "0 0 20px rgba(255,46,147,.6)" }}>
          {n.dia}.{n.mes === "OUT" ? "10" : n.mes}
        </div>
        <div style={{ fontFamily: UNB, fontWeight: 500, fontSize: big * 0.25, color: LIMA, letterSpacing: "0.2em", marginTop: 6 }}>
          SÁB ● {n.hora}
        </div>
      </div>
      <div style={{ width: 2, alignSelf: "stretch", margin: "28px 0", background: "linear-gradient(180deg, rgba(255,255,255,0), rgba(255,255,255,.55), rgba(255,255,255,0))" }} />
      <div style={{ flex: 1, padding: "0 36px", fontFamily: ARCHIVO, color: BRANCO }}>
        <div style={{ fontWeight: 800, fontSize: big * 0.27, letterSpacing: "0.03em" }}>{n.lista[0]}</div>
        <div style={{ fontWeight: 800, fontSize: big * 0.27, letterSpacing: "0.03em", marginTop: 4 }}>{n.lista[1]}</div>
        <div style={{ fontWeight: 500, fontSize: big * 0.17, opacity: 0.8, marginTop: 10, lineHeight: 1.3 }}>{n.obs}</div>
      </div>
    </div>
  );
};

const useRing = (frame: number) => {
  const inn = useSpr(0, { damping: 16, stiffness: 70 });
  return {
    rotY: interpolate(inn, [0, 1], [1.55, 0.5]) + Math.sin(frame / 40) * 0.12,
    rotX: -0.32 + Math.sin(frame / 60) * 0.04,
    grow: interpolate(inn, [0, 1], [0.5, 1]),
  };
};

// anel em duas camadas: inteiro atrás do artista + só o arco de baixo na frente dele
const useAnel = (w: number, h: number, cx: number, cy: number, ringH: number, frontFrom: number) => {
  const frame = useCurrentFrame();
  const r = useRing(frame);
  const props = { width: w, height: h, look: "cromo" as const, cx, cy, ringH: ringH * r.grow, rotY: r.rotY, rotX: r.rotX, lights: LUZES, envIntensity: 1.1 };
  return {
    back: <RingPx {...props} />,
    front: <RingPx {...props} style={{ clipPath: `polygon(0 ${frontFrom}px, 100% ${frontFrom}px, 100% 100%, 0 100%)` }} />,
  };
};

type L = { titleTop: number; titleSize: number; pillY: number; ringCy: number; ringH: number; frontFrom: number; artH: number; artTop: number; logoY: number; logoW: number; cardY: number; cardH: number; big: number; cta?: number; logoTop: number };

const LAYOUT: Record<"feed" | "story", L> = {
  feed: { logoTop: 34, titleTop: 92, titleSize: 178, pillY: 268, ringCy: 640, ringH: 900, frontFrom: 890, artH: 1180, artTop: 330, logoY: 858, logoW: 560, cardY: 1052, cardH: 250, big: 100 },
  story: { logoTop: 214, titleTop: 286, titleSize: 180, pillY: 466, ringCy: 930, ringH: 1060, frontFrom: 1200, artH: 1480, artTop: 540, logoY: 1180, logoW: 620, cardY: 1390, cardH: 260, big: 104, cta: 1690 },
};

export const Sabado: React.FC<{ n: Noite; fmt: Formato }> = ({ n, fmt }) => {
  if (fmt === "broll") return <SabadoBroll n={n} />;
  return <SabadoFlyer n={n} fmt={fmt} />;
};

const SabadoFlyer: React.FC<{ n: Noite; fmt: "feed" | "story" }> = ({ n, fmt }) => {
  const L = LAYOUT[fmt];
  const { w, h } = DIM[fmt];
  const frame = useCurrentFrame();
  const intro = useFade(0, 24);
  const art = useSpr(12, { damping: 15 });
  const push = interpolate(frame, [0, 240], [1, 1.04], clamp);
  const anel = useAnel(w, h, 540, L.ringCy, L.ringH, L.frontFrom);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Palco h={h} intro={intro} />
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        {anel.back}
        <Cromo text="SABADÁ" size={L.titleSize} top={L.titleTop} delay={4} />
        <Cutout src={n.foto.src} ratio={n.foto.ratio} height={L.artH} cx={540} top={L.artTop + (1 - art) * 220} fadeFrom={0.6} filter="drop-shadow(0 0 1px rgba(255,255,255,.4)) drop-shadow(-14px 0 30px rgba(255,46,147,.35)) drop-shadow(14px 0 30px rgba(200,210,0,.25)) contrast(1.05)" style={{ opacity: art }} />
        {anel.front}
      </AbsoluteFill>
      <Pill y={L.pillY} delay={22} center />
      <Logo width={fmt === "feed" ? 210 : 240} top={L.logoTop} />
      <LogoArtista n={n} w={L.logoW} top={L.logoY} delay={30} cx={540} />
      <Vidro n={n} x={60} y={L.cardY} w={960} h={L.cardH} delay={40} big={L.big} />
      {L.cta !== undefined && (
        <div style={{ position: "absolute", top: L.cta, left: 0, right: 0, textAlign: "center", opacity: useFade(48, 60) }}>
          <span style={{ fontFamily: UNB, fontWeight: 700, fontSize: 24, color: "#fff", border: `2px solid ${LIMA}`, borderRadius: 999, padding: "10px 26px", letterSpacing: "0.1em", boxShadow: "0 0 24px rgba(200,210,0,.4)" }}>NOME NA LISTA: LINK NA BIO</span>
        </div>
      )}
      <div style={{ position: "absolute", top: fmt === "feed" ? 1314 : 1770, left: 0, right: 0, textAlign: "center", fontFamily: ARCHIVO, fontWeight: 700, fontSize: 15, letterSpacing: "0.42em", color: BRANCO, opacity: 0.55 * intro }}>
        A ESQUINA DE VIDRO MAIS FAMOSA DE MARINGÁ
      </div>
      <Grain opacity={0.09} />
      <Vignette strength={0.45} />
    </AbsoluteFill>
  );
};

// STORY com B-roll: o palco do Butiquim numa moldura de vidro com borda neon; recorte "sai" da moldura
const SabadoBroll: React.FC<{ n: Noite }> = ({ n }) => {
  const { w, h } = DIM.broll;
  const intro = useFade(0, 18);
  const art = useSpr(10, { damping: 15 });
  const anel = useAnel(w, h, 860, 1320, 740, 1470);
  const FX = 36, FY = 150, FW = w - 72, FH = 900;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Palco h={h} intro={intro} />
      <div style={{ position: "absolute", left: FX - 3, top: FY - 3, width: FW + 6, height: FH + 6, borderRadius: 44, background: `linear-gradient(135deg, ${MAGENTA}, ${LILAS} 45%, ${LIMA})`, boxShadow: `0 0 40px rgba(255,46,147,.55), 0 0 90px rgba(165,139,255,.35)`, opacity: intro }} />
      <div style={{ position: "absolute", left: FX, top: FY, width: FW, height: FH, borderRadius: 41, overflow: "hidden", opacity: intro }}>
        <OffthreadVideo src={staticFile(n.clip)} style={{ width: FW, height: FW * (1920 / 1080), objectFit: "cover", marginTop: -520, filter: "contrast(1.05) saturate(1.1)" }} volume={(f) => interpolate(f, [0, 8, 285, 300], [0, 1, 1, 0], clamp)} />
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(13,6,36,.6) 0%, rgba(13,6,36,0) 22%, rgba(13,6,36,0) 75%, rgba(13,6,36,.7) 100%)" }} />
      </div>
      <Logo width={240} top={214} />
      {anel.back}
      <Cromo text="SABADÁ" size={100} top={1092} delay={6} left={50} align="left" />
      <Pill x={54} y={1214} delay={16} size={24} />
      <Cutout src={n.foto.src} ratio={n.foto.ratio} height={950} cx={868} top={935 + (1 - art) * 200} fadeFrom={0.62} filter="drop-shadow(-14px 0 30px rgba(255,46,147,.35)) drop-shadow(14px 0 30px rgba(200,210,0,.25)) contrast(1.05)" style={{ opacity: art }} />
      {anel.front}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,5,32,0) 84%, rgba(10,5,32,.95) 92%)" }} />
      <LogoArtista n={n} w={450} top={1286} delay={22} cx={290} />
      <Vidro n={n} x={40} y={1470} w={1000} h={230} delay={30} big={92} />
      <div style={{ position: "absolute", top: 1730, left: 0, right: 0, textAlign: "center", opacity: useFade(40, 52) }}>
        <span style={{ fontFamily: UNB, fontWeight: 700, fontSize: 22, color: "#fff", border: `2px solid ${LIMA}`, borderRadius: 999, padding: "9px 24px", letterSpacing: "0.1em", boxShadow: "0 0 24px rgba(200,210,0,.4)" }}>NOME NA LISTA: LINK NA BIO</span>
      </div>
      <Grain opacity={0.09} />
      <Vignette strength={0.4} />
    </AbsoluteFill>
  );
};
