// Uso único 11/11/2026: o carrossel da agenda 13–15/11 (#1082) saiu com miniatura PRETA (1º slide = vídeo, 1º quadro preto).
// Apaga do Instagram e reagenda com a capa estática (quadro final da agenda) como 1º slide.
import { readFileSync } from "fs";
import { execFileSync } from "child_process";
import { credSupabase, FFMPEG } from "./_cred.mjs";

const c = credSupabase();
const URL = c.project_url.replace(/\/$/, "");
const H = { apikey: c.secret_key, Authorization: `Bearer ${c.secret_key}` };
const rest = async (p, o = {}) => { const r = await fetch(`${URL}/rest/v1/${p}`, { ...o, headers: { ...H, "Content-Type": "application/json", Prefer: "return=representation", ...(o.headers || {}) } }); if (!r.ok) throw new Error(`${r.status} ${await r.text()}`); return r.json(); };
const [l] = await rest("butiquim_social_avulso?select=*&id=eq.1082");
if (!l.ig_media_id) throw new Error("#1082 sem ig_media_id");
const tk = (await rest("butiquim_social_config?select=valor&chave=eq.meta_token"))[0].valor;

// 1. capa: still final da agenda → jpg → bucket (nome novo)
execFileSync(FFMPEG, ["-v", "error", "-y", "-i", "out/agendas/agenda-s7-FEED.png", "-q:v", "2", "out/agendas/agenda-s7-CAPA.jpg"]);
const destino = "avulso/claude/ag-s7-capa-r1111.jpg";
const up = await fetch(`${URL}/storage/v1/object/butiquim-social/${destino}`, { method: "POST", headers: { ...H, "Content-Type": "image/jpeg", "x-upsert": "true" }, body: readFileSync("out/agendas/agenda-s7-CAPA.jpg") });
if (!up.ok) throw new Error("upload capa " + up.status);
const capa = `${URL}/storage/v1/object/public/butiquim-social/${destino}`;

// 2. apaga o post do Instagram
const del = await (await fetch(`https://graph.facebook.com/v21.0/${l.ig_media_id}?access_token=${tk}`, { method: "DELETE" })).json();
console.log("apagar no IG:", JSON.stringify(del));
if (!del.success) throw new Error("não apagou");
await rest(`butiquim_social_avulso?id=eq.1082`, { method: "PATCH", body: JSON.stringify({ apagado_em: new Date().toISOString(), erro: "apagado 11/11: miniatura preta; republicado com capa (ordem 2)" }) });

// 3. reagenda: mesma campanha, ordem 2, capa + vídeo da agenda + vídeos das noites
const itens = [capa, ...JSON.parse(l.itens_urls)].slice(0, 10);
const [novo] = await rest("butiquim_social_avulso", { method: "POST", body: JSON.stringify({ campanha: l.campanha, ordem: 2, perfil: l.perfil, formato: "CAROUSEL", publicar_em: new Date(Date.now() - 60e3).toISOString(), video_url: capa, itens_urls: JSON.stringify(itens), legenda: l.legenda, datas_show: l.datas_show }) });
console.log("reagendado #" + novo.id, itens.map((u) => u.split("/").pop()).join(" | "));
