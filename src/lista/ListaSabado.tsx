import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ANTON, ARCHIVO, UNB, YELLOWTAIL } from "../fonts";
import { Grain, Logo, Nota, Vignette, clamp, useSpr } from "../shared/fx";
import { RingPx } from "../shared/Ring3D";
import { Ico, Icone, rnd } from "../shared/icones";
import { DIM, regraDia } from "../data";

// ARTES DE LISTA DO SÁBADO — peças "de sempre" (sem artista e sem data) para a automação do Instagram:
// STORY → a pessoa RESPONDE o story com "LISTA"; FEED/REELS → COMENTA "LISTA". Em ambos recebe o link no direct.
// A palavra LISTA é a heroína. Regras, noite e horário vêm de regraDia("sabado") (fonte única em src/data.ts).

export type FmtLista = "feed" | "story";
export const LISTA_B_DUR = 240; // 8s a 30fps

const R = regraDia("sabado");
const CTA: Record<FmtLista, string> = { feed: "COMENTE", story: "RESPONDA" };
const SLOGAN = "TE VEJO NA ESQUINA";

// "LISTA FEM. FREE ATÉ 00H" → { quem: "FEMININO", valor: "FREE", ate: "ATÉ 00H" } (se o texto mudar de formato, cai no texto inteiro)
type Parte = { quem: string; valor: string; ate: string };
const partes = (linha: string): Parte => {
  const m = linha.match(/^LISTA\s+(FEM|MASC)\.?\s+(.+?)\s+(ATÉ\s+\S+)$/i);
  if (!m) return { quem: "", valor: linha.toUpperCase(), ate: "" };
  return { quem: m[1].toUpperCase() === "FEM" ? "FEMININO" : "MASCULINO", valor: m[2].toUpperCase(), ate: m[3].toUpperCase() };
};
const FEM = partes(R.lista[0]);
const MASC = partes(R.lista[1]);

// "Sabadá do Butica" → "SABADÁ" + "DO BUTICA"
const NOITE = R.noite.toUpperCase();
const CORTE = NOITE.indexOf(" DO ");
const NOITE_1 = CORTE > 0 ? NOITE.slice(0, CORTE) : NOITE;
const NOITE_2 = CORTE > 0 ? NOITE.slice(CORTE + 1) : "";
const HORA = `A PARTIR DAS ${R.hora}`;

// ───────────────────────── ícones de traço (viewBox 24) ─────────────────────────
const Traco: React.FC<{ d: string[]; size: number; color: string; stroke?: number; fill?: string; style?: React.CSSProperties }> = ({ d, size, color, stroke = 2, fill = "none", style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block", overflow: "visible", flex: "0 0 auto", ...style }}>
    {d.map((p, i) => (
      <path key={i} d={p} fill={i === 0 ? fill : "none"} stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
    ))}
  </svg>
);
const AVIAO = ["M21.5 2.5 2.8 9.6l7.6 4 4 7.9z", "M21.5 2.5 10.4 13.6"];
const CORACAO = ["M12 20.5s-7.8-4.7-9.6-9.6C1.1 7.2 3.4 4 6.8 4c2.2 0 3.7 1.3 5.2 3.1C13.5 5.3 15 4 17.2 4c3.4 0 5.7 3.2 4.4 6.9-1.8 4.9-9.6 9.6-9.6 9.6z"];
const CHECK = ["M4.5 12.5l4.8 4.8L19.5 7"];
const INGRESSO = ["M3 6.5h18v3.2a2.3 2.3 0 0 0 0 4.6v3.2H3v-3.2a2.3 2.3 0 0 0 0-4.6z", "M15 6.8v2M15 11v2M15 15.2v2"];

const Pessoa: React.FC<{ size: number; bg: string; fg: string }> = ({ size, bg, fg }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block", flex: "0 0 auto" }}>
    <circle cx="12" cy="12" r="12" fill={bg} />
    <circle cx="12" cy="9.3" r="4.1" fill={fg} />
    <path d="M4.6 20.2c1.3-3.7 4.2-5.6 7.4-5.6s6.1 1.9 7.4 5.6A11.9 11.9 0 0 1 12 24a11.9 11.9 0 0 1-7.4-3.8z" fill={fg} />
  </svg>
);

// avatar do perfil do Butiquim (o "O" do logo)
const AvatarO: React.FC<{ size: number; bg: string; ring?: string; escuro?: boolean }> = ({ size, bg, ring, escuro }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: bg, flex: "0 0 auto", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: ring ? `0 0 0 ${Math.max(2, size * 0.05)}px ${ring}` : undefined }}>
    <Img src={staticFile("logos/o-simbolo.png")} style={{ width: size * 0.56, filter: escuro ? "brightness(0)" : undefined, opacity: escuro ? 0.85 : 1 }} />
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════════
// ARTE A — "Esquina de Vidro" (estática): noite violeta com fachos de palco, LISTA cromada
// atravessando o "O" cromado furta-cor em órbita, e cartões de vidro fosco.
// ═════════════════════════════════════════════════════════════════════════════════
const MAG = "#FF2E93";
const LIMA = "#C8D200";
const LILAS = "#A58BFF";
const BRANCO = "#F6F2FF";
const TINTA = "#2A0F5E"; // violeta da extrusão

const LUZES = [
  { color: MAG, pos: [-3, 2.5, 3] as [number, number, number], intensity: 7 },
  { color: LIMA, pos: [3, -2, 3] as [number, number, number], intensity: 5 },
  { color: "#5b6bff", pos: [0, 3, -2] as [number, number, number], intensity: 6 },
];
// luzes do anel mais carregadas de cor (furta-cor mais evidente atrás da palavra branca)
const LUZES_ANEL = [
  { color: MAG, pos: [-3.5, 2, 3] as [number, number, number], intensity: 13 },
  { color: LIMA, pos: [3.5, -2.5, 3] as [number, number, number], intensity: 8 },
  { color: "#5b6bff", pos: [0.5, 3.5, 1] as [number, number, number], intensity: 9 },
];

const Facho: React.FC<{ x: number; a: number; color: string; w: number; h: number; op?: number }> = ({ x, a, color, w, h, op = 0.42 }) => (
  <div
    style={{
      position: "absolute", left: x - w / 2, top: -60, width: w, height: h, transformOrigin: "50% 0%", transform: `rotate(${a}deg)`,
      background: `linear-gradient(180deg, ${color} 0%, rgba(0,0,0,0) 88%)`,
      clipPath: "polygon(46% 0, 54% 0, 100% 100%, 0 100%)", filter: "blur(9px)", mixBlendMode: "screen", opacity: op,
    }}
  />
);

const PalcoA: React.FC<{ h: number }> = ({ h }) => (
  <>
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #0D0624 0%, #1C0B45 52%, #0A0520 100%)" }} />
    <div style={{ position: "absolute", left: -260, top: -120, width: 820, height: 820, borderRadius: "50%", background: MAG, filter: "blur(170px)", opacity: 0.45 }} />
    <div style={{ position: "absolute", right: -300, top: h * 0.5, width: 760, height: 760, borderRadius: "50%", background: LIMA, filter: "blur(190px)", opacity: 0.2 }} />
    <div style={{ position: "absolute", right: -200, top: -200, width: 700, height: 700, borderRadius: "50%", background: "#3b4bff", filter: "blur(180px)", opacity: 0.4 }} />
    <div style={{ position: "absolute", left: 140, top: h * 0.3, width: 800, height: 520, borderRadius: "50%", background: "#7a3cff", filter: "blur(160px)", opacity: 0.35 }} />
    <Facho x={170} a={-24} color={LILAS} w={380} h={h * 1.1} />
    <Facho x={410} a={-8} color={LIMA} w={300} h={h * 1.05} op={0.34} />
    <Facho x={690} a={12} color={MAG} w={340} h={h * 1.1} />
    <Facho x={930} a={25} color={LILAS} w={380} h={h * 1.1} />
  </>
);

// cromo: extrusão violeta atrás + gradiente de cromo com reflexo magenta/lima + risco de brilho
const CROMO = "linear-gradient(180deg, #ffffff 0%, #f6f1ff 22%, #d2c2ff 41%, #7556dc 48.5%, #2f166f 52%, #ff8fcb 58%, #ffe4f3 66%, #ffffff 76%, #ecff9e 100%)";
const CromoTxt: React.FC<{ text: string; size: number; spacing?: string; depth?: number; glow?: number }> = ({ text, size, spacing = "-0.02em", depth = 8, glow = 0.55 }) => {
  const base: React.CSSProperties = { fontFamily: UNB, fontWeight: 900, fontSize: size, lineHeight: 1, letterSpacing: spacing, whiteSpace: "nowrap" };
  const ext = Array.from({ length: depth }, (_, i) => `0 ${i + 1}px 0 ${i === depth - 1 ? "#12062e" : TINTA}`).join(",");
  return (
    <div style={{ position: "relative" }}>
      <div style={{ ...base, position: "absolute", inset: 0, color: TINTA, WebkitTextStroke: `${Math.max(2, size * 0.014)}px ${TINTA}`, textShadow: `${ext}, 0 0 ${size * 0.25}px rgba(255,46,147,${glow}), 0 ${depth + 12}px ${size * 0.18}px rgba(0,0,0,.55)` }}>{text}</div>
      <div style={{ ...base, position: "relative", background: CROMO, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{text}</div>
      <div style={{ ...base, position: "absolute", inset: 0, background: "linear-gradient(104deg, rgba(255,255,255,0) 26%, rgba(255,255,255,.95) 33%, rgba(255,255,255,0) 40%, rgba(255,255,255,0) 70%, rgba(255,255,255,.6) 74%, rgba(255,255,255,0) 78%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", mixBlendMode: "screen" }}>{text}</div>
    </div>
  );
};

const Centro: React.FC<{ top: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ top, children, style }) => (
  <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", justifyContent: "center", ...style }}>{children}</div>
);

// o "O" cromado furta-cor em pé atrás da palavra (como o anel atrás do artista na identidade)
const AnelO: React.FC<{ fmt: FmtLista; cx: number; cy: number; ringH: number }> = ({ fmt, cx, cy, ringH }) => {
  const { w, h } = DIM[fmt];
  return <RingPx width={w} height={h} look="cromo" cx={cx} cy={cy} ringH={ringH} rotX={-0.22} rotY={0.5} rotZ={0} lights={LUZES_ANEL} envIntensity={0.85} />;
};

const vidro = (r: number): React.CSSProperties => ({
  borderRadius: r,
  backdropFilter: "blur(22px) saturate(170%)",
  WebkitBackdropFilter: "blur(22px) saturate(170%)",
  background: "linear-gradient(135deg, rgba(255,255,255,.2), rgba(255,255,255,.05) 60%, rgba(255,46,147,.08))",
  border: "1.5px solid rgba(255,255,255,.4)",
  boxShadow: "0 30px 60px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.55), inset 0 0 40px rgba(165,139,255,.15)",
});

const Coluna: React.FC<{ p: Parte; big: number }> = ({ p, big }) => (
  <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
    <div style={{ fontFamily: ARCHIVO, fontWeight: 800, fontSize: big * 0.27, letterSpacing: "0.26em", color: BRANCO, opacity: 0.8, marginRight: "-0.26em" }}>{p.quem}</div>
    <div style={{ fontFamily: UNB, fontWeight: 900, fontSize: big, lineHeight: 1.1, color: "#fff", letterSpacing: "-0.03em", textShadow: "0 0 28px rgba(255,46,147,.7), 0 4px 0 rgba(42,15,94,.8)", marginTop: 2 }}>{p.valor}</div>
    <div style={{ fontFamily: ARCHIVO, fontWeight: 900, fontSize: big * 0.33, color: LIMA, letterSpacing: "0.12em", marginTop: 4, textShadow: "0 0 18px rgba(200,210,0,.45)" }}>{p.ate}</div>
  </div>
);

const CartaoRegras: React.FC<{ y: number; h: number; big: number }> = ({ y, h, big }) => (
  <div style={{ position: "absolute", left: 60, width: 960, top: y, height: h, overflow: "hidden", ...vidro(34), display: "flex", flexDirection: "column" }}>
    <div style={{ position: "absolute", left: -40, top: -120, width: 560, height: 200, background: "linear-gradient(90deg, rgba(255,255,255,.26), rgba(255,255,255,0))", transform: "rotate(-12deg)" }} />
    <div style={{ display: "flex", justifyContent: "center", paddingTop: big * 0.3, paddingBottom: big * 0.16 }}>
      <div style={{ fontFamily: UNB, fontWeight: 700, fontSize: big * 0.22, letterSpacing: "0.3em", color: "#fff", background: MAG, borderRadius: 999, padding: "8px 24px 9px 30px", boxShadow: "0 0 24px rgba(255,46,147,.7)" }}>QUEM ESTÁ NA LISTA</div>
    </div>
    <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
      <Coluna p={FEM} big={big} />
      <div style={{ width: 2, alignSelf: "stretch", margin: "18px 0", background: "linear-gradient(180deg, rgba(255,255,255,0), rgba(255,255,255,.55), rgba(255,255,255,0))" }} />
      <Coluna p={MASC} big={big} />
    </div>
    <div style={{ borderTop: "1.5px solid rgba(255,255,255,.22)", padding: `${big * 0.16}px 40px ${big * 0.2}px`, textAlign: "center", fontFamily: ARCHIVO, fontWeight: 600, fontSize: big * 0.24, color: BRANCO, opacity: 0.9 }}>{R.obs}</div>
  </div>
);

const LinhaHora: React.FC<{ y: number; size: number }> = ({ y, size }) => (
  <Centro top={y}>
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.55, fontFamily: UNB, fontWeight: 700, fontSize: size, color: "#fff", letterSpacing: "0.12em" }}>
      <span>{R.diaSemana}</span>
      <span style={{ width: size * 0.36, height: size * 0.36, borderRadius: "50%", background: LIMA, boxShadow: `0 0 16px ${LIMA}` }} />
      <span>{HORA}</span>
    </div>
  </Centro>
);

const Slogan: React.FC<{ y: number; size: number }> = ({ y, size }) => (
  <Centro top={y}>
    <div style={{ fontFamily: UNB, fontWeight: 700, fontSize: size, letterSpacing: "0.5em", marginRight: "-0.5em", color: BRANCO, opacity: 0.72 }}>{SLOGAN}</div>
  </Centro>
);

// FEED: campo de comentário com LISTA digitado
const CampoComentario: React.FC<{ y: number }> = ({ y }) => (
  <div style={{ position: "absolute", left: 120, width: 840, top: y, height: 100, ...vidro(999), display: "flex", alignItems: "center", padding: "0 34px 0 14px", gap: 22 }}>
    <div style={{ borderRadius: "50%", padding: 4, background: `conic-gradient(from 200deg, ${MAG}, #ff9a3c, ${LIMA}, ${LILAS}, ${MAG})` }}>
      <div style={{ borderRadius: "50%", padding: 3, background: "#1a0b3d" }}>
        <Pessoa size={62} bg="#3a2472" fg="#cbbcff" />
      </div>
    </div>
    <div style={{ flex: 1, display: "flex", alignItems: "center", fontFamily: ARCHIVO, fontWeight: 800, fontSize: 48, color: "#fff", letterSpacing: "0.04em" }}>
      LISTA
      <span style={{ width: 4, height: 50, background: LIMA, marginLeft: 6, boxShadow: `0 0 10px ${LIMA}` }} />
    </div>
    <div style={{ fontFamily: ARCHIVO, fontWeight: 800, fontSize: 32, color: MAG, textShadow: "0 0 18px rgba(255,46,147,.6)" }}>Publicar</div>
  </div>
);

// STORY: barra de resposta do story com LISTA digitado
const BarraResposta: React.FC<{ y: number }> = ({ y }) => (
  <div style={{ position: "absolute", left: 60, right: 60, top: y, height: 104, display: "flex", alignItems: "center", gap: 26 }}>
    <div style={{ flex: 1, height: "100%", ...vidro(999), border: "2.5px solid rgba(255,255,255,.85)", display: "flex", alignItems: "center", padding: "0 36px", fontFamily: ARCHIVO, fontWeight: 800, fontSize: 50, color: "#fff", letterSpacing: "0.04em" }}>
      LISTA
      <span style={{ width: 4, height: 52, background: LIMA, marginLeft: 6, boxShadow: `0 0 10px ${LIMA}` }} />
    </div>
    <Traco d={CORACAO} size={58} color="#fff" stroke={1.8} />
    <div style={{ width: 96, height: 96, borderRadius: "50%", background: MAG, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 30px rgba(255,46,147,.8)" }}>
      <Traco d={AVIAO} size={50} color="#fff" stroke={2} style={{ marginLeft: -4, marginTop: 2 }} />
    </div>
  </div>
);

type LA = {
  logoTop: number; logoW: number; noiteTop: number; noiteSize: number; pillY: number; pillSize: number;
  ctaY: number; ctaSize: number; listaTop: number; listaSize: number; ringCx: number; ringCy: number; ringH: number;
  subY: number; subSize: number; campoY: number; cardY: number; cardH: number; big: number; horaY: number; horaSize: number; sloganY: number; sloganSize: number;
};
const LAYOUT_A: Record<FmtLista, LA> = {
  feed: {
    logoTop: 38, logoW: 210, noiteTop: 94, noiteSize: 104, pillY: 208, pillSize: 26,
    ctaY: 292, ctaSize: 50, listaTop: 352, listaSize: 236, ringCx: 540, ringCy: 468, ringH: 560,
    subY: 612, subSize: 28, campoY: 690, cardY: 826, cardH: 336, big: 96, horaY: 1192, horaSize: 30, sloganY: 1282, sloganSize: 20,
  },
  story: {
    logoTop: 214, logoW: 240, noiteTop: 282, noiteSize: 132, pillY: 426, pillSize: 30,
    ctaY: 540, ctaSize: 62, listaTop: 620, listaSize: 250, ringCx: 540, ringCy: 748, ringH: 640,
    subY: 900, subSize: 32, campoY: 1486, cardY: 996, cardH: 372, big: 104, horaY: 1404, horaSize: 34, sloganY: 1636, sloganSize: 22,
  },
};

export const ListaSabadoA: React.FC<{ fmt: FmtLista }> = ({ fmt }) => {
  const L = LAYOUT_A[fmt];
  const { h } = DIM[fmt];
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#0D0624" }}>
      <PalcoA h={h} />
      {/* o "O" fica atrás de tudo (título, pílula e a palavra LISTA) */}
      <AnelO fmt={fmt} cx={L.ringCx} cy={L.ringCy} ringH={L.ringH} />
      <Logo width={L.logoW} top={L.logoTop} />
      <Centro top={L.noiteTop}>
        <CromoTxt text={NOITE_1} size={L.noiteSize} depth={6} glow={0.4} />
      </Centro>
      <Centro top={L.pillY}>
        <div style={{ background: MAG, color: "#fff", fontFamily: UNB, fontWeight: 700, fontSize: L.pillSize, padding: "8px 28px 10px", borderRadius: 999, letterSpacing: "0.08em", boxShadow: "0 0 30px rgba(255,46,147,.8), inset 0 1px 0 rgba(255,255,255,.5)" }}>{NOITE_2}</div>
      </Centro>
      {/* herói: COMENTE/RESPONDA "LISTA" na frente do O cromado */}
      <Centro top={L.ctaY}>
        <div style={{ fontFamily: UNB, fontWeight: 700, fontSize: L.ctaSize, color: LIMA, letterSpacing: "0.3em", marginRight: "-0.3em", textShadow: "0 0 24px rgba(200,210,0,.55), 0 3px 0 rgba(20,6,46,.9), 0 0 6px rgba(20,6,46,.9)" }}>{CTA[fmt]}</div>
      </Centro>
      <Centro top={L.listaTop}>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: -L.listaSize * 0.2, top: -L.listaSize * 0.1, fontFamily: UNB, fontWeight: 900, fontSize: L.listaSize * 0.45, lineHeight: 1, color: MAG, textShadow: "0 0 24px rgba(255,46,147,.8), 0 3px 0 #12062e" }}>“</span>
          <CromoTxt text="LISTA" size={L.listaSize} spacing="-0.03em" depth={12} />
          <span style={{ position: "absolute", right: -L.listaSize * 0.2, top: -L.listaSize * 0.1, fontFamily: UNB, fontWeight: 900, fontSize: L.listaSize * 0.45, lineHeight: 1, color: MAG, textShadow: "0 0 24px rgba(255,46,147,.8), 0 3px 0 #12062e" }}>”</span>
        </div>
      </Centro>
      <Centro top={L.subY}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: ARCHIVO, fontWeight: 700, fontSize: L.subSize, color: "#fff", letterSpacing: "0.02em", background: "rgba(13,6,36,.62)", borderRadius: 999, padding: `${L.subSize * 0.28}px ${L.subSize * 0.9}px`, boxShadow: "0 8px 24px rgba(0,0,0,.35)" }}>
          <Traco d={AVIAO} size={L.subSize * 1.05} color={LIMA} stroke={2.2} />
          <span>e receba o link da lista no seu <b style={{ color: LIMA, fontWeight: 900 }}>direct</b></span>
        </div>
      </Centro>
      {fmt === "feed" ? <CampoComentario y={L.campoY} /> : <BarraResposta y={L.campoY} />}
      <CartaoRegras y={L.cardY} h={L.cardH} big={L.big} />
      <LinhaHora y={L.horaY} size={L.horaSize} />
      <Slogan y={L.sloganY} size={L.sloganSize} />
      {/* story: setas apontando para a barra de resposta de verdade (abaixo da área segura, só decoração) */}
      {fmt === "story" && (
        <Centro top={1714}>
          <svg width={70} height={70} viewBox="0 0 24 24" style={{ overflow: "visible", filter: `drop-shadow(0 0 10px ${LIMA})` }}>
            <path d="M5 5l7 6 7-6M5 12l7 6 7-6" fill="none" stroke={LIMA} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Centro>
      )}
      <Grain opacity={0.09} />
      <Vignette strength={0.42} />
    </AbsoluteFill>
  );
};

// ═════════════════════════════════════════════════════════════════════════════════
// ARTE B — "Lado A" (vídeo): capa de disco de pagode ao vivo. LISTA carimba na tela,
// o braço do toca-discos desce no vinil, a lista vira tracklist com LISTA na faixa 1
// e um balão de comentário/direct digita "LISTA" e recebe o link.
// ═════════════════════════════════════════════════════════════════════════════════
const CREME = "#FFF3D6";
const ROXO = "#2A0838";
const AMARELO = "#F2FF3A";
const MAGB = "#FF2E7E";
const LARANJA = "#FF8A1E";
const BPM = 15; // pulso a cada 15 quadros (120 bpm)

// linha do tempo (quadros): tudo entra até ~120; depois só loops (vinil, notas, eq, pulso)
const T = { vinil: 0, braco: 14, titulo: 4, lista: 12, fita: 34, sub: 40, selo: 48, faixas: 44, digitaFaixas: 52, chat: 54, digita: 62, envia: 86, resposta: 98 };

const pulsoDe = (frame: number, desde: number, forca: number) => (frame < desde ? 1 : 1 + forca * Math.exp(-((frame - desde) % BPM) / 3.5));
const digitado = (txt: string, frame: number, inicio: number, porQuadro: number) => txt.slice(0, Math.max(0, Math.min(txt.length, Math.floor((frame - inicio) * porQuadro))));

const CapaB: React.FC<{ h: number; cx: number; cy: number }> = ({ h, cx, cy }) => {
  const frame = useCurrentFrame();
  return (
    <>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 100%, #FFB23F 0%, ${LARANJA} 22%, ${MAGB} 48%, #8E1A7A 70%, ${ROXO} 100%)` }} />
      <AbsoluteFill
        style={{
          background: `repeating-conic-gradient(from ${frame * 0.3}deg at ${cx}px ${cy}px, rgba(255,243,214,.10) 0deg 6deg, rgba(255,243,214,0) 6deg 14deg)`,
          WebkitMaskImage: `radial-gradient(circle at ${cx}px ${cy}px, #000 10%, transparent ${h * 0.05}%)`,
        }}
      />
      <AbsoluteFill style={{ backgroundImage: "radial-gradient(circle, rgba(42,8,56,.35) 1.4px, transparent 2px)", backgroundSize: "12px 12px", WebkitMaskImage: "linear-gradient(180deg, transparent 40%, #000 100%)", opacity: 0.6 }} />
    </>
  );
};

const BoiasB: React.FC<{ w: number; h: number; n?: number }> = ({ w, h, n = 7 }) => {
  const frame = useCurrentFrame();
  const icones: Icone[] = ["chope", "caipirinha", "drink", "garrafa"];
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: n }, (_, i) => {
        const x = rnd(i + 3) * w;
        const y = ((rnd(i + 11) * h + frame * (0.6 + rnd(i) * 0.8)) % (h + 200)) - 100;
        const rot = Math.sin(frame / 20 + i) * 14;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: h - y, transform: `rotate(${rot}deg)`, opacity: 0.26 }}>
            <Ico i={icones[i % icones.length]} size={70 + rnd(i + 7) * 60} color={CREME} stroke={1.4} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// vinil de frente: entra rolando da direita, acelera até 33 rpm; rótulo amarelo com "LISTA" na faixa 1
const VinilB: React.FC<{ cx: number; cy: number; d: number }> = ({ cx, cy, d }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - T.vinil, fps, config: { damping: 16, stiffness: 60 } });
  const f = Math.max(0, frame);
  const rot = 4.2 * f - 4.2 * 14 * (1 - Math.exp(-f / 14)) - (1 - s) * 260; // começa parado, rola ao entrar
  const lbl = d * 0.37;
  return (
    <div style={{ position: "absolute", left: cx - d / 2 + (1 - s) * 700, top: cy - d / 2, width: d, height: d, filter: "drop-shadow(0 30px 40px rgba(42,8,56,.55))" }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "repeating-radial-gradient(circle at 50% 50%, #0d0d0f 0 2px, #1b1b1f 2px 3px, #0f0f12 3px 5px)", boxShadow: "inset 0 0 0 6px #050506" }} />
      {/* reflexo fixo (não gira) */}
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "conic-gradient(from 20deg, rgba(255,255,255,0) 0deg, rgba(255,255,255,.16) 30deg, rgba(255,255,255,0) 70deg, rgba(255,255,255,0) 180deg, rgba(255,255,255,.12) 215deg, rgba(255,255,255,0) 250deg)" }} />
      <div style={{ position: "absolute", left: d / 2 - lbl / 2, top: d / 2 - lbl / 2, width: lbl, height: lbl, borderRadius: "50%", transform: `rotate(${rot}deg)`, background: `radial-gradient(circle, ${ROXO} 0 4%, ${AMARELO} 4.5% 100%)`, color: ROXO, boxShadow: "inset 0 0 0 4px rgba(42,8,56,.25)" }}>
        <div style={{ position: "absolute", top: lbl * 0.13, left: 0, right: 0, textAlign: "center", fontFamily: ARCHIVO, fontWeight: 900, fontSize: lbl * 0.075, letterSpacing: "0.22em" }}>FAIXA 1</div>
        <div style={{ position: "absolute", top: lbl * 0.2, left: 0, right: 0, textAlign: "center", fontFamily: ANTON, fontSize: lbl * 0.22, lineHeight: 1 }}>LISTA</div>
        <div style={{ position: "absolute", bottom: lbl * 0.14, left: 0, right: 0, textAlign: "center", fontFamily: ARCHIVO, fontWeight: 800, fontSize: lbl * 0.065, letterSpacing: "0.18em" }}>LADO A ● {R.hora}</div>
        <Img src={staticFile("logos/o-simbolo.png")} style={{ position: "absolute", width: lbl * 0.13, left: lbl * 0.16, top: lbl * 0.47, filter: "brightness(0)", opacity: 0.75 }} />
        <Img src={staticFile("logos/o-simbolo.png")} style={{ position: "absolute", width: lbl * 0.13, right: lbl * 0.16, top: lbl * 0.47, filter: "brightness(0)", opacity: 0.75 }} />
      </div>
    </div>
  );
};

// braço do toca-discos: desce do descanso até o sulco (e treme de leve com a batida)
const BracoB: React.FC<{ cx: number; cy: number; d: number }> = ({ cx, cy, d }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const r = d / 2;
  const px = cx + r * 0.86;
  const py = cy - r * 0.92;
  const tx = cx + r * 0.5;
  const ty = cy - r * 0.2;
  const len = Math.hypot(tx - px, ty - py);
  const alvo = (Math.atan2(ty - py, tx - px) * 180) / Math.PI;
  const s = spring({ frame: frame - T.braco, fps, config: { damping: 13, stiffness: 55 } });
  const apareceu = interpolate(frame, [T.braco - 10, T.braco], [0, 1], clamp);
  const vibra = frame > T.braco + 30 ? Math.sin(frame * 1.7) * 0.25 : 0;
  const ang = alvo - (1 - s) * 34 + vibra;
  const tubo = Math.max(10, d * 0.022);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, opacity: apareceu, filter: "drop-shadow(6px 10px 8px rgba(0,0,0,.45))" }}>
      <div style={{ position: "absolute", left: px, top: py, width: 0, height: 0, transform: `rotate(${ang}deg)` }}>
        {/* contrapeso */}
        <div style={{ position: "absolute", left: -tubo * 6.2, top: -tubo * 1.6, width: tubo * 3.6, height: tubo * 3.2, borderRadius: tubo * 0.6, background: "linear-gradient(180deg, #f4f4f6, #8d8d96 60%, #55555c)" }} />
        {/* tubo */}
        <div style={{ position: "absolute", left: -tubo * 2.8, top: -tubo / 2, width: len - tubo * 1.2 + tubo * 2.8, height: tubo, borderRadius: tubo, background: "linear-gradient(180deg, #ffffff, #b9b9c2 55%, #6f6f78)" }} />
        {/* cápsula */}
        <div style={{ position: "absolute", left: len - tubo * 2.4, top: -tubo * 1.3, width: tubo * 4.4, height: tubo * 2.6, borderRadius: tubo * 0.4, background: `linear-gradient(180deg, ${MAGB}, #b3124f)`, transform: "rotate(22deg)", boxShadow: `0 0 0 ${tubo * 0.25}px ${ROXO}` }} />
      </div>
      {/* base do pivô */}
      <div style={{ position: "absolute", left: px - tubo * 2.6, top: py - tubo * 2.6, width: tubo * 5.2, height: tubo * 5.2, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, #ffffff, #a9a9b2 45%, #3a3a40)", boxShadow: `0 0 0 ${tubo * 0.4}px ${ROXO}` }} />
    </div>
  );
};

const NotasB: React.FC<{ cx: number; cy: number; r: number; desde: number; qtd?: number }> = ({ cx, cy, r, desde, qtd = 18 }) => {
  const frame = useCurrentFrame();
  const cores = [CREME, AMARELO, "#ffffff"];
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: qtd }, (_, i) => {
        const nasce = desde + i * 9;
        const vida = 72;
        if (frame < nasce) return null;
        const t = (frame - nasce) % vida;
        const ang = -Math.PI * (0.05 + rnd(i) * 0.75);
        const dist = r * 0.95 + t * (3 + rnd(i + 5) * 2.4);
        const x = cx + Math.cos(ang) * dist + Math.sin(t / 7 + i) * 14;
        const y = cy + Math.sin(ang) * dist;
        const op = interpolate(t, [0, 8, vida - 20, vida], [0, 1, 1, 0], clamp);
        const sz = 48 + rnd(i + 9) * 44;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, opacity: op, transform: `rotate(${Math.sin(t / 9 + i) * 20}deg) scale(${interpolate(t, [0, 10], [0.4, 1], clamp)})`, filter: "drop-shadow(0 4px 6px rgba(42,8,56,.4))" }}>
            <Nota size={sz} color={cores[i % cores.length]} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// SABADÁ caindo letra a letra + "do Butica" escrito à mão
const TituloB: React.FC<{ top: number; size: number; scriptSize: number; scriptX: number; scriptY: number }> = ({ top, size, scriptSize, scriptX, scriptY }) => {
  const frame = useCurrentFrame();
  const pulso = pulsoDe(frame, T.titulo + 40, 0.035);
  const p2 = interpolate(frame - (T.titulo + 18), [0, 16], [0, 100], clamp);
  // "Sabadá do Butica" → "do Butica" (grafia original, escrita à mão)
  const script = CORTE > 0 ? R.noite.slice(CORTE + 1) : "";
  return (
    <>
      <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", justifyContent: "center", transform: `scale(${pulso})`, transformOrigin: "50% 60%" }}>
        <div style={{ display: "flex", transform: "skewX(-9deg)" }}>
          {NOITE_1.split("").map((c, i) => {
            const p = interpolate(frame - T.titulo - i * 3, [0, 9], [0, 1], clamp);
            return (
              <span key={i} style={{ display: "inline-block", fontFamily: ANTON, fontSize: size, lineHeight: 1, color: CREME, transform: `translateY(${(1 - p) * -size}px) rotate(${(1 - p) * -25}deg)`, opacity: p, textShadow: `5px 5px 0 ${ROXO}, 10px 10px 0 ${MAGB}, 14px 14px 0 rgba(0,0,0,.25)`, WebkitTextStroke: `4px ${ROXO}`, paintOrder: "stroke fill" }}>
                {c}
              </span>
            );
          })}
        </div>
      </div>
      <div style={{ position: "absolute", left: scriptX, top: scriptY, transform: "rotate(-8deg)", filter: `drop-shadow(3px 4px 0 ${ROXO})` }}>
        <div style={{ fontFamily: YELLOWTAIL, fontSize: scriptSize, color: AMARELO, lineHeight: 1.1, whiteSpace: "nowrap", clipPath: `inset(-20% ${100 - p2}% -20% -5%)`, paddingRight: 12 }}>{script}</div>
      </div>
    </>
  );
};

// LISTA carimbada: cada letra despenca grande, gira e trava (com tremida de câmera na queda)
const ListaHeroB: React.FC<{ top: number; left: number; size: number }> = ({ top, left, size }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pulso = pulsoDe(frame, 60, 0.03);
  const d = size * 0.02;
  return (
    <div style={{ position: "absolute", top, left, transform: `scale(${pulso}) skewX(-9deg)`, transformOrigin: "30% 70%", display: "flex" }}>
      {"LISTA".split("").map((c, i) => {
        const t0 = T.lista + i * 4;
        const s = spring({ frame: frame - t0, fps, config: { damping: 11, stiffness: 180, mass: 0.8 } });
        const op = interpolate(frame - t0, [0, 3], [0, 1], clamp);
        return (
          <span
            key={i}
            style={{
              display: "inline-block", fontFamily: ANTON, fontSize: size, lineHeight: 0.92, color: AMARELO, opacity: op,
              transform: `scale(${interpolate(s, [0, 1], [2.8, 1])}) rotate(${(1 - s) * (i % 2 ? 22 : -22)}deg)`,
              WebkitTextStroke: `${size * 0.02}px ${ROXO}`, paintOrder: "stroke fill",
              textShadow: `${d}px ${d}px 0 ${ROXO}, ${d * 2.2}px ${d * 2.2}px 0 ${MAGB}, ${d * 2.2 + 8}px ${d * 2.2 + 8}px 0 rgba(0,0,0,.22)`,
            }}
          >
            {c}
          </span>
        );
      })}
    </div>
  );
};

// fita adesiva magenta com COMENTE/RESPONDA
const FitaCTA: React.FC<{ texto: string; x: number; y: number; size: number }> = ({ texto, x, y, size }) => {
  const s = useSpr(T.fita, { damping: 12, stiffness: 140 });
  const frame = useCurrentFrame();
  const pulso = pulsoDe(frame, T.fita + 30, 0.04);
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translateX(${(1 - s) * -800}px) rotate(-5deg) scale(${pulso})`, transformOrigin: "left center", filter: `drop-shadow(6px 7px 0 ${ROXO})` }}>
      <div style={{ background: MAGB, color: CREME, fontFamily: ANTON, fontSize: size, lineHeight: 1, letterSpacing: "0.06em", padding: `${size * 0.1}px ${size * 0.42}px ${size * 0.12}px`, clipPath: "polygon(0 8%, 3% 0, 97% 4%, 100% 0, 99% 50%, 100% 100%, 96% 94%, 4% 100%, 0 96%, 1.5% 50%)", display: "flex", alignItems: "center", gap: size * 0.2 }}>
        {texto}
        <span style={{ fontFamily: ARCHIVO, fontWeight: 900, fontSize: size * 0.6, color: AMARELO }}>↓</span>
      </div>
    </div>
  );
};

const SubB: React.FC<{ x: number; y: number; size: number }> = ({ x, y, size }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - T.sub, [0, 18], [0, 100], clamp);
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: "rotate(-4deg)", filter: `drop-shadow(3px 4px 0 ${ROXO})` }}>
      <div style={{ fontFamily: YELLOWTAIL, fontSize: size, color: CREME, lineHeight: 1.15, whiteSpace: "nowrap", clipPath: `inset(-20% ${100 - p}% -20% -5%)`, paddingRight: 12 }}>
        e receba o link no <span style={{ color: AMARELO }}>direct</span>
      </div>
    </div>
  );
};

// selo estourado: A PARTIR DAS 23H
const SeloB: React.FC<{ x: number; y: number; d: number }> = ({ x, y, d }) => {
  const s = useSpr(T.selo, { damping: 8, stiffness: 150 });
  const frame = useCurrentFrame();
  const pts = Array.from({ length: 32 }, (_, i) => {
    const a = (i / 32) * Math.PI * 2;
    const r = i % 2 ? 42 : 50;
    return `${50 + Math.cos(a) * r}% ${50 + Math.sin(a) * r}%`;
  }).join(",");
  return (
    <div style={{ position: "absolute", left: x - d / 2, top: y - d / 2, width: d, height: d, transform: `scale(${s}) rotate(${12 + Math.sin(frame / 18) * 4}deg)`, filter: `drop-shadow(4px 6px 0 ${ROXO})` }}>
      <div style={{ position: "absolute", inset: 0, background: AMARELO, clipPath: `polygon(${pts})` }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: ROXO, lineHeight: 0.95 }}>
        <div style={{ fontFamily: ARCHIVO, fontWeight: 900, fontSize: d * 0.085, letterSpacing: "0.1em" }}>A PARTIR DAS</div>
        <div style={{ fontFamily: ANTON, fontSize: d * 0.36 }}>{R.hora}</div>
        <div style={{ fontFamily: ARCHIVO, fontWeight: 900, fontSize: d * 0.1, letterSpacing: "0.12em" }}>{R.diaSemana}</div>
      </div>
    </div>
  );
};

// equalizador da faixa tocando
const Eq: React.FC<{ h: number; color: string; on: boolean }> = ({ h, color, on }) => {
  const frame = useCurrentFrame();
  return (
    <span style={{ display: "inline-flex", alignItems: "flex-end", gap: h * 0.12, height: h, marginLeft: h * 0.4, verticalAlign: "middle" }}>
      {[0, 1, 2, 3].map((i) => {
        const v = on ? 0.25 + 0.75 * Math.abs(Math.sin(frame / (2.6 + i * 0.7) + i * 1.7)) : 0.2;
        return <span key={i} style={{ width: h * 0.2, height: h * v, background: color, borderRadius: 2 }} />;
      })}
    </span>
  );
};

// tracklist digitada: LISTA é a faixa 1 (tocando, com equalizador)
const FaixasB: React.FC<{ fmt: FmtLista; x: number; y: number; w: number; size: number }> = ({ fmt, x, y, w, size }) => {
  const frame = useCurrentFrame();
  const s = useSpr(T.faixas, { damping: 16 });
  const faixas = [
    `${CTA[fmt]} “LISTA”`,
    `${FEM.quem} ${FEM.valor} ${FEM.ate}`.trim(),
    `${MASC.quem} ${MASC.valor} ${MASC.ate}`.trim(),
    "APÓS A 1ª HORA: DESCONTO NA PORTARIA*",
    `${R.diaSemana}, ${HORA}`,
  ];
  const vel = 2.4;
  let t = frame - T.digitaFaixas;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, transform: `rotate(-1.6deg) translateY(${(1 - s) * 80}px)`, opacity: s, background: CREME, color: ROXO, padding: `${size * 0.7}px ${size}px ${size * 0.6}px`, boxShadow: `9px 11px 0 ${ROXO}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: `3px solid ${ROXO}`, paddingBottom: size * 0.25, marginBottom: size * 0.4 }}>
        <span style={{ fontFamily: ANTON, fontSize: size * 1.55, letterSpacing: "0.04em", lineHeight: 1 }}>LADO A</span>
        <span style={{ fontFamily: ARCHIVO, fontWeight: 800, fontSize: size * 0.62, letterSpacing: "0.16em" }}>{NOITE} ● 33 RPM</span>
      </div>
      {faixas.map((f, i) => {
        const num = String(i + 1).padStart(2, "0");
        const vis = Math.max(0, Math.min(f.length, Math.floor(t * vel)));
        t -= f.length / vel + 1.5;
        const primeira = i === 0;
        const pronto = vis === f.length;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", fontFamily: ARCHIVO, fontWeight: primeira ? 900 : 700, fontSize: size * (primeira ? 1.18 : 0.95), lineHeight: 1.42, whiteSpace: "nowrap", color: primeira ? MAGB : ROXO, opacity: vis > 0 || primeira ? 1 : 0 }}>
            <span style={{ width: size * 1.7, flex: "0 0 auto", opacity: 0.55, fontWeight: 800 }}>{num}</span>
            <span>
              {f.slice(0, vis)}
              {vis > 0 && !pronto && <span style={{ opacity: 0.6 }}>▌</span>}
            </span>
            {primeira && <Eq h={size * 0.9} color={MAGB} on={pronto} />}
          </div>
        );
      })}
      <div style={{ marginTop: size * 0.35, paddingTop: size * 0.3, borderTop: `2px dashed rgba(42,8,56,.35)`, display: "flex", justifyContent: "space-between", alignItems: "baseline", fontFamily: ARCHIVO, fontWeight: 600, fontSize: size * 0.68, opacity: interpolate(frame, [T.digitaFaixas + 50, T.digitaFaixas + 62], [0, 1], clamp) }}>
        <span>* {R.obs}</span>
      </div>
    </div>
  );
};

// FEED — campo de comentário: digita LISTA, toca em Publicar, chega a notificação do direct
const ChatFeedB: React.FC<{ x: number; y: number; w: number; h: number; toastX: number; toastY: number; toastW: number }> = ({ x, y, w, h, toastX, toastY, toastW }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entra = spring({ frame: frame - T.chat, fps, config: { damping: 15 } });
  const txt = digitado("LISTA", frame, T.digita, 0.25);
  const enviado = frame >= T.envia;
  const toque = interpolate(frame, [T.envia - 4, T.envia, T.envia + 6], [1, 0.82, 1], clamp);
  const ok = spring({ frame: frame - (T.envia + 2), fps, config: { damping: 9, stiffness: 200 } });
  const toast = spring({ frame: frame - T.resposta, fps, config: { damping: 14, stiffness: 110 } });
  return (
    <>
      <div style={{ position: "absolute", left: x, top: y, width: w, height: h, transform: `translateY(${(1 - entra) * 160}px) rotate(1deg)`, opacity: entra, background: "#fff", border: `4px solid ${ROXO}`, borderRadius: h / 2, boxShadow: `7px 8px 0 ${ROXO}`, display: "flex", alignItems: "center", padding: `0 ${h * 0.32}px 0 ${h * 0.12}px`, gap: h * 0.18 }}>
        <div style={{ borderRadius: "50%", padding: h * 0.04, background: `conic-gradient(from 200deg, ${MAGB}, ${LARANJA}, ${AMARELO}, ${MAGB})` }}>
          <div style={{ borderRadius: "50%", padding: h * 0.03, background: "#fff" }}>
            <Pessoa size={h * 0.6} bg="#e9dff0" fg="#8e6fa3" />
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", fontFamily: ARCHIVO, fontWeight: 900, fontSize: h * 0.44, color: ROXO, letterSpacing: "0.03em", whiteSpace: "nowrap" }}>
          {txt.length === 0 ? <span style={{ fontWeight: 600, fontSize: h * 0.3, color: "#9a8aa6", letterSpacing: 0 }}>Adicione um comentário…</span> : txt}
          {txt.length > 0 && !enviado && <span style={{ width: 4, height: h * 0.46, background: MAGB, marginLeft: 5 }} />}
        </div>
        {enviado ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, transform: `scale(${ok})`, fontFamily: ARCHIVO, fontWeight: 900, fontSize: h * 0.26, color: MAGB }}>
            <span style={{ width: h * 0.4, height: h * 0.4, borderRadius: "50%", background: MAGB, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Traco d={CHECK} size={h * 0.28} color="#fff" stroke={3.2} />
            </span>
            enviado
          </div>
        ) : (
          <div style={{ fontFamily: ARCHIVO, fontWeight: 900, fontSize: h * 0.3, color: MAGB, opacity: txt.length > 0 ? 1 : 0.35, transform: `scale(${toque})` }}>Publicar</div>
        )}
      </div>
      {/* notificação do direct */}
      <div style={{ position: "absolute", left: toastX, top: toastY, width: toastW, transform: `translateX(${(1 - toast) * 520}px) rotate(-2deg)`, opacity: interpolate(toast, [0, 0.3], [0, 1], clamp), background: ROXO, borderRadius: 26, border: `3px solid ${AMARELO}`, boxShadow: `7px 8px 0 rgba(42,8,56,.55)`, padding: "14px 18px 16px", display: "flex", alignItems: "center", gap: 14 }}>
        <AvatarO size={64} bg={AMARELO} ring={MAGB} escuro />
        <div style={{ display: "flex", flexDirection: "column", color: CREME, lineHeight: 1.12 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: ARCHIVO, fontWeight: 800, fontSize: 17, letterSpacing: "0.16em", color: AMARELO }}>
            <Traco d={AVIAO} size={18} color={AMARELO} stroke={2.4} /> DIRECT
          </span>
          <span style={{ fontFamily: ARCHIVO, fontWeight: 900, fontSize: 25, marginTop: 3 }}>obutiquim</span>
          <span style={{ fontFamily: ARCHIVO, fontWeight: 600, fontSize: 22, opacity: 0.92 }}>te mandou o link da lista</span>
        </div>
      </div>
    </>
  );
};

// STORY — conversa do direct: digita LISTA na resposta do story, envia, o Butiquim responde com o link
const ChatStoryB: React.FC<{ x: number; y: number; w: number }> = ({ x, y, w }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entra = spring({ frame: frame - T.chat, fps, config: { damping: 15 } });
  const enviado = frame >= T.envia;
  const txt = enviado ? "" : digitado("LISTA", frame, T.digita, 0.25);
  const toque = interpolate(frame, [T.envia - 4, T.envia, T.envia + 6], [1, 0.8, 1], clamp);
  const bolha = spring({ frame: frame - T.envia, fps, config: { damping: 12, stiffness: 160 } });
  const digitando = frame >= T.envia + 6 && frame < T.resposta;
  const resp = spring({ frame: frame - T.resposta, fps, config: { damping: 13, stiffness: 140 } });
  const link = spring({ frame: frame - (T.resposta + 8), fps, config: { damping: 12, stiffness: 150 } });
  const BAR = 92;
  const topoBarra = 298;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: topoBarra + BAR, transform: `translateY(${(1 - entra) * 200}px)`, opacity: entra }}>
      {/* bolha enviada: LISTA (sai da barra e sobe) */}
      <div style={{ position: "absolute", right: 0, top: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", transform: `translateY(${(1 - bolha) * 240}px) scale(${interpolate(bolha, [0, 1], [0.5, 1])})`, transformOrigin: "100% 100%", opacity: enviado ? 1 : 0 }}>
        <span style={{ fontFamily: ARCHIVO, fontWeight: 700, fontSize: 21, color: CREME, opacity: 0.92, marginBottom: 6, marginRight: 10, textShadow: `0 2px 0 ${ROXO}` }}>você respondeu ao story</span>
        <div style={{ background: `linear-gradient(135deg, #7B2CFF, ${MAGB})`, color: "#fff", fontFamily: ARCHIVO, fontWeight: 900, fontSize: 52, lineHeight: 1, letterSpacing: "0.04em", padding: "14px 34px 16px", borderRadius: "40px 40px 10px 40px", border: `4px solid ${ROXO}`, boxShadow: `6px 7px 0 ${ROXO}` }}>LISTA</div>
      </div>
      {/* "digitando…" e a resposta do Butiquim */}
      <div style={{ position: "absolute", left: 0, top: 134, display: "flex", alignItems: "flex-end", gap: 14 }}>
        <div style={{ opacity: enviado ? interpolate(frame, [T.envia + 4, T.envia + 10], [0, 1], clamp) : 0 }}>
          <AvatarO size={64} bg={AMARELO} ring={ROXO} escuro />
        </div>
        {digitando && (
          <div style={{ background: CREME, borderRadius: "34px 34px 34px 10px", border: `4px solid ${ROXO}`, padding: "22px 28px", display: "flex", gap: 10, boxShadow: `6px 7px 0 ${ROXO}` }}>
            {[0, 1, 2].map((i) => (
              <span key={i} style={{ width: 16, height: 16, borderRadius: "50%", background: ROXO, opacity: 0.35 + 0.65 * Math.max(0, Math.sin(frame / 3 - i * 1.1)), transform: `translateY(${-Math.max(0, Math.sin(frame / 3 - i * 1.1)) * 6}px)` }} />
            ))}
          </div>
        )}
        {frame >= T.resposta && (
          <div style={{ transform: `scale(${resp})`, transformOrigin: "0% 100%", background: CREME, color: ROXO, borderRadius: "34px 34px 34px 10px", border: `4px solid ${ROXO}`, padding: "13px 20px 15px", boxShadow: `6px 7px 0 ${ROXO}`, width: w - 100 }}>
            <div style={{ fontFamily: ARCHIVO, fontWeight: 800, fontSize: 31, lineHeight: 1.15 }}>Aqui está o seu link da lista!</div>
            <div style={{ marginTop: 9, transform: `scale(${link})`, transformOrigin: "0% 50%", display: "flex", alignItems: "center", gap: 16, background: ROXO, color: CREME, borderRadius: 16, padding: "10px 18px" }}>
              <Traco d={INGRESSO} size={42} color={AMARELO} stroke={2} />
              <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.12 }}>
                <span style={{ fontFamily: ARCHIVO, fontWeight: 900, fontSize: 26, letterSpacing: "0.04em" }}>LISTA ● {NOITE}</span>
                <span style={{ fontFamily: ARCHIVO, fontWeight: 600, fontSize: 20, opacity: 0.82 }}>toque para colocar seu nome</span>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <Traco d={CHECK} size={38} color={AMARELO} stroke={3} />
              </div>
            </div>
          </div>
        )}
      </div>
      {/* barra de resposta do story */}
      <div style={{ position: "absolute", left: 0, right: 0, top: topoBarra, height: BAR, display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ flex: 1, height: "100%", borderRadius: 999, border: `4px solid ${CREME}`, background: "rgba(42,8,56,.6)", display: "flex", alignItems: "center", padding: "0 34px", fontFamily: ARCHIVO, fontWeight: 900, fontSize: 46, color: CREME, letterSpacing: "0.04em", boxShadow: `6px 7px 0 ${ROXO}` }}>
          {txt.length === 0 ? <span style={{ fontWeight: 600, fontSize: 32, opacity: 0.72, letterSpacing: 0 }}>Enviar mensagem…</span> : txt}
          {txt.length > 0 && <span style={{ width: 4, height: 44, background: AMARELO, marginLeft: 5 }} />}
        </div>
        <div style={{ width: BAR, height: BAR, borderRadius: "50%", background: AMARELO, border: `4px solid ${ROXO}`, boxShadow: `6px 7px 0 ${ROXO}`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${toque})` }}>
          <Traco d={AVIAO} size={46} color={ROXO} stroke={2.4} style={{ marginLeft: -4, marginTop: 2 }} />
        </div>
      </div>
    </div>
  );
};

const SloganB: React.FC<{ y: number; size: number }> = ({ y, size }) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [T.faixas + 10, T.faixas + 30], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", top: y, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: op }}>
      <div style={{ fontFamily: ANTON, fontSize: size, color: CREME, letterSpacing: "0.12em", marginRight: "-0.12em", textShadow: `3px 3px 0 ${ROXO}`, display: "flex", alignItems: "center", gap: size * 0.4 }}>
        <Nota size={size * 0.8} color={AMARELO} />
        {SLOGAN}
        <Nota size={size * 0.8} color={AMARELO} />
      </div>
    </div>
  );
};

// slogan em etiqueta (story: canto superior esquerdo, como a etiqueta de estilo da identidade)
const SloganTag: React.FC<{ x: number; y: number; size: number }> = ({ x, y, size }) => {
  const s = useSpr(T.titulo + 10, { damping: 10 });
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `rotate(-3deg) scale(${s})`, transformOrigin: "left top", display: "flex", alignItems: "center", gap: 10, background: ROXO, color: AMARELO, padding: "8px 18px 9px 12px", border: `3px solid ${AMARELO}`, boxShadow: `4px 5px 0 ${MAGB}` }}>
      <Nota size={size * 1.2} color={AMARELO} />
      <div style={{ display: "flex", flexDirection: "column", fontFamily: ANTON, fontSize: size, lineHeight: 1.02, letterSpacing: "0.06em" }}>
        <span>TE VEJO</span>
        <span style={{ color: CREME }}>NA ESQUINA</span>
      </div>
    </div>
  );
};

type LB = {
  logoTop: number; logoW: number; tituloTop: number; tituloSize: number; scriptSize: number; scriptX: number; scriptY: number;
  vinil: { cx: number; cy: number; d: number }; selo: { x: number; y: number; d: number };
  fita: { x: number; y: number; size: number }; lista: { top: number; left: number; size: number }; sub: { x: number; y: number; size: number };
  faixas: { x: number; y: number; w: number; size: number }; chat: { x: number; y: number };
  slogan: { tipo: "linha"; y: number; size: number } | { tipo: "etiqueta"; x: number; y: number; size: number };
};
const LAYOUT_B: Record<FmtLista, LB> = {
  feed: {
    logoTop: 30, logoW: 200, tituloTop: 70, tituloSize: 160, scriptSize: 70, scriptX: 548, scriptY: 196,
    vinil: { cx: 800, cy: 560, d: 600 }, selo: { x: 972, y: 158, d: 170 },
    fita: { x: 56, y: 292, size: 62 }, lista: { top: 358, left: 58, size: 340 }, sub: { x: 80, y: 688, size: 56 },
    faixas: { x: 44, y: 912, w: 992, size: 28 }, chat: { x: 44, y: 782 },
    slogan: { tipo: "linha", y: 1292, size: 30 },
  },
  story: {
    logoTop: 214, logoW: 230, tituloTop: 256, tituloSize: 176, scriptSize: 78, scriptX: 520, scriptY: 382,
    vinil: { cx: 800, cy: 730, d: 690 }, selo: { x: 952, y: 330, d: 186 },
    fita: { x: 56, y: 468, size: 66 }, lista: { top: 540, left: 54, size: 352 }, sub: { x: 76, y: 868, size: 56 },
    faixas: { x: 44, y: 958, w: 992, size: 25 }, chat: { x: 50, y: 1294 },
    slogan: { tipo: "etiqueta", x: 40, y: 190, size: 26 },
  },
};

export const ListaSabadoB: React.FC<{ fmt: FmtLista }> = ({ fmt }) => {
  const frame = useCurrentFrame();
  const { w, h } = DIM[fmt];
  const L = LAYOUT_B[fmt];
  // tremida de câmera quando as letras de LISTA batem
  const bate = [0, 1, 2, 3, 4].reduce((acc, i) => {
    const t = frame - (T.lista + i * 4 + 3);
    return t >= 0 ? acc + Math.exp(-t / 3) * (i === 4 ? 1.4 : 0.6) : acc;
  }, 0);
  const sx = Math.sin(frame * 2.3) * 9 * bate;
  const sy = Math.cos(frame * 3.1) * 7 * bate;
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: ROXO }}>
      <CapaB h={h} cx={L.vinil.cx} cy={L.vinil.cy} />
      <BoiasB w={w} h={h} />
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px)` }}>
        <VinilB cx={L.vinil.cx} cy={L.vinil.cy} d={L.vinil.d} />
        <BracoB cx={L.vinil.cx} cy={L.vinil.cy} d={L.vinil.d} />
        <NotasB cx={L.vinil.cx} cy={L.vinil.cy} r={L.vinil.d / 2} desde={T.braco + 20} />
        <TituloB top={L.tituloTop} size={L.tituloSize} scriptSize={L.scriptSize} scriptX={L.scriptX} scriptY={L.scriptY} />
        <SeloB x={L.selo.x} y={L.selo.y} d={L.selo.d} />
        <ListaHeroB top={L.lista.top} left={L.lista.left} size={L.lista.size} />
        <FitaCTA texto={CTA[fmt]} x={L.fita.x} y={L.fita.y} size={L.fita.size} />
        <SubB x={L.sub.x} y={L.sub.y} size={L.sub.size} />
        <FaixasB fmt={fmt} x={L.faixas.x} y={L.faixas.y} w={L.faixas.w} size={L.faixas.size} />
        {fmt === "feed" ? (
          <ChatFeedB x={L.chat.x} y={L.chat.y} w={600} h={96} toastX={668} toastY={L.chat.y - 16} toastW={372} />
        ) : (
          <ChatStoryB x={L.chat.x} y={L.chat.y} w={980} />
        )}
        {L.slogan.tipo === "linha" && <SloganB y={L.slogan.y} size={L.slogan.size} />}
      </AbsoluteFill>
      {L.slogan.tipo === "etiqueta" && <SloganTag x={L.slogan.x} y={L.slogan.y} size={L.slogan.size} />}
      <Logo width={L.logoW} top={L.logoTop} />
      <Grain opacity={0.12} />
      <Vignette strength={0.35} color="42,8,56" />
    </AbsoluteFill>
  );
};
