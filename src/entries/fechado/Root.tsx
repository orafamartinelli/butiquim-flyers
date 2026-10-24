import React from "react";
import { AbsoluteFill, Composition } from "remotion";
import "../../fonts";
import { noiteDe } from "../../data";
import { FECHADO_DUR, FechadoStory, TrilhaFechado } from "../../avisos/FechadoStory";

// CASA FECHADA pelo celular (24/10/2026) — story "AGENDA ATUALIZADA" renderizado na nuvem
// (.github/workflows/casa-fechada-story.yml, disparado pelo Hermes). As noites vêm por props:
//   datas    → noites que aparecem no story (sexta/sábado/domingo, na ordem), lidas de src/agenda.json
//   fechadas → quais dessas ficam carimbadas FECHADO
// O script scripts/casa-fechada-story.mjs atualiza o agenda.json ANTES do bundle.
type P = { datas: string[]; fechadas: string[] };

const Fechado: React.FC<P> = ({ datas, fechadas }) => {
  const noites = datas.map(noiteDe);
  return (
    <AbsoluteFill>
      <FechadoStory noites={noites} fechadas={fechadas} />
      <TrilhaFechado noites={noites.filter((n) => !fechadas.includes(n.data))} />
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => (
  <Composition id="aviso-fechado" component={Fechado} durationInFrames={FECHADO_DUR} fps={30} width={1080} height={1920}
    defaultProps={{ datas: ["2026-10-23", "2026-10-24", "2026-10-25"], fechadas: ["2026-10-23"] }} />
);
