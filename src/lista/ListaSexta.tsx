import React, { createContext, useContext } from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { ARCHIVO, BARLOW, BIG } from "../fonts";
import { Grain, Logo, Vignette, clamp, useSpr } from "../shared/fx";
import { RingPx } from "../shared/Ring3D";
import { Ico, Icone, rnd } from "../shared/icones";
import { regraDia } from "../data";

// ARTES DE LISTA DA SEXTA ("de sempre": sem artista e sem data, reaproveitadas toda semana)
// A palavra LISTA é a heroína: no FEED o CTA é COMENTE "LISTA", no STORY é RESPONDA "LISTA"
// (a automação do Instagram manda o link da lista no direct).
// A = estática, linguagem "Placa de Esquina" (src/ids/Sexta.tsx)
// B = vídeo 8s sem áudio, linguagem "Painel de Embarque" (src/ids/SextaB.tsx)

export type FmtLista = "feed" | "story";
export const LISTA_B_DUR = 240;

const REGRA = regraDia("sexta");
// a quinta (só abre em véspera) usa as mesmas artes e os mesmos valores, muda só o nome da noite
export type DiaLista = "sexta" | "quinta";
const ROTULOS: Record<DiaLista, { titulo: string; tag: string; noite: string }> = {
  sexta: { titulo: "SEXTA", tag: "DO BUTICA", noite: REGRA.noite.toUpperCase() }, // "SEXTA DO BUTICA"
  quinta: { titulo: "QUINTA", tag: "BUTIQUINTA", noite: "BUTIQUINTA" },
};
const Rot = createContext(ROTULOS.sexta);
const HORA = REGRA.hora; // "23H"

// "LISTA FEM. FREE ATÉ 00H" → { quem: "FEMININO", valor: "FREE", ate: "00H" }
type Regra = { quem: string; sexo: "f" | "m"; valor: string; ate: string };
const REGRAS: Regra[] = REGRA.lista.map((s) => {
  const m = s.match(/^LISTA\s+(FEM|MASC)\.?\s+(.+?)\s+AT[ÉE]\s+(\S+)$/i);
  if (!m) return { quem: s, sexo: "f", valor: "", ate: "" };
  const f = m[1].toUpperCase() === "FEM";
  return { quem: f ? "FEMININO" : "MASCULINO", sexo: f ? "f" : "m", valor: m[2].toUpperCase(), ate: m[3].toUpperCase() };
});

const CTA: Record<FmtLista, { verbo: string; direct: string }> = {
  feed: { verbo: "COMENTE", direct: "E RECEBA O LINK DA LISTA NO SEU DIRECT" },
  story: { verbo: "RESPONDA", direct: "AQUI NO STORY E RECEBA O LINK NO SEU DIRECT" },
};

// ---------- ícones de traço próprios desta peça ----------
const Aviaozinho: React.FC<{ size: number; color: string; fill?: string; stroke?: number; style?: React.CSSProperties }> = ({ size, color, fill = "none", stroke = 1.8, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block", overflow: "visible", flex: "0 0 auto", ...style }}>
    <path d="M21.5 2.5 2.8 9.6l7.4 3.4 3.3 7.6z" fill={fill} stroke={color} strokeWidth={stroke} strokeLinejoin="round" />
    <path d="M21.5 2.5 10.2 13" fill="none" stroke={fill === "none" ? color : "rgba(0,0,0,.35)"} strokeWidth={stroke} strokeLinecap="round" />
  </svg>
);

const Balao: React.FC<{ size: number; color: string; stroke?: number }> = ({ size, color, stroke = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block", flex: "0 0 auto" }}>
    <path d="M20.3 16.6A9 9 0 1 0 16.9 19.7L21.6 21z" fill="none" stroke={color} strokeWidth={stroke} strokeLinejoin="round" />
  </svg>
);

const Coracao: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block", flex: "0 0 auto" }}>
    <path d="M12 20.5s-8-4.7-8-10.6A4.4 4.4 0 0 1 12 7.6a4.4 4.4 0 0 1 8 2.3c0 5.9-8 10.6-8 10.6z" fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
  </svg>
);

const Sexo: React.FC<{ s: "f" | "m"; size: number; color: string }> = ({ s, size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block", flex: "0 0 auto" }}>
    {s === "f" ? (
      <>
        <circle cx="12" cy="9" r="5.6" fill="none" stroke={color} strokeWidth={2.6} />
        <path d="M12 14.6V22.5M8.2 18.6h7.6" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" />
      </>
    ) : (
      <>
        <circle cx="9.6" cy="14.4" r="5.8" fill="none" stroke={color} strokeWidth={2.6} />
        <path d="M13.8 10.2 20.8 3.2M14.6 3.2h6.2v6.2" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
      </>
    )}
  </svg>
);

// =====================================================================
// ARTE A — "Placa de Esquina" (estática): preto + lima, placa de rua com a palavra LISTA
// =====================================================================
const LIMA = "#C8D200";
const PRETO = "#0B0B09";
const OSSO = "#F2F0E6";

type LA = {
  ringCx: number; ringCy: number; ringH: number;
  logoTop: number; logoW: number;
  titTop: number; titSize: number;
  tagX: number; tagY: number; tagSize: number;
  cardX: number; cardY: number; cardSize: number;
  placaY: number; verboSize: number; listaSize: number;
  directY: number; directSize: number;
  regrasY: number; regraW: number; regraValor: number;
  obsY: number; obsSize: number;
  faixaY: number; faixaH: number; faixaSize: number;
  dica?: number;
};

const LAYOUT_A: Record<FmtLista, LA> = {
  feed: {
    ringCx: 540, ringCy: 468, ringH: 570,
    logoTop: 38, logoW: 210,
    titTop: 104, titSize: 200,
    tagX: 668, tagY: 232, tagSize: 36,
    cardX: 92, cardY: 128, cardSize: 1,
    placaY: 318, verboSize: 70, listaSize: 318,
    directY: 766, directSize: 31,
    regrasY: 838, regraW: 446, regraValor: 118,
    obsY: 1132, obsSize: 25,
    faixaY: 1208, faixaH: 72, faixaSize: 46,
  },
  story: {
    ringCx: 540, ringCy: 650, ringH: 700,
    logoTop: 214, logoW: 240,
    titTop: 298, titSize: 250,
    tagX: 676, tagY: 458, tagSize: 42,
    cardX: 70, cardY: 330, cardSize: 1.18,
    placaY: 590, verboSize: 80, listaSize: 312,
    directY: 1072, directSize: 32,
    regrasY: 1150, regraW: 460, regraValor: 132,
    obsY: 1462, obsSize: 27,
    faixaY: 1530, faixaH: 78, faixaSize: 50,
    dica: 1640,
  },
};

const FundoA: React.FC<{ cx: number; cy: number }> = ({ cx, cy }) => (
  <>
    <AbsoluteFill style={{ background: PRETO }} />
    <AbsoluteFill style={{ background: `radial-gradient(circle at ${cx}px ${cy}px, rgba(200,210,0,.24) 0%, rgba(200,210,0,0) 52%)` }} />
    <AbsoluteFill
      style={{
        backgroundImage: "radial-gradient(circle, rgba(200,210,0,.55) 1.7px, transparent 2.3px)",
        backgroundSize: "15px 15px",
        WebkitMaskImage: `radial-gradient(circle at ${cx}px ${cy}px, rgba(0,0,0,.9) 0%, rgba(0,0,0,0) 58%)`,
        opacity: 0.35,
      }}
    />
  </>
);

// "SEXTA" + tag "DO BUTICA" + cartão "A PARTIR DAS 23H"
const TituloA: React.FC<{ L: LA }> = ({ L }) => {
  const R = useContext(Rot);
  return (
  <>
    <div style={{ position: "absolute", top: L.titTop, left: 0, right: 0, textAlign: "center", fontFamily: BIG, fontWeight: 900, fontSize: L.titSize, lineHeight: 0.78, color: OSSO, letterSpacing: "-0.01em", textShadow: "0 10px 40px rgba(0,0,0,.5)" }}>
      {R.titulo}
    </div>
    <div style={{ position: "absolute", left: L.tagX, top: L.tagY, transform: "rotate(-6deg)", background: LIMA, color: PRETO, fontFamily: ARCHIVO, fontWeight: 900, fontStyle: "italic", fontSize: L.tagSize, padding: "6px 18px 8px", letterSpacing: "0.02em", boxShadow: "0 12px 30px rgba(0,0,0,.5)" }}>
      {R.tag}
    </div>
    <div style={{ position: "absolute", left: L.cardX, top: L.cardY, transform: `rotate(5deg) scale(${L.cardSize})`, transformOrigin: "left top", background: OSSO, color: PRETO, borderRadius: 12, padding: "8px 18px 10px", textAlign: "center", boxShadow: "0 16px 30px rgba(0,0,0,.55)", border: `4px solid ${PRETO}` }}>
      <div style={{ fontFamily: ARCHIVO, fontWeight: 800, fontSize: 17, letterSpacing: "0.14em" }}>A PARTIR DAS</div>
      <div style={{ fontFamily: BIG, fontWeight: 900, fontSize: 84, lineHeight: 0.88 }}>{HORA}</div>
    </div>
  </>
  );
};

const Parafuso: React.FC<{ side: "left" | "right"; size: number }> = ({ side, size }) => (
  <div style={{ position: "absolute", top: "50%", [side]: size * 1.35, width: size, height: size, marginTop: -size / 2, borderRadius: size / 2, background: "radial-gradient(circle at 35% 35%, #fff 0 20%, #8d8f7a 60%, #3c3d33 100%)", boxShadow: "inset 0 0 0 1px rgba(0,0,0,.4)" }} />
);

// a placa de rua com o CTA: COMENTE / “LISTA”
const PlacaLista: React.FC<{ y: number; verbo: string; verboSize: number; listaSize: number }> = ({ y, verbo, verboSize, listaSize }) => (
  <div style={{ position: "absolute", left: 56, top: y, width: 968, transform: "rotate(-2deg)" }}>
    <div style={{ position: "relative", background: `linear-gradient(180deg, #d6e014 0%, ${LIMA} 40%, #b4bd00 100%)`, borderRadius: 28, padding: `${verboSize * 0.42}px 80px ${listaSize * 0.09}px`, boxShadow: "0 34px 60px rgba(0,0,0,.7), inset 0 3px 0 rgba(255,255,255,.4), inset 0 -4px 0 rgba(0,0,0,.2)", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 13, border: `7px solid ${PRETO}`, borderRadius: 18 }} />
      <Parafuso side="left" size={20} />
      <Parafuso side="right" size={20} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 22 }}>
        <div style={{ flex: 1, height: 6, background: PRETO, borderRadius: 3 }} />
        <Balao size={verboSize * 0.92} color={PRETO} stroke={2.6} />
        <div style={{ fontFamily: ARCHIVO, fontWeight: 900, fontSize: verboSize, lineHeight: 1, letterSpacing: "0.2em", marginRight: "-0.2em", color: PRETO }}>{verbo}</div>
        <div style={{ flex: 1, height: 6, background: PRETO, borderRadius: 3 }} />
      </div>
      <div style={{ fontFamily: BIG, fontWeight: 900, fontSize: listaSize, lineHeight: 0.86, color: PRETO, textAlign: "center", letterSpacing: "0.01em", whiteSpace: "nowrap", marginTop: verboSize * 0.12 }}>
        <span style={{ fontSize: "0.5em", verticalAlign: "0.62em", marginRight: "0.04em" }}>“</span>
        LISTA
        <span style={{ fontSize: "0.5em", verticalAlign: "0.62em", marginLeft: "0.04em" }}>”</span>
      </div>
      {/* brilho do esmalte */}
      <div style={{ position: "absolute", top: 0, bottom: 0, left: "66%", width: "16%", background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.4), rgba(255,255,255,0))", transform: "skewX(-20deg)" }} />
    </div>
  </div>
);

// pontilhado lima (faixa de sinalização)
const Pontilhado: React.FC<{ w: number }> = ({ w }) => (
  <div style={{ width: w, height: 8, backgroundImage: `radial-gradient(circle, ${LIMA} 2.6px, transparent 3.2px)`, backgroundSize: "15px 8px", opacity: 0.85 }} />
);

// plaquinha de regra (tipo placa de número): faixa lima com quem, valor grande, "ATÉ 00H"
const PlaquinhaRegra: React.FC<{ r: Regra; w: number; valor: number }> = ({ r, w, valor }) => (
  <div style={{ width: w, borderRadius: 20, border: `5px solid ${LIMA}`, background: "linear-gradient(180deg, #151510 0%, #0d0d0a 100%)", overflow: "hidden", boxShadow: "0 22px 40px rgba(0,0,0,.6)" }}>
    <div style={{ background: LIMA, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "9px 0 10px" }}>
      <Sexo s={r.sexo} size={34} color={PRETO} />
      <span style={{ fontFamily: ARCHIVO, fontWeight: 900, fontSize: 31, letterSpacing: "0.16em", marginRight: "-0.16em", color: PRETO }}>{r.quem}</span>
    </div>
    <div style={{ textAlign: "center", padding: "12px 0 16px" }}>
      <div style={{ fontFamily: BIG, fontWeight: 900, fontSize: valor, lineHeight: 0.9, color: LIMA, textShadow: "0 0 28px rgba(200,210,0,.25)" }}>{r.valor}</div>
      <div style={{ fontFamily: ARCHIVO, fontWeight: 800, fontSize: 30, letterSpacing: "0.14em", marginRight: "-0.14em", color: OSSO, marginTop: 6 }}>ATÉ {r.ate}</div>
    </div>
  </div>
);

const RegrasA: React.FC<{ L: LA }> = ({ L }) => (
  <div style={{ position: "absolute", top: L.regrasY, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 20 }}>
      <Pontilhado w={170} />
      <span style={{ fontFamily: ARCHIVO, fontWeight: 800, fontSize: 26, letterSpacing: "0.3em", marginRight: "-0.3em", color: LIMA }}>VALORES DA LISTA</span>
      <Pontilhado w={170} />
    </div>
    <div style={{ display: "flex", gap: 28 }}>
      {REGRAS.map((r, i) => (
        <PlaquinhaRegra key={i} r={r} w={L.regraW} valor={L.regraValor} />
      ))}
    </div>
  </div>
);

// faixa lima inclinada com o slogan (texto inteiro dentro da largura; bolinhas completam as bordas)
const FaixaSlogan: React.FC<{ y: number; h: number; size: number }> = ({ y, h, size }) => (
  <div style={{ position: "absolute", left: -60, right: -60, top: y, height: h, background: LIMA, transform: "rotate(-2deg)", display: "flex", alignItems: "center", justifyContent: "center", gap: 26, boxShadow: "0 16px 34px rgba(0,0,0,.55)" }}>
    <div style={{ flex: 1, height: 12, backgroundImage: `radial-gradient(circle, ${PRETO} 4px, transparent 4.8px)`, backgroundSize: "24px 12px", backgroundPosition: "right center" }} />
    <span style={{ fontFamily: BIG, fontWeight: 900, fontSize: size, color: PRETO, letterSpacing: "0.06em", whiteSpace: "nowrap" }}>TE VEJO NA ESQUINA</span>
    <div style={{ flex: 1, height: 12, backgroundImage: `radial-gradient(circle, ${PRETO} 4px, transparent 4.8px)`, backgroundSize: "24px 12px", backgroundPosition: "left center" }} />
  </div>
);

export const ListaSextaA: React.FC<{ fmt: FmtLista; dia?: DiaLista }> = ({ fmt, dia = "sexta" }) => {
  const L = LAYOUT_A[fmt];
  const H = fmt === "feed" ? 1350 : 1920;
  const cta = CTA[fmt];
  return (
    <Rot.Provider value={ROTULOS[dia]}>
    <AbsoluteFill style={{ overflow: "hidden", background: PRETO }}>
      <FundoA cx={L.ringCx} cy={L.ringCy} />
      <RingPx width={1080} height={H} look="lima" flat cx={L.ringCx} cy={L.ringCy} ringH={L.ringH} rotY={0.24} rotX={-0.03} envIntensity={0.9} />
      <Logo width={L.logoW} top={L.logoTop} />
      <TituloA L={L} />
      <PlacaLista y={L.placaY} verbo={cta.verbo} verboSize={L.verboSize} listaSize={L.listaSize} />
      <div style={{ position: "absolute", top: L.directY, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 14 }}>
        <span style={{ fontFamily: ARCHIVO, fontWeight: 800, fontSize: L.directSize, letterSpacing: "0.06em", color: OSSO }}>{cta.direct.replace(/DIRECT$/, "")}</span>
        <span style={{ fontFamily: ARCHIVO, fontWeight: 900, fontSize: L.directSize, letterSpacing: "0.06em", color: PRETO, background: LIMA, padding: "2px 12px 3px", borderRadius: 6, display: "flex", alignItems: "center", gap: 8 }}>
          DIRECT <Aviaozinho size={L.directSize * 0.95} color={PRETO} stroke={2.4} />
        </span>
      </div>
      <RegrasA L={L} />
      <div style={{ position: "absolute", top: L.obsY, left: 60, right: 60, textAlign: "center", fontFamily: ARCHIVO, fontWeight: 600, fontSize: L.obsSize, color: OSSO, opacity: 0.85, letterSpacing: "0.02em" }}>{REGRA.obs}</div>
      <FaixaSlogan y={L.faixaY} h={L.faixaH} size={L.faixaSize} />
      {L.dica !== undefined && (
        <div style={{ position: "absolute", top: L.dica, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <span style={{ fontFamily: ARCHIVO, fontWeight: 800, fontSize: 26, letterSpacing: "0.26em", marginRight: "-0.26em", color: LIMA }}>RESPONDA AQUI EMBAIXO</span>
          <svg width={60} height={30} viewBox="0 0 60 30">
            <path d="M8 6 30 24 52 6" fill="none" stroke={LIMA} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
      <Grain opacity={0.14} />
      <Vignette strength={0.45} />
    </AbsoluteFill>
    </Rot.Provider>
  );
};

// =====================================================================
// ARTE B — "Painel de Embarque" (vídeo 8s): LISTA se forma no split-flap,
// o check-in é comentar/responder LISTA e o cartão de embarque (link) chega no direct
// =====================================================================
const AMARELO = "#FFD23F";
const PAINEL = "#121314";
const TEXTO = "#F3F0E6";
const CINZA = "#8E9296";
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const easeIO = Easing.inOut(Easing.cubic);

// metade de uma plaqueta (cima ou baixo), com o caractere cortado ao meio
const Meia: React.FC<{ ch: string; w: number; h: number; cima: boolean; color: string; r: number; style?: React.CSSProperties; sombra?: number }> = ({ ch, w, h, cima, color, r, style, sombra = 0 }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      top: cima ? 0 : h / 2,
      width: w,
      height: h / 2,
      overflow: "hidden",
      borderRadius: cima ? `${r}px ${r}px 0 0` : `0 0 ${r}px ${r}px`,
      background: cima ? "linear-gradient(180deg, #2b2e31 0%, #202225 100%)" : "linear-gradient(180deg, #17191b 0%, #1e2022 100%)",
      backfaceVisibility: "hidden",
      ...style,
    }}
  >
    <div style={{ position: "absolute", left: 0, top: cima ? 0 : -h / 2, width: w, height: h, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: BARLOW, fontWeight: 800, fontSize: h * 0.8, lineHeight: 1, color, paddingTop: h * 0.02 }}>
      {ch === " " ? "" : ch}
    </div>
    {sombra > 0 && <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${sombra})` }} />}
  </div>
);

// plaqueta split-flap de verdade: a folha de cima tomba e revela o próximo caractere
const Flap: React.FC<{ c: string; start: number; seed: number; w: number; h: number; color?: string; voltas?: number; dur?: number; glow?: string; refaz?: number }> = ({
  c, start, seed, w, h, color = TEXTO, voltas = 6, dur = 2, glow, refaz,
}) => {
  const frame = useCurrentFrame();
  const r = Math.max(4, w * 0.07);
  // sequência: branco → letras aleatórias → caractere final (segunda rodada opcional no fim do vídeo)
  let seq: string[];
  let t: number;
  if (refaz !== undefined && frame >= refaz) {
    const n2 = 3 + Math.floor(rnd(seed + 77) * 4);
    seq = [c, ...Array.from({ length: n2 }, (_, k) => CHARS[Math.floor(rnd(seed * 53 + k) * CHARS.length)]), c];
    t = frame - refaz;
  } else {
    const n = voltas + Math.floor(rnd(seed) * 5);
    seq = [" ", ...Array.from({ length: n }, (_, k) => CHARS[Math.floor(rnd(seed * 31 + k) * CHARS.length)]), c];
    t = frame - start;
  }
  let a = t < 0 ? seq[0] : c;
  let b = a;
  let p = 0;
  let girando = false;
  if (t >= 0) {
    const i = Math.floor(t / dur);
    if (i < seq.length - 1) {
      a = seq[i];
      b = seq[i + 1];
      p = (t % dur) / dur;
      girando = true;
    }
  }
  const eixo = Math.max(2, h * 0.014);
  return (
    <div style={{ position: "relative", width: w, height: h, flex: "0 0 auto", perspective: h * 5, borderRadius: r, boxShadow: "0 3px 7px rgba(0,0,0,.65), inset 0 0 0 1px rgba(255,255,255,.04)", textShadow: glow ? `0 0 ${h * 0.1}px ${glow}` : undefined }}>
      <Meia ch={b} w={w} h={h} cima color={color} r={r} />
      <Meia ch={a} w={w} h={h} cima={false} color={color} r={r} />
      {girando &&
        (p < 0.5 ? (
          <Meia ch={a} w={w} h={h} cima color={color} r={r} sombra={p * 0.9} style={{ transformOrigin: "50% 100%", transform: `rotateX(${-p * 180}deg)` }} />
        ) : (
          <Meia ch={b} w={w} h={h} cima={false} color={color} r={r} sombra={(1 - p) * 0.9} style={{ transformOrigin: "50% 0%", transform: `rotateX(${(1 - p) * 180}deg)` }} />
        ))}
      <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: eixo, marginTop: -eixo / 2, background: "rgba(0,0,0,.85)" }} />
      <div style={{ position: "absolute", left: -1, top: "50%", width: w * 0.05, height: h * 0.08, marginTop: -h * 0.04, background: "#3a3d40", borderRadius: 2 }} />
      <div style={{ position: "absolute", right: -1, top: "50%", width: w * 0.05, height: h * 0.08, marginTop: -h * 0.04, background: "#3a3d40", borderRadius: 2 }} />
    </div>
  );
};

const Flaps: React.FC<{ text: string; start: number; w: number; h: number; gap?: number; color?: string; seed?: number; passo?: number; dur?: number; voltas?: number; glow?: string; refaz?: number; vazio?: boolean }> = ({
  text, start, w, h, gap = 4, color, seed = 1, passo = 2, dur, voltas, glow, refaz, vazio,
}) => (
  <div style={{ display: "flex", gap }}>
    {text.split("").map((c, i) =>
      c === " " && !vazio ? (
        <div key={i} style={{ width: w * 0.4 }} />
      ) : (
        <Flap key={i} c={c} start={start + i * passo} seed={seed * 100 + i} w={w} h={h} color={color} dur={dur} voltas={voltas} glow={glow} refaz={refaz !== undefined ? refaz + i * 3 : undefined} />
      ),
    )}
  </div>
);

// plaqueta de ícone: gira entre bebidas e notas (serviço de bordo)
const BORDO: Icone[] = ["garrafa", "nota", "caipirinha", "notas", "violao", "chope", "chapeu", "drink"];
const FlapIcone: React.FC<{ start: number; size: number; periodo?: number; seed: number }> = ({ start, size, periodo = 44, seed }) => {
  const icones = BORDO;
  const frame = useCurrentFrame();
  const t = Math.max(0, frame - start);
  const fase = (t + seed * 11) % periodo;
  // base 2 por plaqueta em 8 ícones: plaquetas vizinhas nunca mostram o mesmo ícone
  const idx = (seed * 2 + Math.floor((t + seed * 11) / periodo)) % icones.length;
  const girando = frame >= start && fase < 3;
  const entra = interpolate(frame, [start, start + 8], [0, 1], clamp);
  return (
    <div style={{ position: "relative", width: size, height: size, borderRadius: 6, background: "linear-gradient(180deg, #2b2e31 0%, #202225 49%, #17191b 51%, #1e2022 100%)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", boxShadow: "0 3px 6px rgba(0,0,0,.6)" }}>
      <div style={{ transform: `scaleY(${girando ? 0.55 : entra})` }}>
        <Ico i={icones[idx]} size={size * 0.66} color={AMARELO} stroke={1.7} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 2, marginTop: -1, background: "rgba(0,0,0,.8)" }} />
    </div>
  );
};

const Rotulo: React.FC<{ t: string; size: number; color?: string; style?: React.CSSProperties }> = ({ t, size, color = CINZA, style }) => (
  <div style={{ fontFamily: BARLOW, fontWeight: 700, fontSize: size, letterSpacing: "0.22em", color, marginBottom: size * 0.35, whiteSpace: "nowrap", ...style }}>{t}</div>
);

// relógio do terminal: vira 23:00 quando a LISTA termina de se formar
const Relogio: React.FC<{ right: number; top: number; size: number; vira: number }> = ({ right, top, size, vira }) => {
  const frame = useCurrentFrame();
  const h = parseInt(HORA, 10);
  const antes = frame < vira;
  const txt = `${String(antes ? h - 1 : h).padStart(2, "0")}:${antes ? "59" : "00"}`;
  const pisca = Math.floor(frame / 15) % 2 === 0;
  const pulso = interpolate(frame, [vira, vira + 4, vira + 16], [1, 1.18, 1], clamp);
  return (
    <div style={{ position: "absolute", right, top, fontFamily: BARLOW, fontWeight: 800, fontSize: size, color: AMARELO, letterSpacing: "0.04em", textShadow: "0 0 18px rgba(255,210,63,.55)", transform: `scale(${pulso})`, transformOrigin: "right center" }}>
      {txt.slice(0, 2)}
      <span style={{ opacity: pisca ? 1 : 0.2 }}>:</span>
      {txt.slice(3)}
    </div>
  );
};

// selo "SEXTA DO BUTICA" no canto (mesma pegada do selo de estilo da identidade B)
const SeloNoite: React.FC<{ x: number; y: number; size: number; delay: number }> = ({ x, y, size, delay }) => {
  const s = useSpr(delay, { damping: 12 });
  const R = useContext(Rot);
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translateY(${(1 - s) * -80}px)`, opacity: Math.min(1, s * 3), display: "flex", alignItems: "center", gap: 10, background: AMARELO, color: PAINEL, borderRadius: 6, padding: "7px 16px 8px 10px", boxShadow: "0 8px 20px rgba(0,0,0,.5)" }}>
      <Ico i="notas" size={size * 1.25} color={PAINEL} stroke={2.2} />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontFamily: BARLOW, fontWeight: 900, fontSize: size * 1.25, lineHeight: 1, letterSpacing: "0.08em" }}>{R.titulo}</span>
        <span style={{ fontFamily: ARCHIVO, fontWeight: 800, fontSize: size * 0.6, lineHeight: 1.15, opacity: 0.8, marginTop: 2, letterSpacing: "0.06em" }}>{R.tag}</span>
      </div>
    </div>
  );
};

const Terminal: React.FC = () => (
  <>
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #16181a 0%, #0c0d0e 100%)" }} />
    <AbsoluteFill style={{ backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,.025) 0 2px, transparent 2px 120px)" }} />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 26%, rgba(200,210,0,.20) 0%, rgba(200,210,0,0) 55%)" }} />
  </>
);

// bebidas e notas flutuando no saguão (atrás dos painéis)
const AMBIENTE: Icone[] = ["chope", "nota", "caipirinha", "notas", "drink", "garrafa"];
const Ambiente: React.FC<{ W: number; H: number }> = ({ W, H }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: 18 }, (_, i) => {
        const size = 46 + rnd(i * 7 + 3) * 50;
        const vel = 0.7 + rnd(i * 7 + 4) * 0.9;
        const ciclo = H + 240;
        const y = ((((rnd(i * 7 + 2) * ciclo - frame * vel) % ciclo) + ciclo) % ciclo) - 120;
        const x = rnd(i * 7 + 1) * (W - 60) + Math.sin(frame / 34 + i) * 18;
        const op = interpolate(frame, [i * 3, i * 3 + 20], [0, 0.16 + rnd(i * 7 + 5) * 0.16], clamp);
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, opacity: op, transform: `rotate(${Math.sin(frame / 50 + i * 2) * 16}deg)` }}>
            <Ico i={AMBIENTE[i % AMBIENTE.length]} size={size} color={i % 3 === 0 ? LIMA : AMARELO} stroke={1.5} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

type LB = {
  W: number; H: number;
  topo: number; logoW: number; seloSize: number; relSize: number;
  px: number; py: number; pw: number;
  cab: number; // tamanho do cabeçalho "PARTIDAS"
  rot: number; // rótulos
  verboW: number; verboH: number;
  icoSize: number;
  listaW: number; listaH: number; listaGap: number;
  regW: number; regH: number; regGap: number;
  // blocos abaixo do painel
  ckY: number; ckH: number;
  avY: number; avH: number;
  biY: number; biH: number; biSize: number;
  ledY: number; ledH: number; ledSize: number;
};

const LAYOUT_B: Record<FmtLista, LB> = {
  feed: {
    W: 1080, H: 1350,
    topo: 26, logoW: 200, seloSize: 22, relSize: 50,
    px: 40, py: 112, pw: 1000,
    cab: 42, rot: 19,
    verboW: 60, verboH: 84, icoSize: 60,
    listaW: 170, listaH: 222, listaGap: 10,
    regW: 40, regH: 56, regGap: 26,
    ckY: 794, ckH: 92,
    avY: 912, avH: 104,
    biY: 1046, biH: 130, biSize: 40,
    ledY: 1208, ledH: 64, ledSize: 40,
  },
  story: {
    W: 1080, H: 1920,
    topo: 200, logoW: 240, seloSize: 26, relSize: 58,
    px: 40, py: 318, pw: 1000,
    cab: 50, rot: 22,
    verboW: 66, verboH: 92, icoSize: 64,
    listaW: 180, listaH: 262, listaGap: 9,
    regW: 46, regH: 66, regGap: 30,
    ckY: 1556, ckH: 100,
    avY: 1262, avH: 120,
    biY: 1070, biH: 150, biSize: 46,
    ledY: 1420, ledH: 70, ledSize: 44,
  },
};

// quadros-chave da animação B (entradas terminam por volta do 120)
const T = {
  painel: 4,
  verbo: 12,
  lista: 20,
  regras: 40,
  bilhete: 34,
  checkin: 44,
  digita: 60, // L-I-S-T-A a cada 4 quadros
  envia: 84,
  voo: [86, 110] as const,
  aviso: 106,
  refaz: 196, // LISTA gira de novo no fim (depois do quadro estático 180)
};

const Painel: React.FC<{ L: LB; verbo: string }> = ({ L, verbo }) => {
  const frame = useCurrentFrame();
  const NOITE = useContext(Rot).noite;
  const s = useSpr(T.painel, { damping: 17, stiffness: 90 });
  const inner = L.pw - 52;
  // quando o LISTA é enviado, o painel "confirma": pulso de luz nas plaquetas
  const conf = interpolate(frame, [T.voo[1], T.voo[1] + 6, T.voo[1] + 30], [0, 1, 0], clamp);
  const regrasTxt = REGRAS.map((r) => ({ quem: r.quem.padEnd(9, " ").slice(0, 9), valor: r.valor.padEnd(5, " ").slice(0, 5), ate: r.ate }));
  return (
    <div style={{ position: "absolute", left: L.px, top: L.py, width: L.pw, perspective: 2400 }}>
      <div style={{ transform: `rotateX(${(1 - s) * 38}deg) translateY(${(1 - s) * 70}px)`, transformOrigin: "50% 0%", opacity: Math.min(1, s * 1.6), background: PAINEL, borderRadius: 16, padding: "20px 26px 22px", boxShadow: `0 30px 60px rgba(0,0,0,.65), inset 0 0 0 2px #26292c, 0 0 ${60 * conf}px rgba(255,210,63,${0.35 * conf})` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #26292c", paddingBottom: 10, marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Aviaozinho size={L.cab * 0.85} color={AMARELO} fill={AMARELO} />
            <div style={{ fontFamily: BARLOW, fontWeight: 900, fontSize: L.cab, letterSpacing: "0.14em", color: AMARELO, lineHeight: 1 }}>PARTIDAS</div>
          </div>
          <div style={{ fontFamily: BARLOW, fontWeight: 700, fontSize: L.cab * 0.56, letterSpacing: "0.2em", color: CINZA }}>{NOITE} ● DEPARTURES</div>
        </div>
        {/* PARA EMBARCAR: COMENTE + serviço de bordo */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <Rotulo t="PARA EMBARCAR" size={L.rot} />
            <Flaps text={verbo} start={T.verbo} w={L.verboW} h={L.verboH} gap={5} seed={3} />
          </div>
          <div>
            <Rotulo t="SERVIÇO DE BORDO" size={L.rot} style={{ textAlign: "right" }} />
            <div style={{ display: "flex", gap: 6 }}>
              {[0, 1, 2, 3].map((i) => (
                <FlapIcone key={i} start={T.regras + 10 + i * 3} size={L.icoSize} seed={i} />
              ))}
            </div>
          </div>
        </div>
        {/* a heroína: LISTA */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: 14, width: inner }}>
          <Flaps text="LISTA" start={T.lista} w={L.listaW} h={L.listaH} gap={L.listaGap} color={AMARELO} seed={7} passo={4} dur={3} voltas={7} glow={`rgba(255,210,63,${0.45 + conf * 0.5})`} refaz={T.refaz} />
        </div>
        {/* tabela de tarifas da lista */}
        <div style={{ marginTop: 20 }}>
          <div style={{ display: "flex", gap: L.regGap }}>
            <Rotulo t="PASSAGEIRO" size={L.rot} style={{ width: 9 * L.regW + 8 * 3 }} />
            <Rotulo t="NA LISTA" size={L.rot} style={{ width: 5 * L.regW + 4 * 3 }} />
            <Rotulo t="ATÉ" size={L.rot} />
          </div>
          {regrasTxt.map((r, i) => (
            <div key={i} style={{ display: "flex", gap: L.regGap, alignItems: "center", marginTop: i ? 8 : 0 }}>
              <Flaps text={r.quem} start={T.regras + i * 8} w={L.regW} h={L.regH} gap={3} seed={20 + i} vazio />
              <Flaps text={r.valor} start={T.regras + 10 + i * 8} w={L.regW} h={L.regH} gap={3} seed={30 + i} color={LIMA} vazio />
              <Flaps text={r.ate} start={T.regras + 18 + i * 8} w={L.regW} h={L.regH} gap={3} seed={40 + i} color={AMARELO} vazio />
              <Lampada start={T.regras + 30 + i * 8} size={L.regH * 0.36} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Lampada: React.FC<{ start: number; size: number }> = ({ start, size }) => {
  const frame = useCurrentFrame();
  const on = frame >= start && Math.floor((frame - start) / 12) % 2 === 0;
  return <div style={{ width: size, height: size, borderRadius: "50%", background: on ? LIMA : "#3a3f22", boxShadow: on ? `0 0 16px ${LIMA}` : "none", marginLeft: 4 }} />;
};

// "check-in": o campo de comentário (feed) ou de resposta do story, com LISTA sendo digitado
const CheckIn: React.FC<{ L: LB; fmt: FmtLista }> = ({ L, fmt }) => {
  const frame = useCurrentFrame();
  const s = useSpr(T.checkin, { damping: 15 });
  const n = Math.max(0, Math.min(5, Math.floor((frame - T.digita) / 4) + 1));
  const typed = "LISTA".slice(0, n);
  const caret = Math.floor(frame / 8) % 2 === 0;
  const aperta = interpolate(frame, [T.envia - 2, T.envia, T.envia + 5], [1, 0.82, 1], clamp);
  const enviado = frame >= T.envia;
  const h = L.ckH;
  const story = fmt === "story";
  // o aviãozinho do botão sai voando (volta apagado depois)
  const planeOp = frame < T.voo[0] ? 1 : interpolate(frame, [T.voo[1] + 6, T.voo[1] + 20], [0, 0.5], clamp);
  return (
    <div style={{ position: "absolute", left: L.px, top: L.ckY - L.rot * 1.8, width: L.pw, opacity: Math.min(1, s * 2), transform: `translateY(${(1 - s) * 60}px)` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <Rotulo t={story ? "CHECK-IN: RESPONDA ESTE STORY" : "CHECK-IN: COMENTE NESTE POST"} size={L.rot} color={AMARELO} style={{ marginBottom: 0 }} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        {!story && (
          <div style={{ width: h * 0.78, height: h * 0.78, borderRadius: "50%", background: `linear-gradient(135deg, ${AMARELO}, ${LIMA})`, padding: 4, flex: "0 0 auto" }}>
            <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#2a2d30", display: "flex", alignItems: "flex-end", justifyContent: "center", overflow: "hidden" }}>
              <div style={{ width: "46%", height: "46%", borderRadius: "50% 50% 0 0", background: "#6b7075" }} />
            </div>
          </div>
        )}
        <div style={{ flex: 1, height: h, borderRadius: h / 2, border: `3px solid ${story ? "rgba(243,240,230,.85)" : "#44484c"}`, background: story ? "rgba(0,0,0,.35)" : "#16181a", display: "flex", alignItems: "center", padding: `0 ${h * 0.34}px 0 ${h * 0.4}px`, gap: 16, boxShadow: `0 0 ${enviado ? 0 : 30 * s}px rgba(255,210,63,.18)` }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
            {n === 0 ? (
              <span style={{ fontFamily: ARCHIVO, fontWeight: 500, fontSize: h * 0.34, color: CINZA }}>{story ? "Enviar mensagem..." : "Adicione um comentário..."}</span>
            ) : (
              <span style={{ fontFamily: ARCHIVO, fontWeight: 900, fontSize: h * 0.5, color: TEXTO, letterSpacing: "0.06em" }}>{typed}</span>
            )}
            <div style={{ width: 4, height: h * 0.5, background: AMARELO, marginLeft: 6, opacity: caret && !enviado ? 1 : 0 }} />
          </div>
          {story ? (
            <>
              <Coracao size={h * 0.46} color={TEXTO} />
              <div style={{ transform: `scale(${aperta})`, opacity: planeOp }}>
                <Aviaozinho size={h * 0.46} color={n === 5 ? AMARELO : TEXTO} fill={n === 5 ? AMARELO : "none"} />
              </div>
            </>
          ) : (
            <div style={{ transform: `scale(${aperta})`, display: "flex", alignItems: "center", gap: 10, background: n === 5 ? AMARELO : "#2a2d30", color: n === 5 ? PAINEL : CINZA, borderRadius: h / 2, padding: `${h * 0.14}px ${h * 0.26}px`, fontFamily: BARLOW, fontWeight: 800, fontSize: h * 0.32, letterSpacing: "0.12em" }}>
              PUBLICAR
              <div style={{ opacity: planeOp }}>
                <Aviaozinho size={h * 0.3} color={n === 5 ? PAINEL : CINZA} fill={n === 5 ? PAINEL : "none"} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// aviso de mensagem no direct: o "cartão de embarque" (link da lista) chegou
const AvisoDirect: React.FC<{ L: LB }> = ({ L }) => {
  const s = useSpr(T.aviso, { damping: 11, stiffness: 140 });
  const h = L.avH;
  return (
    <div style={{ position: "absolute", left: L.px, top: L.avY, width: L.pw, height: h, transform: `translateX(${(1 - s) * 140}px) scale(${0.7 + s * 0.3})`, opacity: Math.min(1, s * 2.5), transformOrigin: "10% 50%", background: TEXTO, borderRadius: h * 0.24, display: "flex", alignItems: "center", gap: h * 0.2, padding: `0 ${h * 0.3}px 0 ${h * 0.16}px`, boxShadow: "0 24px 50px rgba(0,0,0,.6)" }}>
      <div style={{ width: h * 0.74, height: h * 0.74, borderRadius: "50%", background: PAINEL, display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto", boxShadow: `0 0 0 4px ${AMARELO}` }}>
        <Img src={staticFile("logos/o-simbolo.png")} style={{ width: h * 0.44 }} />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <span style={{ fontFamily: ARCHIVO, fontWeight: 900, fontSize: h * 0.25, color: PAINEL }}>O BUTIQUIM</span>
          <span style={{ fontFamily: ARCHIVO, fontWeight: 600, fontSize: h * 0.2, color: "#6b6f73" }}>agora · direct</span>
        </div>
        <div style={{ fontFamily: ARCHIVO, fontWeight: 800, fontSize: h * 0.27, color: PAINEL, lineHeight: 1.1 }}>
          Seu link da lista chegou! <span style={{ color: "#7d8700" }}>Boa viagem.</span>
        </div>
      </div>
      <div style={{ width: h * 0.56, height: h * 0.56, borderRadius: "50%", background: AMARELO, display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto" }}>
        <Aviaozinho size={h * 0.3} color={PAINEL} fill={PAINEL} />
      </div>
    </div>
  );
};

// o aviãozinho do direct voando do botão de enviar até o aviso, com rastro pontilhado
type Pt = [number, number];
const bez = (p: Pt[], t: number): Pt => {
  const u = 1 - t;
  const a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
  return [a * p[0][0] + b * p[1][0] + c * p[2][0] + d * p[3][0], a * p[0][1] + b * p[1][1] + c * p[2][1] + d * p[3][1]];
};

const Voo: React.FC<{ pts: Pt[]; size: number }> = ({ pts, size }) => {
  const frame = useCurrentFrame();
  const [ini, fim] = T.voo;
  if (frame < ini || frame > fim + 14) return null;
  const t = interpolate(frame, [ini, fim], [0, 1], { ...clamp, easing: easeIO });
  const pos = bez(pts, t);
  const adiante = bez(pts, Math.min(1, t + 0.02));
  const atras = bez(pts, Math.max(0, t - 0.02));
  const ang = (Math.atan2(adiante[1] - atras[1], adiante[0] - atras[0]) * 180) / Math.PI;
  const somePlane = interpolate(frame, [fim - 2, fim + 2], [1, 0], clamp);
  const someRastro = interpolate(frame, [fim, fim + 14], [1, 0], clamp);
  const escala = 1 + Math.sin(t * Math.PI) * 0.7;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: 22 }, (_, k) => {
        const tk = t - (k + 1) * 0.022;
        if (tk < 0) return null;
        const q = bez(pts, tk);
        const r = Math.max(2, 7 - k * 0.22);
        return <div key={k} style={{ position: "absolute", left: q[0] - r, top: q[1] - r, width: r * 2, height: r * 2, borderRadius: "50%", background: AMARELO, opacity: (1 - k / 22) * 0.9 * someRastro, boxShadow: "0 0 8px rgba(255,210,63,.6)" }} />;
      })}
      <div style={{ position: "absolute", left: pos[0] - size / 2, top: pos[1] - size / 2, transform: `rotate(${ang + 45}deg) scale(${escala})`, opacity: somePlane, filter: "drop-shadow(0 0 12px rgba(255,210,63,.8))" }}>
        <Aviaozinho size={size} color={AMARELO} fill={AMARELO} />
      </div>
    </AbsoluteFill>
  );
};

// quando o link chega: bebidas e notas estouram do aviso
const Estouro: React.FC<{ cx: number; cy: number; raio: number }> = ({ cx, cy, raio }) => {
  const frame = useCurrentFrame();
  const t0 = T.voo[1];
  if (frame < t0 || frame > t0 + 40) return null;
  const icones: Icone[] = ["chope", "nota", "caipirinha", "notas", "drink", "garrafa"];
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: 12 }, (_, i) => {
        const ang = (i / 12) * Math.PI * 2 + rnd(i + 5) * 0.4;
        const dist = interpolate(frame - t0, [0, 34], [0, raio * (0.75 + rnd(i + 9) * 0.6)], { ...clamp, easing: Easing.out(Easing.cubic) });
        const op = interpolate(frame - t0, [0, 4, 20, 38], [0, 1, 1, 0], clamp);
        const size = 40 + rnd(i + 2) * 26;
        const x = cx + Math.cos(ang) * dist * 1.6;
        const y = cy + Math.sin(ang) * dist;
        return (
          <div key={i} style={{ position: "absolute", left: x - size / 2, top: y - size / 2, opacity: op, transform: `rotate(${(rnd(i) - 0.5) * 80 + (frame - t0) * (i % 2 ? 3 : -3)}deg)` }}>
            <Ico i={icones[i % icones.length]} size={size} color={i % 3 === 0 ? LIMA : AMARELO} stroke={1.9} glow="rgba(255,210,63,.5)" />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// cartão de embarque: horário, observação e o slogan no canhoto
const Bilhete: React.FC<{ L: LB }> = ({ L }) => {
  const s = useSpr(T.bilhete, { damping: 16 });
  const NOITE = useContext(Rot).noite;
  const size = L.biSize;
  return (
    <div style={{ position: "absolute", left: L.px, top: L.biY, width: L.pw, height: L.biH, transform: `translateY(${(1 - s) * 80}px)`, opacity: s, display: "flex", borderRadius: 14, overflow: "hidden", boxShadow: "0 16px 30px rgba(0,0,0,.5)" }}>
      <div style={{ flex: 1, background: TEXTO, color: PAINEL, padding: "0 26px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontFamily: BARLOW, fontWeight: 700, fontSize: size * 0.42, letterSpacing: "0.22em", color: "#6b6f73" }}>EMBARQUE ● {NOITE}</div>
        <div style={{ fontFamily: BARLOW, fontWeight: 900, fontSize: size, lineHeight: 1.02, letterSpacing: "0.03em" }}>
          A PARTIR DAS <span style={{ color: "#7d8700" }}>{HORA}</span>
        </div>
        <div style={{ fontFamily: ARCHIVO, fontWeight: 600, fontSize: size * 0.5, opacity: 0.8, marginTop: 4 }}>{REGRA.obs}</div>
      </div>
      <div style={{ width: 0, borderLeft: `4px dashed ${PAINEL}`, opacity: 0.35 }} />
      <div style={{ width: L.pw * 0.25, background: LIMA, color: PAINEL, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 6 }}>
        <div style={{ fontFamily: BARLOW, fontWeight: 900, fontSize: size * 0.62, letterSpacing: "0.06em", lineHeight: 1, textAlign: "center" }}>
          TE VEJO NA
          <br />
          ESQUINA
        </div>
        <div style={{ display: "flex", gap: 2, height: size * 0.5, alignItems: "stretch" }}>
          {Array.from({ length: 26 }, (_, i) => (
            <div key={i} style={{ width: 1 + Math.floor(rnd(i + 40) * 3.5), background: PAINEL }} />
          ))}
        </div>
      </div>
    </div>
  );
};

// letreiro de LED correndo
const LetreiroLED: React.FC<{ y: number; h: number; size: number; cta: string }> = ({ y, h, size, cta }) => {
  const frame = useCurrentFrame();
  const NOITE = useContext(Rot).noite;
  const o = interpolate(frame, [20, 34], [0, 1], clamp);
  const texto = `${NOITE}  ●  ${cta} “LISTA”  ●  RECEBA O LINK NO DIRECT  ●  A PARTIR DAS ${HORA}  ●  TE VEJO NA ESQUINA  ●  `;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, height: h, background: "#080909", borderTop: "2px solid #26292c", borderBottom: "2px solid #26292c", overflow: "hidden", display: "flex", alignItems: "center", opacity: o }}>
      <div style={{ whiteSpace: "nowrap", fontFamily: BARLOW, fontWeight: 800, fontSize: size, letterSpacing: "0.12em", color: AMARELO, textShadow: "0 0 10px rgba(255,210,63,.7)", transform: `translateX(${-((frame * 3.2) % 3000)}px)` }}>
        {texto.repeat(4)}
      </div>
      <AbsoluteFill style={{ backgroundImage: "radial-gradient(circle, rgba(8,9,9,0) 1.8px, rgba(8,9,9,.6) 2.6px)", backgroundSize: "6px 6px" }} />
    </div>
  );
};

export const ListaSextaB: React.FC<{ fmt: FmtLista; dia?: DiaLista }> = ({ fmt, dia = "sexta" }) => {
  const L = LAYOUT_B[fmt];
  const frame = useCurrentFrame();
  const story = fmt === "story";
  const cta = CTA[fmt];
  const push = interpolate(frame, [0, LISTA_B_DUR], [1, 1.025], clamp);
  const fundo = interpolate(frame, [0, 10], [0, 1], clamp);
  // ponto de partida do avião (botão de enviar) e de chegada (bolinha do aviso)
  const ckMid = L.ckY + L.ckH / 2;
  const origem: Pt = story ? [L.px + L.pw - L.ckH * 0.34 - L.ckH * 0.23, ckMid] : [L.px + L.pw - L.ckH * 0.5, ckMid];
  const destino: Pt = [L.px + L.avH * 0.16 + L.avH * 0.37, L.avY + L.avH / 2];
  const pts: Pt[] = story
    ? [origem, [origem[0] + 30, origem[1] - 380], [destino[0] + 620, destino[1] - 520], destino]
    : [origem, [origem[0] + 40, origem[1] - 200], [destino[0] + 180, destino[1] - 340], destino];
  return (
    <Rot.Provider value={ROTULOS[dia]}>
    <AbsoluteFill style={{ overflow: "hidden", background: "#0c0d0e" }}>
      <AbsoluteFill style={{ opacity: fundo }}>
        <Terminal />
        <Ambiente W={L.W} H={L.H} />
      </AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "50% 35%" }}>
        <Logo width={L.logoW} top={L.topo + (story ? 14 : 8)} opacity={fundo} />
        <SeloNoite x={story ? 46 : 28} y={L.topo} size={L.seloSize} delay={10} />
        <Relogio right={story ? 50 : 34} top={L.topo - 4} size={L.relSize} vira={T.lista + 44} />
        <Painel L={L} verbo={cta.verbo} />
        <Bilhete L={L} />
        <LetreiroLED y={L.ledY} h={L.ledH} size={L.ledSize} cta={cta.verbo} />
        <Estouro cx={destino[0] + 40} cy={destino[1]} raio={story ? 230 : 170} />
        <AvisoDirect L={L} />
        <CheckIn L={L} fmt={fmt} />
        <Voo pts={pts} size={story ? 74 : 64} />
      </AbsoluteFill>
      <Grain opacity={0.1} />
      <Vignette strength={0.42} />
    </AbsoluteFill>
    </Rot.Provider>
  );
};
