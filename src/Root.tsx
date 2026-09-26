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

type Id = React.FC<{ n: Noite; fmt: Formato }>;

// cada noite com a identidade que vai usar (A = 1º fds, B = 2º fds)
const IDS: Partial<Record<NoiteKey, Id>> = {
  sexta: Sexta,
  sabado: Sabado,
  domingo: Domingo,
  sexta2: SextaB,
  sabado2: SabadoB,
  domingo2: DomingoB,
};

const DUR: Record<Formato, number> = { feed: 240, story: 240, broll: 300 };

// o feed em vídeo leva o som do próprio artista (o B-roll já traz o áudio do clipe)
const Trilha: React.FC<{ src: string; dur: number }> = ({ src, dur }) => (
  <Html5Audio src={staticFile(src)} volume={(f) => interpolate(f, [0, 12, dur - 20, dur], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
);

export const RemotionRoot: React.FC = () => (
  <>
    <Still id="teste-o" component={TesteO} width={1620} height={600} />
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
