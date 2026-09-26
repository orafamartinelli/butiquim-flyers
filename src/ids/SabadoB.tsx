import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame } from "remotion";
import { ANTON, YELLOWTAIL, ARCHIVO } from "../fonts";
import { Grain, Logo, Nota, Vignette, clamp, useFade, useSpr } from "../shared/fx";
import { Ico, Icone, rnd } from "../shared/icones";
import { DIM, Formato, Noite, SUBESTILO } from "../data";

// SABADÁ B — "Lado A": capa de disco de pagode ao vivo; vinil girando solta notas, lista vira tracklist
const CREME = "#FFF3D6";
const ROXO = "#2A0838";
const AMARELO = "#F2FF3A";
const MAGENTA = "#FF2E7E";
const LARANJA = "#FF8A1E";

const BPM = 15; // um pulso a cada 15 quadros (120 bpm)
const usePulso = (desde: number, forca = 0.06) => {
  const frame = useCurrentFrame();
  if (frame < desde) return 1;
  const t = (frame - desde) % BPM;
  return 1 + forca * Math.exp(-t / 3.5);
};

const Capa: React.FC<{ h: number; cx: number; cy: number }> = ({ h, cx, cy }) => {
  const frame = useCurrentFrame();
  return (
    <>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 100%, #FFB23F 0%, ${LARANJA} 22%, ${MAGENTA} 48%, #8E1A7A 70%, ${ROXO} 100%)` }} />
      <AbsoluteFill
        style={{
          background: `repeating-conic-gradient(from ${frame * 0.25}deg at ${cx}px ${cy}px, rgba(255,243,214,.10) 0deg 6deg, rgba(255,243,214,0) 6deg 14deg)`,
          WebkitMaskImage: `radial-gradient(circle at ${cx}px ${cy}px, #000 10%, transparent ${h * 0.05}%)`,
        }}
      />
      <AbsoluteFill style={{ backgroundImage: "radial-gradient(circle, rgba(42,8,56,.35) 1.4px, transparent 2px)", backgroundSize: "12px 12px", WebkitMaskImage: "linear-gradient(180deg, transparent 40%, #000 100%)", opacity: 0.6 }} />
    </>
  );
};

// bebidas boiando no fundo
const Boias: React.FC<{ w: number; h: number; n?: number }> = ({ w, h, n = 7 }) => {
  const frame = useCurrentFrame();
  const icones: Icone[] = ["chope", "caipirinha", "drink", "garrafa"];
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: n }, (_, i) => {
        const x = rnd(i + 3) * w;
        const y = (rnd(i + 11) * h + frame * (0.6 + rnd(i) * 0.8)) % (h + 200) - 100;
        const rot = Math.sin(frame / 20 + i) * 14;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: h - y, transform: `rotate(${rot}deg)`, opacity: 0.28 }}>
            <Ico i={icones[i % icones.length]} size={70 + rnd(i + 7) * 60} color={CREME} stroke={1.4} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// vinil: sulcos + brilho fixo + rótulo girando com data e o "O"
const Vinil: React.FC<{ n: Noite; cx: number; cy: number; d: number; delay: number; tilt?: number }> = ({ n, cx, cy, d, delay, tilt = 16 }) => {
  const frame = useCurrentFrame();
  const s = useSpr(delay, { damping: 16, stiffness: 70 });
  const rot = frame * 4.2;
  const lbl = d * 0.36;
  return (
    <div style={{ position: "absolute", left: cx - d / 2 + (1 - s) * 420, top: cy - d / 2, width: d, height: d, perspective: 1600, opacity: Math.min(1, s * 2) }}>
      <div style={{ width: d, height: d, transform: `rotateY(${-tilt}deg) rotateX(${tilt * 0.4}deg)`, filter: "drop-shadow(0 30px 40px rgba(0,0,0,.55))" }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "repeating-radial-gradient(circle at 50% 50%, #0d0d0f 0 2px, #1b1b1f 2px 3px, #0f0f12 3px 5px)", boxShadow: "inset 0 0 0 6px #050506" }} />
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "conic-gradient(from 20deg, rgba(255,255,255,0) 0deg, rgba(255,255,255,.16) 30deg, rgba(255,255,255,0) 70deg, rgba(255,255,255,0) 180deg, rgba(255,255,255,.12) 215deg, rgba(255,255,255,0) 250deg)" }} />
        <div style={{ position: "absolute", left: d / 2 - lbl / 2, top: d / 2 - lbl / 2, width: lbl, height: lbl, borderRadius: "50%", transform: `rotate(${rot}deg)`, background: `radial-gradient(circle, ${ROXO} 0 4%, ${AMARELO} 4.5% 100%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: ROXO, boxShadow: "inset 0 0 0 4px rgba(42,8,56,.25)" }}>
          <Img src={staticFile("logos/o-simbolo.png")} style={{ width: lbl * 0.2, position: "absolute", top: lbl * 0.1, filter: "brightness(0) saturate(100%)", opacity: 0.8 }} />
          <div style={{ fontFamily: ANTON, fontSize: lbl * 0.2, lineHeight: 1, marginTop: lbl * 0.08 }}>{n.dia}.10</div>
          <div style={{ fontFamily: ARCHIVO, fontWeight: 800, fontSize: lbl * 0.07, letterSpacing: "0.2em", marginTop: lbl * 0.16 }}>LADO A ● {n.hora}</div>
        </div>
      </div>
    </div>
  );
};

// notas saindo do disco
const Notas: React.FC<{ cx: number; cy: number; r: number; desde: number; qtd?: number }> = ({ cx, cy, r, desde, qtd = 16 }) => {
  const frame = useCurrentFrame();
  const cores = [CREME, AMARELO, "#ffffff"];
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: qtd }, (_, i) => {
        const nasce = desde + i * 12;
        const vida = 70;
        const t = (frame - nasce + 1000 * vida) % vida;
        if (frame < nasce) return null;
        const ang = -Math.PI * (0.15 + rnd(i) * 0.9);
        const dist = r * 0.95 + t * (3 + rnd(i + 5) * 2.2);
        const x = cx + Math.cos(ang) * dist + Math.sin(t / 7 + i) * 14;
        const y = cy + Math.sin(ang) * dist;
        const op = interpolate(t, [0, 8, vida - 20, vida], [0, 1, 1, 0], clamp);
        const sz = 52 + rnd(i + 9) * 44;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, opacity: op, transform: `rotate(${Math.sin(t / 9 + i) * 20}deg) scale(${interpolate(t, [0, 10], [0.4, 1], clamp)})`, filter: "drop-shadow(0 4px 6px rgba(42,8,56,.4))" }}>
            <Nota size={sz} color={cores[i % cores.length]} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Titulo: React.FC<{ top: number; size: number; delay: number; left?: number; align?: "center" | "left" }> = ({ top, size, delay, left = 0, align = "center" }) => {
  const frame = useCurrentFrame();
  const pulso = usePulso(delay + 30, 0.05);
  return (
    <div style={{ position: "absolute", top, left, right: align === "center" ? 0 : undefined, display: "flex", justifyContent: align === "center" ? "center" : "flex-start", transform: `scale(${pulso})`, transformOrigin: align === "center" ? "50% 60%" : "0% 60%" }}>
      <div style={{ display: "flex", transform: "skewX(-9deg)" }}>
        {"SABADÁ".split("").map((c, i) => {
          const p = interpolate(frame - delay - i * 3, [0, 9], [0, 1], clamp);
          return (
            <span key={i} style={{ display: "inline-block", fontFamily: ANTON, fontSize: size, lineHeight: 1, color: CREME, transform: `translateY(${(1 - p) * -size}px) rotate(${(1 - p) * -25}deg)`, opacity: p, textShadow: `0 0 0 ${ROXO}, 5px 5px 0 ${ROXO}, 10px 10px 0 ${MAGENTA}, 14px 14px 0 rgba(0,0,0,.25)`, WebkitTextStroke: `4px ${ROXO}`, paintOrder: "stroke fill" }}>
              {c}
            </span>
          );
        })}
      </div>
    </div>
  );
};

const AoVivo: React.FC<{ x: number; y: number; size: number; delay: number }> = ({ x, y, size, delay }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, 18], [0, 100], clamp);
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: "rotate(-8deg)", filter: `drop-shadow(3px 4px 0 ${ROXO})` }}>
      <div style={{ fontFamily: YELLOWTAIL, fontSize: size, color: AMARELO, lineHeight: 1, whiteSpace: "nowrap", clipPath: `inset(-20% ${100 - p}% -20% -5%)`, paddingRight: 10 }}>ao vivo no Butica</div>
    </div>
  );
};

// selo de preço estourado com a data
const Estouro: React.FC<{ n: Noite; x: number; y: number; d: number; delay: number }> = ({ n, x, y, d, delay }) => {
  const s = useSpr(delay, { damping: 8, stiffness: 150 });
  const frame = useCurrentFrame();
  const pts = Array.from({ length: 32 }, (_, i) => {
    const a = (i / 32) * Math.PI * 2;
    const r = i % 2 ? 42 : 50;
    return `${50 + Math.cos(a) * r}% ${50 + Math.sin(a) * r}%`;
  }).join(",");
  return (
    <div style={{ position: "absolute", left: x - d / 2, top: y - d / 2, width: d, height: d, transform: `scale(${s}) rotate(${12 + Math.sin(frame / 18) * 4}deg)`, filter: `drop-shadow(4px 6px 0 ${ROXO})` }}>
      <div style={{ position: "absolute", inset: 0, background: AMARELO, clipPath: `polygon(${pts})` }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: ROXO, lineHeight: 0.95 }}>
        <div style={{ fontFamily: ARCHIVO, fontWeight: 900, fontSize: d * 0.1, letterSpacing: "0.12em" }}>{n.diaSemana.slice(0, 3)}</div>
        <div style={{ fontFamily: ANTON, fontSize: d * 0.3 }}>{n.dia}.10</div>
        <div style={{ fontFamily: ARCHIVO, fontWeight: 900, fontSize: d * 0.13 }}>{n.hora}</div>
      </div>
    </div>
  );
};

// tracklist digitada (a lista da noite como faixas do disco)
const Faixas: React.FC<{ n: Noite; x: number; y: number; w: number; delay: number; size?: number; cta?: boolean }> = ({ n, x, y, w, delay, size = 24, cta }) => {
  const frame = useCurrentFrame();
  const s = useSpr(delay - 6, { damping: 16 });
  const faixas = [`${n.artista} AO VIVO`, n.lista[0], n.lista[1], "DESCONTO NA PORTARIA APÓS A 1ª HORA*", ...(cta ? ["NOME NA LISTA: LINK NA BIO"] : [])];
  let t = frame - delay;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, transform: `rotate(-2deg) translateY(${(1 - s) * 60}px)`, opacity: s, background: CREME, color: ROXO, padding: "18px 24px 16px", boxShadow: `8px 10px 0 ${ROXO}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: `3px solid ${ROXO}`, paddingBottom: 6, marginBottom: 10 }}>
        <span style={{ fontFamily: ANTON, fontSize: size * 1.5, letterSpacing: "0.04em" }}>LADO A</span>
        <span style={{ fontFamily: ARCHIVO, fontWeight: 800, fontSize: size * 0.7, letterSpacing: "0.16em" }}>O BUTIQUIM ● 33 RPM</span>
      </div>
      {faixas.map((f, i) => {
        const txt = `${String(i + 1).padStart(2, "0")}  ${f}`;
        const vis = Math.max(0, Math.min(txt.length, Math.floor(t * 1.6)));
        t -= txt.length / 1.6 + 2;
        return (
          <div key={i} style={{ fontFamily: ARCHIVO, fontWeight: i === 0 ? 900 : 700, fontSize: size * (i === 0 ? 1.05 : 0.9), lineHeight: 1.45, whiteSpace: "nowrap", color: i === 4 ? MAGENTA : ROXO }}>
            {txt.slice(0, vis)}
            {vis > 0 && vis < txt.length && <span style={{ opacity: 0.6 }}>▌</span>}
          </div>
        );
      })}
    </div>
  );
};

// aviso estilo "parental advisory"
const Aviso: React.FC<{ x: number; y: number; w: number; delay: number }> = ({ x, y, w, delay }) => {
  const s = useSpr(delay, { damping: 12 });
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, transform: `scale(${s})`, transformOrigin: "left bottom", background: "#fff", border: "4px solid #000", textAlign: "center", fontFamily: ARCHIVO, color: "#000", lineHeight: 1 }}>
      <div style={{ fontWeight: 900, fontSize: w * 0.105, letterSpacing: "0.1em", padding: "6px 0 4px" }}>AVISO</div>
      <div style={{ background: "#000", color: "#fff", fontWeight: 900, fontSize: w * 0.105, padding: "6px 0" }}>CONTÉM PAGODE</div>
      <div style={{ fontWeight: 800, fontSize: w * 0.07, padding: "5px 0 6px", letterSpacing: "0.06em" }}>ATÉ O DIA CLAREAR</div>
    </div>
  );
};

const Estilo: React.FC<{ n: Noite; x: number; y: number; delay: number; size?: number }> = ({ n, x, y, delay, size = 24 }) => {
  const s = useSpr(delay, { damping: 10 });
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `rotate(-3deg) scale(${s})`, transformOrigin: "left top", display: "flex", alignItems: "center", gap: 10, background: ROXO, color: AMARELO, padding: "8px 18px 9px 12px", border: `3px solid ${AMARELO}`, boxShadow: `4px 5px 0 ${MAGENTA}` }}>
      <Nota size={size * 1.15} color={AMARELO} />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontFamily: ANTON, fontSize: size * 1.3, lineHeight: 1, letterSpacing: "0.06em" }}>{n.estilo}</span>
        <span style={{ fontFamily: ARCHIVO, fontWeight: 700, fontSize: size * 0.56, lineHeight: 1.15, color: CREME, opacity: 0.85, marginTop: 2 }}>{SUBESTILO}</span>
      </div>
    </div>
  );
};

const Grupo: React.FC<{ n: Noite; cx: number; top: number; h: number; delay: number }> = ({ n, cx, top, h, delay }) => {
  const s = useSpr(delay, { damping: 14 });
  const pulso = usePulso(delay + 40, 0.015);
  const w = h * n.foto.ratio;
  const mask = "linear-gradient(180deg, #000 62%, transparent 92%)";
  return (
    <Img src={staticFile(n.foto.src)} style={{ position: "absolute", height: h, width: w, left: cx - w / 2, top: top + (1 - s) * 240, opacity: s, transform: `scale(${pulso})`, transformOrigin: "50% 100%", WebkitMaskImage: mask, maskImage: mask, filter: `drop-shadow(-12px 0 0 ${ROXO}) drop-shadow(0 30px 40px rgba(42,8,56,.5)) contrast(1.05) saturate(1.05)` }} />
  );
};

const LogoArtista: React.FC<{ n: Noite; x: number; y: number; w: number; delay: number }> = ({ n, x, y, w, delay }) => {
  const s = useSpr(delay, { damping: 11 });
  if (!n.artistaLogo) return null;
  return <Img src={staticFile(n.artistaLogo.src)} style={{ position: "absolute", left: x, top: y, width: w, transform: `scale(${s}) rotate(-4deg)`, transformOrigin: "left bottom", filter: `drop-shadow(5px 6px 0 ${ROXO})` }} />;
};

export const SabadoB: React.FC<{ n: Noite; fmt: Formato }> = ({ n, fmt }) => {
  if (fmt === "broll") return <SabadoBBroll n={n} />;
  const { w, h } = DIM[fmt];
  const feed = fmt === "feed";
  const V = feed ? { cx: 700, cy: 700, d: 700 } : { cx: 700, cy: 1000, d: 780 };
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Capa h={h} cx={V.cx} cy={V.cy} />
      <Boias w={w} h={h} />
      <Vinil n={n} cx={V.cx} cy={V.cy} d={V.d} delay={4} />
      <Notas cx={V.cx} cy={V.cy} r={V.d / 2} desde={24} />
      <Grupo n={n} cx={feed ? 370 : 380} top={feed ? 330 : 560} h={feed ? 1150 : 1420} delay={10} />
      <Titulo top={feed ? 86 : 262} size={feed ? 200 : 230} delay={4} />
      <AoVivo x={feed ? 330 : 330} y={feed ? 262 : 470} size={feed ? 84 : 94} delay={22} />
      <Estouro n={n} x={feed ? 930 : 930} y={feed ? 380 : 640} d={feed ? 200 : 230} delay={34} />
      <LogoArtista n={n} x={feed ? 44 : 50} y={feed ? 1060 : 1290} w={feed ? 270 : 300} delay={30} />
      <Faixas n={n} x={feed ? 470 : 360} y={feed ? 1010 : 1420} w={feed ? 580 : 680} delay={44} size={feed ? 21 : 25} cta={!feed} />
      {!feed && <Aviso x={56} y={1560} w={250} delay={60} />}
      <Logo width={feed ? 210 : 240} top={feed ? 34 : 214} />
      <Estilo n={n} x={feed ? 26 : 44} y={feed ? 20 : 196} delay={18} size={feed ? 24 : 27} />
      <Grain opacity={0.13} />
      <Vignette strength={0.35} color="42,8,56" />
    </AbsoluteFill>
  );
};

// STORY com B-roll: o show vira a "foto da capa" num envelope de LP; o disco espia pela lateral
const SabadoBBroll: React.FC<{ n: Noite }> = ({ n }) => {
  const vid = useFade(0, 10);
  const { w, h } = DIM.broll;
  const SX = 60, SY = 180, SW = 800, SH = 800;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Capa h={h} cx={540} cy={1500} />
      <Boias w={w} h={h} n={6} />
      <Vinil n={n} cx={SX + SW - 60} cy={SY + SH / 2} d={740} delay={6} tilt={8} />
      <div style={{ position: "absolute", left: SX, top: SY, width: SW, height: SH, background: CREME, padding: 14, boxShadow: `12px 14px 0 ${ROXO}`, transform: "rotate(-2deg)", opacity: vid }}>
        <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
          <OffthreadVideo src={staticFile(n.clip)} style={{ width: SW - 28, height: (SW - 28) * (1920 / 1080), objectFit: "cover", marginTop: -300, filter: "contrast(1.08) saturate(1.2)" }} volume={(f) => interpolate(f, [0, 8, 285, 300], [0, 1, 1, 0], clamp)} />
          <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(42,8,56,.5) 0%, rgba(42,8,56,0) 25%)" }} />
        </div>
      </div>
      <Notas cx={SX + SW - 60} cy={SY + SH / 2} r={370} desde={20} qtd={12} />
      <Logo width={240} top={214} />
      <Estilo n={n} x={44} y={196} delay={12} size={26} />
      <Grupo n={n} cx={850} top={950} h={880} delay={10} />
      <Estouro n={n} x={900} y={260} d={190} delay={28} />
      <Titulo top={1016} size={165} delay={8} left={40} align="left" />
      <AoVivo x={70} y={1196} size={70} delay={20} />
      <LogoArtista n={n} x={50} y={1290} w={240} delay={26} />
      <Faixas n={n} x={40} y={1470} w={660} delay={36} size={23} cta />
      <Grain opacity={0.13} />
      <Vignette strength={0.35} color="42,8,56" />
    </AbsoluteFill>
  );
};
