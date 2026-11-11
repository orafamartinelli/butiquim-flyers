// ESTOQUE DE VÍDEOS SEM CAPA (11/11/2026) — reprocessa vídeos de feed que JÁ estão no bucket para abrirem com a arte
// completa (scripts/_capa.mjs). Daqui pra frente isso acontece sozinho no upload (fila-mes / promos-sobe).
// Só o que ainda pode virar miniatura: agendas da semana 8 em diante, listas e promos. Pula o que já tem a marca.
// Uso: node scripts/capas-carrossel.mjs [--gravar]
import { writeFileSync, readFileSync, mkdirSync } from "fs";
import { credSupabase } from "./_cred.mjs";
import { comCapaNoInicio } from "./_capa.mjs";

const GRAVAR = process.argv.includes("--gravar");
const c = credSupabase();
const URL = c.project_url.replace(/\/$/, "");
const H = { apikey: c.secret_key, Authorization: `Bearer ${c.secret_key}` };
const PASTA = "avulso/claude";
const objs = [];
for (let off = 0; ; off += 1000) {
  const r = await (await fetch(`${URL}/storage/v1/object/list/butiquim-social`, { method: "POST", headers: { ...H, "Content-Type": "application/json" }, body: JSON.stringify({ prefix: PASTA, limit: 1000, offset: off }) })).json();
  objs.push(...r.map((o) => o.name));
  if (r.length < 1000) break;
}
const videos = objs.filter((n) => /-feed[^/]*\.mp4$/i.test(n) && /^(lista-|promo-|ag-s([89]|\d\d+)-)/.test(n));
console.log(`vídeos de feed a conferir: ${videos.length}`);
mkdirSync("out/capas", { recursive: true });
let feitos = 0;
for (const n of videos) {
  const rel = `${PASTA}/${n}`;
  const local = `out/capas/${n}`;
  writeFileSync(local, Buffer.from(await (await fetch(`${URL}/storage/v1/object/public/butiquim-social/${rel}?t=${Date.now()}`)).arrayBuffer()));
  const novo = comCapaNoInicio(local);
  if (novo === local) { console.log(`ok (já tem) ${n}`); continue; }
  console.log(`${GRAVAR ? "capa" : "faria"} ${n}`);
  if (!GRAVAR) continue;
  const r = await fetch(`${URL}/storage/v1/object/butiquim-social/${rel}`, { method: "POST", headers: { ...H, "Content-Type": "video/mp4", "x-upsert": "true" }, body: readFileSync(novo) });
  if (!r.ok) throw new Error(`upload ${rel}: ${r.status} ${await r.text()}`);
  feitos++;
}
console.log(GRAVAR ? `reprocessados: ${feitos}` : "(simulação — rode com --gravar)");
