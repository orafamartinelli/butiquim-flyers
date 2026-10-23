import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { loadFont as bebas } from "@remotion/google-fonts/BebasNeue";
import { loadFont as nunito } from "@remotion/google-fonts/Nunito";
import { Carimbo, F as FK, Logo } from "./kit";
import { Grain } from "../shared/fx";
import { Ico } from "../shared/icones";

// Campanha "PRIMEIRA VEZ" — V2 "A casa cheia" (foto real) e V3 "O convite" (ingresso).
// Regra: mensagem literal, entendida em 1 segundo. Oferta: entrada grátis + 1 caipirinha de
// Smirnoff ou 1 Smirnoff Ice de cortesia. Identidade da página da lista: Bebas Neue + Nunito,
// ouro #FFB800 sobre #0C0C0C.

const latin: ("latin" | "latin-ext")[] = ["latin", "latin-ext"];
export const BB = bebas("normal", { weights: ["400"], subsets: latin }).fontFamily;
export const NU = nunito("normal", { weights: ["600", "700", "800", "900"], subsets: latin }).fontFamily;

export const K = {
  bg: "#0C0C0C",
  card: "#141414",
  ouro: "#FFB800",
  ouroEsc: "#CC9200",
  branco: "#FFFFFF",
  cinza: "#B4B4B4",
  verde: "#22C55E",
};
export const URL_PV = "lista.obutiquim.com.br/primeira-vez";
export const ENDERECO = "Praça Manoel Ribas, 255 · Maringá";

export type TemaV = "geral" | "pagode" | "sertanejo";
type Fmt = "feed" | "story";
type L = { t: string; c?: string; s: number };

export const B: React.FC<{ size: number; color?: string; ls?: string; style?: React.CSSProperties; children: React.ReactNode }> = ({ size, color = K.branco, ls = "0.01em", style, children }) => (
  <div style={{ fontFamily: BB, fontSize: size, lineHeight: 0.98, color, letterSpacing: ls, whiteSpace: "nowrap", ...style }}>{children}</div>
);
export const N: React.FC<{ size: number; color?: string; weight?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ size, color = K.branco, weight = 800, style, children }) => (
  <div style={{ fontFamily: NU, fontSize: size, lineHeight: 1.22, color, fontWeight: weight, textWrap: "balance", ...style }}>{children}</div>
);

export const Botao: React.FC<{ size: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ size, children, style }) => (
  <div
    style={{
      background: K.ouro,
      color: K.bg,
      fontFamily: BB,
      fontSize: size,
      letterSpacing: "0.03em",
      lineHeight: 1,
      padding: `${size * 0.32}px ${size * 0.6}px ${size * 0.26}px`,
      borderRadius: size * 0.22,
      whiteSpace: "nowrap",
      boxShadow: "0 14px 34px rgba(255,184,0,.28)",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Rodape: React.FC<{ size: number; align?: "left" | "center" }> = ({ size, align = "left" }) => (
  <div style={{ fontFamily: NU, fontWeight: 700, fontSize: size, color: K.cinza, textAlign: align, lineHeight: 1.4 }}>
    <span style={{ color: K.branco }}>{URL_PV}</span>
    <span style={{ opacity: 0.7 }}> · {ENDERECO}</span>
  </div>
);

// manchete de cada tema (linhas literais)
export const MANCHETE: Record<TemaV, { v2: L[]; v3: L[] }> = {
  geral: {
    v2: [
      { t: "SUA ENTRADA", s: 1 },
      { t: "É GRÁTIS", c: K.ouro, s: 1 },
    ],
    v3: [
      { t: "PRIMEIRA VEZ", s: 1 },
      { t: "NO BUTIQUIM?", c: K.ouro, s: 1 },
    ],
  },
  pagode: {
    v2: [
      { t: "SÁBADO TEM", s: 0.5 },
      { t: "PAGODE", c: K.ouro, s: 1 },
      { t: "NO BUTIQUIM", s: 0.5 },
    ],
    v3: [
      { t: "SÁBADO TEM PAGODE", s: 1 },
      { t: "NO BUTIQUIM", c: K.ouro, s: 1 },
    ],
  },
  sertanejo: {
    v2: [
      { t: "DOMINGO TEM", s: 0.5 },
      { t: "SERTANEJO", c: K.ouro, s: 1 },
      { t: "NO BUTIQUIM", s: 0.5 },
    ],
    v3: [
      { t: "DOMINGO TEM SERTANEJO", s: 1 },
      { t: "NO BUTIQUIM", c: K.ouro, s: 1 },
    ],
  },
};

export const Manchete: React.FC<{ linhas: L[]; size: number; align?: "left" | "center" }> = ({ linhas, size, align = "left" }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: align === "center" ? "center" : "flex-start" }}>
    {linhas.map((l, i) => (
      <B key={i} size={size * l.s} color={l.c ?? K.branco} style={{ paddingTop: i === 0 ? size * l.s * 0.08 : size * l.s * 0.02, textShadow: "0 6px 30px rgba(0,0,0,.45)" }}>
        {l.t}
      </B>
    ))}
  </div>
);

// =====================================================================
// V2 · A CASA CHEIA — foto real da casa em tela cheia + tipografia grande
// =====================================================================
export const V2: React.FC<{ tema: TemaV; fmt: Fmt }> = ({ tema, fmt }) => {
  const story = fmt === "story";
  const pad = story ? { t: 250, b: 250, x: 76 } : { t: 58, b: 54, x: 64 };
  const z = story ? 1.12 : 1;
  const foto = `fotos/primeira-vez/v2-${tema}-${fmt}.jpg`;
  const geral = tema === "geral";
  const hSize = (geral ? 200 : 210) * z;
  return (
    <AbsoluteFill style={{ background: K.bg }}>
      {/* no story a foto fica só na parte de cima (o palco aparece inteiro) */}
      <Img
        src={staticFile(foto)}
        style={{ position: "absolute", left: 0, top: 0, width: "100%", height: story ? 1240 : "100%", objectFit: "cover", objectPosition: story ? "50% 30%" : "50% 50%", filter: "saturate(1.05) contrast(1.05)" }}
      />
      <AbsoluteFill
        style={{
          background: story
            ? "linear-gradient(180deg, rgba(12,12,12,.95) 0%, rgba(12,12,12,.5) 14%, rgba(12,12,12,.05) 22%, rgba(12,12,12,.3) 34%, rgba(12,12,12,.78) 45%, #0C0C0C 60%, #0C0C0C 100%)"
            : "linear-gradient(180deg, rgba(12,12,12,.8) 0%, rgba(12,12,12,.1) 16%, rgba(12,12,12,.15) 30%, rgba(12,12,12,.82) 50%, #0C0C0C 70%, #0C0C0C 100%)",
        }}
      />
      <AbsoluteFill style={{ padding: `${pad.t}px ${pad.x}px ${pad.b}px`, display: "flex", flexDirection: "column" }}>
        <Logo width={story ? 240 : 220} />
        <div style={{ flex: 1 }} />
        {geral && (
          <B size={(story ? 74 : 66)} color={K.ouro} ls="0.02em" style={{ marginBottom: 4 }}>
            PRIMEIRA VEZ NO BUTIQUIM?
          </B>
        )}
        <Manchete linhas={MANCHETE[tema].v2} size={hSize} />
        <div style={{ height: story ? 30 : 22 }} />
        {geral ? (
          <N size={story ? 44 : 40} style={{ maxWidth: 900 }}>
            + 1 caipirinha de Smirnoff ou 1 Smirnoff Ice <span style={{ color: K.ouro }}>por nossa conta</span>
          </N>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <B size={story ? 66 : 58} color={K.ouro} ls="0.02em">
              PRIMEIRA VEZ?
            </B>
            <N size={story ? 56 : 48} weight={900} style={{ textWrap: "nowrap", lineHeight: 1.12 }}>
              Entrada grátis
              <br />+ 1 drink por nossa conta
            </N>
            <N size={story ? 28 : 25} color={K.cinza} weight={700}>
              drink: 1 caipirinha de Smirnoff ou 1 Smirnoff Ice
            </N>
          </div>
        )}
        <div style={{ height: story ? 40 : 30 }} />
        <div style={{ display: "flex" }}>
          <Botao size={story ? 56 : 50}>CADASTRE-SE NA LISTA PRIMEIRA VEZ</Botao>
        </div>
        <div style={{ height: story ? 26 : 20 }} />
        <Rodape size={story ? 26 : 23} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// =====================================================================
// V3 · O CONVITE — ingresso com canhoto, fundo escuro + ouro
// =====================================================================
export const Ingresso: React.FC<{ tema: TemaV; w: number; z: number; carimboStart?: number }> = ({ tema, w, z, carimboStart = 0 }) => {
  const geral = tema === "geral";
  const furo = 34 * z;
  const stubH = 150 * z;
  return (
    <div style={{ position: "relative", width: w, flex: "0 0 auto" }}>
      <div
        style={{
          position: "relative",
          background: `linear-gradient(160deg, #1d1a12 0%, ${K.card} 45%, #101010 100%)`,
          border: `3px solid ${K.ouro}`,
          borderRadius: 30 * z,
          overflow: "hidden",
          boxShadow: "0 40px 90px rgba(0,0,0,.65), 0 0 0 10px rgba(255,184,0,.06)",
        }}
      >
        <Grain opacity={0.08} />
        {/* moldura interna fina */}
        <div style={{ position: "absolute", inset: 16 * z, bottom: stubH + 14 * z, border: "1.5px solid rgba(255,184,0,.35)", borderRadius: 18 * z }} />
        <div style={{ position: "relative", padding: `${46 * z}px ${54 * z}px ${40 * z}px` }}>
          <B size={40 * z} color={K.ouro} ls="0.16em">
            CONVITE · SUA PRIMEIRA NOITE
          </B>
          <div style={{ height: 22 * z }} />
          {geral ? (
            <>
              <B size={150 * z}>SUA ENTRADA</B>
              <B size={150 * z} color={K.ouro}>
                É GRÁTIS
              </B>
              <div style={{ height: 22 * z }} />
              <div style={{ display: "flex", alignItems: "center", gap: 22 * z }}>
                <Ico i="caipirinha" size={86 * z} color={K.ouro} stroke={1.5} />
                <N size={36 * z} style={{ flex: 1 }}>
                  + 1 caipirinha de Smirnoff ou 1 Smirnoff Ice <span style={{ color: K.ouro }}>por nossa conta</span>
                </N>
              </div>
            </>
          ) : (
            <>
              <B size={66 * z} color={K.cinza} ls="0.04em">
                PRIMEIRA VEZ?
              </B>
              <B size={150 * z}>ENTRADA GRÁTIS</B>
              <div style={{ height: 14 * z }} />
              <div style={{ display: "flex", alignItems: "center", gap: 22 * z }}>
                <Ico i="caipirinha" size={86 * z} color={K.ouro} stroke={1.5} />
                <div>
                  <B size={74 * z} color={K.ouro}>
                    + 1 DRINK POR NOSSA CONTA
                  </B>
                  <N size={26 * z} color={K.cinza} weight={700}>
                    1 caipirinha de Smirnoff ou 1 Smirnoff Ice
                  </N>
                </div>
              </div>
            </>
          )}
        </div>
        {/* canhoto destacável */}
        <div
          style={{
            position: "relative",
            height: stubH,
            borderTop: `4px dashed rgba(255,184,0,.55)`,
            background: "rgba(255,184,0,.07)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: `0 ${54 * z}px`,
          }}
        >
          <div>
            <B size={26 * z} color={K.cinza} ls="0.3em">
              CANHOTO
            </B>
            <B size={54 * z} color={K.branco} ls="0.04em">
              LISTA PRIMEIRA VEZ
            </B>
          </div>
          <div style={{ textAlign: "right" }}>
            <B size={26 * z} color={K.cinza} ls="0.3em">
              ADMITE
            </B>
            <B size={54 * z} color={K.ouro} ls="0.04em">
              1 PESSOA
            </B>
          </div>
        </div>
      </div>
      {/* furos do picote (mesma cor do fundo) */}
      {[-1, 1].map((lado) => (
        <div
          key={lado}
          style={{
            position: "absolute",
            bottom: stubH - furo,
            [lado < 0 ? "left" : "right"]: -furo,
            width: furo * 2,
            height: furo * 2,
            borderRadius: "50%",
            background: K.bg,
            border: `3px solid ${K.ouro}`,
            clipPath: lado < 0 ? "inset(0 0 0 50%)" : "inset(0 50% 0 0)",
          }}
        />
      ))}
      {/* carimbo */}
      <div style={{ position: "absolute", right: (geral ? 50 : 30) * z, top: (geral ? 262 : 12) * z }}>
        <Carimbo linhas={["Entrada", "liberada"]} cor={K.verde} size={190 * z} rot={-9} seed={141} start={carimboStart} style={{ mixBlendMode: "normal", fontFamily: FK.display }} />
      </div>
    </div>
  );
};

export const V3: React.FC<{ tema: TemaV; fmt: Fmt }> = ({ tema, fmt }) => {
  const story = fmt === "story";
  const pad = story ? { t: 250, b: 250, x: 70 } : { t: 56, b: 50, x: 70 };
  const z = story ? 1.0 : 0.92;
  const longo = tema === "sertanejo";
  const hSize = story ? (longo ? 112 : 124) : longo ? 100 : 112;
  return (
    <AbsoluteFill style={{ background: K.bg }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 45% at 50% 38%, rgba(255,184,0,.13), transparent 70%)" }} />
      <Grain opacity={0.07} />
      <AbsoluteFill style={{ padding: `${pad.t}px ${pad.x}px ${pad.b}px`, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Logo width={story ? 250 : 220} />
        <div style={{ flex: 1, minHeight: story ? 30 : 16 }} />
        <Manchete linhas={MANCHETE[tema].v3} size={hSize} align="center" />
        <div style={{ flex: 1, minHeight: story ? 40 : 26, maxHeight: story ? 90 : 40 }} />
        <Ingresso tema={tema} w={story ? 920 : 900} z={z} />
        <div style={{ flex: 1, minHeight: story ? 40 : 30, maxHeight: story ? 100 : 44 }} />
        <Botao size={story ? 56 : 48}>CADASTRE-SE NA LISTA PRIMEIRA VEZ</Botao>
        <div style={{ height: story ? 24 : 18 }} />
        <Rodape size={story ? 26 : 23} align="center" />
        <div style={{ flex: 1, minHeight: 0 }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// =====================================================================
// CABEÇALHO WHATSAPP · SEU PASSAPORTE v2 (igual para todos, sem nome)
// =====================================================================
const LIMA = "#C8D200";
const Tampinha2: React.FC<{ d: number; n: number; carimbada: boolean; seed: number; rotulo?: string }> = ({ d, n, carimbada, seed, rotulo }) => {
  const dentes = 21;
  const pts = Array.from({ length: dentes * 2 }, (_, i) => {
    const a = (Math.PI * i) / dentes;
    const r = i % 2 === 0 ? 50 : 45.5;
    return `${(Math.cos(a) * r).toFixed(2)},${(Math.sin(a) * r).toFixed(2)}`;
  }).join(" ");
  const id = `t2${n}`;
  const cheia = carimbada;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: d * 0.1 }}>
      <div style={{ position: "relative", width: d, height: d }}>
        <svg viewBox="-52 -52 104 104" width={d} height={d} style={{ display: "block", filter: cheia ? "drop-shadow(0 18px 26px rgba(0,0,0,.65))" : "none" }}>
          <defs>
            <radialGradient id={`${id}g`} cx="36%" cy="30%" r="78%">
              <stop offset="0%" stopColor={cheia ? "#F4F99A" : "#4a4a4a"} />
              <stop offset="45%" stopColor={cheia ? LIMA : "#2e2e2e"} />
              <stop offset="100%" stopColor={cheia ? "#7E8400" : "#1c1c1c"} />
            </radialGradient>
          </defs>
          <polygon points={pts} fill={`url(#${id}g)`} stroke={cheia ? "#5E6200" : "rgba(255,255,255,.28)"} strokeWidth={cheia ? 0.8 : 0.9} strokeDasharray={cheia ? undefined : "2.4 2"} />
          <circle r={37} fill={cheia ? "rgba(0,0,0,.06)" : "none"} stroke={cheia ? "rgba(0,0,0,.25)" : "rgba(255,255,255,.18)"} strokeWidth={1.3} />
          <circle r={33.5} fill="none" stroke={cheia ? "rgba(255,255,255,.4)" : "none"} strokeWidth={0.6} />
        </svg>
        {!cheia && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Img src={staticFile("logos/o-simbolo.png")} style={{ width: d * 0.32, filter: "brightness(0) invert(1)", opacity: 0.32 }} />
          </div>
        )}
        {cheia && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Carimbo linhas={["Visto", "Butiquim"]} size={d * 0.86} redondo rot={-14 + n * 10} seed={seed} cor="#D6127E" style={{ mixBlendMode: "normal" }} />
          </div>
        )}
      </div>
      <B size={d * 0.22} color={cheia ? K.branco : "#8a8a8a"} ls="0.06em">
        {rotulo ?? `${n}ª VISITA`}
      </B>
    </div>
  );
};

// Passaporte v3 (23/10/2026): 4 carimbos em 3 visitas — a 1ª visita vale 2 (carimbo duplo),
// a 2ª libera o crédito e a 3ª o brinde. Cabeçalho do template butiquim_pv_passaporte_img.
const ROTULOS_V3 = ["1ª VISITA", "1ª VISITA", "2ª · CRÉDITO", "3ª · BRINDE"];
export const PassaporteV3: React.FC<{ carimbos?: number }> = ({ carimbos = 2 }) => (
  <AbsoluteFill style={{ background: K.bg }}>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 60% at 50% 70%, rgba(200,210,0,.12), transparent 70%)" }} />
    <Grain opacity={0.07} />
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "50px 90px 60px" }}>
      <Logo width={250} />
      <div style={{ height: 10 }} />
      <B size={250} ls="0.02em" style={{ textAlign: "center" }}>
        SEU <span style={{ color: LIMA }}>PASSAPORTE</span>
      </B>
      <div style={{ height: 34 }} />
      <div style={{ display: "flex", gap: 70, alignItems: "flex-start" }}>
        {[1, 2, 3, 4].map((n) => (
          <Tampinha2 key={n} d={290} n={n} carimbada={n <= carimbos} seed={150 + n} rotulo={ROTULOS_V3[n - 1]} />
        ))}
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);

export const PassaporteV2: React.FC = () => (
  <AbsoluteFill style={{ background: K.bg }}>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 60% at 50% 70%, rgba(200,210,0,.12), transparent 70%)" }} />
    <Grain opacity={0.07} />
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "50px 90px 60px" }}>
      <Logo width={250} />
      <div style={{ height: 10 }} />
      <B size={250} ls="0.02em" style={{ textAlign: "center" }}>
        SEU <span style={{ color: LIMA }}>PASSAPORTE</span>
      </B>
      <div style={{ height: 34 }} />
      <div style={{ display: "flex", gap: 96, alignItems: "flex-start" }}>
        {[1, 2, 3, 4].map((n) => (
          <Tampinha2 key={n} d={290} n={n} carimbada={n <= 2} seed={150 + n} />
        ))}
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);
