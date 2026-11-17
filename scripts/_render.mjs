// RENDER DEFENSIVO (16/11/2026) — usado por refaz-noites.mjs e noites-novas.mjs.
//
// Por que existe: de 12 a 16/11 o refaz-noites travou 5 dias seguidos no último vídeo da agenda s12
// (o Remotion terminava o vídeo e não fechava). Sem cronômetro, cada rodada ficava parada até o teto de
// 170 min do GitHub, era derrubada sem avisar ninguém e no dia seguinte recomeçava do zero
// (850 min jogados fora). Defesas:
//   1. cronômetro por peça (RENDER_TETO_MIN, padrão 20 min still/vídeo) — travou, mata e tenta 1× de novo;
//   2. peça já pronta pula: cada arquivo ganha um "<arquivo>.sig" com a assinatura (artista/semana);
//      a pasta out/ é guardada em cache pelo workflow, então a próxima rodada só faz o que falta;
//   3. o processo do Remotion é chamado direto (sem npx no meio) para o cronômetro matar o processo certo.
import { execFileSync } from "child_process";
import { existsSync, readFileSync, writeFileSync, unlinkSync } from "fs";
import os from "os";

const WIN = process.platform === "win32";
const TETO_MS = Number(process.env.RENDER_TETO_MIN || 20) * 60e3;
const BIN = WIN ? "npx.cmd" : existsSync("node_modules/.bin/remotion") ? "node_modules/.bin/remotion" : "npx";

function roda(args) {
  const a = BIN === "npx" || BIN === "npx.cmd" ? ["remotion", ...args] : args;
  execFileSync(BIN, a, { stdio: "inherit", shell: WIN, timeout: TETO_MS, killSignal: "SIGKILL" });
}

// sobras de um render morto (Chrome/ffmpeg órfãos) — só no runner Linux, que é descartável e só nosso
function limpaOrfaos() {
  if (WIN) return;
  for (const p of ["ffmpeg", "chrome-headless-shell", "remotion"]) {
    try { execFileSync("pkill", ["-9", "-f", p], { stdio: "ignore" }); } catch {}
  }
}

export function criaRender({ GL, log = console.log }) {
  const NUCLEOS = Math.max(1, Math.min(4, os.cpus().length));
  const pronto = (out, sig) => existsSync(out) && existsSync(`${out}.sig`) && readFileSync(`${out}.sig`, "utf8") === sig;

  const comDefesa = (rotulo, out, sig, args) => {
    if (sig && pronto(out, sig)) { log(`⏭️  ${rotulo} já pronto (rodada anterior) — pulando`); return; }
    for (let tentativa = 1; tentativa <= 2; tentativa++) {
      const t0 = Date.now();
      try {
        roda(args);
        if (sig) writeFileSync(`${out}.sig`, sig);
        log(`✔ ${rotulo} em ${Math.round((Date.now() - t0) / 1000)} s`);
        return;
      } catch (e) {
        const travou = e.code === "ETIMEDOUT" || e.signal === "SIGKILL";
        log(`⚠️ ${rotulo}: ${travou ? `passou de ${TETO_MS / 60e3} min (travou)` : `falhou (${String(e.message).slice(0, 120)})`} — tentativa ${tentativa}/2`);
        limpaOrfaos();
        try { if (existsSync(out)) unlinkSync(out); } catch {}
        if (tentativa === 2) throw new Error(`${rotulo} ${travou ? "travou 2×" : "falhou 2×"}`);
      }
    }
  };

  return {
    bundle: (entry, outDir) => roda(["bundle", entry, `--out-dir=${outDir}`, "--log=error"]),
    still: (b, id, out, frame, sig) => comDefesa(id, out, sig, ["still", b, id, out, ...(frame ? [`--frame=${frame}`] : []), `--gl=${GL}`, "--log=error"]),
    video: (b, id, out, sig) => comDefesa(id, out, sig, ["render", b, id, out, "--codec=h264", "--crf=18", `--gl=${GL}`, `--concurrency=${NUCLEOS}`, "--log=error"]),
  };
}
