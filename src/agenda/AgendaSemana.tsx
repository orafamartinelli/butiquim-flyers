import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { BIG, ARCHIVO, FRAUNCES, YELLOWTAIL } from "../fonts";
import { Grain, Nota, Vignette } from "../shared/fx";
import { RingPx } from "../shared/Ring3D";
import { Noite, SUBESTILO } from "../data";

// AGENDA DA SEMANA — 3 versões para o Rafa escolher (estáticas, feed 4:5 e story 9:16)
const LIMA = "#C8D200";
const PRETO = "#0B0B09";
const OSSO = "#F2F0E6";
// cada noite carrega a cor da sua identidade
const COR: Record<Noite["key"], string> = { sexta: LIMA, sabado: "#FF2E93", domingo: "#F29A2E" };

type P = { noites: Noite[]; fmt: "feed" | "story"; periodo: string };

const Foto: React.FC<{ n: Noite; h: number; cx: number; top: number; fade?: number; filter?: string; z?: number }> = ({ n, h, cx, top, fade = 0.78, filter, z }) => {
  const w = h * n.foto.ratio;
  const mask = `linear-gradient(180deg, #000 ${fade * 100}%, transparent 100%)`;
  return <Img src={staticFile(n.foto.src)} style={{ position: "absolute", height: h, width: w, left: cx - w / 2, top, WebkitMaskImage: mask, maskImage: mask, filter, zIndex: z }} />;
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

// ───────────────────────── V1 · LINEUP (ref. Camarote 26) ─────────────────────────
export const AgendaV1: React.FC<P> = ({ noites, fmt, periodo }) => {
  const feed = fmt === "feed";
  const T = feed ? 0 : 200; // desloca pra dentro da área segura do story
  const rowH = feed ? 196 : 250;
  const agY = feed ? 770 : 1210;
  const fotoH = feed ? 600 : 720;
  const fotoTop = feed ? 800 : 1230;
  return (
    <AbsoluteFill style={{ background: PRETO, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 70% 30%, rgba(200,210,0,.16) 0%, rgba(200,210,0,0) 55%)` }} />
      <AbsoluteFill style={{ backgroundImage: "radial-gradient(circle, rgba(200,210,0,.4) 1.5px, transparent 2px)", backgroundSize: "15px 15px", WebkitMaskImage: "linear-gradient(180deg, transparent 50%, #000 100%)", opacity: 0.3 }} />
      {/* coluna esquerda */}
      <Img src={staticFile("logos/butiquim-branco-h.png")} style={{ position: "absolute", left: 64, top: T + 86, width: 300 }} />
      <div style={{ position: "absolute", left: 64, top: T + 190, width: 300, borderTop: `3px solid ${LIMA}`, borderBottom: `3px solid ${LIMA}`, padding: "16px 0", textAlign: "center" }}>
        <div style={{ fontFamily: BIG, fontWeight: 900, fontSize: 64, color: OSSO, lineHeight: 0.95 }}>{periodo}</div>
        <div style={{ fontFamily: ARCHIVO, fontWeight: 700, fontSize: 20, letterSpacing: "0.3em", color: OSSO, opacity: 0.8, marginTop: 6 }}>OUTUBRO</div>
      </div>
      <div style={{ position: "absolute", left: 64, top: T + 400, width: 300, fontFamily: ARCHIVO, fontWeight: 900, fontSize: 38, lineHeight: 1.02, color: OSSO, textAlign: "center" }}>
        SEXTA,
        <br />
        SÁBADO
        <br />E DOMINGO
        <div style={{ fontFamily: ARCHIVO, fontWeight: 600, fontSize: 19, letterSpacing: "0.2em", color: LIMA, marginTop: 14 }}>TE VEJO NA ESQUINA</div>
      </div>
      {/* linhas das noites */}
      {noites.map((n, i) => (
        <div key={n.data} style={{ position: "absolute", left: 420, right: 56, top: T + 80 + i * rowH, height: rowH - 22, display: "flex", alignItems: "center", gap: 22 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "inline-block", background: OSSO, color: PRETO, borderRadius: 999, padding: "5px 18px", fontFamily: ARCHIVO, fontWeight: 800, fontSize: 19, letterSpacing: "0.1em" }}>
              {dataCurta(n)} / {n.diaSemana}
            </div>
            <div style={{ fontFamily: BIG, fontWeight: 900, fontSize: nome(n).length > 12 ? 56 : 66, color: OSSO, lineHeight: 0.95, marginTop: 8 }}>{nome(n)}</div>
            <div style={{ fontFamily: ARCHIVO, fontWeight: 700, fontSize: 17, letterSpacing: "0.14em", color: COR[n.key], margin: "4px 0 8px" }}>{n.noite.toUpperCase()} ● {n.hora}</div>
            <Estilo n={n} size={20} />
          </div>
          <div style={{ position: "relative", width: rowH * 0.95, height: rowH - 30, borderRadius: 22, overflow: "hidden", background: `linear-gradient(160deg, ${COR[n.key]} 0%, #1c1c18 75%)`, flex: "0 0 auto" }}>
            <Img src={staticFile(n.foto.src)} style={{ position: "absolute", width: "105%", left: "-2.5%", top: 6 }} />
          </div>
        </div>
      ))}
      {/* AGENDA gigante com SEMANA sobrescrito em contorno */}
      <div style={{ position: "absolute", left: 0, right: 0, top: agY, textAlign: "center", fontFamily: BIG, fontWeight: 900, fontSize: 360, lineHeight: 0.8, color: LIMA, letterSpacing: "-0.01em" }}>AGENDA</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: agY - 34, textAlign: "center", fontFamily: BIG, fontWeight: 900, fontSize: 210, lineHeight: 0.8, color: "transparent", WebkitTextStroke: "3px rgba(242,240,230,.8)", letterSpacing: "0.02em" }}>SEMANA</div>
      {/* artistas levemente sobrepostos */}
      <Foto n={noites[0]} h={fotoH} cx={250} top={fotoTop + 30} filter="drop-shadow(0 20px 30px rgba(0,0,0,.6))" />
      <Foto n={noites[2]} h={fotoH} cx={830} top={fotoTop + 30} filter="drop-shadow(0 20px 30px rgba(0,0,0,.6))" />
      <Foto n={noites[1]} h={fotoH * 1.04} cx={540} top={fotoTop} filter="drop-shadow(0 20px 40px rgba(0,0,0,.75))" />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(11,11,9,0) 88%, rgba(11,11,9,.9) 100%)" }} />
      {!feed && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 1770, textAlign: "center" }}>
          <span style={{ fontFamily: ARCHIVO, fontWeight: 800, fontSize: 24, color: PRETO, background: LIMA, padding: "8px 20px", letterSpacing: "0.12em" }}>NOME NA LISTA: LINK NA BIO</span>
        </div>
      )}
      <Grain opacity={0.12} />
      <Vignette strength={0.4} />
    </AbsoluteFill>
  );
};

// ───────────────────────── V2 · CARTAZ (ref. agendas A6) ─────────────────────────
export const AgendaV2: React.FC<P> = ({ noites, fmt, periodo }) => {
  const feed = fmt === "feed";
  const { w, h } = feed ? { w: 1080, h: 1350 } : { w: 1080, h: 1920 };
  const T = feed ? 0 : 190;
  const fotoH = feed ? 690 : 900;
  const colY = feed ? 860 : 1300;
  return (
    <AbsoluteFill style={{ background: "#0A1004", overflow: "hidden" }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% ${feed ? 30 : 32}%, rgba(200,210,0,.55) 0%, rgba(120,140,0,.25) 30%, rgba(10,16,4,0) 62%)` }} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at 12% ${feed ? 60 : 55}%, rgba(255,46,147,.22) 0%, transparent 30%), radial-gradient(circle at 90% ${feed ? 55 : 52}%, rgba(242,154,46,.22) 0%, transparent 30%)` }} />
      <RingPx width={w} height={h} look="lima" flat cx={540} cy={T + (feed ? 400 : 520)} ringH={feed ? 560 : 680} rotY={0.28} envIntensity={0.9} />
      <Img src={staticFile("logos/butiquim-branco-h.png")} style={{ position: "absolute", left: 540 - 120, top: T + 36, width: 240 }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: T + 110, textAlign: "center", fontFamily: BIG, fontWeight: 900, fontSize: feed ? 300 : 330, lineHeight: 0.8, color: OSSO, letterSpacing: "0.01em", textShadow: "0 12px 40px rgba(0,0,0,.35)" }}>AGENDA</div>
      {/* grupo sobreposto: pontas atrás, centro na frente */}
      <Foto n={noites[0]} h={fotoH * 0.92} cx={270} top={T + (feed ? 250 : 360)} fade={0.72} filter="drop-shadow(0 20px 30px rgba(0,0,0,.55))" />
      <Foto n={noites[2]} h={fotoH * 0.92} cx={810} top={T + (feed ? 250 : 360)} fade={0.72} filter="drop-shadow(0 20px 30px rgba(0,0,0,.55))" />
      <Foto n={noites[1]} h={fotoH} cx={540} top={T + (feed ? 200 : 300)} fade={0.72} filter="drop-shadow(0 24px 40px rgba(0,0,0,.7))" />
      <div style={{ position: "absolute", left: 0, right: 0, top: T + (feed ? 250 : 280), textAlign: "center", transform: "rotate(-6deg)" }}>
        <span style={{ fontFamily: YELLOWTAIL, fontSize: feed ? 150 : 170, color: LIMA, filter: "drop-shadow(0 4px 0 rgba(0,0,0,.55))" }}>Semana</span>
      </div>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(10,16,4,0) ${feed ? 55 : 58}%, rgba(10,16,4,.96) ${feed ? 66 : 69}%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: colY - 70, textAlign: "center", fontFamily: ARCHIVO, fontWeight: 800, fontSize: 24, letterSpacing: "0.34em", color: OSSO }}>{periodo} ● OUTUBRO</div>
      <div style={{ position: "absolute", left: 50, right: 50, top: colY, display: "flex", gap: 24 }}>
        {noites.map((n) => (
          <div key={n.data} style={{ flex: 1, borderTop: `6px solid ${COR[n.key]}`, paddingTop: 16 }}>
            <div style={{ fontFamily: BIG, fontWeight: 900, fontSize: 86, lineHeight: 0.85, color: OSSO }}>{n.dia}.10</div>
            <div style={{ fontFamily: ARCHIVO, fontWeight: 800, fontSize: 20, letterSpacing: "0.2em", color: COR[n.key], marginTop: 6 }}>
              {n.diaSemana} ● {n.hora}
            </div>
            <div style={{ fontFamily: ARCHIVO, fontWeight: 900, fontSize: nome(n).length > 12 ? 30 : 36, lineHeight: 1.05, color: OSSO, marginTop: 10, minHeight: 76 }}>{nome(n)}</div>
            <div style={{ marginTop: 10 }}>
              <Estilo n={n} size={17} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: colY + (feed ? 330 : 360), textAlign: "center" }}>
        <span style={{ fontFamily: ARCHIVO, fontWeight: 800, fontSize: 22, color: PRETO, background: LIMA, padding: "8px 20px", letterSpacing: "0.12em" }}>NOME NA LISTA: LINK NA BIO</span>
      </div>
      <Grain opacity={0.12} />
      <Vignette strength={0.45} />
    </AbsoluteFill>
  );
};

// ───────────────────────── V3 · REPETIÇÃO (ref. Buteko), fundo claro ─────────────────────────
export const AgendaV3: React.FC<P> = ({ noites, fmt, periodo }) => {
  const feed = fmt === "feed";
  const T = feed ? 0 : 200;
  const linhas = 4;
  const lh = feed ? 132 : 150;
  const fotoH = feed ? 560 : 700;
  const fotoTop = T + (feed ? 420 : 560);
  const cardY = feed ? 1000 : 1330;
  const sticker = (c: string) => `drop-shadow(5px 0 0 #fff) drop-shadow(-5px 0 0 #fff) drop-shadow(0 5px 0 #fff) drop-shadow(0 -5px 0 #fff) drop-shadow(8px 10px 0 ${c})`;
  return (
    <AbsoluteFill style={{ background: "#EEE9DC", overflow: "hidden" }}>
      <AbsoluteFill style={{ backgroundImage: "radial-gradient(circle, rgba(11,11,9,.12) 1.2px, transparent 1.8px)", backgroundSize: "14px 14px", opacity: 0.6 }} />
      <Img src={staticFile("logos/logo_obutiquim_policromia_horizontal.png")} style={{ position: "absolute", left: 56, top: T + 44, width: 230 }} />
      <div style={{ position: "absolute", right: 56, top: T + 46, fontFamily: ARCHIVO, fontWeight: 800, fontSize: 24, letterSpacing: "0.16em", color: PRETO }}>{periodo} ● OUT</div>
      {/* AGENDA repetido: linhas vazadas, uma cheia */}
      {Array.from({ length: linhas }, (_, i) => (
        <div key={i} style={{ position: "absolute", left: 0, right: 0, top: T + 100 + i * lh, textAlign: "center", fontFamily: BIG, fontWeight: 900, fontSize: feed ? 176 : 196, lineHeight: 0.8, letterSpacing: "0.02em", color: i === 1 ? PRETO : "transparent", WebkitTextStroke: i === 1 ? undefined : `2.5px rgba(11,11,9,${0.85 - i * 0.18})` }}>
          AGENDA
        </div>
      ))}
      {/* SEMANA por cima, em lima */}
      <div style={{ position: "absolute", left: 0, right: 0, top: T + 100 + lh * 1.55, textAlign: "center", transform: "rotate(-4deg)" }}>
        <span style={{ fontFamily: FRAUNCES, fontStyle: "italic", fontWeight: 900, fontSize: feed ? 150 : 170, color: LIMA, WebkitTextStroke: `3px ${PRETO}`, paintOrder: "stroke fill", textShadow: `6px 6px 0 ${PRETO}` }}>Semana</span>
      </div>
      {/* artistas como adesivos, levemente sobrepostos */}
      <Foto n={noites[0]} h={fotoH} cx={255} top={fotoTop + 40} fade={0.8} filter={sticker(COR.sexta)} />
      <Foto n={noites[2]} h={fotoH} cx={825} top={fotoTop + 40} fade={0.8} filter={sticker(COR.domingo)} />
      <Foto n={noites[1]} h={fotoH * 1.05} cx={540} top={fotoTop} fade={0.8} filter={sticker(COR.sabado)} />
      {/* cartões das noites */}
      <div style={{ position: "absolute", left: 40, right: 40, top: cardY, display: "flex", gap: 16 }}>
        {noites.map((n) => (
          <div key={n.data} style={{ flex: 1, background: PRETO, color: OSSO, borderRadius: 18, padding: "18px 18px 20px", boxShadow: `6px 8px 0 ${COR[n.key]}` }}>
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
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: cardY + (feed ? 280 : 320), textAlign: "center", fontFamily: ARCHIVO, fontWeight: 800, fontSize: 21, letterSpacing: "0.16em", color: PRETO }}>
        TE VEJO NA ESQUINA ● NOME NA LISTA: LINK NA BIO
      </div>
      <Grain opacity={0.1} blend="multiply" />
    </AbsoluteFill>
  );
};
