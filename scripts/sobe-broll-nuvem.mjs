// Sobe public/broll/*.mp4 (fora do git, 239 MB) pro bucket PRIVADO butiquim-flyers-broll,
// de onde o refaz-noites.yml baixa só o vídeo do artista que precisa.
// Rodar de novo sempre que entrar B-roll novo (artista novo no catálogo de src/data.ts). Idempotente (upsert).
// Uso: node scripts/sobe-broll-nuvem.mjs [arquivo.mp4 ...]
import { readFileSync, readdirSync, statSync } from "fs";
import path from "path";

const cred = JSON.parse(readFileSync("C:/Users/User/Documents/projetos/.credentials/supabase-new-api-keys.json", "utf8"));
const URL = cred.project_url.replace(/\/$/, "");
const H = { apikey: cred.secret_key, Authorization: `Bearer ${cred.secret_key}` };
const DIR = path.resolve("public/broll");
const lista = process.argv.slice(2).length ? process.argv.slice(2) : readdirSync(DIR).filter((f) => f.endsWith(".mp4"));

for (const f of lista) {
  const local = path.join(DIR, path.basename(f));
  const mb = (statSync(local).size / 1048576).toFixed(1);
  const r = await fetch(`${URL}/storage/v1/object/butiquim-flyers-broll/${path.basename(f)}`, {
    method: "POST",
    headers: { ...H, "Content-Type": "video/mp4", "x-upsert": "true" },
    body: readFileSync(local),
  });
  console.log(`${r.ok ? "OK " : "ERRO"} ${path.basename(f)} (${mb} MB)${r.ok ? "" : " " + (await r.text()).slice(0, 200)}`);
}
