// 14/10 (pedido do Rafa): a agenda de 13/10 saiu sem o domingo 18 (Alister) e foi apagada do IG.
// Republica a agenda 16 A 18 com os nossos materiais:
//   hoje 18:00 carrossel (agenda + feed de cada noite) · stories 18:05 agenda + 18:11/18:17/18:23 story de cada noite (domingo incluso)
//   amanhã 15/10 12:00 Reels com o vídeo da agenda (o par que tinha sido apagado)
// Arquivos com NOME NOVO (ag-s3-v2-*) para o cache do Storage não servir a versão antiga sem o domingo.
// Uso: node scripts/publica-agenda-16-18.mjs (simula) · --gravar
import { readFileSync, existsSync } from "fs";

const GRAVAR = process.argv.includes("--gravar");
const cred = JSON.parse(readFileSync("C:/Users/User/Documents/projetos/.credentials/supabase-new-api-keys.json", "utf8"));
const URL = cred.project_url.replace(/\/$/, "");
const H = { apikey: cred.secret_key, Authorization: `Bearer ${cred.secret_key}` };
const PUB = `${URL}/storage/v1/object/public/butiquim-social/`;
const sobe = async (local, destino) => {
  if (!existsSync(local)) throw new Error(`falta ${local}`);
  console.log(`upload ${local} → ${destino}`);
  if (GRAVAR) {
    const r = await fetch(`${URL}/storage/v1/object/butiquim-social/${destino}`, { method: "POST", headers: { ...H, "Content-Type": "video/mp4", "x-upsert": "true" }, body: readFileSync(local) });
    if (!r.ok) throw new Error(`upload ${destino}: ${r.status} ${await r.text()}`);
  }
  return PUB + destino;
};

const agFeed = await sobe("out/agendas/agenda-s3-FEED.mp4", "avulso/claude/ag-s3-v2-feed.mp4");
const agStory = await sobe("out/agendas/agenda-s3-STORY.mp4", "avulso/claude/ag-s3-v2-story.mp4");
const C = (f) => PUB + "avulso/claude/" + f;
const NOITES = ["2026-10-16", "2026-10-17", "2026-10-18"];
const LEG = `🗓️ A SEMANA NA ESQUINA! Quem sobe no palco do Butica:

🎤 Sexta (16/10): HILANA (@hilana_makiyama) · Sertanejo
🎤 Sábado (17/10): PAGODE 44 (@pagode44oficial) · Pagode
🎤 Domingo (18/10): ALISTER FERRAZ (@alisterferraz) · Sertanejo

📲 Nome na lista e reserva: link na bio.

📍 O Butiquim · Maringá
#NãoTemErro · Te vejo na esquina!`;

const linhas = [
  { campanha: "agenda-claude-feed-2026-10-14", ordem: 1, publicar_em: "2026-10-14T18:00:00-03:00", formato: "CAROUSEL", video_url: agFeed,
    itens_urls: JSON.stringify([agFeed, C("sexta3-feed.mp4"), C("sabado3-feed.mp4"), C("domingo3-feed.mp4")]), legenda: LEG, marcados: null, thumb_offset_seg: null, datas_show: NOITES },
  { campanha: "agenda-claude-story-2026-10-14", ordem: 1, publicar_em: "2026-10-14T18:05:00-03:00", formato: "STORIES", video_url: agStory, itens_urls: null, legenda: "", marcados: "hilana_makiyama,pagode44oficial,alisterferraz", thumb_offset_seg: null, datas_show: NOITES },
  { campanha: "agenda-claude-story-2026-10-14", ordem: 2, publicar_em: "2026-10-14T18:11:00-03:00", formato: "STORIES", video_url: C("sexta3-story.jpg"), itens_urls: null, legenda: "", marcados: "hilana_makiyama", thumb_offset_seg: null, datas_show: ["2026-10-16"] },
  { campanha: "agenda-claude-story-2026-10-14", ordem: 3, publicar_em: "2026-10-14T18:17:00-03:00", formato: "STORIES", video_url: C("sabado3-story.jpg"), itens_urls: null, legenda: "", marcados: "pagode44oficial", thumb_offset_seg: null, datas_show: ["2026-10-17"] },
  { campanha: "agenda-claude-story-2026-10-14", ordem: 4, publicar_em: "2026-10-14T18:23:00-03:00", formato: "STORIES", video_url: C("domingo3-story.jpg"), itens_urls: null, legenda: "", marcados: "alisterferraz", thumb_offset_seg: null, datas_show: ["2026-10-18"] },
  { campanha: "extra-claude-mais-2026-10-15", ordem: 9, publicar_em: "2026-10-15T12:00:00-03:00", formato: "REELS", video_url: agFeed, itens_urls: null, legenda: LEG, marcados: null, thumb_offset_seg: 4, datas_show: NOITES },
].map((l) => ({ ...l, perfil: "obutiquim" }));

const ja = await (await fetch(`${URL}/rest/v1/butiquim_social_avulso?select=id&video_url=like.*ag-s3-v2*`, { headers: H })).json();
if (ja.length) { console.log(`já na fila (${ja.length} linhas com ag-s3-v2) — nada a fazer`); process.exit(0); }
for (const l of linhas) console.log(`novo ${l.publicar_em.slice(0, 16)} ${l.formato.padEnd(8)} ${l.video_url.split("/").pop()} ${l.marcados ? "@" + l.marcados : ""}`);
if (GRAVAR) {
  const r = await fetch(`${URL}/rest/v1/butiquim_social_avulso`, { method: "POST", headers: { ...H, "Content-Type": "application/json", Prefer: "return=minimal" }, body: JSON.stringify(linhas) });
  if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
}
console.log(GRAVAR ? "GRAVADO." : "(simulação — rode com --gravar)");
