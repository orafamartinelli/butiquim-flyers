// Remonta a arte "Uma Deusa, Uma Louca, Uma Butiqueira" (copos 2024) com uma palavra por linha,
// recortando as palavras da arte original (mesma fonte, textura e cores).
// Uso: node scripts/copo-deusa-vertical.mjs <arte-original.png> <saida.png> [centro|esquerda]
import Jimp from 'jimp';

const [, , inp, out, alinhar = "centro"] = process.argv;
const src = await Jimp.read(inp);
const W = src.bitmap.width, H = src.bitmap.height;

// recortes [x0, y0, x1, y1] mapeados com scripts/mapear-arte.mjs
const R = {
  uma1: [68, 401, 334, 526], deusa: [374, 401, 782, 526],
  uma2: [71, 560, 336, 684], louca: [377, 560, 779, 684],
  umaBox: [68, 719, 270, 874], butiqueira: [270, 719, 782, 874],
};
// coordenadas medidas na arte com 851 px de largura; F adapta para qualquer resolução (ex.: 600 dpi)
const F = W / 851;
const corta = (r) => { const [x0, y0, x1, y1] = r.map((v) => Math.round(v * F)); return src.clone().crop(x0, y0, x1 - x0 + 1, y1 - y0 + 1); };

const LARG = Math.round(640 * F);      // largura das palavras grandes
const LARG_UMA = Math.round(270 * F);  // "UMA" menor, como respiro entre as palavras
const linhas = [
  [corta(R.uma1), LARG_UMA], [corta(R.deusa), LARG],
  [corta(R.uma2), LARG_UMA], [corta(R.louca), LARG],
  [corta(R.umaBox), LARG_UMA + Math.round(30 * F)], [corta(R.butiqueira), LARG],
].map(([img, w]) => img.resize(w, Jimp.AUTO, Jimp.RESIZE_BICUBIC));

const GAP = Math.round(26 * F);
const total = linhas.reduce((s, i) => s + i.bitmap.height, 0) + GAP * (linhas.length - 1);
const tela = new Jimp(W, H, 0x00000000);
let y = Math.round((H - total) / 2);
for (const img of linhas) {
  const x = alinhar === "esquerda" ? Math.round((W - LARG) / 2) : Math.round((W - img.bitmap.width) / 2);
  tela.composite(img, x, y);
  y += img.bitmap.height + GAP;
}
await tela.writeAsync(out);
console.log('ok', out, 'altura usada', total, 'de', H);
