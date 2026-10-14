// Gera versão do logo para vidro fumê: preto -> branco, verde mantém. Uso: node scripts/logo-fume.mjs <entrada.png> <saida.png>
import fs from 'node:fs';
import { PNG } from 'pngjs';

const [, , inp, out] = process.argv;
const png = PNG.sync.read(fs.readFileSync(inp));
const cores = new Map();
for (let i = 0; i < png.data.length; i += 4) {
  const [r, g, b, a] = png.data.subarray(i, i + 4);
  if (a < 10) continue;
  const lum = (r + g + b) / 3;
  if (g > 120 && b < 80) {
    const k = `${r},${g},${b}`;
    if (a > 250) cores.set(k, (cores.get(k) || 0) + 1);
  } else if (lum < 128) {
    png.data[i] = png.data[i + 1] = png.data[i + 2] = 255;
  }
}
fs.writeFileSync(out, PNG.sync.write(png));
const top = [...cores.entries()].sort((a, b) => b[1] - a[1])[0];
const hex = '#' + top[0].split(',').map((n) => (+n).toString(16).padStart(2, '0')).join('');
console.log('verde dominante:', top[0], hex);
