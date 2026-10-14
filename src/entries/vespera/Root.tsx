import React from "react";
import { AbsoluteFill, Composition, Html5Audio, interpolate, staticFile } from "remotion";
import "../../fonts";
import { DIM, NOITES, Noite } from "../../data";
import { Vespera } from "../../ids/Vespera";

// VÉSPERA DE FERIADO — "Folhinha"
//  vespera  = domingo 11/10, véspera de Nossa Senhora Aparecida
//  vespera2 = domingo 01/11, véspera de Finados
// feed e story levam o som do próprio artista; o B-roll já traz o áudio do clipe
const DUR = { feed: 240, story: 240, broll: 300 } as const;
const NOITES_VESPERA: [string, Noite][] = [
  ["vespera", NOITES.vespera1],
  ["vespera2", NOITES.vespera2],
];

const Trilha: React.FC<{ n: Noite; dur: number }> = ({ n, dur }) => (
  <Html5Audio src={staticFile(n.clip)} volume={(f) => interpolate(f, [0, 12, dur - 20, dur], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
);

export const RemotionRoot: React.FC = () => (
  <>
    {NOITES_VESPERA.flatMap(([id, n]) => {
      const Feed: React.FC = () => (
        <AbsoluteFill>
          <Vespera n={n} fmt="feed" />
          <Trilha n={n} dur={DUR.feed} />
        </AbsoluteFill>
      );
      const Story: React.FC = () => (
        <AbsoluteFill>
          <Vespera n={n} fmt="story" />
          <Trilha n={n} dur={DUR.story} />
        </AbsoluteFill>
      );
      const Broll: React.FC = () => <Vespera n={n} fmt="broll" />;
      return [
        <Composition key={`${id}-feed`} id={`${id}-feed`} component={Feed} durationInFrames={DUR.feed} fps={30} width={DIM.feed.w} height={DIM.feed.h} />,
        <Composition key={`${id}-story`} id={`${id}-story`} component={Story} durationInFrames={DUR.story} fps={30} width={DIM.story.w} height={DIM.story.h} />,
        <Composition key={`${id}-broll`} id={`${id}-broll`} component={Broll} durationInFrames={DUR.broll} fps={30} width={DIM.broll.w} height={DIM.broll.h} />,
      ];
    })}
  </>
);
