import React from "react";
import { AbsoluteFill, Easing, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Logo } from "./kit";
import { Grain, clamp } from "../shared/fx";
import { Ico } from "../shared/icones";
import { B, BB, Botao, ENDERECO, Ingresso, K, Manchete, MANCHETE, N, NU, URL_PV } from "./primeira-vez-v23";

// Campanha "PRIMEIRA VEZ" — vídeos para Meta Ads (22/10/2026).
// V4: a peça V3 "O convite" animada (carimbo batendo, push-in, brilho).
// V5 / V6: filmagem real andando pela casa + oferta sobreposta (V5 acumula; V6 troca a cada cena).
// Regra: o 1º quadro já é a capa (mensagem principal legível); texto conta tudo no mudo.

type Fmt = "feed" | "story";
export const DIMS_PVV = { feed: { w: 1080, h: 1350 }, story: { w: 1080, h: 1920 } };
export const DUR_V4 = 360; // 12 s
const DIAS = "SEXTA · SÁBADO · DOMINGO";

const useSp = (start: number, cfg: Partial<{ damping: number; stiffness: number; mass: number }> = {}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - start, fps, config: { damping: 14, stiffness: 160, mass: 0.8, ...cfg } });
};

// entra (desliza + aparece) a partir de `start`; com start <= 0 já está visível no quadro 0
const Entra: React.FC<{ start: number; dy?: number; dx?: number; fim?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ start, dy = 40, dx = 0, fim, children, style }) => {
  const f = useCurrentFrame();
  const s = useSp(start);
  const vis = start <= 0 ? 1 : interpolate(f, [start, start + 6], [0, 1], clamp);
  const sai = fim === undefined ? 1 : interpolate(f, [fim - 6, fim], [1, 0], clamp);
  const k = start <= 0 ? 1 : s;
  return (
    <div style={{ opacity: vis * sai, transform: `translate(${(1 - k) * dx}px, ${(1 - k) * dy - (1 - sai) * 30}px)`, ...style }}>
      {children}
    </div>
  );
};

// poeira dourada subindo devagar (parallax de fundo)
const Poeira: React.FC<{ n?: number; h: number }> = ({ n = 26, h }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: n }, (_, i) => {
        const r = (x: number) => ((Math.sin(i * 91.7 + x * 13.3) + 1) / 2);
        const sz = 3 + r(1) * 7;
        const vel = 0.6 + r(2) * 1.4;
        const y = (((r(3) * h - f * vel) % h) + h) % h;
        const x = r(4) * 1080 + Math.sin((f + i * 20) / 40) * 14;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: sz, height: sz, borderRadius: "50%", background: K.ouro, opacity: 0.12 + r(5) * 0.28, filter: "blur(1px)" }} />;
      })}
    </AbsoluteFill>
  );
};

// =====================================================================
// V4 · O CONVITE ANIMADO (a partir da V3 geral)
// =====================================================================
export const V4: React.FC<{ fmt: Fmt }> = ({ fmt }) => {
  const f = useCurrentFrame();
  const story = fmt === "story";
  const { h } = DIMS_PVV[fmt];
  const pad = story ? { t: 250, b: 250, x: 70 } : { t: 56, b: 40, x: 70 };
  const z = story ? 1.0 : 0.92;
  const BATE = 32; // carimbo bate em ~1 s
  // push-in lento da cena inteira + manchete e ingresso em velocidades diferentes (parallax)
  const zoom = interpolate(f, [0, DUR_V4], [1, 1.055], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const pxHead = interpolate(f, [0, DUR_V4], [0, -18], clamp);
  const pxTicket = interpolate(f, [0, DUR_V4], [0, 10], clamp);
  // ingresso: começa levemente girado/menor (legível) e assenta
  const sT = useSp(0, { damping: 13, stiffness: 90 });
  const rotT = interpolate(sT, [0, 1], [-3, 0]);
  const escT = interpolate(sT, [0, 1], [0.95, 1]);
  // tranco do carimbo
  const tr = f >= BATE && f < BATE + 8 ? Math.sin((f - BATE) * 2.6) * (8 - (f - BATE)) * 1.6 : 0;
  const flash = interpolate(f, [BATE, BATE + 2, BATE + 12], [0, 0.09, 0], clamp);
  // brilho passando no ingresso (a cada 3 s, a partir de 2 s)
  const ciclo = (f - 60) % 90;
  const brilhoX = f >= 60 ? interpolate(ciclo, [0, 34], [-40, 140], clamp) : -60;
  // botão pulsando a partir de 3 s
  const pulso = f >= 90 ? 1 + Math.sin(((f - 90) / 30) * Math.PI) ** 2 * 0.045 : 1;
  const glow = interpolate(Math.sin(f / 22), [-1, 1], [0.09, 0.17]);
  return (
    <AbsoluteFill style={{ background: K.bg, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 45% at ${50 + Math.sin(f / 70) * 6}% ${38 + Math.cos(f / 90) * 3}%, rgba(255,184,0,${glow}), transparent 70%)` }} />
      <Poeira h={h} />
      <Grain opacity={0.07} />
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <AbsoluteFill style={{ padding: `${pad.t}px ${pad.x}px ${pad.b}px`, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Entra start={0} dy={0}>
            <Logo width={story ? 250 : 220} />
          </Entra>
          <div style={{ flex: 1, minHeight: story ? 30 : 16 }} />
          <div style={{ transform: `translateY(${pxHead}px)` }}>
            <Manchete linhas={MANCHETE.geral.v3} size={story ? 124 : 112} align="center" />
          </div>
          <div style={{ flex: 1, minHeight: story ? 40 : 26, maxHeight: story ? 90 : 40 }} />
          <div style={{ position: "relative", transform: `translate(${tr}px, ${pxTicket + tr * 0.4}px) rotate(${rotT}deg) scale(${escT})` }}>
            <Ingresso tema="geral" w={story ? 920 : 900} z={z} carimboStart={BATE} />
            {/* brilho diagonal */}
            <div style={{ position: "absolute", inset: 0, borderRadius: 30 * z, overflow: "hidden", pointerEvents: "none" }}>
              <div style={{ position: "absolute", top: "-30%", bottom: "-30%", left: `${brilhoX}%`, width: "18%", background: "linear-gradient(90deg, transparent, rgba(255,232,150,.16), transparent)", transform: "rotate(18deg)" }} />
            </div>
          </div>
          <div style={{ flex: 1, minHeight: story ? 40 : 26, maxHeight: story ? 100 : 40 }} />
          <div style={{ transform: `scale(${pulso})` }}>
            <Botao size={story ? 56 : 48}>CADASTRE-SE NA LISTA PRIMEIRA VEZ</Botao>
          </div>
          <div style={{ height: story ? 24 : 16 }} />
          <div style={{ fontFamily: NU, fontWeight: 700, fontSize: story ? 26 : 23, color: K.cinza, textAlign: "center", lineHeight: 1.4 }}>
            <span style={{ color: K.branco }}>{URL_PV}</span>
            <span style={{ opacity: 0.7 }}> · {ENDERECO}</span>
          </div>
          <Entra start={150} dy={20}>
            <B size={story ? 40 : 32} color={K.ouro} ls="0.14em" style={{ marginTop: story ? 18 : 10 }}>
              {DIAS}
            </B>
          </Entra>
          <div style={{ flex: 1, minHeight: 0 }} />
        </AbsoluteFill>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#FFF6D6", opacity: flash, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

// =====================================================================
// Fundo de filmagem (cortes secos + leve push-in em cada trecho)
// =====================================================================
type Clip = { src: string; d: number };
export const CLIPS_V5: Clip[] = [
  { src: "broll/pv/v5a.mp4", d: 165 }, // Conheça O Butiquim.mp4 2,5–8,0 s (neon "Quem me viu, mentiu!", salão, palco)
  { src: "broll/pv/v5b.mp4", d: 105 }, // Boqueta.mp4 0,3–3,8 s (bar verde)
  { src: "broll/pv/v5c.mp4", d: 150 }, // Totem.mp4 5,6–10,6 s (totem BUTIQUIM)
];
export const CLIPS_V6: Clip[] = [
  { src: "broll/pv/v6a.mp4", d: 180 }, // Butica - Cam Gold.mp4 3,3–9,3 s (palco, letreiro O BUTIQUIM, mezanino)
  { src: "broll/pv/v6b.mp4", d: 118 }, // Cam Butica.mp4 2,6–6,6 s (camarote com letreiro BUTIQUIM)
  { src: "broll/pv/v6c.mp4", d: 120 }, // Totem.mp4 0,3–4,3 s (corredor verde até o totem)
];
export const durClips = (c: Clip[]) => c.reduce((a, x) => a + x.d, 0);

const Trecho: React.FC<{ src: string; d: number }> = ({ src, d }) => {
  const f = useCurrentFrame();
  const sc = interpolate(f, [0, d], [1.0, 1.07], clamp);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <OffthreadVideo src={staticFile(src)} muted style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${sc})` }} />
    </AbsoluteFill>
  );
};

const Filmagem: React.FC<{ clips: Clip[] }> = ({ clips }) => {
  const f = useCurrentFrame();
  let ini = 0;
  const cortes: number[] = [];
  const seqs = clips.map((c, i) => {
    const from = ini;
    ini += c.d;
    if (i > 0) cortes.push(from);
    return (
      <Sequence key={i} from={from} durationInFrames={c.d}>
        <Trecho src={c.src} d={c.d} />
      </Sequence>
    );
  });
  const flash = Math.max(0, ...cortes.map((c) => interpolate(f, [c, c + 1, c + 6], [0, 0.22, 0], clamp)));
  return (
    <AbsoluteFill>
      {seqs}
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
    </AbsoluteFill>
  );
};

const Rod: React.FC<{ size: number; align?: "left" | "center" }> = ({ size, align = "left" }) => (
  <div style={{ fontFamily: NU, fontWeight: 700, fontSize: size, color: K.cinza, textAlign: align, lineHeight: 1.35, textShadow: "0 2px 10px rgba(0,0,0,.8)" }}>
    <div style={{ color: K.branco, fontWeight: 800 }}>{URL_PV}</div>
    <div>Sexta, sábado e domingo · {ENDERECO}</div>
  </div>
);

const sombra = "0 6px 30px rgba(0,0,0,.55)";

// =====================================================================
// V5 · VÍDEO DE VERDADE (geral) — a oferta vai se completando
// =====================================================================
export const V5: React.FC<{ fmt: Fmt }> = ({ fmt }) => {
  const story = fmt === "story";
  const pad = story ? { t: 250, b: 250, x: 70 } : { t: 54, b: 54, x: 64 };
  const T_DRINK = 105; // 3,5 s
  const T_CTA = 225; // 7,5 s
  return (
    <AbsoluteFill style={{ background: K.bg }}>
      <Filmagem clips={CLIPS_V5} />
      <AbsoluteFill
        style={{
          background: story
            ? "linear-gradient(180deg, rgba(12,12,12,.75) 0%, rgba(12,12,12,.15) 18%, rgba(12,12,12,0) 32%, rgba(12,12,12,.55) 48%, rgba(12,12,12,.88) 64%, rgba(12,12,12,.94) 100%)"
            : "linear-gradient(180deg, rgba(12,12,12,.7) 0%, rgba(12,12,12,.05) 16%, rgba(12,12,12,.1) 26%, rgba(12,12,12,.7) 44%, rgba(12,12,12,.92) 62%, rgba(12,12,12,.95) 100%)",
        }}
      />
      <AbsoluteFill style={{ padding: `${pad.t}px ${pad.x}px ${pad.b}px`, display: "flex", flexDirection: "column" }}>
        <Logo width={story ? 240 : 210} />
        <div style={{ flex: 1 }} />
        <B size={story ? 84 : 70} color={K.ouro} ls="0.02em" style={{ textShadow: sombra }}>
          PRIMEIRA VEZ NO BUTIQUIM?
        </B>
        <B size={story ? 186 : 160} style={{ textShadow: sombra, paddingTop: 6 }}>
          SUA ENTRADA
        </B>
        <B size={story ? 186 : 160} color={K.ouro} style={{ textShadow: sombra }}>
          É GRÁTIS
        </B>
        <div style={{ height: story ? 26 : 18 }} />
        <Entra start={T_DRINK} dx={-60} dy={0}>
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <Ico i="caipirinha" size={story ? 92 : 78} color={K.ouro} stroke={1.6} />
            <N size={story ? 46 : 40} style={{ flex: 1, textShadow: sombra }}>
              + 1 caipirinha de Smirnoff ou 1 Smirnoff Ice <span style={{ color: K.ouro }}>por nossa conta</span>
            </N>
          </div>
        </Entra>
        <div style={{ height: story ? 36 : 26 }} />
        <Entra start={T_CTA} dy={50}>
          <div style={{ display: "flex" }}>
            <Botao size={story ? 56 : 50}>CADASTRE-SE NA LISTA PRIMEIRA VEZ</Botao>
          </div>
          <div style={{ height: story ? 20 : 14 }} />
          <Rod size={story ? 28 : 24} />
        </Entra>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// =====================================================================
// V6 · VÍDEO DE VERDADE (pagode + sertanejo) — uma frase por cena, oferta fixa no topo
// =====================================================================
const Faixa: React.FC<{ story: boolean; start: number }> = ({ story, start }) => {
  const s = useSp(start, { damping: 16 });
  const f = useCurrentFrame();
  const vis = interpolate(f, [start, start + 5], [0, 1], clamp);
  return (
    <div style={{ opacity: vis, transform: `translateY(${(1 - s) * -30}px)`, display: "flex", justifyContent: "center" }}>
      <div style={{ background: K.ouro, color: K.bg, fontFamily: BB, fontSize: story ? 50 : 42, letterSpacing: "0.04em", padding: story ? "12px 30px 8px" : "10px 26px 6px", borderRadius: 14, whiteSpace: "nowrap", boxShadow: "0 10px 30px rgba(0,0,0,.45)" }}>
        PRIMEIRA VEZ? ENTRADA GRÁTIS + 1 DRINK
      </div>
    </div>
  );
};

const Chip: React.FC<{ dia: string; estilo: string; size: number; start: number }> = ({ dia, estilo, size, start }) => (
  <Entra start={start} dy={0} dx={-80}>
    <div style={{ display: "flex", alignItems: "baseline", gap: size * 0.22, justifyContent: "center" }}>
      <B size={size * 0.62} ls="0.03em" style={{ textShadow: sombra }}>
        {dia} TEM
      </B>
      <B size={size} color={K.ouro} style={{ textShadow: sombra }}>
        {estilo}
      </B>
    </div>
  </Entra>
);

export const V6: React.FC<{ fmt: Fmt }> = ({ fmt }) => {
  const f = useCurrentFrame();
  const story = fmt === "story";
  const pad = story ? { t: 250, b: 250, x: 60 } : { t: 50, b: 50, x: 56 };
  const [c1, c2, c3] = [CLIPS_V6[0].d, CLIPS_V6[0].d + CLIPS_V6[1].d, durClips(CLIPS_V6)];
  // cena 1: 0 → c1 (entrada grátis) · cena 2: c1 → c1+~60 dias / depois drink · cena 3: c2 → fim (CTA)
  const T_DIAS = c1; // 6 s
  const T_DRINK = c1 + 62; // ~8 s
  const T_CTA = c2; // ~9,9 s
  const s1 = 0;
  const bigEsc = interpolate(f, [0, c1], [1, 1.04], clamp);
  const meio = story ? 1.0 : 0.86;
  void c3;
  return (
    <AbsoluteFill style={{ background: K.bg }}>
      <Filmagem clips={CLIPS_V6} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 120% 60% at 50% 58%, rgba(12,12,12,.78) 0%, rgba(12,12,12,.55) 45%, rgba(12,12,12,.35) 75%)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(12,12,12,.7) 0%, rgba(12,12,12,0) 20%, rgba(12,12,12,0) 78%, rgba(12,12,12,.75) 100%)" }} />
      <AbsoluteFill style={{ padding: `${pad.t}px ${pad.x}px ${pad.b}px`, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Logo width={story ? 240 : 200} />
        <div style={{ height: story ? 34 : 18 }} />
        {f >= T_DIAS && <Faixa story={story} start={T_DIAS} />}
        <div style={{ flex: 1, position: "relative", width: "100%" }}>
          {/* cena 1 — capa */}
          {f < T_DIAS && (
            <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: `scale(${bigEsc})` }}>
              <Entra start={s1} fim={T_DIAS}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <B size={110 * meio} ls="0.02em" style={{ textShadow: sombra }}>
                    PRIMEIRA VEZ
                  </B>
                  <B size={110 * meio} color={K.ouro} ls="0.02em" style={{ textShadow: sombra }}>
                    NO BUTIQUIM?
                  </B>
                  <div style={{ height: 30 * meio }} />
                  <div style={{ background: K.ouro, padding: `${18 * meio}px ${40 * meio}px ${8 * meio}px`, borderRadius: 18, transform: "rotate(-2deg)", boxShadow: "0 18px 50px rgba(0,0,0,.5)" }}>
                    <B size={150 * meio} color={K.bg}>
                      SUA ENTRADA
                    </B>
                    <B size={150 * meio} color={K.bg}>
                      É GRÁTIS
                    </B>
                  </div>
                </div>
              </Entra>
            </AbsoluteFill>
          )}
          {/* cena 2a — dias */}
          {f >= T_DIAS && f < T_DRINK && (
            <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 * meio }}>
              <Chip dia="SÁBADO" estilo="PAGODE" size={170 * meio} start={T_DIAS + 4} />
              <Chip dia="DOMINGO" estilo="SERTANEJO" size={150 * meio} start={T_DIAS + 14} />
              <Entra start={T_DIAS + 24} dy={20}>
                <B size={44 * meio} color={K.branco} ls="0.12em" style={{ marginTop: 14 * meio, textShadow: sombra }}>
                  E SEXTA TAMBÉM TEM
                </B>
              </Entra>
            </AbsoluteFill>
          )}
          {/* cena 2b — drink */}
          {f >= T_DRINK && f < T_CTA && (
            <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <Entra start={T_DRINK} dy={60}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                  <Ico i="caipirinha" size={150 * meio} color={K.ouro} stroke={1.5} />
                  <div style={{ height: 16 }} />
                  <B size={120 * meio} color={K.ouro} style={{ textShadow: sombra }}>
                    + 1 DRINK
                  </B>
                  <B size={84 * meio} style={{ textShadow: sombra }}>
                    POR NOSSA CONTA
                  </B>
                  <div style={{ height: 18 * meio }} />
                  <N size={44 * meio} weight={800} style={{ textShadow: sombra, maxWidth: 900 }}>
                    1 caipirinha de Smirnoff ou 1 Smirnoff Ice
                  </N>
                </div>
              </Entra>
            </AbsoluteFill>
          )}
          {/* cena 3 — CTA */}
          {f >= T_CTA && (
            <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <Entra start={T_CTA} dy={50}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <B size={84 * meio} style={{ textShadow: sombra }}>
                    GARANTA A SUA:
                  </B>
                  <div style={{ height: 24 * meio }} />
                  <div style={{ transform: `scale(${1 + Math.sin(((f - T_CTA) / 30) * Math.PI) ** 2 * 0.04})` }}>
                    <Botao size={story ? 58 : 50}>CADASTRE-SE NA LISTA PRIMEIRA VEZ</Botao>
                  </div>
                  <div style={{ height: 26 * meio }} />
                  <Rod size={story ? 30 : 26} align="center" />
                </div>
              </Entra>
            </AbsoluteFill>
          )}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
