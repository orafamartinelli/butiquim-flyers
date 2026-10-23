// Primeira Vez (23/10/2026): cabeçalho WhatsApp "CARIMBO DUPLO" (JPG 1910x1000) — sai 5 min depois do check-in da 1ª visita.
// Uso: node scripts/render-pv-carimbo.mjs [--rebundle] [composição=pv-wa-carimbo-img] [arquivo=wa-header-primeiravez-carimbo-1910x1000.jpg]
import { execSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, statSync } from "node:fs";
import path from "node:path";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";

const raiz = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const serveUrl = path.join(raiz, "build-campanha");
const WA = path.join(raiz, "out", "campanha", "06-primeira-vez", "WhatsApp");
const RAW = path.join(raiz, "out", "campanha", "06-primeira-vez", "_raw");
const FF = "C:/Users/User/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.2-full_build/bin/ffmpeg.exe";
for (const d of [WA, RAW]) mkdirSync(d, { recursive: true });
const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const ID = args[0] || "pv-wa-carimbo-img";
const NOME = args[1] || "wa-header-primeiravez-carimbo-1910x1000.jpg";

if (process.argv.includes("--rebundle") || !existsSync(serveUrl)) {
  execSync(`npx remotion bundle src/entries/campanha/index.ts --out-dir=build-campanha --log=error`, { cwd: raiz, stdio: "inherit" });
}
const browser = await openBrowser("chrome", { chromiumOptions: { gl: "angle" } });
const composition = await selectComposition({ serveUrl, id: ID, puppeteerInstance: browser, logLevel: "error" });
const png = path.join(RAW, `${ID}.png`);
await renderStill({ composition, serveUrl, output: png, puppeteerInstance: browser, logLevel: "error", overwrite: true });
await browser.close({ silent: true });
const jpg = path.join(WA, NOME);
const r = spawnSync(FF, ["-y", "-v", "error", "-i", png, "-q:v", "2", jpg], { encoding: "utf8" });
if (r.status !== 0) throw new Error(r.stderr.slice(-400));
console.log("OK", jpg, `${(statSync(jpg).size / 1048576).toFixed(2)} MB`);
