import React from "react";
import { Composition } from "remotion";
import "../../fonts";
import { Aviso, AvisoProps, DIM_AVISO } from "../../ids/Aviso";

// ESTÚDIO (fase D) — peça avulsa pedida pelo WhatsApp, renderizada na nuvem (.github/workflows/estudio-render.yml)
//  aviso-feed       → still 1080×1350 (prova / capa)                 --frame=150
//  aviso-story      → still 1080×1920                                --frame=150
//  aviso-anel-story → still PNG transparente só com o "O" 3D (insumo do vídeo)
//  aviso-video      → vídeo 6 s 1080×1920 (vai pro feed como Reels), com o "O" em PNG (prop anelSrc)
// As props vêm do briefing do pedido (scripts/estudio-render.mjs); o default abaixo é o pedido #1 de teste.
// ATENÇÃO: --props se MESCLA com o defaultProps — o script manda todos os campos (null = não tem).
export const DUR_AVISO = 180;

type P = AvisoProps & { anelSrc?: string | null };

const exemplo: P = {
  titulo: "Final do Paulistão - Camisa do Campeão",
  chamada: "Quem vier com a camisa do Maringá FC entra grátis a noite toda",
  regra: "Camisa do Maringá FC = entrada grátis a noite toda",
  data_evento: "2026-10-18",
  hora: "22:00",
  tom: "promo",
  anelSrc: null,
};

const Feed: React.FC<P> = (p) => <Aviso {...p} anelSrc={null} fmt="feed" />;
const Story: React.FC<P> = (p) => <Aviso {...p} anelSrc={null} fmt="story" />;
const AnelStory: React.FC<P> = (p) => <Aviso {...p} fmt="story" modoAnel="so-anel" />;
const Video: React.FC<P> = (p) => <Aviso {...p} fmt="story" />;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="aviso-feed" component={Feed} durationInFrames={DUR_AVISO} fps={30} width={DIM_AVISO.feed.w} height={DIM_AVISO.feed.h} defaultProps={exemplo} />
    <Composition id="aviso-story" component={Story} durationInFrames={DUR_AVISO} fps={30} width={DIM_AVISO.story.w} height={DIM_AVISO.story.h} defaultProps={exemplo} />
    <Composition id="aviso-anel-story" component={AnelStory} durationInFrames={1} fps={30} width={DIM_AVISO.story.w} height={DIM_AVISO.story.h} defaultProps={exemplo} />
    <Composition id="aviso-video" component={Video} durationInFrames={DUR_AVISO} fps={30} width={DIM_AVISO.story.w} height={DIM_AVISO.story.h} defaultProps={exemplo} />
  </>
);
