import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { BIG, UNB, ARCHIVO, LEAGUE } from "../fonts";
import { Cutout, Grain, Nota, Vignette, clamp, useFade, useSpr } from "../shared/fx";
import { RingPx } from "../shared/Ring3D";
import { rnd } from "../shared/icones";
import { DIM, Formato, Noite, SUBESTILO } from "../data";

// SABADÁ C — "Chope Gelado": a noite vista de dentro do copo — espuma no alto, chope dourado, bolhas subindo
// e o vidro suado na frente de tudo; o nome do artista escrito no bafo do copo
const CHOPE = "#F2B233";
const CHOPE_ESCURO = "#7A3D08";
const ESPUMA = "#FFF8E8";
const GELO = "#CFF3FF";
const LIMA = "#C8D200";
const NOITE = "#06120E";

const Copo: React.FC<{ h: number; espumaY: number }> = ({ h, espumaY }) => {
  const frame = useCurrentFrame();
  return (
    <>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${NOITE} 0%, #0d1b14 ${(espumaY / h) * 100 - 6}%, #c7811c ${(espumaY / h) * 100 + 6}%, ${CHOPE} 55%, #d98f1f 80%, ${CHOPE_ESCURO} 100%)` }} />
      {/* luz atravessando o chope */}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% ${(espumaY / h) * 100 + 35}%, rgba(255,235,170,.55) 0%, rgba(255,235,170,0) 55%)` }} />
      <AbsoluteFill style={{ background: `repeating-linear-gradient(${90 + Math.sin(frame / 90) * 4}deg, rgba(255,255,255,.05) 0 3px, transparent 3px 28px)`, WebkitMaskImage: `linear-gradient(180deg, transparent ${(espumaY / h) * 100}%, #000 ${(espumaY / h) * 100 + 10}%)` }} />
    </>
  );
};

// bolhas subindo no chope
const Bolhas: React.FC<{ w: number; h: number; de: number; n?: number }> = ({ w, h, de, n = 46 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: n }, (_, i) => {
        const size = 5 + rnd(i) * 16;
        const x = rnd(i + 50) * w;
        const speed = 0.9 + rnd(i + 90) * 1.8;
        const span = h - de + 60;
        const y = h + 40 - ((frame * speed + rnd(i + 130) * span) % span);
        const o = interpolate(y, [de, de + 120], [0, 0.75], clamp);
        return <div key={i} style={{ position: "absolute", left: x + Math.sin((frame + i * 9) / 18) * 4, top: y, width: size, height: size, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, rgba(255,255,255,.95), rgba(255,255,255,.25) 55%, rgba(255,255,255,0) 72%)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.35)", opacity: o }} />;
      })}
    </AbsoluteFill>
  );
};

// espuma com borda irregular e furinhos
const Espuma: React.FC<{ y: number; w: number }> = ({ y, w }) => {
  const frame = useCurrentFrame();
  const blobs = Array.from({ length: 14 }, (_, i) => ({ x: (i / 13) * w, r: 70 + rnd(i + 3) * 70, dy: Math.sin(frame / 50 + i) * 6 }));
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: w, height: y + 160, filter: "drop-shadow(0 18px 24px rgba(120,70,0,.35))" }}>
      <svg width={w} height={y + 160} style={{ position: "absolute", inset: 0 }}>
        <rect x={0} y={0} width={w} height={y} fill={ESPUMA} />
        {blobs.map((b, i) => <circle key={i} cx={b.x} cy={y + b.dy} r={b.r} fill={ESPUMA} />)}
        {Array.from({ length: 40 }, (_, i) => <circle key={`f${i}`} cx={rnd(i + 200) * w} cy={rnd(i + 300) * (y + 40)} r={3 + rnd(i + 400) * 12} fill="rgba(230,205,150,.55)" />)}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: y, background: "linear-gradient(180deg, rgba(255,255,255,.4), rgba(255,255,255,0) 60%)" }} />
    </div>
  );
};

// gotas de condensação no vidro (na frente de tudo), com algumas escorrendo
const Suor: React.FC<{ w: number; h: number; n?: number }> = ({ w, h, n = 70 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: n }, (_, i) => {
        const escorre = rnd(i + 11) > 0.84;
        const size = escorre ? 14 + rnd(i) * 10 : 6 + rnd(i) * 26;
        const x = rnd(i + 20) * w;
        const y0 = rnd(i + 40) * h;
        const y = escorre ? (y0 + Math.max(0, frame - 30 - rnd(i + 60) * 120) * (1.4 + rnd(i + 70))) % (h + 100) : y0;
        return (
          <React.Fragment key={i}>
            {escorre && <div style={{ position: "absolute", left: x + size * 0.3, top: y0 - 10, width: size * 0.4, height: Math.max(0, y - y0), background: "linear-gradient(180deg, rgba(255,255,255,0), rgba(255,255,255,.25))", borderRadius: size }} />}
            <div style={{ position: "absolute", left: x, top: y, width: size, height: size * (escorre ? 1.35 : 1), borderRadius: "50% 50% 50% 50% / 45% 45% 55% 55%", background: "radial-gradient(circle at 35% 30%, rgba(255,255,255,.85), rgba(255,255,255,.12) 45%, rgba(0,0,0,.08) 75%, rgba(255,255,255,.25) 100%)", boxShadow: "0 1px 2px rgba(0,0,0,.25), inset 0 0 2px rgba(255,255,255,.6)" }} />
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

const Estilo: React.FC<{ n: Noite; x: number; y: number; delay: number; size?: number }> = ({ n, x, y, delay, size = 26 }) => {
  const s = useSpr(delay, { damping: 12 });
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translateY(${(1 - s) * -60}px)`, opacity: Math.min(1, s * 3), display: "flex", alignItems: "center", gap: 10, background: "rgba(207,243,255,.92)", color: NOITE, borderRadius: 40, padding: "8px 20px 9px 12px", boxShadow: "0 10px 24px rgba(0,0,0,.35)" }}>
      <Nota size={size * 1.1} color={NOITE} />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontFamily: BIG, fontWeight: 900, fontSize: size * 1.3, lineHeight: 1, letterSpacing: "0.06em" }}>{n.estilo}</span>
        <span style={{ fontFamily: ARCHIVO, fontWeight: 700, fontSize: size * 0.56, opacity: 0.7, marginTop: 2 }}>{SUBESTILO}</span>
      </div>
    </div>
  );
};

// bolacha de chope com a data
const Bolacha: React.FC<{ n: Noite; x: number; y: number; d: number; delay: number }> = ({ n, x, y, d, delay }) => {
  const s = useSpr(delay, { damping: 11, stiffness: 130 });
  const frame = useCurrentFrame();
  const rot = interpolate(s, [0, 1], [40, 8]) + Math.sin(frame / 55) * 1.5;
  const circ = 2 * Math.PI * 78 - 4;
  return (
    <div style={{ position: "absolute", left: x - d / 2, top: y - d / 2, width: d, height: d, transform: `scale(${interpolate(s, [0, 1], [1.8, 1])}) rotate(${rot}deg)`, opacity: Math.min(1, s * 1.5), filter: "drop-shadow(0 18px 26px rgba(60,30,0,.5))" }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: `radial-gradient(circle at 40% 35%, #fffaf0, ${ESPUMA} 55%, #e8d9b8 100%)`, boxShadow: `inset 0 0 0 6px ${NOITE}, inset 0 0 0 10px ${ESPUMA}, inset 0 0 0 13px ${LIMA}` }} />
      <svg width={d} height={d} viewBox="0 0 200 200" style={{ position: "absolute", inset: 0 }}>
        <defs><path id="circC" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" /></defs>
        <text fontFamily={ARCHIVO} fontWeight={800} fontSize="13.5" fill={NOITE} textLength={circ} lengthAdjust="spacing"><textPath href="#circC" textLength={circ} lengthAdjust="spacing">{`SABADÁ DO BUTICA ● CHOPE GELADO ● ${n.diaSemana} ● `}</textPath></text>
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: NOITE, transform: "rotate(-8deg)" }}>
        <div style={{ fontFamily: BIG, fontWeight: 900, fontSize: d * 0.34, lineHeight: 0.9 }}>{n.dia}</div>
        <div style={{ fontFamily: ARCHIVO, fontWeight: 900, fontSize: d * 0.1, letterSpacing: "0.16em" }}>{n.mes}</div>
        <div style={{ fontFamily: ARCHIVO, fontWeight: 800, fontSize: d * 0.1, marginTop: 2 }}>ÀS {n.hora}</div>
      </div>
    </div>
  );
};

type L = { espumaY: number; ringCy: number; ringH: number; artH: number; artTop: number; titleTop: number; titleSize: number; bafoTop: number; bafoH: number; bolX: number; bolY: number; bolD: number; listaTop: number; cta?: boolean };
const LAYOUT: Record<"feed" | "story", L> = {
  feed: { espumaY: 330, ringCy: 700, ringH: 640, artH: 960, artTop: 300, titleTop: 92, titleSize: 230, bafoTop: 940, bafoH: 190, bolX: 905, bolY: 500, bolD: 220, listaTop: 1180 },
  story: { espumaY: 520, ringCy: 980, ringH: 760, artH: 1200, artTop: 470, titleTop: 290, titleSize: 240, bafoTop: 1300, bafoH: 210, bolX: 895, bolY: 700, bolD: 240, listaTop: 1590, cta: true },
};

export const SabadoC: React.FC<{ n: Noite; fmt: Formato }> = ({ n, fmt }) => {
  const f = fmt === "broll" ? "story" : fmt;
  const L = LAYOUT[f];
  const { w, h } = DIM[f];
  const frame = useCurrentFrame();
  const art = useSpr(12, { damping: 15 });
  const anel = useSpr(0, { damping: 17, stiffness: 60 });
  const bafo = useSpr(30, { damping: 14 });
  const tit = useFade(6, 22);
  const push = interpolate(frame, [0, 240], [1, 1.03], clamp);
  const nomeSize = Math.min(110, (w - 160) / (n.artista.length * 0.86));
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Copo h={h} espumaY={L.espumaY} />
      <Bolhas w={w} h={h} de={L.espumaY} />
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "50% 45%" }}>
        <RingPx width={w} height={h} look="lima" cx={540} cy={L.ringCy} ringH={L.ringH * interpolate(anel, [0, 1], [0.6, 1])} rotY={interpolate(anel, [0, 1], [1.4, 0.28]) + Math.sin(frame / 45) * 0.09} rotX={Math.sin(frame / 60) * 0.05} envIntensity={1.2} lights={[{ color: "#ffd27a", pos: [-3, -2, 3], intensity: 5 }, { color: GELO, pos: [3, 3, 2], intensity: 4 }]} />
        <Cutout src={n.foto.src} ratio={n.foto.ratio} height={L.artH} cx={540} top={L.artTop + (1 - art) * 200} fadeFrom={0.72} filter="saturate(1.12) contrast(1.06) drop-shadow(0 0 40px rgba(255,220,140,.35)) drop-shadow(0 30px 40px rgba(60,30,0,.5))" style={{ opacity: art }} />
      </AbsoluteFill>
      <Espuma y={L.espumaY} w={w} />
      <div style={{ position: "absolute", left: 0, right: 0, top: L.titleTop, textAlign: "center", fontFamily: LEAGUE, fontSize: L.titleSize, lineHeight: 0.85, color: "#3B2208", letterSpacing: "0.02em", opacity: tit, textShadow: "0 2px 0 rgba(255,255,255,.6), 0 -1px 0 rgba(120,70,0,.25)", zIndex: 2 }}>SABADÁ <span style={{ fontFamily: ARCHIVO, fontStyle: "italic", fontWeight: 900, fontSize: L.titleSize * 0.3, color: "#8f9600" }}>do Butica</span></div>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(122,61,8,0) 60%, rgba(90,40,5,.6) 78%, rgba(60,25,3,.92) 92%)` }} />
      {/* faixa limpa no vidro: o nome do artista escrito no bafo */}
      <div style={{ position: "absolute", left: 50, right: 50, top: L.bafoTop, height: L.bafoH, transform: `scaleX(${bafo})`, transformOrigin: "left center", borderRadius: L.bafoH / 2, background: "rgba(255,255,255,.10)", border: "1.5px solid rgba(255,255,255,.35)", backdropFilter: "blur(2px)", boxShadow: "inset 0 0 40px rgba(255,255,255,.12), 0 20px 40px rgba(60,30,0,.35)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <div style={{ fontFamily: ARCHIVO, fontWeight: 800, fontSize: 22, letterSpacing: "0.34em", color: GELO, marginBottom: 2 }}>NO PALCO DO BUTICA</div>
        <div style={{ fontFamily: UNB, fontWeight: 900, fontSize: nomeSize, lineHeight: 1, color: ESPUMA, whiteSpace: "nowrap", textShadow: "0 3px 0 rgba(120,60,0,.35), 0 0 30px rgba(255,255,255,.35)" }}>{n.artista}</div>
      </div>
      <Suor w={w} h={h} />
      <Img src={staticFile("logos/butiquim-mono-branco-h.png")} style={{ position: "absolute", width: f === "feed" ? 200 : 240, top: f === "feed" ? 30 : 200, left: `calc(50% - ${(f === "feed" ? 200 : 240) / 2}px)`, filter: "invert(1) brightness(0.25) sepia(1) saturate(2)" }} />
      <Estilo n={n} x={44} y={f === "feed" ? 30 : 200} delay={26} size={22} />
      <Bolacha n={n} x={L.bolX} y={L.bolY} d={L.bolD} delay={36} />
      <div style={{ position: "absolute", left: 0, right: 0, top: L.listaTop, textAlign: "center", opacity: useFade(46, 60) }}>
        <div style={{ fontFamily: ARCHIVO, fontWeight: 800, fontSize: 30, color: ESPUMA, letterSpacing: "0.04em" }}>
          {n.lista[0]} <span style={{ color: LIMA }}>●</span> {n.lista[1]}
        </div>
        <div style={{ fontFamily: ARCHIVO, fontWeight: 500, fontSize: 19, color: ESPUMA, opacity: 0.8, marginTop: 6 }}>{n.obs}</div>
        {L.cta && <div style={{ marginTop: 14 }}><span style={{ fontFamily: ARCHIVO, fontWeight: 800, fontSize: 24, color: NOITE, background: LIMA, padding: "8px 20px", letterSpacing: "0.12em" }}>NOME NA LISTA: LINK NA BIO</span></div>}
      </div>
      <Grain opacity={0.08} />
      <Vignette strength={0.4} color="40,20,0" />
    </AbsoluteFill>
  );
};
