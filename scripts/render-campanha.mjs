// Renderiza a campanha "A CASA TE DEVE" inteira em out/campanha/<pasta>/.
// Uso: node scripts/render-campanha.mjs [--rebundle] [--so=estaticos|videos] [--id=casa-c1,...]
// Um navegador só para tudo; vídeos um de cada vez (em paralelo o extrator de vídeo cai).
import { execSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { openBrowser, renderMedia, renderStill, selectComposition } from "@remotion/renderer";

const raiz = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const serveUrl = path.join(raiz, "build-campanha");
const OUT = path.join(raiz, "out", "campanha");
const args = process.argv.slice(2);
const so = (args.find((a) => a.startsWith("--so=")) || "").slice(5);
const ids = (args.find((a) => a.startsWith("--id=")) || "").slice(5).split(",").filter(Boolean);

if (args.includes("--rebundle") || !existsSync(serveUrl)) {
  execSync(`npx remotion bundle src/entries/campanha/index.ts --out-dir=build-campanha --log=error`, { cwd: raiz, stdio: "inherit" });
}

const P = {
  alerta: "00-tiro-de-alerta",
  casa: "01-o-que-e",
  primeira: "02-a-primeira-e-nossa",
  paga: "03-a-gente-paga-pra-voce-vir",
  carimbo: "04-carimbo-no-cpf",
  apoio: "05-apoio",
  pv: "06-primeira-vez",
};

const ESTATICOS = [
  ["alerta-feed", `${P.alerta}/alerta-FEED.png`],
  ["alerta-story", `${P.alerta}/alerta-STORY.png`],
  ["alerta-zap", `${P.alerta}/alerta-DISPARO-whatsapp.png`],
  ...[1, 2, 3, 4, 5, 6, 7].map((n) => [`casa-c${n}`, `${P.casa}/carrossel-0${n}.png`]),
  ["casa-story", `${P.casa}/STORY.png`],
  ["casa-zap", `${P.casa}/DISPARO-whatsapp.png`],
  ...["primeira", "paga", "carimbo"].flatMap((a) => [
    ...[1, 2, 3, 4, 5, 6].map((n) => [`${a}-c${n}`, `${P[a]}/carrossel-0${n}.png`]),
    [`${a}-story`, `${P[a]}/STORY.png`],
    [`${a}-zap`, `${P[a]}/DISPARO-whatsapp.png`],
  ]),
  ["lembrete-zap", `${P.apoio}/lembrete-DISPARO-whatsapp.png`],
  ["lembrete-story", `${P.apoio}/lembrete-STORY.png`],
  ["regras-story", `${P.apoio}/regras-STORY.png`],
  ["destaque-capa", `${P.apoio}/capa-destaque-instagram.png`],
  ["cartaz-a4", `${P.apoio}/cartaz-A4-portaria-e-balcao.png`],
  // 06 · A primeira é nossa (Meta Ads p/ quem nunca veio)
  ...[["geral", "A-geral"], ["pagode", "B-pagode"], ["sertanejo", "C-sertanejo"]].flatMap(([t, nome]) => [
    [`pv-${t}-feed`, `${P.pv}/anuncio-${nome}-FEED-1080x1350.png`],
    [`pv-${t}-story`, `${P.pv}/anuncio-${nome}-STORY-1080x1920.png`],
  ]),
  ["pv-zap-confirmada", `${P.pv}/whatsapp-cabecalho-lista-confirmada-1910x1000.png`],
  ["pv-zap-passaporte", `${P.pv}/whatsapp-cabecalho-seu-passaporte-1910x1000.png`],
  ["pv-cartaz-qr", `${P.pv}/cartaz-porta-QR-A4-2480x3508.png`],
  ...["2", "3"].flatMap((v) =>
    [["geral", "A-geral"], ["pagode", "B-pagode"], ["sertanejo", "C-sertanejo"]].flatMap(([t, nome]) => [
      [`pv${v}-${t}-feed`, `${P.pv}/V${v}/V${v}-anuncio-${nome}-FEED-1080x1350.png`],
      [`pv${v}-${t}-story`, `${P.pv}/V${v}/V${v}-anuncio-${nome}-STORY-1080x1920.png`],
    ]),
  ),
  ["pv-zap-passaporte-v2", `${P.pv}/whatsapp-cabecalho-seu-passaporte-v2-1910x1000.png`],
];

const VIDEOS = [
  ["alerta-video", `${P.alerta}/alerta-REELS-e-STORY.mp4`],
  ["casa-video", `${P.casa}/REELS.mp4`],
  ...["primeira", "paga", "carimbo"].flatMap((a) => [
    [`${a}-video-story`, `${P[a]}/REELS-e-STORY.mp4`],
    [`${a}-video-feed`, `${P[a]}/FEED-video-anuncio.mp4`],
  ]),
];

const browser = await openBrowser("chrome", { chromiumOptions: { gl: "angle" } });
let falhas = 0;
const quer = (id) => ids.length === 0 || ids.includes(id);

async function comp(id) {
  return selectComposition({ serveUrl, id, puppeteerInstance: browser, logLevel: "error" });
}

if (so !== "videos") {
  for (const [id, rel] of ESTATICOS.filter(([id]) => quer(id))) {
    const out = path.join(OUT, rel);
    mkdirSync(path.dirname(out), { recursive: true });
    try {
      await renderStill({ composition: await comp(id), serveUrl, output: out, puppeteerInstance: browser, logLevel: "error", overwrite: true });
      console.log("OK", rel);
    } catch (e) {
      falhas++;
      console.log("FALHOU", rel, String(e.message || e).slice(0, 200));
    }
  }
}
if (so !== "estaticos") {
  for (const [id, rel] of VIDEOS.filter(([id]) => quer(id))) {
    const out = path.join(OUT, rel);
    mkdirSync(path.dirname(out), { recursive: true });
    const t = Date.now();
    try {
      await renderMedia({ composition: await comp(id), serveUrl, codec: "h264", crf: 20, outputLocation: out, puppeteerInstance: browser, concurrency: 4, logLevel: "error", overwrite: true });
      console.log("OK", rel, `${Math.round((Date.now() - t) / 1000)}s`);
    } catch (e) {
      falhas++;
      console.log("FALHOU", rel, String(e.message || e).slice(0, 300));
    }
  }
}
await browser.close({ silent: true });
process.exit(falhas ? 1 : 0);
