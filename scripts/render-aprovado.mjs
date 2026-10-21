// Renderiza a campanha "APROVADO! A 1ª é nossa." (calouros 2027) em out/aprovado/<pasta>/.
// Uso: node scripts/render-aprovado.mjs [--rebundle] [--id=feed-uem,story-uem,...]
// Um navegador só para tudo (estáticos).
import { execSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";

const raiz = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const serveUrl = path.join(raiz, "build-aprovado");
const OUT = path.join(raiz, "out", "aprovado");
const args = process.argv.slice(2);
const ids = (args.find((a) => a.startsWith("--id=")) || "").slice(5).split(",").filter(Boolean);

if (args.includes("--rebundle") || !existsSync(serveUrl)) {
  execSync(`npx remotion bundle src/entries/aprovado/index.ts --out-dir=build-aprovado --log=error`, { cwd: raiz, stdio: "inherit" });
}

const INST = ["uem", "unicesumar", "uninga", "unicv", "generica"];
const ESTATICOS = [
  ...INST.map((i) => [`feed-${i}`, `01-feed/feed-${i}.png`]),
  ...INST.map((i) => [`story-${i}`, `02-stories/story-${i}.png`]),
  ...INST.map((i) => [`capa-${i}`, `03-carrossel/carrossel-${i}-01-capa.png`]),
  ...[2, 3, 4, 5, 6, 7].map((n) => [`carrossel-0${n}`, `03-carrossel/carrossel-0${n}.png`]),
];

const browser = await openBrowser("chrome", { chromiumOptions: { gl: "angle" } });
let falhas = 0;
const quer = (id) => ids.length === 0 || ids.includes(id);
const t0 = Date.now();
for (const [id, rel] of ESTATICOS.filter(([id]) => quer(id))) {
  const out = path.join(OUT, rel);
  mkdirSync(path.dirname(out), { recursive: true });
  try {
    const composition = await selectComposition({ serveUrl, id, puppeteerInstance: browser, logLevel: "error" });
    await renderStill({ composition, serveUrl, output: out, puppeteerInstance: browser, logLevel: "error", overwrite: true });
    console.log("OK", rel);
  } catch (e) {
    falhas++;
    console.log("FALHOU", rel, String(e.message || e).slice(0, 300));
  }
}
await browser.close({ silent: true });
console.log(`${Math.round((Date.now() - t0) / 1000)}s`);
process.exit(falhas ? 1 : 0);
