// Gera "A Culpa — versão A" em SVG vetorial (letras em curvas, fundo transparente, texto da caixa vazado).
// Uso: node aculpa.mjs <fonte.ttf> <saida.svg>
import opentype from 'opentype.js';
import fs from 'node:fs';

const [, , fontPath, out] = process.argv;
const font = opentype.parse(fs.readFileSync(fontPath).buffer);
const MM = 72 / 25.4;                 // pt por mm
const PW = 100 * MM, PH = 150 * MM;   // página 10 x 15 cm (mesmo tamanho das artes 2024/2025)
const VERDE = '#CCD500', BRANCO = '#FFFFFF';

// tamanhos relativos copiados do mockup aprovado (px no mockup)
const linhas = [
  { t: 'A CULPA', fs: 36, cor: BRANCO, gapAntes: 0 },
  { t: 'NÃO É', fs: 66, cor: VERDE, gapAntes: 8 },
  { t: 'DESSE COPINHO', fs: 27, caixa: true, gapAntes: 12 },
  { t: 'AQUI!', fs: 84, cor: BRANCO, gapAntes: 12 },
];
const PAD_X = 8, PAD_Y = 5;  // folga da caixa (px do mockup)

// mede no tamanho do mockup
const medir = (l) => {
  const p = font.getPath(l.t, 0, 0, l.fs);
  const b = p.getBoundingBox();
  return { ...l, w: b.x2 - b.x1, h: b.y2 - b.y1, x1: b.x1, y1: b.y1 };
};
const M = linhas.map(medir);
const largura = Math.max(...M.map((m) => m.w + (m.caixa ? 2 * PAD_X : 0)));
const altura = M.reduce((s, m) => s + m.h + (m.caixa ? 2 * PAD_Y : 0) + m.gapAntes, 0);
// escala: arte ocupa 80 mm de largura, limitada a 120 mm de altura
const k = Math.min((80 * MM) / largura, (120 * MM) / altura);

let y = (PH - altura * k) / 2;
const partes = [];
for (const m of M) {
  y += m.gapAntes * k;
  const fs = m.fs * k;
  const w = m.w * k, h = m.h * k;
  if (m.caixa) {
    const bw = w + 2 * PAD_X * k, bh = h + 2 * PAD_Y * k;
    const bx = (PW - bw) / 2;
    const tx = (PW - w) / 2 - m.x1 * k, ty = y + PAD_Y * k - m.y1 * k;
    const texto = font.getPath(m.t, tx, ty, fs).toPathData(3);
    // caixa + letras no mesmo caminho com evenodd = letras vazadas (sem tinta)
    const caixa = `M${bx.toFixed(3)} ${y.toFixed(3)}h${bw.toFixed(3)}v${bh.toFixed(3)}h${(-bw).toFixed(3)}Z`;
    partes.push(`<path fill="${VERDE}" fill-rule="evenodd" d="${caixa} ${texto}"/>`);
    y += bh;
  } else {
    const tx = (PW - w) / 2 - m.x1 * k, ty = y - m.y1 * k;
    partes.push(`<path fill="${m.cor}" d="${font.getPath(m.t, tx, ty, fs).toPathData(3)}"/>`);
    y += h;
  }
}
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${PW.toFixed(2)}pt" height="${PH.toFixed(2)}pt" viewBox="0 0 ${PW.toFixed(3)} ${PH.toFixed(3)}">\n${partes.join('\n')}\n</svg>\n`;
fs.writeFileSync(out, svg);
console.log('ok', out, `arte ${(largura * k / MM).toFixed(1)} x ${(altura * k / MM).toFixed(1)} mm`);
