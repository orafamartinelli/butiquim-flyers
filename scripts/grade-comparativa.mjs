// Grade comparativa do @obutiquim (28/09): calendário ANTES (só esteira/designer) × AGORA (com as artes novas) ×
// SÓ AS NOVAS, mais o mapa de repetição. Lê a fila real (butiquim_social_avulso) e reconstrói o "antes" desfazendo
// as trocas (lista de sáb/dom volta a ser a do designer, capa do carrossel volta a ser a arte do dia).
// Uso: node scripts/grade-comparativa.mjs  → out/grade/index.html + out/grade/t/*.jpg (miniaturas)
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { execFileSync } from "child_process";

const cred = JSON.parse(readFileSync("C:/Users/User/Documents/projetos/.credentials/supabase-new-api-keys.json", "utf8"));
const URL = cred.project_url.replace(/\/$/, "");
const H = { apikey: cred.secret_key, Authorization: `Bearer ${cred.secret_key}` };
const PUB = `${URL}/storage/v1/object/public/butiquim-social/`;
const OUT = "out/grade";
mkdirSync(`${OUT}/t`, { recursive: true });

const SEMANAS = [
  { id: "w1", nome: "28/09 a 04/10", ini: "2026-09-28" },
  { id: "w2", nome: "05 a 11/10", ini: "2026-10-05" },
];
const somaDias = (d, n) => { const x = new Date(`${d}T12:00:00Z`); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
const DOW = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

const r = await fetch(`${URL}/rest/v1/butiquim_social_avulso?select=id,campanha,ordem,publicar_em,formato,video_url,itens_urls,status&publicar_em=gte.2026-09-28T03:00:00Z&publicar_em=lt.2026-10-12T03:00:00Z&order=publicar_em.asc`, { headers: H });
if (!r.ok) throw new Error(await r.text());
const rows = (await r.json()).filter((x) => !/cancel|erro/i.test(x.status || ""));

// artista por data (agenda da planilha) e por chave da composição
const agenda = JSON.parse(readFileSync("src/agenda.json", "utf8")).noites;
const artistaData = Object.fromEntries(agenda.map((n) => [n.data, n.nome]));
const CHAVE = { sexta: "2026-10-02", sabado: "2026-10-03", domingo: "2026-10-04", sexta2: "2026-10-09", sabado2: "2026-10-10", domingo2: "2026-10-11",
  sexta3: "2026-10-16", sabado3: "2026-10-17", sexta4: "2026-10-23", sabado4: "2026-10-24", sexta5: "2026-10-30", sabado5: "2026-10-31" };
const artMmdd = (mmdd) => artistaData[`2026-${mmdd.slice(0, 2)}-${mmdd.slice(2)}`] || mmdd;
const DIA_LISTA = { sexta: "sexta", sabado: "sábado", domingo: "domingo" };

const rel = (u) => (u || "").replace(/^.*\/butiquim-social\//, "");
function familia(p) {
  const f = p.split("/").pop();
  let m;
  if (p.startsWith("avulso/claude/")) {
    if ((m = f.match(/^ag-(s\d)-/))) return { k: "n-agenda", nome: "Agenda nova", nova: true };
    if ((m = f.match(/^lista-(sexta|sabado|domingo)-([AB])-/))) return { k: `n-lista-${m[1]}-${m[2]}`, nome: `Lista nova ${m[2]} · ${DIA_LISTA[m[1]]}`, nova: true };
    if ((m = f.match(/^((?:sexta|sabado|domingo)\d?)-(feed|story|broll)/))) {
      const tipo = { feed: f.endsWith(".mp4") ? "flyer animado" : "flyer", story: "story do flyer", broll: "vídeo do artista + flyer" }[m[2]];
      return { k: `n-flyer-${m[1]}`, nome: `Flyer novo · ${artistaData[CHAVE[m[1]]] || m[1]}`, sub: tipo, nova: true };
    }
    return { k: "n-outro", nome: "Arte nova", nova: true };
  }
  if ((m = f.match(/^d(\d{4})-(dia-feed|story)/))) return { k: `d-dia-${m[1]}`, nome: `Arte do dia · ${artMmdd(m[1])}`, sub: m[2] === "story" ? "story" : "feed" };
  if ((m = f.match(/^c(\d{4})-(r|aq)\d/))) return { k: `d-clipe-${m[1]}`, nome: `Clipe · ${artMmdd(m[1])}`, sub: f.replace(/\.mp4$/, "") };
  if ((m = f.match(/^(sex|sab|dom)-lista-/))) return { k: `d-lista-${m[1]}`, nome: `Lista (designer) · ${{ sex: "sexta", sab: "sábado", dom: "domingo" }[m[1]]}` };
  if (/promo|aperol|smirnoff|redlabel/.test(f)) {
    const marca = (f.match(/aperol|smirnoff|redlabel/) || ["promo"])[0];
    return { k: `d-promo-${marca}`, nome: `Promo ${{ aperol: "Aperol", smirnoff: "Smirnoff", redlabel: "Red Label", promo: "" }[marca]} (designer)`.replace("  ", " ") };
  }
  if ((m = f.match(/^ag\d{4}-(s?)(\d{2})/))) return { k: `d-agenda-noite${m[2]}`, nome: `Agenda (designer) · noite ${+m[2]}`, sub: m[1] ? "story" : "dentro do carrossel" };
  if (p.includes("agenda-capas/")) return { k: "d-agenda", nome: "Agenda (designer) · capa" };
  if (p.includes("evergreen/")) return { k: "d-acervo", nome: "Vídeo do artista (acervo)", sub: f.replace(/\.mp4$/, "") };
  if (/^mapa-mesas/.test(f)) return { k: "d-mapa", nome: "Mapa de mesas" };
  if (/^amb-/.test(f)) return { k: "d-ambiente", nome: "Ambiente · drinks" };
  return { k: "d-outro", nome: f };
}

// miniaturas (ffmpeg lê direto da URL pública; vídeo = um quadro do começo, depois da entrada)
const thumbs = {};
function thumb(p) {
  if (!p) return null;
  if (p in thumbs) return thumbs[p];
  const nome = p.replace(/^avulso\//, "").replace(/\//g, "_").replace(/\.(mp4|jpe?g|png)$/i, "") + ".jpg";
  const dst = `${OUT}/t/${nome}`;
  const video = /\.mp4$/i.test(p);
  const tenta = (ss) => execFileSync("ffmpeg", ["-v", "error", "-y", ...(ss ? ["-ss", ss] : []), "-i", PUB + p, "-frames:v", "1", "-vf", "scale=240:-2", "-q:v", "5", dst], { timeout: 90000 });
  if (!existsSync(dst)) {
    try { tenta(video ? (p.includes("/claude/") ? "3.5" : "2") : null); } catch { try { tenta(null); } catch { thumbs[p] = null; return null; } }
  }
  if (!existsSync(dst)) { thumbs[p] = null; return null; }
  thumbs[p] = nome;
  return nome;
}

// ---------- montar os dois cenários ----------
const brt = (iso) => new Date(new Date(iso).getTime() - 3 * 3600e3).toISOString();
const card = (x) => {
  const fam = familia(x.itens[0]);
  return { ...x, fam: fam.k, nome: fam.nome, sub: fam.sub || "", nova: !!fam.nova, th: thumb(x.itens[0]), mini: x.itens.slice(1).map((p) => { const f = familia(p); return { th: thumb(p), nome: f.nome, fam: f.k, nova: !!f.nova }; }) };
};
const antes = [], agora = [];
for (const x of rows) {
  const t = brt(x.publicar_em);
  const data = t.slice(0, 10), hora = t.slice(11, 16);
  const dow = new Date(`${data}T12:00:00Z`).getUTCDay();
  const itens = (x.itens_urls ? JSON.parse(x.itens_urls) : [x.video_url]).map(rel);
  const nossa = /^(agenda-claude|extra-claude)/.test(x.campanha) && !x.campanha.startsWith("extra-claude-fix");
  const fix = x.campanha.startsWith("extra-claude-fix");
  const troca = !nossa && itens.some((p) => p.startsWith("avulso/claude/"));
  const base = { id: x.id, data, hora, formato: x.formato, qtd: 1 };
  agora.push(card({ ...base, itens, origem: nossa ? "nossa" : "esteira", troca, fix }));
  if (nossa) continue;
  // antes: lista nova volta a ser a do designer; peças novas somem; arte do dia volta para a capa
  const pre = dow === 6 ? "sab" : dow === 0 ? "dom" : "sex";
  let it = itens.map((p) => {
    const m = p.match(/^avulso\/claude\/lista-\w+-[AB]-(feed|story)\./);
    return m ? `avulso/${pre}-lista-${m[1]}.jpg` : p;
  }).filter((p) => !p.startsWith("avulso/claude/"));
  if (x.formato === "CAROUSEL" && x.campanha.startsWith("dia-") && x.ordem === 1) {
    const d = it.find((p) => /d\d{4}-dia-feed/.test(p));
    if (d) it = [d, ...it.filter((p) => p !== d)];
  }
  if (it.length) antes.push(card({ ...base, itens: it, origem: "esteira", troca: false, fix }));
}
// segunda 05/10: a agenda do designer só é montada na própria segunda — entra como prevista nos dois cenários
for (const lista of [antes, agora]) {
  lista.push({ data: "2026-10-05", hora: "17:00", formato: "CAROUSEL", qtd: 1, itens: [], origem: "esteira", prevista: true, fam: "d-agenda", nome: "Agenda (designer)", sub: "montada na própria segunda", th: null, mini: [] });
  lista.push({ data: "2026-10-05", hora: "17:20", formato: "STORIES", qtd: 4, itens: [], origem: "esteira", prevista: true, fam: "d-agenda", nome: "Agenda (designer) · 4 stories", sub: "montados na própria segunda", th: null, mini: [] });
}

const dados = { geradoEm: new Date().toISOString(), semanas: SEMANAS.map((s) => ({ ...s, dias: [...Array(7)].map((_, i) => { const d = somaDias(s.ini, i); return { data: d, rot: `${DOW[new Date(`${d}T12:00:00Z`).getUTCDay()]} ${d.slice(8)}/${d.slice(5, 7)}`, artista: artistaData[d] || null }; }) })),
  antes: antes.sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora)), agora: agora.sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora)) };
writeFileSync(`${OUT}/dados.json`, JSON.stringify(dados, null, 1));
const tpl = readFileSync("scripts/grade-comparativa.html", "utf8");
writeFileSync(`${OUT}/index.html`, tpl.replace("/*DADOS*/null", JSON.stringify(dados)), "utf8");
console.log(`antes ${antes.length} · agora ${agora.length} · miniaturas ${Object.values(thumbs).filter(Boolean).length} (sem prévia: ${Object.entries(thumbs).filter(([, v]) => !v).map(([k]) => k).join(", ") || "nenhuma"})`);
