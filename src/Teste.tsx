import React from "react";
import { AbsoluteFill } from "remotion";
import { RingPx } from "./shared/Ring3D";

// quadro de conferência do "O" 3D (os três materiais lado a lado)
export const TesteO: React.FC = () => (
  <AbsoluteFill style={{ background: "#e9e6dc" }}>
    <RingPx width={1620} height={600} look="lima" cx={270} cy={300} ringH={420} rotY={0.2} />
    <RingPx width={1620} height={600} look="cromo" cx={810} cy={300} ringH={420} rotY={0.2} />
    <RingPx width={1620} height={600} look="cobre" cx={1350} cy={300} ringH={420} rotY={0.2} />
  </AbsoluteFill>
);
