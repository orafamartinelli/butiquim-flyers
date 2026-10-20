// 20/10: dá às identidades C e D o formato STORY com B-roll (vídeo do artista) — e registra feed/story/broll das amostras no Root.
// Uso único (idempotente: pula o que já foi aplicado).
import { readFileSync, writeFileSync } from "fs";
const patch = (f, pares) => {
  let s = readFileSync(f, "utf8");
  for (const [a, b] of pares) {
    if (s.includes(b)) continue;
    if (!s.includes(a)) throw new Error(`${f}: não achou ${a.slice(0, 70)}`);
    s = s.replace(a, b);
  }
  writeFileSync(f, s);
};
const append = (f, marca, codigo) => {
  const s = readFileSync(f, "utf8");
  if (s.includes(marca)) return;
  writeFileSync(f, s + "\n" + codigo);
};

// ---------- SEXTA C (lambe): vídeo colado no cartaz como uma foto, com fita ----------
patch("src/ids/SextaC.tsx", [
  ['import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";', 'import { AbsoluteFill, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame } from "remotion";'],
  ['  const f = fmt === "broll" ? "story" : fmt;\n  const L = LAYOUT[f];\n  const { w, h } = DIM[f];\n  const frame = useCurrentFrame();\n  const cola', '  if (fmt === "broll") return <SextaCBroll n={n} />;\n  const f = fmt;\n  const L = LAYOUT[f];\n  const { w, h } = DIM[f];\n  const frame = useCurrentFrame();\n  const cola'],
]);
append("src/ids/SextaC.tsx", "const SextaCBroll", `// STORY com B-roll: o vídeo do artista colado no cartaz como uma foto grande, com fita; nome, lista e canhotos embaixo
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
      <div style={{ position: "absolute", left: L.px, top: L.py, width: L.pw, height: L.ph, transform: \`rotate(-1.6deg) scale(\${interpolate(cola, [0, 1], [1.06, 1])})\`, transformOrigin: "50% 20%", opacity: cola, filter: "drop-shadow(0 30px 40px rgba(0,0,0,.55))" }}>
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
          <div style={{ position: "absolute", left: 40, right: 40, top: VY + VH + 60, transform: \`rotate(-2deg) scaleX(\${nome})\`, transformOrigin: "left center", background: PRETO, color: OSSO, textAlign: "center", padding: "14px 20px 18px", boxShadow: "0 14px 30px rgba(0,0,0,.35)" }}>
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
`);

// ---------- SÁBADO C (lousa): vídeo preso na lousa com ímã, rabiscos em volta ----------
patch("src/ids/SabadoC.tsx", [
  ['import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";', 'import { AbsoluteFill, OffthreadVideo, interpolate, staticFile, useCurrentFrame } from "remotion";'],
  ['  const f = fmt === "broll" ? "story" : fmt;\n  const L = LAYOUT[f];\n  const { w, h } = DIM[f];\n  const frame = useCurrentFrame();\n  const art', '  if (fmt === "broll") return <SabadoCBroll n={n} />;\n  const f = fmt;\n  const L = LAYOUT[f];\n  const { w, h } = DIM[f];\n  const frame = useCurrentFrame();\n  const art'],
]);
append("src/ids/SabadoC.tsx", "const SabadoCBroll", `// STORY com B-roll: o vídeo do artista preso na lousa com um ímã, giz em volta; título em cima, nome e lista embaixo
const SabadoCBroll: React.FC<{ n: Noite }> = ({ n }) => {
  const { w, h } = DIM.broll;
  const frame = useCurrentFrame();
  const vid = useSpr(10, { damping: 14 });
  const tit = useFade(4, 18);
  const nome = useFade(34, 48);
  const VX = 80, VY = 420, VW = 920, VH = 760;
  const nomeSize = Math.min(120, (w - 160) / (n.artista.length * 0.56));
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Quadro w={w} h={h} />
      <Rabiscos w={w} h={h} cx={540} cy={VY + VH / 2} r={VW * 0.42} delay={20} />
      <Logo width={240} top={200} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 280, textAlign: "center", opacity: tit, transform: "rotate(-2deg)" }}>
        <span style={{ fontFamily: SKETCH, fontWeight: 700, fontSize: 190, lineHeight: 0.9, ...giz(GIZ_BRANCO) }}>Sabadá</span>
        <span style={{ fontFamily: GIZ, fontSize: 80, marginLeft: 18, ...giz(GIZ_LIMA) }}>do Butica</span>
      </div>
      {/* a "foto" presa com ímã: papel branco em volta do vídeo */}
      <div style={{ position: "absolute", left: VX, top: VY, width: VW, height: VH, transform: \`rotate(-1.5deg) translateY(\${(1 - vid) * 60}px)\`, opacity: vid, background: GIZ_BRANCO, padding: 16, boxSizing: "border-box", boxShadow: "0 30px 50px rgba(0,0,0,.6)" }}>
        <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", background: "#000" }}>
          <OffthreadVideo src={staticFile(n.clip)} style={{ width: VW - 32, height: (VW - 32) * (1920 / 1080), objectFit: "cover", marginTop: (n.clipTop ?? -380) * ((VW - 32) / 1000), filter: "contrast(1.05) saturate(1.08)" }} volume={(f) => interpolate(f, [0, 8, 285, 300], [0, 1, 1, 0], clamp)} />
        </div>
        <div style={{ position: "absolute", left: VW / 2 - 28, top: -26, width: 56, height: 56, borderRadius: "50%", background: \`radial-gradient(circle at 35% 30%, #e9f27a, \${GIZ_LIMA} 55%, #8f9a1a 100%)\`, boxShadow: "0 8px 14px rgba(0,0,0,.5)" }} />
      </div>
      <Hoje x={60} y={1200} delay={28} />
      <Data n={n} x={900} y={1270} d={220} delay={30} />
      <Estilo n={n} x={330} y={1215} delay={22} size={24} />
      <Nota x={990} y={380} size={56} rot={12} delay={46} />
      <Nota x={40} y={1090} size={54} rot={-15} delay={40} cor={GIZ_LIMA} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(22,33,28,0) 70%, rgba(22,33,28,.85) 82%, rgba(22,33,28,.97) 100%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1400, textAlign: "center", opacity: nome }}>
        <div style={{ fontFamily: GIZ, fontSize: 34, lineHeight: 1, ...giz(GIZ_LIMA) }}>no palco do Butica:</div>
        <div style={{ fontFamily: SKETCH, fontWeight: 700, fontSize: nomeSize, lineHeight: 1, whiteSpace: "nowrap", marginTop: 4, ...giz(GIZ_BRANCO) }}>{n.artista}</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1600, textAlign: "center", opacity: useFade(50, 64) }}>
        <div style={{ fontFamily: GIZ, fontSize: 40, lineHeight: 1, ...giz(GIZ_BRANCO) }}>
          lista fem. <span style={{ fontFamily: SKETCH, fontWeight: 700, ...giz(GIZ_LIMA) }}>FREE</span> até {n.lista[0].split("ATÉ ")[1].toLowerCase()} · lista masc. <span style={{ fontFamily: SKETCH, fontWeight: 700, ...giz(GIZ_LIMA) }}>R$ 20</span> até {n.lista[1].split("ATÉ ")[1].toLowerCase()}
        </div>
        <div style={{ fontFamily: ARCHIVO, fontWeight: 500, fontSize: 19, color: GIZ_BRANCO, opacity: 0.75, marginTop: 8 }}>{n.obs}</div>
        <div style={{ fontFamily: GIZ, fontSize: 36, marginTop: 10, ...giz(GIZ_LIMA) }}>→ nome na lista: link na bio</div>
      </div>
      <Grain opacity={0.22} freq={1.1} />
      <Vignette strength={0.45} />
    </AbsoluteFill>
  );
};
`);

// ---------- DOMINGO C (comanda): o vídeo "impresso" na comanda, em risografia ----------
patch("src/ids/DomingoC.tsx", [
  ['import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";', 'import { AbsoluteFill, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame } from "remotion";'],
  ['  const f = fmt === "broll" ? "story" : fmt;', '  const video = fmt === "broll";\n  const f = video ? "story" : fmt;'],
  ['            <Img src={staticFile(n.foto.src)} style={{ position: "absolute", height: L.fotoH * 1.12, width: L.fotoH * 1.12 * n.foto.ratio, left: `calc(50% - ${(L.fotoH * 1.12 * n.foto.ratio) / 2}px)`, top: 0, filter: "grayscale(1) contrast(1.4) brightness(1.05)", mixBlendMode: "multiply", WebkitMaskImage: "linear-gradient(180deg, #000 85%, transparent 100%)" }} />',
   '            {video ? (\n              <OffthreadVideo src={staticFile(n.clip)} style={{ position: "absolute", left: "8%", top: 30, width: "84%", height: L.fotoH - 30, objectFit: "cover", objectPosition: "50% 15%", filter: "grayscale(1) contrast(1.35) brightness(1.05)", mixBlendMode: "multiply" }} volume={(fr) => interpolate(fr, [0, 8, 285, 300], [0, 1, 1, 0], clamp)} />\n            ) : (\n              <Img src={staticFile(n.foto.src)} style={{ position: "absolute", height: L.fotoH * 1.12, width: L.fotoH * 1.12 * n.foto.ratio, left: `calc(50% - ${(L.fotoH * 1.12 * n.foto.ratio) / 2}px)`, top: 0, filter: "grayscale(1) contrast(1.4) brightness(1.05)", mixBlendMode: "multiply", WebkitMaskImage: "linear-gradient(180deg, #000 85%, transparent 100%)" }} />\n            )}'],
]);

// ---------- SEXTA D (mesa): o vídeo dentro da polaroid ----------
patch("src/ids/SextaD.tsx", [
  ['import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";', 'import { AbsoluteFill, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame } from "remotion";'],
  ['const Polaroid: React.FC<{ n: Noite; x: number; y: number; w: number; h: number; delay: number; rot: number }> = ({ n, x, y, w, h, delay, rot }) => {', 'const Polaroid: React.FC<{ n: Noite; x: number; y: number; w: number; h: number; delay: number; rot: number; video?: boolean }> = ({ n, x, y, w, h, delay, rot, video }) => {'],
  ['        <Img src={staticFile(n.foto.src)} style={{ position: "absolute", height: artH, width: artW, left: fotoW / 2 - artW / 2, top: 10, filter: "saturate(1.08) contrast(1.04) drop-shadow(0 20px 30px rgba(0,0,0,.6))", WebkitMaskImage: "linear-gradient(180deg, #000 86%, transparent 100%)" }} />',
   '        {video ? (\n          <OffthreadVideo src={staticFile(n.clip)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 18%", filter: "saturate(1.06) contrast(1.04)" }} volume={(fr) => interpolate(fr, [0, 8, 285, 300], [0, 1, 1, 0], clamp)} />\n        ) : (\n          <Img src={staticFile(n.foto.src)} style={{ position: "absolute", height: artH, width: artW, left: fotoW / 2 - artW / 2, top: 10, filter: "saturate(1.08) contrast(1.04) drop-shadow(0 20px 30px rgba(0,0,0,.6))", WebkitMaskImage: "linear-gradient(180deg, #000 86%, transparent 100%)" }} />\n        )}'],
  ['  const f = fmt === "broll" ? "story" : fmt;', '  const video = fmt === "broll";\n  const f = video ? "story" : fmt;'],
  ['<Polaroid n={n} x={L.polX} y={L.polY} w={L.polW} h={L.polH} delay={8} rot={-4} />', '<Polaroid n={n} x={L.polX} y={L.polY} w={L.polW} h={L.polH} delay={8} rot={-4} video={video} />'],
]);

// ---------- SÁBADO D (gibi): o vídeo num quadrinho da página ----------
patch("src/ids/SabadoD.tsx", [
  ['import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";', 'import { AbsoluteFill, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame } from "remotion";'],
  ['  const f = fmt === "broll" ? "story" : fmt;', '  const video = fmt === "broll";\n  const f = video ? "story" : fmt;'],
  ['        <Cutout src={n.foto.src} ratio={n.foto.ratio} height={L.artH} cx={540} top={L.artTop + (1 - art) * 220} fadeFrom={0.78} filter={`saturate(1.25) contrast(1.12) ${CONTORNO}`} style={{ opacity: art }} />',
   '        {video ? (\n          <div style={{ position: "absolute", left: 60, top: 500, width: 960, height: 790, transform: `rotate(-1deg) scale(${art})`, border: `10px solid ${NAVY}`, boxShadow: `inset 0 0 0 6px ${BRANCO}, 12px 12px 0 ${NAVY}`, background: NAVY, overflow: "hidden" }}>\n            <OffthreadVideo src={staticFile(n.clip)} style={{ position: "absolute", inset: 6, width: "calc(100% - 12px)", height: "calc(100% - 12px)", objectFit: "cover", objectPosition: "50% 15%", filter: "saturate(1.25) contrast(1.1)" }} volume={(fr) => interpolate(fr, [0, 8, 285, 300], [0, 1, 1, 0], clamp)} />\n            <AbsoluteFill style={{ backgroundImage: `radial-gradient(circle, ${NAVY} 1.2px, transparent 1.8px)`, backgroundSize: "9px 9px", opacity: 0.12 }} />\n          </div>\n        ) : (\n          <Cutout src={n.foto.src} ratio={n.foto.ratio} height={L.artH} cx={540} top={L.artTop + (1 - art) * 220} fadeFrom={0.78} filter={`saturate(1.25) contrast(1.12) ${CONTORNO}`} style={{ opacity: art }} />\n        )}'],
  ['<Estouro n={n} x={L.estX} y={L.estY} d={L.estD} delay={26} />', '<Estouro n={n} x={L.estX} y={video ? 330 : L.estY} d={L.estD} delay={26} />'],
  ['<Legenda x={w - 330} y={L.dataY} w={290} delay={32} rot={4}>', '<Legenda x={w - 330} y={video ? 1130 : L.dataY} w={290} delay={32} rot={4}>'],
]);

// ---------- Root: amostras ganham story e broll ----------
patch("src/Root.tsx", [
  ['    ).map(([k, C, n]) => {\n      const Comp: React.FC = () => <C n={n} fmt="feed" />;\n      return <Composition key={`c-${k}-feed`} id={`c-${k}-feed`} component={Comp} durationInFrames={240} fps={30} width={1080} height={1350} />;\n    })}',
   '    ).flatMap(([k, C, n]) =>\n      (["feed", "story", "broll"] as Formato[]).map((fmt) => {\n        const Comp: React.FC = () => (\n          <AbsoluteFill>\n            <C n={n} fmt={fmt} />\n            {fmt !== "broll" && <Trilha src={n.clip} dur={DUR[fmt]} />}\n          </AbsoluteFill>\n        );\n        return <Composition key={`c-${k}-${fmt}`} id={`c-${k}-${fmt}`} component={Comp} durationInFrames={DUR[fmt]} fps={30} width={DIM[fmt].w} height={DIM[fmt].h} />;\n      }),\n    )}'],
]);
console.log("ok");
