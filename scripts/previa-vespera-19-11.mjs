// Prévia da semana 19–22/11/2026 (quinta 19 = véspera da Consciência Negra): Folhinha 19/11, sexta 20/11 e agenda de 4 noites.
// Copia as peças para o Drive e gera previa.html.  Uso: node scripts/previa-vespera-19-11.mjs
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "fs";

const DEST = "G:/Meu Drive/02 O Butiquim/Agenda Claude/11 - NOV - vespera 19-11";
mkdirSync(DEST, { recursive: true });
const grupos = [
  { titulo: "Quinta 19/11: Encontro do Free (Folhinha, véspera da Consciência Negra)", base: "out/vespera/vespera4", nome: "19-11-vespera", lista: "vespera" },
  { titulo: "Sexta 20/11: Gaelzinho & Ewerton KBÇA (identidade B, Partidas)", base: "out/final/sexta8", nome: "20-11-sexta8", lista: "noite" },
  { titulo: "Agenda da semana (terça 17/11): 19 a 22, quatro noites", base: "out/agendas/agenda-s8", nome: "agenda-19-a-22", lista: "agenda" },
];
const L = {
  vespera: [["FEED.png", "Feed (imagem)"], ["FEED.mp4", "Feed em vídeo / Reels"], ["STORY.png", "Story"], ["STORY.mp4", "Story em vídeo"], ["STORY-BROLL.mp4", "Story com vídeo (Rilex, Papo 10, Pagode 44)"]],
  noite: [["FEED.png", "Feed (imagem)"], ["FEED.mp4", "Feed em vídeo / Reels"], ["STORY.png", "Story"], ["STORY-BROLL.mp4", "Story com vídeo (sem vídeo de show: foto em movimento)"]],
  agenda: [["FEED.png", "Feed (imagem)"], ["FEED.mp4", "Feed em vídeo"], ["STORY.png", "Story"], ["STORY.mp4", "Story em vídeo"]],
};
const secoes = grupos.map((g) => {
  const pecas = L[g.lista].filter(([s]) => existsSync(`${g.base}-${s}`)).map(([s, rot]) => {
    const arq = `${g.nome}-${s}`;
    copyFileSync(`${g.base}-${s}`, `${DEST}/${arq}`);
    const tag = s.endsWith(".mp4") ? `<video src="${arq}" controls loop playsinline preload="metadata"></video>` : `<img src="${arq}" loading="lazy">`;
    return `<figure>${tag}<figcaption>${rot}</figcaption></figure>`;
  }).join("");
  return `<section><h2>${g.titulo}</h2><div class="grade">${pecas}</div></section>`;
}).join("");
writeFileSync(`${DEST}/previa.html`, `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Véspera 19/11</title>
<style>body{margin:0;padding:24px 16px;background:#111;color:#eee;font:15px system-ui,sans-serif}h1{font-size:22px;margin:0 0 6px}p{color:#aaa;margin:0 0 6px}
h2{font-size:17px;margin:30px 0 12px;color:#d4f53c}.grade{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px}
figure{margin:0}img,video{width:100%;border-radius:8px;background:#222}figcaption{font-size:13px;color:#aaa;margin-top:4px}</style>
<h1>Semana da véspera: 19 a 22/11</h1>
<p>Nossas peças de quinta 19 e sexta 20, mais a agenda da semana refeita com as 4 noites. Nada foi agendado ainda: só entra na fila depois do seu OK.</p>
${secoes}</html>`);
console.log("prévia:", `${DEST}/previa.html`);
