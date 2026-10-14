import React, { useLayoutEffect, useRef, useState } from "react";
import { AbsoluteFill, Img, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from "remotion";
import { ARCHIVO, BIG } from "../fonts";
import { Grain, Logo, Vignette, clamp, useFade, useSpr } from "../shared/fx";
import { RingPx } from "../shared/Ring3D";

// ESTÚDIO — "Aviso": peça avulsa pedida pelo WhatsApp (promo, evento, convidado, aviso da casa).
// Mesma família da Sexta ("Placa de Esquina"): preto + lima, Big Shoulders, placa de rua e o "O" 3D.
const LIMA = "#C8D200";
const LIMA_CLARO = "#D4F53C";
const PRETO = "#0B0B09";
const OSSO = "#F2F0E6";

export type Tom = "promo" | "evento" | "convidado" | "aviso";

export type AvisoProps = {
  titulo: string; // "Final do Paulistão - Camisa do Campeão" → 2ª parte vira a faixa lima
  chamada?: string | null; // a oferta/chamada principal (vai na placa)
  regra?: string | null; // letras miúdas
  data_evento?: string | null; // AAAA-MM-DD
  hora?: string | null; // "22:00" | "22h" | "22H30"
  dia_semana?: string | null; // sobrescreve o calculado pela data
  imagem?: string | null; // URL http(s) ou caminho em public/ (ex.: "estudio/pedido-1.png")
  imagem_modo?: "logo" | "foto" | null;
  tom?: Tom | null;
};

export type FormatoAviso = "feed" | "story";
export const DIM_AVISO: Record<FormatoAviso, { w: number; h: number }> = { feed: { w: 1080, h: 1350 }, story: { w: 1080, h: 1920 } };

const ROTULO: Record<Tom, string> = { promo: "PROMOÇÃO DA CASA", evento: "BORA PRA ESQUINA", convidado: "NA ESQUINA COM", aviso: "FICA LIGADO" };
const SELO: Record<Tom, string> = { promo: "PROMO", evento: "EVENTO", convidado: "CONVIDADO", aviso: "AVISO" };

const DIAS = ["DOMINGO", "SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SÁBADO"];

export const montaData = (p: AvisoProps) => {
  if (!p.data_evento || !/^\d{4}-\d{2}-\d{2}$/.test(p.data_evento)) return null;
  const d = new Date(`${p.data_evento}T12:00:00Z`);
  const hora = (p.hora || "").trim().toUpperCase().replace(/^(\d{1,2})[:H](\d{2})?.*$/, (_m, h, m) => `${h}H${m && m !== "00" ? m : ""}`);
  return {
    dia: String(d.getUTCDate()).padStart(2, "0"),
    mes: String(d.getUTCMonth() + 1).padStart(2, "0"),
    semana: (p.dia_semana || DIAS[d.getUTCDay()]).toUpperCase(),
    hora: /^\d{1,2}H/.test(hora) ? hora : "",
  };
};

// quebra o texto em linhas pela largura ESTIMADA (em) e escolhe o maior corpo que cabe;
// o ajuste fino (se a fonte real ficar mais larga) é feito pelo <Linha> medindo no navegador
const quebra = (texto: string, larg: number, max: number, min: number, maxLinhas: number, em: number) => {
  const palavras = texto.trim().split(/\s+/).filter(Boolean);
  for (let s = max; s >= min; s -= 2) {
    const cab = larg / (s * em);
    const linhas: string[] = [];
    let atual = "";
    for (const w of palavras) {
      const t = atual ? `${atual} ${w}` : w;
      if (t.length <= cab || !atual) atual = t;
      else {
        linhas.push(atual);
        atual = w;
      }
    }
    if (atual) linhas.push(atual);
    if (linhas.length <= maxLinhas && linhas.every((l) => l.length <= cab * 1.04)) return { s, linhas };
  }
  // não coube: corpo mínimo, todas as linhas necessárias
  const cab = larg / (min * em);
  const linhas: string[] = [];
  let atual = "";
  for (const w of palavras) {
    const t = atual ? `${atual} ${w}` : w;
    if (t.length <= cab || !atual) atual = t;
    else {
      linhas.push(atual);
      atual = w;
    }
  }
  if (atual) linhas.push(atual);
  return { s: min, linhas };
};

// uma linha de texto que se espreme (scaleX) se a fonte real passar da largura
const Linha: React.FC<{ larg: number; style: React.CSSProperties; children: string; align?: "center" | "left"; abraca?: boolean }> = ({ larg, style, children, align = "center", abraca }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [k, setK] = useState(1);
  const [handle] = useState(() => delayRender("medindo linha"));
  useLayoutEffect(() => {
    let vivo = true;
    document.fonts.ready.then(() => {
      if (!vivo) return;
      const w = ref.current?.scrollWidth || 0;
      setK(w > larg ? larg / w : 1);
      continueRender(handle);
    });
    return () => {
      vivo = false;
    };
  }, [larg, handle, children]);
  return (
    <div style={{ width: abraca ? undefined : larg, maxWidth: larg, display: "flex", justifyContent: align === "center" ? "center" : "flex-start" }}>
      <span ref={ref} style={{ ...style, whiteSpace: "nowrap", display: "inline-block", transform: `scaleX(${k})`, transformOrigin: align === "center" ? "50% 50%" : "0 50%" }}>
        {children}
      </span>
    </div>
  );
};

const partesTitulo = (t: string) => {
  const m = t.split(/\s+[-–—|:]\s+/);
  return { l1: (m[0] || t).toUpperCase(), l2: m.slice(1).join(" ").toUpperCase() };
};

const Fundo: React.FC<{ cx: number; cy: number }> = ({ cx, cy }) => (
  <>
    <AbsoluteFill style={{ background: PRETO }} />
    <AbsoluteFill style={{ background: `radial-gradient(circle at ${cx}px ${cy}px, rgba(200,210,0,.24) 0%, rgba(200,210,0,0) 50%)` }} />
    <AbsoluteFill
      style={{
        backgroundImage: "radial-gradient(circle, rgba(200,210,0,.55) 1.7px, transparent 2.3px)",
        backgroundSize: "15px 15px",
        WebkitMaskImage: `radial-gradient(circle at ${cx}px ${cy}px, rgba(0,0,0,.9) 0%, rgba(0,0,0,0) 55%)`,
        opacity: 0.35,
      }}
    />
  </>
);

const Slogan: React.FC<{ h: number; topo: number; base: number }> = ({ h, topo, base }) => {
  const alt = h - topo - base;
  return (
    <div style={{ position: "absolute", top: topo + alt / 2 - 12, right: -alt / 2 + 30, width: alt, transform: "rotate(90deg)", textAlign: "center", fontFamily: ARCHIVO, fontWeight: 800, fontSize: 17, letterSpacing: "0.5em", color: LIMA, opacity: 0.8 }}>
      TE VEJO NA ESQUINA ● #NÃOTEMERRO
    </div>
  );
};

// bloco de data ao lado do "O": DIA DA SEMANA / 18.10 / ÀS 22H (alinhado à esquerda, centrado em cy)
const BlocoData: React.FC<{ x: number; cy: number; num: number; d: NonNullable<ReturnType<typeof montaData>>; delay: number; align?: "left" | "center"; w?: number }> = ({ x, cy, num, d, delay, align = "left", w }) => {
  const s = useSpr(delay, { damping: 12 });
  const alt = num * 0.86 + num * 0.2 * 1.2 + (d.hora ? num * 0.26 * 1.3 : 0);
  return (
    <div style={{ position: "absolute", left: x, width: w, top: cy - alt / 2, textAlign: align, opacity: Math.min(1, s * 2), transform: `translateX(${(1 - s) * 260}px)`, color: OSSO, textShadow: "0 10px 30px rgba(0,0,0,.6)" }}>
      <div style={{ fontFamily: ARCHIVO, fontWeight: 900, fontSize: num * 0.2, lineHeight: 1.2, letterSpacing: "0.22em", color: LIMA_CLARO }}>{d.semana}</div>
      <div style={{ fontFamily: BIG, fontWeight: 900, fontSize: num, lineHeight: 0.86 }}>
        {d.dia}.{d.mes}
      </div>
      {d.hora && (
        <div style={{ marginTop: num * 0.06, display: "inline-block", fontFamily: ARCHIVO, fontWeight: 900, fontSize: num * 0.22, lineHeight: 1.2, letterSpacing: "0.16em", background: LIMA, color: PRETO, padding: `0 ${num * 0.07}px`, textShadow: "none" }}>ÀS {d.hora}</div>
      )}
    </div>
  );
};

// imagem do pedido (logo de time/parceiro ou foto) dentro do furo do "O"
const Medalhao: React.FC<{ cx: number; cy: number; diam: number; src: string; modo: "logo" | "foto"; delay: number }> = ({ cx, cy, diam, src, modo, delay }) => {
  const s = useSpr(delay, { damping: 10 });
  const url = /^https?:|^data:/.test(src) ? src : staticFile(src);
  return (
    <div
      style={{
        position: "absolute",
        left: cx - diam / 2,
        top: cy - diam / 2,
        width: diam,
        height: diam,
        borderRadius: "50%",
        overflow: "hidden",
        background: modo === "logo" ? `radial-gradient(circle at 40% 35%, #ffffff 0%, ${OSSO} 60%, #d9d6c8 100%)` : PRETO,
        border: `${Math.round(diam * 0.035)}px solid ${PRETO}`,
        boxShadow: `0 0 0 ${Math.round(diam * 0.02)}px ${LIMA}, 0 30px 60px rgba(0,0,0,.6)`,
        transform: `scale(${s}) rotate(${(1 - s) * -40}deg)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Img src={url} style={modo === "logo" ? { width: "74%", height: "74%", objectFit: "contain" } : { width: "100%", height: "100%", objectFit: "cover" }} />
    </div>
  );
};

const Selo: React.FC<{ x: number; y: number; texto: string; delay: number; size: number }> = ({ x, y, texto, delay, size }) => {
  const s = useSpr(delay, { damping: 12 });
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translateX(${(1 - s) * -320}px)`, opacity: Math.min(1, s * 3), background: PRETO, border: `3px solid ${LIMA}`, borderRadius: 10, padding: "6px 16px 7px", boxShadow: "0 10px 24px rgba(0,0,0,.5)", fontFamily: BIG, fontWeight: 900, fontSize: size, lineHeight: 1, color: LIMA, letterSpacing: "0.08em" }}>
      {texto}
    </div>
  );
};

type Cfg = {
  pad: number; logoTop: number; logoW: number; topo: number; base: number;
  tit: [number, number]; titLin: number; sub: [number, number];
  ofe: [number, number]; ofeLin: number; regra: number; ringMax: number; seloY: number; seloSize: number; numMax: number;
};
const CFG: Record<FormatoAviso, Cfg> = {
  feed: { pad: 70, logoTop: 40, logoW: 220, topo: 128, base: 48, tit: [210, 96], titLin: 2, sub: [54, 34], ofe: [96, 50], ofeLin: 3, regra: 25, ringMax: 560, seloY: 34, seloSize: 34, numMax: 190 },
  story: { pad: 70, logoTop: 220, logoW: 250, topo: 326, base: 225, tit: [230, 104], titLin: 3, sub: [60, 38], ofe: [100, 54], ofeLin: 3, regra: 28, ringMax: 500, seloY: 214, seloSize: 38, numMax: 230 },
};

// grão fixo (sem semente por quadro): no vídeo em CPU o feTurbulence animado custa caro
const GraoFixo: React.FC<{ opacity: number }> = ({ opacity }) => (
  <AbsoluteFill style={{ pointerEvents: "none", opacity, mixBlendMode: "overlay" }}>
    <svg width="100%" height="100%">
      <filter id="grao-fixo">
        <feTurbulence type="fractalNoise" baseFrequency={0.9} numOctaves={2} seed={3} stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grao-fixo)" />
    </svg>
  </AbsoluteFill>
);

// anel: "3d" = Three.js ao vivo (stills); "so-anel" = só o "O" parado em fundo transparente (vira PNG);
// anelSrc = PNG pré-renderizado do "O", animado em 2D (vídeo na nuvem: WebGL por software leva ~3 s/quadro)
export type ExtraAviso = { fmt: FormatoAviso; modoAnel?: "3d" | "so-anel"; anelSrc?: string | null };

export const Aviso: React.FC<AvisoProps & ExtraAviso> = (p) => {
  const { fmt } = p;
  const C = CFG[fmt];
  const { w, h } = DIM_AVISO[fmt];
  const frame = useCurrentFrame();
  const tom: Tom = p.tom || (p.chamada ? "promo" : p.imagem && p.imagem_modo === "foto" ? "convidado" : "evento");
  const d = montaData(p);
  const { l1, l2 } = partesTitulo(p.titulo || "");
  const largTexto = w - 2 * C.pad;

  // ---- medidas (de cima pra baixo) ----
  const tit = quebra(l1, largTexto, C.tit[0], C.tit[1], p.chamada ? C.titLin : C.titLin + 2, 0.47);
  const titLH = 0.9;
  const titH = tit.linhas.length * tit.s * titLH;
  const sub = l2 ? quebra(l2, largTexto - 80, C.sub[0], C.sub[1], 1, 0.66) : null;
  const subH = sub ? sub.s * 1.25 + 26 : 0;

  const chamada = (p.chamada || "").toUpperCase();
  const largPlaca = w - 2 * C.pad + 20;
  const ofe = chamada ? quebra(chamada, largPlaca - 110, C.ofe[0], C.ofe[1], C.ofeLin, 0.45) : null;
  const ofeLH = 1.0;
  const placaH = ofe ? 30 + 18 + ofe.linhas.length * ofe.s * ofeLH + 44 : 0;
  const regra = (p.regra || "").trim();
  const regraLinhas = regra ? Math.ceil((regra.length * C.regra * 0.5) / largTexto) : 0;
  const regraH = regra ? regraLinhas * C.regra * 1.3 + 18 : 0;

  const yTit = C.topo;
  const ySub = yTit + titH + 6;
  const yPlaca = h - C.base - regraH - placaH;
  const yRegra = yPlaca + placaH + 16;
  const zonaTopo = ySub + subH + 10;
  const zona = yPlaca - zonaTopo - 12;
  const ringH = Math.max(260, Math.min(C.ringMax, zona * (p.chamada || d ? 1.02 : 0.8)));
  const ringCy = zonaTopo + zona / 2 + 6;
  const temImg = !!p.imagem;
  // com data: "O" à esquerda e a data à direita; sem data: "O" no centro
  const num = Math.min(C.numMax, zona * 0.52);
  const largData = num * 2.05;
  const gap = 34;
  const ringVis = ringH * 1.12; // largura visível aproximada do "O"
  const ringCx = d ? (w - (ringVis + gap + largData)) / 2 + ringVis / 2 : w / 2;
  const xData = ringCx + ringVis / 2 + gap;

  // ---- movimento ----
  const inn = useSpr(0, { damping: 15, stiffness: 120 });
  const rotY = interpolate(inn, [0, 1], [1.5, 0.22]) + Math.sin(frame / 38) * 0.08;
  const rotX = Math.sin(frame / 55) * 0.05;
  const push = interpolate(frame, [0, 180], [1, 1.03], clamp);
  const placa = useSpr(16, { damping: 10, stiffness: 120 });
  const subS = useSpr(12, { damping: 10, stiffness: 150 });
  const regraO = useFade(28, 40);
  const sw = interpolate(frame, [30, 56], [-40, 140], clamp); // brilho passa uma vez na placa durante a entrada

  if (p.modoAnel === "so-anel")
    return (
      <AbsoluteFill>
        <RingPx width={w} height={h} look="lima" flat cx={ringCx} cy={ringCy} ringH={ringH} rotY={0.22} rotX={0} envIntensity={0.9} />
      </AbsoluteFill>
    );

  // giro do "O" imitado em 2D: scaleX ~ cos(rotY) relativo à pose parada (0.22)
  const giro = Math.max(0.04, Math.cos(rotY) / Math.cos(0.22));
  const anel = p.anelSrc ? (
    <AbsoluteFill style={{ transform: `scale(${push})` }}>
      <AbsoluteFill style={{ transformOrigin: `${ringCx}px ${ringCy}px`, transform: `scale(${interpolate(inn, [0, 1], [0.55, 1])}) scaleX(${giro}) rotate(${Math.sin(frame / 55) * 1.2}deg)` }}>
        <Img src={/^https?:/.test(p.anelSrc) ? p.anelSrc : staticFile(p.anelSrc)} style={{ width: w, height: h }} />
      </AbsoluteFill>
    </AbsoluteFill>
  ) : (
    <AbsoluteFill style={{ transform: `scale(${push})` }}>
      <RingPx width={w} height={h} look="lima" flat cx={ringCx} cy={ringCy} ringH={ringH * interpolate(inn, [0, 1], [0.55, 1])} rotY={rotY} rotX={rotX} envIntensity={0.9} />
    </AbsoluteFill>
  );

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Fundo cx={ringCx} cy={ringCy} />
      {anel}
      {temImg && <Medalhao cx={ringCx} cy={ringCy} diam={ringH * 0.5} src={p.imagem!} modo={p.imagem_modo || "logo"} delay={8} />}
      {d && <BlocoData x={xData} cy={ringCy} num={num} d={d} delay={12} />}

      <Logo width={C.logoW} top={C.logoTop} />
      <Selo x={fmt === "feed" ? 30 : 46} y={C.seloY} texto={SELO[tom]} delay={18} size={C.seloSize} />

      {/* título: letras caindo, como o SEXTA */}
      <div style={{ position: "absolute", top: yTit, left: C.pad }}>
        {tit.linhas.map((l, i) => {
          const pr = interpolate(frame - 2 - i * 4, [0, 10], [0, 1], clamp);
          return (
            <div key={i} style={{ height: tit.s * titLH, display: "flex", alignItems: "center", opacity: pr, transform: `translateY(${(1 - pr) * -tit.s * 0.6}px)` }}>
              <Linha larg={largTexto} style={{ fontFamily: BIG, fontWeight: 900, fontSize: tit.s, lineHeight: 1, color: OSSO, letterSpacing: "-0.005em", textShadow: "0 10px 40px rgba(0,0,0,.55)" }}>
                {l}
              </Linha>
            </div>
          );
        })}
      </div>

      {/* subtítulo na faixa lima inclinada ("DO BUTICA") */}
      {sub && (
        <div style={{ position: "absolute", top: ySub, left: 0, width: w, display: "flex", justifyContent: "center" }}>
          <div style={{ transform: `rotate(-3deg) scale(${subS})`, background: LIMA, padding: "6px 24px 9px", boxShadow: "0 12px 30px rgba(0,0,0,.5)" }}>
            <Linha abraca larg={largTexto - 80} style={{ fontFamily: ARCHIVO, fontWeight: 900, fontStyle: "italic", fontSize: sub.s, color: PRETO, letterSpacing: "0.02em", lineHeight: 1.15 }}>
              {sub.linhas.join(" ")}
            </Linha>
          </div>
        </div>
      )}

      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(11,11,9,0) ${((yPlaca - 160) / h) * 100}%, rgba(11,11,9,.9) ${((yPlaca + 40) / h) * 100}%)` }} />

      {/* placa de rua com a chamada */}
      {ofe && (
        <div style={{ position: "absolute", left: (w - largPlaca) / 2, top: yPlaca, width: largPlaca, perspective: 1400 }}>
          <div style={{ transform: `rotate(-1.5deg) rotateX(${interpolate(placa, [0, 1], [-100, 0])}deg)`, transformOrigin: "50% 0%", opacity: placa > 0.01 ? 1 : 0 }}>
            <div style={{ position: "relative", height: placaH, background: LIMA, borderRadius: 22, boxShadow: "0 26px 50px rgba(0,0,0,.6), inset 0 2px 0 rgba(255,255,255,.35), inset 0 -3px 0 rgba(0,0,0,.18)", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 10, border: `5px solid ${PRETO}`, borderRadius: 14 }} />
              {(["left", "right"] as const).map((side) => (
                <div key={side} style={{ position: "absolute", top: "50%", [side]: 22, width: 16, height: 16, marginTop: -8, borderRadius: 8, background: "radial-gradient(circle at 35% 35%, #fff 0 20%, #8d8f7a 60%, #3c3d33 100%)", boxShadow: "inset 0 0 0 1px rgba(0,0,0,.4)" }} />
              ))}
              <div style={{ position: "absolute", top: 30, left: 0, right: 0, textAlign: "center", fontFamily: ARCHIVO, fontWeight: 800, fontSize: 24, letterSpacing: "0.34em", color: PRETO }}>{ROTULO[tom]}</div>
              <div style={{ position: "absolute", top: 30 + 18 + 12, left: 55 }}>
                {ofe.linhas.map((l, i) => (
                  <div key={i} style={{ height: ofe.s * ofeLH, display: "flex", alignItems: "center" }}>
                    <Linha larg={largPlaca - 110} style={{ fontFamily: BIG, fontWeight: 900, fontSize: ofe.s, lineHeight: 1, color: PRETO, letterSpacing: "0.01em" }}>
                      {l}
                    </Linha>
                  </div>
                ))}
              </div>
              <div style={{ position: "absolute", top: 0, bottom: 0, left: `${sw}%`, width: "18%", background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.55), rgba(255,255,255,0))", transform: "skewX(-20deg)" }} />
            </div>
          </div>
        </div>
      )}

      {regra && (
        <div style={{ position: "absolute", top: yRegra, left: C.pad, width: largTexto, textAlign: "center", opacity: regraO, transform: `translateY(${(1 - regraO) * 20}px)`, fontFamily: ARCHIVO, fontWeight: 600, fontSize: C.regra, lineHeight: 1.3, color: OSSO, letterSpacing: "0.02em" }}>
          <span style={{ color: LIMA, fontWeight: 900 }}>* </span>
          {regra}
        </div>
      )}

      <Slogan h={h} topo={C.topo} base={C.base + regraH + placaH + 20} />
      {p.anelSrc ? <GraoFixo opacity={0.14} /> : <Grain opacity={0.14} />}
      <Vignette strength={0.45} />
    </AbsoluteFill>
  );
};
