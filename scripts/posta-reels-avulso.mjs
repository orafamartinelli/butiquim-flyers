// Posta um Reels avulso no @obutiquim pela fila (publicador n8n): capa embutida no 1º quadro (scripts/_capa.mjs), sobe, agenda.
// Uso: node scripts/posta-reels-avulso.mjs <video.mp4> <nome-no-bucket> <campanha> <legenda.txt> [AAAA-MM-DDTHH:MM (BRT); padrão = agora]
import { readFileSync, copyFileSync, statSync } from "fs";
import { execFileSync } from "child_process";
import { credSupabase, FFMPEG } from "./_cred.mjs";
import { comCapaNoInicio } from "./_capa.mjs";

const [video, nome, campanha, legendaArq, quando] = process.argv.slice(2);
if (!video || !nome || !campanha || !legendaArq) throw new Error("uso: <video> <nome-no-bucket> <campanha> <legenda.txt> [quando]");
const c = credSupabase();
const URL = c.project_url.replace(/\/$/, "");
const H = { apikey: c.secret_key, Authorization: `Bearer ${c.secret_key}` };
const local = `out/capas/${nome}`;
copyFileSync(video, local);
const capaSeg = process.env.CAPA_SEG ? Number(process.env.CAPA_SEG) : null; // quadro da capa (padrão: o último)
let comCapa = comCapaNoInicio(local, { capaSeg });
// bucket aceita até ~50 MB: acima de 45 MB converte p/ 30 fps com teto de 8 Mb/s (Instagram recodifica Reels nesse patamar)
if (statSync(comCapa).size > 45e6) {
  const leve = comCapa.replace(/\.mp4$/i, ".30fps.mp4");
  execFileSync(FFMPEG, ["-v", "error", "-y", "-i", comCapa, "-r", "30", "-c:v", "libx264", "-crf", "20", "-maxrate", "8M", "-bufsize", "16M", "-preset", "medium", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "-metadata", "comment=capa-no-inicio", leve]);
  console.log(`grande (${(statSync(comCapa).size / 1e6).toFixed(0)} MB) → ${(statSync(leve).size / 1e6).toFixed(0)} MB a 30 fps`);
  comCapa = leve;
}
const rel = `avulso/claude/${nome}`;
const up = await fetch(`${URL}/storage/v1/object/butiquim-social/${rel}`, { method: "POST", headers: { ...H, "Content-Type": "video/mp4", "x-upsert": "true" }, body: readFileSync(comCapa) });
if (!up.ok) throw new Error(`upload: ${up.status} ${await up.text()}`);
const publicar_em = quando ? `${quando}:00-03:00` : new Date(Date.now() - 60e3).toISOString();
const r = await fetch(`${URL}/rest/v1/butiquim_social_avulso`, {
  method: "POST",
  headers: { ...H, "Content-Type": "application/json", Prefer: "return=representation" },
  body: JSON.stringify({ campanha, ordem: 1, perfil: "obutiquim", formato: "REELS", publicar_em, video_url: `${URL}/storage/v1/object/public/butiquim-social/${rel}`, legenda: readFileSync(legendaArq, "utf8").trim(), thumb_offset_seg: 0 }),
});
const [l] = await r.json();
console.log(r.status, `#${l?.id} ${campanha} → ${publicar_em}`, rel);
