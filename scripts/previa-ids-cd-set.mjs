// Prévia das identidades C e D com os 4 formatos (feed imagem, feed vídeo, story, story com B-roll): copia pro Drive e gera previa.html
// Uso: node scripts/previa-ids-cd-set.mjs
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "fs";

const DEST = "G:/Meu Drive/02 O Butiquim/Agenda Claude/IDs C e D - 4 formatos";
mkdirSync(DEST, { recursive: true });
const IDS = [
  ["sexta", "Sexta C — “Lambe-lambe”", "Juntou Deu Samba, 27/11"],
  ["sextaD", "Sexta D — “Mesa do Butica”", "Hilana, 06/11"],
  ["sabado", "Sabadá C — “Lousa do Butica”", "Deixa Clarear, 28/11"],
  ["sabadoD", "Sabadá D — “Gibi do Butica”", "Juninho Cari, 21/11"],
  ["domingo", "Saideira C — “Comanda”", "João Maurício, 15/11"],
];
const FORMATOS = [["FEED.png", "Feed (imagem)"], ["FEED.mp4", "Feed em vídeo / Reels (8 s, com som do artista)"], ["STORY.png", "Story"], ["STORY-BROLL.mp4", "Story com vídeo do artista (10 s)"]];
const secoes = IDS.map(([k, t, ex]) => {
  const pecas = FORMATOS.filter(([s]) => existsSync(`out/ids-c/${k}-${s}`)).map(([s, rot]) => {
    const arq = `${k}-${s}`;
    copyFileSync(`out/ids-c/${arq}`, `${DEST}/${arq}`);
    const tag = s.endsWith(".mp4") ? `<video src="${arq}" controls loop playsinline preload="metadata"></video>` : `<img src="${arq}" loading="lazy">`;
    return `<figure>${tag}<figcaption>${rot}</figcaption></figure>`;
  }).join("");
  return `<section><h2>${t} <small>· ${ex}</small></h2><div class="grade">${pecas}</div></section>`;
}).join("");
writeFileSync(`${DEST}/previa.html`, `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Identidades C e D — 4 formatos</title>
<style>body{margin:0;padding:24px 16px;background:#111;color:#eee;font:15px system-ui,sans-serif}h1{font-size:22px;margin:0 0 6px}p{color:#aaa;margin:0 0 6px}
h2{font-size:17px;margin:30px 0 12px;color:#d4f53c}h2 small{color:#aaa;font-weight:400}.grade{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:14px}
figure{margin:0}img,video{width:100%;border-radius:8px;background:#222}figcaption{font-size:13px;color:#aaa;margin-top:4px}</style>
<h1>Butiquim — identidades novas, 1 conjunto de cada pra validar</h1>
<p>Feed imagem · feed em vídeo (vira Reels) · story · story com o vídeo do artista. Tudo aprovado no feed; aqui é pra validar o movimento e o B-roll.</p>
${secoes}</html>`);
console.log(DEST + "/previa.html");
