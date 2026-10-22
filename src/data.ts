// Agenda e estilo vêm do banco (scripts/sync-agenda.mjs → src/agenda.json):
// - atração de cada data = butiquim_social_posts (espelho da planilha oficial)
// - estilo = do ARTISTA (butiquim_social_artistas.estilo), não da noite: se o artista troca de dia, o selo acompanha
import agenda from "./agenda.json";

export type DiaKey = "sexta" | "sabado" | "domingo";

export type Noite = {
  key: DiaKey;
  data: string;
  noite: string;
  artista: string;
  estilo: string;
  estiloInferido: boolean;
  artistaLogo?: { src: string; ratio: number };
  foto: { src: string; ratio: number };
  clip: string;
  clipTop?: number;
  diaSemana: string;
  dia: string;
  mes: string;
  mesExtenso: string;
  hora: string;
  lista: [string, string];
  obs: string;
};

// subtítulo fixo do selo de estilo (pedido do Rafa em 26/09)
export const SUBESTILO = "+ SpotiFunk";

const OBS = "Após a 1ª hora, desconto na portaria para quem estiver na lista";

// regras de cada dia da semana (getUTCDay: 5 sexta, 6 sábado, 0 domingo)
const DIAS: Record<number, Pick<Noite, "key" | "noite" | "diaSemana" | "hora" | "lista">> = {
  5: { key: "sexta", noite: "Sexta do Butica", diaSemana: "SEXTA", hora: "23H", lista: ["LISTA FEM. FREE ATÉ 00H", "LISTA MASC. R$ 20 ATÉ 00H"] },
  6: { key: "sabado", noite: "Sabadá do Butica", diaSemana: "SÁBADO", hora: "23H", lista: ["LISTA FEM. FREE ATÉ 00H", "LISTA MASC. R$ 20 ATÉ 00H"] },
  0: { key: "domingo", noite: "Saideira da Semana", diaSemana: "DOMINGO", hora: "22H", lista: ["LISTA FEM. FREE ATÉ 23H", "LISTA MASC. R$ 20 ATÉ 23H"] },
};

// regras fixas de um dia da semana (para peças sem artista, ex.: artes de LISTA)
export type RegraDia = Pick<Noite, "key" | "noite" | "diaSemana" | "hora" | "lista" | "obs">;
export const regraDia = (key: Noite["key"]): RegraDia => {
  const r = Object.values(DIAS).find((d) => d.key === key)!;
  return { ...r, obs: OBS };
};

// feriados (butiquim_social_feriados): a noite anterior é véspera
export const FERIADOS: Record<string, string> = {
  "2026-10-12": "Nossa Senhora Aparecida",
  "2026-11-02": "Finados",
  "2026-11-15": "Proclamação da República",
  "2026-11-20": "Consciência Negra",
  "2026-12-25": "Natal",
};
export const feriadoSeguinte = (data: string) => {
  const d = new Date(`${data}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  const iso = d.toISOString().slice(0, 10);
  return FERIADOS[iso] ? { data: iso, nome: FERIADOS[iso], dia: String(d.getUTCDate()).padStart(2, "0"), mes: String(d.getUTCMonth() + 1).padStart(2, "0") } : null;
};

// material de cada artista (foto oficial dos PSDs do designer + trecho de vídeo)
const ARTISTAS: Record<string, { nome: string; foto: Noite["foto"]; clip: string; clipTop?: number; logo?: Noite["artistaLogo"] }> = {
  "gui-silva": { nome: "GUI SILVA", foto: { src: "fotos/gui-silva.png", ratio: 0.606 }, clip: "broll/gui.mp4" },
  "sou-vibe": { nome: "SOU VIBE", foto: { src: "fotos/sou-vibe.png", ratio: 0.5742 }, clip: "broll/souvibe.mp4", logo: { src: "logos/sou-vibe-branco.png", ratio: 3.3289 } },
  "ricardo-ribeiro": { nome: "RICARDO RIBEIRO", foto: { src: "fotos/ricardo-ribeiro.png", ratio: 0.6257 }, clip: "broll/ricardo.mp4", logo: { src: "logos/ricardo-ribeiro-branco.png", ratio: 4.3433 } },
  "grupo-rilex": { nome: "GRUPO RILEX", foto: { src: "fotos/grupo-rilex.png", ratio: 1.5339 }, clip: "broll/rilex.mp4" },
  cqsamba: { nome: "CQ SAMBA", foto: { src: "fotos/cqsamba.png", ratio: 0.6699 }, clip: "broll/cqsamba.mp4", logo: { src: "logos/cqsamba-branco.png", ratio: 1.363 } },
  "biannchi-e-cristiano": { nome: "BIANNCHI & CRISTIANO", foto: { src: "fotos/biannchi-e-cristiano.png", ratio: 1.0823 }, clip: "broll/biannchi.mp4", clipTop: -140 },
  // clipTop: deslocamento do vídeo no B-roll (Hilana está no alto do quadro, desce pra não ficar sob o logo)
  hilana: { nome: "HILANA", foto: { src: "fotos/hilana.png", ratio: 0.5868 }, clip: "broll/hilana.mp4", clipTop: 200 },
  "pagode-44": { nome: "PAGODE 44", foto: { src: "fotos/pagode-44.png", ratio: 1.1382 }, clip: "broll/pagode44.mp4", logo: { src: "logos/pagode-44.png", ratio: 2.1576 } },
  "juntou-deu-samba": { nome: "JUNTOU DEU SAMBA", foto: { src: "fotos/juntou-deu-samba.png", ratio: 0.6287 }, clip: "broll/juntou.mp4" },
  "juninho-cari": { nome: "JUNINHO CARI", foto: { src: "fotos/juninho-cari.png", ratio: 0.4173 }, clip: "broll/juninho.mp4", logo: { src: "logos/juninho-cari.png", ratio: 2.8366 } },
  // vídeo do Papo 10 tem legenda de música no meio do quadro: enquadra a parte de cima e a legenda cai sob a faixa corrida
  "papo-10": { nome: "PAPO 10", foto: { src: "fotos/papo-10.png", ratio: 0.835 }, clip: "broll/papo10.mp4", clipTop: 40 },
  // domingos 18 e 25/10 (entraram na planilha depois do lote de 26/09): foto do PSD do Saideira de 30/09
  "allister-ferraz": { nome: "ALISTER FERRAZ", foto: { src: "fotos/allister-ferraz.png", ratio: 0.475 }, clip: "broll/alister.mp4", clipTop: -180 },
  "joao-mauricio": { nome: "JOÃO MAURÍCIO", foto: { src: "fotos/joao-mauricio.png", ratio: 0.7063 }, clip: "broll/joao.mp4" },
  "deixa-clarear": { nome: "DEIXA CLAREAR", foto: { src: "fotos/deixa-clarear.png", ratio: 0.7136 }, clip: "broll/deixaclarear.mp4", logo: { src: "logos/deixa-clarear.png", ratio: 8.0493 } },
};

const MESES = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
const MESES_EXT = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];

export const noiteDe = (data: string): Noite => {
  const a = agenda.noites.find((x) => x.data === data);
  if (!a) throw new Error(`Sem atração em ${data} na agenda (rodar scripts/sync-agenda.mjs)`);
  const art = ARTISTAS[a.slug];
  if (!art) throw new Error(`Falta foto/vídeo do artista ${a.slug} em src/data.ts`);
  if (!a.estilo) throw new Error(`${a.nome} sem estilo em butiquim_social_artistas`);
  const d = new Date(`${data}T12:00:00Z`);
  const regra = DIAS[d.getUTCDay()];
  if (!regra) throw new Error(`${data} não é sexta, sábado ou domingo`);
  return {
    ...regra,
    data,
    artista: art.nome,
    estilo: a.estilo,
    estiloInferido: !!a.estilo_inferido,
    artistaLogo: art.logo,
    foto: art.foto,
    clip: art.clip,
    clipTop: art.clipTop,
    dia: String(d.getUTCDate()).padStart(2, "0"),
    mes: MESES[d.getUTCMonth()],
    mesExtenso: MESES_EXT[d.getUTCMonth()],
    obs: OBS,
  };
};

// composições: 1º fds nas identidades A (placa/vidro/rótulo), 2º fds nas identidades B
export const NOITES = {
  sexta: noiteDe("2026-10-02"),
  sabado: noiteDe("2026-10-03"),
  domingo: noiteDe("2026-10-04"),
  sexta2: noiteDe("2026-10-09"),
  sabado2: noiteDe("2026-10-10"),
  domingo2: noiteDe("2026-10-11"),
  // 3ª semana (A), 4ª (B), 5ª (A) — domingos 18 e 25 entraram na planilha depois (feitos em 14/10)
  sexta3: noiteDe("2026-10-16"),
  sabado3: noiteDe("2026-10-17"),
  domingo3: noiteDe("2026-10-18"),
  sexta4: noiteDe("2026-10-23"),
  sabado4: noiteDe("2026-10-24"),
  domingo4: noiteDe("2026-10-25"),
  // sexta5 = 30/10: a planilha trocou Papo 10 → Sou Vibe (14/10); segue a planilha via agenda.json
  // domingo5 = 01/11: fecha o fim de semana que vira o mês (entra na agenda de 30/10, identidade A)
  domingo5: noiteDe("2026-11-01"),
  sexta5: noiteDe("2026-10-30"),
  sabado5: noiteDe("2026-10-31"),
  // véspera de feriado (identidade própria): domingo 11/10, véspera de Nossa Senhora Aparecida
  vespera1: noiteDe("2026-10-11"),
  // domingo 01/11, véspera de Finados (Rafa 14/10: temática de véspera no dia 1º, junto com o flyer normal)
  vespera2: noiteDe("2026-11-01"),
  // NOVEMBRO (produzido 14/10) — rodízio continua: sem 6 B, 7 A, 8 B, 9 A. Noites vazias na planilha: 13, 15, 20, 29
  sexta6: noiteDe("2026-11-06"),
  sabado6: noiteDe("2026-11-07"),
  domingo6: noiteDe("2026-11-08"),
  sabado7: noiteDe("2026-11-14"),
  vespera3: noiteDe("2026-11-14"), // sábado 14, véspera da Proclamação da República (dom 15)
  domingo7: noiteDe("2026-11-15"), // Victor preencheu depois de 14/10 (João Maurício); produzido 19/10
  sabado8: noiteDe("2026-11-21"),
  domingo8: noiteDe("2026-11-22"),
  sexta9: noiteDe("2026-11-27"),
  sabado9: noiteDe("2026-11-28"),
  // DEZEMBRO (produzido 22/10) — daqui em diante a identidade vem da rotação (src/rotacao.ts): sem 10 C · 11 D · 12 A · 13 B.
  // Vazias na planilha: sáb 05, dom 06 e sex 25 (Natal). Chave = dia + número da semana (scripts/_rotacao.mjs chaveDe).
  sexta10: noiteDe("2026-12-04"),
  sexta11: noiteDe("2026-12-11"),
  sabado11: noiteDe("2026-12-12"),
  domingo11: noiteDe("2026-12-13"),
  sexta12: noiteDe("2026-12-18"),
  sabado12: noiteDe("2026-12-19"),
  domingo12: noiteDe("2026-12-20"),
  sabado13: noiteDe("2026-12-26"),
  domingo13: noiteDe("2026-12-27"),
};
export type NoiteKey = keyof typeof NOITES;

export type Formato = "feed" | "story" | "broll";
export const DIM: Record<Formato, { w: number; h: number }> = {
  feed: { w: 1080, h: 1350 },
  story: { w: 1080, h: 1920 },
  broll: { w: 1080, h: 1920 },
};
