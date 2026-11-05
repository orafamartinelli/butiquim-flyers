import React from "react";
import { Composition, Still } from "remotion";
import "../../fonts";
import { DadosPromo, Promo, PROMO_DUR, SMIRNOFF_DOBRO } from "../../promos/Promo";

// artes de PROMO (sem designer): <slug>-{feed,story}-{est,a,b}. est = imagem · a = persiana + partículas · b = camadas + letras recortadas
const PROMOS: [string, DadosPromo][] = [["sab-smirnoff", SMIRNOFF_DOBRO]];
const DIM = { feed: 1350, story: 1920 } as const;

export const RemotionRoot: React.FC = () => (
  <>
    {PROMOS.flatMap(([slug, d]) =>
      (["feed", "story"] as const).flatMap((fmt) => [
        <Still key={`${slug}-${fmt}-est`} id={`${slug}-${fmt}-est`} component={Promo} defaultProps={{ d, fmt, efeito: "parado" as const }} width={1080} height={DIM[fmt]} />,
        <Composition key={`${slug}-${fmt}-a`} id={`${slug}-${fmt}-a`} component={Promo} defaultProps={{ d, fmt, efeito: "A" as const }} durationInFrames={PROMO_DUR} fps={30} width={1080} height={DIM[fmt]} />,
        <Composition key={`${slug}-${fmt}-b`} id={`${slug}-${fmt}-b`} component={Promo} defaultProps={{ d, fmt, efeito: "B" as const }} durationInFrames={PROMO_DUR} fps={30} width={1080} height={DIM[fmt]} />,
      ]),
    )}
  </>
);
