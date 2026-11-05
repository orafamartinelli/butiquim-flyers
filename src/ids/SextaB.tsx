import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame } from "remotion";
import { BARLOW, ARCHIVO } from "../fonts";
import { Grain, Logo, Nota, Vignette, clamp, useFade, useSpr } from "../shared/fx";
import { RingPx } from "../shared/Ring3D";
import { Ico, Icone, rnd } from "../shared/icones";
import { DIM, Formato, Noite, SUBESTILO } from "../data";

// SEXTA B — "Painel de Embarque": a Sexta do Butica como destino num painel de partidas (split-flap)
const LIMA = "#C8D200";
const AMARELO = "#FFD23F";
const PAINEL = "#121314";
const CELULA = "#1E2022";
const TEXTO = "#F3F0E6";
const CINZA = "#8E9296";
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

// uma plaqueta que gira até parar no caractere certo
const Flap: React.FC<{ c: string; start: number; seed: number; w: number; h: number; color?: string; flips?: number }> = ({ c, start, seed, w, h, color = TEXTO, flips = 7 }) => {
  const frame = useCurrentFrame();
  const t = frame - start;
  const k = Math.floor(t / 2);
  const fim = flips + Math.floor(rnd(seed) * 5);
  let ch = " ";
  if (t >= 0) ch = k < fim ? CHARS[Math.floor(rnd(seed * 31 + k) * CHARS.length)] : c;
  const girando = t >= 0 && k <= fim && t % 2 === 0;
  return (
    <div style={{ position: "relative", width: w, height: h, borderRadius: 5, background: `linear-gradient(180deg, #25282a 0%, ${CELULA} 49%, #151718 51%, #1b1d1f 100%)`, boxShadow: "inset 0 1px 0 rgba(255,255,255,.08), 0 2px 3px rgba(0,0,0,.6)", overflow: "hidden", flex: "0 0 auto" }}>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: BARLOW, fontWeight: 800, fontSize: h * 0.8, lineHeight: 1, color, transform: girando ? "scaleY(0.82)" : undefined }}>{ch === " " ? "" : ch}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 2, marginTop: -1, background: "rgba(0,0,0,.75)" }} />
      {girando && <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: "50%", background: "linear-gradient(180deg, rgba(0,0,0,.05), rgba(0,0,0,.55))" }} />}
    </div>
  );
};

const Flaps: React.FC<{ text: string; start: number; w: number; h: number; gap?: number; color?: string; seed?: number }> = ({ text, start, w, h, gap = 4, color, seed = 1 }) => (
  <div style={{ display: "flex", gap }}>
    {text.split("").map((c, i) =>
      c === " " ? <div key={i} style={{ width: w * 0.45 }} /> : <Flap key={i} c={c} start={start + i * 2} seed={seed * 100 + i} w={w} h={h} color={color} />,
    )}
  </div>
);

// plaqueta de ícone: gira entre as bebidas
const FlapIcone: React.FC<{ icones: Icone[]; start: number; size: number; periodo?: number; seed: number }> = ({ icones, start, size, periodo = 40, seed }) => {
  const frame = useCurrentFrame();
  const t = Math.max(0, frame - start);
  const idx = Math.floor((t + seed * 13) / periodo) % icones.length;
  const girando = frame >= start && (t + seed * 13) % periodo < 3;
  return (
    <div style={{ position: "relative", width: size, height: size, borderRadius: 6, background: `linear-gradient(180deg, #25282a 0%, ${CELULA} 49%, #151718 51%, #1b1d1f 100%)`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", opacity: frame >= start ? 1 : 0.3 }}>
      <div style={{ transform: girando ? "scaleY(0.6)" : undefined }}>
        <Ico i={icones[idx]} size={size * 0.66} color={AMARELO} stroke={1.7} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 2, marginTop: -1, background: "rgba(0,0,0,.75)" }} />
    </div>
  );
};

const Rotulo: React.FC<{ t: string; size?: number }> = ({ t, size = 20 }) => (
  <div style={{ fontFamily: BARLOW, fontWeight: 700, fontSize: size, letterSpacing: "0.22em", color: CINZA, marginBottom: 8 }}>{t}</div>
);

// relógio do terminal: vira 23:00 = hora do show
const Relogio: React.FC<{ x: number; y: number; size: number; hora: string }> = ({ x, y, size, hora }) => {
  const frame = useCurrentFrame();
  const h = parseInt(hora, 10);
  const min = frame < 64 ? 59 : 0;
  const hh = frame < 64 ? h - 1 : h;
  const txt = `${String(hh).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
  const pisca = Math.floor(frame / 15) % 2 === 0;
  return (
    <div style={{ position: "absolute", right: x, top: y, fontFamily: BARLOW, fontWeight: 800, fontSize: size, color: AMARELO, letterSpacing: "0.04em", textShadow: `0 0 18px rgba(255,210,63,.55)` }}>
      {txt.slice(0, 2)}
      <span style={{ opacity: pisca ? 1 : 0.2 }}>:</span>
      {txt.slice(3)}
    </div>
  );
};

const Estilo: React.FC<{ n: Noite; x: number; y: number; delay: number; size?: number }> = ({ n, x, y, delay, size = 24 }) => {
  const s = useSpr(delay, { damping: 12 });
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translateY(${(1 - s) * -80}px)`, opacity: Math.min(1, s * 3), display: "flex", alignItems: "center", gap: 10, background: AMARELO, color: PAINEL, borderRadius: 6, padding: "7px 16px 8px 10px", boxShadow: "0 8px 20px rgba(0,0,0,.5)" }}>
      <Nota size={size * 1.15} color={PAINEL} />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontFamily: BARLOW, fontWeight: 900, fontSize: size * 1.25, lineHeight: 1, letterSpacing: "0.08em" }}>{n.estilo}</span>
        <span style={{ fontFamily: ARCHIVO, fontWeight: 700, fontSize: size * 0.56, lineHeight: 1.15, opacity: 0.75, marginTop: 2 }}>{SUBESTILO}</span>
      </div>
    </div>
  );
};

const Status: React.FC<{ start: number; h: number }> = ({ start, h }) => {
  const frame = useCurrentFrame();
  const on = frame >= start + 26 && Math.floor(frame / 12) % 2 === 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <Flaps text="CONFIRMADO" start={start} w={h * 0.62} h={h} gap={3} color={LIMA} seed={9} />
      <div style={{ width: h * 0.34, height: h * 0.34, borderRadius: "50%", background: on ? LIMA : "#3a3f22", boxShadow: on ? `0 0 16px ${LIMA}` : "none" }} />
    </div>
  );
};

const Terminal: React.FC = () => (
  <>
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #16181a 0%, #0c0d0e 100%)" }} />
    <AbsoluteFill style={{ backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,.025) 0 2px, transparent 2px 120px)" }} />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 30%, rgba(200,210,0,.20) 0%, rgba(200,210,0,0) 55%)" }} />
  </>
);

// noite temática (ex.: 20/11 "Especial Clássicos"): o tema entra no lugar do DESTINO e o repertório no lugar do STATUS
export type TemaNoite = { titulo: string; repertorio: string };
const Painel: React.FC<{ n: Noite; x: number; y: number; w: number; cell: number; start: number; compacto?: boolean; tema?: TemaNoite }> = ({ n, x, y, w, cell, start, compacto, tema }) => {
  const s = useSpr(start - 8, { damping: 18 });
  const nome = n.artista.replace("&", "E");
  // nome da atração ocupa a largura toda do painel (plaquetas crescem ou encolhem conforme o tamanho do nome)
  const unidades = nome.split("").reduce((t, c) => t + (c === " " ? 0.45 : 1), 0);
  const wNome = Math.min(cell * 1.05, (w - 52 - 4 * (nome.length - 1)) / unidades);
  const wRep = tema ? Math.min(cell * 0.4, (w - 52 - 3 * (tema.repertorio.length - 1)) / tema.repertorio.split("").reduce((t, c) => t + (c === " " ? 0.45 : 1), 0)) : 0;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, transform: `translateY(${(1 - s) * 60}px)`, opacity: s, background: PAINEL, borderRadius: 14, padding: "22px 26px 24px", boxShadow: "0 30px 60px rgba(0,0,0,.6), inset 0 0 0 2px #26292c" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #26292c", paddingBottom: 12, marginBottom: 16 }}>
        <div style={{ fontFamily: BARLOW, fontWeight: 900, fontSize: cell * 0.62, letterSpacing: "0.14em", color: AMARELO }}>PARTIDAS</div>
        <div style={{ fontFamily: BARLOW, fontWeight: 700, fontSize: cell * 0.36, letterSpacing: "0.2em", color: CINZA }}>SEXTA DO BUTICA ● DEPARTURES</div>
      </div>
      <Rotulo t="ATRAÇÃO" size={cell * 0.28} />
      <Flaps text={nome} start={start} w={wNome} h={wNome / 0.72} seed={1} />
      <div style={{ display: "flex", gap: 40, marginTop: 22 }}>
        <div>
          <Rotulo t="DATA" size={cell * 0.28} />
          <Flaps text={`${n.diaSemana.slice(0, 3)} ${n.dia} ${n.mes}`} start={start + 14} w={cell * 0.5} h={cell * 0.72} seed={2} />
        </div>
        <div>
          <Rotulo t="EMBARQUE" size={cell * 0.28} />
          <Flaps text={n.hora} start={start + 30} w={cell * 0.5} h={cell * 0.72} seed={3} color={AMARELO} />
        </div>
      </div>
      {!compacto && (
        <div style={{ display: "flex", gap: 40, marginTop: 22, alignItems: "flex-end" }}>
          <div>
            <Rotulo t={tema ? "TEMA DA NOITE" : "DESTINO"} size={cell * 0.28} />
            <Flaps text={tema ? tema.titulo : "ESQUINA DE VIDRO"} start={start + 22} w={cell * (tema ? 0.5 : 0.4)} h={cell * (tema ? 0.72 : 0.58)} gap={3} seed={4} color={tema ? AMARELO : undefined} />
          </div>
        </div>
      )}
      {tema ? (
        <div style={{ marginTop: 22 }}>
          <Rotulo t="UMA NOITE COM SUCESSOS DE" size={cell * 0.28} />
          <Flaps text={tema.repertorio} start={start + 36} w={wRep} h={wRep / 0.72} gap={3} seed={5} color={LIMA} />
        </div>
      ) : (
      <div style={{ display: "flex", gap: 40, marginTop: 22, alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <Rotulo t="STATUS" size={cell * 0.28} />
          <Status start={start + 36} h={cell * 0.58} />
        </div>
        <div>
          <Rotulo t="SERVIÇO DE BORDO" size={cell * 0.28} />
          <div style={{ display: "flex", gap: 6 }}>
            {(["chope", "caipirinha", "drink", "garrafa"] as Icone[]).map((ic, i, arr) => (
              <FlapIcone key={i} icones={[...arr.slice(i), ...arr.slice(0, i)]} start={start + 40 + i * 3} size={cell * 0.62} seed={i} />
            ))}
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

// cartão de embarque com a lista
const Bilhete: React.FC<{ n: Noite; x: number; y: number; w: number; delay: number; size?: number; cta?: boolean }> = ({ n, x, y, w, delay, size = 25, cta }) => {
  const s = useSpr(delay, { damping: 16 });
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, transform: `translateY(${(1 - s) * 80}px)`, opacity: s, display: "flex", borderRadius: 12, overflow: "hidden", boxShadow: "0 16px 30px rgba(0,0,0,.5)" }}>
      <div style={{ flex: 1, background: TEXTO, color: PAINEL, padding: "12px 22px" }}>
        <div style={{ fontFamily: BARLOW, fontWeight: 800, fontSize: size, letterSpacing: "0.04em" }}>
          {n.lista[0]} <span style={{ color: "#8a9600" }}>●</span> {n.lista[1]}
        </div>
        <div style={{ fontFamily: ARCHIVO, fontWeight: 500, fontSize: size * 0.62, opacity: 0.75, marginTop: 3 }}>{n.obs}</div>
      </div>
      <div style={{ width: 0, borderLeft: `3px dashed ${PAINEL}`, opacity: 0.3, background: TEXTO }} />
      <div style={{ background: LIMA, color: PAINEL, padding: "12px 18px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", fontFamily: BARLOW, fontWeight: 900, fontSize: size * 0.8, letterSpacing: "0.08em", lineHeight: 1.05, textAlign: "center" }}>
        {cta ? (
          <>
            NOME NA
            <br />
            LISTA: BIO
          </>
        ) : (
          <>
            PORTÃO
            <br />
            ESQUINA
          </>
        )}
      </div>
    </div>
  );
};

const useO = () => {
  const frame = useCurrentFrame();
  const inn = useSpr(0, { damping: 18, stiffness: 60 });
  return { rotY: interpolate(inn, [0, 1], [1.5, 0.25]) + Math.sin(frame / 36) * 0.12, grow: interpolate(inn, [0, 1], [0.5, 1]) };
};

// foto do grupo (corte reto embaixo): entra subindo, com o "O" lima atrás
const Banda: React.FC<{ n: Noite; w: number; h: number; cx: number; bottom: number; fotoW: number; oH: number; oCy: number; canvasW: number; canvasH: number; topMin: number; hMax: number }> = ({ n, cx, bottom, fotoW: wMax, oH, oCy, canvasW, canvasH, topMin, hMax }) => {
  const art = useSpr(10, { damping: 15 });
  const o = useO();
  // foto larga: encosta no painel; foto alta (grupo em pé): fixa o topo e o resto some atrás do painel
  let fotoW = wMax;
  let fotoH = fotoW / n.foto.ratio;
  if (bottom - fotoH < topMin) {
    fotoH = Math.min(fotoH, hMax);
    fotoW = fotoH * n.foto.ratio;
    bottom = topMin + fotoH;
  }
  return (
    <>
      <RingPx width={canvasW} height={canvasH} look="lima" flat cx={cx} cy={oCy} ringH={oH * o.grow} rotY={o.rotY} envIntensity={0.9} />
      <Img src={staticFile(n.foto.src)} style={{ position: "absolute", width: fotoW, height: fotoH, left: cx - fotoW / 2, top: bottom - fotoH + (1 - art) * 160, opacity: art, filter: "drop-shadow(0 20px 40px rgba(0,0,0,.6)) contrast(1.05)" }} />
    </>
  );
};

export const SextaB: React.FC<{ n: Noite; fmt: Formato; tema?: TemaNoite }> = ({ n, fmt, tema }) => {
  if (fmt === "broll") return <SextaBBroll n={n} />;
  const { w, h } = DIM[fmt];
  const feed = fmt === "feed";
  const frame = useCurrentFrame();
  const push = interpolate(frame, [0, 240], [1, 1.03], clamp);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Terminal />
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "50% 30%" }}>
        <Banda n={n} w={w} h={h} cx={540} bottom={feed ? 700 : 1010} fotoW={feed ? 900 : 1000} oH={feed ? 560 : 660} oCy={feed ? 390 : 640} canvasW={w} canvasH={h} topMin={feed ? 100 : 290} hMax={feed ? 1100 : 1300} />
      </AbsoluteFill>
      <Logo width={feed ? 210 : 240} top={feed ? 34 : 214} />
      <Estilo n={n} x={feed ? 28 : 46} y={feed ? 22 : 200} delay={20} size={feed ? 25 : 29} />
      <Relogio x={feed ? 34 : 50} y={feed ? 20 : 198} size={feed ? 52 : 58} hora={n.hora} />
      <Painel n={n} x={40} y={feed ? 662 : 990} w={1000} cell={feed ? 70 : 84} start={18} tema={tema} />
      <Bilhete n={n} x={40} y={feed ? 1232 : 1640} w={1000} delay={56} size={feed ? 24 : 26} cta={!feed} />
      <Grain opacity={0.1} />
      <Vignette strength={0.45} />
    </AbsoluteFill>
  );
};

// STORY com B-roll: o show no "monitor" do terminal, painel compacto embaixo
const SextaBBroll: React.FC<{ n: Noite }> = ({ n }) => {
  const vid = useFade(0, 10);
  const frame = useCurrentFrame();
  const aoVivo = Math.floor(frame / 15) % 2 === 0;
  const MX = 40, MY = 180, MW = 1000, MH = 820;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Terminal />
      <div style={{ position: "absolute", left: MX - 12, top: MY - 12, width: MW + 24, height: MH + 24, borderRadius: 26, background: "#070808", boxShadow: "0 30px 60px rgba(0,0,0,.7), inset 0 0 0 2px #2a2d30", opacity: vid }} />
      <div style={{ position: "absolute", left: MX, top: MY, width: MW, height: MH, borderRadius: 16, overflow: "hidden", opacity: vid }}>
        <OffthreadVideo src={staticFile(n.clip)} style={{ width: MW, height: MW * (1920 / 1080), objectFit: "cover", marginTop: -40, filter: "contrast(1.06) saturate(1.08)" }} volume={(f) => interpolate(f, [0, 8, 285, 300], [0, 1, 1, 0], clamp)} />
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 80%, rgba(0,0,0,.6) 100%)" }} />
        <AbsoluteFill style={{ backgroundImage: "repeating-linear-gradient(180deg, rgba(0,0,0,.12) 0 2px, transparent 2px 4px)" }} />
      </div>
      <div style={{ position: "absolute", left: MX + 24, top: MY + MH - 70, display: "flex", alignItems: "center", gap: 10, background: "rgba(0,0,0,.6)", padding: "8px 16px", borderRadius: 6, fontFamily: BARLOW, fontWeight: 800, fontSize: 26, letterSpacing: "0.14em", color: TEXTO, opacity: vid }}>
        <div style={{ width: 14, height: 14, borderRadius: 7, background: aoVivo ? "#ff3b3b" : "#5a1a1a" }} /> NO PALCO DO BUTICA
      </div>
      <Logo width={240} top={214} />
      <Estilo n={n} x={64} y={206} delay={12} size={27} />
      <Painel n={n} x={40} y={1040} w={1000} cell={84} start={14} compacto />
      <Bilhete n={n} x={40} y={1600} w={1000} delay={50} size={25} cta />
      <Grain opacity={0.1} />
      <Vignette strength={0.4} />
    </AbsoluteFill>
  );
};
