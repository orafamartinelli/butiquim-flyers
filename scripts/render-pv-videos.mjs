// Vídeos Meta Ads "Primeira vez" (22/10/2026): V4 convite animado, V5/V6 filmagem real.
// Uso: node scripts/render-pv-videos.mjs [--rebundle] [--id=pv4-story,...]
// Clipes em public/broll/pv/ (fora do git; origem anotada em primeira-vez-videos.tsx).
// Render um por vez (OffthreadVideo em paralelo derruba o extrator). Sai mudo; o áudio entra no ffmpeg.
import { execSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, statSync } from "node:fs";
import path from "node:path";
import { openBrowser, renderMedia, selectComposition } from "@remotion/renderer";

const raiz = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const serveUrl = path.join(raiz, "build-campanha");
const OUT = path.join(raiz, "out", "pv-videos");
const FFDIR = "C:/Users/User/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.2-full_build/bin";
const FF = path.join(FFDIR, "ffmpeg.exe");
const args = process.argv.slice(2);
const ids = (args.find((a) => a.startsWith("--id=")) || "").slice(5).split(",").filter(Boolean);
mkdirSync(path.join(OUT, "raw"), { recursive: true });

if (args.includes("--rebundle") || !existsSync(serveUrl)) {
  execSync(`npx remotion bundle src/entries/campanha/index.ts --out-dir=build-campanha --log=error`, { cwd: raiz, stdio: "inherit" });
}

const VIDS = [
  ["pv4-story", "V4", "V4-convite-animado-STORY-1080x1920", 11],
  ["pv4-feed", "V4", "V4-convite-animado-FEED-1080x1350", 11],
  ["pv5-story", "V5", "V5-video-STORY-1080x1920", 21],
  ["pv5-feed", "V5", "V5-video-FEED-1080x1350", 21],
  ["pv6-story", "V6", "V6-video-STORY-1080x1920", 33],
  ["pv6-feed", "V6", "V6-video-FEED-1080x1350", 33],
];

const browser = await openBrowser("chrome", { chromiumOptions: { gl: "angle" } });
let falhas = 0;
for (const [id, pasta, nome, semente] of VIDS.filter(([id]) => ids.length === 0 || ids.includes(id))) {
  const raw = path.join(OUT, "raw", `${id}.mp4`);
  const t = Date.now();
  try {
    const composition = await selectComposition({ serveUrl, id, puppeteerInstance: browser, logLevel: "error" });
    await renderMedia({ composition, serveUrl, codec: "h264", crf: 14, muted: true, outputLocation: raw, puppeteerInstance: browser, concurrency: 4, logLevel: "error", overwrite: true });
    const seg = composition.durationInFrames / composition.fps;
    const wav = path.join(OUT, "raw", `${id}.wav`);
    execSync(`node scripts/trilha-leve.mjs ${seg} "${wav}" ${semente}`, { cwd: raiz, stdio: "ignore" });
    mkdirSync(path.join(OUT, pasta), { recursive: true });
    const fin = path.join(OUT, pasta, `${nome}.mp4`);
    // H.264 High + AAC 48k; teto de bitrate p/ ficar bem abaixo de 15 MB; trilha em -16 LUFS sem picos
    const r = spawnSync(FF, ["-y", "-v", "error", "-i", raw, "-i", wav, "-map", "0:v", "-map", "1:a",
      "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-maxrate", "6.5M", "-bufsize", "13M", "-profile:v", "high", "-pix_fmt", "yuv420p", "-r", "30",
      "-af", "loudnorm=I=-16:TP=-1.5:LRA=7,aresample=48000", "-c:a", "aac", "-b:a", "160k", "-ar", "48000",
      "-t", String(seg), "-movflags", "+faststart", fin], { encoding: "utf8" });
    if (r.status !== 0) throw new Error(r.stderr.slice(-400));
    // capa = 1º quadro
    spawnSync(FF, ["-y", "-v", "error", "-i", fin, "-frames:v", "1", "-q:v", "2", path.join(OUT, pasta, `${nome.replace(/-(STORY|FEED)-/, "-$1-CAPA-")}.jpg`)]);
    console.log("OK", id, `${(statSync(fin).size / 1048576).toFixed(1)} MB`, `${Math.round((Date.now() - t) / 1000)}s`);
  } catch (e) {
    falhas++;
    console.log("FALHOU", id, String(e.message || e).slice(0, 400));
  }
}
await browser.close({ silent: true });
process.exit(falhas ? 1 : 0);
