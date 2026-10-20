import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame } from "remotion";
import { BEBAS, ALFA, LEAGUE, ARCHIVO } from "../fonts";
import { Grain, Logo, Nota, Vignette, clamp, useFade, useSpr } from "../shared/fx";
import { RingPx } from "../shared/Ring3D";
import { rnd } from "../shared/icones";
import { DIM, Formato, Noite, SUBESTILO } from "../data";

// SEXTA C — "Lambe-lambe": cartaz de show colado no poste, papel osso, tinta preta e lima, rasgos e fita
const LIMA = "#C8D200";
const PRETO = "#0B0B09";
const OSSO = "#F2EEDC";
const MURO = "#2A2A26";

// borda rasgada: polígono com dentes irregulares nos 4 lados
const rasgo = (seed: number, amp = 1.2) => {
  const pts: string[] = [];
  const n = 26;
  for (let i = 0; i <= n; i++) pts.push(`${(i / n) * 100}% ${rnd(seed + i) * amp}%`);
  for (let i = 1; i <= n; i++) pts.push(`${100 - rnd(seed + 100 + i) * amp * 0.8}% ${(i / n) * 100}%`);
  for (let i = n; i >= 0; i--) pts.push(`${(i / n) * 100}% ${100 - rnd(seed + 200 + i) * amp}%`);
  for (let i = n - 1; i >= 1; i--) pts.push(`${rnd(seed + 300 + i) * amp * 0.8}% ${(i / n) * 100}%`);
  return `polygon(${pts.join(",")})`;
};

const Muro: React.FC = () => (
  <>
    <AbsoluteFill style={{ background: `linear-gradient(180deg, #3a3a35 0%, ${MURO} 45%, #1a1a17 100%)` }} />
    <AbsoluteFill style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,.035) 0 1px, transparent 1px 7px), repeating-linear-gradient(90deg, rgba(0,0,0,.18) 0 2px, transparent 2px 160px)" }} />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 30%, rgba(200,210,0,.10) 0%, rgba(0,0,0,0) 60%)" }} />
  </>
);

// cartazes antigos atrás: pedaços rasgados de campanhas passadas
const Velho: React.FC<{ x: number; y: number; w: number; h: number; rot: number; cor: string; texto: string; seed: number; o?: number }> = ({ x, y, w, h, rot, cor, texto, seed, o = 0.55 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, transform: `rotate(${rot}deg)`, background: cor, clipPath: rasgo(seed, 3), opacity: o, overflow: "hidden", filter: "contrast(.9) brightness(.85)" }}>
    <div style={{ position: "absolute", left: -20, top: 10, fontFamily: LEAGUE, fontSize: h * 0.9, lineHeight: 0.9, color: cor === OSSO ? PRETO : OSSO, opacity: 0.35, whiteSpace: "nowrap", letterSpacing: "0.02em" }}>{texto}</div>
  </div>
);

const Fita: React.FC<{ x: number; y: number; rot: number; w?: number }> = ({ x, y, rot, w = 150 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: 44, transform: `rotate(${rot}deg)`, background: "rgba(245,240,220,.55)", boxShadow: "0 2px 6px rgba(0,0,0,.25)", backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,.25) 0 3px, transparent 3px 9px)" }} />
);

// estilo: adesivo preto colado torto
const Estilo: React.FC<{ n: Noite; x: number; y: number; delay: number; size?: number }> = ({ n, x, y, delay, size = 26 }) => {
  const s = useSpr(delay, { damping: 10 });
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `rotate(-4deg) scale(${s})`, transformOrigin: "left top", display: "flex", alignItems: "center", gap: 10, background: LIMA, color: PRETO, padding: "8px 18px 9px 12px", boxShadow: "0 8px 18px rgba(0,0,0,.4)" }}>
      <Nota size={size * 1.1} color={PRETO} />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontFamily: BEBAS, fontSize: size * 1.5, lineHeight: 0.95, letterSpacing: "0.08em" }}>{n.estilo}</span>
        <span style={{ fontFamily: ARCHIVO, fontWeight: 700, fontSize: size * 0.55, color: PRETO, opacity: 0.8, letterSpacing: "0.04em" }}>{SUBESTILO}</span>
      </div>
    </div>
  );
};

// carimbo da data: tinta lima, meio falhado
const Carimbo: React.FC<{ n: Noite; x: number; y: number; delay: number; size?: number }> = ({ n, x, y, delay, size = 1 }) => {
  const s = useSpr(delay, { damping: 9, stiffness: 160 });
  const sc = interpolate(s, [0, 1], [1.8, 1]);
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `rotate(-9deg) scale(${sc * size})`, transformOrigin: "center", opacity: Math.min(1, s * 1.4) * 0.92, mixBlendMode: "multiply" }}>
      <div style={{ border: `7px solid ${PRETO}`, borderRadius: 18, padding: "10px 26px 12px", color: PRETO, textAlign: "center", filter: "drop-shadow(0 0 0 transparent)", WebkitMaskImage: "radial-gradient(circle at 30% 40%, #000 60%, rgba(0,0,0,.75) 100%)" }}>
        <div style={{ fontFamily: BEBAS, fontSize: 150, lineHeight: 0.85, letterSpacing: "0.02em" }}>{n.dia}</div>
        <div style={{ fontFamily: BEBAS, fontSize: 52, lineHeight: 1, letterSpacing: "0.22em", paddingLeft: "0.22em" }}>{n.mes}</div>
        <div style={{ fontFamily: ARCHIVO, fontWeight: 900, fontSize: 24, letterSpacing: "0.16em", marginTop: 6 }}>{n.diaSemana} · {n.hora}</div>
      </div>
    </div>
  );
};

// canhotos "LISTA VIP" destacáveis no pé do cartaz (alguns já foram arrancados — pedido do Rafa 20/10)
const ARRANCADOS = [1, 4, 7];
const Canhotos: React.FC<{ w: number; delay: number }> = ({ w, delay }) => {
  const o = useFade(delay, delay + 12);
  const n = 9;
  const cw = (w - 40) / n;
  return (
    <div style={{ position: "absolute", left: 20, bottom: 0, width: w - 40, height: 86, display: "flex", opacity: o, borderTop: `2px dashed rgba(11,11,9,.5)` }}>
      {Array.from({ length: n }, (_, i) =>
        ARRANCADOS.includes(i) ? (
          <div key={i} style={{ width: cw, height: 14 + rnd(i) * 14, borderRight: "2px dashed rgba(11,11,9,.5)", background: OSSO, clipPath: `polygon(0 0, 100% 0, 100% 60%, ${50 + rnd(i + 2) * 30}% 100%, ${rnd(i + 3) * 30}% 70%)` }} />
        ) : (
          <div key={i} style={{ width: cw, height: "100%", borderRight: i < n - 1 ? "2px dashed rgba(11,11,9,.5)" : undefined, display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(${(rnd(i + 7) - 0.5) * 2}deg)` }}>
            <div style={{ transform: "rotate(-90deg)", fontFamily: ARCHIVO, fontWeight: 900, fontSize: 17, letterSpacing: "0.14em", color: PRETO, whiteSpace: "nowrap", opacity: 0.85 }}>LISTA VIP</div>
          </div>
        ),
      )}
    </div>
  );
};

type L = { px: number; py: number; pw: number; ph: number; artH: number; artTop: number; titleTop: number; titleSize: number; nomeTop: number; listaTop: number };
const LAYOUT: Record<"feed" | "story", L> = {
  // Rafa 20/10: faixa do nome mais baixa, pra não cair no rosto de ninguém
  feed: { px: 60, py: 56, pw: 960, ph: 1236, artH: 820, artTop: 330, titleTop: 70, titleSize: 300, nomeTop: 830, listaTop: 1035 },
  story: { px: 60, py: 180, pw: 960, ph: 1580, artH: 1020, artTop: 420, titleTop: 100, titleSize: 320, nomeTop: 1160, listaTop: 1350 },
};

export const SextaC: React.FC<{ n: Noite; fmt: Formato }> = ({ n, fmt }) => {
  if (fmt === "broll") return <SextaCBroll n={n} />;
  const f = fmt;
  const L = LAYOUT[f];
  const { w, h } = DIM[f];
  const frame = useCurrentFrame();
  const cola = useSpr(4, { damping: 13, stiffness: 90 });
  const art = useSpr(16, { damping: 15 });
  const nome = useSpr(30, { damping: 11 });
  const anel = useSpr(10, { damping: 16, stiffness: 70 });
  const push = interpolate(frame, [0, 240], [1, 1.03], clamp);
  const nomeTxt = n.artista;
  const nomeSize = Math.min(150, (L.pw - 140) / (nomeTxt.replace(/ /g, "").length * 0.43 + (nomeTxt.split(" ").length - 1) * 0.25));
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Muro />
      <Velho x={-60} y={120} w={520} h={300} rot={-7} cor={OSSO} texto="SEXTA" seed={3} />
      <Velho x={620} y={40} w={560} h={340} rot={5} cor="#8f9600" texto="BUTICA" seed={11} o={0.45} />
      <Velho x={700} y={h - 420} w={480} h={320} rot={-4} cor={PRETO} texto="LISTA" seed={23} o={0.7} />
      <Velho x={-80} y={h - 360} w={420} h={300} rot={6} cor={OSSO} texto="DOMINGO" seed={31} o={0.4} />
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "50% 40%" }}>
        {/* o cartaz: entra colado (escala + leve torção) */}
        <div style={{ position: "absolute", left: L.px, top: L.py, width: L.pw, height: L.ph, transform: `rotate(-1.6deg) scale(${interpolate(cola, [0, 1], [1.06, 1])})`, transformOrigin: "50% 20%", opacity: cola, filter: "drop-shadow(0 30px 40px rgba(0,0,0,.55))" }}>
          <div style={{ position: "absolute", inset: 0, background: OSSO, clipPath: rasgo(5, 1.1), overflow: "hidden" }}>
            {/* papel: rugas e sujeira */}
            <AbsoluteFill style={{ background: "linear-gradient(115deg, rgba(0,0,0,.06) 0%, rgba(255,255,255,0) 30%, rgba(0,0,0,.05) 55%, rgba(255,255,255,0) 80%, rgba(0,0,0,.08) 100%)" }} />
            {/* faixa preta do topo com o logo */}
            <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 118, background: PRETO }} />
            <Logo width={230} top={34} />
            
            {/* sem bloco de cor atrás do artista (Rafa 20/10: o amarelo deixava igual à Comanda) — só um traço de pincel preto */}
            <div style={{ position: "absolute", left: 60, top: L.artTop + L.artH * 0.62, width: L.pw - 120, height: 22, background: PRETO, transform: "rotate(-2deg)", opacity: interpolate(art, [0, 1], [0, 0.9]), clipPath: "polygon(0 30%, 3% 0, 97% 10%, 100% 60%, 98% 100%, 2% 90%)" }} />
            {/* SEXTA gigante */}
            <div style={{ position: "absolute", left: 0, right: 0, top: L.titleTop + 60, textAlign: "center", fontFamily: BEBAS, fontSize: L.titleSize, lineHeight: 0.8, color: PRETO, letterSpacing: "-0.01em", opacity: useFade(8, 20) }}>SEXTA</div>
            {/* artista impresso em preto (duotone de cartaz) */}
            <Img src={staticFile(n.foto.src)} style={{ position: "absolute", height: L.artH, width: L.artH * n.foto.ratio, left: L.pw / 2 - (L.artH * n.foto.ratio) / 2, top: L.artTop + (1 - art) * 120, opacity: art, filter: "grayscale(1) contrast(1.35) brightness(1.02)", mixBlendMode: "multiply", WebkitMaskImage: "linear-gradient(180deg, #000 70%, transparent 85%)" }} />
            {/* nome do artista: tarja preta torta, tipografia de cartaz */}
            <div style={{ position: "absolute", left: 40, right: 40, top: L.nomeTop, transform: `rotate(-2deg) scaleX(${nome})`, transformOrigin: "left center", background: PRETO, color: OSSO, textAlign: "center", padding: "14px 20px 18px", boxShadow: "0 14px 30px rgba(0,0,0,.35)" }}>
              <div style={{ fontFamily: ARCHIVO, fontWeight: 800, fontSize: 22, letterSpacing: "0.36em", color: LIMA, marginBottom: 4 }}>DO BUTICA COM</div>
              <div style={{ fontFamily: BEBAS, fontSize: nomeSize, lineHeight: 0.88, letterSpacing: "0.02em", whiteSpace: "nowrap" }}>{nomeTxt}</div>
            </div>
            {/* lista */}
            <div style={{ position: "absolute", left: 60, right: 60, top: L.listaTop, textAlign: "center", opacity: useFade(44, 58) }}>
              <div style={{ fontFamily: BEBAS, fontSize: 42, color: PRETO, lineHeight: 1, letterSpacing: "0.03em", whiteSpace: "nowrap" }}>
                {n.lista[0]} <span style={{ color: "#8f9600" }}>●</span> {n.lista[1]}
              </div>
              <div style={{ fontFamily: ARCHIVO, fontWeight: 600, fontSize: 22, color: PRETO, opacity: 0.7, marginTop: 8 }}>{n.obs}</div>
              <div style={{ fontFamily: ALFA, fontSize: 24, color: PRETO, letterSpacing: "0.12em", marginTop: 10, opacity: 0.9 }}>TE VEJO NA ESQUINA</div>
            </div>
            <Canhotos w={L.pw} delay={52} />
            {/* rasgo no canto inferior direito mostrando o muro */}
            <div style={{ position: "absolute", right: -40, bottom: -30, width: 180, height: 150, background: MURO, clipPath: "polygon(100% 0, 100% 100%, 0 100%, 20% 70%, 45% 60%, 55% 35%, 80% 20%)" }} />
          </div>
          <Fita x={-30} y={-14} rot={-32} />
          <Fita x={L.pw - 120} y={-16} rot={28} />
          <Fita x={L.pw / 2 - 80} y={L.ph - 30} rot={4} w={170} />
        </div>
        {/* o "O" do logo como carimbo lima, pousando no canto */}
        <RingPx width={w} height={h} look="lima" flat cx={L.px + L.pw - 40} cy={L.py + L.ph - 55} ringH={interpolate(anel, [0, 1], [260, 170])} rotY={interpolate(anel, [0, 1], [1.2, 0.35]) + Math.sin(frame / 40) * 0.08} rotZ={-0.3} envIntensity={0.9} style={{ opacity: anel, filter: "drop-shadow(0 20px 24px rgba(0,0,0,.5))" }} />
      </AbsoluteFill>
      <Estilo n={n} x={L.px + L.pw - 300} y={L.py + 22} delay={26} size={22} />
      <Carimbo n={n} x={L.px + L.pw - 265} y={L.titleTop + L.py + 290} delay={38} size={f === "feed" ? 0.8 : 0.9} />
      <Grain opacity={0.2} />
      <Vignette strength={0.5} />
    </AbsoluteFill>
  );
};

// STORY com B-roll: o vídeo do artista colado no cartaz como uma foto grande, com fita; nome, lista e canhotos embaixo
const SextaCBroll: React.FC<{ n: Noite }> = ({ n }) => {
  const { w, h } = DIM.broll;
  const L = LAYOUT.story;
  const frame = useCurrentFrame();
  const cola = useSpr(4, { damping: 13, stiffness: 90 });
  const vid = useFade(12, 26);
  const nome = useSpr(30, { damping: 11 });
  const anel = useSpr(10, { damping: 16, stiffness: 70 });
  const nomeTxt = n.artista;
  const nomeSize = Math.min(150, (L.pw - 140) / (nomeTxt.replace(/ /g, "").length * 0.43 + (nomeTxt.split(" ").length - 1) * 0.25));
  const VX = 70, VY = 330, VW = L.pw - 140, VH = 760;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Muro />
      <Velho x={-60} y={200} w={520} h={300} rot={-7} cor={OSSO} texto="SEXTA" seed={3} />
      <Velho x={700} y={h - 420} w={480} h={320} rot={-4} cor={PRETO} texto="LISTA" seed={23} o={0.7} />
      <div style={{ position: "absolute", left: L.px, top: L.py, width: L.pw, height: L.ph, transform: `rotate(-1.6deg) scale(${interpolate(cola, [0, 1], [1.06, 1])})`, transformOrigin: "50% 20%", opacity: cola, filter: "drop-shadow(0 30px 40px rgba(0,0,0,.55))" }}>
        <div style={{ position: "absolute", inset: 0, background: OSSO, clipPath: rasgo(5, 1.1), overflow: "hidden" }}>
          <AbsoluteFill style={{ background: "linear-gradient(115deg, rgba(0,0,0,.06) 0%, rgba(255,255,255,0) 30%, rgba(0,0,0,.05) 55%, rgba(255,255,255,0) 80%, rgba(0,0,0,.08) 100%)" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 118, background: PRETO }} />
          <Logo width={230} top={34} />
          <div style={{ position: "absolute", left: 60, top: 130, fontFamily: BEBAS, fontSize: 200, lineHeight: 0.8, color: PRETO, opacity: useFade(8, 20) }}>SEXTA</div>
          {/* o vídeo, colado torto como uma foto */}
          <div style={{ position: "absolute", left: VX, top: VY, width: VW, height: VH, transform: "rotate(1.2deg)", background: PRETO, padding: 14, boxSizing: "border-box", boxShadow: "0 18px 30px rgba(0,0,0,.45)", opacity: vid }}>
            <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
              <OffthreadVideo src={staticFile(n.clip)} style={{ width: VW - 28, height: (VW - 28) * (1920 / 1080), objectFit: "cover", marginTop: (n.clipTop ?? -380) * ((VW - 28) / 1000), filter: "contrast(1.06) saturate(1.05)" }} volume={(f) => interpolate(f, [0, 8, 285, 300], [0, 1, 1, 0], clamp)} />
              <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 80%, rgba(0,0,0,.45) 100%)" }} />
            </div>
            <Fita x={-30} y={-18} rot={-30} w={140} />
            <Fita x={VW - 120} y={-18} rot={26} w={140} />
          </div>
          <div style={{ position: "absolute", left: 40, right: 40, top: VY + VH + 60, transform: `rotate(-2deg) scaleX(${nome})`, transformOrigin: "left center", background: PRETO, color: OSSO, textAlign: "center", padding: "14px 20px 18px", boxShadow: "0 14px 30px rgba(0,0,0,.35)" }}>
            <div style={{ fontFamily: ARCHIVO, fontWeight: 800, fontSize: 22, letterSpacing: "0.36em", color: LIMA, marginBottom: 4 }}>DO BUTICA COM</div>
            <div style={{ fontFamily: BEBAS, fontSize: nomeSize, lineHeight: 0.88, letterSpacing: "0.02em", whiteSpace: "nowrap" }}>{nomeTxt}</div>
          </div>
          <div style={{ position: "absolute", left: 60, right: 60, top: VY + VH + 290, textAlign: "center", opacity: useFade(44, 58) }}>
            <div style={{ fontFamily: BEBAS, fontSize: 42, color: PRETO, lineHeight: 1, letterSpacing: "0.03em", whiteSpace: "nowrap" }}>
              {n.lista[0]} <span style={{ color: "#8f9600" }}>●</span> {n.lista[1]}
            </div>
            <div style={{ fontFamily: ARCHIVO, fontWeight: 600, fontSize: 22, color: PRETO, opacity: 0.7, marginTop: 8 }}>{n.obs}</div>
            <div style={{ display: "inline-block", fontFamily: ALFA, fontSize: 24, color: OSSO, background: PRETO, padding: "6px 18px", letterSpacing: "0.1em", marginTop: 12 }}>NOME NA LISTA: LINK NA BIO</div>
          </div>
          <Canhotos w={L.pw} delay={52} />
          <div style={{ position: "absolute", right: -40, bottom: -30, width: 180, height: 150, background: MURO, clipPath: "polygon(100% 0, 100% 100%, 0 100%, 20% 70%, 45% 60%, 55% 35%, 80% 20%)" }} />
        </div>
        <Fita x={-30} y={-14} rot={-32} />
        <Fita x={L.pw - 120} y={-16} rot={28} />
      </div>
      <RingPx width={w} height={h} look="lima" flat cx={L.px + L.pw - 40} cy={L.py + L.ph - 55} ringH={interpolate(anel, [0, 1], [260, 170])} rotY={interpolate(anel, [0, 1], [1.2, 0.35]) + Math.sin(frame / 40) * 0.08} rotZ={-0.3} envIntensity={0.9} style={{ opacity: anel, filter: "drop-shadow(0 20px 24px rgba(0,0,0,.5))" }} />
      <Estilo n={n} x={L.px + L.pw - 300} y={L.py + 22} delay={26} size={22} />
      <Carimbo n={n} x={L.px + L.pw - 300} y={L.py + 120} delay={38} size={0.72} />
      <Grain opacity={0.2} />
      <Vignette strength={0.5} />
    </AbsoluteFill>
  );
};
