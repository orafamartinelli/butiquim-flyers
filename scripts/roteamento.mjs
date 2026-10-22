// Roteamento de identidades: para cada sex/sáb/dom do período, qual identidade a noite recebe (fixa pela data — src/rotacao.ts),
// quem toca (planilha) e o estado (pronto / cadastrado sem render / aguardando planilha). Gera HTML no Drive.
// Uso: node scripts/roteamento.mjs 2026-11-01 2027-01-31   (roda sync-agenda antes, se quiser a planilha fresca)
import { existsSync, readFileSync, mkdirSync, writeFileSync } from "fs";
import { semanaDe, identidadeDe, chaveDe, diaDe, agendaVersao, tercaDe, noitesDataTs } from "./_rotacao.mjs";

const [de = "2026-11-01", ate = "2027-01-31"] = process.argv.slice(2);
const agenda = JSON.parse(readFileSync("src/agenda.json", "utf8")).noites;
const cadastradas = noitesDataTs();
const NOME = {
  sexta: { A: "Placa de Esquina", B: "Painel de Embarque", C: "Lambe-lambe", D: "Mesa do Butica" },
  sabado: { A: "Esquina de Vidro", B: "Lado A (vinil)", C: "Lousa do Butica", D: "Gibi do Butica" },
  domingo: { A: "Rótulo da Última Rodada", B: "Letreiro Neon", C: "Comanda" },
};
const DIA = { sexta: "sex", sabado: "sáb", domingo: "dom" };
const linhas = [];
for (let d = new Date(`${de}T12:00:00Z`); d.toISOString().slice(0, 10) <= ate; d.setUTCDate(d.getUTCDate() + 1)) {
  const iso = d.toISOString().slice(0, 10);
  const dia = diaDe(iso);
  if (!dia) continue;
  const key = chaveDe(iso), id = identidadeDe(iso), s = semanaDe(iso);
  const a = agenda.find((x) => x.data === iso);
  const pronta = existsSync(`out/final/${key}-FEED.png`) && existsSync(`out/final/${key}-STORY-BROLL.mp4`);
  const estado = !a ? "aguardando planilha" : pronta ? "pronta" : cadastradas[key] ? "cadastrada, falta render" : "falta cadastrar (1 linha no data.ts)";
  linhas.push({ data: iso, dia, s, key, id, nome: NOME[dia][id], artista: a?.nome || "—", estado });
}
// semanas: agenda de terça
const semanas = {};
for (const l of linhas) (semanas[l.s] ??= []).push(l);
const agendas = Object.entries(semanas).map(([s, ls]) => {
  const completa = ls.every((l) => l.artista !== "—");
  const pronta = existsSync(`out/agendas/agenda-s${s}-FEED.mp4`);
  return { s: +s, terca: tercaDe(+s), versao: agendaVersao(+s), completa, pronta, faltam: ls.filter((l) => l.artista === "—").map((l) => `${DIA[l.dia]} ${l.data.slice(8)}/${l.data.slice(5, 7)}`) };
});

// console
for (const l of linhas) console.log(`${l.data} ${DIA[l.dia]} sem${String(l.s).padStart(2)}  ${l.id} ${l.nome.padEnd(24)} ${l.artista.padEnd(22)} ${l.estado}`);
for (const a of agendas) console.log(`agenda s${a.s} (ter ${a.terca.slice(8)}/${a.terca.slice(5, 7)}, ${a.versao}): ${a.completa ? (a.pronta ? "pronta" : "semana completa, falta render") : `aguardando ${a.faltam.join(", ")}`}`);

// html
const COR = { A: "#C8D200", B: "#FF2E93", C: "#F2EEDC", D: "#FFD60A" };
const cls = (e) => (e === "pronta" ? "ok" : e.startsWith("aguardando") ? "wait" : "todo");
const MES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const rows = Object.entries(semanas).map(([s, ls]) => {
  const ag = agendas.find((a) => a.s === +s);
  const cells = ["sexta", "sabado", "domingo"].map((dia) => {
    const l = ls.find((x) => x.dia === dia);
    if (!l) return `<td class="off">—</td>`;
    return `<td class="${cls(l.estado)}"><div class="data">${DIA[dia]} ${l.data.slice(8)}/${l.data.slice(5, 7)}</div><div class="id" style="--c:${COR[l.id]}">${l.id} · ${l.nome}</div><div class="art">${l.artista}</div><div class="est">${l.estado}</div></td>`;
  }).join("");
  const agCell = `<td class="${ag.completa ? (ag.pronta ? "ok" : "todo") : "wait"}"><div class="data">ter ${ag.terca.slice(8)}/${ag.terca.slice(5, 7)}</div><div class="id" style="--c:#aaa">${ag.versao}</div><div class="est">${ag.completa ? (ag.pronta ? "pronta" : "semana completa, falta render") : "sai quando fechar: falta " + ag.faltam.join(", ")}</div></td>`;
  return `<tr><th>sem ${s}<br><small>${MES[new Date(ls[0].data + "T12:00:00Z").getUTCMonth()]}</small></th>${agCell}${cells}</tr>`;
}).join("");
const html = `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Roteamento de identidades</title>
<style>body{margin:0;padding:24px 16px;background:#111;color:#eee;font:14px system-ui,sans-serif}h1{font-size:22px;margin:0 0 6px}p{color:#aaa;margin:0 0 14px;line-height:1.4}
table{border-collapse:separate;border-spacing:6px;width:100%}th{color:#aaa;font-weight:600;text-align:left;vertical-align:top;padding:8px 4px;width:70px}th small{color:#666}
td{vertical-align:top;padding:10px;border-radius:8px;background:#1b1b1b;border-left:5px solid #333;width:24%}td.ok{border-left-color:#4caf50}td.wait{border-left-color:#ff9800}td.todo{border-left-color:#2196f3}td.off{background:transparent;color:#444}
.data{font-weight:700}.id{margin:4px 0;color:var(--c)}.art{color:#ddd}.est{font-size:12px;color:#999;margin-top:4px}
.leg span{display:inline-block;margin-right:14px}.leg i{display:inline-block;width:12px;height:12px;border-radius:3px;margin-right:5px;vertical-align:-1px}</style>
<h1>Butiquim — roteamento de identidades (${de.slice(8)}/${de.slice(5, 7)} a ${ate.slice(8)}/${ate.slice(5, 7)})</h1>
<p>A identidade de cada noite é fixada pela semana do calendário (A → B → C → D; domingo A → B → C). Noite vazia na planilha já tem a identidade reservada:
quando o Victor preencher, a peça nasce com ela. Agenda de terça só sai com a semana completa (sex, sáb e dom).</p>
<p class="leg"><span><i style="background:#4caf50"></i>pronta</span><span><i style="background:#ff9800"></i>aguardando planilha</span><span><i style="background:#2196f3"></i>falta produzir</span></p>
<table><tr><th></th><th>agenda (terça)</th><th>sexta</th><th>sábado</th><th>domingo</th></tr>${rows}</table></html>`;
const DEST = "G:/Meu Drive/02 O Butiquim/Agenda Claude";
mkdirSync(DEST, { recursive: true });
writeFileSync(`${DEST}/Roteamento de identidades.html`, html);
console.log(`${DEST}/Roteamento de identidades.html`);
