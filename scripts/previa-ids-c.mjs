// Prévia das identidades C (amostra 19/10): copia os 3 feeds pro Drive e gera previa.html
// Uso: node scripts/previa-ids-c.mjs
import { copyFileSync, mkdirSync, writeFileSync } from "fs";

const DEST = "G:/Meu Drive/02 O Butiquim/Agenda Claude/IDs C - amostra 19-10";
mkdirSync(DEST, { recursive: true });
const PECAS = [
  ["sexta", "Sexta C — “Lambe-lambe” (v3: faixa do nome mais baixa)", "Cartaz de show colado no poste: papel osso, tinta preta, rasgos, fita, carimbo da data, canhotos “LISTA VIP” no rodapé. Faixa do nome desceu pra não cair no rosto. Exemplo com grupo: Juntou Deu Samba, 27/11."],
  ["sexta2", "Sexta C — “Lambe-lambe” com outro artista", "A mesma identidade com uma artista sozinha no quadro, pra ver o encaixe. Exemplo: Hilana, 06/11."],
  ["sextaD", "Sexta D — “Mesa do Butica” (NOVA)", "A mesa do bar vista de cima: polaroid do artista com legenda à caneta, guardanapo com o nome e a lista escritos à mão, bolacha de chope com o “O”, tampinha com a hora e “SEXTA” estampado na mesa. Exemplo: Hilana, 06/11."],
  ["sabadoD", "Sabadá D — “Gibi do Butica” (NOVA, paleta diferente)", "Página de história em quadrinhos: amarelo, vermelho e azul, retícula de pontos, raios pop, balão de fala “SABADÁ!”, onomatopeia com o estilo, caixas de legenda com data e lista; o artista com contorno grosso de gibi. O lima da marca fica só no “O” pequeno. (No lugar do Pôster de Cinema.) Exemplo: Juninho Cari, 21/11."],
  ["sabado", "Sabadá C — “Lousa do Butica” (novo)", "O quadro-negro do boteco escrito a giz branco e lima, moldura de madeira, rabiscos, “hoje!” circulado, estrelas e notas em volta do artista — que fica inteiro, em cor, sem nada na frente do rosto. Exemplo: Deixa Clarear, 28/11."],
  ["domingo", "Saideira C — “Comanda” ✅ aprovada", "A conta da última rodada saindo da impressora, na mesa de madeira: artista impresso em risografia preto + lima, itens da noite, TOTAL = saudade de segunda, carimbo SAIDEIRA e o “O” como peso de papel. Exemplo: João Maurício, 15/11."],
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
<h1>Butiquim — identidades novas (C e D), só o feed</h1>
<p>Amostra pra decidir se seguimos. Se aprovar: viram os 4 formatos (feed imagem, feed vídeo, story, story com B-roll) + artes de lista no mesmo estilo, e a rotação semanal passa a A / B / C.</p>
<div class="grade">${secoes}</div></html>`);
console.log(DEST + "/previa.html");
