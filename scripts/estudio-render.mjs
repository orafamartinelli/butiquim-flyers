// ESTÚDIO — fase D: gera a prova de um pedido (butiquim_estudio_pedidos) e manda no grupo do pedido.
// Roda no GitHub Actions (.github/workflows/estudio-render.yml), mas também local:
//   PEDIDO_ID=1 SUPABASE_URL=... SUPABASE_SECRET_KEY=... ZAPI_*=... node scripts/estudio-render.mjs
// Flags de ambiente: SEM_ENVIO=1 (não manda no WhatsApp nem grava no banco), GL=swangle|angle
//
// CONTRATO
//  lê   butiquim_estudio_pedidos: id, grupo, titulo, briefing, versao, provas, teste
//       briefing: titulo_arte?, chamada? | oferta? | texto?, regra? | letras_miudas?, data_evento (AAAA-MM-DD)?,
//                 hora_evento? | hora?, dia_semana?, tom? (promo|evento|convidado|aviso)
//       butiquim_estudio_arquivos (pedido_id): 1º arquivo de imagem → drive_file_id | storage_path | origem_url
//  grava Storage butiquim-social/estudio/pedido-<id>-v<versao>-{feed.jpg,story.jpg,feed.mp4}
//       pedidos.provas += {versao, urls:{feed_jpg, story_jpg, feed_mp4}, enviada_em, run_url}; status='em_prova'
//  envia no grupo do pedido (Z-API): feed.jpg (legenda da prova) + story.jpg + feed.mp4 (Reels 9:16)
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { bundle } from "@remotion/bundler";
import { openBrowser, renderMedia, renderStill, selectComposition } from "@remotion/renderer";

const RAIZ = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const env = process.env;
const ID = Number(env.PEDIDO_ID);
const SB = (env.SUPABASE_URL || "").replace(/\/$/, "");
const KEY = env.SUPABASE_SECRET_KEY;
const SEM_ENVIO = env.SEM_ENVIO === "1";
const GL = env.GL || (process.platform === "linux" ? "swangle" : "angle");
const RUN_URL = env.GITHUB_RUN_ID ? `${env.GITHUB_SERVER_URL}/${env.GITHUB_REPOSITORY}/actions/runs/${env.GITHUB_RUN_ID}` : null;
const BUCKET = "butiquim-social";

if (!ID) throw new Error("PEDIDO_ID ausente");
if (!SB || !KEY) throw new Error("SUPABASE_URL / SUPABASE_SECRET_KEY ausentes");

const t0 = Date.now();
const log = (...a) => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s]`, ...a);
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

const sb = async (rota, init = {}) => {
  const r = await fetch(`${SB}/rest/v1/${rota}`, { ...init, headers: { apikey: KEY, "Content-Type": "application/json", Prefer: "return=representation", ...(init.headers || {}) } });
  const txt = await r.text();
  if (!r.ok) throw new Error(`supabase ${r.status} ${rota}: ${txt.slice(0, 300)}`);
  return txt ? JSON.parse(txt) : null;
};

const zap = async (rota, body) => {
  const url = `https://api.z-api.io/instances/${env.ZAPI_INSTANCE_ID}/token/${env.ZAPI_INSTANCE_TOKEN}/${rota}`;
  for (let i = 0; i < 3; i++) {
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", "Client-Token": env.ZAPI_CLIENT_TOKEN }, body: JSON.stringify(body) });
    const txt = await r.text();
    if (r.ok) return JSON.parse(txt || "{}");
    log(`z-api ${rota} ${r.status} (tentativa ${i + 1}): ${txt.slice(0, 200)}`);
    await espera(3000);
  }
  throw new Error(`z-api ${rota} falhou`);
};

const norm = (s) => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

// ---------- imagem do pedido ----------
const tipoPorBytes = (b) => {
  if (b[0] === 0x89 && b[1] === 0x50) return { ext: "png", alfa: b[25] === 6 || b[25] === 4 };
  if (b[0] === 0xff && b[1] === 0xd8) return { ext: "jpg", alfa: false };
  if (b.slice(0, 4).toString() === "RIFF" && b.slice(8, 12).toString() === "WEBP") return { ext: "webp", alfa: true };
  return null;
};

const baixaImagem = async (arqs) => {
  for (const a of arqs) {
    const urls = [];
    if (a.drive_file_id) urls.push(`https://drive.usercontent.google.com/download?id=${a.drive_file_id}&export=download&confirm=t`);
    if (a.storage_path) urls.push(/^https?:/.test(a.storage_path) ? a.storage_path : `${SB}/storage/v1/object/public/${a.storage_path.replace(/^\//, "")}`);
    if (a.origem_url && /^https?:/.test(a.origem_url)) urls.push(a.origem_url);
    for (const u of urls) {
      try {
        const r = await fetch(u, { redirect: "follow", headers: { "User-Agent": "butiquim-estudio/1.0" } });
        if (!r.ok) {
          log(`arquivo ${a.id}: ${r.status} em ${u.slice(0, 80)}`);
          continue;
        }
        const b = Buffer.from(await r.arrayBuffer());
        const t = tipoPorBytes(b);
        if (!t) {
          log(`arquivo ${a.id}: não é imagem (pula)`);
          continue;
        }
        const dir = path.join(RAIZ, "public", "estudio");
        fs.mkdirSync(dir, { recursive: true });
        const nome = `pedido-${ID}-arq-${a.id}.${t.ext}`;
        fs.writeFileSync(path.join(dir, nome), b);
        const tipo = norm(a.tipo);
        const modo = /foto|convidad|artista|pessoa/.test(tipo) ? "foto" : /logo|escudo|marca|parceir/.test(tipo) ? "logo" : t.alfa ? "logo" : "foto";
        log(`imagem: arquivo ${a.id} (${a.nome || "-"}) → estudio/${nome} [${modo}, ${Math.round(b.length / 1024)} KB]`);
        return { imagem: `estudio/${nome}`, imagem_modo: modo };
      } catch (e) {
        log(`arquivo ${a.id}: erro ${e.message}`);
      }
    }
  }
  return {};
};

// ---------- props a partir do briefing ----------
const montaProps = (p, img) => {
  const b = p.briefing || {};
  const titulo = b.titulo_arte || p.titulo || b.texto || "O Butiquim";
  let chamada = b.chamada || b.oferta || "";
  if (!chamada && b.texto && norm(b.texto) !== norm(titulo)) chamada = b.texto;
  let regra = b.regra || b.letras_miudas || "";
  if (regra && norm(regra) === norm(chamada)) regra = "";
  const tons = ["promo", "evento", "convidado", "aviso"];
  // TODOS os campos explícitos (null = não tem): o --props do Remotion se MESCLA com o defaultProps do exemplo
  return {
    titulo,
    chamada: chamada || null,
    regra: regra || null,
    data_evento: b.data_evento || null,
    hora: b.hora_evento || b.hora || null,
    dia_semana: b.dia_semana || null,
    tom: tons.includes(b.tom) ? b.tom : null,
    imagem: null,
    imagem_modo: null,
    ...img,
  };
};

// ---------- render ----------
const npx = (args) => execFileSync(process.platform === "win32" ? "npx.cmd" : "npx", args, { cwd: RAIZ, stdio: ["ignore", "inherit", "inherit"], shell: process.platform === "win32" });

const QUADROS_ENTRADA = 60;
const DURACAO_VIDEO = 6; // segundos (Reels)

// ffmpeg do sistema se houver (runner do GitHub tem); senão o que vem com o Remotion
const ffmpeg = (args) => {
  const temSistema = (() => {
    try {
      execFileSync(env.FFMPEG || "ffmpeg", ["-version"], { stdio: "ignore" });
      return true;
    } catch {
      return false;
    }
  })();
  if (temSistema) execFileSync(env.FFMPEG || "ffmpeg", args, { cwd: RAIZ, stdio: ["ignore", "inherit", "inherit"] });
  else npx(["remotion", "ffmpeg", ...args.map((a) => (process.platform === "win32" && /[\s;\[\]'(),=]/.test(a) ? `"${a}"` : a))]);
};

const upload = async (arquivo, destino, tipo) => {
  const r = await fetch(`${SB}/storage/v1/object/${BUCKET}/${destino}`, { method: "POST", headers: { apikey: KEY, "Content-Type": tipo, "x-upsert": "true", "Cache-Control": "max-age=31536000" }, body: fs.readFileSync(arquivo) });
  if (!r.ok) throw new Error(`upload ${destino}: ${r.status} ${(await r.text()).slice(0, 200)}`);
  return `${SB}/storage/v1/object/public/${BUCKET}/${destino}`;
};

const main = async () => {
  const p = (await sb(`butiquim_estudio_pedidos?select=id,grupo,titulo,briefing,versao,provas,teste,status&id=eq.${ID}`))[0];
  if (!p) throw new Error(`pedido #${ID} não existe`);
  const v = Math.max(1, Number(env.VERSAO) || p.versao || 1);
  log(`pedido #${ID} v${v} (${p.status}) grupo ${p.grupo}${p.teste ? " [TESTE]" : ""}`);

  const arqs = await sb(`butiquim_estudio_arquivos?select=id,tipo,nome,origem_url,storage_path,drive_file_id&pedido_id=eq.${ID}&order=id`);
  const img = await baixaImagem(arqs);
  const props = montaProps(p, img);
  log("props", JSON.stringify(props));

  const out = path.join(RAIZ, "out", "estudio");
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, `props-${ID}.json`), JSON.stringify(props));
  const base = `pedido-${ID}-v${v}`;
  const f = { feed: path.join(out, `${base}-feed.jpg`), story: path.join(out, `${base}-story.jpg`), mp4: path.join(out, `${base}-feed.mp4`) };

  // API do Remotion num processo só: 1 bundle + 1 Chrome reaproveitado em todos os renders
  const serveUrl = await bundle({ entryPoint: path.join(RAIZ, "src", "entries", "aviso", "index.ts"), publicDir: path.join(RAIZ, "public") });
  log("bundle ok");
  const chromiumOptions = { gl: GL };
  const browser = await openBrowser("chrome", { chromiumOptions });
  const comp = (id, inputProps) => selectComposition({ serveUrl, id, inputProps, puppeteerInstance: browser, chromiumOptions, logLevel: "error" });
  const still = async (id, output, inputProps, extra = {}) =>
    renderStill({ composition: await comp(id, inputProps), serveUrl, output, inputProps, frame: 150, imageFormat: "jpeg", jpegQuality: 92, puppeteerInstance: browser, chromiumOptions, overwrite: true, logLevel: "error", ...extra });

  try {
    await still("aviso-feed", f.feed, props);
    await still("aviso-story", f.story, props);
    // o "O" 3D sai uma vez só, em PNG transparente, dentro da public/ do bundle; o vídeo anima esse PNG em 2D
    const anelRel = `estudio/anel-${base}.png`;
    const anelAbs = path.join(serveUrl, "public", anelRel);
    fs.mkdirSync(path.dirname(anelAbs), { recursive: true });
    await still("aviso-anel-story", anelAbs, props, { frame: 0, imageFormat: "png", jpegQuality: undefined });
    log("stills ok");

    // só a ENTRADA é renderizada (60 quadros = 2 s; no runner em CPU cada quadro custa ~1–2 s);
    // o resto até 6 s é o último quadro segurado com um push-in suave feito no ffmpeg (segundos)
    const propsVideo = { ...props, anelSrc: anelRel };
    const entrada = path.join(out, `${base}-entrada.mp4`);
    await renderMedia({
      composition: await comp("aviso-video", propsVideo),
      serveUrl,
      codec: "h264",
      outputLocation: entrada,
      inputProps: propsVideo,
      frameRange: [0, QUADROS_ENTRADA - 1],
      crf: 14,
      pixelFormat: "yuv420p",
      imageFormat: "jpeg",
      jpegQuality: 90,
      enforceAudioTrack: true,
      concurrency: Number(env.CONCURRENCY) || Math.max(1, os.cpus().length),
      puppeteerInstance: browser,
      chromiumOptions,
      overwrite: true,
      logLevel: "error",
    });
    log("entrada ok");
  } finally {
    await browser.close({ silent: true }).catch(() => {});
  }
  const entrada = path.join(out, `${base}-entrada.mp4`);
  const filtro = `[0:v]tpad=stop_mode=clone:stop_duration=${DURACAO_VIDEO},scale=w='trunc(1080*(1+0.04*t/${DURACAO_VIDEO})/2)*2':h=-2:eval=frame:flags=bicubic,crop=1080:1920,setsar=1,format=yuv420p[v];[0:a]apad[a]`;
  ffmpeg(["-y", "-v", "error", "-i", entrada, "-filter_complex", filtro, "-map", "[v]", "-map", "[a]", "-t", String(DURACAO_VIDEO), "-c:v", "libx264", "-crf", "20", "-preset", "veryfast", "-r", "30", "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart", f.mp4]);
  log(`vídeo ok (${Math.round(fs.statSync(f.mp4).size / 1024)} KB)`);

  if (SEM_ENVIO) {
    log("SEM_ENVIO=1 — parei antes de subir/enviar", f);
    return;
  }

  const urls = {
    feed_jpg: await upload(f.feed, `estudio/${base}-feed.jpg`, "image/jpeg"),
    story_jpg: await upload(f.story, `estudio/${base}-story.jpg`, "image/jpeg"),
    feed_mp4: await upload(f.mp4, `estudio/${base}-feed.mp4`, "video/mp4"),
  };
  log("upload ok", urls);

  const pre = p.teste ? "[TESTE] " : "";
  await zap("send-image", { phone: p.grupo, image: urls.feed_jpg, caption: `${pre}🎨 Pedido #${ID} · versão ${v} — responde *aprovado* ou me diz o que mudar\n(1/3 feed)` });
  await espera(2500);
  await zap("send-image", { phone: p.grupo, image: urls.story_jpg, caption: `${pre}(2/3 story)` });
  await espera(2500);
  await zap("send-video", { phone: p.grupo, video: urls.feed_mp4, caption: `${pre}(3/3 vídeo do feed · Reels)` });
  log("enviado no grupo");

  // relê antes de gravar (o Hermes pode ter mexido no briefing enquanto renderizava)
  const atual = (await sb(`butiquim_estudio_pedidos?select=provas&id=eq.${ID}`))[0];
  const provas = (atual?.provas || []).filter((x) => x.versao !== v);
  provas.push({ versao: v, urls, enviada_em: new Date().toISOString(), run_url: RUN_URL, segundos: Math.round((Date.now() - t0) / 1000) });
  await sb(`butiquim_estudio_pedidos?id=eq.${ID}`, { method: "PATCH", body: JSON.stringify({ provas, status: "em_prova", versao: v, atualizado_em: new Date().toISOString() }) });
  log("pedido atualizado: em_prova");
};

main().catch(async (e) => {
  console.error("FALHOU:", e.stack || e.message);
  // avisa o grupo e o Rafa, pra ninguém ficar esperando a prova
  if (!SEM_ENVIO && env.ZAPI_INSTANCE_ID) {
    try {
      const p = (await sb(`butiquim_estudio_pedidos?select=grupo,teste&id=eq.${ID}`))[0];
      const pre = p?.teste ? "[TESTE] " : "";
      if (p?.grupo) await zap("send-text", { phone: p.grupo, message: `${pre}⚠️ Não consegui gerar a prova do pedido #${ID} agora — já avisei o Rafa e volto aqui.` });
      if (env.ESTUDIO_AVISO_TEL) await zap("send-text", { phone: env.ESTUDIO_AVISO_TEL, message: `${pre}⚠️ Estúdio: render da prova do pedido #${ID} falhou.\nErro: ${String(e.message).slice(0, 300)}${RUN_URL ? `\n${RUN_URL}` : ""}` });
    } catch (e2) {
      console.error("aviso de falha também falhou:", e2.message);
    }
  }
  process.exit(1);
});
