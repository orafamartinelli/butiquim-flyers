// Mostra como um post da fila está no Instagram (tipo, miniatura, filhos). Uso: node scripts/ig-midia.mjs <id da fila> [baixar-miniatura.jpg]
import { writeFileSync } from "fs";
import { credSupabase } from "./_cred.mjs";

const [id, saida] = process.argv.slice(2);
const c = credSupabase();
const URL = c.project_url.replace(/\/$/, "");
const H = { apikey: c.secret_key, Authorization: `Bearer ${c.secret_key}` };
const get = async (p) => (await fetch(`${URL}/rest/v1/${p}`, { headers: H })).json();
const [linha] = await get(`butiquim_social_avulso?select=id,ig_media_id,formato,itens_urls,video_url&id=eq.${id}`);
const [cfg] = await get("butiquim_social_config?select=valor&chave=eq.meta_token");
const tk = cfg.valor;
const m = await (await fetch(`https://graph.facebook.com/v21.0/${linha.ig_media_id}?fields=media_type,thumbnail_url,media_url,permalink,timestamp,children{media_type,thumbnail_url,media_url}&access_token=${tk}`)).json();
const semToken = (s) => String(s || "").replace(/access_token=[^&]+/g, "access_token=***");
console.log(JSON.stringify({ fila: { formato: linha.formato, itens: JSON.parse(linha.itens_urls || "[]").map((u) => u.split("/").pop()) }, ig: { tipo: m.media_type, link: m.permalink, hora: m.timestamp, filhos: (m.children?.data || []).map((f) => f.media_type) }, erro: m.error }, null, 2));
if (saida) {
  const capa = m.thumbnail_url || m.children?.data?.[0]?.thumbnail_url || m.children?.data?.[0]?.media_url || m.media_url;
  writeFileSync(saida, Buffer.from(await (await fetch(capa)).arrayBuffer()));
  console.log("miniatura salva:", saida, semToken(capa).slice(0, 60));
}
