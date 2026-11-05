import React from "react";
import { Composition, Still } from "remotion";
import "../../fonts";
import { LISTA_B_DUR, ListaSextaA, ListaSextaB } from "../../lista/ListaSexta";

// artes de LISTA da quinta ("de sempre", sem artista e sem data): as mesmas da sexta, com o nome da noite
export const RemotionRoot: React.FC = () => (
  <>
    <Still id="lista-quinta-a-feed" component={ListaSextaA} defaultProps={{ fmt: "feed" as const, dia: "quinta" as const }} width={1080} height={1350} />
    <Still id="lista-quinta-a-story" component={ListaSextaA} defaultProps={{ fmt: "story" as const, dia: "quinta" as const }} width={1080} height={1920} />
    <Composition id="lista-quinta-b-feed" component={ListaSextaB} defaultProps={{ fmt: "feed" as const, dia: "quinta" as const }} durationInFrames={LISTA_B_DUR} fps={30} width={1080} height={1350} />
    <Composition id="lista-quinta-b-story" component={ListaSextaB} defaultProps={{ fmt: "story" as const, dia: "quinta" as const }} durationInFrames={LISTA_B_DUR} fps={30} width={1080} height={1920} />
  </>
);
