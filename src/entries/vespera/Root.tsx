import React from "react";
import { AbsoluteFill, Composition, Html5Audio, interpolate, staticFile } from "remotion";
import "../../fonts";
import { DIM, NOITES } from "../../data";
import { Vespera } from "../../ids/Vespera";

// VÉSPERA DE FERIADO — "Folhinha" (domingo 11/10, véspera de Nossa Senhora Aparecida)
// feed e story levam o som do próprio artista; o B-roll já traz o áudio do clipe
const n = NOITES.vespera1;
const DUR = { feed: 240, story: 240, broll: 300 } as const;

const Trilha: React.FC<{ dur: number }> = ({ dur }) => (
  <Html5Audio src={staticFile(n.clip)} volume={(f) => interpolate(f, [0, 12, dur - 20, dur], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
);

const Feed: React.FC = () => (
  <AbsoluteFill>
    <Vespera n={n} fmt="feed" />
    <Trilha dur={DUR.feed} />
  </AbsoluteFill>
);
const Story: React.FC = () => (
  <AbsoluteFill>
    <Vespera n={n} fmt="story" />
    <Trilha dur={DUR.story} />
  </AbsoluteFill>
);
const Broll: React.FC = () => <Vespera n={n} fmt="broll" />;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="vespera-feed" component={Feed} durationInFrames={DUR.feed} fps={30} width={DIM.feed.w} height={DIM.feed.h} />
    <Composition id="vespera-story" component={Story} durationInFrames={DUR.story} fps={30} width={DIM.story.w} height={DIM.story.h} />
    <Composition id="vespera-broll" component={Broll} durationInFrames={DUR.broll} fps={30} width={DIM.broll.w} height={DIM.broll.h} />
  </>
);
