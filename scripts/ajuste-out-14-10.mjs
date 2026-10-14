// Ajustes de outubro pedidos em 14/10 (seguir a planilha):
//  1) sobe (upsert, mesmo caminho) as peças novas: sexta5 = SOU VIBE no lugar do Papo 10, domingos 18/25 e agendas s4/s5
//  2) fila pendente: troca "PAPO 10 (@grupo_papo10)" → "SOU VIBE (@souvibeoficial)" na legenda e na marcação
//  3) agenda de 20/10 (semana 23–25): inclui o domingo 25 (João Maurício) na legenda, no carrossel e nos stories
// Os posts dos dias de show 18 e 25 entram pelo fila-modelo-completo.mjs (NOITES ganhou domingo3/domingo4).
// Uso: node scripts/ajuste-out-14-10.mjs (simula) · node scripts/ajuste-out-14-10.mjs --gravar
import { readFileSync, existsSync } from "fs";
import { execFileSync } from "child_process";

const GRAVAR = process.argv.includes("--gravar");
const cred = JSON.parse(readFileSync("C:/Users/User/Documents/projetos/.credentials/supabase-new-api-keys.json", "utf8"));
const URL = cred.project_url.replace(/\/$/, "");
const H = { apikey: cred.secret_key, Authorization: `Bearer ${cred.secret_key}` };
const PUB = `${URL}/storage/v1/object/public/butiquim-social/`;
const FF = "C:/Users/User/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.2-full_build/bin/ffmpeg.exe";
const log = (...a) => console.log(...a);

const rest = async (path, opts = {}) => {
  const r = await fetch(`${URL}/rest/v1/${path}`, { ...opts, headers: { ...H, "Content-Type": "application/json", Prefer: "return=representation", ...(opts.headers || {}) } });
  if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  return r.status === 204 ? null : r.json();
};
const sobe = async (local, destino) => {
  if (!existsSync(local)) throw new Error(`falta ${local} (render terminou?)`);
  const tipo = destino.endsWith(".mp4") ? "video/mp4" : "image/jpeg";
  log(`upload ${local} → ${destino}`);
  if (GRAVAR) {
    const r = await fetch(`${URL}/storage/v1/object/butiquim-social/${destino}`, { method: "POST", headers: { ...H, "Content-Type": tipo, "x-upsert": "true" }, body: readFileSync(local) });
    if (!r.ok) throw new Error(`upload ${destino}: ${r.status} ${await r.text()}`);
  }
};
const jpg = (png) => {
  const j = png.replace(/\.png$/i, ".jpg");
  execFileSync(FF, ["-v", "error", "-y", "-i", png, "-q:v", "2", j]);
  return j;
};
const patch = async (id, campos, motivo) => {
  log(`PATCH #${id} (${motivo}): ${JSON.stringify(campos).slice(0, 220)}`);
  if (GRAVAR) await rest(`butiquim_social_avulso?id=eq.${id}`, { method: "PATCH", body: JSON.stringify({ ...campos, atualizado_em: new Date().toISOString() }) });
};

// ---------- 1) arquivos ----------
for (const k of ["sexta5", "domingo3", "domingo4", "domingo5"]) {
  await sobe(jpg(`out/final/${k}-FEED.png`), `avulso/claude/${k}-feed.jpg`);
  await sobe(`out/final/${k}-FEED.mp4`, `avulso/claude/${k}-feed.mp4`);
  await sobe(jpg(`out/final/${k}-STORY.png`), `avulso/claude/${k}-story.jpg`);
  await sobe(`out/final/${k}-STORY-BROLL.mp4`, `avulso/claude/${k}-broll.mp4`);
}
for (const s of ["s4", "s5"]) {
  await sobe(`out/agendas/agenda-${s}-FEED.mp4`, `avulso/claude/ag-${s}-feed.mp4`);
  await sobe(`out/agendas/agenda-${s}-STORY.mp4`, `avulso/claude/ag-${s}-story.mp4`);
}

// ---------- 2) Papo 10 → Sou Vibe na fila pendente ----------
const pend = await rest(`butiquim_social_avulso?select=id,campanha,ordem,legenda,marcados,itens_urls,video_url&status=eq.pendente&publicar_em=gte.${new Date().toISOString()}`);
for (const r of pend) {
  const c = {};
  if (r.legenda?.includes("grupo_papo10") || /PAPO 10/.test(r.legenda || "")) c.legenda = r.legenda.replaceAll("PAPO 10 (@grupo_papo10)", "SOU VIBE (@souvibeoficial)").replaceAll("PAPO 10", "SOU VIBE");
  if (r.marcados?.includes("grupo_papo10")) c.marcados = r.marcados.replaceAll("grupo_papo10", "souvibeoficial");
  if (Object.keys(c).length) await patch(r.id, c, `${r.campanha} #${r.ordem} papo10→souvibe`);
}

// ---------- 3) agendas de terça ganham o domingo que faltava ----------
//  20/10 (semana 23–25): domingo 25 João Maurício · 27/10 (semana 30/10–01/11, vira o mês): domingo 01/11 Ricardo Ribeiro
const SEMANAS = [
  { ter: "2026-10-20", sab: "24\\/10", k: "domingo4", ig: "joaomauricio_jm_", nome: "JOÃO MAURÍCIO", linha: "🎤 Domingo (25/10): JOÃO MAURÍCIO (@joaomauricio_jm_) · Sertanejo" },
  { ter: "2026-10-27", sab: "31\\/10", k: "domingo5", ig: "ricardo_ribeirosilva", nome: "RICARDO RIBEIRO", linha: "🎤 Domingo (01/11): RICARDO RIBEIRO (@ricardo_ribeirosilva) · Sertanejo" },
];
for (const s of SEMANAS) {
  for (const r of pend.filter((x) => [`agenda-claude-feed-${s.ter}`, `extra-claude-mais-${s.ter}`].includes(x.campanha))) {
    const c = {};
    // parte da legenda já corrigida no passo 2 (Papo 10 → Sou Vibe), senão o PATCH daqui desfaria a troca
    const leg = r.legenda?.replaceAll("PAPO 10 (@grupo_papo10)", "SOU VIBE (@souvibeoficial)").replaceAll("PAPO 10", "SOU VIBE");
    if (leg && !leg.includes(s.nome)) c.legenda = leg.replace(new RegExp(`(🎤 Sábado \\(${s.sab}\\)[^\\n]*)`), `$1\n${s.linha}`);
    if (r.itens_urls) {
      const itens = JSON.parse(r.itens_urls);
      const dom = PUB + `avulso/claude/${s.k}-feed.mp4`;
      if (!itens.includes(dom)) c.itens_urls = JSON.stringify([...itens, dom]);
    }
    if (Object.keys(c).length) await patch(r.id, c, `${r.campanha} + domingo`);
  }
  const stories = pend.filter((x) => x.campanha === `agenda-claude-story-${s.ter}`);
  const abre = stories.find((x) => x.ordem === 1);
  if (abre) {
    const marc = (abre.marcados || "").replaceAll("grupo_papo10", "souvibeoficial");
    if (!marc.includes(s.ig)) await patch(abre.id, { marcados: `${marc},${s.ig}` }, `story agenda ${s.ter} marca o domingo`);
  }
  const ultima = stories.reduce((m, x) => Math.max(m, x.ordem), 0);
  if (!stories.some((x) => x.video_url?.includes(`${s.k}-story`)) && ultima) {
    const hora = `17:${String(20 + ultima * 6).padStart(2, "0")}`;
    const linha = { campanha: `agenda-claude-story-${s.ter}`, ordem: ultima + 1, publicar_em: `${s.ter}T${hora}:00-03:00`, formato: "STORIES", video_url: PUB + `avulso/claude/${s.k}-story.jpg`, legenda: "", marcados: s.ig, perfil: "obutiquim" };
    log(`INSERT ${JSON.stringify(linha)}`);
    if (GRAVAR) await rest("butiquim_social_avulso", { method: "POST", body: JSON.stringify(linha) });
  }
}
log(GRAVAR ? "\nGRAVADO." : "\n(simulação — rode com --gravar)");
