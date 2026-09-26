import React from "react";
import { AbsoluteFill, Composition, Html5Audio, interpolate, staticFile } from "remotion";
import "./fonts";
import { DIM, DiaKey, Formato, NOITES } from "./data";
import { Sexta } from "./ids/Sexta";
import { Sabado } from "./ids/Sabado";
import { Domingo } from "./ids/Domingo";

const IDS: Record<DiaKey, React.FC<{ n: (typeof NOITES)[DiaKey]; fmt: Formato }>> = {
  sexta: Sexta,
  sabado: Sabado,
  domingo: Domingo,
};

const DUR: Record<Formato, number> = { feed: 240, story: 240, broll: 300 };

// o feed em vídeo leva o som do próprio artista (o B-roll já traz o áudio do clipe)
const Trilha: React.FC<{ src: string; dur: number }> = ({ src, dur }) => (
  <Html5Audio src={staticFile(src)} volume={(f) => interpolate(f, [0, 12, dur - 20, dur], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
);

export const RemotionRoot: React.FC = () => (
  <>
    {(Object.keys(IDS) as DiaKey[]).flatMap((k) =>
      (["feed", "story", "broll"] as Formato[]).map((fmt) => {
        const C = IDS[k];
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
