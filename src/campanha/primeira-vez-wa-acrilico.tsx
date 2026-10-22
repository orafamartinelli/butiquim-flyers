import React, { useContext } from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { Carimbo, F as FK, Logo, Parado } from "./kit";
import { Grain, clamp } from "../shared/fx";
import { B, K, N, URL_PV } from "./primeira-vez-v23";

// Família V3 "O convite" (preto + ouro, Bebas Neue/Nunito, carimbo verde ENTRADA LIBERADA):
//  - cabeçalho de template WhatsApp "Lista Primeira Vez confirmada" (imagem 1910x1000 e vídeo 1280x670)
//  - suporte de acrílico 15x20 cm com o QR da porta (300 dpi, sangria 3 mm)

export const DIMS_WA = { img: { w: 1910, h: 1000 }, vid: { w: 1280, h: 670 } } as const;
export const WA_VID_DUR = 210; // 7 s a 30 fps

// ---------------------------------------------------------------------
// Cabeçalho WhatsApp (desenhado em 1910x1000; o vídeo usa a mesma arte em escala)
// ---------------------------------------------------------------------
const ArteConfirmada: React.FC<{ carimboEm: number }> = ({ carimboEm }) => {
  const parado = useContext(Parado);
  const f = useCurrentFrame();
  // brilho atravessando o ingresso (2 passadas); nas imagens fixas não aparece
  const brilho = (a: number) => interpolate(f, [a, a + 42], [-40, 140], clamp);
  const passes = parado ? [] : [brilho(40), brilho(130)];
  const pulso = parado ? 1 : 0.85 + 0.15 * Math.sin((f / 30) * Math.PI);
  // carimbo: já estampado no 1º quadro (capa), levanta e BATE de novo em ~0,8 s
  let batida: React.CSSProperties = {};
  if (!parado && carimboEm > 0) {
    const sobe = carimboEm - 10;
    if (f >= sobe && f < carimboEm) {
      const p = interpolate(f, [sobe, carimboEm], [0, 1], clamp);
      batida = { opacity: 1 - p, transform: `scale(${1 + 0.5 * p})` };
    } else if (f >= carimboEm) {
      const s = spring({ frame: f - carimboEm, fps: 30, config: { damping: 11, stiffness: 240, mass: 0.7 } });
      batida = { transform: `scale(${interpolate(s, [0, 1], [1.5, 1])})`, opacity: interpolate(s, [0, 0.3], [0.4, 1], clamp) };
    }
  }
  // tremidinha do ingresso no impacto
  const tremor = !parado && carimboEm > 0 && f >= carimboEm && f < carimboEm + 8 ? Math.sin((f - carimboEm) * 2.4) * (8 - (f - carimboEm)) * 0.9 : 0;
  return (
    <AbsoluteFill style={{ background: K.bg }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 62% 70% at 50% 52%, rgba(255,184,0,${0.16 * pulso}), transparent 72%)` }} />
      <Grain opacity={0.07} />
      {/* ingresso */}
      <div style={{ position: "absolute", left: 150, right: 150, top: 92, bottom: 92, transform: `translate(${tremor}px, ${tremor * 0.5}px)` }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(160deg, #1d1a12 0%, ${K.card} 45%, #101010 100%)`,
            border: `5px solid ${K.ouro}`,
            borderRadius: 40,
            overflow: "hidden",
            boxShadow: "0 40px 90px rgba(0,0,0,.65), 0 0 0 14px rgba(255,184,0,.06)",
          }}
        >
          <Grain opacity={0.08} />
          <div style={{ position: "absolute", inset: 22, border: "2px solid rgba(255,184,0,.35)", borderRadius: 26 }} />
          {passes.map((x, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: -100,
                bottom: -100,
                left: `${x}%`,
                width: "22%",
                background: "linear-gradient(90deg, transparent, rgba(255,230,150,.16) 45%, rgba(255,240,190,.26) 50%, rgba(255,230,150,.16) 55%, transparent)",
                transform: "skewX(-18deg)",
              }}
            />
          ))}
        </div>
        {/* furos laterais */}
        {[-1, 1].map((lado) => (
          <div
            key={lado}
            style={{
              position: "absolute",
              top: "50%",
              marginTop: -46,
              [lado < 0 ? "left" : "right"]: -46,
              width: 92,
              height: 92,
              borderRadius: "50%",
              background: K.bg,
              border: `5px solid ${K.ouro}`,
              clipPath: lado < 0 ? "inset(0 0 0 50%)" : "inset(0 50% 0 0)",
            }}
          />
        ))}
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
            <Logo width={250} />
          </div>
          <div style={{ height: 22 }} />
          <B size={196} ls="0.02em" style={{ textAlign: "center", paddingTop: 10 }}>
            LISTA PRIMEIRA VEZ
          </B>
          <B size={286} color={K.ouro} ls="0.03em" style={{ textAlign: "center", marginTop: -6 }}>
            CONFIRMADA
          </B>
        </div>
        {/* carimbo */}
        <div style={{ position: "absolute", right: -10, top: -44, ...batida }}>
          <Carimbo linhas={["Entrada", "liberada"]} cor={K.verde} size={330} rot={-10} start={-90} seed={161} style={{ mixBlendMode: "normal", fontFamily: FK.display, background: "rgba(12,12,12,.55)" }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const WaConfirmadaImg: React.FC = () => <ArteConfirmada carimboEm={0} />;

// vídeo 1280x670: a mesma arte em escala; o carimbo bate em ~1 s
export const WaConfirmadaVideo: React.FC = () => (
  <AbsoluteFill style={{ background: K.bg, overflow: "hidden" }}>
    <div style={{ position: "relative", flexShrink: 0, width: 1910, height: 1000, transform: `scale(${1280 / 1910})`, transformOrigin: "0 0" }}>
      <ArteConfirmada carimboEm={24} />
    </div>
  </AbsoluteFill>
);

// ---------------------------------------------------------------------
// Acrílico 15x20 cm (retrato) — 300 dpi com 3 mm de sangria = 1843x2433 px
// área final 1772x2362; segurança 5 mm (59 px) dentro do corte
// ---------------------------------------------------------------------
export const DIMS_ACR = { w: 1843, h: 2433 } as const;
const MM = 300 / 25.4; // px por mm
const SANGRIA = 3 * MM; // ~35 px
const SEG = SANGRIA + 5 * MM; // ~95 px da borda do arquivo
const QR_LADO = 820; // ~69 mm (mínimo pedido: 50 mm = 591 px)

export const Acrilico: React.FC<{ guias?: boolean }> = ({ guias = false }) => (
  <AbsoluteFill style={{ background: K.bg }}>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 55% at 50% 50%, rgba(255,184,0,.13), transparent 72%)" }} />
    <Grain opacity={0.06} />
    <AbsoluteFill
      style={{
        padding: `${SEG + 30}px ${SEG + 10}px ${SEG + 24}px`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Logo width={430} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <B size={258} ls="0.02em" style={{ paddingTop: 18 }}>
          PRIMEIRA VEZ
        </B>
        <B size={300} color={K.ouro} ls="0.03em">
          AQUI?
        </B>
      </div>
      <div
        style={{
          width: QR_LADO + 110,
          height: QR_LADO + 110,
          background: "#FFFFFF",
          borderRadius: 44,
          border: `8px solid ${K.ouro}`,
          boxShadow: "0 0 0 14px rgba(255,184,0,.08), 0 40px 80px rgba(0,0,0,.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flex: "0 0 auto",
        }}
      >
        <Img src={staticFile("fotos/primeira-vez/qr-porta.svg")} style={{ width: QR_LADO, height: QR_LADO, display: "block" }} />
      </div>
      <N size={88} weight={900} style={{ textAlign: "center", whiteSpace: "nowrap" }}>
        Aponte a câmera e cadastre-se
      </N>
      <div style={{ width: "100%", borderTop: "4px dashed rgba(255,184,0,.5)" }} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        <B size={150} color={K.ouro} ls="0.03em">
          GANHE SEU PASSAPORTE:
        </B>
        <N size={78} weight={800} style={{ textAlign: "center", whiteSpace: "nowrap" }}>
          crédito na 2ª visita e brinde na 3ª
        </N>
      </div>
      <N size={46} weight={700} color={K.cinza} style={{ textAlign: "center" }}>
        {URL_PV}
      </N>
    </AbsoluteFill>
    {guias && (
      <>
        <div style={{ position: "absolute", inset: SANGRIA, border: "3px solid #E5484D" }} />
        <div style={{ position: "absolute", inset: SEG, border: "3px dashed #22C55E" }} />
      </>
    )}
  </AbsoluteFill>
);
