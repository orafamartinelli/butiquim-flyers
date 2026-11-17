// Aviso de rodada que caiu (16/11/2026) — passo "if: failure() || cancelled()" do refaz-noites.yml.
// Antes, rodada derrubada pelo teto de tempo morria calada (12–16/11: 5 dias sem ninguém saber).
const env = process.env;
const RAFA = "5544984232574";
const motivo = process.argv[2] || "falhou";
const url = `${env.GITHUB_SERVER_URL || "https://github.com"}/${env.GITHUB_REPOSITORY || ""}/actions/runs/${env.GITHUB_RUN_ID || ""}`;
const msg = [
  `⚠️ *Robô das nossas peças (refaz/noites novas) ${motivo === "cancelled" ? "foi derrubado pelo teto de tempo" : "falhou"}*`,
  "",
  "As peças que já tinham ficado prontas foram guardadas; a próxima rodada só faz o que falta.",
  "Cada noite tem no máximo 2 tentativas na nuvem — depois disso o robô para e o Claude refaz no PC.",
  `Detalhes: ${url}`,
].join("\n");
if (!env.ZAPI_INSTANCE_ID) { console.log(`[sem Z-API] ${msg}`); process.exit(0); }
const r = await fetch(`https://api.z-api.io/instances/${env.ZAPI_INSTANCE_ID}/token/${env.ZAPI_INSTANCE_TOKEN}/send-text`, {
  method: "POST", headers: { "Content-Type": "application/json", "Client-Token": env.ZAPI_CLIENT_TOKEN }, body: JSON.stringify({ phone: RAFA, message: msg }) });
console.log(`zap Rafa: HTTP ${r.status}`);
