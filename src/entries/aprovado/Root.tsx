import React from "react";
import { Still } from "remotion";
import { DIMS, INST, INST_KEYS } from "../../aprovado/kit";
import { Capa, Feed, SLIDES, Story } from "../../aprovado/pecas";

// Campanha "APROVADO! A 1ª é nossa." (calouros 2027) — só estáticos.
export const RemotionRoot: React.FC = () => (
  <>
    {INST_KEYS.map((k) => (
      <React.Fragment key={k}>
        <Still id={`feed-${INST[k].arquivo}`} component={() => <Feed inst={k} />} width={DIMS.feed.w} height={DIMS.feed.h} />
        <Still id={`story-${INST[k].arquivo}`} component={() => <Story inst={k} />} width={DIMS.story.w} height={DIMS.story.h} />
        <Still id={`capa-${INST[k].arquivo}`} component={() => <Capa inst={k} />} width={DIMS.feed.w} height={DIMS.feed.h} />
      </React.Fragment>
    ))}
    {Object.entries(SLIDES).map(([n, S]) => (
      <Still key={n} id={`carrossel-0${n}`} component={S} width={DIMS.feed.w} height={DIMS.feed.h} />
    ))}
  </>
);
