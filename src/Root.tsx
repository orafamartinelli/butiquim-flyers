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
  sexta4: SextaB,
  sabado4: SabadoB,
  sexta5: Sexta,
  sabado5: Sabado,
};

const DUR: Record<Formato, number> = { feed: 240, story: 240, broll: 300 };

// o feed em vídeo leva o som do próprio artista (o B-roll já traz o áudio do clipe)
const Trilha: React.FC<{ src: string; dur: number }> = ({ src, dur }) => (
  <Html5Audio src={staticFile(src)} volume={(f) => interpolate(f, [0, 12, dur - 20, dur], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
);

export const RemotionRoot: React.FC = () => (
  <>
    <Still id="teste-o" component={TesteO} width={1620} height={600} />
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
