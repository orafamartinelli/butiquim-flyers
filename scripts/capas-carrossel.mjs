// CAPAS DE CARROSSEL (11/11/2026, regra do Rafa: "não podemos ter nenhum material assim").
// O Instagram usa o 1º QUADRO do 1º slide como miniatura na grade; nossos vídeos (agenda, lista B, promos)
// começam vazios/pretos e só ficam completos no fim. Este robô varre a fila (butiquim_social_avulso) e, em todo
// CARROSSEL pendente cujo 1º slide é vídeo, põe na frente uma CAPA = último quadro do vídeo (arte completa).
// Vale para qualquer origem (fila-mes, montador da esteira, agenda do designer). Idempotente.
// Uso: node scripts/capas-carrossel.mjs [--gravar]      (sem --gravar só lista)
//      --checar → só diz se tem trabalho (GITHUB_OUTPUT tem=sim|nao), sem precisar de ffmpeg
import { writeFileSync, readFileSync, mkdirSync, appendFileSync } from "fs";
import { execFileSync } from "child_process";
import { credSupabase, FFMPEG } from "./_cred.mjs";

const GRAVAR = process.argv.includes("--gravar");
const CHECAR = process.argv.includes("--checar");
const c = credSupabase();
const URL = c.project_url.replace(/\/$/, "");
const H = { apikey: c.secret_key, Authorization: `Bearer ${c.secret_key}` };
const PUB = `${URL}/storage/v1/object/public/butiquim-social/`;
const rest = async (p, o = {}) => { const r = await fetch(`${URL}/rest/v1/${p}`, { ...o, headers: { ...H, "Content-Type": "application/json", Prefer: "return=representation", ...(o.headers || {}) } }); if (!r.ok) throw new Error(`${r.status} ${await r.text()}`); return r.json(); };
const ehVideo = (u) => /\.(mp4|mov)(\?|$)/i.test(u || "");

const desde = new Date(Date.now() + 3 * 60e3).toISOString(); // não mexe no que o publicador está pegando agora
const linhas = await rest(`butiquim_social_avulso?select=id,campanha,publicar_em,itens_urls&formato=eq.CAROUSEL&status=eq.pendente&publicar_em=gt.${desde}&order=publicar_em&limit=1000`);
const alvo = linhas.filter((l) => { try { return ehVideo(JSON.parse(l.itens_urls || "[]")[0]); } catch { return false; } });
console.log(`carrosséis pendentes: ${linhas.length} · começam com vídeo: ${alvo.length}`);
if (CHECAR) { if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `tem=${alvo.length ? "sim" : "nao"}\n`); process.exit(0); }

mkdirSync("out/capas", { recursive: true });
const capaDe = {};
const fazCapa = async (video) => {
  if (capaDe[video]) return capaDe[video];
  // nome da capa leva a etag do vídeo: se o vídeo for trocado com o mesmo nome, nasce outra capa (Instagram não pega cache velho)
  const head = await fetch(video, { method: "HEAD" });
  if (!head.ok) throw new Error(`vídeo fora do bucket (${head.status}): ${video}`);
  const etag = String(head.headers.get("etag") || Date.now()).replace(/[^a-z0-9]/gi, "").slice(0, 8);
  const rel = video.replace(PUB, "").replace(/\.(mp4|mov)$/i, `-capa-${etag}.jpg`);
  const pub = PUB + rel;
  if (!(await fetch(pub, { method: "HEAD" })).ok) {
    const local = `out/capas/${rel.split("/").pop().replace(/\.jpg$/, "")}`;
    writeFileSync(`${local}.mp4`, Buffer.from(await (await fetch(video)).arrayBuffer()));
    // último quadro = arte completa (o 1º é vazio); -sseof pega 0,1 s antes do fim
    execFileSync(FFMPEG, ["-v", "error", "-y", "-sseof", "-0.1", "-i", `${local}.mp4`, "-frames:v", "1", "-q:v", "2", `${local}.jpg`]);
    if (GRAVAR) {
      const up = await fetch(`${URL}/storage/v1/object/butiquim-social/${rel}`, { method: "POST", headers: { ...H, "Content-Type": "image/jpeg", "x-upsert": "true" }, body: readFileSync(`${local}.jpg`) });
      if (!up.ok) throw new Error(`upload ${rel}: ${up.status} ${await up.text()}`);
    }
  }
  return (capaDe[video] = pub);
};

let feitos = 0;
for (const l of alvo) {
  const itens = JSON.parse(l.itens_urls);
  const capa = await fazCapa(itens[0]);
  const novos = [capa, ...itens].slice(0, 10); // Instagram aceita até 10 slides
  console.log(`#${l.id} ${l.campanha} ${l.publicar_em.slice(0, 16)} → capa ${capa.split("/").pop()}${itens.length >= 10 ? " (último slide saiu: limite de 10)" : ""}`);
  if (GRAVAR) { await rest(`butiquim_social_avulso?id=eq.${l.id}&status=eq.pendente`, { method: "PATCH", body: JSON.stringify({ itens_urls: JSON.stringify(novos) }) }); feitos++; }
}
console.log(GRAVAR ? `capas aplicadas: ${feitos}` : "(simulação — rode com --gravar)");
