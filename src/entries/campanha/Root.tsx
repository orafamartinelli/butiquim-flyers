import React from "react";
import { Composition, Still } from "remotion";
import { Parado } from "../../campanha/kit";
import {
  ALERTA_DUR,
  AcaoVideo,
  Alerta,
  AlertaVideo,
  CASA_DUR,
  CarimboSlide,
  Cartaz,
  CasaSlide,
  CasaVideo,
  DIMS,
  Destaque,
  LembreteStory,
  PagaSlide,
  PrimeiraSlide,
  RegrasStory,
  Story,
  VIDEO_DUR,
  Zap,
} from "../../campanha/pecas";
import { AnuncioPV, CartazQR, DIMS_PV, ZapConfirmada, ZapPassaporte } from "../../campanha/primeira-vez";
import { PassaporteV2, V2, V3 } from "../../campanha/primeira-vez-v23";
import { Acrilico, DIMS_ACR, DIMS_WA, WA_VID_DUR, WaCarimboDuploImg, WaConfirmadaImg, WaConfirmadaVideo } from "../../campanha/primeira-vez-wa-acrilico";
import { CLIPS_V5, CLIPS_V6, DIMS_PVV, DUR_V4, V4, V5, V6, durClips } from "../../campanha/primeira-vez-videos";

// Campanha "A CASA TE DEVE" (out/2026): tiro de alerta, o que é, 3 ações, disparo e apoio.
// Estáticos = <Still> com tudo no estado final; vídeos = <Composition> 30 fps.
const parado = (el: React.ReactElement): React.FC => {
  const W: React.FC = () => <Parado.Provider value={true}>{el}</Parado.Provider>;
  return W;
};

type Est = { id: string; el: React.ReactElement; dim: { w: number; h: number } };
const ESTATICOS: Est[] = [
  { id: "alerta-feed", el: <Alerta fmt="feed" />, dim: DIMS.feed },
  { id: "alerta-story", el: <Alerta fmt="story" />, dim: DIMS.story },
  { id: "alerta-zap", el: <Alerta fmt="zap" />, dim: DIMS.zap },
  ...[1, 2, 3, 4, 5, 6, 7].map((n) => ({ id: `casa-c${n}`, el: <CasaSlide n={n} />, dim: DIMS.feed })),
  ...[1, 2, 3, 4, 5, 6].map((n) => ({ id: `primeira-c${n}`, el: <PrimeiraSlide n={n} />, dim: DIMS.feed })),
  ...[1, 2, 3, 4, 5, 6].map((n) => ({ id: `paga-c${n}`, el: <PagaSlide n={n} />, dim: DIMS.feed })),
  ...[1, 2, 3, 4, 5, 6].map((n) => ({ id: `carimbo-c${n}`, el: <CarimboSlide n={n} />, dim: DIMS.feed })),
  ...(["casa", "primeira", "paga", "carimbo"] as const).flatMap((a) => [
    { id: `${a}-story`, el: <Story acao={a} />, dim: DIMS.story },
    { id: `${a}-zap`, el: <Zap acao={a} />, dim: DIMS.zap },
  ]),
  { id: "lembrete-zap", el: <Zap acao="lembrete" />, dim: DIMS.zap },
  { id: "lembrete-story", el: <LembreteStory />, dim: DIMS.story },
  { id: "regras-story", el: <RegrasStory />, dim: DIMS.story },
  { id: "destaque-capa", el: <Destaque />, dim: DIMS.story },
  { id: "cartaz-a4", el: <Cartaz />, dim: DIMS.a4 },
  // 06 · A primeira é nossa (Meta Ads de cadastro p/ quem nunca veio)
  ...(["geral", "pagode", "sertanejo"] as const).flatMap((t) => [
    { id: `pv-${t}-feed`, el: <AnuncioPV tema={t} fmt="feed" />, dim: DIMS_PV.feed },
    { id: `pv-${t}-story`, el: <AnuncioPV tema={t} fmt="story" />, dim: DIMS_PV.story },
  ]),
  { id: "pv-zap-confirmada", el: <ZapConfirmada />, dim: DIMS_PV.zap },
  { id: "pv-zap-passaporte", el: <ZapPassaporte />, dim: DIMS_PV.zap },
  { id: "pv-cartaz-qr", el: <CartazQR />, dim: DIMS_PV.a4 },
  // V2 "A casa cheia" e V3 "O convite" (refação pedida pelo Rafa, 22/10)
  ...(["geral", "pagode", "sertanejo"] as const).flatMap((t) =>
    (["feed", "story"] as const).flatMap((f) => [
      { id: `pv2-${t}-${f}`, el: <V2 tema={t} fmt={f} />, dim: DIMS_PV[f] },
      { id: `pv3-${t}-${f}`, el: <V3 tema={t} fmt={f} />, dim: DIMS_PV[f] },
    ]),
  ),
  { id: "pv-zap-passaporte-v2", el: <PassaporteV2 />, dim: DIMS_PV.zap },
  { id: "pv-wa-conf-img", el: <WaConfirmadaImg />, dim: DIMS_WA.img },
  { id: "pv-wa-carimbo-img", el: <WaCarimboDuploImg />, dim: DIMS_WA.img },
  { id: "pv-acrilico", el: <Acrilico />, dim: DIMS_ACR },
  { id: "pv-acrilico-guias", el: <Acrilico guias />, dim: DIMS_ACR },
];

export const RemotionRoot: React.FC = () => (
  <>
    {ESTATICOS.map((e) => (
      <Still key={e.id} id={e.id} component={parado(e.el)} width={e.dim.w} height={e.dim.h} />
    ))}
    <Composition id="alerta-video" component={AlertaVideo} durationInFrames={ALERTA_DUR} fps={30} width={1080} height={1920} />
    <Composition id="pv-wa-conf-video" component={WaConfirmadaVideo} durationInFrames={WA_VID_DUR} fps={30} width={DIMS_WA.vid.w} height={DIMS_WA.vid.h} />
    <Composition id="casa-video" component={CasaVideo} durationInFrames={CASA_DUR} fps={30} width={1080} height={1920} />
    {(["primeira", "paga", "carimbo"] as const).flatMap((a) => [
      <Composition key={`${a}-video-story`} id={`${a}-video-story`} component={() => <AcaoVideo acao={a} fmt="story" />} durationInFrames={VIDEO_DUR.story} fps={30} width={1080} height={1920} />,
      <Composition key={`${a}-video-feed`} id={`${a}-video-feed`} component={() => <AcaoVideo acao={a} fmt="feed" />} durationInFrames={VIDEO_DUR.feed} fps={30} width={1080} height={1350} />,
    ])}
    {/* 06 · Primeira vez — vídeos Meta Ads V4 (convite animado), V5 e V6 (filmagem real) */}
    {(["story", "feed"] as const).flatMap((fm) => [
      <Composition key={`pv4-${fm}`} id={`pv4-${fm}`} component={() => <V4 fmt={fm} />} durationInFrames={DUR_V4} fps={30} width={DIMS_PVV[fm].w} height={DIMS_PVV[fm].h} />,
      <Composition key={`pv5-${fm}`} id={`pv5-${fm}`} component={() => <V5 fmt={fm} />} durationInFrames={durClips(CLIPS_V5)} fps={30} width={DIMS_PVV[fm].w} height={DIMS_PVV[fm].h} />,
      <Composition key={`pv6-${fm}`} id={`pv6-${fm}`} component={() => <V6 fmt={fm} />} durationInFrames={durClips(CLIPS_V6)} fps={30} width={DIMS_PVV[fm].w} height={DIMS_PVV[fm].h} />,
    ])}
  </>
);
