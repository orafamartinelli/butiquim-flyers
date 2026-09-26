import React from "react";
import { Composition, Still } from "remotion";
import "../../fonts";
import { LISTA_B_DUR, ListaSextaA, ListaSextaB } from "../../lista/ListaSexta";

// artes de LISTA da sexta ("de sempre", sem artista e sem data)
// A = estática (placa de esquina) · B = vídeo 8s sem áudio (painel de embarque)
// feed: COMENTE "LISTA" · story: RESPONDA "LISTA"
export const RemotionRoot: React.FC = () => (
  <>
    <Still id="lista-sexta-a-feed" component={ListaSextaA} defaultProps={{ fmt: "feed" as const }} width={1080} height={1350} />
    <Still id="lista-sexta-a-story" component={ListaSextaA} defaultProps={{ fmt: "story" as const }} width={1080} height={1920} />
    <Composition id="lista-sexta-b-feed" component={ListaSextaB} defaultProps={{ fmt: "feed" as const }} durationInFrames={LISTA_B_DUR} fps={30} width={1080} height={1350} />
    <Composition id="lista-sexta-b-story" component={ListaSextaB} defaultProps={{ fmt: "story" as const }} durationInFrames={LISTA_B_DUR} fps={30} width={1080} height={1920} />
  </>
);
