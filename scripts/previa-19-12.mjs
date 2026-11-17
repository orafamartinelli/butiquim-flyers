// Prévia avulsa do sáb 19/12 refeito (CQSamba) — 16/11/2026
import { mkdirSync, copyFileSync, writeFileSync, existsSync } from "fs";
const DEST = "G:\\Meu Drive\\02 O Butiquim\\Agenda Claude\\12 - DEZ - 19-12 CQSamba (refeito 16-11)";
mkdirSync(DEST, { recursive: true });
const pecas = [
  ["out/agendas/agenda-s12-seg-FEED.mp4", "Seg 14/12 17h — agenda (carrossel)"],
  ["out/agendas/agenda-s12-seg-STORY.mp4", "Seg 14/12 17h20 — agenda (story)"],
  ["out/agendas/agenda-s12-FEED.mp4", "Ter 15/12 17h — agenda (carrossel)"],
  ["out/agendas/agenda-s12-STORY.mp4", "Ter 15/12 17h20 — agenda (story)"],
  ["out/final/sabado12-STORY.png", "Ter 15/12 17h32 e Sáb 19/12 13h30 — story"],
  ["out/final/sabado12-FEED.mp4", "Sáb 19/12 12h — Reels"],
  ["out/final/sabado12-STORY-BROLL.mp4", "Sáb 19/12 16h — story com vídeo"],
  ["out/final/sabado12-FEED.png", "Sáb 19/12 — capa do carrossel da manhã"],
];
let html = `<!doctype html><meta charset="utf-8"><title>Sáb 19/12 — CQSamba</title>
<style>body{font-family:system-ui;background:#111;color:#eee;margin:16px}h1{color:#c6ff00}.g{display:flex;flex-wrap:wrap;gap:16px}
figure{margin:0;width:300px}video,img{width:300px;border-radius:8px;background:#000}figcaption{font-size:14px;margin-top:6px}</style>
<h1>Sábado 19/12 — CQSamba (refeito em 16/11)</h1><p>Antes: Juninho Cari. 9 posts de volta na fila. Lista 21h30 = arte genérica de lista (não muda).</p><div class="g">`;
for (const [src, cap] of pecas) {
  if (!existsSync(src)) { console.log("faltou", src); continue; }
  const nome = src.split("/").pop();
  copyFileSync(src, `${DEST}\\${nome}`);
  html += `<figure>${nome.endsWith(".mp4") ? `<video src="${nome}" controls muted loop></video>` : `<img src="${nome}">`}<figcaption>${cap}</figcaption></figure>`;
}
writeFileSync(`${DEST}\\previa.html`, html + "</div>");
console.log(`${DEST}\\previa.html`);
