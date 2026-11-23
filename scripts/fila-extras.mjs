// Soma as peças novas na fila do @obutiquim (butiquim_social_avulso) SEM tirar nada da esteira — decisão do Rafa 26/09:
//  1) SÁB e DOM: a arte de LISTA do designer sai; entram as nossas, alternando A/B por semana junto com a ID do flyer
//     (linhas já montadas: troca direto; próximas: config fila_semana[dow].listas, lida pelo montador)
//  2) SEX e SÁB: Reels 12h (flyer animado da noite) + Reels 16h30 (lista animada "COMENTE LISTA") + nosso feed
//     estático como slide extra no carrossel da manhã (linhas já montadas: troca; próximas: config carrossel_extra_<data>)
//  3) QUA e QUI 20h30: story da lista da sexta (qua = A estática, qui = B animada)
//  4) Correção: story da manhã de 03/10 (arte do designer) que ficou fora da fila
// Uso: node scripts/fila-extras.mjs (simula) · node scripts/fila-extras.mjs --gravar
import { readFileSync, writeFileSync, existsSync } from "fs";
import { execFileSync } from "child_process";

const GRAVAR = process.argv.includes("--gravar");
const cred = JSON.parse(readFileSync("C:/Users/User/Documents/projetos/.credentials/supabase-new-api-keys.json", "utf8"));
const URL = cred.project_url.replace(/\/$/, "");
const H = { apikey: cred.secret_key, Authorization: `Bearer ${cred.secret_key}` };
const PUB = `${URL}/storage/v1/object/public/butiquim-social/`;
const log = (...a) => console.log(...a);

const rest = async (path, opts = {}) => {
  const r = await fetch(`${URL}/rest/v1/${path}`, { ...opts, headers: { ...H, "Content-Type": "application/json", Prefer: "return=representation", ...(opts.headers || {}) } });
  if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  { const t = await r.text(); return t ? JSON.parse(t) : null; }
};
const jpg = (png) => {
  const j = png.replace(/\.png$/i, ".jpg");
  if (!existsSync(j)) execFileSync("ffmpeg", ["-v", "error", "-y", "-i", png, "-q:v", "2", j]);
  return j;
};
const sobe = async (local, destino) => {
  const tipo = destino.endsWith(".mp4") ? "video/mp4" : "image/jpeg";
  if (GRAVAR) {
    const r = await fetch(`${URL}/storage/v1/object/butiquim-social/${destino}`, { method: "POST", headers: { ...H, "Content-Type": tipo, "x-upsert": "true" }, body: readFileSync(local) });
    if (!r.ok) throw new Error(`upload ${destino}: ${r.status} ${await r.text()}`);
  }
  return destino; // caminho relativo ao bucket (formato do config)
};
const q = (d, hhmm) => `${d}T${hhmm}:00-03:00`;

// ---------- arquivos ----------
const L = {};
for (const dia of ["sexta", "sabado", "domingo"]) {
  L[dia] = {
    A: { feed: await sobe(jpg(`out/lista-${dia}/lista-${dia}-A-FEED.png`), `avulso/claude/lista-${dia}-A-feed.jpg`), story: await sobe(jpg(`out/lista-${dia}/lista-${dia}-A-STORY.png`), `avulso/claude/lista-${dia}-A-story.jpg`) },
    B: { feed: await sobe(`out/lista-${dia}/lista-${dia}-B-FEED.mp4`, `avulso/claude/lista-${dia}-B-feed.mp4`), story: await sobe(`out/lista-${dia}/lista-${dia}-B-STORY.mp4`, `avulso/claude/lista-${dia}-B-story.mp4`) },
  };
}
// noites sex/sáb de outubro: chave da composição e a identidade da semana (A/B) — mesma paridade do montador (semana do ano)
const NOITES = [
  ["2026-10-02", "sexta", "A"], ["2026-10-03", "sabado", "A"],
  ["2026-10-09", "sexta2", "B"], ["2026-10-10", "sabado2", "B"],
  ["2026-10-16", "sexta3", "A"], ["2026-10-17", "sabado3", "A"],
  ["2026-10-23", "sexta4", "B"], ["2026-10-24", "sabado4", "B"],
  ["2026-10-30", "sexta5", "A"], ["2026-10-31", "sabado5", "A"],
];
const DOMINGOS = [["2026-10-04", "A"], ["2026-10-11", "B"]]; // 18 e 25 sem atração
const feedJpg = {};
for (const [d, k] of NOITES) feedJpg[d] = await sobe(jpg(`out/final/${k}-FEED.png`), `avulso/claude/${k}-feed.jpg`);

// ---------- 1) config: rodízio das listas (sáb/dom) + slide extra por data ----------
const cfgRows = await rest("butiquim_social_config?select=chave,valor&chave=eq.fila_semana");
const fsem = JSON.parse(cfgRows[0].valor);
writeFileSync(`out/fila_semana-backup-${Date.now()}.json`, JSON.stringify(fsem, null, 2));
// índice = semana do ano % 2 → par = B, ímpar = A (03/10 = semana 39 = A)
fsem["6"].listas = [L.sabado.B, L.sabado.A];
fsem["0"].listas = [L.domingo.B, L.domingo.A];
log("config fila_semana: listas de sáb/dom em rodízio [B, A]");
if (GRAVAR) await rest("butiquim_social_config?chave=eq.fila_semana", { method: "PATCH", body: JSON.stringify({ valor: JSON.stringify(fsem) }) });
const hoje = new Date().toISOString().slice(0, 10);
for (const [d] of NOITES) {
  const chave = `carrossel_extra_${d}`;
  log(`config ${chave} = ${feedJpg[d]}`);
  if (GRAVAR) await rest("butiquim_social_config?on_conflict=chave", { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=representation" }, body: JSON.stringify({ chave, valor: feedJpg[d] }) });
}

// ---------- linhas já montadas pela esteira ----------
const fila = await rest(`butiquim_social_avulso?select=id,campanha,ordem,formato,video_url,itens_urls,status&campanha=like.dia-2026-10-*&status=eq.pendente`);
const trocaLista = (txt, dow, v) => {
  if (!txt) return txt;
  const pre = dow === 6 ? "sab" : "dom";
  const dia = dow === 6 ? "sabado" : "domingo";
  return txt.replaceAll(`avulso/${pre}-lista-feed.jpg`, L[dia][v].feed).replaceAll(`avulso/${pre}-lista-story.jpg`, L[dia][v].story);
};
const variante = Object.fromEntries([...NOITES.map(([d, , v]) => [d, v]), ...DOMINGOS]);
for (const r of fila) {
  const d = r.campanha.slice(4);
  const dow = new Date(`${d}T12:00:00Z`).getUTCDay();
  const patch = {};
  if ((dow === 6 || dow === 0) && variante[d]) {
    const vu = trocaLista(r.video_url, dow, variante[d]);
    const it = trocaLista(r.itens_urls, dow, variante[d]);
    if (vu !== r.video_url) patch.video_url = vu;
    if (it !== r.itens_urls) patch.itens_urls = it;
  }
  if ((dow === 5 || dow === 6) && r.formato === "CAROUSEL" && r.ordem === 1 && feedJpg[d]) {
    const itens = JSON.parse(patch.itens_urls || r.itens_urls || "[]");
    const extra = PUB + feedJpg[d];
    if (!itens.includes(extra)) patch.itens_urls = JSON.stringify([...itens, extra]);
  }
  if (Object.keys(patch).length) {
    log(`troca #${r.id} ${r.campanha} ${r.formato}#${r.ordem}: ${Object.keys(patch).join(", ")}`);
    if (GRAVAR) await rest(`butiquim_social_avulso?id=eq.${r.id}`, { method: "PATCH", body: JSON.stringify({ ...patch, atualizado_em: new Date().toISOString() }) });
  }
}

// ---------- 2) e 3) posts novos ----------
const agenda = JSON.parse(readFileSync("src/agenda.json", "utf8")).noites;
const artistas = await rest("butiquim_social_artistas?select=slug,instagram,estilo");
const existentes = new Set((await rest("butiquim_social_avulso?select=campanha&campanha=like.extra-claude-*")).map((r) => r.campanha));
const novos = [];
for (const [d, k] of NOITES) {
  const a = agenda.find((x) => x.data === d);
  const art = artistas.find((x) => x.slug === a.slug) || {};
  const nome = a.nome.toUpperCase() + (art.instagram ? ` (@${art.instagram})` : "");
  const est = art.estilo === "PAGODE" ? "Pagode" : "Sertanejo";
  const dow = new Date(`${d}T12:00:00Z`).getUTCDay();
  const noite = dow === 5 ? "Sexta do Butica" : "Sabadá do Butica";
  const camp = `extra-claude-${d}`;
  if (existentes.has(camp)) { log(`pula ${camp} (já na fila)`); continue; }
  novos.push({ campanha: camp, ordem: 1, publicar_em: q(d, "12:00"), formato: "REELS", video_url: PUB + `avulso/claude/${k}-feed.mp4`, thumb_offset_seg: 6, perfil: "obutiquim",
    legenda: `🎤 HOJE tem ${nome} no palco d'O Butiquim!\n\n${est} + SpotiFunk a noite toda. 🍻\n\n📲 Nome na lista: link na bio ou chama no direct.\n📍 casa abre às 23h · #NãoTemErro · Te vejo na esquina!` });
  const lst = dow === 5 ? "sexta" : "sabado";
  novos.push({ campanha: camp, ordem: 2, publicar_em: q(d, "16:30"), formato: "REELS", video_url: PUB + L[lst].B.feed, thumb_offset_seg: 6, perfil: "obutiquim",
    legenda: `💬 Comenta LISTA aqui embaixo que a gente te manda o link da lista no direct! 📲\n\n${noite}: lista feminina FREE e masculina R$ 20 até 00h. Depois da 1ª hora, desconto na portaria pra quem está na lista.\n\n📍 casa abre às 23h · #NãoTemErro · Te vejo na esquina!` });
}
// quarta e quinta antes de cada sexta
for (const [d] of NOITES.filter(([, k]) => k.startsWith("sexta"))) {
  const sexta = new Date(`${d}T12:00:00Z`);
  for (const [menos, v] of [[2, "A"], [1, "B"]]) {
    const x = new Date(sexta); x.setUTCDate(x.getUTCDate() - menos);
    const dx = x.toISOString().slice(0, 10);
    const camp = `extra-claude-${dx}`;
    if (existentes.has(camp)) { log(`pula ${camp} (já na fila)`); continue; }
    novos.push({ campanha: camp, ordem: 1, publicar_em: q(dx, "20:30"), formato: "STORIES", video_url: PUB + L.sexta[v].story, legenda: "", perfil: "obutiquim" });
  }
}
// 4) correção 03/10: story da arte do dia (designer) — o arquivo já está no bucket, só a linha não entrou
if (!existentes.has("extra-claude-fix-2026-10-03")) {
  novos.push({ campanha: "extra-claude-fix-2026-10-03", ordem: 1, publicar_em: q("2026-10-03", "11:05"), formato: "STORIES", video_url: PUB + "avulso/d1003-story.jpg", legenda: "", marcados: "souvibeoficial", perfil: "obutiquim" });
}
for (const n of novos) log(`novo ${n.publicar_em.slice(0, 16).replace("T", " ")} ${n.formato.padEnd(7)} ${n.video_url.split("/").pop()} (${n.campanha})`);
// o PostgREST exige as mesmas chaves em todas as linhas de um insert em lote
const CHAVES = ["campanha", "ordem", "publicar_em", "formato", "video_url", "legenda", "perfil", "thumb_offset_seg", "marcados"];
const lote = novos.map((n) => Object.fromEntries(CHAVES.map((k) => [k, n[k] ?? null])));
if (GRAVAR && lote.length) await rest("butiquim_social_avulso", { method: "POST", body: JSON.stringify(lote) });
log(GRAVAR ? `\nGRAVADO: ${novos.length} posts novos.` : `\n(simulação: ${novos.length} posts novos — rode com --gravar)`);
