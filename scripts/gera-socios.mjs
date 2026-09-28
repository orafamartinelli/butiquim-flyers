// Gera a página dos sócios (versão para compartilhar) a partir das artes comprimidas em socios/m/
import { writeFileSync, existsSync } from "fs";
const DIR = "C:/Users/User/AppData/Local/Temp/claude/C--Users-User/1ba7c3b4-4112-40bc-bfff-dc730696006a/scratchpad/socios";

const ID = {
  sextaA: ["Placa de Esquina", "Preto e lima, placa de rua “NA ESQUINA COM” e o “O” do logo em 3D."],
  sabadoA: ["Esquina de Vidro", "Luzes de palco, “SABADÁ” cromado, “O” furta-cor e card de vidro fosco."],
  domingoA: ["Rótulo da Última Rodada", "Rótulo de bebida: selo com a data, faixa com o nome, canhoto com a lista e “O” de cobre."],
  sextaB: ["Painel de Embarque", "Painel de aeroporto: as letras giram até formar atração, data e horário; bebidas no serviço de bordo."],
  sabadoB: ["Lado A", "Capa de disco ao vivo: o vinil gira soltando notas e a lista vira tracklist, faixa a faixa."],
  domingoB: ["Letreiro Neon", "Parede de tijolo com néons acendendo: o “O” do logo e “Saideira” em verde-lima."],
  vespera: ["Folhinha", "A folhinha de parede é arrancada e revela “SEGUNDA 12 · FERIADO” circulado com o “O” do logo."],
};

const SEMANAS = [
  { id: "s1", titulo: "02 a 04/10", id_: "A", agenda: ["s1", "V1 · Lineup", "ter 29/09"], noites: [
    ["sexta", "Sex 02/10", "Gui Silva", "Sertanejo", "sextaA"],
    ["sabado", "Sáb 03/10", "Sou Vibe", "Pagode", "sabadoA"],
    ["domingo", "Dom 04/10", "Ricardo Ribeiro", "Sertanejo", "domingoA"] ] },
  { id: "s2", titulo: "09 a 11/10", id_: "B", agenda: ["s2", "V2 · Cartaz", "ter 06/10"], noites: [
    ["sexta2", "Sex 09/10", "Grupo Rilex", "Pagode", "sextaB"],
    ["sabado2", "Sáb 10/10", "CQ Samba", "Pagode", "sabadoB"],
    ["domingo2", "Dom 11/10", "Biannchi & Cristiano", "Sertanejo", "domingoB"],
    ["vespera", "Dom 11/10 · véspera de feriado", "Biannchi & Cristiano", "Sertanejo", "vespera"] ] },
  { id: "s3", titulo: "16 e 17/10", id_: "A", nota: "Domingo 18 sem atração.", agenda: ["s3", "V3 · Repetição", "ter 13/10"], noites: [
    ["sexta3", "Sex 16/10", "Hilana", "Sertanejo", "sextaA"],
    ["sabado3", "Sáb 17/10", "Pagode 44", "Pagode", "sabadoA"] ] },
  { id: "s4", titulo: "23 e 24/10", id_: "B", nota: "Domingo 25 sem atração.", agenda: ["s4", "V1 · Lineup", "ter 20/10"], noites: [
    ["sexta4", "Sex 23/10", "Juntou Deu Samba", "Pagode", "sextaB"],
    ["sabado4", "Sáb 24/10", "Juninho Cari", "Pagode", "sabadoB"] ] },
  { id: "s5", titulo: "30 e 31/10", id_: "A", agenda: ["s5", "V2 · Cartaz", "ter 27/10"], noites: [
    ["sexta5", "Sex 30/10", "Papo 10", "Pagode", "sextaA"],
    ["sabado5", "Sáb 31/10", "Deixa Clarear", "Pagode", "sabadoA"] ] },
];

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const img = (n, f) => `<img src="m/${n}.jpg" width="720" height="${f === "st" ? 1280 : 900}" loading="lazy" alt="">`;
const vid = (n, f) => `<video src="m/${n}.mp4" poster="m/${n}-capa.jpg" width="720" height="${f === "st" ? 1280 : 900}" preload="none" muted loop playsinline controls></video>`;
const peca = (rot, det, midia, f) => `<figure class="peca ${f}"><figcaption><b>${rot}</b><span>${det}</span></figcaption>${midia}</figure>`;
const quatro = (k, fv = "8s · com som") => `<div class="pecas">
  ${peca("Feed", "estático", img(`${k}-feed`, "fd"), "fd")}
  ${peca("Feed", fv, vid(`${k}-feed-video`, "fd"), "fd")}
  ${peca("Story", "estático", img(`${k}-story`, "st"), "st")}
  ${peca("Story + vídeo do artista", "10s · com som", vid(`${k}-broll`, "st"), "st")}
</div>`;
const compara = (k) => existsSync(`${DIR}/m/ref-${k}-feed.mp4`) ? `<details><summary>Comparar com a arte atual</summary><div class="pecas comp">
  ${peca("Feed atual", "vídeo", vid(`ref-${k}-feed`, "fd"), "fd")}
  ${peca("Story atual", "estático", img(`ref-${k}-story`, "st"), "st")}
</div></details>` : "";

let semanas = "";
for (const s of SEMANAS) {
  const [ak, aver, adia] = s.agenda;
  semanas += `<section class="semana" id="${s.id}">
<header class="sem-topo"><h2>Semana ${s.titulo}</h2><span class="selo selo-${s.id_}">Identidades ${s.id_}</span>${s.nota ? `<span class="nota">${s.nota}</span>` : ""}</header>
<article class="noite">
  <div class="noite-topo"><h3>Agenda da semana</h3><span class="id">${aver}</span><span class="quando">no ar ${adia}, 17h</span></div>
  <div class="pecas">
    ${peca("Feed", "estático", img(`agenda-${ak}-feed`, "fd"), "fd")}
    ${peca("Feed", "10s · trecho de cada artista", vid(`agenda-${ak}-feed-video`, "fd"), "fd")}
    ${peca("Story", "estático", img(`agenda-${ak}-story`, "st"), "st")}
    ${peca("Story", "10s · com som", vid(`agenda-${ak}-story-video`, "st"), "st")}
  </div>
</article>\n`;
  for (const [k, data, artista, estilo, idk] of s.noites) {
    const [nome, ideia] = ID[idk];
    semanas += `<article class="noite${idk === "vespera" ? " especial" : ""}">
  <div class="noite-topo"><h3>${esc(data)} · ${esc(artista)}</h3><span class="estilo">♪ ${estilo} <small>+ SpotiFunk</small></span><span class="id">${idk === "vespera" ? "ID especial" : `${idk.endsWith("A") ? "A" : "B"}`} · ${nome}</span></div>
  <p class="ideia">${ideia}</p>
  ${quatro(k)}
  ${compara(k)}
</article>\n`;
  }
  semanas += `</section>\n`;
}

const LISTAS = [
  ["sexta", "Sexta", "A · Placa lima gigante “COMENTE / RESPONDA LISTA”.", "B · “LISTA” se forma no painel de embarque e o aviãozinho do direct entrega o link."],
  ["sabado", "Sábado", "A · “LISTA” em acrílico sobre vidro fosco, com as luzes do palco.", "B · “LISTA” é a faixa 1 do disco; o comentário é enviado e o direct chega."],
  ["domingo", "Domingo", "A · A bebida da vez se chama “LISTA” e as regras vêm no canhoto.", "B · “LISTA” acende em néon lima e um celular em néon mostra o direct chegando."],
];
let listas = "";
for (const [k, dia, a, b] of LISTAS) {
  listas += `<article class="noite">
  <div class="noite-topo"><h3>Lista · ${dia}</h3></div>
  <p class="ideia">${a}<br>${b}</p>
  <div class="pecas">
    ${peca("A · Feed", "estático", img(`lista-${k}-a-feed`, "fd"), "fd")}
    ${peca("A · Story", "estático", img(`lista-${k}-a-story`, "st"), "st")}
    ${peca("B · Feed", "vídeo 8s", vid(`lista-${k}-b-feed`, "fd"), "fd")}
    ${peca("B · Story", "vídeo 8s", vid(`lista-${k}-b-story`, "st"), "st")}
  </div>
</article>\n`;
}

const idCard = (k, dia) => `<figure class="idc"><img src="m/${k === "vespera" ? "vespera" : { sextaA: "sexta", sabadoA: "sabado", domingoA: "domingo", sextaB: "sexta2", sabadoB: "sabado2", domingoB: "domingo2" }[k]}-feed.jpg" width="720" height="900" loading="lazy" alt=""><figcaption><span class="dia">${dia}</span><b>${ID[k][0]}</b><span>${ID[k][1]}</span></figcaption></figure>`;

const html = `<title>Identidades do Butiquim</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;700;800&family=Big+Shoulders:wght@800;900&display=swap" rel="stylesheet">
<style>
:root{color-scheme:dark;--bg:#11110e;--card:#1a1a16;--linha:#2d2d27;--txt:#f2f0e6;--mut:#a6a497;--lima:#C8D200;--lima-esc:#232508;--ambar:#e8a33c;
  --disp:"Big Shoulders","Arial Narrow",Impact,sans-serif;--corpo:Archivo,"Helvetica Neue",Arial,sans-serif}
*{box-sizing:border-box}
body{background:var(--bg);color:var(--txt);font-family:var(--corpo);font-size:15px;line-height:1.5;padding-inline:clamp(16px,4vw,44px);padding-block:0 64px}
.w{max-width:1360px;margin-inline:auto}
h1,h2,h3{font-family:var(--disp);font-weight:900;line-height:.92;margin:0;text-wrap:balance;letter-spacing:.005em}
.abre{padding-block:44px 28px;display:grid;gap:18px}
.abre .sobre{font-weight:800;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:var(--lima)}
h1{font-size:clamp(46px,9vw,112px);text-transform:uppercase}
h1 em{font-style:normal;color:var(--lima)}
.lead{max-width:64ch;color:var(--mut);font-size:17px;margin:0}
.lead b{color:var(--txt);font-weight:700}
.fatos{display:flex;flex-wrap:wrap;gap:10px 28px;margin:0;padding:0;list-style:none}
.fatos li{display:flex;align-items:baseline;gap:8px;color:var(--mut);font-weight:700;font-size:13px;letter-spacing:.06em;text-transform:uppercase}
.fatos b{font-family:var(--disp);font-size:44px;color:var(--txt);letter-spacing:0;font-variant-numeric:tabular-nums}
nav{position:sticky;top:env(safe-area-inset-top,0px);z-index:5;background:var(--bg);border-bottom:1px solid var(--linha);padding-block:10px;margin-inline:calc(-1 * clamp(16px,4vw,44px));padding-inline:clamp(16px,4vw,44px);overflow-x:auto;white-space:nowrap}
nav a{display:inline-block;color:var(--txt);text-decoration:none;font-weight:700;font-size:13px;padding:7px 13px;border:1px solid var(--linha);border-radius:999px;margin-right:6px}
nav a:hover,nav a:focus-visible{border-color:var(--lima);outline:none}
.bloco{padding-block:40px 8px;display:grid;gap:18px}
.bloco>h2,.sem-topo h2{font-size:clamp(34px,5vw,54px);text-transform:uppercase}
.bloco>p{margin:0;color:var(--mut);max-width:70ch}
.ids{display:grid;grid-template-columns:repeat(6,1fr);gap:12px}
.idc{margin:0;background:var(--card);border:1px solid var(--linha);border-radius:12px;overflow:hidden;display:flex;flex-direction:column}
.idc img{width:100%;height:auto;display:block;aspect-ratio:4/5;object-fit:cover}
.idc figcaption{padding:12px 14px 14px;display:grid;gap:4px;font-size:13.5px;color:var(--mut)}
.idc figcaption b{font-family:var(--disp);font-size:24px;color:var(--txt);line-height:1}
.idc .dia{font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--lima)}
.tab{overflow-x:auto;border:1px solid var(--linha);border-radius:12px}
table{border-collapse:collapse;width:100%;min-width:620px;font-size:14.5px}
th,td{text-align:left;padding:11px 16px;border-bottom:1px solid var(--linha);vertical-align:top}
tr:last-child td{border-bottom:0}
th{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--mut);font-weight:800;background:var(--card)}
td.h{font-variant-numeric:tabular-nums;font-weight:700;white-space:nowrap}
td.d{font-weight:800;white-space:nowrap}
tr.igual td{color:var(--mut)}
.tag{display:inline-block;font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;padding:2px 8px;border-radius:5px;border:1px solid var(--linha);color:var(--mut);white-space:nowrap}
.tag.novo{background:var(--lima);border-color:var(--lima);color:#141405}
.tag.troca{border-color:var(--ambar);color:var(--ambar)}
.semana{padding-block:44px 0;display:grid;gap:26px}
.sem-topo{display:flex;flex-wrap:wrap;align-items:center;gap:10px 16px;border-top:3px solid var(--lima);padding-top:18px}
.selo{font-weight:800;font-size:12px;letter-spacing:.12em;text-transform:uppercase;padding:5px 11px;border-radius:999px}
.selo-A{background:var(--lima);color:#141405}.selo-B{border:1.5px solid var(--lima);color:var(--lima)}
.nota{color:var(--mut);font-size:14px}
.noite{display:grid;gap:10px;padding-top:16px;border-top:1px solid var(--linha)}
.noite.especial{background:var(--lima-esc);border:1px solid #3c3f0f;border-radius:14px;padding:16px}
.noite-topo{display:flex;flex-wrap:wrap;align-items:baseline;gap:8px 14px}
.noite-topo h3{font-size:clamp(26px,3.4vw,36px);text-transform:uppercase}
.estilo{font-weight:800;font-size:12.5px;letter-spacing:.08em;text-transform:uppercase;background:var(--txt);color:#141410;padding:3px 9px;border-radius:5px}
.estilo small{font-weight:600;letter-spacing:0;text-transform:none;opacity:.7}
.id{font-weight:800;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--lima)}
.quando{color:var(--mut);font-size:13.5px}
.ideia{margin:0;color:var(--mut);max-width:80ch}
.pecas{display:grid;grid-template-columns:1.25fr 1.25fr 1fr 1fr;gap:12px;align-items:start}
.peca{margin:0;background:var(--card);border:1px solid var(--linha);border-radius:12px;padding:8px;display:grid;gap:7px}
.peca figcaption{display:flex;justify-content:space-between;gap:8px;font-size:11.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--mut);padding-inline:2px}
.peca figcaption b{color:var(--txt)}
.peca img,.peca video{width:100%;height:auto;display:block;border-radius:7px;background:#000}
.fd img,.fd video{aspect-ratio:4/5}.st img,.st video{aspect-ratio:9/16}
details{margin-top:4px}
summary{cursor:pointer;color:var(--mut);font-weight:700;font-size:14px;width:max-content;max-width:100%}
summary:hover,summary:focus-visible{color:var(--lima);outline:none}
.pecas.comp{grid-template-columns:1.25fr 1fr;max-width:520px;margin-top:12px}
footer{margin-top:56px;padding-top:20px;border-top:1px solid var(--linha);color:var(--mut);font-size:13.5px;max-width:80ch}
@media (max-width:1100px){.ids{grid-template-columns:repeat(3,1fr)}}
@media (max-width:900px){.pecas{grid-template-columns:1fr 1fr}}
@media (max-width:560px){.ids{grid-template-columns:1fr 1fr}}
@media (max-width:420px){.fatos b{font-size:36px}}
</style>
<div class="w">
<header class="abre">
  <span class="sobre">O Butiquim · outubro de 2026</span>
  <h1>Identidades <em>novas</em></h1>
  <p class="lead">Todas as noites com atração de outubro ganharam artes novas, feitas aqui dentro. São <b>6 identidades</b> (uma dupla por dia da semana, alternando A e B a cada semana), a <b>agenda semanal</b> em 3 versões e <b>artes de lista</b> novas. Tudo já está na fila de publicação do @obutiquim, somando aos posts que já saem hoje.</p>
  <ul class="fatos">
    <li><b>12</b>noites</li>
    <li><b>84</b>peças</li>
    <li><b>52</b>posts a mais no mês</li>
  </ul>
</header>
<nav aria-label="Seções"><a href="#identidades">As 6 identidades</a><a href="#programacao">Onde entra</a><a href="#s1">02–04</a><a href="#s2">09–11</a><a href="#s3">16–17</a><a href="#s4">23–24</a><a href="#s5">30–31</a><a href="#listas">Listas</a></nav>

<section class="bloco" id="identidades">
  <h2>As 6 identidades</h2>
  <p>Cada dia da semana tem duas caras, que se revezam por semana. Toda peça leva a foto oficial do artista, o “O” do logo e o selo do estilo (Pagode ou Sertanejo + SpotiFunk), puxado do cadastro do artista. A véspera de feriado ganhou uma identidade própria.</p>
  <div class="ids">
    ${idCard("sextaA", "Sexta · A")}${idCard("sabadoA", "Sábado · A")}${idCard("domingoA", "Domingo · A")}
    ${idCard("sextaB", "Sexta · B")}${idCard("sabadoB", "Sábado · B")}${idCard("domingoB", "Domingo · B")}
  </div>
</section>

<section class="bloco" id="programacao">
  <h2>Onde entra no Instagram</h2>
  <p>A programação atual continua. As peças novas entram como posts a mais; só a arte de lista de sábado e domingo é trocada pela nova.</p>
  <div class="tab"><table>
    <thead><tr><th>Dia</th><th>Horário</th><th>O que sai</th><th>Formato</th><th></th></tr></thead>
    <tbody>
      <tr class="igual"><td class="d">Segunda</td><td class="h">17h</td><td>Agenda da semana (arte atual)</td><td>Carrossel + stories</td><td><span class="tag">como hoje</span></td></tr>
      <tr><td class="d">Terça</td><td class="h">17h</td><td>Agenda nova + vídeo de cada noite</td><td>Carrossel no feed</td><td><span class="tag novo">novo</span></td></tr>
      <tr><td class="d">Terça</td><td class="h">17h20</td><td>Agenda nova + story de cada noite, marcando o artista</td><td>Stories</td><td><span class="tag novo">novo</span></td></tr>
      <tr><td class="d">Quarta</td><td class="h">20h30</td><td>Lista da sexta aberta (arte fixa)</td><td>Story</td><td><span class="tag novo">novo</span></td></tr>
      <tr><td class="d">Quinta</td><td class="h">20h30</td><td>Lista da sexta (arte animada)</td><td>Story</td><td><span class="tag novo">novo</span></td></tr>
      <tr><td class="d">Sex e sáb</td><td class="h">manhã</td><td>Flyer novo como foto a mais no carrossel do dia</td><td>Carrossel</td><td><span class="tag novo">novo</span></td></tr>
      <tr><td class="d">Sex e sáb</td><td class="h">12h</td><td>Flyer animado da noite, com som do artista</td><td>Reels</td><td><span class="tag novo">novo</span></td></tr>
      <tr><td class="d">Sex e sáb</td><td class="h">16h30</td><td>Lista animada: “Comenta LISTA” e o link chega no direct</td><td>Reels</td><td><span class="tag novo">novo</span></td></tr>
      <tr><td class="d">Sáb e dom</td><td class="h">tarde</td><td>Arte de lista nova no lugar da atual (A ou B, junto com a identidade da semana)</td><td>Carrossel + story</td><td><span class="tag troca">troca</span></td></tr>
    </tbody>
  </table></div>
</section>

${semanas}
<section class="semana" id="listas">
  <header class="sem-topo"><h2>Artes de lista</h2><span class="nota">Sem artista e sem data: servem para qualquer semana. A é estática, B é animada. No feed pedem “COMENTE LISTA”; no story, “RESPONDA LISTA”.</span></header>
  ${listas}
</section>

<footer>Fotos dos artistas: recortes oficiais usados nas artes atuais. Vídeos: artistas no palco do Butiquim ou dos perfis oficiais deles. Datas, atrações e estilos lidos da agenda da planilha em 26/09/2026. Os vídeos tocam sem som; toque no vídeo para ligar o áudio.</footer>
</div>
<script>
(function(){
  var vids=[].slice.call(document.querySelectorAll('video'));
  var calmo=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(calmo||!('IntersectionObserver' in window))return;
  var io=new IntersectionObserver(function(es){es.forEach(function(e){var v=e.target;
    if(e.isIntersecting){if(v.preload==='none')v.preload='auto';var p=v.play();if(p&&p.catch)p.catch(function(){});}
    else if(!v.paused&&v.muted)v.pause();});},{rootMargin:'120px 0px',threshold:.25});
  vids.forEach(function(v){io.observe(v);});
})();
</script>
`;
writeFileSync(`${DIR}/index.html`, html, "utf8");
console.log("index.html:", html.length, "bytes");
