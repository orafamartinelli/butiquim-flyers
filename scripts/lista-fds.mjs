// Lista compacta da fila de um intervalo (para classificar a faxina): id, dia, hora, formato, campanha, arquivos.
// Uso: node scripts/lista-fds.mjs 2026-10-16 2026-10-18
import { readFileSync } from "fs";
const [de = "2026-10-16", ate = "2026-10-18"] = process.argv.slice(2);
const cred = JSON.parse(readFileSync("C:/Users/User/Documents/projetos/.credentials/supabase-new-api-keys.json", "utf8"));
const H = { apikey: cred.secret_key, Authorization: `Bearer ${cred.secret_key}` };
const q = `select=id,campanha,publicar_em,formato,video_url,itens_urls,legenda&publicar_em=gte.${encodeURIComponent(de + "T00:00:00-03:00")}&publicar_em=lte.${encodeURIComponent(ate + "T23:59:59-03:00")}&status=in.(pendente,publicado)&order=publicar_em`;
const fila = await (await fetch(`${cred.project_url}/rest/v1/butiquim_social_avulso?${q}`, { headers: H })).json();
for (const r of fila) {
  const d = new Date(new Date(r.publicar_em).getTime() - 3 * 3600e3).toISOString();
  const arqs = (r.itens_urls ? JSON.parse(r.itens_urls) : [r.video_url]).map((u) => u.split("/").pop()).join(" + ");
  console.log(`#${r.id} ${d.slice(5, 10)} ${d.slice(11, 16)} ${r.formato.padEnd(8)} ${r.campanha.padEnd(30)} ${arqs} | ${(r.legenda || "").split("\n")[0].slice(0, 60)}`);
}
