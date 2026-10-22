// Confere que a rotação (scripts/_rotacao.mjs) devolve, para o que já foi produzido, exatamente a identidade usada (IDS do Root.tsx)
// e que a chave de cada noite segue o padrão dia+semana. Uso: node scripts/checa-rotacao.mjs
import { readFileSync } from "fs";
import { identidadeDe, chaveDe, noitesDataTs, noitesDoMes } from "./_rotacao.mjs";
const root = readFileSync("src/Root.tsx", "utf8");
const IDS = Object.fromEntries([...root.matchAll(/^\s*(\w+): (Sexta|Sabado|Domingo)(B|C|D)?,/gm)].map((m) => [m[1], m[3] || "A"]));
const noites = noitesDataTs();
let erros = 0;
for (const [k, d] of Object.entries(noites)) {
  if (k.startsWith("vespera")) continue;
  const esperado = IDS[k];
  const rot = identidadeDe(d), ch = chaveDe(d);
  const ok = (!esperado || esperado === rot) && ch === k;
  if (!ok) erros++;
  console.log(`${ok ? "✅" : "❌"} ${k.padEnd(10)} ${d} produzido=${esperado || "-"} rotação=${rot} chave=${ch}`);
}
console.log(erros ? `⚠️ ${erros} divergência(s)` : "✅ rotação bate com tudo que já foi produzido");
const nov = noitesDoMes("2026-11");
console.log("nov pela rotação:", nov.noites.map((n) => `${n.key}=${n.id}`).join(" "), "| agendas:", nov.agendas.map((a) => a.s).join(" ") || "-");
