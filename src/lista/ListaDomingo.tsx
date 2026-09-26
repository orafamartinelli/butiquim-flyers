import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ANTON, ARCHIVO, BARLOW, FRAUNCES, MONOTON, YELLOWTAIL } from "../fonts";
import { Grain, Logo, Vignette, clamp } from "../shared/fx";
import { Ico, Icone, rnd } from "../shared/icones";
import { O_PATH } from "../shared/oPath";
import { regraDia } from "../data";

// ARTES DE LISTA DO DOMINGO ("de sempre": sem artista e sem data, reaproveitadas toda semana)
// A = "Rótulo da Última Rodada" (estática)  ·  B = "Letreiro Neon" (vídeo 8s, sem áudio)
// A palavra LISTA é a heroína: no STORY o CTA é RESPONDA "LISTA"; no FEED/REELS é COMENTE "LISTA".

export type FmtLista = "feed" | "story";

const R = regraDia("domingo");
const SLOGAN = "TE VEJO NA ESQUINA";

// "LISTA FEM. FREE ATÉ 23H" → { quem: "FEMININO", valor: "FREE", ate: "23H" }
const regra = (s: string) => {
  const [antes, ate] = s.replace(/^LISTA /, "").split(" ATÉ ");
  const [gen, ...v] = antes.split(" ");
  return { quem: gen.startsWith("FEM") ? "FEMININO" : "MASCULINO", curto: gen, valor: v.join(" "), ate };
};
const REGRAS = [regra(R.lista[0]), regra(R.lista[1])];

// ícones de interface (viewBox 24): balão de comentário e aviãozinho de enviar do Instagram
const Balao: React.FC<{ size: number; color: string; stroke?: number }> = ({ size, color, stroke = 2.2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block", flex: "0 0 auto", overflow: "visible" }}>
    <path d="M20.66 17A9.5 9.5 0 1 0 17.3 20.2L21.5 21.5z" fill="none" stroke={color} strokeWidth={stroke} strokeLinejoin="round" />
  </svg>
);
const Aviao: React.FC<{ size: number; color: string; stroke?: number }> = ({ size, color, stroke = 2.2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block", flex: "0 0 auto", overflow: "visible" }}>
    <path d="M22 3 9.2 10.1M22 3l-7 18-5.8-10.9L2 6.5z" fill="none" stroke={color} strokeWidth={stroke} strokeLinejoin="round" strokeLinecap="round" />
  </svg>
);
const Elo: React.FC<{ size: number; color: string; stroke?: number }> = ({ size, color, stroke = 2.2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block", flex: "0 0 auto", overflow: "visible" }}>
    <path d="M10 14a4.5 4.5 0 0 0 6.4.4l3-3a4.5 4.5 0 0 0-6.4-6.4l-1.2 1.2" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" />
    <path d="M14 10a4.5 4.5 0 0 0-6.4-.4l-3 3a4.5 4.5 0 0 0 6.4 6.4l1.2-1.2" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" />
  </svg>
);
const Coracao: React.FC<{ size: number; color: string; stroke?: number }> = ({ size, color, stroke = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block", flex: "0 0 auto", overflow: "visible" }}>
    <path d="M12 20.5s-8.5-5.2-8.5-11A4.8 4.8 0 0 1 12 6.6a4.8 4.8 0 0 1 8.5 2.9c0 5.8-8.5 11-8.5 11z" fill="none" stroke={color} strokeWidth={stroke} strokeLinejoin="round" />
  </svg>
);

// =====================================================================================
// ARTE A — "Rótulo da Última Rodada": âmbar, creme e cobre; o rótulo da bebida se chama LISTA
// =====================================================================================
const ESP = "#140A05";
const AMB = "#F29A2E";
const QUE = "#D9541E";
const CRE = "#F4E8D2";
const OUR = "#E8B560";

const FundoA: React.FC<{ cx: number; cy: number }> = ({ cx, cy }) => (
  <>
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at ${cx}px ${cy}px, #7A3210 0%, #3A170A 38%, #170B06 72%, ${ESP} 100%)` }} />
    <AbsoluteFill
      style={{
        background: `repeating-conic-gradient(from 3deg at ${cx}px ${cy}px, rgba(242,154,46,.14) 0deg 5deg, rgba(242,154,46,0) 5deg 12deg)`,
        WebkitMaskImage: `radial-gradient(circle at ${cx}px ${cy}px, #000 0%, rgba(0,0,0,.55) 38%, transparent 75%)`,
      }}
    />
    <AbsoluteFill style={{ backgroundImage: "repeating-linear-gradient(90deg, rgba(244,232,210,.035) 0 2px, transparent 2px 22px)" }} />
  </>
);

// moldura dupla com losangos nos cantos (igual à identidade A)
const MolduraA: React.FC<{ w: number; h: number; inset: number }> = ({ w, h, inset }) => {
  const d = (x: number, y: number) => <div style={{ position: "absolute", left: x - 9, top: y - 9, width: 18, height: 18, background: OUR, transform: "rotate(45deg)" }} />;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: inset, top: inset, width: w - inset * 2, height: h - inset * 2, border: "2px solid rgba(232,181,96,.8)" }} />
      <div style={{ position: "absolute", left: inset + 10, top: inset + 10, width: w - inset * 2 - 20, height: h - inset * 2 - 20, border: "1px solid rgba(232,181,96,.45)" }} />
      {d(inset, inset)}
      {d(w - inset, inset)}
      {d(inset, h - inset)}
      {d(w - inset, h - inset)}
    </AbsoluteFill>
  );
};

const LinhaA: React.FC<{ text: string; top: number; size: number; w: number; cor?: string }> = ({ text, top, size, w, cor = CRE }) => (
  <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 18 }}>
    <div style={{ width: w, height: 1.5, background: OUR }} />
    <div style={{ fontFamily: ARCHIVO, fontWeight: 700, fontSize: size, letterSpacing: "0.38em", color: cor, paddingLeft: "0.38em", whiteSpace: "nowrap" }}>{text}</div>
    <div style={{ width: w, height: 1.5, background: OUR }} />
  </div>
);

const SaideiraA: React.FC<{ top: number; size: number }> = ({ top, size }) => (
  <div style={{ position: "absolute", top, left: 0, right: 0, textAlign: "center" }}>
    <div
      style={{
        display: "inline-block", fontFamily: FRAUNCES, fontStyle: "italic", fontWeight: 900, fontSize: size, lineHeight: 1, color: CRE, letterSpacing: "-0.02em", paddingRight: 24,
        textShadow: `4px 5px 0 ${QUE}, 9px 11px 0 rgba(0,0,0,.45), 0 0 50px rgba(242,154,46,.35)`,
      }}
    >
      Saideira
    </div>
  </div>
);

const DaSemanaA: React.FC<{ top: number; size: number }> = ({ top, size }) => (
  <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 20 }}>
    <div style={{ width: 90, height: 2, background: AMB }} />
    <div style={{ fontFamily: FRAUNCES, fontStyle: "italic", fontWeight: 400, fontSize: size, lineHeight: 1.1, color: AMB }}>da Semana</div>
    <div style={{ width: 90, height: 2, background: AMB }} />
  </div>
);

// contorno de rótulo com cantos côncavos (recorte clássico de rótulo de bebida)
const rotuloPath = (x: number, y: number, w: number, h: number, r: number) =>
  `M ${x + r} ${y} H ${x + w - r} A ${r} ${r} 0 0 0 ${x + w} ${y + r} V ${y + h - r} A ${r} ${r} 0 0 0 ${x + w - r} ${y + h} H ${x + r} A ${r} ${r} 0 0 0 ${x} ${y + h - r} V ${y + r} A ${r} ${r} 0 0 0 ${x + r} ${y} Z`;

// o rótulo-herói: COMENTE / RESPONDA + "LISTA" + como funciona
const Rotulo: React.FC<{ x: number; y: number; w: number; h: number; verbo: string; apoio: string; listaSize: number; verboSize: number; apoioSize: number; icone: "balao" | "aviao" }> = ({
  x, y, w, h, verbo, apoio, listaSize, verboSize, apoioSize, icone,
}) => {
  const r = 48;
  const Icon = icone === "balao" ? Balao : Aviao;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, transform: "rotate(-1.4deg)", filter: "drop-shadow(0 24px 30px rgba(0,0,0,.6))" }}>
      <svg width={w} height={h} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <linearGradient id="papelLista" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FCF5E8" />
            <stop offset="0.55" stopColor="#F4E8D2" />
            <stop offset="1" stopColor="#E6CFA6" />
          </linearGradient>
          <radialGradient id="manchaLista" cx="0.5" cy="0.45" r="0.7">
            <stop offset="0.6" stopColor="rgba(160,90,30,0)" />
            <stop offset="1" stopColor="rgba(160,90,30,.22)" />
          </radialGradient>
        </defs>
        <path d={rotuloPath(0, 0, w, h, r)} fill="url(#papelLista)" />
        <path d={rotuloPath(0, 0, w, h, r)} fill="url(#manchaLista)" />
        <path d={rotuloPath(16, 16, w - 32, h - 32, r - 6)} fill="none" stroke={QUE} strokeWidth={3.5} />
        <path d={rotuloPath(25, 25, w - 50, h - 50, r - 10)} fill="none" stroke={OUR} strokeWidth={1.6} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: ESP }}>
        <div style={{ display: "flex", alignItems: "center", gap: verboSize * 0.35 }}>
          <Icon size={verboSize * 1.15} color={QUE} stroke={2.4} />
          <div style={{ fontFamily: ARCHIVO, fontWeight: 900, fontSize: verboSize, lineHeight: 1, letterSpacing: "0.3em", paddingLeft: "0.3em", color: QUE }}>{verbo}</div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", marginTop: listaSize * 0.04 }}>
          <span style={{ fontFamily: FRAUNCES, fontStyle: "italic", fontWeight: 900, fontSize: listaSize * 0.5, lineHeight: 1, color: QUE, marginTop: listaSize * 0.01, marginRight: listaSize * -0.01 }}>“</span>
          <span style={{ fontFamily: FRAUNCES, fontWeight: 900, fontSize: listaSize, lineHeight: 0.98, letterSpacing: "-0.02em", color: ESP, textShadow: `${listaSize * 0.022}px ${listaSize * 0.026}px 0 ${QUE}` }}>LISTA</span>
          <span style={{ fontFamily: FRAUNCES, fontStyle: "italic", fontWeight: 900, fontSize: listaSize * 0.5, lineHeight: 1, color: QUE, marginTop: listaSize * 0.01, marginLeft: listaSize * 0.01 }}>”</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: apoioSize * 0.35 }}>
          <div style={{ width: 46, height: 2, background: QUE }} />
          <div style={{ fontFamily: FRAUNCES, fontStyle: "italic", fontWeight: 600, fontSize: apoioSize, lineHeight: 1.1, color: ESP }}>{apoio}</div>
          <div style={{ width: 46, height: 2, background: QUE }} />
        </div>
      </div>
    </div>
  );
};

// faixa (fita) de rótulo
const FaixaA: React.FC<{ text: string; cx: number; top: number; w: number }> = ({ text, cx, top, w }) => {
  const h = w * 0.17;
  return (
    <div style={{ position: "absolute", left: cx - w / 2, top, width: w, height: h, filter: "drop-shadow(0 14px 18px rgba(0,0,0,.55))" }}>
      <svg width={w} height={h} viewBox="0 0 700 119" preserveAspectRatio="none" style={{ position: "absolute", inset: 0 }}>
        <polygon points="0,30 110,30 110,115 0,115 34,72" fill="#2A1208" />
        <polygon points="700,30 590,30 590,115 700,115 666,72" fill="#2A1208" />
        <polygon points="70,92 110,115 110,92" fill="#0E0603" />
        <polygon points="630,92 590,115 590,92" fill="#0E0603" />
        <rect x="60" y="4" width="580" height="88" fill="#3E1B0B" />
        <rect x="60" y="11" width="580" height="2" fill={OUR} />
        <rect x="60" y="83" width="580" height="2" fill={OUR} />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.04, height: h * 0.74, display: "flex", alignItems: "center", justifyContent: "center", gap: h * 0.18, fontFamily: FRAUNCES, fontWeight: 600, fontSize: h * 0.36, letterSpacing: "0.12em", color: CRE, whiteSpace: "nowrap" }}>
        <span style={{ color: OUR, fontSize: h * 0.22 }}>◆</span>
        {text}
        <span style={{ color: OUR, fontSize: h * 0.22 }}>◆</span>
      </div>
    </div>
  );
};

// selo redondo de cobre: "a partir das 22H"
const SeloA: React.FC<{ x: number; y: number; d: number }> = ({ x, y, d }) => {
  const txt = `${R.diaSemana} ● ${R.noite.toUpperCase()} ● `;
  const circ = 2 * Math.PI * 74 - 4;
  return (
    <div style={{ position: "absolute", left: x - d / 2, top: y - d / 2, width: d, height: d, transform: "rotate(-10deg)" }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: `radial-gradient(circle at 35% 30%, #FFC56E, ${AMB} 45%, #B9571A 100%)`, boxShadow: `0 16px 30px rgba(0,0,0,.55), inset 0 0 0 5px rgba(20,10,5,.85), inset 0 0 0 8px ${OUR}` }} />
      <svg width={d} height={d} viewBox="0 0 200 200" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <path id="circListaA" d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0" />
        </defs>
        <text fontFamily={ARCHIVO} fontWeight={800} fontSize="13" fill={ESP} textLength={circ} lengthAdjust="spacing">
          <textPath href="#circListaA" textLength={circ} lengthAdjust="spacing">{txt}</textPath>
        </text>
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: ESP, transform: "rotate(10deg)" }}>
        <div style={{ fontFamily: FRAUNCES, fontStyle: "italic", fontWeight: 600, fontSize: d * 0.105, lineHeight: 1 }}>a partir das</div>
        <div style={{ fontFamily: FRAUNCES, fontWeight: 900, fontSize: d * 0.3, lineHeight: 0.95 }}>{R.hora}</div>
      </div>
    </div>
  );
};

// canhoto de ingresso com as regras da lista
const IngressoA: React.FC<{ x: number; y: number; w: number; h: number; k: number }> = ({ x, y, w, h, k }) => {
  const notch = `radial-gradient(circle at 0 50%, transparent 20px, #000 21px) left / 51% 100% no-repeat, radial-gradient(circle at 100% 50%, transparent 20px, #000 21px) right / 51% 100% no-repeat`;
  const stub = h * 0.62;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, transform: "rotate(1deg)", filter: "drop-shadow(0 16px 22px rgba(0,0,0,.55))" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #F7EDDA, #EBD9B8)", WebkitMask: notch, mask: notch, display: "flex" }}>
        <div style={{ width: stub, display: "flex", alignItems: "center", justifyContent: "center", borderRight: "3px dashed rgba(20,10,5,.35)" }}>
          <div style={{ transform: "rotate(-90deg)", whiteSpace: "nowrap", fontFamily: ARCHIVO, fontWeight: 900, fontSize: 24 * k, letterSpacing: "0.24em", color: QUE }}>ENTRADA</div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: `0 ${28 * k}px`, color: ESP }}>
          <div style={{ display: "flex", alignItems: "stretch" }}>
            {REGRAS.map((g, i) => (
              <div key={g.quem} style={{ flex: 1, textAlign: "center", borderLeft: i ? "2px dotted rgba(20,10,5,.35)" : undefined }}>
                <div style={{ fontFamily: ARCHIVO, fontWeight: 800, fontSize: 21 * k, letterSpacing: "0.22em", paddingLeft: "0.22em", color: QUE }}>LISTA {g.quem}</div>
                <div style={{ fontFamily: FRAUNCES, fontWeight: 900, fontSize: 66 * k, lineHeight: 1.02 }}>{g.valor}</div>
                <div style={{ fontFamily: FRAUNCES, fontStyle: "italic", fontWeight: 600, fontSize: 27 * k, lineHeight: 1.1 }}>até às {g.ate.toLowerCase()}</div>
              </div>
            ))}
          </div>
          <div style={{ height: 2, background: "rgba(20,10,5,.18)", margin: `${12 * k}px 0 ${10 * k}px` }} />
          <div style={{ fontFamily: ARCHIVO, fontWeight: 600, fontSize: 20 * k, lineHeight: 1.25, textAlign: "center", opacity: 0.82 }}>{R.obs}</div>
        </div>
      </div>
    </div>
  );
};

// réplica do campo de resposta do story (só no STORY), apontando para o campo de verdade logo abaixo
const RespostaA: React.FC<{ top: number; w: number; h: number }> = ({ top, w, h }) => (
  <div style={{ position: "absolute", top, left: 540 - w / 2, width: w }}>
    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
      <div style={{ flex: 1, height: h, borderRadius: h / 2, border: `3px solid ${CRE}`, background: "rgba(20,10,5,.55)", display: "flex", alignItems: "center", padding: `0 ${h * 0.38}px`, boxShadow: "0 12px 26px rgba(0,0,0,.5)" }}>
        <span style={{ fontFamily: ARCHIVO, fontWeight: 900, fontSize: h * 0.42, letterSpacing: "0.1em", color: CRE }}>LISTA</span>
        <div style={{ width: 4, height: h * 0.5, background: AMB, marginLeft: 6 }} />
      </div>
      <div style={{ width: h, height: h, borderRadius: "50%", background: `radial-gradient(circle at 35% 30%, #FFC56E, ${AMB} 50%, #B9571A 100%)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 26px rgba(0,0,0,.5)" }}>
        <Aviao size={h * 0.5} color={ESP} stroke={2.4} />
      </div>
    </div>
    {/* setinhas apontando para o campo de resposta de verdade, logo abaixo */}
    <div style={{ display: "flex", justifyContent: "center", gap: 26, marginTop: 14 }}>
      {[0.45, 0.8, 0.45].map((o, i) => (
        <svg key={i} width={34} height={20} viewBox="0 0 34 20" style={{ opacity: o }}>
          <path d="M3 3l14 13L31 3" fill="none" stroke={OUR} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ))}
    </div>
  </div>
);

export const ListaDomingoA: React.FC<{ fmt: FmtLista }> = ({ fmt }) => {
  const feed = fmt === "feed";
  const w = 1080;
  const h = feed ? 1350 : 1920;
  // posições: STORY com as informações entre y=200 e y=1700
  const L = feed
    ? { frame: 26, logoTop: 50, logoW: 200, lineY: 104, lineSize: 17, titleY: 128, titleSize: 158, semY: 298, semSize: 46, rotY: 378, rotH: 440, listaSize: 222, verboSize: 44, apoioSize: 38, faixaY: 786, faixaW: 560, seloX: 915, seloY: 392, seloD: 196, tkY: 912, tkH: 262, k: 1, sloganY: 1234, fundoY: 600 }
    : { frame: 30, logoTop: 214, logoW: 230, lineY: 276, lineSize: 19, titleY: 306, titleSize: 196, semY: 518, semSize: 56, rotY: 622, rotH: 520, listaSize: 240, verboSize: 50, apoioSize: 36, faixaY: 1096, faixaW: 640, seloX: 912, seloY: 636, seloD: 220, tkY: 1234, tkH: 280, k: 1.1, sloganY: 1550, fundoY: 860 };
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: ESP }}>
      <FundoA cx={540} cy={L.fundoY} />
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(20,10,5,.55) 0%, rgba(20,10,5,0) 18%, rgba(20,10,5,0) 62%, rgba(20,10,5,.7) 100%)` }} />
      <MolduraA w={w} h={h} inset={L.frame} />
      <Logo width={L.logoW} top={L.logoTop} />
      <LinhaA text="A ÚLTIMA RODADA DA SEMANA" top={L.lineY} size={L.lineSize} w={70} />
      <SaideiraA top={L.titleY} size={L.titleSize} />
      <DaSemanaA top={L.semY} size={L.semSize} />
      <Rotulo
        x={70} y={L.rotY} w={940} h={L.rotH}
        verbo={feed ? "COMENTE" : "RESPONDA"}
        apoio={feed ? "e receba o link no direct" : "a este story e receba o link no direct"}
        listaSize={L.listaSize} verboSize={L.verboSize} apoioSize={L.apoioSize}
        icone={feed ? "balao" : "aviao"}
      />
      <FaixaA text={`TODO ${R.diaSemana}`} cx={540} top={L.faixaY} w={L.faixaW} />
      <SeloA x={L.seloX} y={L.seloY} d={L.seloD} />
      <IngressoA x={70} y={L.tkY} w={940} h={L.tkH} k={L.k} />
      <LinhaA text={SLOGAN} top={L.sloganY} size={feed ? 22 : 26} w={feed ? 80 : 90} cor={OUR} />
      {!feed && <RespostaA top={1602} w={760} h={78} />}
      <Grain opacity={0.14} />
      <Vignette strength={0.5} />
    </AbsoluteFill>
  );
};

// =====================================================================================
// ARTE B — "Letreiro Neon": parede de tijolo; LISTA escrita em néon lima; celular em néon
// =====================================================================================
const ROSA = "#FF3EA5";
const AZUL = "#36C9FF";
const AMBN = "#FFB23E";
const QUENTE = "#FFF1DC";
const LIMA = "#C8D200";
const NUCLEO = "#F6FFC2";

const glow = (c: string, k = 1) => `drop-shadow(0 0 ${2 * k}px ${c}) drop-shadow(0 0 ${8 * k}px ${c}) drop-shadow(0 0 ${22 * k}px ${c})`;

// néon (função pura, dá pra usar em laço): apagado até ligar, pisca ao acender, falha de vez em quando;
// fica firme entre os quadros 165 e 195 (o quadro 180 vira a arte estática)
const neon = (frame: number, liga: number, seed: number) => {
  if (frame < liga) return 0.05;
  const t = frame - liga;
  if (t < 10) return rnd(seed * 17 + t) > 0.45 ? 1 : 0.18;
  if (frame >= 165 && frame <= 195) return 1;
  const ciclo = (frame + Math.floor(rnd(seed) * 90)) % 120;
  if (ciclo < 3 && rnd(seed + frame) > 0.35) return 0.4;
  return 1;
};
// traço sendo desenhado: visível enquanto desenha, depois segue o néon
const vis = (draw: number, on: number) => Math.max(on, draw > 0 && draw < 1 ? 1 : 0.05);

const Parede: React.FC<{ glows: { x: number; y: number; c: string; r: number; k?: number }[] }> = ({ glows }) => (
  <>
    <AbsoluteFill>
      <svg width="100%" height="100%">
        <defs>
          <pattern id="tijoloLista" width="210" height="84" patternUnits="userSpaceOnUse">
            <rect width="210" height="84" fill="#26121a" />
            <rect x="3" y="3" width="99" height="36" fill="#2d161e" />
            <rect x="108" y="3" width="99" height="36" fill="#29141b" />
            <rect x="-52" y="45" width="99" height="36" fill="#2b151d" />
            <rect x="55" y="45" width="99" height="36" fill="#301820" />
            <rect x="160" y="45" width="99" height="36" fill="#28131a" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#tijoloLista)" />
      </svg>
    </AbsoluteFill>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(10,4,8,.05) 0%, rgba(10,4,8,.72) 80%)" }} />
    {glows.map((g, i) => (
      <AbsoluteFill key={i} style={{ opacity: g.k ?? 1, background: `radial-gradient(circle at ${g.x}px ${g.y}px, ${g.c}55 0%, ${g.c}00 ${g.r}px)`, mixBlendMode: "screen" }} />
    ))}
  </>
);

// "Saideira" em néon manuscrito (Yellowtail), traço sendo escrito
const SaideiraNeon: React.FC<{ y: number; size: number; liga: number }> = ({ y, size, liga }) => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame - liga, [0, 28], [0, 1], clamp);
  const on = neon(frame, liga + 28, 7);
  const W = size * 4.2;
  return (
    <svg width={W} height={size * 1.3} style={{ position: "absolute", left: 540 - W / 2, top: y, overflow: "visible", filter: glow(LIMA, 1.2), opacity: vis(draw, on) }}>
      <text x={W / 2} y={size} textAnchor="middle" fontFamily={YELLOWTAIL} fontSize={size} fill="rgba(200,210,0,.16)" stroke={NUCLEO} strokeWidth={size * 0.028} strokeDasharray={size * 6} strokeDashoffset={size * 6 * (1 - draw)} strokeLinejoin="round">
        Saideira
      </text>
    </svg>
  );
};

// letreiro de letras que acendem uma a uma (HTML)
const Letreiro: React.FC<{ text: string; top: number; size: number; cor: string; nucleo: string; liga: number; seed: number; font?: string; weight?: number; spacing?: number; passo?: number; left?: number; width?: number; k?: number }> = ({
  text, top, size, cor, nucleo, liga, seed, font = BARLOW, weight = 800, spacing = 0.16, passo = 2, left = 0, width = 1080, k = 1,
}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left, width, top, display: "flex", justifyContent: "center", filter: glow(cor, k), whiteSpace: "pre" }}>
      {text.split("").map((c, i) => (
        <span key={i} style={{ fontFamily: font, fontWeight: weight, fontSize: size, lineHeight: 1, color: nucleo, letterSpacing: `${spacing}em`, opacity: c === " " ? 1 : neon(frame, liga + i * passo, seed + i * 3) }}>
          {c}
        </span>
      ))}
    </div>
  );
};

// A HEROÍNA: "LISTA" escrita em néon letra por letra, com varredura de brilho
const LISTA_LIGA = 34;
const LISTA_PASSO = 8;
const LISTA_TRACO = 16;
const LISTA_PRONTA = LISTA_LIGA + 4 * LISTA_PASSO + LISTA_TRACO; // quadro em que a última letra acende

const ListaNeon: React.FC<{ top: number; size: number }> = ({ top, size }) => {
  const frame = useCurrentFrame();
  const letras = "LISTA".split("");
  const W = size * 2.6;
  const H = size * 1.05;
  const base = size * 0.86;
  const dash = size * 5;
  // varredura de brilho (entra depois de tudo aceso e repete)
  const sweep = (a: number) => interpolate(frame, [a, a + 30], [-0.4, 1.4], clamp);
  const sx = frame < 190 ? sweep(128) : sweep(205);
  return (
    <svg width={W} height={H} style={{ position: "absolute", left: 540 - W / 2, top, overflow: "visible", filter: glow(LIMA, size / 190) }}>
      <defs>
        <linearGradient id="varreLista" gradientUnits="userSpaceOnUse" x1={W * (sx - 0.18)} y1={0} x2={W * (sx + 0.18)} y2={size * 0.3}>
          <stop offset="0" stopColor="#fff" stopOpacity={0} />
          <stop offset="0.5" stopColor="#fff" stopOpacity={0.85} />
          <stop offset="1" stopColor="#fff" stopOpacity={0} />
        </linearGradient>
      </defs>
      {/* tubos apagados (vidro) */}
      <text x={W / 2} y={base} textAnchor="middle" fontFamily={ANTON} fontSize={size} letterSpacing={size * 0.03} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth={size * 0.02}>
        LISTA
      </text>
      {/* tubos acesos: cada letra se desenha e acende no seu tempo */}
      <text x={W / 2} y={base} textAnchor="middle" fontFamily={ANTON} fontSize={size} letterSpacing={size * 0.03} strokeWidth={size * 0.024} strokeLinejoin="round">
        {letras.map((c, i) => {
          const t0 = LISTA_LIGA + i * LISTA_PASSO;
          const draw = interpolate(frame - t0, [0, LISTA_TRACO], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
          const on = neon(frame, t0 + LISTA_TRACO, 40 + i * 7);
          const aceso = frame >= t0 + LISTA_TRACO ? on : 0;
          return (
            <tspan key={i} fill={LIMA} fillOpacity={aceso > 0 ? 0.1 + 0.22 * aceso : 0} stroke={NUCLEO} strokeOpacity={vis(draw, on)} strokeDasharray={dash} strokeDashoffset={dash * (1 - draw)}>
              {c}
            </tspan>
          );
        })}
      </text>
      {/* brilho que passa */}
      {frame > LISTA_PRONTA && (
        <text x={W / 2} y={base} textAnchor="middle" fontFamily={ANTON} fontSize={size} letterSpacing={size * 0.03} fill="url(#varreLista)" stroke="url(#varreLista)" strokeWidth={size * 0.024} opacity={0.9}>
          LISTA
        </text>
      )}
    </svg>
  );
};

// faíscas: cada letra da LISTA solta um estouro de fagulhas ao acender
const CENTROS = [-0.855, -0.527, -0.142, 0.333, 0.797]; // centro de cada letra (em "size", a partir do meio)
const Faiscas: React.FC<{ top: number; size: number }> = ({ top, size }) => {
  const frame = useCurrentFrame();
  const k = size / 330;
  const cy = top + size * 0.43;
  return (
    <>
      {CENTROS.flatMap((dx, i) => {
        const t = frame - (LISTA_LIGA + i * LISTA_PASSO + LISTA_TRACO);
        if (t < 0 || t > 22) return [];
        return Array.from({ length: 14 }, (_, j) => {
          const a = rnd(i * 97 + j * 13) * Math.PI * 2;
          const v = (4 + rnd(i * 53 + j * 7) * 9) * k;
          const x = 540 + dx * size + Math.cos(a) * v * t;
          const y = cy + Math.sin(a) * v * t + 0.35 * k * t * t;
          const r = (3 + rnd(i * 11 + j) * 4) * k;
          const o = interpolate(t, [0, 3, 22], [0, 1, 0], clamp);
          return <div key={`${i}-${j}`} style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: "50%", background: "#FFFFF0", opacity: o, boxShadow: `0 0 ${6 * k}px ${LIMA}, 0 0 ${14 * k}px ${LIMA}` }} />;
        });
      })}
    </>
  );
};

const IconeNeon: React.FC<{ i: Icone; x: number; y: number; size: number; cor: string; liga: number; seed: number; rot?: number }> = ({ i, x, y, size, cor, liga, seed, rot = 0 }) => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame - liga, [0, 16], [0, 1], clamp);
  const on = neon(frame, liga + 16, seed);
  return (
    <div style={{ position: "absolute", left: x - size / 2, top: y - size / 2, transform: `rotate(${rot + Math.sin(frame / 40 + seed) * 2}deg)`, opacity: vis(draw, on) }}>
      <Ico i={i} size={size} color="#FFFFFF" stroke={1.1} glow={cor} draw={draw} />
    </div>
  );
};

// o "O" oficial em néon lima (avatar do @obutiquim dentro do celular)
const AvatarO: React.FC<{ d: number; on?: number }> = ({ d, on = 1 }) => (
  <div style={{ width: d, height: d, borderRadius: "50%", border: `2px solid ${LIMA}`, background: "#120810", display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto", opacity: on }}>
    <svg width={d * 0.66} height={d * 0.66 * (1671 / 2000)} viewBox="0 0 2000 1671" style={{ overflow: "visible", filter: `drop-shadow(0 0 3px ${LIMA})` }}>
      <path d={O_PATH} fill={NUCLEO} fillRule="evenodd" />
    </svg>
  </div>
);

const Cursor: React.FC<{ h: number; cor: string }> = ({ h, cor }) => {
  const frame = useCurrentFrame();
  return <div style={{ width: 3, height: h, background: cor, marginLeft: 3, opacity: frame % 20 < 11 ? 1 : 0, boxShadow: `0 0 6px ${cor}` }} />;
};

// tempos do celular (quadros)
const CEL = 40; // corpo começa a se desenhar
const DIGITA = 64; // começa a digitar LISTA
const LETRA = 6; // quadros por letra
const ENVIA = DIGITA + 5 * LETRA + 6; // 100: toca em Publicar / Enviar

const digitado = (frame: number) => "LISTA".slice(0, Math.max(0, Math.min(5, Math.floor((frame - DIGITA) / LETRA) + 1)));

// linha de comentário (FEED)
const Comentario: React.FC<{ user: string; quando: string; texto: string; cor: string; destaque?: boolean; y: number; o?: number; sc?: number }> = ({ user, quando, texto, cor, destaque, y, o = 1, sc = 1 }) => (
  <div style={{ position: "absolute", left: 14, right: 14, top: y, display: "flex", gap: 11, opacity: o, transform: `scale(${sc})`, transformOrigin: "left center" }}>
    <div style={{ width: 34, height: 34, borderRadius: "50%", border: `2px solid ${cor}`, boxShadow: `0 0 8px ${cor}`, flex: "0 0 auto", background: `radial-gradient(circle at 50% 38%, ${cor}66 0 22%, transparent 24%), radial-gradient(ellipse at 50% 100%, ${cor}55 0 42%, transparent 44%)` }} />
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ fontFamily: ARCHIVO, fontSize: 13, color: "rgba(255,241,220,.62)" }}>
        <span style={{ fontWeight: 800, color: QUENTE }}>{user}</span> {quando}
      </div>
      <div style={{ fontFamily: destaque ? BARLOW : ARCHIVO, fontWeight: destaque ? 800 : 600, fontSize: destaque ? 26 : 16, lineHeight: 1.1, marginTop: 2, color: destaque ? NUCLEO : QUENTE, letterSpacing: destaque ? "0.08em" : 0, textShadow: destaque ? `0 0 6px ${LIMA}, 0 0 16px ${LIMA}` : undefined }}>{texto}</div>
    </div>
  </div>
);

// aviso de direct que desce no topo da tela
const AvisoDirect: React.FC<{ t: number; top: number }> = ({ t, top }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - t, fps, config: { damping: 13, stiffness: 150 } });
  return (
    <div style={{ position: "absolute", left: 10, right: 10, top: interpolate(s, [0, 1], [-110, top]), borderRadius: 18, background: "rgba(30,12,30,.97)", border: `2px solid ${LIMA}`, boxShadow: `0 0 10px ${LIMA}, 0 10px 24px rgba(0,0,0,.6)`, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10, opacity: s > 0.01 ? 1 : 0 }}>
      <AvatarO d={40} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ fontFamily: ARCHIVO, fontSize: 12.5, color: "rgba(255,241,220,.62)" }}>
          <span style={{ fontWeight: 800, color: QUENTE }}>obutiquim</span> · agora
        </div>
        <div style={{ fontFamily: ARCHIVO, fontWeight: 700, fontSize: 15, lineHeight: 1.15, color: QUENTE, marginTop: 1 }}>Aqui está o link da sua lista!</div>
      </div>
      <Elo size={24} color={NUCLEO} stroke={2.4} />
    </div>
  );
};

// tela de comentários (FEED): digita LISTA, publica, e o link chega no direct
const TelaComente: React.FC<{ H: number }> = ({ H }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const txt = digitado(frame);
  const publicado = frame >= ENVIA + 2;
  const pronto = txt.length === 5;
  const aperta = interpolate(frame, [ENVIA - 2, ENVIA, ENVIA + 4], [1, 0.82, 1], clamp);
  const novo = spring({ frame: frame - (ENVIA + 3), fps, config: { damping: 11, stiffness: 160 } });
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #1a0b16, #0e0610)" }}>
      <div style={{ position: "absolute", top: 46, left: 0, right: 0, textAlign: "center", fontFamily: ARCHIVO, fontWeight: 800, fontSize: 17, color: QUENTE }}>Comentários</div>
      <div style={{ position: "absolute", top: 78, left: 0, right: 0, height: 1, background: "rgba(255,241,220,.18)" }} />
      <Comentario user="julia.mga" quando="3 min" texto="bora na saideira!!" cor={ROSA} y={112} />
      <Comentario user="pedro.hs" quando="1 min" texto="LISTA" cor={AZUL} destaque y={180} />
      {publicado && <Comentario user="você" quando="agora" texto="LISTA" cor={LIMA} destaque y={248} o={Math.min(1, novo * 2)} sc={interpolate(novo, [0, 1], [0.6, 1])} />}
      {/* campo de comentário */}
      <div style={{ position: "absolute", left: 10, right: 10, top: H - 72, height: 54, borderRadius: 27, border: `2px solid ${publicado || !pronto ? "rgba(255,241,220,.45)" : NUCLEO}`, boxShadow: pronto && !publicado ? `0 0 10px ${LIMA}` : undefined, display: "flex", alignItems: "center", padding: "0 12px 0 8px", gap: 8 }}>
        <div style={{ width: 34, height: 34, borderRadius: "50%", border: `2px solid ${LIMA}`, flex: "0 0 auto", background: `radial-gradient(circle at 50% 38%, ${LIMA}66 0 22%, transparent 24%), radial-gradient(ellipse at 50% 100%, ${LIMA}55 0 42%, transparent 44%)` }} />
        {txt && !publicado ? (
          <span style={{ fontFamily: BARLOW, fontWeight: 800, fontSize: 28, letterSpacing: "0.08em", color: NUCLEO, textShadow: `0 0 8px ${LIMA}` }}>{txt}</span>
        ) : (
          <span style={{ fontFamily: ARCHIVO, fontWeight: 500, fontSize: 14, color: "rgba(255,241,220,.5)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}>Adicione um comentário...</span>
        )}
        {!publicado && <Cursor h={26} cor={NUCLEO} />}
        <span style={{ flex: 1, minWidth: 6 }} />
        <span style={{ fontFamily: ARCHIVO, fontWeight: 800, fontSize: 15, color: AZUL, flex: "0 0 auto", opacity: pronto && !publicado ? 1 : 0.35, transform: `scale(${aperta})`, textShadow: pronto && !publicado ? `0 0 8px ${AZUL}` : undefined }}>Publicar</span>
      </div>
      <AvisoDirect t={ENVIA + 12} top={32} />
    </AbsoluteFill>
  );
};

// tela do story (STORY): responde LISTA, a tela vira o direct e o link chega
const TelaResponde: React.FC<{ H: number }> = ({ H }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const txt = digitado(frame);
  const pronto = txt.length === 5;
  const aperta = interpolate(frame, [ENVIA - 2, ENVIA, ENVIA + 4], [1, 0.75, 1], clamp);
  const vira = interpolate(frame, [ENVIA + 4, ENVIA + 14], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const resp = spring({ frame: frame - (ENVIA + 22), fps, config: { damping: 13, stiffness: 150 } });
  const card = spring({ frame: frame - (ENVIA + 28), fps, config: { damping: 13, stiffness: 150 } });
  const digitando = frame >= ENVIA + 14 && frame < ENVIA + 22;
  const barra = interpolate(frame, [0, 240], [0.15, 1], clamp);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: 640, height: H, display: "flex", transform: `translateX(${-320 * vira}px)` }}>
        {/* etapa 1: o story com o campo de resposta */}
        <div style={{ position: "relative", width: 320, height: H, background: "radial-gradient(ellipse at 50% 42%, #3a1030 0%, #16070f 70%)" }}>
          <div style={{ position: "absolute", top: 40, left: 10, right: 10, display: "flex", gap: 4 }}>
            {[1, barra, 0].map((p, i) => (
              <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: "rgba(255,255,255,.3)", overflow: "hidden" }}>
                <div style={{ width: `${p * 100}%`, height: "100%", background: "#fff" }} />
              </div>
            ))}
          </div>
          <div style={{ position: "absolute", top: 54, left: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <AvatarO d={32} />
            <span style={{ fontFamily: ARCHIVO, fontWeight: 800, fontSize: 14, color: QUENTE }}>obutiquim</span>
            <span style={{ fontFamily: ARCHIVO, fontSize: 13, color: "rgba(255,241,220,.6)" }}>2 h</span>
          </div>
          <div style={{ position: "absolute", top: 150, left: 0, right: 0, textAlign: "center", fontFamily: YELLOWTAIL, fontSize: 68, color: NUCLEO, textShadow: `0 0 8px ${LIMA}, 0 0 20px ${LIMA}` }}>Saideira</div>
          <div style={{ position: "absolute", top: 236, left: 0, right: 0, textAlign: "center", fontFamily: MONOTON, fontSize: 16, letterSpacing: "0.08em", color: NUCLEO, textShadow: `0 0 6px ${LIMA}` }}>DA SEMANA</div>
          <div style={{ position: "absolute", top: 276, left: 0, right: 0, textAlign: "center", fontFamily: BARLOW, fontWeight: 800, fontSize: 20, letterSpacing: "0.14em", color: "#D8F4FF", textShadow: `0 0 8px ${AZUL}` }}>RESPONDA “LISTA”</div>
          <div style={{ position: "absolute", left: 10, right: 10, top: H - 70, height: 50, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1, height: 50, borderRadius: 25, border: `2px solid ${pronto ? NUCLEO : "rgba(255,255,255,.6)"}`, boxShadow: pronto ? `0 0 10px ${LIMA}` : undefined, display: "flex", alignItems: "center", padding: "0 14px" }}>
              {txt ? (
                <span style={{ fontFamily: BARLOW, fontWeight: 800, fontSize: 28, letterSpacing: "0.08em", color: NUCLEO, textShadow: `0 0 8px ${LIMA}` }}>{txt}</span>
              ) : (
                <span style={{ fontFamily: ARCHIVO, fontWeight: 500, fontSize: 14, color: "rgba(255,255,255,.7)" }}>Enviar mensagem</span>
              )}
              <Cursor h={26} cor={NUCLEO} />
            </div>
            <Coracao size={26} color="#fff" />
            <div style={{ transform: `scale(${aperta})`, filter: pronto ? `drop-shadow(0 0 6px ${LIMA})` : undefined }}>
              <Aviao size={28} color={pronto ? NUCLEO : "#fff"} stroke={2} />
            </div>
          </div>
        </div>
        {/* etapa 2: o direct com o link */}
        <div style={{ position: "relative", width: 320, height: H, background: "linear-gradient(180deg, #1a0b16, #0e0610)" }}>
          <div style={{ position: "absolute", top: 44, left: 12, right: 12, display: "flex", alignItems: "center", gap: 9 }}>
            <span style={{ fontFamily: ARCHIVO, fontWeight: 500, fontSize: 26, color: QUENTE, lineHeight: 1, marginTop: -4 }}>‹</span>
            <AvatarO d={34} />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontFamily: ARCHIVO, fontWeight: 800, fontSize: 15, color: QUENTE }}>obutiquim</span>
              <span style={{ fontFamily: ARCHIVO, fontSize: 11, color: "rgba(255,241,220,.55)" }}>Ativo(a) agora</span>
            </div>
          </div>
          <div style={{ position: "absolute", top: 90, left: 0, right: 0, height: 1, background: "rgba(255,241,220,.15)" }} />
          <div style={{ position: "absolute", top: 104, right: 14, fontFamily: ARCHIVO, fontSize: 11, color: "rgba(255,241,220,.55)" }}>Você respondeu ao story</div>
          <div style={{ position: "absolute", top: 124, right: 14, width: 56, height: 84, borderRadius: 10, border: `2px solid rgba(255,241,220,.35)`, background: "radial-gradient(ellipse at 50% 42%, #3a1030 0%, #16070f 75%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: YELLOWTAIL, fontSize: 16, color: NUCLEO, textShadow: `0 0 6px ${LIMA}` }}>Saideira</div>
          <div style={{ position: "absolute", top: 216, right: 14, padding: "8px 18px", borderRadius: 22, background: LIMA, boxShadow: `0 0 14px ${LIMA}`, fontFamily: BARLOW, fontWeight: 800, fontSize: 28, letterSpacing: "0.08em", color: "#1a1400" }}>LISTA</div>
          {digitando && (
            <div style={{ position: "absolute", top: 282, left: 14, display: "flex", gap: 5, padding: "12px 14px", borderRadius: 20, background: "rgba(255,241,220,.12)" }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: QUENTE, opacity: 0.35 + 0.65 * Math.max(0, Math.sin((frame - i * 3) / 2.2)) }} />
              ))}
            </div>
          )}
          <div style={{ position: "absolute", top: 282, left: 14, width: 236, opacity: Math.min(1, resp * 2), transform: `scale(${interpolate(resp, [0, 1], [0.7, 1])})`, transformOrigin: "left top" }}>
            <div style={{ padding: "10px 14px", borderRadius: 18, background: "rgba(255,241,220,.12)", fontFamily: ARCHIVO, fontWeight: 600, fontSize: 15, lineHeight: 1.25, color: QUENTE }}>Aqui está o link da sua lista!</div>
          </div>
          <div style={{ position: "absolute", top: 340, left: 14, width: 236, opacity: Math.min(1, card * 2), transform: `scale(${interpolate(card, [0, 1], [0.7, 1])})`, transformOrigin: "left top", borderRadius: 16, border: `2px solid ${LIMA}`, boxShadow: `0 0 12px ${LIMA}`, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10, background: "rgba(200,210,0,.08)" }}>
            <Elo size={26} color={NUCLEO} stroke={2.4} />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontFamily: BARLOW, fontWeight: 800, fontSize: 20, letterSpacing: "0.06em", color: NUCLEO }}>ENTRAR NA LISTA</span>
              <span style={{ fontFamily: ARCHIVO, fontSize: 11.5, color: "rgba(255,241,220,.65)" }}>{R.noite} · {R.diaSemana.toLowerCase()}</span>
            </div>
          </div>
          <div style={{ position: "absolute", left: 10, right: 10, top: H - 66, height: 46, borderRadius: 23, border: "2px solid rgba(255,241,220,.25)", display: "flex", alignItems: "center", padding: "0 16px", fontFamily: ARCHIVO, fontSize: 14, color: "rgba(255,241,220,.45)" }}>Mensagem...</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// celular em néon: o corpo se desenha, a tela acende e a interação acontece
const CelularNeon: React.FC<{ x: number; y: number; w: number; h: number; modo: "comente" | "responda"; base?: number }> = ({ x, y, w, h, modo, base = 320 }) => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame - CEL, [0, 20], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const on = neon(frame, CEL + 20, 51);
  const tela = interpolate(frame - (CEL + 16), [0, 8], [0, 1], clamp);
  const pad = 14;
  const sw = w - pad * 2;
  const sh = h - pad * 2;
  const s = sw / base;
  const H = sh / s;
  const r = w * 0.13;
  const flut = Math.sin(frame / 28) * 5;
  return (
    <div style={{ position: "absolute", left: x, top: y + flut, width: w, height: h, transform: "rotate(-3deg)" }}>
      <div style={{ position: "absolute", left: pad, top: pad, width: sw, height: sh, borderRadius: r - 10, overflow: "hidden", opacity: tela * (0.35 + 0.65 * on) }}>
        <div style={{ width: base, height: H, transform: `scale(${s})`, transformOrigin: "0 0", position: "relative" }}>{modo === "comente" ? <TelaComente H={H} /> : <TelaResponde H={H} />}</div>
      </div>
      <svg width={w} height={h} style={{ position: "absolute", inset: 0, overflow: "visible", filter: glow(ROSA, 1.1), opacity: vis(draw, on) }}>
        <rect x={4} y={4} width={w - 8} height={h - 8} rx={r} fill="none" stroke="#FFE1F1" strokeWidth={6} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
        <rect x={w / 2 - w * 0.13} y={pad + 10} width={w * 0.26} height={w * 0.06} rx={w * 0.03} fill="#0a0408" stroke="#FFE1F1" strokeWidth={2.5} opacity={tela} />
        <line x1={w + 1} y1={h * 0.22} x2={w + 1} y2={h * 0.3} stroke="#FFE1F1" strokeWidth={5} strokeLinecap="round" opacity={draw} />
      </svg>
    </div>
  );
};

// placa néon azul com as regras da lista; linhas acendem uma a uma
const PlacaRegras: React.FC<{ x: number; y: number; w: number; k: number; liga: number }> = ({ x, y, w, k, liga }) => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame - liga, [0, 18], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const borda = neon(frame, liga + 18, 61);
  const linhas = [neon(frame, liga + 12, 62), neon(frame, liga + 20, 63), neon(frame, liga + 28, 64)];
  const obs = interpolate(frame - (liga + 34), [0, 12], [0, 1], clamp);
  const hBox = 300 * k;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: hBox }}>
      <svg width={w} height={hBox} style={{ position: "absolute", inset: 0, overflow: "visible", filter: glow(AZUL, 1), opacity: vis(draw, borda) }}>
        <rect x={3} y={3} width={w - 6} height={hBox - 6} rx={22} fill="rgba(54,201,255,.05)" stroke="#D8F4FF" strokeWidth={4.5} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: `0 ${22 * k}px` }}>
        <div style={{ fontFamily: BARLOW, fontWeight: 800, fontSize: 34 * k, lineHeight: 1, letterSpacing: "0.12em", color: "#D8F4FF", filter: glow(AZUL, 0.8), opacity: linhas[0], whiteSpace: "nowrap" }}>
          {R.diaSemana} · A PARTIR DAS {R.hora}
        </div>
        <div style={{ width: "86%", height: 3, background: "#D8F4FF", margin: `${16 * k}px 0 ${12 * k}px`, filter: glow(AZUL, 0.6), opacity: borda }} />
        {REGRAS.map((g, i) => (
          <div key={g.quem} style={{ display: "flex", alignItems: "baseline", gap: 12 * k, opacity: linhas[i + 1], whiteSpace: "nowrap", lineHeight: 1.12 }}>
            <span style={{ fontFamily: BARLOW, fontWeight: 700, fontSize: 36 * k, letterSpacing: "0.06em", color: QUENTE, filter: glow(AMBN, 0.5) }}>{g.curto}</span>
            <span style={{ fontFamily: BARLOW, fontWeight: 800, fontSize: 54 * k, letterSpacing: "0.03em", color: NUCLEO, filter: glow(LIMA, 0.8) }}>{g.valor}</span>
            <span style={{ fontFamily: BARLOW, fontWeight: 700, fontSize: 36 * k, letterSpacing: "0.06em", color: QUENTE, filter: glow(AMBN, 0.5) }}>ATÉ {g.ate}</span>
          </div>
        ))}
        <div style={{ fontFamily: ARCHIVO, fontWeight: 500, fontSize: 17 * k, lineHeight: 1.3, color: QUENTE, opacity: 0.8 * obs, textAlign: "center", marginTop: 12 * k }}>{R.obs}</div>
      </div>
    </div>
  );
};

// setas piscando em sequência (apontam para a ação)
const Setas: React.FC<{ x: number; y: number; dir: "baixo" | "esquerda"; size: number; cor: string; liga: number }> = ({ x, y, dir, size, cor, liga }) => {
  const frame = useCurrentFrame();
  if (frame < liga) return null;
  const on = interpolate(frame - liga, [0, 8], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: x, top: y, display: "flex", flexDirection: dir === "baixo" ? "column" : "row-reverse", alignItems: "center", gap: size * -0.15, filter: glow(cor, 0.7), opacity: on }}>
      {[0, 1, 2].map((i) => {
        const fase = ((frame - liga) / 5 - i) % 3;
        const o = frame >= 165 && frame <= 195 ? 1 - i * 0.25 : fase >= 0 && fase < 1.2 ? 1 : 0.25;
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24" style={{ transform: dir === "baixo" ? "rotate(90deg)" : "rotate(180deg)", opacity: o }}>
            <path d="M8 4l8 8-8 8" fill="none" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      })}
    </div>
  );
};

export const LISTA_B_DUR = 240;

export const ListaDomingoB: React.FC<{ fmt: FmtLista }> = ({ fmt }) => {
  const frame = useCurrentFrame();
  const feed = fmt === "feed";
  // energia da parede: liga no início e dá o "estouro" quando a LISTA acende inteira
  const liga = frame < 12 ? [0.2, 0.7, 0.3, 0.9, 0.5, 1][Math.floor(frame / 2)] : 1;
  const estouro = interpolate(frame, [LISTA_PRONTA, LISTA_PRONTA + 2, LISTA_PRONTA + 18], [0, 1, 0], clamp);
  const tremor = estouro * 7;
  const listaOn = frame < LISTA_LIGA ? 0.1 : Math.min(1, 0.1 + ((frame - LISTA_LIGA) / (LISTA_PRONTA - LISTA_LIGA)) * 0.9) * neon(frame, LISTA_PRONTA, 44);
  const zoom = interpolate(frame, [0, 240], [1.03, 1], clamp);
  const logo = interpolate(frame, [2, 14], [0, 1], clamp);

  const L = feed
    ? { logoTop: 34, logoW: 210, saiY: 56, saiSize: 118, semY: 202, semSize: 30, verboY: 256, verboSize: 60, listaY: 344, listaSize: 330, apoioY: 654, apoioSize: 34, celX: 70, celY: 738, celW: 360, celH: 566, celBase: 280, placaX: 470, placaY: 758, placaW: 560, k: 1, sloganY: 1108, setasX: 446, setasY: 1212, iconeY: 1232 }
    : { logoTop: 214, logoW: 240, saiY: 250, saiSize: 136, semY: 418, semSize: 34, verboY: 492, verboSize: 70, listaY: 598, listaSize: 360, apoioY: 934, apoioSize: 40, celX: 66, celY: 1024, celW: 420, celH: 652, celBase: 320, placaX: 520, placaY: 1044, placaW: 500, k: 0.94, sloganY: 1386, setasX: 750, setasY: 1508, iconeY: 1560 };

  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#0c0508" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom}) translate(${Math.sin(frame * 2.1) * tremor}px, ${Math.cos(frame * 2.7) * tremor}px)`, filter: `brightness(${(0.45 + 0.55 * liga) * (1 + 0.35 * estouro)})` }}>
        <Parede
          glows={[
            { x: 540, y: L.listaY + L.listaSize * 0.5, c: LIMA, r: feed ? 560 : 660, k: listaOn },
            { x: 540, y: L.saiY + 80, c: LIMA, r: 360 },
            { x: L.celX + L.celW / 2, y: L.celY + L.celH / 2, c: ROSA, r: 420, k: neon(frame, CEL + 20, 51) },
            { x: L.placaX + L.placaW / 2, y: L.placaY + 150, c: AZUL, r: 380, k: neon(frame, 88, 61) },
            { x: 130, y: L.listaY + 120, c: AMBN, r: 220 },
          ]}
        />
        <Logo width={L.logoW} top={L.logoTop} opacity={logo} />
        <SaideiraNeon y={L.saiY} size={L.saiSize} liga={6} />
        <Letreiro text="DA SEMANA" top={L.semY} size={L.semSize} cor={LIMA} nucleo={NUCLEO} font={MONOTON} weight={400} spacing={0.08} liga={30} seed={11} passo={1} />
        <Letreiro text={feed ? "COMENTE" : "RESPONDA"} top={L.verboY} size={L.verboSize} cor={ROSA} nucleo="#FFE1F1" liga={22} seed={21} passo={2} spacing={0.24} k={1.1} />
        <ListaNeon top={L.listaY} size={L.listaSize} />
        <Faiscas top={L.listaY} size={L.listaSize} />
        <Letreiro text="E RECEBA O LINK NO DIRECT" top={L.apoioY} size={L.apoioSize} cor={AZUL} nucleo="#E6F8FF" liga={LISTA_PRONTA + 4} seed={31} passo={1} spacing={0.12} k={0.8} />
        <IconeNeon i="chapeu" x={feed ? 116 : 96} y={L.listaY + (feed ? 60 : 150)} size={feed ? 130 : 132} cor={AMBN} liga={18} seed={1} rot={-12} />
        <IconeNeon i="violao" x={feed ? 964 : 986} y={L.listaY + (feed ? 50 : 140)} size={feed ? 140 : 140} cor={AZUL} liga={26} seed={2} rot={12} />
        <IconeNeon i="chope" x={feed ? 720 : 600} y={L.iconeY} size={feed ? 96 : 110} cor={AMBN} liga={52} seed={3} rot={-6} />
        <IconeNeon i="notas" x={feed ? 960 : 972} y={L.iconeY} size={feed ? 90 : 104} cor={ROSA} liga={58} seed={4} rot={8} />
        <CelularNeon x={L.celX} y={L.celY} w={L.celW} h={L.celH} base={L.celBase} modo={feed ? "comente" : "responda"} />
        <PlacaRegras x={L.placaX} y={L.placaY} w={L.placaW} k={L.k} liga={70} />
        <Letreiro text={SLOGAN} left={L.placaX} width={L.placaW} top={L.sloganY} size={feed ? 36 : 38} cor={ROSA} nucleo="#FFE1F1" liga={108} seed={71} passo={1} spacing={0.14} />
        {feed ? (
          <Setas x={L.setasX} y={L.setasY} dir="esquerda" size={40} cor={LIMA} liga={ENVIA + 6} />
        ) : (
          <>
            <Letreiro text="RESPONDA AQUI" left={L.placaX} width={L.placaW} top={L.setasY} size={34} cor={LIMA} nucleo={NUCLEO} liga={112} seed={81} passo={1} spacing={0.14} />
            <Setas x={L.setasX} y={L.setasY + 44} dir="baixo" size={40} cor={LIMA} liga={116} />
          </>
        )}
      </AbsoluteFill>
      <Grain opacity={0.1} />
      <Vignette strength={0.45} />
    </AbsoluteFill>
  );
};
