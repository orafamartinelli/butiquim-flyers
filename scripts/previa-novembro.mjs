// Prévia de NOVEMBRO/2026 para aprovação única do Rafa: copia as peças para o Drive e gera previa.html.
// Uso: node scripts/previa-novembro.mjs
import { copyFileSync, existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";

const DEST = "G:/Meu Drive/02 O Butiquim/Agenda Claude/11 - NOV";
mkdirSync(DEST, { recursive: true });
const agenda = JSON.parse(readFileSync("src/agenda.json", "utf8")).noites;
const nome = (d) => agenda.find((x) => x.data === d)?.nome || "?";
const DIAS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const dia = (d) => `${DIAS[new Date(`${d}T12:00:00Z`).getUTCDay()]} ${d.slice(8)}/${d.slice(5, 7)}`;
const NOITES = [
  ["2026-11-06", "sexta6", "B"], ["2026-11-07", "sabado6", "B"], ["2026-11-08", "domingo6", "B"],
  ["2026-11-14", "sabado7", "A"], ["2026-11-15", "domingo7", "A"], ["2026-11-21", "sabado8", "B"], ["2026-11-22", "domingo8", "B"],
  ["2026-11-27", "sexta9", "A"], ["2026-11-28", "sabado9", "A"],
];
const grupos = [
  ...NOITES.map(([d, k, v]) => ({ titulo: `${dia(d)} — ${nome(d)} (identidade ${v})`, base: `out/final/${k}`, nome: `${d.slice(8)}-11-${k}`, lista: "noite" })),
  { titulo: "Sábado 14/11 — FOLHINHA, véspera do feriado de 15/11 (Reels 12h, story 13h30 e 16h)", base: "out/vespera/vespera3", nome: "14-11-vespera", lista: "noite" },
  { titulo: "Agenda de terça 03/11 — semana 06 a 08", base: "out/agendas/agenda-s6", nome: "agenda-06-a-08", lista: "agenda" },
  { titulo: "Agenda de terça 17/11 — semana 21 e 22", base: "out/agendas/agenda-s8", nome: "agenda-21-e-22", lista: "agenda" },
  { titulo: "Agenda de terça 24/11 — semana 27 e 28", base: "out/agendas/agenda-s9", nome: "agenda-27-e-28", lista: "agenda" },
];
const L = {
  noite: [["FEED.png", "Feed (imagem)"], ["FEED.mp4", "Feed em vídeo / Reels"], ["STORY.png", "Story"], ["STORY-BROLL.mp4", "Story com vídeo do artista"]],
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
<title>Novembro na esquina</title>
<style>body{margin:0;padding:24px 16px;background:#111;color:#eee;font:15px system-ui,sans-serif}h1{font-size:22px;margin:0 0 6px}p{color:#aaa;margin:0 0 6px}
h2{font-size:17px;margin:30px 0 12px;color:#d4f53c}.grade{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px}
figure{margin:0}img,video{width:100%;border-radius:8px;background:#222}figcaption{font-size:13px;color:#aaa;margin-top:4px}</style>
<h1>Butiquim — material de NOVEMBRO na nossa identidade</h1>
<p>9 noites + Folhinha (véspera 15/11) + 3 agendas de terça · rodízio A/B por semana · tudo conferido contra a planilha.</p>
<p>⚠️ Na planilha ainda vazias: <b>13, 20 e 29/11</b> (Victor). Dom 15/11 entrou em 19/10. As agendas das semanas 13–15, 20–22 e 27–29 saem quando ele fechar.</p>
${secoes}</html>`);
console.log(DEST + "/previa.html");
