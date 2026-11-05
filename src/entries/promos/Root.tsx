import React from "react";
import { Composition, Still } from "remotion";
import "../../fonts";
import { APEROL_DOBRO, DadosPromo, Promo, PROMO_DUR, REDLABEL_SEXTA, SMIRNOFF_DOBRO, SMIRNOFF_DOMINGO, SMIRNOFF_SEXTA } from "../../promos/Promo";
import { PromoC } from "../../promos/PromoC";

// artes de PROMO (sem designer): <slug>-{feed,story}-{est,a,b,c}
// est = imagem · a = persiana + partículas · b = camadas + letras recortadas · c = cartaz de boteco (cor própria)
type P = { slug: string; d: DadosPromo; cor: string; escuro: string; selo: string };
const PROMOS: P[] = [
  { slug: "sab-smirnoff", d: SMIRNOFF_DOBRO, cor: "#C8102E", escuro: "#9E0B23", selo: "2X" },
  { slug: "sex-aperol", d: APEROL_DOBRO, cor: "#E8590C", escuro: "#BC4507", selo: "2X" },
  { slug: "sex-smirnoff", d: SMIRNOFF_SEXTA, cor: "#16408F", escuro: "#0F2F6C", selo: "+5" },
  { slug: "sex-redlabel", d: REDLABEL_SEXTA, cor: "#A8321A", escuro: "#7F2411", selo: "+5" },
  { slug: "dom-smirnoff", d: SMIRNOFF_DOMINGO, cor: "#B4540A", escuro: "#8C4007", selo: "COMBO" },
];
const DIM = { feed: 1350, story: 1920 } as const;

export const RemotionRoot: React.FC = () => (
  <>
    {PROMOS.flatMap(({ slug, d, cor, escuro, selo }) =>
      (["feed", "story"] as const).flatMap((fmt) => [
        <Still key={`${slug}-${fmt}-est`} id={`${slug}-${fmt}-est`} component={Promo} defaultProps={{ d, fmt, efeito: "parado" as const }} width={1080} height={DIM[fmt]} />,
        <Composition key={`${slug}-${fmt}-a`} id={`${slug}-${fmt}-a`} component={Promo} defaultProps={{ d, fmt, efeito: "A" as const }} durationInFrames={PROMO_DUR} fps={30} width={1080} height={DIM[fmt]} />,
        <Composition key={`${slug}-${fmt}-b`} id={`${slug}-${fmt}-b`} component={Promo} defaultProps={{ d, fmt, efeito: "B" as const }} durationInFrames={PROMO_DUR} fps={30} width={1080} height={DIM[fmt]} />,
        <Composition key={`${slug}-${fmt}-c`} id={`${slug}-${fmt}-c`} component={PromoC} defaultProps={{ d, fmt, cor, escuro, selo }} durationInFrames={PROMO_DUR} fps={30} width={1080} height={DIM[fmt]} />,
      ]),
    )}
  </>
);
