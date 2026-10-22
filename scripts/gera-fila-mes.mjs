// Gera scripts/fila-mes.mjs a partir do fila-novembro.mjs (mesmo modelo completo, mas noites/agendas/identidade vêm da rotação).
// Rodar uma vez (22/10/2026); depois editar fila-mes.mjs direto.
import { readFileSync, writeFileSync } from "fs";
let s = readFileSync("scripts/fila-novembro.mjs", "utf8");
const sub = (a, b) => { if (!s.includes(a)) throw new Error("não achou: " + a.slice(0, 70)); s = s.split(a).join(b); };

sub('// Fila de NOVEMBRO/2026 — junta os 3 modelos de outubro (agenda-fila + fila-extras + fila-modelo-completo) num script só.',
    '// Fila de um MÊS (modelo completo de novembro, generalizado em 22/10/2026): noites, agendas e identidade vêm de scripts/_rotacao.mjs\n// (rotação A/B/C/D por semana; agenda só com semana completa; fim de semana que vira o mês = uma semana).');
sub('// Uso: node scripts/fila-novembro.mjs (simula) · node scripts/fila-novembro.mjs --gravar',
    '// Uso: node scripts/fila-mes.mjs --mes 2026-12 (simula) · node scripts/fila-mes.mjs --mes 2026-12 --gravar');
sub('import { execFileSync } from "child_process";', 'import { execFileSync } from "child_process";\nimport { MESES, noitesDoMes } from "./_rotacao.mjs";');
sub('const GRAVAR = process.argv.includes("--gravar");',
    'const GRAVAR = process.argv.includes("--gravar");\nconst MES = process.argv[process.argv.indexOf("--mes") + 1];\nif (!/^\\d{4}-\\d{2}$/.test(MES || "")) throw new Error("informe --mes YYYY-MM");\nconst ABREV = MESES[+MES.slice(5) - 1];');
// noites e agendas: da rotação
const ini = s.indexOf("// noites: data, chave, identidade da semana, véspera (Folhinha)");
const fim = s.indexOf("const dataDe = ");
s = s.slice(0, ini) + `// noites: data, chave, identidade (rotação), véspera (Folhinha) — e agendas das semanas completas
const R = noitesDoMes(MES);
const NOITES = R.noites.map((n) => [n.data, n.key, n.id, n.vespera || undefined]);
const AGENDAS = R.agendas.map((a) => [a.terca, a.s, a.keys]);
for (const i of R.incompletas) log(\`⚠️ semana \${i.semana} incompleta (tem: \${i.tem.join(", ")}) — agenda de terça NÃO entra até a planilha fechar\`);
log(\`mês \${MES}: \${NOITES.length} noites (\${NOITES.map(([d, k, v]) => \`\${d.slice(8)} \${k}=\${v}\`).join(", ")}) · agendas: \${AGENDAS.map((a) => a[1]).join(", ") || "nenhuma"}\`);
` + s.slice(fim);
sub('or=(campanha.like.extra-claude-nov-*,campanha.like.agenda-claude-*-2026-11-*)', 'or=(campanha.like.extra-claude-${ABREV}-*,campanha.like.agenda-claude-*-${MES}-*)');
sub('`extra-claude-nov-', '`extra-claude-${ABREV}-');
// lista: A→B, B→A, C→B, D→A (sempre a variante "oposta" em cor)
sub('const outra = v === "A" ? "B" : "A";', 'const outra = v === "A" || v === "C" ? "B" : "A";');
writeFileSync("scripts/fila-mes.mjs", s);
console.log("ok scripts/fila-mes.mjs");
