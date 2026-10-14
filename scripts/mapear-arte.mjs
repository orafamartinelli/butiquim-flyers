// Mapeia linhas e palavras de uma arte PNG transparente. Uso: node scripts/mapear-arte.mjs <arte.png>
import fs from 'node:fs';
import { PNG } from 'pngjs';

const png = PNG.sync.read(fs.readFileSync(process.argv[2]));
const { width: W, height: H, data } = png;
const a = (x, y) => data[(y * W + x) * 4 + 3];
const ehVerde = (x, y) => { const i = (y * W + x) * 4; return data[i + 3] > 128 && data[i + 1] > 150 && data[i + 2] < 120; };

const faixas = (n, cheio, minGap) => {
  const out = []; let ini = -1, vazio = 0;
  for (let i = 0; i < n; i++) {
    if (cheio(i)) { if (ini < 0) ini = i; vazio = 0; }
    else if (ini >= 0 && ++vazio >= minGap) { out.push([ini, i - vazio]); ini = -1; vazio = 0; }
  }
  if (ini >= 0) out.push([ini, n - 1]);
  return out;
};

console.log('tamanho', W, H);
const linhas = faixas(H, (y) => { for (let x = 0; x < W; x++) if (a(x, y) > 40) return true; return false; }, 6);
for (const [y0, y1] of linhas) {
  const cols = faixas(W, (x) => { for (let y = y0; y <= y1; y++) if (a(x, y) > 40) return true; return false; }, 12);
  // para faixa com caixa verde: colunas onde o miolo é 100% verde (sem letra vazada)
  const m0 = y0 + Math.round((y1 - y0) * 0.25), m1 = y1 - Math.round((y1 - y0) * 0.25);
  const soVerde = faixas(W, (x) => { let v = 0; for (let y = m0; y <= m1; y++) if (ehVerde(x, y)) v++; return v === m1 - m0 + 1; }, 1)
    .filter(([s, e]) => e - s >= 10);
  console.log(`linha y=${y0}-${y1}`, 'palavras:', JSON.stringify(cols), 'colunas verde puro (>=10px):', JSON.stringify(soVerde));
}
