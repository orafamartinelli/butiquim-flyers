// Rotação das identidades (decisão do Rafa 20/10 e 22/10/2026) — versão JS, espelho de src/rotacao.ts (manter as duas iguais).
// Semana = contada a partir da sexta 02/10/2026 (semana 1), de segunda a domingo.
// Semanas 1–9 (out–nov) alternam A/B como foram produzidas; da semana 10 (04/12/2026) em diante gira C → D → A → B
// (domingo só tem 3 identidades: gira C → A → B). Agenda de terça: V1 → V2 → V3 pela semana.
import { readFileSync } from "fs";

const SEMANA1 = Date.UTC(2026, 8, 28); // segunda 28/09/2026
const soma = (d, n) => { const x = new Date(`${d}T12:00:00Z`); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
const utc = (data) =>Date.UTC(+data.slice(0, 4), +data.slice(5, 7) - 1, +data.slice(8, 10));
export const semanaDe = (data) => Math.floor((utc(data) - SEMANA1) / (7 * 86400e3)) + 1;
export const diaDe = (data) => ({ 4: "quinta", 5: "sexta", 6: "sabado", 0: "domingo" })[new Date(utc(data)).getUTCDay()];
export const identidadeDe = (data) => {
  const s = semanaDe(data);
  if (s <= 9) return s % 2 ? "A" : "B";
  return diaDe(data) === "domingo" ? ["C", "A", "B"][(s - 10) % 3] : ["C", "D", "A", "B"][(s - 10) % 4];
};
export const agendaVersao = (s) => ["V1", "V2", "V3"][(s - 1) % 3];
export const chaveDe = (data) => { const s = semanaDe(data); return s === 1 ? diaDe(data) : `${diaDe(data)}${s}`; };
// terça da agenda da semana s (semana começa na segunda)
export const tercaDe = (s) => new Date(SEMANA1 + ((s - 1) * 7 + 1) * 86400e3).toISOString().slice(0, 10);
// artistas sem nenhum vídeo próprio (projeto pontual, Rafa 04/11/2026): o story "vídeo do artista" vira o story animado do flyer
export const ARTISTAS_SEM_VIDEO = new Set(["butiquinta-encontro-do-free", "gaelzinho-everton-cabeca-k"]);
// sem designer: de dezembro em diante a agenda de segunda é a nossa versão A (composição agenda-sN-seg-*)
export const SEM_DESIGNER_DESDE = "2026-12-01";
export const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

// noites cadastradas em src/data.ts (chave → data), inclusive vésperas
export const noitesDataTs = () =>
  Object.fromEntries([...readFileSync("src/data.ts", "utf8").matchAll(/^\s*(\w+): noiteDe\("(\d{4}-\d{2}-\d{2})"\)/gm)].map((m) => [m[1], m[2]]));

// AGENDA DE SEMANA INCOMPLETA (11/11/2026 — a de 13–15/11 não saiu porque a sexta 13 ficou vazia na planilha):
// semana completa entra sempre; semana com 2+ noites e alguma vazia entra a partir do DOMINGO anterior à terça
// (prazo para a planilha fechar) e até a última noite — com o que tiver. Antes do prazo, espera a planilha.
export const PRAZO_AGENDA_DIAS = 2; // terça − 2 = domingo
export const hojeBRT = () => new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10);

// noites do mês (YYYY-MM): toda noite cuja SEMANA tem a sexta dentro do mês (fim de semana que vira o mês = uma semana)
export const noitesDoMes = (mes, hoje = hojeBRT()) => {
  const todas = noitesDataTs();
  const sextaDaSemana = (s) => new Date(SEMANA1 + ((s - 1) * 7 + 4) * 86400e3).toISOString().slice(0, 7);
  const noites = Object.entries(todas)
    // véspera em quinta é noite própria (só existe como Folhinha); nos outros dias a véspera é um extra da noite
    .filter(([k, d]) => !k.startsWith("vespera") || diaDe(d) === "quinta")
    .filter(([, d]) => sextaDaSemana(semanaDe(d)) === mes)
    .map(([k, d]) => ({ key: k, data: d, semana: semanaDe(d), dia: diaDe(d), id: identidadeDe(d), vespera: Object.keys(todas).find((v) => v.startsWith("vespera") && todas[v] === d) || null }))
    .sort((a, b) => a.data.localeCompare(b.data));
  // agendas: semana completa (sex, sáb e dom cadastrados) ou incompleta já no prazo (ver PRAZO_AGENDA_DIAS)
  const porSemana = {};
  for (const n of noites) (porSemana[n.semana] ??= []).push(n);
  const completa = (ns) => ["sexta", "sabado", "domingo"].every((d) => ns.some((n) => n.dia === d));
  const noPrazo = (s, ns) => ns.length >= 2 && hoje >= soma(tercaDe(+s), -PRAZO_AGENDA_DIAS) && hoje <= ns[ns.length - 1].data;
  const agendas = Object.entries(porSemana)
    .filter(([s, ns]) => completa(ns) || noPrazo(s, ns))
    .map(([s, ns]) => ({ s: `s${s}`, semana: +s, terca: tercaDe(+s), versao: agendaVersao(+s), keys: ns.map((n) => n.key), datas: ns.map((n) => n.data), incompleta: !completa(ns), seg: ns[0].data >= SEM_DESIGNER_DESDE ? new Date(utc(tercaDe(+s)) - 86400e3).toISOString().slice(0, 10) : null }));
  const incompletas = Object.entries(porSemana).filter(([s]) => !agendas.some((a) => a.semana === +s)).map(([s, ns]) => ({ semana: +s, terca: tercaDe(+s), prazo: soma(tercaDe(+s), -PRAZO_AGENDA_DIAS), tem: ns.map((n) => n.dia) }));
  return { noites, agendas, incompletas };
};

if (process.argv[1] && process.argv[1].endsWith("_rotacao.mjs")) {
  const mes = process.argv[2] || new Date().toISOString().slice(0, 7);
  console.log(JSON.stringify(noitesDoMes(mes), null, 2));
}
