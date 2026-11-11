// Espera um post da fila sair (publicado/erro), com teto. Uso: node scripts/espera-publicacao.mjs <id> [teto_min=10]
import { credSupabase } from "./_cred.mjs";
const [id, teto = "10"] = process.argv.slice(2);
const c = credSupabase();
const H = { apikey: c.secret_key, Authorization: `Bearer ${c.secret_key}` };
const fim = Date.now() + Number(teto) * 60e3;
while (Date.now() < fim) {
  const [l] = await (await fetch(`${c.project_url.replace(/\/$/, "")}/rest/v1/butiquim_social_avulso?select=status,ig_media_id,erro&id=eq.${id}`, { headers: H })).json().catch(() => [{}]);
  if (l && (l.status === "publicado" || l.status === "erro" || (l.status === "pendente" && l.erro))) { console.log(`#${id}: ${l.status} ${l.ig_media_id || ""} ${l.erro || ""}`); process.exit(0); }
  await new Promise((r) => setTimeout(r, 20e3));
}
console.log(`#${id}: teto de ${teto} min sem publicar`);
