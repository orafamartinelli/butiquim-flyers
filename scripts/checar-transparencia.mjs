// Mede quanto de um PNG é transparente e o alfa do canto. Uso: node scripts/checar-transparencia.mjs <img.png>
import fs from 'node:fs';
import { PNG } from 'pngjs';

const p = PNG.sync.read(fs.readFileSync(process.argv[2]));
let t = 0, o = 0;
for (let i = 3; i < p.data.length; i += 4) (p.data[i] < 10 ? t++ : o++);
console.log(`${p.width}x${p.height}`, 'transparente', ((t / (t + o)) * 100).toFixed(1) + '%', 'alfa do canto', p.data[3]);
