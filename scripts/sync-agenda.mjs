// Puxa a agenda oficial (butiquim_social_posts, espelho da planilha) + o estilo de cada ARTISTA
// (butiquim_social_artistas.estilo) e grava src/agenda.json, que as peças leem.
// Uso: node scripts/sync-agenda.mjs 2026-10-01 2026-10-31
import { writeFileSync } from "fs";
import { credSupabase } from "./_cred.mjs";

const [de = "2026-10-01", ate = "2026-10-31"] = process.argv.slice(2);
const cred = credSupabase();
const H = { apikey: cred.secret_key, Authorization: `Bearer ${cred.secret_key}` };
const get = async (q) => {
  const r = await fetch(`${cred.project_url}/rest/v1/${q}`, { headers: H });
  if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  return r.json();
};

const slug = (s) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/&/g, " e ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const posts = await get(`butiquim_social_posts?select=data,atracao&tipo=eq.carrossel_dia&data=gte.${de}&data=lte.${ate}&order=data`);
const artistas = await get("butiquim_social_artistas?select=slug,nome,estilo,estilo_inferido");
const porSlug = Object.fromEntries(artistas.map((a) => [a.slug, a]));

const noites = posts.map((p) => {
  const s = slug(p.atracao || "");
  const a = porSlug[s];
  if (!a) console.warn(`! artista sem cadastro: ${p.atracao} (${s}) em ${p.data}`);
  else if (!a.estilo) console.warn(`! ${a.nome} sem estilo no cadastro`);
  return { data: p.data, atracao: p.atracao, slug: s, nome: a?.nome ?? p.atracao, estilo: a?.estilo ?? null, estilo_inferido: a?.estilo_inferido ?? null };
});

writeFileSync("src/agenda.json", JSON.stringify({ gerado_em: new Date().toISOString(), de, ate, noites }, null, 2));
console.log(noites.map((n) => `${n.data} ${n.nome} → ${n.estilo}${n.estilo_inferido ? " (inferido)" : ""}`).join("\n"));
