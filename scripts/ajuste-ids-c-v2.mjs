// Ajustes da 2ª rodada das identidades C (19/10): substituições pontuais nos 3 arquivos
import { readFileSync, writeFileSync } from "fs";
const sub = (f, pares) => {
  let s = readFileSync(f, "utf8");
  for (const [a, b] of pares) {
    if (!s.includes(a)) throw new Error(`${f}: não achou ${a.slice(0, 70)}`);
    s = s.replace(a, b);
  }
  writeFileSync(f, s);
};

// SEXTA C
sub("src/ids/SextaC.tsx", [
  ['feed: { px: 60, py: 56, pw: 960, ph: 1236, artH: 1010, artTop: 110, titleTop: 72, titleSize: 430, nomeTop: 760, listaTop: 1000 }',
   'feed: { px: 60, py: 56, pw: 960, ph: 1236, artH: 850, artTop: 330, titleTop: 70, titleSize: 300, nomeTop: 740, listaTop: 950 }'],
  ['story: { px: 60, py: 180, pw: 960, ph: 1580, artH: 1200, artTop: 260, titleTop: 220, titleSize: 440, nomeTop: 1080, listaTop: 1340 }',
   'story: { px: 60, py: 180, pw: 960, ph: 1580, artH: 1050, artTop: 420, titleTop: 100, titleSize: 320, nomeTop: 1080, listaTop: 1300 }'],
  ['<div style={{ position: "absolute", right: 36, top: 44, fontFamily: ARCHIVO, fontWeight: 800, fontSize: 18, letterSpacing: "0.3em", color: OSSO, opacity: 0.8 }}>MARINGÁ · PR</div>', ''],
  ['background: PRETO, color: LIMA, padding: "8px 18px 9px 12px"', 'background: LIMA, color: PRETO, padding: "8px 18px 9px 12px"'],
  ['<Nota size={size * 1.1} color={LIMA} />', '<Nota size={size * 1.1} color={PRETO} />'],
  ['fontSize: size * 0.55, color: OSSO, opacity: 0.8', 'fontSize: size * 0.55, color: PRETO, opacity: 0.8'],
  ['<Estilo n={n} x={L.px + 24} y={L.py + 140} delay={26} />', '<Estilo n={n} x={L.px + L.pw - 300} y={L.py + 22} delay={26} size={22} />'],
  ['left: 90, top: 300, width: L.pw - 180, height: L.artH * 0.55', 'left: 90, top: L.artTop + 60, width: L.pw - 180, height: L.artH * 0.55'],
  ['<div style={{ border: `7px solid ${LIMA}`, borderRadius: 18, padding: "10px 26px 12px", color: LIMA, textAlign: "center"', '<div style={{ border: `7px solid ${PRETO}`, borderRadius: 18, padding: "10px 26px 12px", color: PRETO, textAlign: "center"'],
  ['<Carimbo n={n} x={L.px + 40} y={L.py + L.ph - 560} delay={38} size={f === "feed" ? 0.92 : 1} />', '<Carimbo n={n} x={L.px + L.pw - 330} y={L.titleTop + L.py + 300} delay={38} size={f === "feed" ? 0.8 : 0.9} />'],
  ['cx={L.px + L.pw - 150} cy={L.py + 250} ringH={interpolate(anel, [0, 1], [420, 280])}', 'cx={L.px + L.pw - 130} cy={L.py + L.ph - 170} ringH={interpolate(anel, [0, 1], [380, 250])}'],
  ['<div style={{ fontFamily: ALFA, fontSize: 34, color: PRETO, lineHeight: 1.1 }}>', '<div style={{ fontFamily: BEBAS, fontSize: 48, color: PRETO, lineHeight: 1, letterSpacing: "0.03em", whiteSpace: "nowrap" }}>'],
  ['fontFamily: BEBAS, fontSize: 34, color: PRETO, letterSpacing: "0.2em", marginTop: 14, opacity: 0.9 }}>TE VEJO NA ESQUINA', 'fontFamily: ALFA, fontSize: 24, color: PRETO, letterSpacing: "0.12em", marginTop: 10, opacity: 0.9 }}>TE VEJO NA ESQUINA'],
]);

// SÁBADO C
sub("src/ids/SabadoC.tsx", [
  ['feed: { espumaY: 150, ringCy: 560, ringH: 700, artH: 1120, artTop: 130, titleTop: 170, titleSize: 330, bafoTop: 930, bafoH: 190, bolX: 900, bolY: 420, bolD: 220, listaTop: 1180 }',
   'feed: { espumaY: 330, ringCy: 700, ringH: 640, artH: 960, artTop: 300, titleTop: 92, titleSize: 230, bafoTop: 940, bafoH: 190, bolX: 905, bolY: 500, bolD: 220, listaTop: 1180 }'],
  ['story: { espumaY: 300, ringCy: 820, ringH: 800, artH: 1350, artTop: 330, titleTop: 350, titleSize: 350, bafoTop: 1300, bafoH: 210, bolX: 890, bolY: 640, bolD: 240, listaTop: 1590, cta: true }',
   'story: { espumaY: 520, ringCy: 980, ringH: 760, artH: 1200, artTop: 470, titleTop: 290, titleSize: 240, bafoTop: 1300, bafoH: 210, bolX: 895, bolY: 700, bolD: 240, listaTop: 1590, cta: true }'],
  ['const nomeSize = Math.min(118, (w - 140) / (n.artista.length * 0.62));', 'const nomeSize = Math.min(110, (w - 160) / (n.artista.length * 0.86));'],
  ['        {/* SABADÁ gelado atrás do artista */}\n        <div style={{ position: "absolute", left: 0, right: 0, top: L.titleTop, textAlign: "center", fontFamily: LEAGUE, fontSize: L.titleSize, lineHeight: 0.85, color: ESPUMA, letterSpacing: "0.01em", opacity: tit, textShadow: `0 0 22px rgba(207,243,255,.8), 0 0 60px rgba(207,243,255,.45), 0 12px 0 rgba(120,60,0,.25)`, WebkitTextStroke: `2px ${GELO}` }}>SABADÁ</div>\n', ''],
  ['      <Espuma y={L.espumaY} w={w} />', '      <div style={{ position: "absolute", left: 0, right: 0, top: L.titleTop, textAlign: "center", fontFamily: LEAGUE, fontSize: L.titleSize, lineHeight: 0.85, color: ESPUMA, letterSpacing: "0.02em", opacity: tit, textShadow: `0 0 18px rgba(207,243,255,.9), 0 0 60px rgba(207,243,255,.5)`, WebkitTextStroke: `1.5px ${GELO}` }}>SABADÁ <span style={{ fontFamily: ARCHIVO, fontStyle: "italic", fontWeight: 900, fontSize: L.titleSize * 0.3, color: LIMA, WebkitTextStroke: "0" }}>do Butica</span></div>\n      <Espuma y={L.espumaY} w={w} />'],
  ['look="cromo" cx={540} cy={L.ringCy}', 'look="lima" cx={540} cy={L.ringCy}'],
  ['      <Logo width={f === "feed" ? 220 : 240} top={f === "feed" ? 40 : 214} mono />\n      <AbsoluteFill style={{ pointerEvents: "none" }}>\n        {/* logo escuro na espuma */}\n        <Logo width={f === "feed" ? 220 : 240} top={f === "feed" ? 40 : 214} mono opacity={1} />\n      </AbsoluteFill>\n', '      <Logo width={f === "feed" ? 200 : 240} top={f === "feed" ? 30 : 200} />\n'],
  ['<Estilo n={n} x={44} y={f === "feed" ? 46 : 214} delay={26} />', '<Estilo n={n} x={44} y={f === "feed" ? 30 : 200} delay={26} size={22} />'],
  ['const Suor: React.FC<{ w: number; h: number; n?: number }> = ({ w, h, n = 90 })', 'const Suor: React.FC<{ w: number; h: number; n?: number }> = ({ w, h, n = 70 })'],
]);

// DOMINGO C
sub("src/ids/DomingoC.tsx", [
  ['feed: { px: 150, py: -30, pw: 780, ph: 1420, fotoH: 560, ringCx: 905, ringCy: 215, ringH: 300 }', 'feed: { px: 150, py: -24, pw: 780, ph: 1340, fotoH: 470, ringCx: 975, ringCy: 640, ringH: 270 }'],
  ['story: { px: 150, py: 120, pw: 780, ph: 1760, fotoH: 760, ringCx: 905, ringCy: 400, ringH: 320, cta: true }', 'story: { px: 150, py: 120, pw: 780, ph: 1700, fotoH: 700, ringCx: 975, ringCy: 900, ringH: 290, cta: true }'],
  ['A ESQUINA MAIS DEMOCRÁTICA DE MARINGÁ', 'MARINGÁ · PR  ·  A ESQUINA'],
  ['const Tracos: React.FC<{ m?: number }> = ({ m = 14 })', 'const Tracos: React.FC<{ m?: number }> = ({ m = 8 })'],
  ['const nomeSize = Math.min(112, (L.pw - 90) / (n.artista.length * 0.44));', 'const nomeSize = Math.min(100, (L.pw - 90) / (n.artista.length * 0.44));'],
  ['<div style={{ fontFamily: COURIER, fontSize: 19, color: TINTA, opacity: 0.75, marginTop: 6, lineHeight: 1.2 }}>* {n.obs}</div>', '<div style={{ fontFamily: COURIER, fontSize: 16, color: TINTA, opacity: 0.75, marginTop: 4, lineHeight: 1.2, whiteSpace: "nowrap" }}>* {n.obs}</div>'],
  ['<Carimbo x={L.px + 60} y={L.py + L.ph - 400} delay={60} />', '<Carimbo x={L.px + 30} y={L.py + 180 + L.fotoH + 120} delay={60} />'],
]);
console.log("ok");
