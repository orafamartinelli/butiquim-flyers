// Primeira Vez (22/10/2026): cabeçalho WhatsApp "Lista Primeira Vez confirmada" (JPG 1910x1000 + MP4 1280x670)
// e suporte de acrílico 15x20 cm com QR (PNG 300 dpi c/ sangria, PDF p/ gráfica, prévia sem sangria, guia de corte).
// Uso: node scripts/render-pv-wa-acrilico.mjs [--rebundle]
import { execSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { openBrowser, renderMedia, renderStill, selectComposition } from "@remotion/renderer";

const raiz = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const serveUrl = path.join(raiz, "build-campanha");
const OUT = path.join(raiz, "out", "campanha", "06-primeira-vez");
const WA = path.join(OUT, "WhatsApp");
const AC = path.join(OUT, "Acrilico-15x20");
const RAW = path.join(OUT, "_raw");
const FF = "C:/Users/User/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.2-full_build/bin/ffmpeg.exe";
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
for (const d of [WA, AC, RAW]) mkdirSync(d, { recursive: true });

if (process.argv.includes("--rebundle") || !existsSync(serveUrl)) {
  execSync(`npx remotion bundle src/entries/campanha/index.ts --out-dir=build-campanha --log=error`, { cwd: raiz, stdio: "inherit" });
}
const ff = (args) => {
  const r = spawnSync(FF, ["-y", "-v", "error", ...args], { encoding: "utf8" });
  if (r.status !== 0) throw new Error(r.stderr.slice(-400));
};
const mb = (p) => `${(statSync(p).size / 1048576).toFixed(2)} MB`;

const browser = await openBrowser("chrome", { chromiumOptions: { gl: "angle" } });
const comp = (id) => selectComposition({ serveUrl, id, puppeteerInstance: browser, logLevel: "error" });
const still = async (id, out) => renderStill({ composition: await comp(id), serveUrl, output: out, puppeteerInstance: browser, logLevel: "error", overwrite: true });

// 1) cabeçalho imagem
const waPng = path.join(RAW, "wa-conf.png");
await still("pv-wa-conf-img", waPng);
const waJpg = path.join(WA, "wa-header-primeiravez-conf-1910x1000.jpg");
ff(["-i", waPng, "-q:v", "2", waJpg]);
console.log("OK", path.basename(waJpg), mb(waJpg));

// 2) cabeçalho vídeo (H.264 + AAC com a trilha leve sintetizada)
const vRaw = path.join(RAW, "wa-conf.mp4");
const c = await comp("pv-wa-conf-video");
await renderMedia({ composition: c, serveUrl, codec: "h264", crf: 14, muted: true, outputLocation: vRaw, puppeteerInstance: browser, concurrency: 4, logLevel: "error", overwrite: true });
const seg = c.durationInFrames / c.fps;
const wav = path.join(RAW, "wa-conf.wav");
execSync(`node scripts/trilha-leve.mjs ${seg} "${wav}" 41`, { cwd: raiz, stdio: "ignore" });
const mp4 = path.join(WA, "wa-header-primeiravez-conf-1280x670.mp4");
ff(["-i", vRaw, "-i", wav, "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-maxrate", "4M", "-bufsize", "8M",
  "-profile:v", "high", "-pix_fmt", "yuv420p", "-r", "30", "-af", `loudnorm=I=-18:TP=-1.5:LRA=7,afade=t=out:st=${seg - 0.8}:d=0.8,aresample=48000`,
  "-c:a", "aac", "-b:a", "128k", "-ar", "48000", "-t", String(seg), "-movflags", "+faststart", mp4]);
const capa = path.join(WA, "wa-header-primeiravez-conf-1280x670-CAPA.jpg");
ff(["-i", mp4, "-frames:v", "1", "-q:v", "2", capa]);
console.log("OK", path.basename(mp4), mb(mp4), `${seg}s`);

// 3) acrílico 15x20 (1843x2433 = 156x206 mm a 300 dpi, sangria 3 mm)
const acr = path.join(AC, "acrilico-15x20-primeira-vez-COM-SANGRIA-1843x2433.png");
await still("pv-acrilico", acr);
const guia = path.join(AC, "acrilico-15x20-primeira-vez-GUIA-corte-e-seguranca.png");
await still("pv-acrilico-guias", guia);
const previa = path.join(AC, "acrilico-15x20-primeira-vez-PREVIA-sem-sangria-1772x2362.png");
ff(["-i", acr, "-vf", "crop=1772:2362:35:35", previa]);
// PDF p/ gráfica: página 156x206 mm com a arte inteira (sangria inclusa)
const html = path.join(RAW, "acrilico-pdf.html");
writeFileSync(html, `<!doctype html><meta charset="utf-8"><style>@page{size:156mm 206mm;margin:0}html,body{margin:0;padding:0}img{display:block;width:156mm;height:206mm}</style><img src="file:///${acr.replace(/\\/g, "/")}">`);
const pdf = path.join(AC, "acrilico-15x20-primeira-vez-GRAFICA-156x206mm-com-sangria-3mm.pdf");
spawnSync(CHROME, ["--headless=new", "--disable-gpu", "--no-pdf-header-footer", `--print-to-pdf=${pdf}`, "--virtual-time-budget=8000", "file:///" + html.replace(/\\/g, "/")]);
console.log("OK acrilico", mb(acr), "pdf", mb(pdf));

await browser.close({ silent: true });
