// Agenda conferida em butiquim_social_posts (espelho da planilha oficial) em 26/09/2026.
export type DiaKey = "sexta" | "sabado" | "domingo";

export type Noite = {
  key: DiaKey;
  noite: string;
  artista: string;
  artistaLogo?: { src: string; ratio: number };
  foto: { src: string; ratio: number };
  clip: string;
  diaSemana: string;
  dia: string;
  mes: string;
  mesExtenso: string;
  hora: string;
  lista: [string, string];
  obs: string;
};

const OBS = "Após a 1ª hora, desconto na portaria para quem estiver na lista";

export const NOITES: Record<DiaKey, Noite> = {
  sexta: {
    key: "sexta",
    noite: "Sexta do Butica",
    artista: "GUI SILVA",
    foto: { src: "fotos/gui-silva.png", ratio: 0.606 },
    clip: "broll/gui.mp4",
    diaSemana: "SEXTA",
    dia: "02",
    mes: "OUT",
    mesExtenso: "OUTUBRO",
    hora: "23H",
    lista: ["LISTA FEM. FREE ATÉ 00H", "LISTA MASC. R$ 20 ATÉ 00H"],
    obs: OBS,
  },
  sabado: {
    key: "sabado",
    noite: "Sabadá do Butica",
    artista: "SOU VIBE",
    artistaLogo: { src: "logos/sou-vibe-branco.png", ratio: 3.3289 },
    foto: { src: "fotos/sou-vibe.png", ratio: 0.5742 },
    clip: "broll/souvibe.mp4",
    diaSemana: "SÁBADO",
    dia: "03",
    mes: "OUT",
    mesExtenso: "OUTUBRO",
    hora: "23H",
    lista: ["LISTA FEM. FREE ATÉ 00H", "LISTA MASC. R$ 20 ATÉ 00H"],
    obs: OBS,
  },
  domingo: {
    key: "domingo",
    noite: "Saideira da Semana",
    artista: "RICARDO RIBEIRO",
    artistaLogo: { src: "logos/ricardo-ribeiro-branco.png", ratio: 4.3433 },
    foto: { src: "fotos/ricardo-ribeiro.png", ratio: 0.6257 },
    clip: "broll/ricardo.mp4",
    diaSemana: "DOMINGO",
    dia: "04",
    mes: "OUT",
    mesExtenso: "OUTUBRO",
    hora: "22H",
    lista: ["LISTA FEM. FREE ATÉ 23H", "LISTA MASC. R$ 20 ATÉ 23H"],
    obs: OBS,
  },
};

export type Formato = "feed" | "story" | "broll";
export const DIM: Record<Formato, { w: number; h: number }> = {
  feed: { w: 1080, h: 1350 },
  story: { w: 1080, h: 1920 },
  broll: { w: 1080, h: 1920 },
};
