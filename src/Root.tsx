import React from "react";
import { AbsoluteFill, Composition, Html5Audio, Still, interpolate, staticFile } from "remotion";
import "./fonts";
import { DIM, Formato, NOITES, Noite, NoiteKey } from "./data";
import { Sexta } from "./ids/Sexta";
import { Sabado } from "./ids/Sabado";
import { Domingo } from "./ids/Domingo";
import { SextaB } from "./ids/SextaB";
import { SabadoB } from "./ids/SabadoB";
import { DomingoB } from "./ids/DomingoB";
import { SextaC } from "./ids/SextaC";
import { SabadoC } from "./ids/SabadoC";
import { DomingoC } from "./ids/DomingoC";
import { SextaD } from "./ids/SextaD";
import { SabadoD } from "./ids/SabadoD";
import { TesteO } from "./Teste";
import { AGENDA_DUR, AgendaV1, AgendaV2, AgendaV3, TrilhaAgenda } from "./agenda/AgendaSemana";

type Id = React.FC<{ n: Noite; fmt: Formato }>;

// cada noite com a identidade que vai usar (A = 1º fds, B = 2º fds)
const IDS: Partial<Record<NoiteKey, Id>> = {
  sexta: Sexta,
  sabado: Sabado,
  domingo: Domingo,
  sexta2: SextaB,
  sabado2: SabadoB,
  domingo2: DomingoB,
  sexta3: Sexta,
  sabado3: Sabado,
  domingo3: Domingo,
  sexta4: SextaB,
  sabado4: SabadoB,
  domingo4: DomingoB,
  sexta5: Sexta,
  sabado5: Sabado,
  domingo5: Domingo,
  // novembro: sem 6 B · 7 A · 8 B · 9 A
  sexta6: SextaB,
  sabado6: SabadoB,
  domingo6: DomingoB,
  sabado7: Sabado,
  domingo7: Domingo,
  sabado8: SabadoB,
  domingo8: DomingoB,
  sexta9: Sexta,
  sabado9: Sabado,
};

const DUR: Record<Formato, number> = { feed: 240, story: 240, broll: 300 };

// o feed em vídeo leva o som do próprio artista (o B-roll já traz o áudio do clipe)
const Trilha: React.FC<{ src: string; dur: number }> = ({ src, dur }) => (
  <Html5Audio src={staticFile(src)} volume={(f) => interpolate(f, [0, 12, dur - 20, dur], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
);

export const RemotionRoot: React.FC = () => (
  <>
    <Still id="teste-o" component={TesteO} width={1620} height={600} />
    {/* identidades C (19/10): amostras só em feed, com um artista de exemplo por dia, para o Rafa validar */}
    {(
      [
        ["sexta", SextaC, NOITES.sexta9],
        ["sexta2", SextaC, NOITES.sexta6], // lambe com artista sozinha (Hilana), pedido do Rafa 20/10
        ["sabado", SabadoC, NOITES.sabado9],
        ["domingo", DomingoC, NOITES.domingo7],
        // identidades D (20/10, "mais 2 novas"): mesa vista de cima (sexta) e pôster de cinema (sábado)
        ["sextaD", SextaD, NOITES.sexta6],
        ["sabadoD", SabadoD, NOITES.sabado8],
      ] as const
    ).flatMap(([k, C, n]) =>
      (["feed", "story", "broll"] as Formato[]).map((fmt) => {
        const Comp: React.FC = () => (
          <AbsoluteFill>
            <C n={n} fmt={fmt} />
            {fmt !== "broll" && <Trilha src={n.clip} dur={DUR[fmt]} />}
          </AbsoluteFill>
        );
        return <Composition key={`c-${k}-${fmt}`} id={`c-${k}-${fmt}`} component={Comp} durationInFrames={DUR[fmt]} fps={30} width={DIM[fmt].w} height={DIM[fmt].h} />;
      }),
    )}
    {/* agenda da semana 02–04/10: 3 versões × feed/story, estática (parado) e vídeo com a trilha dos artistas */}
    {([["v1", AgendaV1], ["v2", AgendaV2], ["v3", AgendaV3]] as const).flatMap(([v, C]) =>
      (["feed", "story"] as const).flatMap((fmt) => {
        const noites = [NOITES.sexta, NOITES.sabado, NOITES.domingo];
        const h = fmt === "feed" ? 1350 : 1920;
        const Parado: React.FC = () => <C noites={noites} fmt={fmt} periodo="02 A 04" parado />;
        const Video: React.FC = () => (
          <AbsoluteFill>
            <C noites={noites} fmt={fmt} periodo="02 A 04" />
            <TrilhaAgenda noites={noites} />
          </AbsoluteFill>
        );
        return [
          <Still key={`agenda-${v}-${fmt}`} id={`agenda-${v}-${fmt}`} component={Parado} width={1080} height={h} />,
          <Composition key={`agenda-${v}-${fmt}-video`} id={`agenda-${v}-${fmt}-video`} component={Video} durationInFrames={AGENDA_DUR} fps={30} width={1080} height={h} />,
        ];
      }),
    )}
    {/* agendas de outubro em rodízio V1 → V2 → V3 (feed na segunda com a agenda da esteira; stories na terça) */}
    {(
      [
        ["s1", AgendaV1, "02 A 04", [NOITES.sexta, NOITES.sabado, NOITES.domingo]],
        ["s2", AgendaV2, "09 A 11", [NOITES.sexta2, NOITES.sabado2, NOITES.domingo2]],
        ["s3", AgendaV3, "16 A 18", [NOITES.sexta3, NOITES.sabado3, NOITES.domingo3]],
        ["s4", AgendaV1, "23 A 25", [NOITES.sexta4, NOITES.sabado4, NOITES.domingo4]],
        ["s5", AgendaV2, "30/10 A 01/11", [NOITES.sexta5, NOITES.sabado5, NOITES.domingo5]],
        // novembro (terças 03, 10, 17, 24) — rodízio V3 → V1 → V2 → V3
        ["s6", AgendaV3, "06 A 08", [NOITES.sexta6, NOITES.sabado6, NOITES.domingo6]],
        // s7 (terça 10/11, semana 13–15): pendente — sáb 14 e dom 15 preenchidos, falta a sexta 13. Entra quando o Victor fechar o 13
        ["s8", AgendaV2, "21 E 22", [NOITES.sabado8, NOITES.domingo8]],
        ["s9", AgendaV3, "27 E 28", [NOITES.sexta9, NOITES.sabado9]],
      ] as const
    ).flatMap(([s, C, periodo, ns]) =>
      (["feed", "story"] as const).flatMap((fmt) => {
        const noites = [...ns];
        const h = fmt === "feed" ? 1350 : 1920;
        const Parado: React.FC = () => <C noites={noites} fmt={fmt} periodo={periodo} parado />;
        const Video: React.FC = () => (
          <AbsoluteFill>
            <C noites={noites} fmt={fmt} periodo={periodo} />
            <TrilhaAgenda noites={noites} />
          </AbsoluteFill>
        );
        return [
          <Still key={`agenda-${s}-${fmt}`} id={`agenda-${s}-${fmt}`} component={Parado} width={1080} height={h} />,
          <Composition key={`agenda-${s}-${fmt}-video`} id={`agenda-${s}-${fmt}-video`} component={Video} durationInFrames={AGENDA_DUR} fps={30} width={1080} height={h} />,
        ];
      }),
    )}
    {(Object.keys(IDS) as NoiteKey[]).flatMap((k) =>
      (["feed", "story", "broll"] as Formato[]).map((fmt) => {
        const C = IDS[k]!;
        const n = NOITES[k];
        const Comp: React.FC = () => (
          <AbsoluteFill>
            <C n={n} fmt={fmt} />
            {fmt !== "broll" && <Trilha src={n.clip} dur={DUR[fmt]} />}
          </AbsoluteFill>
        );
        return <Composition key={`${k}-${fmt}`} id={`${k}-${fmt}`} component={Comp} durationInFrames={DUR[fmt]} fps={30} width={DIM[fmt].w} height={DIM[fmt].h} />;
      }),
    )}
  </>
);
