import React from "react";
import { Composition, Still } from "remotion";
import "../../fonts";
import { LISTA_B_DUR, ListaDomingoA, ListaDomingoB } from "../../lista/ListaDomingo";

// LISTA DO DOMINGO ("Saideira da Semana") — artes de sempre, sem artista e sem data
// A (estática, rótulo): FEED = COMENTE "LISTA" · STORY = RESPONDA "LISTA"
// B (vídeo 8s sem áudio, néon): idem; o quadro 180 serve de versão estática
const AFeed: React.FC = () => <ListaDomingoA fmt="feed" />;
const AStory: React.FC = () => <ListaDomingoA fmt="story" />;
const BFeed: React.FC = () => <ListaDomingoB fmt="feed" />;
const BStory: React.FC = () => <ListaDomingoB fmt="story" />;

export const RemotionRoot: React.FC = () => (
  <>
    <Still id="lista-domingo-a-feed" component={AFeed} width={1080} height={1350} />
    <Still id="lista-domingo-a-story" component={AStory} width={1080} height={1920} />
    <Composition id="lista-domingo-b-feed" component={BFeed} durationInFrames={LISTA_B_DUR} fps={30} width={1080} height={1350} />
    <Composition id="lista-domingo-b-story" component={BStory} durationInFrames={LISTA_B_DUR} fps={30} width={1080} height={1920} />
  </>
);
