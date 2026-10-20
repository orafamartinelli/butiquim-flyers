import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { SKETCH, GIZ, ARCHIVO } from "../fonts";
import { Cutout, Grain, Logo, Vignette, clamp, useFade, useSpr } from "../shared/fx";
import { RingPx } from "../shared/Ring3D";
import { Ico, rnd } from "../shared/icones";
import { DIM, Formato, Noite, SUBESTILO } from "../data";

// SABADÁ C — "Lousa do Butica": o quadro-negro do boteco escrito a giz (branco + lima), moldura de madeira,
// rabiscos, setas e estrelas em volta do artista — que fica inteiro, em cor, sem nada na frente do rosto
// (substitui o "Chope Gelado", reprovado pelo Rafa em 20/10: as gotas tapavam a cara dos músicos)
const LOUSA = "#16211C";
const GIZ_BRANCO = "#F4F1E6";
const GIZ_LIMA = "#D9E65A";
const MADEIRA = "#6B4423";

// traço de giz: texto com leve borrão e falhas
const giz = (cor: string) => ({ color: cor, textShadow: `0 0 1px ${cor}, 0 0 6px rgba(255,255,255,.18)`, WebkitMaskImage: "radial-gradient(circle at 30% 40%, #000 70%, rgba(0,0,0,.85) 100%)" } as React.CSSProperties);

const Quadro: React.FC<{ w: number; h: number }> = ({ w, h }) => (
  <>
    <AbsoluteFill style={{ background: `linear-gradient(180deg, #4b2e16 0%, ${MADEIRA} 50%, #3d2411 100%)` }} />
    <AbsoluteFill style={{ backgroundImage: "repeating-linear-gradient(92deg, rgba(0,0,0,.18) 0 2px, transparent 2px 11px, rgba(255,255,255,.04) 11px 13px, transparent 13px 30px)" }} />
    <div style={{ position: "absolute", left: 34, top: 34, width: w - 68, height: h - 68, background: `radial-gradient(ellipse at 50% 40%, #1d2b25 0%, ${LOUSA} 60%, #0f1714 100%)`, boxShadow: "inset 0 0 0 6px #2a1a0c, inset 0 10px 30px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.08)" }}>
      {/* giz apagado com a mão: manchas claras */}
      {Array.from({ length: 9 }, (_, i) => (
        <div key={i} style={{ position: "absolute", left: rnd(i + 1) * (w - 300), top: rnd(i + 20) * (h - 400), width: 260 + rnd(i + 40) * 300, height: 120 + rnd(i + 60) * 160, borderRadius: "50%", background: "rgba(244,241,230,.06)", filter: "blur(26px)", transform: `rotate(${rnd(i + 80) * 60 - 30}deg)` }} />
      ))}
    </div>
  </>
);

// rabiscos de giz em SVG: estrelas e raios em volta do artista
const Rabiscos: React.FC<{ w: number; h: number; cx: number; cy: number; r: number; delay: number }> = ({ w, h, cx, cy, r, delay }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, 40], [0, 1], clamp);
  const estrela = (x: number, y: number, s: number, k: number) => {
    const pts = Array.from({ length: 10 }, (_, i) => { const a = (i * Math.PI) / 5 - Math.PI / 2; const rr = i % 2 ? s * 0.45 : s; return `${x + Math.cos(a) * rr},${y + Math.sin(a) * rr}`; }).join(" ");
    return <polygon key={k} points={pts} fill="none" stroke={k % 2 ? GIZ_LIMA : GIZ_BRANCO} strokeWidth={4} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} opacity={0.9} />;
  };
  const raios = Array.from({ length: 14 }, (_, i) => {
    const a = (i / 14) * Math.PI * 2 + 0.2;
    const r1 = r + 20 + rnd(i) * 30, r2 = r1 + 50 + rnd(i + 9) * 70;
    return <line key={i} x1={cx + Math.cos(a) * r1} y1={cy + Math.sin(a) * r1 * 1.25} x2={cx + Math.cos(a) * r2} y2={cy + Math.sin(a) * r2 * 1.25} stroke={i % 3 ? GIZ_BRANCO : GIZ_LIMA} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} opacity={0.75} />;
  });
  return (
    <svg width={w} height={h} style={{ position: "absolute", inset: 0, pointerEvents: "none", filter: "blur(.4px)" }}>
      {raios}
      {estrela(110, 940, 22, 1)}
      {estrela(980, 700, 20, 2)}
      {estrela(150, 820, 16, 3)}
      {estrela(930, 300, 30, 4)}
    </svg>
  );
};

const Nota: React.FC<{ x: number; y: number; size: number; rot: number; delay: number; cor?: string }> = ({ x, y, size, rot, delay, cor = GIZ_BRANCO }) => {
  const frame = useCurrentFrame();
  const d = interpolate(frame - delay, [0, 20], [0, 1], clamp);
  return <div style={{ position: "absolute", left: x, top: y, transform: `rotate(${rot}deg)` }}><Ico i="nota" size={size} color={cor} stroke={2.2} draw={d} /></div>;
};

// "hoje!" circulado a giz, com seta pro artista
const Hoje: React.FC<{ x: number; y: number; delay: number }> = ({ x, y, delay }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, 24], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 230, height: 120, opacity: p > 0 ? 1 : 0 }}>
      <div style={{ position: "absolute", left: 20, top: 14, fontFamily: GIZ, fontSize: 74, lineHeight: 1, transform: "rotate(-6deg)", ...giz(GIZ_LIMA) }}>hoje!</div>
      <svg width={230} height={120} style={{ position: "absolute", inset: 0 }}>
        <ellipse cx={100} cy={56} rx={92} ry={46} fill="none" stroke={GIZ_BRANCO} strokeWidth={4} transform="rotate(-6 100 56)" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} opacity={0.9} />
        <path d="M190 70 C 215 80, 225 95, 226 118" fill="none" stroke={GIZ_BRANCO} strokeWidth={4} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
        <path d="M214 108 L 226 118 L 230 104" fill="none" stroke={GIZ_BRANCO} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
      </svg>
    </div>
  );
};

const Estilo: React.FC<{ n: Noite; x: number; y: number; delay: number; size?: number }> = ({ n, x, y, delay, size = 26 }) => {
  const o = useFade(delay, delay + 14);
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: o, transform: "rotate(-3deg)", display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
      <div style={{ fontFamily: SKETCH, fontWeight: 700, fontSize: size * 1.5, lineHeight: 1, letterSpacing: "0.04em", ...giz(GIZ_LIMA) }}>{n.estilo}</div>
      <div style={{ fontFamily: GIZ, fontSize: size * 1.1, lineHeight: 1, marginTop: 2, ...giz(GIZ_BRANCO) }}>{SUBESTILO}</div>
      <div style={{ width: "100%", height: 3, background: GIZ_BRANCO, opacity: 0.7, marginTop: 4, transform: "rotate(1deg)" }} />
    </div>
  );
};

// data escrita a giz dentro de um círculo rabiscado
const Data: React.FC<{ n: Noite; x: number; y: number; d: number; delay: number }> = ({ n, x, y, d, delay }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, 26], [0, 1], clamp);
  const o = useFade(delay + 8, delay + 20);
  return (
    <div style={{ position: "absolute", left: x - d / 2, top: y - d / 2, width: d, height: d, transform: "rotate(5deg)" }}>
      <svg width={d} height={d} viewBox="0 0 200 200" style={{ position: "absolute", inset: 0 }}>
        <path d="M100 12 C 150 8, 192 50, 188 100 C 184 150, 150 190, 100 188 C 50 186, 10 150, 12 100 C 14 50, 50 16, 100 12 Z M 100 22 C 60 24, 24 56, 22 100 C 20 144, 60 180, 100 178" fill="none" stroke={GIZ_LIMA} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} opacity={0.95} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: o }}>
        <div style={{ fontFamily: SKETCH, fontWeight: 700, fontSize: d * 0.42, lineHeight: 0.9, ...giz(GIZ_BRANCO) }}>{n.dia}</div>
        <div style={{ fontFamily: GIZ, fontSize: d * 0.17, lineHeight: 1, ...giz(GIZ_LIMA) }}>{n.mes.toLowerCase()} · {n.hora.toLowerCase()}</div>
      </div>
    </div>
  );
};

type L = { ringCy: number; ringH: number; artH: number; artTop: number; titleTop: number; titleSize: number; nomeTop: number; dataX: number; dataY: number; dataD: number; listaTop: number; hojeX: number; hojeY: number; cta?: boolean };
const LAYOUT: Record<"feed" | "story", L> = {
  feed: { ringCy: 600, ringH: 560, artH: 980, artTop: 250, titleTop: 96, titleSize: 196, nomeTop: 1010, dataX: 920, dataY: 470, dataD: 210, listaTop: 1180, hojeX: 70, hojeY: 300 },
  story: { ringCy: 860, ringH: 680, artH: 1200, artTop: 450, titleTop: 290, titleSize: 210, nomeTop: 1330, dataX: 910, dataY: 690, dataD: 230, listaTop: 1560, hojeX: 70, hojeY: 520, cta: true },
};

export const SabadoC: React.FC<{ n: Noite; fmt: Formato }> = ({ n, fmt }) => {
  const f = fmt === "broll" ? "story" : fmt;
  const L = LAYOUT[f];
  const { w, h } = DIM[f];
  const frame = useCurrentFrame();
  const art = useSpr(14, { damping: 15 });
  const anel = useSpr(6, { damping: 16, stiffness: 70 });
  const tit = useFade(4, 18);
  const nome = useFade(34, 48);
  const push = interpolate(frame, [0, 240], [1, 1.025], clamp);
  const nomeSize = Math.min(120, (w - 160) / (n.artista.length * 0.56));
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Quadro w={w} h={h} />
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "50% 45%" }}>
        <Rabiscos w={w} h={h} cx={540} cy={L.artTop + L.artH * 0.45} r={L.artH * 0.3} delay={20} />
        {/* o "O" do logo como ímã lima preso na lousa, atrás do artista */}
        <RingPx width={w} height={h} look="lima" cx={540} cy={L.ringCy} ringH={L.ringH * interpolate(anel, [0, 1], [0.6, 1])} rotY={interpolate(anel, [0, 1], [1.3, 0.3]) + Math.sin(frame / 45) * 0.08} rotX={Math.sin(frame / 60) * 0.04} envIntensity={0.9} lights={[{ color: "#fff6d0", pos: [-3, 3, 3], intensity: 3 }]} />
        <Cutout src={n.foto.src} ratio={n.foto.ratio} height={L.artH} cx={540} top={L.artTop + (1 - art) * 160} fadeFrom={0.74} filter="saturate(1.08) contrast(1.05) drop-shadow(0 0 2px rgba(244,241,230,.9)) drop-shadow(0 30px 40px rgba(0,0,0,.6))" style={{ opacity: art }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(22,33,28,0) 66%, rgba(22,33,28,.85) 80%, rgba(22,33,28,.97) 100%)" }} />
      <Logo width={f === "feed" ? 200 : 240} top={f === "feed" ? 46 : 214} />
      {/* título a giz, em duas cores */}
      <div style={{ position: "absolute", left: 0, right: 0, top: L.titleTop, textAlign: "center", opacity: tit, transform: "rotate(-2deg)" }}>
        <span style={{ fontFamily: SKETCH, fontWeight: 700, fontSize: L.titleSize, lineHeight: 0.9, letterSpacing: "0.01em", ...giz(GIZ_BRANCO) }}>Sabadá</span>
        <span style={{ fontFamily: GIZ, fontSize: L.titleSize * 0.42, marginLeft: 18, ...giz(GIZ_LIMA) }}>do Butica</span>
      </div>
      <Estilo n={n} x={66} y={f === "feed" ? 450 : 670} delay={22} size={f === "feed" ? 22 : 25} />
      <Hoje x={L.hojeX} y={L.hojeY} delay={28} />
      <Data n={n} x={L.dataX} y={L.dataY} d={L.dataD} delay={30} />
      <Nota x={90} y={L.artTop + 380} size={60} rot={-15} delay={40} cor={GIZ_LIMA} />
      <Nota x={940} y={L.artTop + 420} size={50} rot={12} delay={46} />
      <Nota x={860} y={L.artTop - 30} size={40} rot={-8} delay={50} cor={GIZ_LIMA} />
      {/* nome do artista: giz branco grande, sublinhado a giz lima */}
      <div style={{ position: "absolute", left: 0, right: 0, top: L.nomeTop, textAlign: "center", opacity: nome }}>
        <div style={{ fontFamily: GIZ, fontSize: 34, lineHeight: 1, ...giz(GIZ_LIMA) }}>no palco do Butica:</div>
        <div style={{ fontFamily: SKETCH, fontWeight: 700, fontSize: nomeSize, lineHeight: 1, whiteSpace: "nowrap", marginTop: 4, ...giz(GIZ_BRANCO) }}>{n.artista}</div>
        <svg width={w} height={22} style={{ display: "block", marginTop: -4 }}>
          <path d={`M${w / 2 - nomeSize * n.artista.length * 0.27} 10 Q ${w / 2} 2, ${w / 2 + nomeSize * n.artista.length * 0.27} 12`} fill="none" stroke={GIZ_LIMA} strokeWidth={5} strokeLinecap="round" opacity={0.9} />
        </svg>
      </div>
      {/* lista a giz */}
      <div style={{ position: "absolute", left: 0, right: 0, top: L.listaTop, textAlign: "center", opacity: useFade(50, 64) }}>
        <div style={{ fontFamily: GIZ, fontSize: 40, lineHeight: 1, ...giz(GIZ_BRANCO) }}>
          lista fem. <span style={{ fontFamily: SKETCH, fontWeight: 700, ...giz(GIZ_LIMA) }}>FREE</span> até {n.lista[0].split("ATÉ ")[1].toLowerCase()} · lista masc. <span style={{ fontFamily: SKETCH, fontWeight: 700, ...giz(GIZ_LIMA) }}>R$ 20</span> até {n.lista[1].split("ATÉ ")[1].toLowerCase()}
        </div>
        <div style={{ fontFamily: ARCHIVO, fontWeight: 500, fontSize: 19, color: GIZ_BRANCO, opacity: 0.75, marginTop: 8 }}>{n.obs}</div>
        {L.cta && <div style={{ fontFamily: GIZ, fontSize: 36, marginTop: 10, ...giz(GIZ_LIMA) }}>→ nome na lista: link na bio</div>}
      </div>
      <Grain opacity={0.22} freq={1.1} />
      <Vignette strength={0.45} />
    </AbsoluteFill>
  );
};
