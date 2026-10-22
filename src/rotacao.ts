// Rotação das identidades (decisão do Rafa 20/10 e 22/10/2026) — espelho de scripts/_rotacao.mjs (manter os dois iguais).
// Semana = contada a partir da sexta 02/10/2026 (semana 1), de segunda a domingo.
// Semanas 1–9 (out–nov) alternam A/B como foram produzidas; da semana 10 (04/12/2026) em diante gira C → D → A → B
// (domingo só tem 3 identidades: gira C → A → B). Agenda de terça: V1 → V2 → V3 pela semana.
import { DiaKey } from "./data";

export type Identidade = "A" | "B" | "C" | "D";
const SEMANA1 = Date.UTC(2026, 8, 28); // segunda 28/09/2026
const utc = (data: string) => Date.UTC(+data.slice(0, 4), +data.slice(5, 7) - 1, +data.slice(8, 10));
export const semanaDe = (data: string) => Math.floor((utc(data) - SEMANA1) / (7 * 86400e3)) + 1;
export const diaDe = (data: string): DiaKey => (({ 5: "sexta", 6: "sabado", 0: "domingo" } as Record<number, DiaKey>)[new Date(utc(data)).getUTCDay()]);
export const identidadeDe = (data: string): Identidade => {
  const s = semanaDe(data);
  if (s <= 9) return s % 2 ? "A" : "B";
  return diaDe(data) === "domingo" ? (["C", "A", "B"] as const)[(s - 10) % 3] : (["C", "D", "A", "B"] as const)[(s - 10) % 4];
};
export const agendaVersao = (s: number) => (["V1", "V2", "V3"] as const)[(s - 1) % 3];
