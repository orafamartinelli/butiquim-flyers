// Revisão: confere datas × artistas das peças e da fila pendente contra a planilha (butiquim_social_posts).
// Uso: node scripts/revisa-datas-artistas.mjs   (só leitura)
import { readFileSync } from "fs";

const cred = JSON.parse(readFileSync("C:/Users/User/Documents/projetos/.credentials/supabase-new-api-keys.json", "utf8"));
const H = { apikey: cred.secret_key, Authorization: `Bearer ${cred.secret_key}` };
const get = async (q) => (await fetch(`${cred.project_url}/rest/v1/${q}`, { headers: H })).json();
const slug = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/&/g, " e ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const planilha = await get("butiquim_social_posts?select=data,atracao&tipo=eq.carrossel_dia&data=gte.2026-10-14&data=lte.2026-12-31&order=data");
const artistas = await get("butiquim_social_artistas?select=slug,instagram");
const igDe = Object.fromEntries(artistas.map((a) => [a.slug, a.instagram]));
const verdade = Object.fromEntries(planilha.map((p) => [p.data, { nome: p.atracao, ig: igDe[slug(p.atracao)] }]));
let erros = 0;
const erro = (m) => { erros++; console.log("❌ " + m); };

// 1) composições (data.ts via agenda.json) — chave → data → artista
const agenda = JSON.parse(readFileSync("src/agenda.json", "utf8")).noites;
// chaves e datas lidas do próprio projeto (src/data.ts): toda noite produzida entra na revisão
const hojeISO = new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10);
const MAPA = Object.fromEntries([...readFileSync("src/data.ts", "utf8").matchAll(/^\s*(\w+): noiteDe\("(\d{4}-\d{2}-\d{2})"\)/gm)].map((m) => [m[1], m[2]]).filter(([, d]) => d >= hojeISO));
console.log("== peças (chave → data → artista na peça × planilha)");
for (const [k, d] of Object.entries(MAPA)) {
  const a = agenda.find((x) => x.data === d);
  const ok = a && verdade[d] && slug(a.atracao) === slug(verdade[d].nome);
  console.log(`${ok ? "✅" : "❌"} ${k.padEnd(9)} ${d} peça=${a?.nome} planilha=${verdade[d]?.nome}`);
  if (!ok) erros++;
}

// 2) fila pendente: cada post com artista marcado/legenda → bate com a data do show?
// mapa arquivo → data do show
const ARQ = MAPA;
const fila = await get(`butiquim_social_avulso?select=id,campanha,publicar_em,formato,video_url,marcados,legenda&status=eq.pendente&order=publicar_em`);
console.log(`\n== fila pendente (${fila.length} linhas): arquivo × marcação × legenda`);
for (const r of fila) {
  const arq = (r.video_url || "").split("/").pop();
  const k = Object.keys(ARQ).find((x) => arq.startsWith(x + "-"));
  if (k) {
    const v = verdade[ARQ[k]];
    if (r.marcados && v?.ig && !r.marcados.split(",").includes(v.ig)) erro(`#${r.id} ${r.campanha} ${arq} marca ${r.marcados}, show ${ARQ[k]} é ${v.nome} (@${v.ig})`);
  }
  if (/papo/i.test(`${r.legenda} ${r.marcados}`)) erro(`#${r.id} ${r.campanha} ainda cita Papo 10`);
  // legenda "HOJE tem X" deve bater com o show do dia da publicação
  const m = (r.legenda || "").match(/HOJE tem ([^(\n]+?) \(@/);
  if (m) {
    const dia = new Date(new Date(r.publicar_em).getTime() - 3 * 3600e3).toISOString().slice(0, 10);
    if (verdade[dia] && slug(m[1]) !== slug(verdade[dia].nome)) erro(`#${r.id} ${dia} legenda "HOJE tem ${m[1]}" mas planilha = ${verdade[dia].nome}`);
  }
}
console.log(`\n${erros ? `⚠️ ${erros} problema(s)` : "✅ nenhuma confusão de data × artista"}`);
