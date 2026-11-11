// Sobe as artes de promo prontas e coloca no rodízio da esteira (config fila_semana[dia].promos).
// Ordem do rodízio = motion 3 → motion 1 → motion 2 → estática; a posição vem da semana do ano (montador).
// --trocar-fila troca também o que já está agendado com a arte antiga, usando o motion 3.
// Uso: node scripts/promos-sobe.mjs --dia 6 --slug sab-smirnoff --antiga sab-promo-smirnoff [--trocar-fila] [--gravar]
import { readFileSync, existsSync } from "fs";
import { execFileSync } from "child_process";
import { credSupabase, FFMPEG } from "./_cred.mjs";
import { sobeCapa } from "./_capa.mjs";
const arg = (n) => (process.argv.includes(n) ? process.argv[process.argv.indexOf(n) + 1] : null);
const GRAVAR = process.argv.includes("--gravar");
const TROCAR = process.argv.includes("--trocar-fila");
const DIA = arg("--dia"), SLUGS = (arg("--slug") || "").split(",").filter(Boolean), ANTIGA = arg("--antiga");
if (!DIA || !SLUGS.length) throw new Error("informe --dia e --slug");
const cred = credSupabase();
const URL = cred.project_url.replace(/\/$/, "");
const H = { apikey: cred.secret_key, Authorization: `Bearer ${cred.secret_key}` };
const PUB = `${URL}/storage/v1/object/public/butiquim-social/`;
const O = "out/promos/final";
const sobe = async (local, destino) => {
  if (!existsSync(local)) throw new Error("falta " + local);
  console.log(GRAVAR ? "sobe" : "subiria", destino);
  if (!GRAVAR) return;
  const r = await fetch(`${URL}/storage/v1/object/butiquim-social/${destino}`, { method: "POST", headers: { ...H, "Content-Type": destino.endsWith(".mp4") ? "video/mp4" : "image/jpeg", "x-upsert": "true" }, body: readFileSync(local) });
  if (!r.ok) throw new Error(`${destino}: ${r.status} ${await r.text()}`);
  // promo em vídeo abre carrossel da esteira → capa (último quadro) ao lado; o publicador põe na frente
  if (/-feed[^/]*\.mp4$/i.test(destino)) await sobeCapa({ url: URL, secret: cred.secret_key, local, rel: destino });
};
const novas = [];
for (const slug of SLUGS) {
  const p = {};
  for (const fmt of ["feed", "story"]) {
    const j = `${O}/promo-${slug}-${fmt}-est.jpg`;
    execFileSync(FFMPEG, ["-v", "error", "-y", "-i", `${O}/promo-${slug}-${fmt}-est.png`, "-q:v", "2", j]);
    await sobe(j, `avulso/claude/promo-${slug}-${fmt}-est.jpg`);
    for (const v of ["c", "a", "b"]) await sobe(`${O}/promo-${slug}-${fmt}-${v}.mp4`, `avulso/claude/promo-${slug}-${fmt}-${v}.mp4`);
  }
  const par = (v, ext) => ({ feed: `avulso/claude/promo-${slug}-feed-${v}.${ext}`, story: `avulso/claude/promo-${slug}-story-${v}.${ext}` });
  novas.push([par("c", "mp4"), par("a", "mp4"), par("b", "mp4"), par("est", "jpg")]);
}
// com várias promos no mesmo dia: todas no motion 3, depois todas no motion 1...
// --gira N: gira a lista para o 1º item (motion 3) cair na posição N, que é a do próximo dia de show montado pela esteira
const plano = novas[0].flatMap((_, i) => novas.map((n) => n[i]));
const gira = +(arg("--gira") || 0);
const rodizio = plano.map((_, i) => plano[(i - gira + plano.length * 2) % plano.length]);

const [{ valor }] = await (await fetch(`${URL}/rest/v1/butiquim_social_config?select=valor&chave=eq.fila_semana`, { headers: H })).json();
const cfg = JSON.parse(valor);
cfg[DIA].promos = rodizio;
console.log(`fila_semana[${DIA}].promos =`, rodizio.map((p) => p.feed.split("/").pop()).join(", "));
if (GRAVAR) {
  const r = await fetch(`${URL}/rest/v1/butiquim_social_config?on_conflict=chave`, { method: "POST", headers: { ...H, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify({ chave: "fila_semana", valor: JSON.stringify(cfg) }) });
  if (!r.ok) throw new Error(`config ${r.status}`);
}

if (TROCAR && ANTIGA) {
  const rows = await (await fetch(`${URL}/rest/v1/butiquim_social_avulso?select=id,campanha,formato,video_url,itens_urls&status=eq.pendente&or=(video_url.like.*${ANTIGA}*,itens_urls.like.*${ANTIGA}*)`, { headers: H })).json();
  const slug = SLUGS[0];
  const tr = (s) => s && s.split(`avulso/${ANTIGA}-feed.jpg`).join(`avulso/claude/promo-${slug}-feed-c.mp4`).split(`avulso/${ANTIGA}-story.jpg`).join(`avulso/claude/promo-${slug}-story-c.mp4`);
  for (const r of rows) {
    const corpo = { video_url: tr(r.video_url), itens_urls: tr(r.itens_urls) };
    console.log(GRAVAR ? "troca" : "trocaria", r.id, r.campanha, r.formato, "→", corpo.video_url.split("/").pop(), corpo.itens_urls ? JSON.parse(corpo.itens_urls).map((u) => u.split("/").pop()).join(" ") : "");
    if (GRAVAR) {
      const p = await fetch(`${URL}/rest/v1/butiquim_social_avulso?id=eq.${r.id}`, { method: "PATCH", headers: { ...H, "Content-Type": "application/json", Prefer: "return=minimal" }, body: JSON.stringify(corpo) });
      if (!p.ok) throw new Error(`#${r.id}: ${p.status} ${await p.text()}`);
    }
  }
}
