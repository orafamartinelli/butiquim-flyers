// CAPA DE CARROSSEL (11/11/2026, regra do Rafa): o Instagram mostra na grade o 1º QUADRO do 1º slide, e nossos vídeos
// começam vazios. Todo vídeo de feed que sobe para o bucket ganha ao lado `<nome>-capa.jpg` = ÚLTIMO quadro (arte completa).
// O publicador (n8n FQJoV3QU4YT1LDRn) vê carrossel começando com vídeo, acha a capa ao lado e põe na frente.
import { readFileSync } from "fs";
import { execFileSync } from "child_process";
import { FFMPEG } from "./_cred.mjs";

export const nomeCapa = (rel) => rel.replace(/\.(mp4|mov)$/i, "-capa.jpg");

// gera a capa do vídeo LOCAL e sobe ao lado do vídeo no bucket (upsert: vídeo trocado com o mesmo nome = capa nova)
export const sobeCapa = async ({ url, secret, local, rel }) => {
  const jpg = local.replace(/\.(mp4|mov)$/i, "-capa.jpg");
  execFileSync(FFMPEG, ["-v", "error", "-y", "-sseof", "-0.1", "-i", local, "-frames:v", "1", "-q:v", "2", jpg]);
  const r = await fetch(`${url}/storage/v1/object/butiquim-social/${nomeCapa(rel)}`, {
    method: "POST",
    headers: { apikey: secret, Authorization: `Bearer ${secret}`, "Content-Type": "image/jpeg", "x-upsert": "true" },
    body: readFileSync(jpg),
  });
  if (!r.ok) throw new Error(`upload capa ${nomeCapa(rel)}: ${r.status} ${await r.text()}`);
  return nomeCapa(rel);
};
