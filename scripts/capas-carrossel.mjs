// CAPAS QUE FALTAM (11/11/2026) — garante `<video>-capa.jpg` (último quadro) ao lado de todo vídeo de feed do bucket
// (avulso/claude/*-feed*.mp4). Daqui pra frente quem gera é o próprio upload (fila-mes / promos-sobe → scripts/_capa.mjs)
// e o publicador n8n põe a capa na frente do carrossel. Este script é só para o estoque antigo ou conferência.
// Uso: node scripts/capas-carrossel.mjs            → lista o que falta
//      node scripts/capas-carrossel.mjs --gravar   → gera e sobe as que faltam
import { writeFileSync, mkdirSync } from "fs";
import { credSupabase } from "./_cred.mjs";
import { nomeCapa, sobeCapa } from "./_capa.mjs";

const GRAVAR = process.argv.includes("--gravar");
const c = credSupabase();
const URL = c.project_url.replace(/\/$/, "");
const H = { apikey: c.secret_key, Authorization: `Bearer ${c.secret_key}`, "Content-Type": "application/json" };
const PASTA = "avulso/claude";
const objs = [];
for (let off = 0; ; off += 1000) {
  const r = await (await fetch(`${URL}/storage/v1/object/list/butiquim-social`, { method: "POST", headers: H, body: JSON.stringify({ prefix: PASTA, limit: 1000, offset: off }) })).json();
  objs.push(...r.map((o) => o.name));
  if (r.length < 1000) break;
}
const tem = new Set(objs);
// só o que pode ABRIR carrossel: agenda (semana 8 em diante — as antigas já passaram), lista e promo
const videos = objs.filter((n) => /-feed[^/]*\.mp4$/i.test(n) && /^(lista-|promo-|ag-s([89]|\d\d+)-)/.test(n));
const faltam = videos.filter((n) => !tem.has(nomeCapa(n).split("/").pop()));
console.log(`vídeos de feed: ${videos.length} · sem capa: ${faltam.length}`);
mkdirSync("out/capas", { recursive: true });
for (const n of faltam) {
  const rel = `${PASTA}/${n}`;
  console.log((GRAVAR ? "capa " : "faltaria ") + nomeCapa(rel));
  if (!GRAVAR) continue;
  const local = `out/capas/${n}`;
  writeFileSync(local, Buffer.from(await (await fetch(`${URL}/storage/v1/object/public/butiquim-social/${rel}`)).arrayBuffer()));
  await sobeCapa({ url: URL, secret: c.secret_key, local, rel });
}
