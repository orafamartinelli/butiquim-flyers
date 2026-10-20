// Ajustes da 3ª rodada das identidades C (19/10)
import { readFileSync, writeFileSync } from "fs";
const sub = (f, pares) => {
  let s = readFileSync(f, "utf8");
  for (const [a, b] of pares) {
    if (!s.includes(a)) throw new Error(`${f}: não achou ${a.slice(0, 70)}`);
    s = s.replace(a, b);
  }
  writeFileSync(f, s);
};

// SEXTA C: "O" encolhe e vai pro canto (sem tapar a lista); carimbo sai de cima do rosto
sub("src/ids/SextaC.tsx", [
  ['cx={L.px + L.pw - 130} cy={L.py + L.ph - 170} ringH={interpolate(anel, [0, 1], [380, 250])}', 'cx={L.px + L.pw - 95} cy={L.py + L.ph - 95} ringH={interpolate(anel, [0, 1], [320, 210])}'],
  ['<Carimbo n={n} x={L.px + L.pw - 330} y={L.titleTop + L.py + 300}', '<Carimbo n={n} x={L.px + L.pw - 265} y={L.titleTop + L.py + 290}'],
]);

// SÁBADO C: título escuro "gravado" na espuma + logo escuro
sub("src/ids/SabadoC.tsx", [
  ['fontFamily: LEAGUE, fontSize: L.titleSize, lineHeight: 0.85, color: ESPUMA, letterSpacing: "0.02em", opacity: tit, textShadow: `0 0 18px rgba(207,243,255,.9), 0 0 60px rgba(207,243,255,.5)`, WebkitTextStroke: `1.5px ${GELO}` }}>SABADÁ <span style={{ fontFamily: ARCHIVO, fontStyle: "italic", fontWeight: 900, fontSize: L.titleSize * 0.3, color: LIMA, WebkitTextStroke: "0" }}>do Butica</span></div>',
   'fontFamily: LEAGUE, fontSize: L.titleSize, lineHeight: 0.85, color: "#3B2208", letterSpacing: "0.02em", opacity: tit, textShadow: "0 2px 0 rgba(255,255,255,.6), 0 -1px 0 rgba(120,70,0,.25)", zIndex: 2 }}>SABADÁ <span style={{ fontFamily: ARCHIVO, fontStyle: "italic", fontWeight: 900, fontSize: L.titleSize * 0.3, color: "#8f9600" }}>do Butica</span></div>'],
  ['      <Logo width={f === "feed" ? 200 : 240} top={f === "feed" ? 30 : 200} />\n', '      <Img src={staticFile("logos/butiquim-mono-branco-h.png")} style={{ position: "absolute", width: f === "feed" ? 200 : 240, top: f === "feed" ? 30 : 200, left: `calc(50% - ${(f === "feed" ? 200 : 240) / 2}px)`, filter: "invert(1) brightness(0.25) sepia(1) saturate(2)" }} />\n'],
  ['import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";', 'import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";'],
  ['import { Cutout, Grain, Logo, Nota, Vignette, clamp, useFade, useSpr } from "../shared/fx";', 'import { Cutout, Grain, Nota, Vignette, clamp, useFade, useSpr } from "../shared/fx";'],
  // o título precisa ficar por cima da espuma: move pra depois dela
  ['      <div style={{ position: "absolute", left: 0, right: 0, top: L.titleTop, textAlign: "center", fontFamily: LEAGUE', '      <Espuma y={L.espumaY} w={w} />\n      <div style={{ position: "absolute", left: 0, right: 0, top: L.titleTop, textAlign: "center", fontFamily: LEAGUE'],
  ['</div>\n      <Espuma y={L.espumaY} w={w} />\n      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(122,61,8,0) 60%', '</div>\n      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(122,61,8,0) 60%'],
]);

// DOMINGO C: carimbo sobre o código de barras, não sobre o nome
sub("src/ids/DomingoC.tsx", [
  ['<Carimbo x={L.px + 30} y={L.py + 180 + L.fotoH + 120} delay={60} />', '<Carimbo x={L.px + L.pw - 440} y={L.py + L.ph - 250} delay={60} rot={-8} />'],
]);
console.log("ok");
