import React from "react";
import { AbsoluteFill, Img, continueRender, delayRender, staticFile } from "remotion";
import { loadFont as bigShoulders } from "@remotion/google-fonts/BigShoulders";
import { loadFont as plexMono } from "@remotion/google-fonts/IBMPlexMono";
import { loadFont as archivo } from "@remotion/google-fonts/Archivo";
import { fitText } from "@remotion/layout-utils";
import { Grain } from "../shared/fx";

// Campanha "APROVADO! A 1ª é nossa." (calouros 2027).
// Identidade própria: o EDITAL / LISTA DE APROVADOS. Papel branco de resultado impresso,
// tipografia de lista (mono), título condensado gigante, carimbo VERMELHO de "APROVADO!"
// e marca-texto limão grifando a linha "VOCÊ". Papel picado (furos de fichário) = festa.
// Nada de caderneta, caneta azul ou magenta (isso é da "A Casa Te Deve").

const latin: ("latin" | "latin-ext")[] = ["latin", "latin-ext"];
export const F = {
  display: bigShoulders("normal", { weights: ["800", "900"], subsets: latin }).fontFamily,
  mono: plexMono("normal", { weights: ["400", "500", "700"], subsets: latin }).fontFamily,
  texto: archivo("normal", { weights: ["400", "500", "600", "700", "800", "900"], subsets: latin }).fontFamily,
};

export const C = {
  papel: "#F4F2EC",
  papelSombra: "#E6E3DA",
  tinta: "#111113",
  cinza: "#6E6C66",
  linha: "rgba(17,17,19,.16)",
  vermelho: "#F2361D",
  marca: "#DFF51E",
  noite: "#0E0E10",
  branco: "#F7F6F2",
};

export const DIMS = { feed: { w: 1080, h: 1350 }, story: { w: 1080, h: 1920 } } as const;

// ---------- instituições (só o NOME em texto — sem logo, brasão ou cor oficial) ----------
export type InstKey = "uem" | "unicesumar" | "uninga" | "unicv" | "geral";
export const INST: Record<InstKey, { l1: string; l2: string; arquivo: string }> = {
  uem: { l1: "PASSOU", l2: "NA UEM?", arquivo: "uem" },
  unicesumar: { l1: "PASSOU NA", l2: "UNICESUMAR?", arquivo: "unicesumar" },
  uninga: { l1: "PASSOU", l2: "NA UNINGÁ?", arquivo: "uninga" },
  unicv: { l1: "PASSOU", l2: "NA UNICV?", arquivo: "unicv" },
  geral: { l1: "APROVADO", l2: "EM MARINGÁ?", arquivo: "generica" },
};
export const INST_KEYS = Object.keys(INST) as InstKey[];

// fitText mede no canvas: só desenha depois que as fontes carregaram
export const Pronto: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ok, setOk] = React.useState(false);
  const [h] = React.useState(() => delayRender("fontes aprovado"));
  React.useEffect(() => {
    Promise.all([
      document.fonts.load(`900 100px "${F.display}"`),
      document.fonts.load(`800 100px "${F.display}"`),
      document.fonts.load(`700 100px "${F.mono}"`),
      document.fonts.load(`400 100px "${F.mono}"`),
      document.fonts.load(`800 100px "${F.texto}"`),
    ])
      .then(() => document.fonts.ready)
      .then(() => {
        setOk(true);
        continueRender(h);
      });
  }, [h]);
  return ok ? <>{children}</> : null;
};

// ---------- papel do edital ----------
export const Papel: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: C.papel, overflow: "hidden" }}>
    <AbsoluteFill
      style={{
        backgroundImage: `repeating-linear-gradient(0deg, transparent 0 47px, rgba(17,17,19,.045) 47px 48px), repeating-linear-gradient(90deg, transparent 0 47px, rgba(17,17,19,.03) 47px 48px)`,
      }}
    />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 20% 10%, rgba(255,255,255,.7), transparent 55%), radial-gradient(ellipse at 100% 100%, rgba(120,110,80,.12), transparent 60%)" }} />
    <Grain opacity={0.14} blend="multiply" freq={0.8} />
    {children}
  </AbsoluteFill>
);

// cabeçalho de edital (linha de cima)
export const Cabecalho: React.FC<{ top: number; esq: string; dir: string; x?: number }> = ({ top, esq, dir, x = 64 }) => (
  <div style={{ position: "absolute", top, left: x, right: x }}>
    <div style={{ display: "flex", justifyContent: "space-between", fontFamily: F.mono, fontWeight: 500, fontSize: 22, letterSpacing: "0.06em", color: C.tinta, textTransform: "uppercase" }}>
      <span>{esq}</span>
      <span>{dir}</span>
    </div>
    <div style={{ height: 4, background: C.tinta, marginTop: 12 }} />
    <div style={{ height: 1.5, background: C.tinta, marginTop: 5 }} />
  </div>
);

// título condensado que se ajusta à largura
export const Titulo: React.FC<{ texto: string; largura: number; max: number; cor?: string; style?: React.CSSProperties }> = ({ texto, largura, max, cor = C.tinta, style }) => {
  const { fontSize } = fitText({ text: texto, withinWidth: largura, fontFamily: F.display, fontWeight: 900 });
  const fs = Math.min(max, fontSize * 0.97);
  return (
    <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: fs, lineHeight: 0.84, color: cor, whiteSpace: "nowrap", letterSpacing: "-0.005em", ...style }}>{texto}</div>
  );
};

// marca-texto limão por trás de um texto
export const Grifo: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; rot?: number }> = ({ children, style, rot = -1.2 }) => (
  <span style={{ position: "relative", display: "inline-block", ...style }}>
    <span
      style={{
        position: "absolute",
        left: "-3%",
        right: "-3%",
        top: "8%",
        bottom: "2%",
        background: C.marca,
        transform: `rotate(${rot}deg) skewX(-8deg)`,
        borderRadius: "6px 14px 8px 18px",
        mixBlendMode: "multiply",
        opacity: 0.95,
      }}
    />
    <span style={{ position: "relative" }}>{children}</span>
  </span>
);

// lista de aprovados (linhas de inscrição) com a linha VOCÊ grifada
export const Lista: React.FC<{ top: number; x?: number; linhas?: number; destaque?: number; fs?: number }> = ({ top, x = 64, linhas = 5, destaque = 2, fs = 27 }) => {
  const codigos = ["2027-00481", "2027-01127", "2027-02390", "2027-03316", "2027-04052", "2027-05218", "2027-06604"];
  const status = ["CLASSIFICADO", "CLASSIFICADO", "CLASSIFICADO", "CLASSIFICADO", "CLASSIFICADO", "CLASSIFICADO", "CLASSIFICADO"];
  return (
    <div style={{ position: "absolute", top, left: x, right: x, fontFamily: F.mono, color: C.tinta }}>
      {Array.from({ length: linhas }, (_, i) => {
        const eu = i === destaque;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 18, height: fs * 2, borderBottom: `1.5px dashed ${C.linha}`, fontSize: eu ? fs * 1.18 : fs, fontWeight: eu ? 700 : 400, opacity: eu ? 1 : 0.62 }}>
            <span style={{ width: fs * 1.9, opacity: 0.8 }}>{String(i + 1).padStart(3, "0")}</span>
            {eu ? (
              <Grifo style={{ padding: "0 10px" }}>VOCÊ</Grifo>
            ) : (
              <span>{codigos[i]}</span>
            )}
            <span style={{ flex: 1, overflow: "hidden", whiteSpace: "nowrap", letterSpacing: "0.2em", opacity: 0.45 }}>{"·".repeat(60)}</span>
            {eu ? <Grifo style={{ padding: "0 10px" }}>APROVADO(A)</Grifo> : <span>{status[i]}</span>}
          </div>
        );
      })}
    </div>
  );
};

// textura de tinta gasta do carimbo
const ruido = (seed: number) =>
  `url("data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='420' height='420'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' seed='${seed}'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -4.6 0 0 0 3.55'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`,
  ).replace(/%2523/g, "%23")}")`;

// o CARIMBO "APROVADO!" — retângulo de borda dupla, tinta vermelha
export const CarimboAprovado: React.FC<{ w: number; rot?: number; topo?: string; base?: string; grande?: string; seed?: number; style?: React.CSSProperties; cor?: string }> = ({
  w,
  rot = -9,
  topo = "COMISSÃO DE BOAS-VINDAS",
  base = "O BUTIQUIM · CALOUROS 2027",
  grande = "APROVADO!",
  seed = 4,
  style,
  cor = C.vermelho,
}) => {
  const b = Math.max(5, w * 0.016);
  const { fontSize } = fitText({ text: grande, withinWidth: w * 0.78, fontFamily: F.display, fontWeight: 900 });
  return (
    <div
      style={{
        width: w,
        transform: `rotate(${rot}deg)`,
        color: cor,
        border: `${b}px solid ${cor}`,
        borderRadius: w * 0.025,
        padding: b * 1.1,
        mixBlendMode: "multiply",
        WebkitMaskImage: ruido(seed),
        maskImage: ruido(seed),
        WebkitMaskSize: "420px 420px",
        maskSize: "420px 420px",
        ...style,
      }}
    >
      <div style={{ border: `${b * 0.45}px solid ${cor}`, borderRadius: w * 0.015, padding: `${w * 0.025}px ${w * 0.04}px ${w * 0.03}px`, textAlign: "center" }}>
        {topo && <div style={{ fontFamily: F.mono, fontWeight: 700, fontSize: w * 0.036, letterSpacing: "0.14em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{topo}</div>}
        <div style={{ fontFamily: F.display, fontWeight: 900, fontSize, lineHeight: 0.92, margin: `${w * 0.005}px 0` }}>{grande}</div>
        {base && (
          <div style={{ borderTop: `${b * 0.45}px solid ${cor}`, paddingTop: w * 0.014, fontFamily: F.display, fontWeight: 900, fontSize: w * 0.1, lineHeight: 1, letterSpacing: "0.02em", whiteSpace: "nowrap" }}>{base}</div>
        )}
      </div>
    </div>
  );
};

// carimbo redondo pequeno (cartão de carimbos)
export const CarimboRedondo: React.FC<{ d: number; rot?: number; seed?: number }> = ({ d, rot = -14, seed = 7 }) => (
  <div
    style={{
      width: d,
      height: d,
      borderRadius: "50%",
      border: `${d * 0.05}px solid ${C.vermelho}`,
      outline: `${d * 0.018}px solid ${C.vermelho}`,
      outlineOffset: -d * 0.12,
      color: C.vermelho,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      transform: `rotate(${rot}deg)`,
      mixBlendMode: "multiply",
      WebkitMaskImage: ruido(seed),
      maskImage: ruido(seed),
      WebkitMaskSize: "420px 420px",
      maskSize: "420px 420px",
    }}
  >
    <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: d * 0.19, lineHeight: 0.9 }}>APROVADO</div>
    <div style={{ fontFamily: F.mono, fontWeight: 700, fontSize: d * 0.1, letterSpacing: "0.1em" }}>2027</div>
  </div>
);

// papel picado: furinhos de fichário espalhados (determinístico)
const r = (s: number) => {
  const x = Math.sin(s * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};
export const Confete: React.FC<{ n?: number; w: number; h: number; seed?: number; zonas?: { y0: number; y1: number }[] }> = ({ n = 26, w, h, seed = 1, zonas }) => {
  const cores = [C.vermelho, C.marca, C.tinta, C.vermelho, C.marca];
  const zs = zonas ?? [{ y0: 0, y1: h }];
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: n }, (_, i) => {
        const z = zs[i % zs.length];
        const d = 14 + r(seed + i * 3) * 22;
        const quadrado = r(seed + i * 7) > 0.72;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: r(seed + i * 11) * (w - d),
              top: z.y0 + r(seed + i * 13) * (z.y1 - z.y0 - d),
              width: quadrado ? d * 1.6 : d,
              height: quadrado ? d * 0.55 : d,
              borderRadius: quadrado ? 2 : "50%",
              background: cores[i % cores.length],
              transform: `rotate(${r(seed + i * 5) * 180}deg)`,
              opacity: 0.92,
              boxShadow: "0 2px 3px rgba(0,0,0,.18)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ---------- faixa preta de rodapé: logo + assinatura + selo legal ----------
export const Logo: React.FC<{ width: number }> = ({ width }) => <Img src={staticFile("logos/butiquim-branco-h.png")} style={{ width, display: "block" }} />;

export const SeloLegal: React.FC<{ fs?: number; cor?: string }> = ({ fs = 21, cor = "rgba(247,246,242,.82)" }) => (
  <div style={{ fontFamily: F.texto, fontWeight: 600, fontSize: fs, letterSpacing: "0.02em", color: cor, textAlign: "center", whiteSpace: "nowrap" }}>
    Proibido para menores de 18 anos · Beba com moderação · Se beber, não dirija
  </div>
);

export const Assinatura: React.FC<{ fs?: number; cor?: string }> = ({ fs = 46, cor = C.marca }) => (
  <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: fs, color: cor, letterSpacing: "0.01em", lineHeight: 1, whiteSpace: "nowrap" }}>TE VEJO NA ESQUINA</div>
);

export const Faixa: React.FC<{ top: number; h: number; logo?: number; assinatura?: number; legal?: number; legalBottom?: number; children?: React.ReactNode }> = ({
  top,
  h,
  logo = 250,
  assinatura = 50,
  legal = 21,
  legalBottom = 26,
  children,
}) => (
  <div style={{ position: "absolute", left: 0, right: 0, top, height: h, background: C.noite }}>
    {/* picote de bilhete na borda de cima */}
    <div style={{ position: "absolute", top: -9, left: 0, right: 0, height: 18, backgroundImage: `radial-gradient(circle at 9px 9px, ${C.noite} 6px, transparent 6.5px)`, backgroundSize: "26px 18px" }} />
    <Grain opacity={0.08} />
    {children}
    <div style={{ position: "absolute", left: 64, right: 64, bottom: legalBottom + legal * 1.9, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Logo width={logo} />
      <Assinatura fs={assinatura} />
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, bottom: legalBottom }}>
      <SeloLegal fs={legal} />
    </div>
  </div>
);

// caixinha marcada [X] (lista do que ganha)
export const Check: React.FC<{ size: number }> = ({ size }) => (
  <div style={{ width: size, height: size, border: `${size * 0.09}px solid ${C.tinta}`, borderRadius: size * 0.08, position: "relative", flex: "0 0 auto", background: "rgba(255,255,255,.4)" }}>
    <svg viewBox="0 0 100 100" style={{ position: "absolute", inset: -size * 0.18, width: size * 1.36, height: size * 1.36, overflow: "visible" }}>
      <path d="M14 52 L40 80 L92 10" stroke={C.vermelho} strokeWidth={15} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);
