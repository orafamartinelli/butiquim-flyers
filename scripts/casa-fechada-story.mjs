// CASA FECHADA pelo celular (24/10/2026) — renderiza o story "AGENDA ATUALIZADA" e manda a prévia pro Rafa aprovar.
// Roda no GitHub Actions (.github/workflows/casa-fechada-story.yml), disparado pelo Hermes junto com o qg/casa-fechada.
//   client_payload: { data: 'AAAA-MM-DD' (noite fechada), responder_para, teste? }
// Local: DATA=2026-10-23 SEM_ENVIO=1 SUPABASE_URL=... SUPABASE_SECRET_KEY=... node scripts/casa-fechada-story.mjs
//
// CONTRATO
//  lê   butiquim_social_posts (carrossel_dia = agenda) → atualiza src/agenda.json antes do bundle (só a janela da noite)
//       qg_robos_estado 'noites-fechadas' (outras noites já fechadas também saem carimbadas)
//  grava Storage butiquim-social/avulso/claude/casa-fechada-<data>-<hora>.mp4
//       qg_robos_estado 'casa-fechada-<data>'.story_url (o qg/casa-fechada publica com o "publica o story" do Rafa)
//  envia vídeo no privado do Rafa (Z-API) pedindo aprovação
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";

const RAIZ = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const env = process.env;
const ev = env.GITHUB_EVENT_PATH ? JSON.parse(fs.readFileSync(env.GITHUB_EVENT_PATH, "utf8")).client_payload || {} : {};
const DATA = ev.data || env.DATA;
const PARA = String(ev.responder_para || env.RESPONDER || "5544984232574").replace(/\D/g, "");
const TESTE = !!(ev.teste ?? env.TESTE === "1");
const PRE = TESTE ? "[TESTE] " : "";
const SB = (env.SUPABASE_URL || "").replace(/\/$/, "");
const KEY = env.SUPABASE_SECRET_KEY;
const SEM_ENVIO = env.SEM_ENVIO === "1";
const RUN_URL = env.GITHUB_RUN_ID ? `${env.GITHUB_SERVER_URL}/${env.GITHUB_REPOSITORY}/actions/runs/${env.GITHUB_RUN_ID}` : null;
const RAFA = new Set(["5544984232574", "554484232574"]);

if (!/^\d{4}-\d{2}-\d{2}$/.test(DATA || "")) throw new Error("data da noite fechada ausente (AAAA-MM-DD)");
if (!RAFA.has(PARA)) throw new Error(`responder_para fora da allowlist: ${PARA}`);
if (!SB || !KEY) throw new Error("SUPABASE_URL / SUPABASE_SECRET_KEY ausentes");

const t0 = Date.now();
const log = (...a) => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s]`, ...a);
const ddmm = (iso) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
const mais = (iso, n) => new Date(new Date(`${iso}T12:00:00Z`).getTime() + n * 864e5).toISOString().slice(0, 10);
const dow = (iso) => new Date(`${iso}T12:00:00Z`).getUTCDay();
const FDS = new Set([5, 6, 0]);

const sb = async (rota, init = {}) => {
  const r = await fetch(`${SB}/rest/v1/${rota}`, { ...init, headers: { apikey: KEY, "Content-Type": "application/json", ...(init.headers || {}) } });
  const txt = await r.text();
  if (!r.ok) throw new Error(`supabase ${r.status} ${rota.slice(0, 60)}: ${txt.slice(0, 200)}`);
  return txt ? JSON.parse(txt) : null;
};
const zap = async (rota, body) => {
  if (SEM_ENVIO) { log(`[SEM_ENVIO] zap ${rota}`, JSON.stringify(body).slice(0, 300)); return; }
  const r = await fetch(`https://api.z-api.io/instances/${env.ZAPI_INSTANCE_ID}/token/${env.ZAPI_INSTANCE_TOKEN}/${rota}`, {
    method: "POST", headers: { "Content-Type": "application/json", "Client-Token": env.ZAPI_CLIENT_TOKEN }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`z-api ${rota} ${r.status}: ${(await r.text()).slice(0, 200)}`);
};

const slug = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/&/g, " e ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// mesma montagem do scripts/sync-agenda.mjs, mas só na janela da noite e mesclando com o que já está no arquivo
async function atualizaAgenda(de, ate) {
  const posts = await sb(`butiquim_social_posts?select=data,atracao&tipo=eq.carrossel_dia&data=gte.${de}&data=lte.${ate}&order=data`);
  const porSlug = Object.fromEntries((await sb("butiquim_social_artistas?select=slug,nome,estilo,estilo_inferido")).map((a) => [a.slug, a]));
  const arq = path.join(RAIZ, "src", "agenda.json");
  const atual = JSON.parse(fs.readFileSync(arq, "utf8"));
  const novas = posts.map((p) => {
    const s = slug(p.atracao || ""); const a = porSlug[s];
    return { data: p.data, atracao: p.atracao, slug: s, nome: a?.nome ?? p.atracao, estilo: a?.estilo ?? null, estilo_inferido: a?.estilo_inferido ?? null };
  });
  const fora = atual.noites.filter((n) => n.data < de || n.data > ate);
  const noites = [...fora, ...novas].sort((a, b) => a.data.localeCompare(b.data));
  fs.writeFileSync(arq, JSON.stringify({ ...atual, gerado_em: new Date().toISOString(), noites }, null, 2));
  return novas;
}

// noites do story: o fim de semana da noite fechada, dela em diante; se não sobrar noite aberta, entra o próximo fds
function escolheNoites(agenda, fechadas) {
  const fimSemana = mais(DATA, (7 - dow(DATA)) % 7); // domingo da semana
  let datas = agenda.map((n) => n.data).filter((d) => FDS.has(dow(d)) && d >= DATA && d <= fimSemana);
  if (!datas.some((d) => !fechadas.has(d))) datas = [...datas, ...agenda.map((n) => n.data).filter((d) => FDS.has(dow(d)) && d > fimSemana).slice(0, 2)];
  return datas.slice(0, 3);
}

const main = async () => {
  log(`casa fechada ${DATA}${TESTE ? " [TESTE]" : ""} → ${PARA}`);
  const agenda = await atualizaAgenda(mais(DATA, -2), mais(DATA, 14));
  const nf = (await sb("qg_robos_estado?chave=eq.noites-fechadas&select=valor"))[0]?.valor?.datas || [];
  const fechadas = new Set([...nf, DATA]);
  const datas = escolheNoites(agenda, fechadas);
  if (!datas.includes(DATA)) throw new Error(`${ddmm(DATA)} não está na agenda (planilha)`);
  const props = { datas, fechadas: datas.filter((d) => fechadas.has(d)) };
  log("props", JSON.stringify(props));

  const serveUrl = await bundle({ entryPoint: path.join(RAIZ, "src", "entries", "fechado", "index.ts"), publicDir: path.join(RAIZ, "public") });
  log("bundle ok");
  const out = path.join(RAIZ, "out", "avisos");
  fs.mkdirSync(out, { recursive: true });
  const mp4 = path.join(out, `casa-fechada-${DATA}.mp4`);
  const composition = await selectComposition({ serveUrl, id: "aviso-fechado", inputProps: props, logLevel: "error" });
  await renderMedia({ composition, serveUrl, codec: "h264", outputLocation: mp4, inputProps: props, crf: 20, pixelFormat: "yuv420p",
    imageFormat: "jpeg", jpegQuality: 90, concurrency: Number(env.CONCURRENCY) || Math.max(1, os.cpus().length), overwrite: true, logLevel: "error" });
  log(`vídeo ok (${Math.round(fs.statSync(mp4).size / 1024)} KB)`);
  if (SEM_ENVIO) { log("SEM_ENVIO=1 — parei antes de subir/enviar", mp4); return; }

  const destino = `avulso/claude/casa-fechada-${DATA}-${Date.now()}.mp4`;
  const up = await fetch(`${SB}/storage/v1/object/butiquim-social/${destino}`, { method: "POST", headers: { apikey: KEY, "Content-Type": "video/mp4", "x-upsert": "true" }, body: fs.readFileSync(mp4) });
  if (!up.ok) throw new Error(`upload ${up.status}: ${(await up.text()).slice(0, 200)}`);
  const url = `${SB}/storage/v1/object/public/butiquim-social/${destino}`;

  const chave = `casa-fechada-${DATA}`;
  const est = (await sb(`qg_robos_estado?chave=eq.${chave}&select=valor`))[0]?.valor || {};
  await sb("qg_robos_estado?on_conflict=chave", { method: "POST", headers: { Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify({ chave, valor: { ...est, story_url: url, story_pronto_em: new Date().toISOString(), story_teste: TESTE }, atualizado_em: new Date().toISOString() }) });
  await zap("send-video", { phone: PARA, video: url, caption: `${PRE}🎬 *Story "agenda atualizada" — ${ddmm(DATA)} fechada*\nResponda *publica o story ${ddmm(DATA)}* pra eu postar no Instagram, ou *não publica ${ddmm(DATA)}*.` });
  log("prévia enviada");
};

main().catch(async (e) => {
  console.error(e);
  await zap("send-text", { phone: PARA, message: `${PRE}⚠️ Não consegui montar o story de casa fechada (${ddmm(DATA)}).\nErro: ${String(e.message).slice(0, 250)}${RUN_URL ? `\n${RUN_URL}` : ""}` }).catch(() => {});
  process.exit(1);
});
