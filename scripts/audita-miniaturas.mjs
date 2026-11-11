// AUDITORIA DE MINIATURAS (11/11/2026) — para cada post de vídeo pendente que aparece na grade (REELS e CARROSSEL que abre
// com vídeo), extrai o quadro que o Instagram vai usar como miniatura (Reels: thumb_offset_seg, ou 0; carrossel: 1º quadro),
// mede brilho/variação (vazio = escuro e liso) e monta uma folha de contato para conferência visual.
// Uso: node scripts/audita-miniaturas.mjs  → out/auditoria/folha-N.jpg + lista no console
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { execFileSync } from "child_process";
import { credSupabase, FFMPEG } from "./_cred.mjs";

const c = credSupabase();
const URL = c.project_url.replace(/\/$/, "");
const H = { apikey: c.secret_key, Authorization: `Bearer ${c.secret_key}` };
const D = "out/auditoria";
mkdirSync(D, { recursive: true });
const ehVideo = (u) => /\.(mp4|mov)(\?|$)/i.test(u || "");
const linhas = await (await fetch(`${URL}/rest/v1/butiquim_social_avulso?select=id,campanha,formato,publicar_em,video_url,itens_urls,thumb_offset_seg&status=eq.pendente&formato=in.(REELS,CAROUSEL)&order=publicar_em&limit=2000`, { headers: H })).json();
const alvos = [];
for (const l of linhas) {
  if (l.formato === "REELS") alvos.push({ ...l, video: l.video_url, seg: Number(l.thumb_offset_seg || 0) });
  else { const u = JSON.parse(l.itens_urls || "[]")[0]; if (ehVideo(u)) alvos.push({ ...l, video: u, seg: 0 }); }
}
console.log(`pendentes na grade: ${linhas.length} · com vídeo como miniatura: ${alvos.length}`);
const cache = {};
const resultados = [];
for (const a of alvos) {
  const nome = a.video.split("/").pop().split("?")[0];
  const local = `${D}/${nome}`;
  if (!cache[a.video]) { writeFileSync(local, Buffer.from(await (await fetch(a.video + "?t=" + Date.now())).arrayBuffer())); cache[a.video] = 1; }
  const jpg = `${D}/${a.id}.jpg`;
  execFileSync(FFMPEG, ["-v", "error", "-y", "-ss", String(a.seg), "-i", local, "-frames:v", "1", "-vf", "scale=240:-2", jpg]);
  let st = "";
  try { execFileSync(FFMPEG, ["-hide_banner", "-i", jpg, "-vf", "signalstats,metadata=print", "-f", "null", "-"], { stdio: "pipe" }); } catch {}
  try { st = String(execFileSync(FFMPEG, ["-hide_banner", "-i", jpg, "-vf", "signalstats,metadata=print:file=-", "-f", "null", "-"], { stdio: ["ignore", "pipe", "pipe"] })); } catch (e) { st = String(e.stdout || ""); }
  const yavg = +(st.match(/YAVG=([\d.]+)/) || [])[1];
  const ydif = +(st.match(/YDIF=([\d.]+)/) || [])[1];
  const ymax = +(st.match(/YMAX=([\d.]+)/) || [])[1], ymin = +(st.match(/YMIN=([\d.]+)/) || [])[1];
  const contraste = ymax - ymin;
  const vazio = yavg < 25 || contraste < 60;
  resultados.push({ id: a.id, quando: a.publicar_em.slice(5, 16).replace("T", " "), formato: a.formato, campanha: a.campanha, arquivo: nome, seg: a.seg, yavg: Math.round(yavg), contraste, vazio, jpg });
}
for (const r of resultados) console.log(`${r.vazio ? "❌" : "✅"} #${r.id} ${r.quando} ${r.formato.padEnd(8)} ${r.arquivo} @${r.seg}s brilho=${r.yavg} contraste=${r.contraste}`);
// folhas de contato 8x3
const POR = 24;
for (let i = 0; i < resultados.length; i += POR) {
  const lote = resultados.slice(i, i + POR);
  const ins = lote.flatMap((r) => ["-i", r.jpg]);
  const f = lote.map((r, k) => `[${k}:v]scale=240:300,setsar=1,pad=244:304:2:2:${r.vazio ? "red" : "black"}[v${k}]`).join(";");
  const lay = lote.map((_, k) => `${(k % 8) * 244}_${Math.floor(k / 8) * 304}`).join("|");
  execFileSync(FFMPEG, ["-v", "error", "-y", ...ins, "-filter_complex", `${f};${lote.map((_, k) => `[v${k}]`).join("")}xstack=inputs=${lote.length}:layout=${lay}:fill=black`, `${D}/folha-${i / POR + 1}.jpg`]);
  console.log(`folha ${i / POR + 1}: ${lote.map((r) => "#" + r.id).join(" ")}`);
}
writeFileSync(`${D}/resultado.json`, JSON.stringify(resultados, null, 2));
