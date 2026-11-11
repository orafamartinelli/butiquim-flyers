// Fila de um MÊS (modelo completo de novembro, generalizado em 22/10/2026): noites, agendas e identidade vêm de scripts/_rotacao.mjs
// (rotação A/B/C/D por semana; agenda só com semana completa; fim de semana que vira o mês = uma semana).
// Por noite de show (sex/sáb/dom com atração na planilha):
//   capa do carrossel da manhã = nosso flyer (config carrossel_capa_<data>, lida pelo montador)
//   12:00 Reels flyer animado · 13:30 story flyer · 16:00 story vídeo do artista · 16:30 Reels "Comenta LISTA"
//   18:30 story lista · 21:30 carrossel última chamada (lista + flyer)
//   véspera de feriado: 12:00/13:30/16:00 usam a Folhinha (o flyer normal fica na capa e na última chamada)
// Antes da sexta: QUA 12:00 vídeo do artista + 20:30 lista A · QUI 17:00 flyer + 20:30 lista B
// Agenda (terça): 12:00 Reels da agenda · 17:00 carrossel [agenda + feed de cada noite] · 17:20 story agenda + 1 story por noite
// Todo post já nasce com datas_show (cancelar noite). Idempotente por campanha.
// Uso: node scripts/fila-mes.mjs --mes 2026-12 (simula) · node scripts/fila-mes.mjs --mes 2026-12 --gravar
//
// MODO REFAZER (30/10/2026 — atração trocou na planilha; quem chama é scripts/refaz-noites.mjs na nuvem):
//   node scripts/fila-mes.mjs --mes 2026-11 --refazer 2026-11-06,2026-11-07 --versao r3010a [--gravar]
//   • sobe SÓ as peças das noites trocadas (e as agendas das semanas delas) com nome versionado
//     (<chave>-feed-<versao>.jpg) — nome novo = o Instagram nunca pega a versão velha do cache;
//   • gera os posts como sempre, mas fica só com os que mostram as datas trocadas (datas_show) e
//     REAPROVEITA a linha que o leitor da agenda cancelou ("retirado ...: atração trocou") — mesma
//     campanha + ordem → volta a 'pendente' com arquivo/legenda/@ novos. Post com horário vencido fica de fora.
// MODO NOITES (04/11/2026 — noite nova na planilha): --noites 2026-11-19,2026-11-20 sobe e agenda SÓ essas noites e as agendas das semanas delas;
//   post com horário vencido fica de fora; as outras noites não são reenviadas.
// QUINTA de véspera (Rafa 04/11/2026): dia de abertura como os outros, sempre com a Folhinha e sem vídeo do artista.
//   Na quarta: 17:00 story flyer + 20:30 story lista. Com a quinta aberta, as listas da sexta de qua/qui saem (a lista da vez é a da quinta).
import { readFileSync, existsSync } from "fs";
import { execFileSync } from "child_process";
import { ARTISTAS_SEM_VIDEO, MESES, noitesDoMes } from "./_rotacao.mjs";
import { credSupabase, FFMPEG } from "./_cred.mjs";

const GRAVAR = process.argv.includes("--gravar");
const arg = (n) => (process.argv.includes(n) ? process.argv[process.argv.indexOf(n) + 1] : null);
const MES = arg("--mes");
if (!/^\d{4}-\d{2}$/.test(MES || "")) throw new Error("informe --mes YYYY-MM");
const REFAZER = (arg("--refazer") || "").split(",").filter(Boolean);
const VERSAO = arg("--versao") || "";
const SO_NOITES = (arg("--noites") || "").split(",").filter(Boolean);
// MODO AGENDAS (11/11/2026): --agendas s7,s9 sobe e agenda SÓ a agenda dessas semanas (as peças das noites já estão no bucket).
// Se a terça já passou (semana que fechou atrasada), a agenda sai NA HORA: carrossel em ~10 min, stories 20 min depois,
// Reels da agenda 3h depois; a versão de segunda (sem designer) que venceu fica de fora.
const SO_AGENDAS = (arg("--agendas") || "").split(",").filter(Boolean);
const ALVOS = REFAZER.length ? REFAZER : SO_AGENDAS.length ? ["__nenhuma__"] : SO_NOITES;
if (REFAZER.length && !/^[a-z0-9]+$/.test(VERSAO)) throw new Error("modo --refazer exige --versao (letras/números)");
const ABREV = MESES[+MES.slice(5) - 1];
const cred = credSupabase();
const URL = cred.project_url.replace(/\/$/, "");
const H = { apikey: cred.secret_key, Authorization: `Bearer ${cred.secret_key}` };
const PUB = `${URL}/storage/v1/object/public/butiquim-social/`;
const FF = FFMPEG;
const comVersao = (destino) => (VERSAO ? destino.replace(/(\.[a-z0-9]+)$/, `-${VERSAO}$1`) : destino);
const log = (...a) => console.log(...a);
const rest = async (path, opts = {}) => {
  const r = await fetch(`${URL}/rest/v1/${path}`, { ...opts, headers: { ...H, "Content-Type": "application/json", Prefer: "return=representation", ...(opts.headers || {}) } });
  if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  return r.status === 204 ? null : r.json();
};
const jpg = (png) => { const j = png.replace(/\.png$/i, ".jpg"); execFileSync(FF, ["-v", "error", "-y", "-i", png, "-q:v", "2", j]); return j; };
const sobe = async (local, destino) => {
  if (!existsSync(local)) throw new Error(`falta ${local} (render terminou?)`);
  if (GRAVAR) {
    const r = await fetch(`${URL}/storage/v1/object/butiquim-social/${destino}`, { method: "POST", headers: { ...H, "Content-Type": destino.endsWith(".mp4") ? "video/mp4" : "image/jpeg", "x-upsert": "true" }, body: readFileSync(local) });
    if (!r.ok) throw new Error(`upload ${destino}: ${r.status} ${await r.text()}`);
  }
  return PUB + destino;
};
const q = (d, hhmm) => `${d}T${hhmm}:00-03:00`;
const soma = (d, n) => { const x = new Date(`${d}T12:00:00Z`); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };

// noites: data, chave, identidade (rotação), véspera (Folhinha) — e agendas das semanas completas
const R = noitesDoMes(MES);
const NOITES = R.noites.map((n) => [n.data, n.key, n.id, n.vespera || undefined]);
const AGENDAS = R.agendas.filter((a) => !SO_AGENDAS.length || SO_AGENDAS.includes(a.s)).map((a) => [a.terca, a.s, a.keys, a.seg]);
for (const s of SO_AGENDAS) if (!AGENDAS.some((a) => a[1] === s)) throw new Error(`agenda ${s} não está liberada (semana incompleta antes do prazo, ou com menos de 2 noites)`);
for (const a of R.agendas.filter((a) => a.incompleta)) log(`⚠️ semana ${a.semana} incompleta (${a.datas.join(", ")}) — prazo vencido, a agenda sai com o que tem`);
for (const i of R.incompletas) log(`⚠️ semana ${i.semana} incompleta (tem: ${i.tem.join(", ")}) — agenda de terça espera a planilha até ${i.prazo}`);
log(`mês ${MES}: ${NOITES.length} noites (${NOITES.map(([d, k, v]) => `${d.slice(8)} ${k}=${v}`).join(", ")}) · agendas: ${AGENDAS.map((a) => a[1]).join(", ") || "nenhuma"}`);
const dataDe = Object.fromEntries(NOITES.map(([d, k]) => [k, d]));
const REGRA = { 4: { dia: "quinta", noite: "Butiquinta", ate: "00h", abre: "23h", nome: "Quinta" }, 5: { dia: "sexta", noite: "Sexta do Butica", ate: "00h", abre: "23h", nome: "Sexta" }, 6: { dia: "sabado", noite: "Sabadá do Butica", ate: "00h", abre: "23h", nome: "Sábado" }, 0: { dia: "domingo", noite: "Saideira da Semana", ate: "23h", abre: "22h", nome: "Domingo" } };
const rodape = (r) => `📍 casa abre às ${r.abre} · #NãoTemErro · Te vejo na esquina!`;
const regrasLista = (r) => `${r.noite}: lista feminina FREE e masculina R$ 20 até ${r.ate}. Depois da 1ª hora, desconto na portaria pra quem está na lista.`;
const LISTA = (dia, v, fmt) => PUB + `avulso/claude/lista-${dia}-${v}-${fmt}.${v === "A" ? "jpg" : "mp4"}`;

const agenda = JSON.parse(readFileSync("src/agenda.json", "utf8")).noites;
const artistas = await rest("butiquim_social_artistas?select=slug,instagram,estilo");
const info = (d) => {
  const a = agenda.find((x) => x.data === d);
  if (!a) throw new Error(`sem atração em ${d} no agenda.json`);
  const art = artistas.find((x) => x.slug === a.slug) || {};
  return { nome: a.nome.toUpperCase(), ig: art.instagram || null, est: art.estilo === "PAGODE" ? "Pagode" : "Sertanejo" };
};

// ---------- arquivos ----------
const F = {};
// modo refazer: noite NÃO trocada aponta pro arquivo que já está no bucket (sem render, sem upload)
const refazNoite = (d) => !ALVOS.length || ALVOS.includes(d);
const ehQuinta = (d) => new Date(`${d}T12:00:00Z`).getUTCDay() === 4;
const semVideo = (d) => ehQuinta(d) || ARTISTAS_SEM_VIDEO.has(agenda.find((x) => x.data === d)?.slug);
const sobeOuJa = (local, destino, d) => (refazNoite(d) ? sobe(local, comVersao(destino)) : PUB + destino);
for (const [d, k, , ves] of NOITES) {
  if (ehQuinta(d)) {
    // quinta só existe como Folhinha: as peças vêm de out/vespera
    F[k] = {
      feedJpg: await sobeOuJa(refazNoite(d) ? jpg(`out/vespera/${k}-FEED.png`) : null, `avulso/claude/${k}-feed.jpg`, d),
      feedMp4: await sobeOuJa(`out/vespera/${k}-FEED.mp4`, `avulso/claude/${k}-feed.mp4`, d),
      storyJpg: await sobeOuJa(refazNoite(d) ? jpg(`out/vespera/${k}-STORY.png`) : null, `avulso/claude/${k}-story.jpg`, d),
      storyMp4: await sobeOuJa(`out/vespera/${k}-STORY.mp4`, `avulso/claude/${k}-story.mp4`, d),
    };
    continue;
  }
  F[k] = {
    feedJpg: await sobeOuJa(refazNoite(d) ? jpg(`out/final/${k}-FEED.png`) : null, `avulso/claude/${k}-feed.jpg`, d),
    feedMp4: await sobeOuJa(`out/final/${k}-FEED.mp4`, `avulso/claude/${k}-feed.mp4`, d),
    storyJpg: await sobeOuJa(refazNoite(d) ? jpg(`out/final/${k}-STORY.png`) : null, `avulso/claude/${k}-story.jpg`, d),
    ...(semVideo(d)
      ? { storyMp4: await sobeOuJa(`out/final/${k}-STORY.mp4`, `avulso/claude/${k}-story.mp4`, d) }
      : { broll: await sobeOuJa(`out/final/${k}-STORY-BROLL.mp4`, `avulso/claude/${k}-broll.mp4`, d) }),
  };
  if (ves) Object.assign(F[k], {
    vesMp4: await sobeOuJa(`out/vespera/${ves}-FEED.mp4`, `avulso/claude/${ves}-feed.mp4`, d),
    vesStory: await sobeOuJa(refazNoite(d) ? jpg(`out/vespera/${ves}-STORY.png`) : null, `avulso/claude/${ves}-story.jpg`, d),
    vesBroll: await sobeOuJa(`out/vespera/${ves}-STORY-BROLL.mp4`, `avulso/claude/${ves}-broll.mp4`, d),
  });
}
const AG = {};
const dataDeChave = Object.fromEntries(NOITES.map(([d, k]) => [k, d]));
for (const [, s, ks, seg] of AGENDAS) {
  // agenda da semana lista as 3 noites: se UMA trocou, a agenda inteira é refeita
  const mexe = !ALVOS.length || SO_AGENDAS.length > 0 || ks.some((k) => ALVOS.includes(dataDeChave[k]));
  AG[s] = mexe
    ? { feed: await sobe(`out/agendas/agenda-${s}-FEED.mp4`, comVersao(`avulso/claude/ag-${s}-feed.mp4`)), story: await sobe(`out/agendas/agenda-${s}-STORY.mp4`, comVersao(`avulso/claude/ag-${s}-story.mp4`)) }
    : { feed: PUB + `avulso/claude/ag-${s}-feed.mp4`, story: PUB + `avulso/claude/ag-${s}-story.mp4` };
  if (seg && !(SO_AGENDAS.length && seg < new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10))) {
    AG[s].segFeed = mexe ? await sobe(`out/agendas/agenda-${s}-seg-FEED.mp4`, comVersao(`avulso/claude/ag-${s}-seg-feed.mp4`)) : PUB + `avulso/claude/ag-${s}-seg-feed.mp4`;
    AG[s].segStory = mexe ? await sobe(`out/agendas/agenda-${s}-seg-STORY.mp4`, comVersao(`avulso/claude/ag-${s}-seg-story.mp4`)) : PUB + `avulso/claude/ag-${s}-seg-story.mp4`;
  }
}

// ---------- capa do carrossel da manhã ----------
for (const [d, k] of NOITES) {
  if (!refazNoite(d)) continue;
  const valor = F[k].feedJpg.replace(PUB, "");
  log(`config carrossel_capa_${d} = ${valor}`);
  if (GRAVAR) await rest("butiquim_social_config?on_conflict=chave", { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=representation" }, body: JSON.stringify({ chave: `carrossel_capa_${d}`, valor }) });
}

// ---------- posts ----------
// modo refazer: a campanha já existe (com as linhas canceladas) — não pula por campanha, decide linha a linha no fim
const existentes = REFAZER.length ? new Set() : new Set((await rest(`butiquim_social_avulso?select=campanha&or=(campanha.like.extra-claude-${ABREV}-*,campanha.like.agenda-claude-*-${MES}-*)&limit=5000`)).map((r) => r.campanha));
const novos = [];
const add = (camp, lista) => { if (existentes.has(camp)) { log(`pula ${camp} (já na fila)`); return; } lista.forEach((p, i) => novos.push({ campanha: camp, ordem: i + 1, perfil: "obutiquim", legenda: "", ...p })); };

for (const [d, k, v, ves] of NOITES) {
  if (SO_AGENDAS.length) break;
  if (SO_NOITES.length && !SO_NOITES.includes(d)) continue;
  const dow = new Date(`${d}T12:00:00Z`).getUTCDay();
  const r = REGRA[dow];
  const { nome, ig, est } = info(d);
  const quem = `${nome}${ig ? ` (@${ig})` : ""}`;
  const DS = [d];
  // sem vídeo do artista: o story "vídeo" é o flyer animado
  const storyVideo = F[k].broll || F[k].storyMp4;
  if (dow === 5) {
    const quintaAberta = NOITES.some(([dd]) => dd === soma(d, -1));
    add(`extra-claude-${ABREV}-${soma(d, -2)}`, [
      { publicar_em: q(soma(d, -2), "12:00"), formato: "STORIES", video_url: storyVideo, marcados: ig, datas_show: DS },
      ...(quintaAberta ? [] : [{ publicar_em: q(soma(d, -2), "20:30"), formato: "STORIES", video_url: LISTA("sexta", "A", "story"), datas_show: null }]),
    ]);
    add(`extra-claude-${ABREV}-${soma(d, -1)}`, [
      { publicar_em: q(soma(d, -1), "17:00"), formato: "STORIES", video_url: F[k].storyJpg, marcados: ig, datas_show: DS },
      ...(quintaAberta ? [] : [{ publicar_em: q(soma(d, -1), "20:30"), formato: "STORIES", video_url: LISTA("sexta", "B", "story"), datas_show: null }]),
    ]);
  }
  if (dow === 4) {
    add(`extra-claude-${ABREV}-${soma(d, -1)}-quinta`, [
      { publicar_em: q(soma(d, -1), "17:00"), formato: "STORIES", video_url: F[k].storyJpg, marcados: ig, datas_show: DS },
      { publicar_em: q(soma(d, -1), "20:30"), formato: "STORIES", video_url: LISTA("quinta", "A", "story"), datas_show: null },
    ]);
  }
  const folhinha = dow === 4 || ves;
  const reelsDia = dow === 4 ? F[k].feedMp4 : ves ? F[k].vesMp4 : F[k].feedMp4;
  const storyDia = dow === 4 ? F[k].storyJpg : ves ? F[k].vesStory : F[k].storyJpg;
  const video16h = dow === 4 ? storyVideo : ves ? F[k].vesBroll : storyVideo;
  // lista 18h30/21h30: sexta = story B e feed A; sáb/dom = a variante que o montador NÃO usou às 17h30 (oposta à da semana)
  const outra = v === "A" || v === "C" ? "B" : "A";
  const vStory = dow === 5 ? "B" : outra, vFeed = dow === 5 ? "A" : outra;
  add(`extra-claude-${ABREV}-${d}${dow === 4 ? "-quinta" : ""}`, [
    { publicar_em: q(d, "12:00"), formato: "REELS", video_url: reelsDia, thumb_offset_seg: 3, datas_show: DS,
      legenda: folhinha
        ? `🗓️ VÉSPERA DE FERIADO! Amanhã ninguém precisa de despertador ⏰❌\n\n🎤 HOJE tem ${quem} no palco d'O Butiquim. ${est} + SpotiFunk a noite toda. 🍻\n\n📲 Nome na lista: link na bio ou chama no direct.\n${rodape(r)}`
        : `🎤 HOJE tem ${quem} no palco d'O Butiquim!\n\n${est} + SpotiFunk a noite toda. 🍻\n\n📲 Nome na lista: link na bio ou chama no direct.\n${rodape(r)}` },
    { publicar_em: q(d, "13:30"), formato: "STORIES", video_url: storyDia, marcados: ig, datas_show: DS },
    { publicar_em: q(d, "16:00"), formato: "STORIES", video_url: video16h, marcados: ig, datas_show: DS },
    { publicar_em: q(d, "16:30"), formato: "REELS", video_url: LISTA(r.dia, "B", "feed"), thumb_offset_seg: 3, datas_show: null,
      legenda: `💬 Comenta LISTA aqui embaixo que a gente te manda o link da lista no direct! 📲\n\n${regrasLista(r)}\n\n${rodape(r)}` },
    { publicar_em: q(d, "18:30"), formato: "STORIES", video_url: LISTA(r.dia, vStory, "story"), datas_show: null },
    { publicar_em: q(d, "21:30"), formato: "CAROUSEL", video_url: LISTA(r.dia, vFeed, "feed"), itens_urls: JSON.stringify([LISTA(r.dia, vFeed, "feed"), F[k].feedJpg]), datas_show: DS,
      legenda: `⏰ Última chamada pra lista de hoje!\n\n💬 Comenta LISTA aqui embaixo que a gente te manda o link no direct 📲\n\n${quem} no palco. ${regrasLista(r)}\n\n${rodape(r)}` },
  ]);
}

const mapa = Object.fromEntries((await rest("butiquim_social_config?select=chave,valor&chave=in.(arte_mapa_feed,arte_mapa_story)")).map((c) => [c.chave, c.valor]));
for (const [ter, s, ks, seg] of AGENDAS) {
  if (SO_NOITES.length && !ks.some((k) => SO_NOITES.includes(dataDeChave[k]))) continue;
  const DS = ks.map((k) => dataDe[k]);
  const linhas = ks.map((k) => { const d = dataDe[k]; const { nome, ig, est } = info(d); return `🎤 ${REGRA[new Date(`${d}T12:00:00Z`).getUTCDay()].nome} (${d.slice(8)}/${d.slice(5, 7)}): ${nome}${ig ? ` (@${ig})` : ""} · ${est}`; });
  const legenda = `🗓️ A SEMANA NA ESQUINA! Quem sobe no palco do Butica:\n\n${linhas.join("\n")}\n\n📲 Nome na lista e reserva: link na bio.\n\n📍 O Butiquim · Maringá\n#NãoTemErro · Te vejo na esquina!`;
  const igs = ks.map((k) => info(dataDe[k]).ig).filter(Boolean);
  // segunda sem designer: agenda versão A (carrossel 17h + story 17h20, com o mapinha da casa como a da esteira)
  if (seg && AG[s].segFeed) {
    add(`agenda-claude-seg-${seg}`, [
      { publicar_em: q(seg, "17:00"), formato: "CAROUSEL", video_url: AG[s].segFeed, itens_urls: JSON.stringify([AG[s].segFeed, ...ks.map((k) => F[k].feedJpg), ...(mapa.arte_mapa_feed ? [PUB + mapa.arte_mapa_feed] : [])].slice(0, 10)), legenda: `📅 CHEGOU A AGENDA DA SEMANA!\n\n${linhas.join("\n")}\n\n📲 Nome na lista e reserva: link na bio.\n\n📍 O Butiquim · Maringá\n#NãoTemErro · Te vejo na esquina!`, datas_show: DS },
      { publicar_em: q(seg, "17:20"), formato: "STORIES", video_url: AG[s].segStory, marcados: igs.join(",") || null, datas_show: DS },
      ...(mapa.arte_mapa_story ? [{ publicar_em: q(seg, "17:26"), formato: "STORIES", video_url: PUB + mapa.arte_mapa_story, datas_show: null }] : []),
    ]);
  }
  add(`extra-claude-${ABREV}-${ter}`, [{ publicar_em: q(ter, "12:00"), formato: "REELS", video_url: AG[s].feed, thumb_offset_seg: 4, legenda, datas_show: DS }]);
  add(`agenda-claude-feed-${ter}`, [{ publicar_em: q(ter, "17:00"), formato: "CAROUSEL", video_url: AG[s].feed, itens_urls: JSON.stringify([AG[s].feed, ...ks.map((k) => F[k].feedMp4)]), legenda, datas_show: DS }]);
  add(`agenda-claude-story-${ter}`, [
    { publicar_em: q(ter, "17:20"), formato: "STORIES", video_url: AG[s].story, marcados: igs.join(",") || null, datas_show: DS },
    ...ks.map((k, i) => ({ publicar_em: q(ter, `17:${String(26 + i * 6).padStart(2, "0")}`), formato: "STORIES", video_url: F[k].storyJpg, marcados: info(dataDe[k]).ig, datas_show: [dataDe[k]] })),
  ]);
}

if (SO_AGENDAS.length) {
  // agenda atrasada: solta agora em vez de cair num horário que já passou
  const agora = Date.now(), limite = agora + 5 * 60e3;
  const base = Math.ceil((agora + 10 * 60e3) / (5 * 60e3)) * 5 * 60e3;
  const iso = (ms) => new Date(ms - 3 * 3600e3).toISOString().slice(0, 19) + "-03:00";
  for (let i = novos.length - 1; i >= 0; i--) {
    const n = novos[i];
    if (new Date(n.publicar_em).getTime() > limite) continue;
    if (n.campanha.startsWith("agenda-claude-seg-")) { log(`fora (segunda vencida): ${n.campanha}/${n.ordem}`); novos.splice(i, 1); continue; }
    const desloc = n.campanha.startsWith("agenda-claude-feed-") ? 0
      : n.campanha.startsWith("agenda-claude-story-") ? (20 + (n.ordem - 1) * 6) * 60e3
      : 180 * 60e3; // Reels da agenda
    log(`atrasada → agora: ${n.campanha}/${n.ordem} ${n.publicar_em.slice(0, 16)} → ${iso(base + desloc).slice(0, 16)}`);
    n.publicar_em = iso(base + desloc);
  }
  // as peças das noites vêm do bucket: confere que cada arquivo existe antes de agendar
  for (const n of novos) for (const u of [n.video_url, ...(n.itens_urls ? JSON.parse(n.itens_urls) : [])]) {
    if (!GRAVAR && u.includes("/avulso/claude/ag-")) continue; // a agenda nova só sobe com --gravar
    const r = await fetch(u, { method: "HEAD" });
    if (!r.ok) throw new Error(`arquivo não está no bucket (HTTP ${r.status}): ${u}`);
  }
}

novos.sort((a, b) => a.publicar_em.localeCompare(b.publicar_em));

if (REFAZER.length) {
  // só o que mostra as noites trocadas e ainda vai acontecer
  const agora = Date.now();
  const alvo = novos.filter((n) => (n.datas_show || []).some((d) => REFAZER.includes(d)) && new Date(n.publicar_em).getTime() > agora + 5 * 60e3);
  const camps = [...new Set(alvo.map((n) => n.campanha))];
  const linhas = camps.length
    ? await rest(`butiquim_social_avulso?select=id,campanha,ordem,status,erro,apagado_em&campanha=in.(${camps.map((c) => `"${c}"`).join(",")})`)
    : [];
  const resumo = { reativados: 0, inseridos: 0, jaPendentes: 0, ids: [] };
  for (const n of alvo) {
    const mesmas = linhas.filter((l) => l.campanha === n.campanha && l.ordem === n.ordem && !l.apagado_em);
    const corpo = { publicar_em: n.publicar_em, formato: n.formato, video_url: n.video_url, itens_urls: n.itens_urls ?? null, legenda: n.legenda, marcados: n.marcados ?? null, thumb_offset_seg: n.thumb_offset_seg ?? null, datas_show: n.datas_show };
    const pend = mesmas.find((l) => l.status === "pendente");
    const canc = mesmas.find((l) => l.status === "cancelado" && /retirado .*atra[cç][aã]o trocou/i.test(l.erro || ""));
    if (pend) {
      // já pendente (ex.: rodada repetida) → só troca o conteúdo
      log(`atualiza #${pend.id} ${n.campanha}/${n.ordem}`);
      if (GRAVAR) await rest(`butiquim_social_avulso?id=eq.${pend.id}`, { method: "PATCH", body: JSON.stringify(corpo) });
      resumo.jaPendentes++; resumo.ids.push(pend.id);
    } else if (canc) {
      log(`reativa #${canc.id} ${n.campanha}/${n.ordem} ${n.publicar_em.slice(0, 16)} ${n.video_url.split("/").pop()}`);
      if (GRAVAR) await rest(`butiquim_social_avulso?id=eq.${canc.id}`, { method: "PATCH", body: JSON.stringify({ ...corpo, status: "pendente", erro: null, tentativas: 0, atualizado_em: new Date().toISOString() }) });
      resumo.reativados++; resumo.ids.push(canc.id);
    } else if (!mesmas.length) {
      log(`insere ${n.campanha}/${n.ordem} ${n.publicar_em.slice(0, 16)}`);
      if (GRAVAR) {
        const [novo] = await rest("butiquim_social_avulso", { method: "POST", body: JSON.stringify({ campanha: n.campanha, ordem: n.ordem, perfil: n.perfil, ...corpo }) });
        resumo.ids.push(novo?.id);
      }
      resumo.inseridos++;
    } else {
      log(`deixa ${n.campanha}/${n.ordem} (status ${mesmas.map((l) => l.status).join("/")})`);
    }
  }
  log(`\nREFAZER ${REFAZER.join(",")}: ${resumo.reativados} reativado(s), ${resumo.inseridos} inserido(s), ${resumo.jaPendentes} atualizado(s)${GRAVAR ? "" : " (simulação)"}`);
  console.log(`@@RESUMO ${JSON.stringify(resumo)}`);
  process.exit(0);
}

// modo noites: horário vencido não entra
if (SO_NOITES.length) { const limite = Date.now() + 5 * 60e3; for (let i = novos.length - 1; i >= 0; i--) if (new Date(novos[i].publicar_em).getTime() <= limite) { log(`fora (horário vencido): ${novos[i].campanha}/${novos[i].ordem}`); novos.splice(i, 1); } }
for (const n of novos) log(`novo ${n.publicar_em.slice(0, 16).replace("T", " ")} ${n.formato.padEnd(8)} ${n.video_url.split("/").pop().padEnd(26)} ${n.marcados ? "@" + n.marcados : ""}`);
const CHAVES = ["campanha", "ordem", "publicar_em", "formato", "video_url", "itens_urls", "legenda", "perfil", "thumb_offset_seg", "marcados", "datas_show"];
const lote = novos.map((n) => Object.fromEntries(CHAVES.map((c) => [c, n[c] ?? null])));
if (GRAVAR && lote.length) await rest("butiquim_social_avulso", { method: "POST", body: JSON.stringify(lote) });
log(GRAVAR ? `\nGRAVADO: ${novos.length} posts.` : `\n(simulação: ${novos.length} posts — rode com --gravar)`);
