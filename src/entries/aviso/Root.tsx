import React from "react";
import { Composition } from "remotion";
import "../../fonts";
import { Aviso, AvisoProps, DIM_AVISO } from "../../ids/Aviso";

// ESTÚDIO (fase D) — peça avulsa pedida pelo WhatsApp, renderizada na nuvem (.github/workflows/estudio-render.yml)
//  aviso-feed  → still 1080×1350 (prova / capa)       --frame=150
//  aviso-story → still 1080×1920 e vídeo 7 s (Reels)  --frame=150 / render inteiro
// As props vêm do briefing do pedido (scripts/estudio-render.mjs); o default abaixo é o pedido #1 de teste.
export const DUR_AVISO = 210;

const exemplo: AvisoProps = {
  titulo: "Final do Paulistão - Camisa do Campeão",
  chamada: "Quem vier com a camisa do Maringá FC entra grátis a noite toda",
  regra: "Camisa do Maringá FC = entrada grátis a noite toda",
  data_evento: "2026-10-18",
  hora: "22:00",
  tom: "promo",
};

const Feed: React.FC<AvisoProps> = (p) => <Aviso {...p} fmt="feed" />;
const Story: React.FC<AvisoProps> = (p) => <Aviso {...p} fmt="story" />;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="aviso-feed" component={Feed} durationInFrames={DUR_AVISO} fps={30} width={DIM_AVISO.feed.w} height={DIM_AVISO.feed.h} defaultProps={exemplo} />
    <Composition id="aviso-story" component={Story} durationInFrames={DUR_AVISO} fps={30} width={DIM_AVISO.story.w} height={DIM_AVISO.story.h} defaultProps={exemplo} />
  </>
);
