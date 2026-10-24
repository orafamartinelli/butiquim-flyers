import React from "react";
import { Composition } from "remotion";
import "../../fonts";
import { noiteDe } from "../../data";
import { FECHADO_DUR, FechadoStory } from "../../avisos/FechadoStory";

// CASA FECHADA pelo celular (24/10/2026) — story "AGENDA ATUALIZADA" renderizado na nuvem
// (.github/workflows/casa-fechada-story.yml, disparado pelo Hermes). Sem áudio (Rafa 24/10) — e o public/broll
// (239 MB) nem vai pro git. As noites vêm por props:
//   datas    → noites que aparecem no story (sexta/sábado/domingo, na ordem), lidas de src/agenda.json
//   fechadas → quais dessas ficam carimbadas FECHADO
// O script scripts/casa-fechada-story.mjs atualiza o agenda.json ANTES do bundle.
type P = { datas: string[]; fechadas: string[] };

const Fechado: React.FC<P> = ({ datas, fechadas }) => <FechadoStory noites={datas.map(noiteDe)} fechadas={fechadas} />;

export const RemotionRoot: React.FC = () => (
  <Composition id="aviso-fechado" component={Fechado} durationInFrames={FECHADO_DUR} fps={30} width={1080} height={1920}
    defaultProps={{ datas: ["2026-10-23", "2026-10-24", "2026-10-25"], fechadas: ["2026-10-23"] }} />
);
