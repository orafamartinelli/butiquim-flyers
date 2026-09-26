import React from "react";
import { AbsoluteFill, Easing, Html5Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BIG, ARCHIVO, FRAUNCES, YELLOWTAIL } from "../fonts";
import { Grain, Nota, Vignette, clamp } from "../shared/fx";
import { RingPx } from "../shared/Ring3D";
import { Noite, SUBESTILO } from "../data";

// AGENDA DA SEMANA — 3 versões (V1 lineup, V2 cartaz, V3 repetição), feed 4:5 e story 9:16.
// parado = versão estática: tudo no estado final e sem destaque; no vídeo cada artista toca ~3s e a noite dele acende.
const LIMA = "#C8D200";
const PRETO = "#0B0B09";
const OSSO = "#F2F0E6";
// cada noite carrega a cor da sua identidade
const COR: Record<Noite["key"], string> = { sexta: LIMA, sabado: "#FF2E93", domingo: "#F29A2E" };

export const AGENDA_DUR = 300;
const SEG = 100; // quadros de cada artista no vídeo

type P = { noites: Noite[]; fmt: "feed" | "story"; periodo: string; parado?: boolean };

const useAnim = (parado: boolean) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const spr = (delay: number, cfg: Partial<{ damping: number; stiffness: number; mass: number }> = {}) =>
    parado ? 1 : spring({ frame: frame - delay, fps, config: { damping: 14, mass: 0.9, stiffness: 120, ...cfg } });
  const fade = (a: number, b: number) => (parado ? 1 : interpolate(frame, [a, b], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) }));
  // peso do destaque do artista i (0..1): acende quando o som dele entra
  const vez = (i: number) => {
    if (parado) return 0;
    const ini = i === 0 ? 62 : i * SEG;
    const fim = i === 2 ? 99999 : (i + 1) * SEG;
    return interpolate(frame, [ini - 6, ini + 8, fim - 6, fim + 8], [0, 1, 1, 0], clamp);
  };
  return { spr, fade, vez, t: parado ? 0 : frame };
};

// trilha: um trecho de cada artista, em sequência
export const TrilhaAgenda: React.FC<{ noites: Noite[] }> = ({ noites }) => (
  <>
    {noites.map((n, i) => (
      <Sequence key={n.data} from={i * SEG} durationInFrames={i === noites.length - 1 ? AGENDA_DUR - i * SEG : SEG + 8}>
        <Html5Audio src={staticFile(n.clip)} trimBefore={30} volume={(f) => interpolate(f, [0, 8, SEG - 4, SEG + 8], [0, 1, 1, i === noites.length - 1 ? 1 : 0], clamp) * (i === noites.length - 1 ? interpolate(f, [AGENDA_DUR - i * SEG - 20, AGENDA_DUR - i * SEG], [1, 0], clamp) : 1)} />
      </Sequence>
    ))}
  </>
);

const Foto: React.FC<{ n: Noite; h: number; cx: number; top: number; fade?: number; filter?: string; style?: React.CSSProperties }> = ({ n, h, cx, top, fade = 0.78, filter, style }) => {
  const w = h * n.foto.ratio;
  const mask = `linear-gradient(180deg, #000 ${fade * 100}%, transparent 100%)`;
  return <Img src={staticFile(n.foto.src)} style={{ position: "absolute", height: h, width: w, left: cx - w / 2, top, WebkitMaskImage: mask, maskImage: mask, filter, ...style }} />;
};

const Estilo: React.FC<{ n: Noite; size: number; cor?: string; fundo?: string }> = ({ n, size, cor = PRETO, fundo }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: size * 0.35, background: fundo ?? COR[n.key], color: cor, borderRadius: size * 0.3, padding: `${size * 0.22}px ${size * 0.55}px ${size * 0.24}px ${size * 0.4}px` }}>
    <Nota size={size * 1.05} color={cor} />
    <span style={{ fontFamily: ARCHIVO, fontWeight: 900, fontSize: size, letterSpacing: "0.1em", lineHeight: 1 }}>{n.estilo}</span>
    <span style={{ fontFamily: ARCHIVO, fontWeight: 600, fontSize: size * 0.72, lineHeight: 1, opacity: 0.75 }}>{SUBESTILO}</span>
  </div>
);

const dataCurta = (n: Noite) => `${n.dia}.${n.mes}`;
const nome = (n: Noite) => n.artista;

// letras entrando uma a uma (de baixo ou de cima)
const Letras: React.FC<{ text: string; delay: number; a: ReturnType<typeof useAnim>; de: number; style: React.CSSProperties; passo?: number }> = ({ text, delay, a, de, style, passo = 3 }) => (
  <div style={style}>
    {text.split("").map((c, i) => {
      const p = a.spr(delay + i * passo, { damping: 13 });
      return (
        <span key={i} style={{ display: "inline-block", transform: `translateY(${(1 - p) * de}px)`, opacity: Math.min(1, p * 2) }}>
          {c}
        </span>
      );
    })}
  </div>
);

// destaque do artista que está tocando: sobe um pouco e ganha brilho
const destaqueFoto = (peso: number, algum: number) => ({
  transform: `scale(${1 + peso * 0.035})`,
  transformOrigin: "50% 100%",
  filter: `brightness(${1 + peso * 0.08 - (algum - peso) * 0.18})`,
});

// ───────────────────────── V1 · LINEUP (ref. Camarote 26) ─────────────────────────
export const AgendaV1: React.FC<P> = ({ noites, fmt, periodo, parado = false }) => {
  const a = useAnim(parado);
  const feed = fmt === "feed";
  const T = feed ? 0 : 200; // desloca pra dentro da área segura do story
  const rowH = feed ? 196 : 250;
  const agY = feed ? 770 : 1210;
  const fotoH = feed ? 600 : 720;
  const fotoTop = feed ? 800 : 1230;
  const algum = Math.max(...noites.map((_, i) => a.vez(i)));
  const push = 1 + a.t * 0.00007;
  const semana = a.fade(46, 64);
  const art = (i: number, d: number) => {
    const s = a.spr(d, { damping: 15 });
    const pv = a.vez(i);
    return { top: (1 - s) * 320, opacity: Math.min(1, s * 2), ...destaqueFoto(pv, algum) };
  };
  return (
    <AbsoluteFill style={{ background: PRETO, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 70% 30%, rgba(200,210,0,.16) 0%, rgba(200,210,0,0) 55%)`, opacity: a.fade(0, 14) }} />
      <AbsoluteFill style={{ backgroundImage: "radial-gradient(circle, rgba(200,210,0,.4) 1.5px, transparent 2px)", backgroundSize: "15px 15px", WebkitMaskImage: "linear-gradient(180deg, transparent 50%, #000 100%)", opacity: 0.3 }} />
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        {/* coluna esquerda */}
        <Img src={staticFile("logos/butiquim-branco-h.png")} style={{ position: "absolute", left: 64, top: T + 86, width: 300, opacity: a.fade(2, 14), transform: `translateY(${(1 - a.fade(2, 14)) * -20}px)` }} />
        <div style={{ position: "absolute", left: 64, top: T + 190, width: 300, borderTop: `3px solid ${LIMA}`, borderBottom: `3px solid ${LIMA}`, padding: "16px 0", textAlign: "center", opacity: a.fade(6, 20), clipPath: `inset(0 ${(1 - a.fade(6, 22)) * 100}% 0 0)` }}>
          <div style={{ fontFamily: BIG, fontWeight: 900, fontSize: 64, color: OSSO, lineHeight: 0.95 }}>{periodo}</div>
          <div style={{ fontFamily: ARCHIVO, fontWeight: 700, fontSize: 20, letterSpacing: "0.3em", color: OSSO, opacity: 0.8, marginTop: 6 }}>OUTUBRO</div>
        </div>
        <div style={{ position: "absolute", left: 64, top: T + 400, width: 300, fontFamily: ARCHIVO, fontWeight: 900, fontSize: 38, lineHeight: 1.02, color: OSSO, textAlign: "center", opacity: a.fade(12, 26) }}>
          SEXTA,
          <br />
          SÁBADO
          <br />E DOMINGO
          <div style={{ fontFamily: ARCHIVO, fontWeight: 600, fontSize: 19, letterSpacing: "0.2em", color: LIMA, marginTop: 14 }}>TE VEJO NA ESQUINA</div>
        </div>
        {/* linhas das noites: entram da direita, e a de quem está tocando acende */}
        {noites.map((n, i) => {
          const s = a.spr(10 + i * 8, { damping: 16 });
          const pv = a.vez(i);
          return (
            <div key={n.data} style={{ position: "absolute", left: 420, right: 56, top: T + 80 + i * rowH, height: rowH - 22, display: "flex", alignItems: "center", gap: 22, transform: `translateX(${(1 - s) * 520}px) scale(${1 + pv * 0.03})`, transformOrigin: "0% 50%", opacity: Math.min(1, s * 1.6) }}>
              <div style={{ position: "absolute", left: -18, top: 10, bottom: 10, width: 6, borderRadius: 3, background: COR[n.key], opacity: pv, boxShadow: `0 0 18px ${COR[n.key]}` }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "inline-block", background: OSSO, color: PRETO, borderRadius: 999, padding: "5px 18px", fontFamily: ARCHIVO, fontWeight: 800, fontSize: 19, letterSpacing: "0.1em" }}>
                  {dataCurta(n)} / {n.diaSemana}
                </div>
                <div style={{ fontFamily: BIG, fontWeight: 900, fontSize: nome(n).length > 12 ? 56 : 66, color: OSSO, lineHeight: 0.95, marginTop: 8 }}>{nome(n)}</div>
                <div style={{ fontFamily: ARCHIVO, fontWeight: 700, fontSize: 17, letterSpacing: "0.14em", color: COR[n.key], margin: "4px 0 8px" }}>{n.noite.toUpperCase()} ● {n.hora}</div>
                <Estilo n={n} size={20} />
              </div>
              <div style={{ position: "relative", width: rowH * 0.95, height: rowH - 30, borderRadius: 22, overflow: "hidden", background: `linear-gradient(160deg, ${COR[n.key]} 0%, #1c1c18 75%)`, flex: "0 0 auto", boxShadow: `0 0 ${pv * 30}px ${COR[n.key]}` }}>
                <Img src={staticFile(n.foto.src)} style={{ position: "absolute", width: "105%", left: "-2.5%", top: 6 }} />
              </div>
            </div>
          );
        })}
        {/* AGENDA gigante com SEMANA sobrescrito em contorno */}
        <Letras text="AGENDA" delay={26} a={a} de={320} style={{ position: "absolute", left: 0, right: 0, top: agY, display: "flex", justifyContent: "center", fontFamily: BIG, fontWeight: 900, fontSize: 360, lineHeight: 0.8, color: LIMA, letterSpacing: "-0.01em" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: agY - 34, textAlign: "center", fontFamily: BIG, fontWeight: 900, fontSize: 210, lineHeight: 0.8, color: "transparent", WebkitTextStroke: "3px rgba(242,240,230,.8)", letterSpacing: "0.02em", opacity: semana, transform: `translateX(${(1 - semana) * -120}px)` }}>SEMANA</div>
        {/* artistas levemente sobrepostos, sobem um a um */}
        {(() => {
          const s0 = art(0, 34), s2 = art(2, 40), s1 = art(1, 46);
          return (
            <>
              <Foto n={noites[0]} h={fotoH} cx={250} top={fotoTop + 30 + s0.top} filter={`drop-shadow(0 20px 30px rgba(0,0,0,.6)) ${s0.filter}`} style={{ opacity: s0.opacity, transform: s0.transform, transformOrigin: s0.transformOrigin }} />
              <Foto n={noites[2]} h={fotoH} cx={830} top={fotoTop + 30 + s2.top} filter={`drop-shadow(0 20px 30px rgba(0,0,0,.6)) ${s2.filter}`} style={{ opacity: s2.opacity, transform: s2.transform, transformOrigin: s2.transformOrigin }} />
              <Foto n={noites[1]} h={fotoH * 1.04} cx={540} top={fotoTop + s1.top} filter={`drop-shadow(0 20px 40px rgba(0,0,0,.75)) ${s1.filter}`} style={{ opacity: s1.opacity, transform: s1.transform, transformOrigin: s1.transformOrigin }} />
            </>
          );
        })()}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(11,11,9,0) 88%, rgba(11,11,9,.9) 100%)" }} />
      {!feed && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 1770, textAlign: "center", opacity: a.fade(60, 74) }}>
          <span style={{ fontFamily: ARCHIVO, fontWeight: 800, fontSize: 24, color: PRETO, background: LIMA, padding: "8px 20px", letterSpacing: "0.12em" }}>NOME NA LISTA: LINK NA BIO</span>
        </div>
      )}
      <Grain opacity={0.12} />
      <Vignette strength={0.4} />
    </AbsoluteFill>
  );
};

// ───────────────────────── V2 · CARTAZ (ref. agendas A6) ─────────────────────────
// "Semana" fica sobre a parte de baixo do AGENDA, ACIMA das cabeças (antes caía no rosto do artista do meio)
export const AgendaV2: React.FC<P> = ({ noites, fmt, periodo, parado = false }) => {
  const a = useAnim(parado);
  const feed = fmt === "feed";
  const { w, h } = feed ? { w: 1080, h: 1350 } : { w: 1080, h: 1920 };
  const T = feed ? 0 : 190;
  const fotoH = feed ? 640 : 820;
  const colY = feed ? 880 : 1300;
  const topoCentro = T + (feed ? 440 : 520);
  const topoPontas = topoCentro + 40;
  const algum = Math.max(...noites.map((_, i) => a.vez(i)));
  const ring = a.spr(0, { damping: 17, stiffness: 60 });
  const semana = a.fade(40, 62);
  const art = (i: number, d: number) => {
    const s = a.spr(d, { damping: 12 });
    const pv = a.vez(i);
    return { dy: (1 - s) * 260, op: Math.min(1, s * 2), ...destaqueFoto(pv, algum) };
  };
  const s0 = art(0, 18), s2 = art(2, 24), s1 = art(1, 30);
  return (
    <AbsoluteFill style={{ background: "#0A1004", overflow: "hidden" }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% ${feed ? 30 : 32}%, rgba(200,210,0,.55) 0%, rgba(120,140,0,.25) 30%, rgba(10,16,4,0) 62%)`, opacity: a.fade(0, 16) }} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at 12% ${feed ? 60 : 55}%, rgba(255,46,147,.22) 0%, transparent 30%), radial-gradient(circle at 90% ${feed ? 55 : 52}%, rgba(242,154,46,.22) 0%, transparent 30%)` }} />
      <RingPx width={w} height={h} look="lima" flat cx={540} cy={T + (feed ? 400 : 520)} ringH={(feed ? 560 : 680) * interpolate(ring, [0, 1], [0.5, 1])} rotY={interpolate(ring, [0, 1], [1.5, 0.28]) + Math.sin(a.t / 40) * 0.1} envIntensity={0.9} />
      <Img src={staticFile("logos/butiquim-branco-h.png")} style={{ position: "absolute", left: 540 - 120, top: T + 36, width: 240, opacity: a.fade(4, 16) }} />
      <Letras text="AGENDA" delay={6} a={a} de={-360} style={{ position: "absolute", left: 0, right: 0, top: T + 110, display: "flex", justifyContent: "center", fontFamily: BIG, fontWeight: 900, fontSize: feed ? 300 : 330, lineHeight: 0.8, color: OSSO, letterSpacing: "0.01em", textShadow: "0 12px 40px rgba(0,0,0,.35)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: T + (feed ? 262 : 280), textAlign: "center", transform: "rotate(-6deg)" }}>
        <span style={{ display: "inline-block", fontFamily: YELLOWTAIL, fontSize: feed ? 150 : 170, color: LIMA, filter: "drop-shadow(0 4px 0 rgba(0,0,0,.55))", clipPath: `inset(-30% ${(1 - semana) * 100}% -30% -5%)`, paddingRight: 12 }}>Semana</span>
      </div>
      {/* grupo sobreposto: pontas atrás, centro na frente */}
      <Foto n={noites[0]} h={fotoH * 0.92} cx={270} top={topoPontas + s0.dy} fade={0.72} filter={`drop-shadow(0 20px 30px rgba(0,0,0,.55)) ${s0.filter}`} style={{ opacity: s0.op, transform: s0.transform, transformOrigin: s0.transformOrigin }} />
      <Foto n={noites[2]} h={fotoH * 0.92} cx={810} top={topoPontas + s2.dy} fade={0.72} filter={`drop-shadow(0 20px 30px rgba(0,0,0,.55)) ${s2.filter}`} style={{ opacity: s2.op, transform: s2.transform, transformOrigin: s2.transformOrigin }} />
      <Foto n={noites[1]} h={fotoH} cx={540} top={topoCentro + s1.dy} fade={0.72} filter={`drop-shadow(0 24px 40px rgba(0,0,0,.7)) ${s1.filter}`} style={{ opacity: s1.op, transform: s1.transform, transformOrigin: s1.transformOrigin }} />
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(10,16,4,0) ${feed ? 58 : 58}%, rgba(10,16,4,.96) ${feed ? 68 : 69}%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: colY - 70, textAlign: "center", fontFamily: ARCHIVO, fontWeight: 800, fontSize: 24, letterSpacing: "0.34em", color: OSSO, opacity: a.fade(48, 62) }}>{periodo} ● OUTUBRO</div>
      <div style={{ position: "absolute", left: 50, right: 50, top: colY, display: "flex", gap: 24 }}>
        {noites.map((n, i) => {
          const s = a.spr(52 + i * 6, { damping: 15 });
          const pv = a.vez(i);
          return (
            <div key={n.data} style={{ flex: 1, borderTop: `6px solid ${COR[n.key]}`, paddingTop: 16, transform: `translateY(${(1 - s) * 90 - pv * 8}px)`, opacity: Math.min(1, s * 1.6), boxShadow: `0 -${pv * 16}px ${pv * 22}px -${pv * 8}px ${COR[n.key]}` }}>
              <div style={{ fontFamily: BIG, fontWeight: 900, fontSize: 86, lineHeight: 0.85, color: OSSO }}>{n.dia}.10</div>
              <div style={{ fontFamily: ARCHIVO, fontWeight: 800, fontSize: 20, letterSpacing: "0.2em", color: COR[n.key], marginTop: 6 }}>
                {n.diaSemana} ● {n.hora}
              </div>
              <div style={{ fontFamily: ARCHIVO, fontWeight: 900, fontSize: nome(n).length > 12 ? 30 : 36, lineHeight: 1.05, color: OSSO, marginTop: 10, minHeight: 76 }}>{nome(n)}</div>
              <div style={{ marginTop: 10 }}>
                <Estilo n={n} size={17} />
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: colY + (feed ? 330 : 360), textAlign: "center", opacity: a.fade(70, 84) }}>
        <span style={{ fontFamily: ARCHIVO, fontWeight: 800, fontSize: 22, color: PRETO, background: LIMA, padding: "8px 20px", letterSpacing: "0.12em" }}>NOME NA LISTA: LINK NA BIO</span>
      </div>
      <Grain opacity={0.12} />
      <Vignette strength={0.45} />
    </AbsoluteFill>
  );
};

// ───────────────────────── V3 · REPETIÇÃO (ref. Buteko), fundo claro ─────────────────────────
export const AgendaV3: React.FC<P> = ({ noites, fmt, periodo, parado = false }) => {
  const a = useAnim(parado);
  const feed = fmt === "feed";
  const T = feed ? 0 : 200;
  const linhas = 4;
  const lh = feed ? 132 : 150;
  const fotoH = feed ? 560 : 700;
  const fotoTop = T + (feed ? 420 : 560);
  const cardY = feed ? 1000 : 1330;
  const algum = Math.max(...noites.map((_, i) => a.vez(i)));
  const sticker = (c: string) => `drop-shadow(5px 0 0 #fff) drop-shadow(-5px 0 0 #fff) drop-shadow(0 5px 0 #fff) drop-shadow(0 -5px 0 #fff) drop-shadow(8px 10px 0 ${c})`;
  const carimbo = a.spr(24, { damping: 9, stiffness: 150 });
  const cola = (i: number, d: number, lado: number) => {
    const s = a.spr(d, { damping: 11, stiffness: 140 });
    const pv = a.vez(i);
    return { transform: `scale(${interpolate(s, [0, 1], [1.35, 1]) * (1 + pv * 0.035)}) rotate(${(1 - s) * 12 * lado}deg)`, transformOrigin: "50% 100%", opacity: Math.min(1, s * 3), bright: `brightness(${1 + pv * 0.06 - (algum - pv) * 0.12})` };
  };
  const c0 = cola(0, 30, -1), c2 = cola(2, 36, 1), c1 = cola(1, 42, 1);
  return (
    <AbsoluteFill style={{ background: "#EEE9DC", overflow: "hidden" }}>
      <AbsoluteFill style={{ backgroundImage: "radial-gradient(circle, rgba(11,11,9,.12) 1.2px, transparent 1.8px)", backgroundSize: "14px 14px", opacity: 0.6 }} />
      <Img src={staticFile("logos/logo_obutiquim_policromia_horizontal.png")} style={{ position: "absolute", left: 56, top: T + 44, width: 230, opacity: a.fade(2, 14) }} />
      <div style={{ position: "absolute", right: 56, top: T + 46, fontFamily: ARCHIVO, fontWeight: 800, fontSize: 24, letterSpacing: "0.16em", color: PRETO, opacity: a.fade(6, 18) }}>{periodo} ● OUT</div>
      {/* AGENDA repetido: linhas entram de lados alternados e ficam deslizando devagar */}
      {Array.from({ length: linhas }, (_, i) => {
        const s = a.spr(i * 4, { damping: 18 });
        const lado = i % 2 ? 1 : -1;
        const deriva = Math.sin(a.t / 45 + i * 1.3) * 18 * (parado ? 0 : 1);
        return (
          <div key={i} style={{ position: "absolute", left: 0, right: 0, top: T + 100 + i * lh, textAlign: "center", fontFamily: BIG, fontWeight: 900, fontSize: feed ? 176 : 196, lineHeight: 0.8, letterSpacing: "0.02em", color: i === 1 ? PRETO : "transparent", WebkitTextStroke: i === 1 ? undefined : `2.5px rgba(11,11,9,${0.85 - i * 0.18})`, transform: `translateX(${(1 - s) * 1100 * lado + deriva}px)` }}>
            AGENDA
          </div>
        );
      })}
      {/* SEMANA carimbado por cima, em lima */}
      <div style={{ position: "absolute", left: 0, right: 0, top: T + 100 + lh * 1.55, textAlign: "center", transform: `rotate(${-4 - (1 - carimbo) * 10}deg) scale(${interpolate(carimbo, [0, 1], [1.9, 1])})`, opacity: Math.min(1, carimbo * 3) }}>
        <span style={{ fontFamily: FRAUNCES, fontStyle: "italic", fontWeight: 900, fontSize: feed ? 150 : 170, color: LIMA, WebkitTextStroke: `3px ${PRETO}`, paintOrder: "stroke fill", textShadow: `6px 6px 0 ${PRETO}` }}>Semana</span>
      </div>
      {/* artistas como adesivos, colados um a um */}
      <Foto n={noites[0]} h={fotoH} cx={255} top={fotoTop + 40} fade={0.8} filter={`${sticker(COR.sexta)} ${c0.bright}`} style={{ transform: c0.transform, transformOrigin: c0.transformOrigin, opacity: c0.opacity }} />
      <Foto n={noites[2]} h={fotoH} cx={825} top={fotoTop + 40} fade={0.8} filter={`${sticker(COR.domingo)} ${c2.bright}`} style={{ transform: c2.transform, transformOrigin: c2.transformOrigin, opacity: c2.opacity }} />
      <Foto n={noites[1]} h={fotoH * 1.05} cx={540} top={fotoTop} fade={0.8} filter={`${sticker(COR.sabado)} ${c1.bright}`} style={{ transform: c1.transform, transformOrigin: c1.transformOrigin, opacity: c1.opacity }} />
      {/* cartões das noites: viram pra cima; o de quem está tocando levanta */}
      <div style={{ position: "absolute", left: 40, right: 40, top: cardY, display: "flex", gap: 16, perspective: 1200 }}>
        {noites.map((n, i) => {
          const s = a.spr(50 + i * 6, { damping: 13 });
          const pv = a.vez(i);
          return (
            <div key={n.data} style={{ flex: 1, background: PRETO, color: OSSO, borderRadius: 18, padding: "18px 18px 20px", boxShadow: `${6 + pv * 4}px ${8 + pv * 6}px 0 ${COR[n.key]}`, transform: `rotateX(${(1 - s) * 90}deg) translateY(${-pv * 12}px)`, transformOrigin: "50% 100%", opacity: Math.min(1, s * 2) }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                <span style={{ fontFamily: BIG, fontWeight: 900, fontSize: 70, lineHeight: 0.85 }}>{n.dia}.10</span>
                <span style={{ fontFamily: ARCHIVO, fontWeight: 800, fontSize: 18, color: COR[n.key], letterSpacing: "0.1em" }}>{n.hora}</span>
              </div>
              <div style={{ fontFamily: ARCHIVO, fontWeight: 800, fontSize: 17, letterSpacing: "0.22em", color: COR[n.key], marginTop: 6 }}>{n.diaSemana}</div>
              <div style={{ fontFamily: ARCHIVO, fontWeight: 900, fontSize: nome(n).length > 12 ? 25 : 30, lineHeight: 1.05, marginTop: 8, minHeight: 60 }}>{nome(n)}</div>
              <div style={{ marginTop: 10 }}>
                <Estilo n={n} size={14} />
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: cardY + (feed ? 280 : 320), textAlign: "center", fontFamily: ARCHIVO, fontWeight: 800, fontSize: 21, letterSpacing: "0.16em", color: PRETO, opacity: a.fade(70, 84) }}>
        TE VEJO NA ESQUINA ● NOME NA LISTA: LINK NA BIO
      </div>
      <Grain opacity={0.1} blend="multiply" />
    </AbsoluteFill>
  );
};
