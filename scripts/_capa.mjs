// CAPA NA RAIZ (11/11/2026, ideia do Rafa): o Instagram usa o 1º QUADRO do vídeo como miniatura (carrossel/grade),
// e nossos vídeos começam vazios/pretos — a arte só fica completa no fim. Ao SALVAR (subir) um vídeo de feed,
// o próprio vídeo passa a abrir com 0,1 s do ÚLTIMO quadro (arte completa) e depois roda normal.
// Sem arquivo de capa à parte, sem passo extra na publicação, vale em qualquer lugar onde o vídeo for usado.
import { execFileSync } from "child_process";
import { existsSync } from "fs";
import { FFMPEG } from "./_cred.mjs";

const QUADROS = 3; // 0,1 s a 30 fps — curto para não "piscar", longo para sobreviver à recodificação do Instagram

// vídeo de feed = pode virar miniatura (Reels/carrossel). Story/B-roll não passa por aqui.
export const ehVideoDeFeed = (destino) => /-feed[^/]*\.mp4$/i.test(destino);

// devolve o caminho de um mp4 NOVO (<local>.capa.mp4) que abre com o último quadro; o original fica intocado
// (idempotente: subir de novo o mesmo arquivo não empilha capas).
const MARCA = "capa-no-inicio";
const infoDe = (local) => { try { execFileSync(FFMPEG, ["-hide_banner", "-i", local], { stdio: "pipe" }); } catch (e) { return String(e.stderr || ""); } return ""; };
export const jaTemCapa = (local) => infoDe(local).includes(MARCA);

// capaSeg: segundo do quadro escolhido para capa (padrão = último quadro, a arte completa)
export const comCapaNoInicio = (local, { capaSeg = null } = {}) => {
  const info = infoDe(local);
  if (info.includes(MARCA)) return local; // já processado: não empilha
  const saida = local.replace(/\.mp4$/i, ".capa.mp4");
  const png = local.replace(/\.mp4$/i, ".ultimo.png");
  execFileSync(FFMPEG, ["-v", "error", "-y", ...(capaSeg == null ? ["-sseof", "-0.1"] : ["-ss", String(capaSeg)]), "-i", local, "-frames:v", "1", png]);
  const fps = +(info.match(/(\d+(?:\.\d+)?) fps/) || [])[1] || 30;
  const temAudio = /Audio:/.test(info);
  const dur = (QUADROS / fps).toFixed(4);
  const ms = Math.round((QUADROS / fps) * 1000);
  const filtro = [
    `[0:v]fps=${fps},format=yuv420p,setsar=1[c]`,
    `[1:v]fps=${fps},format=yuv420p,setsar=1[v]`,
    `[c][v]scale2ref[c2][v2]`,
    `[c2][v2]concat=n=2:v=1:a=0[o]`,
    ...(temAudio ? [`[1:a]adelay=${ms}:all=1[a]`] : []),
  ].join(";");
  execFileSync(FFMPEG, ["-v", "error", "-y", "-loop", "1", "-t", dur, "-i", png, "-i", local, "-filter_complex", filtro,
    "-map", "[o]", ...(temAudio ? ["-map", "[a]", "-c:a", "aac", "-b:a", "192k"] : []),
    "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-metadata", `comment=${MARCA}`, saida]);
  if (!existsSync(saida)) throw new Error("capa no início falhou: " + local);
  return saida;
};
