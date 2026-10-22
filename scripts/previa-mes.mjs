// Prévia de um mês: copia as peças do mês (noites, Folhinhas e agendas) para o Drive e gera previa.html.
// Uso: node scripts/previa-mes.mjs 2026-12
import { copyFileSync, existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import { noitesDoMes } from "./_rotacao.mjs";

const MES = process.argv[2];
if (!/^\d{4}-\d{2}$/.test(MES || "")) throw new Error("uso: node scripts/previa-mes.mjs YYYY-MM");
const NOMES = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];
const ABR = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
const mi = +MES.slice(5) - 1;
const DEST = `G:/Meu Drive/02 O Butiquim/Agenda Claude/${MES.slice(5)} - ${ABR[mi]}`;
mkdirSync(DEST, { recursive: true });
const agenda = JSON.parse(readFileSync("src/agenda.json", "utf8")).noites;
const nome = (d) => agenda.find((x) => x.data === d)?.nome || "?";
const DIAS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const dia = (d) => `${DIAS[new Date(`${d}T12:00:00Z`).getUTCDay()]} ${d.slice(8)}/${d.slice(5, 7)}`;
const ID = { A: "A", B: "B", C: "C", D: "D" };
const R = noitesDoMes(MES);
const grupos = [
  ...R.noites.map((n) => ({ titulo: `${dia(n.data)} — ${nome(n.data)} (identidade ${ID[n.id]})`, base: `out/final/${n.key}`, nome: `${n.data.slice(8)}-${n.data.slice(5, 7)}-${n.key}`, lista: "noite" })),
  ...R.noites.filter((n) => n.vespera).map((n) => ({ titulo: `${dia(n.data)} — FOLHINHA (véspera de feriado)`, base: `out/vespera/${n.vespera}`, nome: `${n.data.slice(8)}-${n.data.slice(5, 7)}-${n.vespera}`, lista: "noite" })),
  ...R.agendas.map((a) => ({ titulo: `Agenda de terça ${a.terca.slice(8)}/${a.terca.slice(5, 7)} — semana ${a.datas.map((d) => d.slice(8)).join(", ")} (${a.versao})`, base: `out/agendas/agenda-${a.s}`, nome: `agenda-${a.s}`, lista: "agenda" })),
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
const aviso = R.incompletas.length ? `<p>⚠️ Semanas sem agenda de terça (planilha incompleta): ${R.incompletas.map((i) => `semana ${i.semana} (tem só ${i.tem.join(", ")})`).join(" · ")}.</p>` : "";
writeFileSync(`${DEST}/previa.html`, `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${NOMES[mi]} na esquina</title>
<style>body{margin:0;padding:24px 16px;background:#111;color:#eee;font:15px system-ui,sans-serif}h1{font-size:22px;margin:0 0 6px}p{color:#aaa;margin:0 0 6px}
h2{font-size:17px;margin:30px 0 12px;color:#d4f53c}.grade{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px}
figure{margin:0}img,video{width:100%;border-radius:8px;background:#222}figcaption{font-size:13px;color:#aaa;margin-top:4px}</style>
<h1>Butiquim — material de ${NOMES[mi]} na nossa identidade</h1>
<p>${R.noites.length} noites · rotação A / B / C / D por semana · ${R.agendas.length} agenda(s) de terça · tudo conferido contra a planilha.</p>
${aviso}${secoes}</html>`);
console.log(DEST + "/previa.html");
