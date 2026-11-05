// NOITES NOVAS (04/11/2026, pedido do Rafa) — noite que entra na planilha vira peça e agendamento NA NUVEM, sem ninguém pedir.
//
// Vale para sex/sáb/dom e para QUINTA de véspera de feriado. Só ARTE e AGENDAMENTO no Instagram:
// NÃO cria disparo de WhatsApp (decisão do Rafa: véspera sem disparo automático) e NÃO cria campanha paga de quinta.
//
// O que faz (workflow refaz-noites.yml, despertador 10h05):
//   1. acha na planilha (butiquim_social_posts) as noites dos próximos 70 dias que ainda não estão em src/data.ts;
//   2. confere o material: artista no catálogo (foto + vídeo em src/data.ts) e estilo no cadastro; quinta precisa de feriado no dia seguinte.
//      Faltou? avisa o Rafa UMA vez por noite+artista (foto vem do PSD do designer: trabalho humano) e tenta de novo no dia seguinte;
//   3. acrescenta a noite em src/data.ts (e a Folhinha, se for véspera), renderiza a noite e a agenda da semana;
//   4. fila-mes.mjs --noites: sobe as peças e agenda os posts (quinta = logística de abertura, sem vídeo do artista);
//   5. grava o código de volta no repositório e manda o resumo ao Rafa.
//
// Uso:  node scripts/noites-novas.mjs --checar  → só diz se há noite pronta para produzir (GITHUB_OUTPUT tem=sim|nao) e avisa o que falta
//       node scripts/noites-novas.mjs           → produz
// Ensaio: ENSAIO=1 NOVAS=2026-12-05 → renderiza e simula a fila; não grava na fila, no banco nem no repositório; resumo vai com [TESTE].
import { readFileSync, writeFileSync, appendFileSync, mkdirSync, existsSync } from "fs";
import { execFileSync } from "child_process";
import os from "os";
import { credSupabase } from "./_cred.mjs";
import { ARTISTAS_SEM_VIDEO, chaveDe, noitesDataTs, noitesDoMes } from "./_rotacao.mjs";

const env = process.env;
const CHECAR = process.argv.includes("--checar");
const ENSAIO = env.ENSAIO === "1";
const FORCADAS = (env.NOVAS || "").split(",").map((s) => s.trim()).filter(Boolean);
const RAFA = "5544984232574";
const PRE = ENSAIO ? "[TESTE] " : "";
const cred = credSupabase();
const URL = cred.project_url.replace(/\/$/, "");
const H = { apikey: cred.secret_key, Authorization: `Bearer ${cred.secret_key}` };
const log = (...a) => console.log(...a);

const rest = async (p, opts = {}) => {
  const r = await fetch(`${URL}/rest/v1/${p}`, { ...opts, headers: { ...H, "Content-Type": "application/json", Prefer: "return=representation", ...(opts.headers || {}) } });
  if (!r.ok) throw new Error(`${p.split("?")[0]} → ${r.status} ${(await r.text()).slice(0, 200)}`);
  return r.status === 204 ? null : r.json();
};
const zap = async (msg) => {
  if (!env.ZAPI_INSTANCE_ID) { log(`[sem Z-API] ${PRE}${msg}`); return; }
  const r = await fetch(`https://api.z-api.io/instances/${env.ZAPI_INSTANCE_ID}/token/${env.ZAPI_INSTANCE_TOKEN}/send-text`, {
    method: "POST", headers: { "Content-Type": "application/json", "Client-Token": env.ZAPI_CLIENT_TOKEN }, body: JSON.stringify({ phone: RAFA, message: PRE + msg }) });
  log(`zap Rafa: HTTP ${r.status}`);
};

const hojeBR = new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10);
const soma = (d, n) => { const x = new Date(`${d}T12:00:00Z`); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
const ddmm = (d) => `${d.slice(8)}/${d.slice(5, 7)}`;
const dow = (d) => new Date(`${d}T12:00:00Z`).getUTCDay();
const DIA = { 4: "Quinta", 5: "Sexta", 6: "Sábado", 0: "Domingo" };
// mesmo cálculo de slug do sync-agenda.mjs
const slugDe = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/&/g, " e ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// ---------- 1. o que entrou na planilha ----------
const posts = await rest(`butiquim_social_posts?select=data,atracao,status&tipo=eq.carrossel_dia&data=gte.${hojeBR}&data=lte.${soma(hojeBR, 70)}&order=data`);
const NOITES_TS = noitesDataTs();
const produzidas = new Set(Object.values(NOITES_TS));
const novas = posts
  .filter((p) => p.status !== "cancelado" && (p.atracao || "").trim() && dow(p.data) in DIA)
  .filter((p) => (FORCADAS.length ? FORCADAS.includes(p.data) : !produzidas.has(p.data)));
log(`noites novas na planilha: ${novas.map((p) => `${p.data} ${p.atracao}`).join(" · ") || "nenhuma"}`);

// ---------- 2. material ----------
const artistas = await rest("butiquim_social_artistas?select=slug,nome,estilo");
const feriadosBanco = await rest(`butiquim_social_feriados?select=data,nome&data=gte.${hojeBR}`);
const FER = Object.fromEntries(feriadosBanco.map((f) => [f.data, f.nome]));
const dataTs = readFileSync("src/data.ts", "utf8");
const CATALOGO = {};
for (const m of dataTs.matchAll(/^\s*"?([a-z0-9-]+)"?:\s*\{\s*nome:\s*"([^"]+)"[^\n]*?clip:\s*"([^"]+)"/gm)) CATALOGO[m[1]] = { nome: m[2], clip: m[3] };

const prontas = [], faltam = [];
for (const p of novas) {
  const s = slugDe(p.atracao), a = artistas.find((x) => x.slug === s);
  const problemas = [];
  if (!CATALOGO[s]) problemas.push(`${p.atracao} ainda não tem foto/vídeo no catálogo das nossas peças`);
  if (!a?.estilo) problemas.push(`${p.atracao} está sem estilo (pagode/sertanejo) no cadastro de artistas`);
  const feriado = FER[soma(p.data, 1)] || null;
  if (dow(p.data) === 4 && !feriado) problemas.push("quinta só abre em véspera, e o dia seguinte não está na tabela de feriados");
  (problemas.length ? faltam : prontas).push({ ...p, slug: s, nome: a?.nome || p.atracao, feriado, problemas });
}

// falta material: avisa uma vez por noite + artista
const avisos = faltam.length ? await rest(`butiquim_social_config?select=chave,valor&chave=like.noite_nova_aviso_*`) : [];
for (const f of faltam) {
  const chave = `noite_nova_aviso_${f.data}`;
  if (!ENSAIO && avisos.some((a) => a.chave === chave && a.valor === f.slug)) continue;
  await zap([
    `🗓️ *Noite nova na agenda: ${DIA[dow(f.data)]} ${ddmm(f.data)}*`,
    f.atracao,
    "",
    `⚠️ Nossas peças ainda não saíram: ${f.problemas.join("; ")}.`,
    "Me manda a foto (PSD do designer ou a arte) e o vídeo, se houver, que eu cadastro. Assim que estiver no catálogo, o robô produz e agenda sozinho.",
  ].join("\n"));
  if (!ENSAIO) await rest("butiquim_social_config?on_conflict=chave", { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify({ chave, valor: f.slug }) });
}

if (CHECAR) {
  const tem = prontas.length ? "sim" : "nao";
  if (env.GITHUB_OUTPUT) appendFileSync(env.GITHUB_OUTPUT, `tem=${tem}\n`);
  log(`tem=${tem}`);
  process.exit(0);
}
if (!prontas.length) { log("nada a produzir"); process.exit(0); }

// ---------- 3. código: noite em src/data.ts, Folhinha na entrada da véspera ----------
let ts = readFileSync("src/data.ts", "utf8");
let root = readFileSync("src/entries/vespera/Root.tsx", "utf8");
let nVespera = Math.max(0, ...[...ts.matchAll(/^\s*vespera(\d+): noiteDe/gm)].map((m) => +m[1]));
const linhaFim = /(\r?\n)\};(\r?\n)export type NoiteKey/;
const novaLinha = (chave, d, nota) => { ts = ts.replace(linhaFim, (_, a, b) => `${a}  ${chave}: noiteDe("${d}"), // ${nota}${a}};${b}export type NoiteKey`); };
const novaFolhinha = (chave, nota) => {
  const ultimas = [...root.matchAll(/^\s*\["vespera\d*", NOITES\.vespera\d+\],[^\n]*\n/gm)];
  const u = ultimas[ultimas.length - 1];
  const fim = u.index + u[0].length;
  root = `${root.slice(0, fim)}  ["${chave}", NOITES.${chave}], // ${nota}\n${root.slice(fim)}`;
};
for (const n of prontas) {
  const nota = `robô noites-novas ${ddmm(hojeBR)}`;
  if (produzidas.has(n.data)) continue; // ensaio com data já produzida: só refaz as peças
  if (n.feriado && !new RegExp(`"${soma(n.data, 1)}":`).test(ts)) ts = ts.replace(/(export const FERIADOS: Record<string, string> = \{\r?\n)/, `$1  "${soma(n.data, 1)}": ${JSON.stringify(n.feriado)},\n`);
  if (dow(n.data) === 4) {
    const k = `vespera${++nVespera}`;
    novaLinha(k, n.data, `quinta, véspera de ${n.feriado} · ${nota}`);
    novaFolhinha(k, `véspera de ${n.feriado} · ${nota}`);
  } else {
    novaLinha(chaveDe(n.data), n.data, nota);
    if (n.feriado) {
      const k = `vespera${++nVespera}`;
      novaLinha(k, n.data, `véspera de ${n.feriado} · ${nota}`);
      novaFolhinha(k, `véspera de ${n.feriado} · ${nota}`);
    }
  }
}
writeFileSync("src/data.ts", ts);
writeFileSync("src/entries/vespera/Root.tsx", root);

const todas = noitesDataTs();
const datas = Object.values(todas);
execFileSync("node", ["scripts/sync-agenda.mjs", datas.reduce((a, b) => (a < b ? a : b)), datas.reduce((a, b) => (a > b ? a : b))], { stdio: "inherit" });
const agenda = JSON.parse(readFileSync("src/agenda.json", "utf8")).noites;

// em qual "mês de produção" cada noite cai (fim de semana que vira o mês conta no mês da sexta)
const mesDe = (d) => {
  const anterior = new Date(Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 2, 1)).toISOString().slice(0, 7);
  return [d.slice(0, 7), anterior].find((M) => noitesDoMes(M).noites.some((n) => n.data === d));
};
for (const n of prontas) n.mes = mesDe(n.data);

// ---------- 4. render + fila ----------
const GL = env.GL || (process.platform === "linux" ? "swangle" : "angle");
const npx = (args) => execFileSync(process.platform === "win32" ? "npx.cmd" : "npx", args, { stdio: "inherit", shell: process.platform === "win32" });
const NUCLEOS = Math.max(1, Math.min(4, os.cpus().length));
const still = (b, id, out, frame) => npx(["remotion", "still", b, id, out, ...(frame ? [`--frame=${frame}`] : []), `--gl=${GL}`, "--log=error"]);
const video = (b, id, out) => npx(["remotion", "render", b, id, out, "--codec=h264", "--crf=18", `--gl=${GL}`, `--concurrency=${NUCLEOS}`, "--log=error"]);
for (const pasta of ["out/final", "out/agendas", "out/vespera", "public/broll"]) mkdirSync(pasta, { recursive: true });

const baixaClipes = async (datasClipe) => {
  const precisa = new Set();
  for (const d of datasClipe) {
    const s = agenda.find((x) => x.data === d)?.slug;
    if (s && CATALOGO[s]) precisa.add(CATALOGO[s].clip);
  }
  for (const clip of precisa) {
    const destino = `public/${clip}`;
    if (existsSync(destino)) continue;
    const r = await fetch(`${URL}/storage/v1/object/butiquim-flyers-broll/${clip.replace(/^broll\//, "")}`, { headers: H });
    if (!r.ok) throw new Error(`vídeo ${clip} não está no bucket (HTTP ${r.status})`);
    writeFileSync(destino, Buffer.from(await r.arrayBuffer()));
    log(`vídeo ${clip} baixado`);
  }
};

// os vídeos precisam estar em public/ ANTES do bundle: o pacote copia a pasta na hora em que é criado
for (const M of [...new Set(prontas.map((n) => n.mes))]) {
  const grupo = prontas.filter((n) => n.mes === M);
  try {
    const R = noitesDoMes(M);
    const alvo = grupo.map((n) => n.data);
    await baixaClipes([...alvo, ...R.agendas.filter((g) => g.datas.some((d) => alvo.includes(d))).flatMap((g) => g.datas)]);
  } catch (e) {
    for (const n of grupo) n.resultado = { ok: false, erro: String(e.message).slice(0, 200) };
  }
}
log(`bundle (GL=${GL})`);
npx(["remotion", "bundle", "src/index.ts", "--out-dir=build-novas", "--log=error"]);

const fila = await rest("butiquim_social_avulso?select=campanha,status&campanha=like.agenda-claude-feed-*&status=eq.pendente");
for (const M of [...new Set(prontas.map((n) => n.mes))]) {
  const grupo = prontas.filter((n) => n.mes === M);
  if (grupo[0].resultado) continue; // faltou vídeo: já marcado como erro
  try {
    const R = noitesDoMes(M);
    const alvo = grupo.map((n) => n.data);
    const noites = R.noites.filter((n) => alvo.includes(n.data));
    const agendas = R.agendas.filter((g) => g.datas.some((d) => alvo.includes(d)));
    const E = "src/entries/vespera/index.ts";
    for (const n of noites) {
      const k = n.key;
      log(`render ${n.data} (${k})`);
      if (n.dia !== "quinta") {
        still("build-novas", `${k}-feed`, `out/final/${k}-FEED.png`, 150);
        still("build-novas", `${k}-story`, `out/final/${k}-STORY.png`, 150);
        video("build-novas", `${k}-feed`, `out/final/${k}-FEED.mp4`);
        if (ARTISTAS_SEM_VIDEO.has(agenda.find((x) => x.data === n.data)?.slug)) video("build-novas", `${k}-story`, `out/final/${k}-STORY.mp4`);
        else video("build-novas", `${k}-broll`, `out/final/${k}-STORY-BROLL.mp4`);
      }
      if (n.vespera) {
        const v = n.vespera;
        still(E, `${v}-feed`, `out/vespera/${v}-FEED.png`, 220);
        still(E, `${v}-story`, `out/vespera/${v}-STORY.png`, 220);
        video(E, `${v}-feed`, `out/vespera/${v}-FEED.mp4`);
        video(E, `${v}-story`, `out/vespera/${v}-STORY.mp4`);
        if (n.dia !== "quinta") video(E, `${v}-broll`, `out/vespera/${v}-STORY-BROLL.mp4`);
      }
    }
    for (const g of agendas) {
      log(`render agenda ${g.s}`);
      video("build-novas", `agenda-${g.s}-feed-video`, `out/agendas/agenda-${g.s}-FEED.mp4`);
      video("build-novas", `agenda-${g.s}-story-video`, `out/agendas/agenda-${g.s}-STORY.mp4`);
    }
    const args = ["scripts/fila-mes.mjs", "--mes", M, "--noites", alvo.join(",")];
    if (!ENSAIO) args.push("--gravar");
    const saida = execFileSync("node", args, { encoding: "utf8", maxBuffer: 1 << 26 });
    log(saida);
    const qtd = +(saida.match(/(?:GRAVADO|simulação): (\d+) posts/) || [])[1] || 0;
    for (const n of grupo) {
      const semana = agendas.find((g) => g.datas.includes(n.data));
      const agendaAntiga = semana && fila.some((c) => c.campanha === `agenda-claude-feed-${semana.terca}`);
      n.resultado = { ok: true, posts: qtd, agenda: semana ? `✅ Agenda da semana refeita com essa noite (terça ${ddmm(semana.terca)})` : "➖ Agenda da semana: só sai com sex, sáb e dom preenchidos", agendaAntiga };
    }
  } catch (e) {
    for (const n of grupo) n.resultado = { ok: false, erro: String(e.stderr || e.message).slice(0, 200) };
  }
}

// ---------- 5. noite que falhou sai do código e tenta de novo amanhã; o resto volta pro repositório ----------
const falhas = prontas.filter((n) => !n.resultado?.ok);
if (falhas.length && !ENSAIO) {
  let t2 = readFileSync("src/data.ts", "utf8"), r2 = readFileSync("src/entries/vespera/Root.tsx", "utf8");
  for (const n of falhas) {
    if (produzidas.has(n.data)) continue;
    const chaves = [...t2.matchAll(new RegExp(`^\\s*(\\w+): noiteDe\\("${n.data}"\\),[^\\n]*\\n`, "gm"))];
    for (const c of chaves) { t2 = t2.replace(c[0], ""); r2 = r2.replace(new RegExp(`^\\s*\\["${c[1]}", NOITES\\.${c[1]}\\],[^\\n]*\\n`, "m"), ""); }
  }
  writeFileSync("src/data.ts", t2);
  writeFileSync("src/entries/vespera/Root.tsx", r2);
}
if (!ENSAIO && prontas.some((n) => n.resultado?.ok)) {
  const git = (...a) => execFileSync("git", a, { stdio: "inherit" });
  if (env.GITHUB_ACTIONS) { git("config", "user.name", "robo-noites-novas"); git("config", "user.email", "robo@users.noreply.github.com"); }
  git("add", "src/data.ts", "src/entries/vespera/Root.tsx", "src/agenda.json");
  git("commit", "-m", `noites novas: ${prontas.filter((n) => n.resultado?.ok).map((n) => n.data).join(", ")}`);
  git("push");
}

// ---------- 6. resumo pro Rafa ----------
for (const n of prontas) {
  const r = n.resultado;
  const msg = [
    `🗓️ *Noite nova na agenda: ${DIA[dow(n.data)]} ${ddmm(n.data)}*`,
    `${n.nome}${n.feriado ? ` (véspera de ${n.feriado})` : ""}`,
    "",
    r.ok ? `✅ Nossas peças prontas e agendadas no Instagram (${r.posts} posts${prontas.length > 1 ? " no total das noites novas" : ""})` : `❌ Nossas peças: deu erro (${r.erro}). Tento de novo amanhã às 10h.`,
    ...(r.ok ? [r.agenda] : []),
    ...(r.ok && r.agendaAntiga ? ["⚠️ Essa agenda já estava na fila sem essa noite: o vídeo foi trocado, mas a legenda não. Me chama pra conferir."] : []),
    ...(dow(n.data) === 4 ? ["➖ Disparo de WhatsApp: nenhum (véspera sem disparo automático)", "➖ Meta Ads: quinta não entra no robô mensal. Se quiser campanha à parte, é só pedir."] : []),
  ].join("\n");
  await zap(msg);
}
log(`FIM — ${prontas.map((n) => `${n.data}: ${n.resultado?.ok ? "ok" : "erro"}`).join(" · ")}`);
process.exit(falhas.length ? 1 : 0);
