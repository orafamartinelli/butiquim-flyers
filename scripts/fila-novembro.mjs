// Fila de NOVEMBRO/2026 — junta os 3 modelos de outubro (agenda-fila + fila-extras + fila-modelo-completo) num script só.
// Por noite de show (sex/sáb/dom com atração na planilha):
//   capa do carrossel da manhã = nosso flyer (config carrossel_capa_<data>, lida pelo montador)
//   12:00 Reels flyer animado · 13:30 story flyer · 16:00 story vídeo do artista · 16:30 Reels "Comenta LISTA"
//   18:30 story lista · 21:30 carrossel última chamada (lista + flyer)
//   véspera de feriado: 12:00/13:30/16:00 usam a Folhinha (o flyer normal fica na capa e na última chamada)
// Antes da sexta: QUA 12:00 vídeo do artista + 20:30 lista A · QUI 17:00 flyer + 20:30 lista B
// Agenda (terça): 12:00 Reels da agenda · 17:00 carrossel [agenda + feed de cada noite] · 17:20 story agenda + 1 story por noite
// Todo post já nasce com datas_show (cancelar noite). Idempotente por campanha.
// Uso: node scripts/fila-novembro.mjs (simula) · node scripts/fila-novembro.mjs --gravar
import { readFileSync, existsSync } from "fs";
import { execFileSync } from "child_process";

const GRAVAR = process.argv.includes("--gravar");
const cred = JSON.parse(readFileSync("C:/Users/User/Documents/projetos/.credentials/supabase-new-api-keys.json", "utf8"));
const URL = cred.project_url.replace(/\/$/, "");
const H = { apikey: cred.secret_key, Authorization: `Bearer ${cred.secret_key}` };
const PUB = `${URL}/storage/v1/object/public/butiquim-social/`;
const FF = "C:/Users/User/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.2-full_build/bin/ffmpeg.exe";
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

// noites: data, chave, identidade da semana, véspera (Folhinha)
const NOITES = [
  ["2026-11-06", "sexta6", "B"], ["2026-11-07", "sabado6", "B"], ["2026-11-08", "domingo6", "B"],
  ["2026-11-14", "sabado7", "A", "vespera3"],
  ["2026-11-15", "domingo7", "A"], // Victor preencheu depois do lote (João Maurício) — gravado 19/10
  ["2026-11-21", "sabado8", "B"], ["2026-11-22", "domingo8", "B"],
  ["2026-11-27", "sexta9", "A"], ["2026-11-28", "sabado9", "A"],
];
const AGENDAS = [ // terça, agenda, noites da semana
  ["2026-11-03", "s6", ["sexta6", "sabado6", "domingo6"]],
  // REGRA DO RAFA (14/10): agenda da semana SÓ com a semana completa (sex/sáb/dom preenchidos) — senão só aviso "agenda incompleta".
  // s7 (10/11, semana 13–15: falta o 13), s8 (17/11, semana 20–22: falta 20), s9 (24/11, semana 27–29: falta 29) → fora até fechar.
];
const dataDe = Object.fromEntries(NOITES.map(([d, k]) => [k, d]));
const REGRA = { 5: { dia: "sexta", noite: "Sexta do Butica", ate: "00h", abre: "23h", nome: "Sexta" }, 6: { dia: "sabado", noite: "Sabadá do Butica", ate: "00h", abre: "23h", nome: "Sábado" }, 0: { dia: "domingo", noite: "Saideira da Semana", ate: "23h", abre: "22h", nome: "Domingo" } };
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
for (const [, k, , ves] of NOITES) {
  F[k] = {
    feedJpg: await sobe(jpg(`out/final/${k}-FEED.png`), `avulso/claude/${k}-feed.jpg`),
    feedMp4: await sobe(`out/final/${k}-FEED.mp4`, `avulso/claude/${k}-feed.mp4`),
    storyJpg: await sobe(jpg(`out/final/${k}-STORY.png`), `avulso/claude/${k}-story.jpg`),
    broll: await sobe(`out/final/${k}-STORY-BROLL.mp4`, `avulso/claude/${k}-broll.mp4`),
  };
  if (ves) Object.assign(F[k], {
    vesMp4: await sobe(`out/vespera/${ves}-FEED.mp4`, `avulso/claude/${ves}-feed.mp4`),
    vesStory: await sobe(jpg(`out/vespera/${ves}-STORY.png`), `avulso/claude/${ves}-story.jpg`),
    vesBroll: await sobe(`out/vespera/${ves}-STORY-BROLL.mp4`, `avulso/claude/${ves}-broll.mp4`),
  });
}
const AG = {};
for (const [, s] of AGENDAS) AG[s] = { feed: await sobe(`out/agendas/agenda-${s}-FEED.mp4`, `avulso/claude/ag-${s}-feed.mp4`), story: await sobe(`out/agendas/agenda-${s}-STORY.mp4`, `avulso/claude/ag-${s}-story.mp4`) };

// ---------- capa do carrossel da manhã ----------
for (const [d, k] of NOITES) {
  const valor = F[k].feedJpg.replace(PUB, "");
  log(`config carrossel_capa_${d} = ${valor}`);
  if (GRAVAR) await rest("butiquim_social_config?on_conflict=chave", { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=representation" }, body: JSON.stringify({ chave: `carrossel_capa_${d}`, valor }) });
}

// ---------- posts ----------
const existentes = new Set((await rest("butiquim_social_avulso?select=campanha&or=(campanha.like.extra-claude-nov-*,campanha.like.agenda-claude-*-2026-11-*)")).map((r) => r.campanha));
const novos = [];
const add = (camp, lista) => { if (existentes.has(camp)) { log(`pula ${camp} (já na fila)`); return; } lista.forEach((p, i) => novos.push({ campanha: camp, ordem: i + 1, perfil: "obutiquim", legenda: "", ...p })); };

for (const [d, k, v, ves] of NOITES) {
  const dow = new Date(`${d}T12:00:00Z`).getUTCDay();
  const r = REGRA[dow];
  const { nome, ig, est } = info(d);
  const quem = `${nome}${ig ? ` (@${ig})` : ""}`;
  const DS = [d];
  if (dow === 5) {
    add(`extra-claude-nov-${soma(d, -2)}`, [
      { publicar_em: q(soma(d, -2), "12:00"), formato: "STORIES", video_url: F[k].broll, marcados: ig, datas_show: DS },
      { publicar_em: q(soma(d, -2), "20:30"), formato: "STORIES", video_url: LISTA("sexta", "A", "story"), datas_show: null },
    ]);
    add(`extra-claude-nov-${soma(d, -1)}`, [
      { publicar_em: q(soma(d, -1), "17:00"), formato: "STORIES", video_url: F[k].storyJpg, marcados: ig, datas_show: DS },
      { publicar_em: q(soma(d, -1), "20:30"), formato: "STORIES", video_url: LISTA("sexta", "B", "story"), datas_show: null },
    ]);
  }
  // lista 18h30/21h30: sexta = story B e feed A; sáb/dom = a variante que o montador NÃO usou às 17h30 (oposta à da semana)
  const outra = v === "A" ? "B" : "A";
  const vStory = dow === 5 ? "B" : outra, vFeed = dow === 5 ? "A" : outra;
  add(`extra-claude-nov-${d}`, [
    { publicar_em: q(d, "12:00"), formato: "REELS", video_url: ves ? F[k].vesMp4 : F[k].feedMp4, thumb_offset_seg: 3, datas_show: DS,
      legenda: ves
        ? `🗓️ VÉSPERA DE FERIADO! Amanhã ninguém precisa de despertador ⏰❌\n\n🎤 HOJE tem ${quem} no palco d'O Butiquim. ${est} + SpotiFunk a noite toda. 🍻\n\n📲 Nome na lista: link na bio ou chama no direct.\n${rodape(r)}`
        : `🎤 HOJE tem ${quem} no palco d'O Butiquim!\n\n${est} + SpotiFunk a noite toda. 🍻\n\n📲 Nome na lista: link na bio ou chama no direct.\n${rodape(r)}` },
    { publicar_em: q(d, "13:30"), formato: "STORIES", video_url: ves ? F[k].vesStory : F[k].storyJpg, marcados: ig, datas_show: DS },
    { publicar_em: q(d, "16:00"), formato: "STORIES", video_url: ves ? F[k].vesBroll : F[k].broll, marcados: ig, datas_show: DS },
    { publicar_em: q(d, "16:30"), formato: "REELS", video_url: LISTA(r.dia, "B", "feed"), thumb_offset_seg: 3, datas_show: null,
      legenda: `💬 Comenta LISTA aqui embaixo que a gente te manda o link da lista no direct! 📲\n\n${regrasLista(r)}\n\n${rodape(r)}` },
    { publicar_em: q(d, "18:30"), formato: "STORIES", video_url: LISTA(r.dia, vStory, "story"), datas_show: null },
    { publicar_em: q(d, "21:30"), formato: "CAROUSEL", video_url: LISTA(r.dia, vFeed, "feed"), itens_urls: JSON.stringify([LISTA(r.dia, vFeed, "feed"), F[k].feedJpg]), datas_show: DS,
      legenda: `⏰ Última chamada pra lista de hoje!\n\n💬 Comenta LISTA aqui embaixo que a gente te manda o link no direct 📲\n\n${quem} no palco. ${regrasLista(r)}\n\n${rodape(r)}` },
  ]);
}

for (const [ter, s, ks] of AGENDAS) {
  const DS = ks.map((k) => dataDe[k]);
  const linhas = ks.map((k) => { const d = dataDe[k]; const { nome, ig, est } = info(d); return `🎤 ${REGRA[new Date(`${d}T12:00:00Z`).getUTCDay()].nome} (${d.slice(8)}/${d.slice(5, 7)}): ${nome}${ig ? ` (@${ig})` : ""} · ${est}`; });
  const legenda = `🗓️ A SEMANA NA ESQUINA! Quem sobe no palco do Butica:\n\n${linhas.join("\n")}\n\n📲 Nome na lista e reserva: link na bio.\n\n📍 O Butiquim · Maringá\n#NãoTemErro · Te vejo na esquina!`;
  const igs = ks.map((k) => info(dataDe[k]).ig).filter(Boolean);
  add(`extra-claude-nov-${ter}`, [{ publicar_em: q(ter, "12:00"), formato: "REELS", video_url: AG[s].feed, thumb_offset_seg: 4, legenda, datas_show: DS }]);
  add(`agenda-claude-feed-${ter}`, [{ publicar_em: q(ter, "17:00"), formato: "CAROUSEL", video_url: AG[s].feed, itens_urls: JSON.stringify([AG[s].feed, ...ks.map((k) => F[k].feedMp4)]), legenda, datas_show: DS }]);
  add(`agenda-claude-story-${ter}`, [
    { publicar_em: q(ter, "17:20"), formato: "STORIES", video_url: AG[s].story, marcados: igs.join(",") || null, datas_show: DS },
    ...ks.map((k, i) => ({ publicar_em: q(ter, `17:${String(26 + i * 6).padStart(2, "0")}`), formato: "STORIES", video_url: F[k].storyJpg, marcados: info(dataDe[k]).ig, datas_show: [dataDe[k]] })),
  ]);
}

novos.sort((a, b) => a.publicar_em.localeCompare(b.publicar_em));
for (const n of novos) log(`novo ${n.publicar_em.slice(0, 16).replace("T", " ")} ${n.formato.padEnd(8)} ${n.video_url.split("/").pop().padEnd(26)} ${n.marcados ? "@" + n.marcados : ""}`);
const CHAVES = ["campanha", "ordem", "publicar_em", "formato", "video_url", "itens_urls", "legenda", "perfil", "thumb_offset_seg", "marcados", "datas_show"];
const lote = novos.map((n) => Object.fromEntries(CHAVES.map((c) => [c, n[c] ?? null])));
if (GRAVAR && lote.length) await rest("butiquim_social_avulso", { method: "POST", body: JSON.stringify(lote) });
log(GRAVAR ? `\nGRAVADO: ${novos.length} posts.` : `\n(simulação: ${novos.length} posts — rode com --gravar)`);
