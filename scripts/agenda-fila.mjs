// Agenda as AGENDAS SEMANAIS nossas na fila do publicador avulso (butiquim_social_avulso):
//  - TERÇA 17h: carrossel no feed [agenda em vídeo + feed em vídeo de cada noite]
//  - TERÇA 17h20: sequência de stories [agenda em vídeo + story de cada noite], marcando o artista
// A agenda da ESTEIRA (segunda 17h, artes do designer) continua igual — esta é uma postagem A MAIS (Rafa quer volume).
// Sobe os arquivos para o bucket público butiquim-social/avulso/claude/. Idempotente por campanha.
// Uso: node scripts/agenda-fila.mjs            (simula e mostra)
//      node scripts/agenda-fila.mjs --gravar   (sobe arquivos e grava na fila)
import { readFileSync, existsSync, mkdirSync } from "fs";
import { execFileSync } from "child_process";

const GRAVAR = process.argv.includes("--gravar");
const cred = JSON.parse(readFileSync("C:/Users/User/Documents/projetos/.credentials/supabase-new-api-keys.json", "utf8"));
const URL = cred.project_url.replace(/\/$/, "");
const H = { apikey: cred.secret_key, Authorization: `Bearer ${cred.secret_key}` };
const PUB = `${URL}/storage/v1/object/public/butiquim-social/`;

const agenda = JSON.parse(readFileSync("src/agenda.json", "utf8")).noites;
const SEMANAS = [
  { ag: "s1", seg: "2026-09-28", ter: "2026-09-29", noites: [["sexta", "2026-10-02"], ["sabado", "2026-10-03"], ["domingo", "2026-10-04"]] },
  { ag: "s2", seg: "2026-10-05", ter: "2026-10-06", noites: [["sexta2", "2026-10-09"], ["sabado2", "2026-10-10"], ["domingo2", "2026-10-11"]] },
  { ag: "s3", seg: "2026-10-12", ter: "2026-10-13", noites: [["sexta3", "2026-10-16"], ["sabado3", "2026-10-17"]] },
  { ag: "s4", seg: "2026-10-19", ter: "2026-10-20", noites: [["sexta4", "2026-10-23"], ["sabado4", "2026-10-24"]] },
  { ag: "s5", seg: "2026-10-26", ter: "2026-10-27", noites: [["sexta5", "2026-10-30"], ["sabado5", "2026-10-31"]] },
];
const DOW = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

const rest = async (path, opts = {}) => {
  const r = await fetch(`${URL}/rest/v1/${path}`, { ...opts, headers: { ...H, "Content-Type": "application/json", Prefer: "return=representation", ...(opts.headers || {}) } });
  if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  return r.json();
};
const sobe = async (local, destino, tipo) => {
  if (!GRAVAR) return PUB + destino;
  const r = await fetch(`${URL}/storage/v1/object/butiquim-social/${destino}`, { method: "POST", headers: { ...H, "Content-Type": tipo, "x-upsert": "true" }, body: readFileSync(local) });
  if (!r.ok) throw new Error(`upload ${destino}: ${r.status} ${await r.text()}`);
  return PUB + destino;
};
// o Instagram só aceita JPEG como imagem
const jpg = (png) => {
  const j = png.replace(/\.png$/, ".jpg");
  if (!existsSync(j)) execFileSync("ffmpeg", ["-v", "error", "-y", "-i", png, "-q:v", "2", j]);
  return j;
};
const quando = (data, hhmm) => `${data}T${hhmm}:00-03:00`;

const artistas = await rest("butiquim_social_artistas?select=slug,nome,instagram,estilo");
const handle = (slug) => artistas.find((a) => a.slug === slug)?.instagram || "";
const existentes = new Set((await rest("butiquim_social_avulso?select=campanha&campanha=like.agenda-claude-*")).map((r) => r.campanha));

mkdirSync("out/fila", { recursive: true });
for (const s of SEMANAS) {
  const campFeed = `agenda-claude-feed-${s.ter}`;
  const campStory = `agenda-claude-story-${s.ter}`;
  const linhasLeg = s.noites.map(([, d]) => {
    const a = agenda.find((x) => x.data === d);
    const dt = new Date(`${d}T12:00:00Z`);
    const h = handle(a.slug);
    return `🎤 ${DOW[dt.getUTCDay()]} (${d.slice(8, 10)}/${d.slice(5, 7)}): ${a.nome.toUpperCase()}${h ? ` (@${h})` : ""} · ${a.estilo === "PAGODE" ? "Pagode" : "Sertanejo"}`;
  });
  const legenda = `🗓️ A SEMANA NA ESQUINA! Quem sobe no palco do Butica:\n\n${linhasLeg.join("\n")}\n\n📲 Nome na lista e reserva: link na bio.\n\n📍 O Butiquim · Maringá\n#NãoTemErro · Te vejo na esquina!`;

  // TERÇA 17h — carrossel no feed
  if (!existentes.has(campFeed)) {
    const itens = [await sobe(`out/agendas/agenda-${s.ag}-FEED.mp4`, `avulso/claude/ag-${s.ag}-feed.mp4`, "video/mp4")];
    for (const [k] of s.noites) itens.push(await sobe(`out/final/${k}-FEED.mp4`, `avulso/claude/${k}-feed.mp4`, "video/mp4"));
    const linha = { campanha: campFeed, ordem: 1, publicar_em: quando(s.ter, "17:00"), formato: "CAROUSEL", video_url: itens[0], itens_urls: JSON.stringify(itens), legenda, perfil: "obutiquim" };
    console.log(`${s.ter} 17:00 CARROSSEL (${itens.length} itens) ${campFeed}`);
    if (GRAVAR) await rest("butiquim_social_avulso", { method: "POST", body: JSON.stringify(linha) });
  } else console.log(`pula ${campFeed} (já na fila)`);

  // TERÇA 17h20 — sequência de stories
  if (!existentes.has(campStory)) {
    const linhas = [];
    const handles = s.noites.map(([, d]) => handle(agenda.find((x) => x.data === d).slug)).filter(Boolean);
    linhas.push({ campanha: campStory, ordem: 1, publicar_em: quando(s.ter, "17:20"), formato: "STORIES", video_url: await sobe(`out/agendas/agenda-${s.ag}-STORY.mp4`, `avulso/claude/ag-${s.ag}-story.mp4`, "video/mp4"), legenda: "", marcados: handles.slice(0, 2).join(",") || null, perfil: "obutiquim" });
    let min = 26;
    for (const [k, d] of s.noites) {
      const h = handle(agenda.find((x) => x.data === d).slug);
      const url = await sobe(jpg(`out/final/${k}-STORY.png`), `avulso/claude/${k}-story.jpg`, "image/jpeg");
      linhas.push({ campanha: campStory, ordem: linhas.length + 1, publicar_em: quando(s.ter, `17:${String(min).padStart(2, "0")}`), formato: "STORIES", video_url: url, legenda: "", marcados: h || null, perfil: "obutiquim" });
      min += 6;
    }
    linhas.forEach((l) => console.log(`${s.ter} ${l.publicar_em.slice(11, 16)} STORY ${l.video_url.split("/").pop()} ${l.marcados ? "@" + l.marcados : ""}`));
    if (GRAVAR) await rest("butiquim_social_avulso", { method: "POST", body: JSON.stringify(linhas) });
  } else console.log(`pula ${campStory} (já na fila)`);
  if (!GRAVAR && s === SEMANAS[0]) console.log("\nLEGENDA (exemplo):\n" + legenda + "\n");
}
console.log(GRAVAR ? "\nGRAVADO na fila." : "\n(simulação — rode com --gravar)");
