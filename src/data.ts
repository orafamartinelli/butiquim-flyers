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

// material de cada artista (foto oficial dos PSDs do designer + trecho de vídeo)
const ARTISTAS: Record<string, { nome: string; foto: Noite["foto"]; clip: string; clipTop?: number; logo?: Noite["artistaLogo"] }> = {
  "gui-silva": { nome: "GUI SILVA", foto: { src: "fotos/gui-silva.png", ratio: 0.606 }, clip: "broll/gui.mp4" },
  "sou-vibe": { nome: "SOU VIBE", foto: { src: "fotos/sou-vibe.png", ratio: 0.5742 }, clip: "broll/souvibe.mp4", logo: { src: "logos/sou-vibe-branco.png", ratio: 3.3289 } },
  "ricardo-ribeiro": { nome: "RICARDO RIBEIRO", foto: { src: "fotos/ricardo-ribeiro.png", ratio: 0.6257 }, clip: "broll/ricardo.mp4", logo: { src: "logos/ricardo-ribeiro-branco.png", ratio: 4.3433 } },
  "grupo-rilex": { nome: "GRUPO RILEX", foto: { src: "fotos/grupo-rilex.png", ratio: 1.5339 }, clip: "broll/rilex.mp4" },
  cqsamba: { nome: "CQ SAMBA", foto: { src: "fotos/cqsamba.png", ratio: 0.6699 }, clip: "broll/cqsamba.mp4", logo: { src: "logos/cqsamba-branco.png", ratio: 1.363 } },
  "biannchi-e-cristiano": { nome: "BIANNCHI & CRISTIANO", foto: { src: "fotos/biannchi-e-cristiano.png", ratio: 1.0823 }, clip: "broll/biannchi.mp4" },
  // clipTop: deslocamento do vídeo no B-roll (Hilana está no alto do quadro, desce pra não ficar sob o logo)
  hilana: { nome: "HILANA", foto: { src: "fotos/hilana.png", ratio: 0.5868 }, clip: "broll/hilana.mp4", clipTop: 200 },
  "pagode-44": { nome: "PAGODE 44", foto: { src: "fotos/pagode-44.png", ratio: 1.1382 }, clip: "broll/pagode44.mp4", logo: { src: "logos/pagode-44.png", ratio: 2.1576 } },
  "juntou-deu-samba": { nome: "JUNTOU DEU SAMBA", foto: { src: "fotos/juntou-deu-samba.png", ratio: 0.6287 }, clip: "broll/juntou.mp4" },
  "juninho-cari": { nome: "JUNINHO CARI", foto: { src: "fotos/juninho-cari.png", ratio: 0.4173 }, clip: "broll/juninho.mp4", logo: { src: "logos/juninho-cari.png", ratio: 2.8366 } },
  // vídeo do Papo 10 tem legenda de música no meio do quadro: enquadra a parte de cima e a legenda cai sob a faixa corrida
  "papo-10": { nome: "PAPO 10", foto: { src: "fotos/papo-10.png", ratio: 0.835 }, clip: "broll/papo10.mp4", clipTop: 40 },
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
  // 3ª semana (A), 4ª (B), 5ª (A) — domingos 18 e 25 sem atração: pulados
  sexta3: noiteDe("2026-10-16"),
  sabado3: noiteDe("2026-10-17"),
  sexta4: noiteDe("2026-10-23"),
  sabado4: noiteDe("2026-10-24"),
  sexta5: noiteDe("2026-10-30"),
  sabado5: noiteDe("2026-10-31"),
};
export type NoiteKey = keyof typeof NOITES;

export type Formato = "feed" | "story" | "broll";
export const DIM: Record<Formato, { w: number; h: number }> = {
  feed: { w: 1080, h: 1350 },
  story: { w: 1080, h: 1920 },
  broll: { w: 1080, h: 1920 },
};
