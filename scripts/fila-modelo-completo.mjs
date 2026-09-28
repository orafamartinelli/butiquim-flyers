// Modelo completo de outubro — decisões do Rafa em 28/09, ponto a ponto. Soma posts, não tira nada da esteira:
//  TER: Reels 12h com o vídeo da agenda (além do carrossel 17h + stories 17h20)
//  QUA: story 12h com vídeo do artista + flyer (B-roll) do artista de sexta
//  QUI: story 17h com o flyer de sexta ("é amanhã")
//  SEX/SÁB/DOM com atração:
//    - nosso flyer vira a CAPA do carrossel da manhã (arte do designer vai para o fim) — linhas já montadas: troca;
//      próximas: config carrossel_capa_<data>, lida pelo montador
//    - story 13h30 (nosso flyer) · story 16h (B-roll) · story 18h30 (lista) · carrossel 21h30 (lista, última chamada)
//    - DOMINGO ganha também Reels 12h (flyer animado) e Reels 16h30 ("Comenta LISTA"), que sex/sáb já têm
//  Lista no 18h30/21h30 de sáb/dom = a variante que NÃO saiu às 17h30 daquela semana (evita repetir a mesma arte).
// Uso: node scripts/fila-modelo-completo.mjs (simula) · node scripts/fila-modelo-completo.mjs --gravar
import { readFileSync, existsSync } from "fs";
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
  return r.status === 204 ? null : r.json();
};
const sobe = async (local, destino) => {
  const tipo = destino.endsWith(".mp4") ? "video/mp4" : "image/jpeg";
  if (GRAVAR) {
    const r = await fetch(`${URL}/storage/v1/object/butiquim-social/${destino}`, { method: "POST", headers: { ...H, "Content-Type": tipo, "x-upsert": "true" }, body: readFileSync(local) });
    if (!r.ok) throw new Error(`upload ${destino}: ${r.status} ${await r.text()}`);
  }
  return destino;
};
const q = (d, hhmm) => `${d}T${hhmm}:00-03:00`;
const somaDias = (d, n) => { const x = new Date(`${d}T12:00:00Z`); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
const jpgDe = (png) => {
  const j = png.replace(/\.png$/i, ".jpg");
  if (!existsSync(j)) execFileSync("ffmpeg", ["-v", "error", "-y", "-i", png, "-q:v", "2", j]);
  return j;
};

// noites com atração em outubro: data, chave da composição, identidade da semana (A/B)
const NOITES = [
  ["2026-10-02", "sexta", "A"], ["2026-10-03", "sabado", "A"], ["2026-10-04", "domingo", "A"],
  ["2026-10-09", "sexta2", "B"], ["2026-10-10", "sabado2", "B"], ["2026-10-11", "domingo2", "B"],
  ["2026-10-16", "sexta3", "A"], ["2026-10-17", "sabado3", "A"],
  ["2026-10-23", "sexta4", "B"], ["2026-10-24", "sabado4", "B"],
  ["2026-10-30", "sexta5", "A"], ["2026-10-31", "sabado5", "A"],
];
const TERCAS = [["2026-09-29", "s1"], ["2026-10-06", "s2"], ["2026-10-13", "s3"], ["2026-10-20", "s4"], ["2026-10-27", "s5"]];
const REGRA = {
  5: { dia: "sexta", noite: "Sexta do Butica", ate: "00h", abre: "23h" },
  6: { dia: "sabado", noite: "Sabadá do Butica", ate: "00h", abre: "23h" },
  0: { dia: "domingo", noite: "Saideira da Semana", ate: "23h", abre: "22h" },
};
const rodape = (r) => `📍 casa abre às ${r.abre} · #NãoTemErro · Te vejo na esquina!`;
const regrasLista = (r) => `${r.noite}: lista feminina FREE e masculina R$ 20 até ${r.ate}. Depois da 1ª hora, desconto na portaria pra quem está na lista.`;

// ---------- arquivos (upsert no bucket) ----------
const F = {};
for (const [, k] of NOITES) {
  F[k] = {
    feedJpg: await sobe(jpgDe(`out/final/${k}-FEED.png`), `avulso/claude/${k}-feed.jpg`),
    feedMp4: await sobe(`out/final/${k}-FEED.mp4`, `avulso/claude/${k}-feed.mp4`),
    storyJpg: await sobe(jpgDe(`out/final/${k}-STORY.png`), `avulso/claude/${k}-story.jpg`),
    broll: await sobe(`out/final/${k}-STORY-BROLL.mp4`, `avulso/claude/${k}-broll.mp4`),
  };
}
const L = {};
for (const dia of ["sexta", "sabado", "domingo"]) {
  L[dia] = {
    A: { feed: `avulso/claude/lista-${dia}-A-feed.jpg`, story: `avulso/claude/lista-${dia}-A-story.jpg` },
    B: { feed: `avulso/claude/lista-${dia}-B-feed.mp4`, story: `avulso/claude/lista-${dia}-B-story.mp4` },
  };
}

// ---------- 1) capa do carrossel da manhã ----------
for (const [d, k] of NOITES) {
  const chave = `carrossel_capa_${d}`;
  log(`config ${chave} = ${F[k].feedJpg}`);
  if (GRAVAR) await rest("butiquim_social_config?on_conflict=chave", { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=representation" }, body: JSON.stringify({ chave, valor: F[k].feedJpg }) });
}
const manha = await rest(`butiquim_social_avulso?select=id,campanha,itens_urls,video_url&campanha=like.dia-2026-10-*&formato=eq.CAROUSEL&ordem=eq.1&status=eq.pendente`);
const porData = Object.fromEntries(NOITES.map(([d, k]) => [d, k]));
for (const r of manha) {
  const d = r.campanha.slice(4);
  if (!porData[d]) continue;
  const nosso = PUB + F[porData[d]].feedJpg;
  const itens = JSON.parse(r.itens_urls || "[]");
  if (itens[0] === nosso) { log(`capa ok #${r.id} ${d}`); continue; }
  const designer = itens[0];
  const novo = [nosso, ...itens.filter((x) => x !== nosso && x !== designer), designer];
  log(`capa #${r.id} ${d}: ${novo.map((x) => x.split("/").pop()).join(" | ")}`);
  if (GRAVAR) await rest(`butiquim_social_avulso?id=eq.${r.id}`, { method: "PATCH", body: JSON.stringify({ itens_urls: JSON.stringify(novo), video_url: nosso, atualizado_em: new Date().toISOString() }) });
}

// ---------- 2) posts novos ----------
const agenda = JSON.parse(readFileSync("src/agenda.json", "utf8")).noites;
const artistas = await rest("butiquim_social_artistas?select=slug,instagram,estilo");
const existentes = new Set((await rest("butiquim_social_avulso?select=campanha&campanha=like.extra-claude-mais-*")).map((r) => r.campanha));
const legAgenda = Object.fromEntries((await rest("butiquim_social_avulso?select=campanha,legenda&campanha=like.agenda-claude-feed-*")).map((r) => [r.campanha.slice(-10), r.legenda]));
const novos = [];
const add = (camp, lista) => { if (existentes.has(camp)) { log(`pula ${camp} (já na fila)`); return; } lista.forEach((p, i) => novos.push({ campanha: camp, ordem: i + 1, perfil: "obutiquim", legenda: "", ...p })); };
const info = (d) => {
  const a = agenda.find((x) => x.data === d);
  const art = artistas.find((x) => x.slug === a.slug) || {};
  return { nome: a.nome.toUpperCase() + (art.instagram ? ` (@${art.instagram})` : ""), ig: art.instagram || null, est: art.estilo === "PAGODE" ? "Pagode" : "Sertanejo" };
};

for (const [ter, s] of TERCAS) {
  add(`extra-claude-mais-${ter}`, [{ publicar_em: q(ter, "12:00"), formato: "REELS", video_url: PUB + `avulso/claude/ag-${s}-feed.mp4`, thumb_offset_seg: 4, legenda: legAgenda[ter] || "🗓️ A semana na esquina! Te vejo na esquina!" }]);
}
for (const [d, k, v] of NOITES) {
  const dow = new Date(`${d}T12:00:00Z`).getUTCDay();
  const r = REGRA[dow];
  const { nome, ig, est } = info(d);
  const posts = [];
  if (dow === 5) { // quarta e quinta antes da sexta
    add(`extra-claude-mais-${somaDias(d, -2)}`, [{ publicar_em: q(somaDias(d, -2), "12:00"), formato: "STORIES", video_url: PUB + F[k].broll, marcados: ig }]);
    add(`extra-claude-mais-${somaDias(d, -1)}`, [{ publicar_em: q(somaDias(d, -1), "17:00"), formato: "STORIES", video_url: PUB + F[k].storyJpg, marcados: ig }]);
  }
  if (dow === 0) { // domingo ganha os 2 Reels que sex/sáb já têm
    posts.push({ publicar_em: q(d, "12:00"), formato: "REELS", video_url: PUB + F[k].feedMp4, thumb_offset_seg: 3,
      legenda: `🎤 HOJE tem ${nome} no palco d'O Butiquim!\n\n${est} + SpotiFunk a noite toda. 🍻\n\n📲 Nome na lista: link na bio ou chama no direct.\n${rodape(r)}` });
    posts.push({ publicar_em: q(d, "16:30"), formato: "REELS", video_url: PUB + L.domingo.B.feed, thumb_offset_seg: 3,
      legenda: `💬 Comenta LISTA aqui embaixo que a gente te manda o link da lista no direct! 📲\n\n${regrasLista(r)}\n\n${rodape(r)}` });
  }
  // lista das 18h30/21h30: sexta = B no story e A no feed; sáb/dom = a variante que não saiu às 17h30 da semana
  const outra = dow === 5 ? null : (v === "A" ? "B" : "A");
  const vStory = dow === 5 ? "B" : outra;
  const vFeed = dow === 5 ? "A" : outra;
  posts.push({ publicar_em: q(d, "13:30"), formato: "STORIES", video_url: PUB + F[k].storyJpg, marcados: ig });
  posts.push({ publicar_em: q(d, "16:00"), formato: "STORIES", video_url: PUB + F[k].broll, marcados: ig });
  posts.push({ publicar_em: q(d, "18:30"), formato: "STORIES", video_url: PUB + L[r.dia][vStory].story });
  posts.push({ publicar_em: q(d, "21:30"), formato: "CAROUSEL", video_url: PUB + L[r.dia][vFeed].feed, itens_urls: JSON.stringify([PUB + L[r.dia][vFeed].feed, PUB + F[k].feedJpg]),
    legenda: `⏰ Última chamada pra lista de hoje!\n\n💬 Comenta LISTA aqui embaixo que a gente te manda o link no direct 📲\n\n${nome} no palco. ${regrasLista(r)}\n\n${rodape(r)}` });
  add(`extra-claude-mais-${d}`, posts);
}

novos.sort((a, b) => a.publicar_em.localeCompare(b.publicar_em));
for (const n of novos) log(`novo ${n.publicar_em.slice(0, 16).replace("T", " ")} ${n.formato.padEnd(8)} ${n.video_url.split("/").pop()}${n.marcados ? " @" + n.marcados : ""}`);
// o PostgREST exige as mesmas chaves em todas as linhas de um insert em lote
const CHAVES = ["campanha", "ordem", "publicar_em", "formato", "video_url", "itens_urls", "legenda", "perfil", "thumb_offset_seg", "marcados"];
const lote = novos.map((n) => Object.fromEntries(CHAVES.map((c) => [c, n[c] ?? null])));
if (GRAVAR && lote.length) await rest("butiquim_social_avulso", { method: "POST", body: JSON.stringify(lote) });
log(GRAVAR ? `\nGRAVADO: ${novos.length} posts novos.` : `\n(simulação: ${novos.length} posts novos — rode com --gravar)`);
