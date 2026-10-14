// Página "o que vai ao ar no fim de semana": tudo da fila (nosso + esteira do designer) por dia e horário, com miniatura e nº,
// para o Rafa escolher o que a faxina de madrugada apaga e quando.
// Uso: node scripts/grade-fds.mjs 2026-10-16 2026-10-18
import { readFileSync, writeFileSync, mkdirSync } from "fs";

const [de = "2026-10-16", ate = "2026-10-18"] = process.argv.slice(2);
const cred = JSON.parse(readFileSync("C:/Users/User/Documents/projetos/.credentials/supabase-new-api-keys.json", "utf8"));
const H = { apikey: cred.secret_key, Authorization: `Bearer ${cred.secret_key}` };
const ini = `${de}T00:00:00-03:00`, fim = `${ate}T23:59:59-03:00`;
const fila = await (await fetch(`${cred.project_url}/rest/v1/butiquim_social_avulso?select=id,campanha,ordem,publicar_em,formato,video_url,itens_urls,legenda,marcados,status&publicar_em=gte.${encodeURIComponent(ini)}&publicar_em=lte.${encodeURIComponent(fim)}&status=in.(pendente,publicado)&order=publicar_em`, { headers: H })).json();

const DIAS = ["DOMINGO", "SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SÁBADO"];
const brt = (iso) => new Date(new Date(iso).getTime() - 3 * 3600e3);
const origem = (c) => (/claude/.test(c) ? ["nosso", "#d4f53c"] : /^dia-|^aquecimento-|^agenda-semana/.test(c) ? ["esteira (designer)", "#7ab8ff"] : ["outro", "#ccc"]);
const tipoPeca = (u) => {
  const a = (u || "").split("/").pop();
  if (/lista-/.test(a)) return "LISTA";
  if (/broll/.test(a)) return "vídeo do artista";
  if (/vespera/.test(a)) return "véspera";
  if (/^ag-|agenda/.test(a)) return "agenda";
  if (/promo|smirnoff|bud/i.test(a)) return "promo";
  if (/story/.test(a)) return "flyer story";
  if (/feed/.test(a)) return "flyer feed";
  return a.slice(0, 24);
};
const midia = (u) => (/\.mp4/i.test(u) ? `<video src="${u}" muted loop playsinline preload="metadata" onmouseover="this.play()" onmouseout="this.pause()"></video>` : `<img src="${u}" loading="lazy">`);

const porDia = {};
for (const r of fila) {
  const d = brt(r.publicar_em);
  const k = d.toISOString().slice(0, 10);
  (porDia[k] ||= []).push({ ...r, hora: d.toISOString().slice(11, 16), dia: DIAS[d.getUTCDay()] });
}
const esc = (s) => (s || "").replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c]);
const colunas = Object.keys(porDia).sort().map((k) => {
  const itens = porDia[k];
  const cards = itens.map((r) => {
    const [org, cor] = origem(r.campanha);
    const urls = r.itens_urls ? JSON.parse(r.itens_urls) : [r.video_url];
    const leg = esc((r.legenda || "").split("\n").find((x) => x.trim()) || "");
    return `<article><header><b>#${r.id}</b> <span class="h">${r.hora}</span> <span class="f">${r.formato === "CAROUSEL" ? `CARROSSEL (${urls.length})` : r.formato}</span></header>
<div class="tags"><i style="background:${cor}">${org}</i><i>${tipoPeca(r.video_url)}</i>${r.status === "publicado" ? "<i class=pub>já publicado</i>" : ""}</div>
<div class="m ${urls.length > 1 ? "multi" : ""}">${urls.slice(0, 4).map(midia).join("")}</div>
${leg ? `<p>${leg}</p>` : ""}${r.marcados ? `<p class="mk">marca @${esc(r.marcados).replaceAll(",", " @")}</p>` : ""}</article>`;
  }).join("");
  const [y, m, dd] = k.split("-");
  return `<section><h2>${itens[0].dia} ${dd}/${m} <small>${itens.length} posts</small></h2>${cards}</section>`;
}).join("");

const html = `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Fim de semana na fila</title>
<style>body{margin:0;padding:20px 16px;background:#0e0e0e;color:#eee;font:14px system-ui,sans-serif}h1{font-size:20px;margin:0 0 4px}
.lead{color:#aaa;margin:0 0 18px}.grade{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:18px;align-items:start}
section{background:#171717;border-radius:12px;padding:12px}h2{font-size:17px;margin:0 0 10px;color:#d4f53c}h2 small{color:#888;font-weight:400}
article{border-top:1px solid #2a2a2a;padding:10px 0}header{display:flex;gap:8px;align-items:baseline}header b{font-size:16px}.h{font-size:16px;color:#fff}.f{color:#aaa;font-size:12px}
.tags{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0}.tags i{font-style:normal;font-size:11px;padding:2px 7px;border-radius:99px;background:#333;color:#111}.tags i:nth-child(2){color:#eee}.tags .pub{background:#555;color:#fff}
.m{display:grid;grid-template-columns:1fr;gap:4px}.m.multi{grid-template-columns:repeat(4,1fr)}.m img,.m video{width:100%;border-radius:6px;background:#222;max-height:340px;object-fit:cover}.m.multi img,.m.multi video{max-height:150px}
p{margin:6px 0 0;color:#ccc;font-size:12px}.mk{color:#8fc}</style>
<h1>O que vai ao ar no fim de semana — ${de.slice(8)}/${de.slice(5, 7)} a ${ate.slice(8)}/${ate.slice(5, 7)}</h1>
<p class="lead">Tudo o que está na fila automática do @obutiquim (verde = nosso, azul = esteira do designer). Stories feitos à mão pelo storymaker não aparecem aqui.<br>
Me diga os <b>números</b> que a faxina deve apagar e <b>quando</b> (ex.: "#702 e #705 às 3h de segunda").<br>Passe o mouse nos vídeos para tocar.</p>
<div class="grade">${colunas}</div></html>`;

const DEST = "G:/Meu Drive/02 O Butiquim/Agenda Claude/Grade fim de semana";
mkdirSync(DEST, { recursive: true });
const arq = `${DEST}/fds-${de}-a-${ate}.html`;
writeFileSync(arq, html, "utf8");
console.log(arq, "·", fila.length, "posts ·", Object.entries(porDia).map(([k, v]) => `${k}: ${v.length}`).join(" | "));
