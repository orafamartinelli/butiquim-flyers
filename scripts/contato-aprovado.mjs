// Folha de contato da campanha APROVADO: miniaturas de todas as peças em out/aprovado/contato.png
// Uso: node scripts/contato-aprovado.mjs   (usa o Chrome headless instalado)
import { execFileSync } from "node:child_process";
import { writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const raiz = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const OUT = path.join(raiz, "out", "aprovado");
const INST = ["uem", "unicesumar", "uninga", "unicv", "generica"];
const u = (rel) => pathToFileURL(path.join(OUT, rel)).href;

const linhas = [
  ["Feed 4:5", INST.map((i) => [`feed-${i}`, u(`01-feed/feed-${i}.png`)])],
  ["Stories 9:16", INST.map((i) => [`story-${i}`, u(`02-stories/story-${i}.png`)])],
  ["Carrossel · capas", INST.map((i) => [`capa ${i}`, u(`03-carrossel/carrossel-${i}-01-capa.png`)])],
  ["Carrossel · slides 2 a 7", [2, 3, 4, 5, 6, 7].map((n) => [`carrossel-0${n}`, u(`03-carrossel/carrossel-0${n}.png`)])],
];

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
body{margin:0;background:#0E0E10;color:#F7F6F2;font-family:Arial,sans-serif;padding:40px 48px}
h1{margin:0 0 6px;font-size:44px;letter-spacing:.02em} p{margin:0 0 26px;color:#aaa;font-size:20px}
h2{font-size:22px;color:#DFF51E;margin:26px 0 12px;letter-spacing:.08em;text-transform:uppercase}
.r{display:flex;gap:18px;align-items:flex-start}
figure{margin:0} img{display:block;border-radius:6px} figcaption{font-size:15px;color:#bbb;margin-top:6px}
</style></head><body>
<h1>APROVADO! A 1ª é nossa. — O Butiquim · calouros 2027</h1>
<p>Folha de contato · 21 peças estáticas</p>
${linhas
  .map(
    ([t, itens]) =>
      `<h2>${t}</h2><div class="r">${itens.map(([n, src]) => `<figure><img src="${src}" style="height:${t.startsWith("Stories") ? 520 : 400}px"><figcaption>${n}</figcaption></figure>`).join("")}</div>`,
  )
  .join("")}
</body></html>`;

const htmlPath = path.join(OUT, "contato.html");
writeFileSync(htmlPath, html, "utf8");
const chrome = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"].find(existsSync);
const png = path.join(OUT, "contato.png");
execFileSync(chrome, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--allow-file-access-from-files", `--screenshot=${png}`, "--window-size=2140,2240", "--virtual-time-budget=5000", pathToFileURL(htmlPath).href], { stdio: "inherit" });
console.log("OK", png);
