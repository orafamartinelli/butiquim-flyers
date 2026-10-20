// Prévia das identidades C (amostra 19/10): copia os 3 feeds pro Drive e gera previa.html
// Uso: node scripts/previa-ids-c.mjs
import { copyFileSync, mkdirSync, writeFileSync } from "fs";

const DEST = "G:/Meu Drive/02 O Butiquim/Agenda Claude/IDs C - amostra 19-10";
mkdirSync(DEST, { recursive: true });
const PECAS = [
  ["sexta", "Sexta C — “Lambe-lambe”", "Cartaz de show colado no poste: papel osso, tinta preta e lima, rasgos, fita, carimbo da data e canhotos pra arrancar. Exemplo: Juntou Deu Samba, 27/11."],
  ["sabado", "Sabadá C — “Chope Gelado”", "A noite vista de dentro do copo: espuma no alto, chope dourado, bolhas subindo e o vidro suado na frente; o nome do artista no bafo do copo, data na bolacha. Exemplo: Deixa Clarear, 28/11."],
  ["domingo", "Saideira C — “Comanda”", "A conta da última rodada saindo da impressora, na mesa de madeira: artista impresso em risografia preto + lima, itens da noite, TOTAL = saudade de segunda, carimbo SAIDEIRA e o “O” como peso de papel. Exemplo: João Maurício, 15/11."],
];
const secoes = PECAS.map(([k, t, d]) => {
  const arq = `${k}-C-FEED.png`;
  copyFileSync(`out/ids-c/${arq}`, `${DEST}/${arq}`);
  return `<section><img src="${arq}" loading="lazy"><div><h2>${t}</h2><p>${d}</p></div></section>`;
}).join("");
writeFileSync(`${DEST}/previa.html`, `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Identidades C — amostra</title>
<style>body{margin:0;padding:24px 16px;background:#111;color:#eee;font:15px system-ui,sans-serif}h1{font-size:22px;margin:0 0 6px}p{color:#aaa;margin:0 0 6px;line-height:1.4}
.grade{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:24px;margin-top:20px}section{display:flex;flex-direction:column;gap:10px}
h2{font-size:17px;margin:0;color:#d4f53c}img{width:100%;border-radius:8px;background:#222}</style>
<h1>Butiquim — 3 identidades novas (C), só o feed, 1 por dia</h1>
<p>Amostra pra decidir se seguimos. Se aprovar: viram os 4 formatos (feed imagem, feed vídeo, story, story com B-roll) + artes de lista no mesmo estilo, e a rotação semanal passa a A / B / C.</p>
<div class="grade">${secoes}</div></html>`);
console.log(DEST + "/previa.html");
