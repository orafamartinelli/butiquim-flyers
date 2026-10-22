// Trilha leve "pagodinho de boteco" sintetizada do zero (sem música de terceiros).
// Surdo + pandeiro + tamborim + cavaco (Karplus-Strong) + baixo, ~100 BPM.
// Uso: node scripts/trilha-leve.mjs <segundos> <saida.wav> [semente]
import { writeFileSync } from "node:fs";

const dur = Number(process.argv[2] || 14);
const saida = process.argv[3] || "trilha.wav";
let seed = Number(process.argv[4] || 7);
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const SR = 44100, BPM = 100, beat = 60 / BPM;
const N = Math.round(dur * SR);
const L = new Float32Array(N), R = new Float32Array(N);
const add = (i, v, pan = 0) => { if (i >= 0 && i < N) { L[i] += v * (1 - pan); R[i] += v * (1 + pan); } };
const nota = (m) => 440 * 2 ** ((m - 69) / 12);

function surdo(t0, g = 1) {
  const s = Math.round(t0 * SR); let ph = 0;
  for (let i = 0; i < 0.5 * SR; i++) { const t = i / SR, f = 58 + 40 * Math.exp(-t * 18); ph += 2 * Math.PI * f / SR; add(s + i, Math.sin(ph) * Math.exp(-t * 6) * 0.75 * g); }
}
function pandeiro(t0, g = 0.12, pan = 0.25) {
  const s = Math.round(t0 * SR); let prev = 0;
  for (let i = 0; i < 0.07 * SR; i++) { const n = rand() * 2 - 1, hp = n - prev; prev = n; add(s + i, hp * Math.exp(-i / SR * 55) * g, pan); }
}
function tamborim(t0, g = 0.16) {
  const s = Math.round(t0 * SR);
  for (let i = 0; i < 0.06 * SR; i++) { const t = i / SR; add(s + i, (Math.sin(2 * Math.PI * 820 * t) * 0.6 + (rand() - 0.5) * 0.5) * Math.exp(-t * 60) * g, -0.35); }
}
// corda dedilhada (Karplus-Strong)
function corda(t0, m, d, g = 0.1, pan = 0.15) {
  const s = Math.round(t0 * SR), per = Math.max(2, Math.round(SR / nota(m)));
  const buf = new Float32Array(per).map(() => rand() * 2 - 1);
  let k = 0;
  for (let i = 0; i < d * SR; i++) {
    const a = buf[k], b = buf[(k + 1) % per];
    buf[k] = (a + b) * 0.5 * 0.996; k = (k + 1) % per;
    add(s + i, a * g * Math.min(1, (d * SR - i) / 800), pan);
  }
}
function baixo(t0, m, d) {
  const s = Math.round(t0 * SR), f = nota(m);
  for (let i = 0; i < d * SR; i++) { const t = i / SR, env = Math.min(1, t * 150) * Math.exp(-t * 2.2) * Math.min(1, (d - t) * 30); add(s + i, (Math.sin(2 * Math.PI * f * t) + 0.25 * Math.sin(4 * Math.PI * f * t)) * env * 0.35); }
}

// progressão I – vi – ii – V (Ré maior): D – Bm – Em – A
const acordes = [[62, 66, 69, 74], [59, 62, 66, 71], [64, 67, 71, 76], [61, 64, 69, 73]];
const graves = [38, 35, 40, 33];
const comp = Math.ceil(dur / (beat * 2)) + 1; // compasso 2/4
for (let c = 0; c < comp; c++) {
  const t = c * beat * 2;
  surdo(t + beat, 1); surdo(t, 0.35);
  for (let k = 0; k < 8; k++) pandeiro(t + (k * beat) / 4, k % 4 === 0 ? 0.16 : k % 2 ? 0.07 : 0.11);
  [0, 0.75, 1.5].forEach((x) => tamborim(t + x * beat, 0.11));
  const a = acordes[Math.floor(c / 2) % 4];
  // batida de cavaco: tum-ta-tum (abafado)
  [[0, 0.5], [0.75, 0.3], [1.5, 0.45]].forEach(([x, dd]) => a.forEach((m, j) => corda(t + x * beat + j * 0.008, m + 12, dd, 0.05, 0.2)));
  if (c % 2 === 0) { baixo(t, graves[Math.floor(c / 2) % 4], beat * 0.9); baixo(t + beat * 1.5, graves[Math.floor(c / 2) % 4] + 7, beat * 0.45); }
  else { baixo(t, graves[Math.floor(c / 2) % 4], beat * 0.9); baixo(t + beat, graves[Math.floor(c / 2) % 4] + 12, beat * 0.9); }
}

// fades + leve saturação + normalização com teto (-1 dBFS)
const fi = 0.08 * SR, fo = 0.9 * SR;
let pico = 0;
for (let i = 0; i < N; i++) {
  const g = Math.min(1, i / fi) * Math.min(1, (N - i) / fo);
  L[i] = Math.tanh(L[i] * g * 1.1); R[i] = Math.tanh(R[i] * g * 1.1);
  pico = Math.max(pico, Math.abs(L[i]), Math.abs(R[i]));
}
const ganho = 0.89 / pico;
const buf = Buffer.alloc(44 + N * 4);
buf.write("RIFF", 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write("WAVE", 8);
buf.write("fmt ", 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
buf.write("data", 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) { buf.writeInt16LE(Math.round(L[i] * ganho * 32767), 44 + i * 4); buf.writeInt16LE(Math.round(R[i] * ganho * 32767), 46 + i * 4); }
writeFileSync(saida, buf);
console.log(`${saida} · ${dur}s · ${BPM} BPM`);
