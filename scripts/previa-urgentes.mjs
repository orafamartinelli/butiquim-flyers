// Página de prévia das urgências de outubro (14/10) + cópia das peças para o Drive do Rafa.
// Uso: node scripts/previa-urgentes.mjs   (roda de novo quando os vídeos terminarem: inclui o que existir)
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "fs";

const DEST = "G:/Meu Drive/02 O Butiquim/Agenda Claude/10 - OUT - ajustes 14-10";
mkdirSync(DEST, { recursive: true });

const grupos = [
  { titulo: "Domingo 18/10 — Alister Ferraz (identidade A: Rótulo)", base: "out/final/domingo3", nome: "18-10-alister" },
  { titulo: "Domingo 25/10 — João Maurício (identidade B: Neon)", base: "out/final/domingo4", nome: "25-10-joao-mauricio" },
  { titulo: "Sexta 30/10 — SOU VIBE (no lugar do Papo 10)", base: "out/final/sexta5", nome: "30-10-sou-vibe" },
  { titulo: "Domingo 01/11 — Ricardo Ribeiro (vira o mês; véspera de Finados)", base: "out/final/domingo5", nome: "01-11-ricardo-ribeiro" },
  { titulo: "Domingo 01/11 — FOLHINHA, véspera de feriado (Reels 12h, story 13h30 e 16h)", base: "out/vespera/vespera2", nome: "01-11-vespera-folhinha" },
];
const agendas = [
  { titulo: "Agenda da semana 23 a 25/10 (agora com o domingo)", base: "out/agendas/agenda-s4", nome: "agenda-23-a-25" },
  { titulo: "Agenda da semana 30/10 a 01/11 (Sou Vibe + domingo da virada do mês)", base: "out/agendas/agenda-s5", nome: "agenda-30-10-a-01-11" },
];

const pecas = (g, lista) =>
  lista
    .filter(([suf]) => existsSync(`${g.base}-${suf}`))
    .map(([suf, rotulo]) => {
      const arq = `${g.nome}-${suf}`;
      copyFileSync(`${g.base}-${suf}`, `${DEST}/${arq}`);
      const tag = suf.endsWith(".mp4") ? `<video src="${arq}" controls loop playsinline></video>` : `<img src="${arq}">`;
      return `<figure>${tag}<figcaption>${rotulo}</figcaption></figure>`;
    })
    .join("");

const NOITE = [["FEED.png", "Feed (imagem)"], ["FEED.mp4", "Feed em vídeo / Reels"], ["STORY.png", "Story"], ["STORY-BROLL.mp4", "Story com vídeo do artista"]];
const AGENDA = [["FEED.png", "Feed (imagem)"], ["FEED.mp4", "Feed em vídeo"], ["STORY.png", "Story"], ["STORY.mp4", "Story em vídeo"]];

const secoes = [...grupos.map((g) => [g, NOITE]), ...agendas.map((g) => [g, AGENDA])]
  .map(([g, l]) => `<section><h2>${g.titulo}</h2><div class="grade">${pecas(g, l) || "<p>renderizando…</p>"}</div></section>`)
  .join("");

writeFileSync(
  `${DEST}/previa.html`,
  `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Ajustes de outubro</title>
<style>body{margin:0;padding:24px 16px;background:#111;color:#eee;font:15px system-ui,sans-serif}h1{font-size:22px}h2{font-size:17px;margin:32px 0 12px;color:#d4f53c}
.grade{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:14px}figure{margin:0}img,video{width:100%;border-radius:8px;background:#222}
figcaption{font-size:13px;color:#aaa;margin-top:4px}</style>
<h1>Butiquim — ajustes de outubro (14/10)</h1><p>Seguindo a planilha: 18/10 Alister Ferraz, 25/10 João Maurício, 30/10 Sou Vibe. Nada foi para a fila do Instagram ainda.</p>
${secoes}</html>`,
);
console.log(DEST + "/previa.html");
