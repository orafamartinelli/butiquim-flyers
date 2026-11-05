// Etiqueta cada post PENDENTE da fila com as datas dos shows que ele divulga (butiquim_social_avulso.datas_show).
// É isso que permite ao leitor da agenda (n8n, 7h) retirar da fila tudo de uma noite quando a planilha troca o artista.
// Regras (só pelos arquivos do post, sem adivinhar):
//   - arquivo de uma noite (<chave>-feed/story/broll, ex. sexta5-story.jpg, vespera2-feed.mp4) → data daquela noite
//   - agenda da semana (ag-sN-*) → todas as noites daquela agenda
//   - legenda "HOJE tem X" → data da publicação (BRT)
//   - arte genérica de LISTA sem artista → sem etiqueta (não depende de quem toca)
// Chaves e datas vêm do próprio projeto: src/data.ts (NOITES) e src/Root.tsx (agendas sN).
// Uso: node scripts/etiqueta-datas-show.mjs (simula) · node scripts/etiqueta-datas-show.mjs --gravar
import { readFileSync } from "fs";
import { noitesDoMes } from "./_rotacao.mjs";

const GRAVAR = process.argv.includes("--gravar");
const cred = JSON.parse(readFileSync("C:/Users/User/Documents/projetos/.credentials/supabase-new-api-keys.json", "utf8"));
const URL = cred.project_url.replace(/\/$/, "");
const H = { apikey: cred.secret_key, Authorization: `Bearer ${cred.secret_key}`, "Content-Type": "application/json" };

const data = readFileSync("src/data.ts", "utf8");
const NOITE = Object.fromEntries([...data.matchAll(/^\s*(\w+): noiteDe\("(\d{4}-\d{2}-\d{2})"\)/gm)].map((m) => [m[1], m[2]]));
const root = readFileSync("src/Root.tsx", "utf8");
const AGENDA = Object.fromEntries(
  [...root.matchAll(/\["(s\d+)", Agenda\w+, "[^"]*", \[([^\]]+)\]\]/g)].map((m) => [m[1], [...m[2].matchAll(/NOITES\.(\w+)/g)].map((x) => NOITE[x[1]])]),
);
// a Folhinha da véspera vem de src/entries/vespera (vespera = vespera1)
if (NOITE.vespera1) NOITE.vespera = NOITE.vespera1;
// agendas automáticas (semanas ≥ 10, Root.tsx AGENDAS_AUTO): vêm da rotação, não do regex acima
for (let m = 0; m < 18; m++) {
  const d = new Date(Date.UTC(2026, 10 + m, 1));
  for (const a of noitesDoMes(d.toISOString().slice(0, 7)).agendas) AGENDA[a.s] ??= a.datas;
}

const datasDe = (r) => {
  const s = new Set();
  const arqs = [r.video_url, ...(r.itens_urls ? JSON.parse(r.itens_urls) : [])].filter(Boolean).map((u) => u.split("/").pop());
  for (const a of arqs) {
    const ag = a.match(/^ag-(s\d+)-/);
    if (ag && AGENDA[ag[1]]) AGENDA[ag[1]].forEach((d) => s.add(d));
    const n = a.match(/^([a-z]+\d*)-(feed|story|broll)\./);
    if (n && NOITE[n[1]]) s.add(NOITE[n[1]]);
  }
  if (/HOJE tem /.test(r.legenda || "")) s.add(new Date(new Date(r.publicar_em).getTime() - 3 * 3600e3).toISOString().slice(0, 10));
  return [...s].sort();
};

const r = await fetch(`${URL}/rest/v1/butiquim_social_avulso?select=id,campanha,publicar_em,video_url,itens_urls,legenda,datas_show&status=eq.pendente&order=publicar_em`, { headers: H });
const fila = await r.json();
let mudou = 0;
for (const p of fila) {
  const novo = datasDe(p);
  const atual = (p.datas_show || []).slice().sort();
  if (JSON.stringify(novo) === JSON.stringify(atual)) continue;
  mudou++;
  console.log(`#${p.id} ${p.campanha.padEnd(32)} ${(p.video_url || "").split("/").pop().padEnd(28)} → ${novo.join(",") || "(genérico)"}`);
  if (GRAVAR) {
    const u = await fetch(`${URL}/rest/v1/butiquim_social_avulso?id=eq.${p.id}`, { method: "PATCH", headers: H, body: JSON.stringify({ datas_show: novo.length ? novo : null }) });
    if (!u.ok) throw new Error(`#${p.id}: ${u.status} ${await u.text()}`);
  }
}
console.log(`\n${fila.length} pendentes · ${mudou} ${GRAVAR ? "etiquetados" : "a etiquetar (simulação — rode com --gravar)"}`);
