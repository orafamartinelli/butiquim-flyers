// REFAZ NOITES (30/10/2026) — quando o Victor troca a atração na planilha, refaz NA NUVEM as nossas peças.
//
// Quem detecta a troca é o leitor da agenda (n8n butiquim_social_leitor_agenda, 7h): ele cancela os nossos posts
// daquela data na fila (erro "retirado ...: atração trocou") e grava uma linha em butiquim_social_noites_refazer.
// Este script (workflow refaz-noites.yml, despertador 10h05 — depois das campanhas Meta das 9h) pega essas linhas e:
//   1. sincroniza src/agenda.json com o banco;
//   2. confere se o artista novo está no catálogo (foto/vídeo em src/data.ts + estilo no cadastro) —
//      não estando, marca falta_material e avisa o Rafa UMA vez (precisa da foto do PSD: trabalho humano);
//   3. baixa o B-roll do bucket privado butiquim-flyers-broll, renderiza a noite (feed/story/vídeo/B-roll)
//      e a agenda da semana dela;
//   4. fila-mes.mjs --refazer: sobe com nome versionado e reativa os posts cancelados com o conteúdo novo;
//   5. marca refeito_em e manda ao Rafa o resumo da troca (Leonardo · Meta · nossas peças · Kim).
//
// Uso:  node scripts/refaz-noites.mjs --checar   → só diz se há trabalho (GITHUB_OUTPUT tem=sim|nao)
//       node scripts/refaz-noites.mjs            → faz
// Ambiente: SUPABASE_URL, SUPABASE_SECRET_KEY, ZAPI_INSTANCE_ID, ZAPI_INSTANCE_TOKEN, ZAPI_CLIENT_TOKEN, FFMPEG, GL
//           ENSAIO=1 + DATAS=2026-11-06[,...] → ensaio: renderiza essas datas e simula a fila (não sobe nada,
//           não grava na fila nem no banco); as peças ficam no artefato do run e o resumo vai com [TESTE].
import { readFileSync, writeFileSync, appendFileSync, mkdirSync, existsSync } from "fs";
import { execFileSync } from "child_process";
import os from "os";
import { credSupabase } from "./_cred.mjs";
import { ARTISTAS_SEM_VIDEO, noitesDataTs, noitesDoMes } from "./_rotacao.mjs";

const env = process.env;
const CHECAR = process.argv.includes("--checar");
const ENSAIO = env.ENSAIO === "1";
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
  if (!env.ZAPI_INSTANCE_ID) { log(`[sem Z-API] ${msg}`); return; }
  const r = await fetch(`https://api.z-api.io/instances/${env.ZAPI_INSTANCE_ID}/token/${env.ZAPI_INSTANCE_TOKEN}/send-text`, {
    method: "POST", headers: { "Content-Type": "application/json", "Client-Token": env.ZAPI_CLIENT_TOKEN }, body: JSON.stringify({ phone: RAFA, message: PRE + msg }) });
  log(`zap Rafa: HTTP ${r.status}`);
};

const hojeBR = new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10);
const ddmm = (d) => `${d.slice(8)}/${d.slice(5, 7)}`;
const DIA = (d) => ({ 4: "Quinta", 5: "Sexta", 6: "Sábado", 0: "Domingo" })[new Date(`${d}T12:00:00Z`).getUTCDay()] || "";
const horaBR = (iso) => new Date(new Date(iso).getTime() - 3 * 3600e3).toISOString().slice(11, 16);
const semAcento = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "");
const norm = (s) => semAcento(s).toLowerCase().replace(/\([^)]*\)/g, "").replace(/&/g, "e").replace(/[^a-z0-9]+/g, "");

// ---------- 1. o que há pra refazer ----------
let linhas;
if (env.DATAS) {
  const ds = env.DATAS.split(",").map((s) => s.trim()).filter(Boolean);
  linhas = ds.map((d, i) => ({ id: -1 - i, data: d, antes: "(ensaio)", depois: "(ensaio)", posts_retirados: 1, pago_pausado_em: null, refazer_status: null, resumo_enviado_em: null }));
} else {
  linhas = await rest(`butiquim_social_noites_refazer?select=id,data,antes,depois,posts_retirados,pago_pausado_em,refazer_status,resumo_enviado_em,criado_em&refeito_em=is.null&data=gte.${hojeBR}&order=id`);
}
// uma decisão por data (a troca mais recente vale; as anteriores da mesma data fecham junto)
const porData = new Map();
for (const l of linhas) {
  const ja = porData.get(l.data);
  porData.set(l.data, { ...l, ids: [...(ja?.ids || []), l.id], antesOriginal: ja?.antesOriginal ?? l.antes });
}
const casos = [...porData.values()];
const fazer = casos.filter((c) => c.posts_retirados > 0 && (c.depois || "").trim());
const semPosts = casos.filter((c) => !(c.posts_retirados > 0) || !(c.depois || "").trim());
log(`pendentes: ${casos.length} data(s) — ${fazer.length} com peças nossas a refazer, ${semPosts.length} sem peça nossa / data esvaziada`);

if (CHECAR) {
  const tem = casos.length ? "sim" : "nao";
  if (env.GITHUB_OUTPUT) appendFileSync(env.GITHUB_OUTPUT, `tem=${tem}\n`);
  log(`tem=${tem}`);
  process.exit(0);
}
if (!casos.length) { log("nada a refazer"); process.exit(0); }

const marca = async (c, campos) => {
  if (ENSAIO || c.ids.some((id) => id < 0)) { log(`[ensaio] marcaria ${c.data}: ${JSON.stringify(campos)}`); return; }
  await rest(`butiquim_social_noites_refazer?id=in.(${c.ids.join(",")})`, { method: "PATCH", body: JSON.stringify({ refazer_tentado_em: new Date().toISOString(), ...campos }) });
};

// data esvaziada ou sem peça nossa na fila: não há o que renderizar — fecha a linha (o resumo ainda sai)
for (const c of semPosts) {
  c.resultado = { status: "sem_posts", texto: (c.depois || "").trim() ? "não havia peça nossa na fila dessa noite (o mês sai com o artista novo)" : "data esvaziada na planilha — nossas peças saíram da fila" };
  await marca(c, { refeito_em: new Date().toISOString(), refazer_status: "sem_posts", refazer_obs: c.resultado.texto });
}

// ---------- 2. agenda + catálogo ----------
if (fazer.length) {
  const todas = Object.values(noitesDataTs());
  const de = todas.reduce((a, b) => (a < b ? a : b)), ate = todas.reduce((a, b) => (a > b ? a : b));
  log(`sincronizando agenda ${de} → ${ate}`);
  execFileSync("node", ["scripts/sync-agenda.mjs", de, ate], { stdio: "inherit" });
}
const agenda = JSON.parse(readFileSync("src/agenda.json", "utf8")).noites;
const dataTs = readFileSync("src/data.ts", "utf8");
const ARTISTAS = {};
for (const m of dataTs.matchAll(/^\s*"?([a-z0-9-]+)"?:\s*\{\s*nome:\s*"([^"]+)"[^\n]*?clip:\s*"([^"]+)"/gm)) ARTISTAS[m[1]] = { nome: m[2], clip: m[3] };
const NOITES_TS = noitesDataTs(); // chave → data

const prontos = [];
for (const c of fazer) {
  const a = agenda.find((x) => x.data === c.data);
  const problemas = [];
  if (!a) problemas.push("a data não está na agenda sincronizada");
  else {
    if (!ARTISTAS[a.slug]) problemas.push(`${a.nome} ainda não tem foto/vídeo no catálogo das nossas peças`);
    if (!a.estilo) problemas.push(`${a.nome} está sem estilo (pagode/sertanejo) no cadastro de artistas`);
  }
  if (!Object.values(NOITES_TS).includes(c.data)) problemas.push("a noite não está na nossa produção (src/data.ts)");
  if (problemas.length) {
    c.resultado = { status: "falta_material", texto: problemas.join("; ") };
    await marca(c, { refazer_status: "falta_material", refazer_obs: c.resultado.texto });
  } else {
    c.artista = a; prontos.push(c);
  }
}

// ---------- 3. render ----------
const GL = env.GL || (process.platform === "linux" ? "swangle" : "angle");
const VERSAO = "r" + new Date(Date.now() - 3 * 3600e3).toISOString().slice(5, 16).replace(/[-T:]/g, "");
const npx = (args) => execFileSync(process.platform === "win32" ? "npx.cmd" : "npx", args, { stdio: "inherit", shell: process.platform === "win32" });

const meses = [...new Set(prontos.map((c) => c.data.slice(0, 7)))];
if (prontos.length) {
  mkdirSync("out/final", { recursive: true }); mkdirSync("out/agendas", { recursive: true }); mkdirSync("out/vespera", { recursive: true });
  mkdirSync("public/broll", { recursive: true });
  // B-roll: das noites trocadas e das outras noites das mesmas semanas (a agenda da semana mostra as 3)
  const planos = meses.map((M) => {
    const R = noitesDoMes(M);
    const datasM = prontos.filter((c) => c.data.startsWith(M)).map((c) => c.data);
    const noites = R.noites.filter((n) => datasM.includes(n.data));
    const agendas = R.agendas.filter((g) => g.datas.some((d) => datasM.includes(d)));
    return { M, datasM, noites, agendas };
  });
  const precisa = new Set();
  for (const p of planos) for (const d of [...p.datasM, ...p.agendas.flatMap((g) => g.datas)]) {
    const s = agenda.find((x) => x.data === d)?.slug;
    if (s && ARTISTAS[s]) precisa.add(ARTISTAS[s].clip);
  }
  for (const clip of precisa) {
    const destino = `public/${clip}`;
    if (existsSync(destino)) continue;
    const r = await fetch(`${URL}/storage/v1/object/butiquim-flyers-broll/${clip.replace(/^broll\//, "")}`, { headers: H });
    if (!r.ok) { log(`⚠️ B-roll ${clip} não está no bucket (HTTP ${r.status})`); continue; }
    writeFileSync(destino, Buffer.from(await r.arrayBuffer()));
    log(`B-roll ${clip} baixado`);
  }

  log(`bundle (GL=${GL}, versão ${VERSAO})`);
  npx(["remotion", "bundle", "src/index.ts", "--out-dir=build-refaz", "--log=error"]);
  const still = (b, id, out, frame) => npx(["remotion", "still", b, id, out, `--frame=${frame}`, `--gl=${GL}`, "--log=error"]);
  // remotion.config.ts fixa concurrency 4 (PC); o runner tem 2 núcleos e o Remotion recusa acima disso
  const NUCLEOS = Math.max(1, Math.min(4, os.cpus().length));
  const video = (b, id, out) => npx(["remotion", "render", b, id, out, "--codec=h264", "--crf=18", `--gl=${GL}`, `--concurrency=${NUCLEOS}`, "--log=error"]);

  for (const p of planos) {
    for (const c of prontos.filter((x) => x.data.startsWith(p.M))) {
      try {
        for (const n of p.noites.filter((x) => x.data === c.data)) {
          const k = n.key;
          log(`render ${c.data} (${k})`);
          // quinta só existe como Folhinha (bloco abaixo); artista sem vídeo próprio leva o story animado no lugar do B-roll
          if (n.dia !== "quinta") {
            still("build-refaz", `${k}-feed`, `out/final/${k}-FEED.png`, 150);
            still("build-refaz", `${k}-story`, `out/final/${k}-STORY.png`, 150);
            video("build-refaz", `${k}-feed`, `out/final/${k}-FEED.mp4`);
            if (ARTISTAS_SEM_VIDEO.has(c.artista.slug)) video("build-refaz", `${k}-story`, `out/final/${k}-STORY.mp4`);
            else video("build-refaz", `${k}-broll`, `out/final/${k}-STORY-BROLL.mp4`);
          }
          if (n.vespera) {
            const v = n.vespera, E = "src/entries/vespera/index.ts";
            still(E, `${v}-feed`, `out/vespera/${v}-FEED.png`, 220);
            still(E, `${v}-story`, `out/vespera/${v}-STORY.png`, 220);
            video(E, `${v}-feed`, `out/vespera/${v}-FEED.mp4`);
            video(E, `${v}-story`, `out/vespera/${v}-STORY.mp4`);
            if (n.dia !== "quinta") video(E, `${v}-broll`, `out/vespera/${v}-STORY-BROLL.mp4`);
          }
        }
      } catch (e) {
        c.resultado = { status: "erro", texto: `render falhou: ${String(e.message).slice(0, 160)}` };
      }
    }
    for (const g of p.agendas) {
      try {
        log(`render agenda ${g.s}`);
        video("build-refaz", `agenda-${g.s}-feed-video`, `out/agendas/agenda-${g.s}-FEED.mp4`);
        video("build-refaz", `agenda-${g.s}-story-video`, `out/agendas/agenda-${g.s}-STORY.mp4`);
        if (g.seg) {
          video("build-refaz", `agenda-${g.s}-seg-feed-video`, `out/agendas/agenda-${g.s}-seg-FEED.mp4`);
          video("build-refaz", `agenda-${g.s}-seg-story-video`, `out/agendas/agenda-${g.s}-seg-STORY.mp4`);
        }
      } catch (e) {
        for (const c of prontos.filter((x) => g.datas.includes(x.data) && !x.resultado)) c.resultado = { status: "erro", texto: `render da agenda da semana falhou: ${String(e.message).slice(0, 140)}` };
      }
    }

    // ---------- 4. fila ----------
    const ok = prontos.filter((c) => c.data.startsWith(p.M) && !c.resultado).map((c) => c.data);
    if (!ok.length) continue;
    const args = ["scripts/fila-mes.mjs", "--mes", p.M, "--refazer", ok.join(","), "--versao", VERSAO + (ENSAIO ? "teste" : "")];
    if (!ENSAIO) args.push("--gravar");
    let saida = "";
    try {
      saida = execFileSync("node", args, { encoding: "utf8", maxBuffer: 1 << 26 });
      log(saida);
      const r = JSON.parse((saida.match(/@@RESUMO (.*)/) || [])[1] || "{}");
      for (const d of ok) {
        const c = prontos.find((x) => x.data === d);
        const n = (r.reativados || 0) + (r.inseridos || 0) + (r.jaPendentes || 0);
        c.resultado = { status: "ok", texto: `refeitas com ${c.artista.nome} — ${n} post(s) de volta na fila${ok.length > 1 ? ` (total das ${ok.length} noites)` : ""}` };
        await marca(c, { refeito_em: new Date().toISOString(), refazer_status: "ok", refazer_obs: c.resultado.texto });
      }
    } catch (e) {
      for (const d of ok) {
        const c = prontos.find((x) => x.data === d);
        c.resultado = { status: "erro", texto: `fila falhou: ${String(e.stderr || e.message).slice(0, 160)}` };
      }
    }
  }
}
for (const c of prontos) if (c.resultado?.status === "erro") await marca(c, { refazer_status: "erro", refazer_obs: c.resultado.texto });

// ---------- 5. resumo pro Rafa ----------
for (const c of casos) {
  if (c.resumo_enviado_em && c.resultado?.status === c.refazer_status) continue; // já avisado e nada mudou
  const antes = c.antesOriginal || "—", depois = (c.depois || "").trim() || "(data vazia)";
  const falso = norm(antes) && norm(antes) === norm(depois);
  const st = c.resultado?.status;
  const peças = {
    ok: `✅ Nossas peças: ${c.resultado.texto}`,
    sem_posts: `➖ Nossas peças: ${c.resultado?.texto}`,
    falta_material: `⚠️ Nossas peças: NÃO refiz — ${c.resultado?.texto}. Me manda a foto (PNG serve) e o vídeo do artista que eu cadastro.`,
    erro: `❌ Nossas peças: deu erro (${c.resultado?.texto}). Tento de novo amanhã às 10h.`,
  }[st] || "⏳ Nossas peças: ainda processando";
  const meta = c.pago_pausado_em
    ? `✅ Meta Ads: pausei os anúncios de ${antes} às ${horaBR(c.pago_pausado_em)}; a arte nova sobe sozinha quando o Leonardo entregar`
    : `✅ Meta Ads: nenhum anúncio de ${antes} estava rodando (conferido na rodada das 9h)`;
  const msg = [
    `🔄 *Troca na agenda — ${DIA(c.data)} ${ddmm(c.data)}*`,
    falso ? `Falso alarme da planilha: continua ${depois.replace(/\s*\([^)]*\)\s*/g, "")}.` : `${antes} → *${depois}*`,
    "",
    falso ? "✅ Leonardo: nada a refazer" : "✅ Leonardo: avisado no grupo CONTEÚDO às 7h pra refazer a arte",
    meta,
    peças,
    "✅ Kim: base da agenda conferida hoje às 9h (se mudou, o texto novo chegou no seu e-mail pra colar no Prontto)",
    "✅ Instagram (Estúdio): os posts do designer dessa noite saíram da fila e voltam sozinhos com a arte nova",
  ].join("\n");
  await zap(msg);
  if (!ENSAIO && !c.ids.some((id) => id < 0)) await rest(`butiquim_social_noites_refazer?id=in.(${c.ids.join(",")})`, { method: "PATCH", body: JSON.stringify({ resumo_enviado_em: new Date().toISOString() }) });
}

const erros = casos.filter((c) => c.resultado?.status === "erro").length;
log(`FIM — ${casos.map((c) => `${c.data}: ${c.resultado?.status || "?"}`).join(" · ")}`);
process.exit(erros ? 1 : 0);
