// Gera o QR da porta da campanha "A primeira é nossa" -> public/fotos/primeira-vez/qr-porta.svg
// Uso: node scripts/gera-qr-primeira-vez.mjs
import QRCode from "qrcode";
import { writeFileSync } from "node:fs";

const ALVO = "https://lista.obutiquim.com.br/primeira-vez/?utm_source=qr_porta&utm_medium=casa&utm_campaign=PrimeiraVez";
const svg = await QRCode.toString(ALVO, {
  type: "svg",
  errorCorrectionLevel: "Q",
  margin: 0,
  color: { dark: "#0B0B0D", light: "#00000000" },
});
writeFileSync(new URL("../public/fotos/primeira-vez/qr-porta.svg", import.meta.url), svg);
console.log("QR ok:", ALVO);
