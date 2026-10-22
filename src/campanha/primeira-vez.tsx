import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { C, Carimbo, Escrita, F, Fundo, Logo, Papel, SeloCasa, Texto, type Seg } from "./kit";

// Campanha "A PRIMEIRA É NOSSA" (Meta Ads de cadastro p/ quem nunca veio) — out/2026.
// Mesma identidade de "A casa te deve": noite preta, papel de caderneta, caneta azul,
// carimbo magenta, lima nos títulos. Foto: caipirinha de Smirnoff (única marca permitida).

export const URL_CURTA = "lista.obutiquim.com.br/primeira-vez";
const FOTO = "fotos/primeira-vez/caipirinha.jpg";
const QR = "fotos/primeira-vez/qr-porta.svg";

export const DIMS_PV = {
  feed: { w: 1080, h: 1350 },
  story: { w: 1080, h: 1920 },
  zap: { w: 1910, h: 1000 },
  a4: { w: 2480, h: 3508 },
} as const;

export type Tema = "geral" | "pagode" | "sertanejo";
type Linhas = (string | Seg[])[];
const L = (t: string): Seg[] => [{ t, c: C.lima }];

const TEMAS: Record<Tema, { carimbo: string; lead?: string; titulo: Linhas; tam: { feed: number; story: number }; leadTam?: { feed: number; story: number } }> = {
  geral: { carimbo: "Nunca veio?", titulo: ["A primeira", L("é nossa.")], tam: { feed: 178, story: 196 } },
  pagode: { carimbo: "Pagode", lead: "Sábado é pagode.", titulo: ["Seu primeiro", L("é nosso.")], tam: { feed: 160, story: 176 }, leadTam: { feed: 96, story: 104 } },
  sertanejo: {
    carimbo: "Sertanejo",
    lead: "Domingo é sertanejo.",
    titulo: ["Sua primeira", L("saideira"), L("é nossa.")],
    tam: { feed: 112, story: 118 },
    leadTam: { feed: 80, story: 82 },
  },
};

// Título estático: o <Titulo> do kit usa overflow:hidden (animação de entrada) e
// corta o acento de "É" maiúsculo em Anton. Aqui as peças são paradas, então sem corte.
const Titulo: React.FC<{ linhas: Linhas; size: number; color?: string; align?: "left" | "center"; style?: React.CSSProperties }> = ({ linhas, size, color = C.branco, align = "left", style }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: align === "center" ? "center" : "flex-start", ...style }}>
    {linhas.map((l, i) => (
      <div
        key={i}
        style={{
          fontFamily: F.display,
          fontSize: size,
          lineHeight: 1.13,
          color,
          textTransform: "uppercase",
          letterSpacing: "0.005em",
          textAlign: align,
          whiteSpace: "nowrap",
          paddingTop: i === 0 ? size * 0.06 : 0,
        }}
      >
        {typeof l === "string" ? l : l.map((s, k) => <span key={k} style={{ color: s.c ?? color }}>{s.t}</span>)}
      </div>
    ))}
  </div>
);

// foto da caipirinha, desbotando nas bordas para dentro da noite
const Foto: React.FC<{ w: number; h: number | string; pos?: string; style?: React.CSSProperties }> = ({ w, h, pos = "50% 45%", style }) => (
  <Img
    src={staticFile(FOTO)}
    style={{
      width: w,
      height: h,
      objectFit: "cover",
      objectPosition: pos,
      filter: "contrast(1.08) saturate(1.1)",
      WebkitMaskImage: "radial-gradient(ellipse 50% 52% at 50% 50%, #000 58%, transparent 100%)",
      display: "block",
      ...style,
    }}
  />
);

// endereço da lista (rodapé)
const Endereco: React.FC<{ size: number; rotulo?: string }> = ({ size, rotulo = "Entra na lista" }) => (
  <div style={{ display: "flex", alignItems: "center", gap: size * 0.6, whiteSpace: "nowrap" }}>
    <div style={{ fontFamily: F.texto, fontWeight: 700, fontSize: size * 0.78, letterSpacing: "0.14em", textTransform: "uppercase", color: C.lima }}>{rotulo}</div>
    <div style={{ fontFamily: F.comanda, fontWeight: 700, fontSize: size, color: C.branco }}>{URL_CURTA}</div>
  </div>
);

// cartão de caderneta com a oferta escrita à caneta
const CartaoOferta: React.FC<{ w: number; h: number; s: number; rot?: number; destaqueNunca?: boolean }> = ({ w, h, s, rot = -3, destaqueNunca }) => {
  const x = 112 * s;
  return (
    <Papel w={w} h={h} rot={rot} pauta={Math.round(62 * s)} topo={Math.round(104 * s)} margem={Math.round(92 * s)}>
      <div style={{ position: "absolute", left: x, right: 24 * s, top: 104 * s - 6 * s, display: "flex", flexDirection: "column" }}>
        <Escrita start={0} size={74 * s} style={{ lineHeight: `${124 * s}px`, marginTop: -60 * s }}>
          Entrada grátis
        </Escrita>
        <Escrita start={0} size={52 * s} style={{ lineHeight: `${62 * s}px` }}>
          + brinde de boas-vindas
        </Escrita>
        <div style={{ transform: "rotate(-4deg)", transformOrigin: "left center", marginTop: 22 * s }}>
          {["Só pra quem", "nunca veio"].map((l) => (
            <Escrita key={l} start={0} size={(destaqueNunca ? 38 : 34) * s} font={F.mao} color={C.rosa} weight={400} style={{ lineHeight: `${62 * s}px` }}>
              {l}
            </Escrita>
          ))}
        </div>
      </div>
    </Papel>
  );
};

// =====================================================================
// ANÚNCIOS (feed 4:5 e story 9:16)
// =====================================================================
export const AnuncioPV: React.FC<{ tema: Tema; fmt: "feed" | "story" }> = ({ tema, fmt }) => {
  const t = TEMAS[tema];
  const story = fmt === "story";
  const pad = story ? { t: 250, b: 250, x: 80 } : { t: 56, b: 50, x: 72 };
  const s = story ? 1.04 : 1;
  const cardW = 600 * s;
  const cardH = 410 * s;
  return (
    <AbsoluteFill>
      <Fundo />
      <AbsoluteFill style={{ padding: `${pad.t}px ${pad.x}px ${pad.b}px`, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 64, flex: "0 0 auto" }}>
          <Logo width={story ? 230 : 210} />
          <SeloCasa size={story ? 36 : 32} />
        </div>
        <div style={{ height: story ? 56 : 34, flex: "0 0 auto" }} />
        <div style={{ alignSelf: "flex-start", marginLeft: 6, flex: "0 0 auto" }}>
          <Carimbo linhas={[t.carimbo]} size={story ? (t.lead ? 290 : 330) : t.lead ? 240 : 280} rot={-6} seed={tema === "geral" ? 101 : tema === "pagode" ? 103 : 107} style={{ mixBlendMode: "normal" }} />
        </div>
        <div style={{ height: story ? 34 : 22, flex: "0 0 auto" }} />
        {t.lead && (
          <Titulo linhas={[t.lead]} size={t.leadTam![fmt]} color={C.branco} style={{ marginBottom: story ? 6 : 2 }} />
        )}
        <Titulo linhas={t.titulo} size={t.tam[fmt]} />
        <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
          <div style={{ position: "absolute", right: story ? -150 : -pad.x - 60, bottom: story ? 50 : 30, top: story ? 0 : -10, overflow: "hidden" }}>
            <Foto w={story ? 600 : 540} h="100%" pos="50% 52%" />
          </div>
          <div style={{ position: "absolute", left: 4, bottom: story ? 100 : 64 }}>
            <CartaoOferta w={cardW} h={cardH} s={s} destaqueNunca={tema === "geral"} />
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, bottom: story ? 30 : 4 }}>
            <Texto size={story ? 34 : 29} color={C.cinza} weight={500}>
              Brinde: 1 caipirinha de Smirnoff ou 1 Smirnoff Ice.
            </Texto>
          </div>
        </div>
        <div style={{ flex: "0 0 auto", paddingTop: story ? 26 : 18, borderTop: "2px solid rgba(255,255,255,.12)" }}>
          <Endereco size={story ? 30 : 29} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// =====================================================================
// CABEÇALHO WHATSAPP · "Lista Primeira Vez confirmada" (1910x1000)
// =====================================================================
export const ZapConfirmada: React.FC = () => (
  <AbsoluteFill>
    <Fundo />
    <div style={{ position: "absolute", right: -60, top: 0, bottom: 0, display: "flex", alignItems: "center" }}>
      <Foto w={560} h={1000} />
    </div>
    <div style={{ position: "absolute", left: -60, top: 0, bottom: 0, display: "flex", alignItems: "center" }}>
      <Foto w={560} h={1000} pos="50% 50%" />
    </div>
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "50px 300px 60px" }}>
      <Logo width={230} />
      <div style={{ height: 26 }} />
      <Titulo linhas={["A primeira", L("é nossa.")]} size={236} align="center" />
      <div style={{ height: 34 }} />
      <Carimbo linhas={["Lista Primeira Vez confirmada"]} size={420} rot={-3} seed={111} style={{ mixBlendMode: "normal" }} />
    </AbsoluteFill>
  </AbsoluteFill>
);

// =====================================================================
// CABEÇALHO WHATSAPP · "Seu passaporte" com 4 tampinhas (2 carimbadas)
// =====================================================================
const Tampinha: React.FC<{ d: number; n: number; carimbada: boolean; seed: number }> = ({ d, n, carimbada, seed }) => {
  const dentes = 21;
  const pts = Array.from({ length: dentes * 2 }, (_, i) => {
    const a = (Math.PI * i) / dentes;
    const r = i % 2 === 0 ? 50 : 45.5;
    return `${(Math.cos(a) * r).toFixed(2)},${(Math.sin(a) * r).toFixed(2)}`;
  }).join(" ");
  const id = `tp${n}`;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: d * 0.12 }}>
      <div style={{ position: "relative", width: d, height: d, opacity: carimbada ? 1 : 0.5 }}>
        <svg viewBox="-52 -52 104 104" width={d} height={d} style={{ display: "block", filter: "drop-shadow(0 18px 24px rgba(0,0,0,.6))" }}>
          <defs>
            <radialGradient id={`${id}g`} cx="38%" cy="32%" r="75%">
              <stop offset="0%" stopColor="#F1F78A" />
              <stop offset="45%" stopColor={C.lima} />
              <stop offset="100%" stopColor="#7E8400" />
            </radialGradient>
            <radialGradient id={`${id}i`} cx="40%" cy="35%" r="70%">
              <stop offset="0%" stopColor="#E3EC3A" />
              <stop offset="100%" stopColor="#A9B100" />
            </radialGradient>
          </defs>
          <polygon points={pts} fill={`url(#${id}g)`} stroke="#5E6200" strokeWidth={0.8} />
          <circle r={37} fill={`url(#${id}i)`} stroke="rgba(0,0,0,.28)" strokeWidth={1.4} />
          <circle r={34} fill="none" stroke="rgba(255,255,255,.35)" strokeWidth={0.6} />
        </svg>
        {!carimbada && <Img
          src={staticFile("logos/o-simbolo.png")}
          style={{ position: "absolute", left: "50%", top: "50%", width: d * 0.34, transform: "translate(-50%,-50%)", filter: "brightness(0)", opacity: 0.78 }}
        />}
        {carimbada && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Carimbo linhas={["Visto", `${n}ª visita`]} size={d * 0.9} redondo rot={-14 + n * 9} seed={seed} style={{ mixBlendMode: "normal" }} />
          </div>
        )}
      </div>
      <div style={{ fontFamily: F.display, fontSize: d * 0.17, color: carimbada ? C.branco : C.cinza, letterSpacing: "0.04em" }}>{n}ª VISITA</div>
    </div>
  );
};

export const ZapPassaporte: React.FC = () => (
  <AbsoluteFill>
    <Fundo />
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "56px 90px 64px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
        <Logo width={210} />
        <SeloCasa size={38} />
      </div>
      <div style={{ height: 20 }} />
      <Titulo linhas={[[{ t: "Seu " }, { t: "passaporte", c: C.lima }]]} size={210} align="center" />
      <div style={{ height: 50 }} />
      <div style={{ display: "flex", gap: 90, alignItems: "flex-start" }}>
        {[1, 2, 3, 4].map((n) => (
          <Tampinha key={n} d={300} n={n} carimbada={n <= 2} seed={120 + n} />
        ))}
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);

// =====================================================================
// CARTAZ DA PORTA · A4 retrato 300 dpi (2480x3508) com QR
// =====================================================================
export const CartazQR: React.FC = () => (
  <AbsoluteFill>
    <Fundo />
    <AbsoluteFill style={{ padding: "170px 170px 160px", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Logo width={540} />
        <SeloCasa size={74} />
      </div>
      <div style={{ height: 110 }} />
      <div style={{ alignSelf: "flex-start", marginLeft: 10 }}>
        <Carimbo linhas={["Nunca veio?"]} size={640} rot={-6} seed={131} style={{ mixBlendMode: "normal" }} />
      </div>
      <div style={{ height: 60 }} />
      <Titulo linhas={["Primeira vez", L("aqui?")]} size={380} />
      <div style={{ height: 110 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 90 }}>
        <div
          style={{
            width: 1260,
            height: 1260,
            background: C.recibo,
            borderRadius: 40,
            boxShadow: "0 50px 90px rgba(0,0,0,.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: "0 0 auto",
          }}
        >
          <Img src={staticFile(QR)} style={{ width: 1060, height: 1060, display: "block" }} />
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 30 }}>
          <Escrita start={0} size={120} font={F.mao} color={C.lima} weight={400} style={{ transform: "rotate(-5deg)", lineHeight: 1.3 }}>
            Aponta
          </Escrita>
          <Escrita start={0} size={120} font={F.mao} color={C.lima} weight={400} style={{ transform: "rotate(-5deg)", lineHeight: 1.3 }}>
            a câmera
          </Escrita>
          <div style={{ fontFamily: F.texto, fontWeight: 800, fontSize: 200, color: C.lima, lineHeight: 1, marginLeft: -20 }}>←</div>
          <Foto w={720} h={760} style={{ marginTop: -40 }} />
        </div>
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ fontFamily: F.display, fontSize: 168, color: C.lima, textTransform: "uppercase", lineHeight: 1 }}>Ganhe seu passaporte:</div>
      <div style={{ height: 30 }} />
      <div style={{ fontFamily: F.texto, fontSize: 112, color: C.branco, fontWeight: 600, lineHeight: 1.15 }}>
        crédito na 2ª visita e brinde na 3ª
      </div>
      <div style={{ height: 80 }} />
      <div style={{ paddingTop: 50, borderTop: "4px solid rgba(255,255,255,.14)" }}>
        <Endereco size={64} rotulo="ou entra em" />
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);
