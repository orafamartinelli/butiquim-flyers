import React from "react";
import { Composition, Still } from "remotion";
import "../../fonts";
import { ListaSabadoA, ListaSabadoB, LISTA_B_DUR } from "../../lista/ListaSabado";

// artes "de sempre" da LISTA do sábado (sem artista e sem data)
// A = "Esquina de Vidro" (estática) · B = "Lado A" (vídeo 8s, sem áudio)
const AFeed: React.FC = () => <ListaSabadoA fmt="feed" />;
const AStory: React.FC = () => <ListaSabadoA fmt="story" />;
const BFeed: React.FC = () => <ListaSabadoB fmt="feed" />;
const BStory: React.FC = () => <ListaSabadoB fmt="story" />;

export const RemotionRoot: React.FC = () => (
  <>
    <Still id="lista-sabado-a-feed" component={AFeed} width={1080} height={1350} />
    <Still id="lista-sabado-a-story" component={AStory} width={1080} height={1920} />
    <Composition id="lista-sabado-b-feed" component={BFeed} durationInFrames={LISTA_B_DUR} fps={30} width={1080} height={1350} />
    <Composition id="lista-sabado-b-story" component={BStory} durationInFrames={LISTA_B_DUR} fps={30} width={1080} height={1920} />
  </>
);
