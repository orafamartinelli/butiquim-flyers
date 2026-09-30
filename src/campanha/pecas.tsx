import React from "react";
import { AbsoluteFill, Html5Audio, Sequence, interpolate, staticFile } from "remotion";
import {
  Balde,
  C,
  CadernetaFiado,
  Carimbo,
  Cartela,
  Cena,
  Comanda,
  Cta,
  Escrita,
  Eyebrow,
  F,
  Fundo,
  Ico,
  Logo,
  Papel,
  PassaporteCapa,
  PassaportePagina,
  Passos,
  Regras,
  Risco,
  SeloCasa,
  SeloSexDom,
  Texto,
  Titulo,
  Troca,
  useP,
} from "./kit";
import { clamp } from "../shared/fx";

export type Fmt = "feed" | "story" | "zap";
export const DIMS = { feed: { w: 1080, h: 1350 }, story: { w: 1080, h: 1920 }, zap: { w: 1910, h: 1000 }, a4: { w: 1654, h: 2339 } } as const;
const PAD: Record<Fmt, { t: number; b: number; x: number }> = {
  feed: { t: 60, b: 56, x: 72 },
  story: { t: 170, b: 230, x: 80 },
  zap: { t: 64, b: 56, x: 90 },
};
const ZAP_FONE = "(44) 3170-0906";

const Esquina: React.FC<{ size?: number }> = ({ size = 30 }) => (
  <div style={{ fontFamily: F.mao, fontSize: size, color: C.lima, transform: "rotate(-3deg)", whiteSpace: "nowrap" }}>Te vejo na esquina</div>
);
const Seta: React.FC = () => (
  <div style={{ fontFamily: F.texto, fontWeight: 700, fontSize: 28, color: C.branco, letterSpacing: "0.12em", display: "flex", alignItems: "center", gap: 12 }}>
    ARRASTA <span style={{ color: C.lima, fontSize: 40, lineHeight: 0 }}>→</span>
  </div>
);

// moldura comum: selo da campanha em cima, logo + assinatura embaixo
const Moldura: React.FC<{ fmt: Fmt; pag?: string; seta?: boolean; video?: string; from?: number; children: React.ReactNode; semRodape?: boolean }> = ({
  fmt,
  pag,
  seta,
  video,
  from,
  children,
  semRodape,
}) => {
  const p = PAD[fmt];
  return (
    <AbsoluteFill>
      <Fundo video={video} from={from} />
      <AbsoluteFill style={{ padding: `${p.t}px ${p.x}px ${p.b}px`, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 60 }}>
          <SeloCasa size={fmt === "zap" ? 42 : 36} />
          {pag ? <div style={{ fontFamily: F.texto, fontSize: 26, color: C.cinza, fontWeight: 600, letterSpacing: "0.12em" }}>{pag}</div> : <Logo width={fmt === "zap" ? 250 : 190} />}
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", minHeight: 0 }}>{children}</div>
        {!semRodape && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", height: 56 }}>
            {pag ? <Logo width={160} /> : <span />}
            {seta ? <Seta /> : <Esquina size={fmt === "zap" ? 34 : 30} />}
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Linha: React.FC<{ h?: number }> = ({ h = 30 }) => <div style={{ height: h, flex: "0 0 auto" }} />;

// =====================================================================
// 00 · TIRO DE ALERTA — sem explicar nada
// =====================================================================
export const Alerta: React.FC<{ fmt: Fmt }> = ({ fmt }) => {
  if (fmt === "zap")
    return (
      <Moldura fmt="zap">
        <div style={{ display: "flex", alignItems: "center", gap: 70 }}>
          <div style={{ flex: 1 }}>
            <Eyebrow size={30}>Recado da gerência</Eyebrow>
            <Linha h={20} />
            <Titulo linhas={["Nesta sexta,", "o Butiquim", [{ t: "começa a te dever.", c: C.lima }]]} size={112} />
            <Linha h={24} />
            <Texto size={40} color={C.cinza}>
              Não é erro de digitação.
            </Texto>
          </div>
          <CadernetaFiado w={700} h={620} rot={4} />
        </div>
      </Moldura>
    );
  const story = fmt === "story";
  return (
    <Moldura fmt={fmt}>
      <Eyebrow>Recado da gerência</Eyebrow>
      <Linha h={24} />
      <Titulo linhas={["Nesta sexta,", "o Butiquim", "começa a", [{ t: "te dever.", c: C.lima }]]} size={story ? 132 : 112} />
      <Linha h={story ? 50 : 30} />
      <div style={{ display: "flex", justifyContent: "center" }}>
        <CadernetaFiado w={story ? 880 : 780} h={story ? 540 : 420} rot={-3} virar={story} />
      </div>
      <Linha h={story ? 50 : 30} />
      {story ? <Cta acao="Responde DEVE" detalhe="e fica sabendo antes de todo mundo" /> : <Texto size={40} color={C.cinza}>Não é erro de digitação. Salva esse post: sexta a gente explica.</Texto>}
    </Moldura>
  );
};

export const ALERTA_DUR = 300;
export const AlertaVideo: React.FC = () => (
  <AbsoluteFill>
    <Fundo />
    <Html5Audio src={staticFile("broll/cqsamba.mp4")} volume={(f) => interpolate(f, [0, 20, ALERTA_DUR - 30, ALERTA_DUR], [0, 0.35, 0.35, 0], clamp)} />
    <Sequence durationInFrames={160}>
      <Cena dur={160}>
        <AbsoluteFill style={{ padding: "210px 80px 260px", display: "flex", flexDirection: "column", alignItems: "center", gap: 60 }}>
          <Titulo linhas={["Todo boteco", "tem uma caderneta", "de fiado."]} size={96} align="center" />
          <CadernetaFiado w={900} h={640} rot={-3} start={24} virarEm={92} />
        </AbsoluteFill>
      </Cena>
    </Sequence>
    <Sequence from={160} durationInFrames={140}>
      <Cena dur={140} sai={false}>
        <AbsoluteFill style={{ padding: "230px 80px 260px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <SeloCasa size={44} />
          <div>
            <Titulo linhas={["Nesta sexta,", "o Butiquim", "começa a", [{ t: "te dever.", c: C.lima }]]} size={160} start={4} />
            <div style={{ marginTop: 40 }}>
              <Carimbo linhas={["Em breve"]} size={380} rot={-8} start={40} seed={21} cor={C.rosa} style={{ mixBlendMode: "normal" }} />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <Cta acao="Responde DEVE" start={60} />
            <Logo width={200} />
          </div>
        </AbsoluteFill>
      </Cena>
    </Sequence>
  </AbsoluteFill>
);

// =====================================================================
// 01 · O QUE É — carrossel geral (7 slides)
// =====================================================================
const JEITOS: { n: string; nome: string; sub: string }[] = [
  { n: "1", nome: "A primeira é nossa", sub: "Nunca veio? Drink de boas-vindas + R$20 pra voltar." },
  { n: "2", nome: "A gente paga pra você vir", sub: "Sumiu faz 45 dias? R$50 no bar na sua volta." },
  { n: "3", nome: "Carimbo no CPF", sub: "3 visitas = balde de cerveja ou garrafa de vodka." },
];

const Jeito: React.FC<{ j: (typeof JEITOS)[number]; start: number; size?: number }> = ({ j, start, size = 60 }) => {
  const p = useP(start, start + 12);
  return (
    <div style={{ display: "flex", gap: 30, alignItems: "flex-start", opacity: p, transform: `translateX(${(1 - p) * -40}px)` }}>
      <div style={{ fontFamily: F.mao, fontSize: size * 1.2, color: C.rosa, width: size * 1.3, lineHeight: 1, flex: "0 0 auto" }}>{j.n}</div>
      <div>
        <div style={{ fontFamily: F.display, fontSize: size, color: C.branco, textTransform: "uppercase", lineHeight: 1 }}>{j.nome}</div>
        <div style={{ fontFamily: F.texto, fontSize: size * 0.58, color: C.cinza, marginTop: 10, lineHeight: 1.3 }}>{j.sub}</div>
      </div>
    </div>
  );
};

export const CasaSlide: React.FC<{ n: number }> = ({ n }) => {
  const pag = `${n}/7`;
  const seta = n < 7;
  switch (n) {
    case 1:
      return (
        <Moldura fmt="feed" pag={pag} seta={seta}>
          <Titulo linhas={["Um bar", "que te", [{ t: "deve?", c: C.lima }]]} size={250} />
          <Linha h={40} />
          <Texto size={46} style={{ maxWidth: 760 }}>
            Parece erro de gestão. É a melhor ideia que a gente já teve.
          </Texto>
          <div style={{ position: "absolute", right: -24, top: 360 }}>
            <Carimbo linhas={["A casa", "te deve"]} size={300} rot={14} redondo seed={31} style={{ mixBlendMode: "normal" }} />
          </div>
        </Moldura>
      );
    case 2:
      return (
        <Moldura fmt="feed" pag={pag} seta={seta}>
          <Titulo linhas={["No boteco,", [{ t: "o fiado era seu.", c: C.lima }]]} size={104} />
          <Linha h={40} />
          <div style={{ display: "flex", justifyContent: "center" }}>
            <CadernetaFiado w={860} h={560} rot={-2} />
          </div>
          <Linha h={40} />
          <Texto size={42}>No Butiquim, a partir de agora, é ao contrário: quem anota a dívida é a casa. Com você.</Texto>
        </Moldura>
      );
    case 3:
      return (
        <Moldura fmt="feed" pag={pag} seta={seta}>
          <Titulo linhas={["3 jeitos de", [{ t: "a casa te pagar", c: C.lima }], "pra vir"]} size={112} />
          <Linha h={60} />
          <div style={{ display: "flex", flexDirection: "column", gap: 54 }}>
            {JEITOS.map((j, i) => (
              <Jeito key={i} j={j} start={i * 6} />
            ))}
          </div>
        </Moldura>
      );
    case 4:
      return (
        <Moldura fmt="feed" pag={pag} seta={seta}>
          <Eyebrow>1 · A primeira é nossa</Eyebrow>
          <Linha h={20} />
          <Titulo linhas={["Nunca veio?", [{ t: "O drink é nosso.", c: C.lima }]]} size={110} />
          <Linha h={50} />
          <div style={{ display: "flex", gap: 50, alignItems: "center" }}>
            <PassaporteCapa w={360} rot={-6} />
            <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
              <Texto size={40}>Na 1ª visita, o drink de boas-vindas é por conta da casa.</Texto>
              <Texto size={40}>
                E você sai com o <b style={{ color: C.lima }}>passaporte de volta</b>: R$20 pra usar em até 21 dias.
              </Texto>
            </div>
          </div>
        </Moldura>
      );
    case 5:
      return (
        <Moldura fmt="feed" pag={pag} seta={seta}>
          <Eyebrow>2 · A gente paga pra você vir</Eyebrow>
          <Linha h={20} />
          <Titulo linhas={["Sumiu?", [{ t: "A volta é paga.", c: C.lima }]]} size={110} />
          <Linha h={50} />
          <div style={{ display: "flex", gap: 40, alignItems: "center" }}>
            <Comanda
              w={500}
              linhas={[
                ["CRÉDITO DA CASA", "R$ 50,00"],
                ["SEU CONSUMO", "R$ 50,00"],
              ]}
              total={["VOCÊ PAGA", "R$ 0,00"]}
              carimbo={<Carimbo linhas={["Pago pela", "casa"]} size={250} rot={-16} seed={41} />}
            />
            <Texto size={40} style={{ flex: 1 }}>
              Faz 45 dias ou mais que você não vem? A gente põe R$50 no bar pra você voltar.
            </Texto>
          </div>
        </Moldura>
      );
    case 6:
      return (
        <Moldura fmt="feed" pag={pag} seta={seta}>
          <Eyebrow>3 · Carimbo no CPF</Eyebrow>
          <Linha h={20} />
          <Titulo linhas={["A 3ª visita", [{ t: "já ganha.", c: C.lima }]]} size={120} />
          <Linha h={50} />
          <Cartela w={936} carimbos={2} />
          <Linha h={46} />
          <Texto size={40}>Cada visita com consumo é um carimbo no seu CPF. Juntou 3: balde de cerveja ou garrafa de vodka.</Texto>
        </Moldura>
      );
    default:
      return (
        <Moldura fmt="feed" pag={pag}>
          <div style={{ position: "absolute", right: 0, top: 70 }}>
            <SeloSexDom size={210} rot={12} />
          </div>
          <Titulo linhas={["Sexta e", "domingo", [{ t: "valem mais.", c: C.rosa }]]} size={128} />
          <Linha h={50} />
          <TabelaBonus />
          <Linha h={60} />
          <Cta acao="Entra na lista pela bio" detalhe="O CPF na portaria faz o resto." size={52} />
        </Moldura>
      );
  }
};

const TabelaBonus: React.FC<{ size?: number }> = ({ size = 44 }) => {
  const rows: [string, string, string][] = [
    ["Passaporte de volta", "R$ 20", "R$ 40"],
    ["A gente paga pra você vir", "R$ 50", "R$ 70"],
    ["Carimbo no CPF", "1 carimbo", "2 carimbos"],
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", borderTop: `2px solid rgba(255,255,255,.14)` }}>
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", padding: "14px 0", fontFamily: F.texto, fontWeight: 700, fontSize: size * 0.55, letterSpacing: "0.12em", color: C.cinza }}>
        <span />
        <span>SÁBADO</span>
        <span style={{ color: C.rosa }}>SEX · DOM</span>
      </div>
      {rows.map(([a, b, c], i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", alignItems: "center", padding: "18px 0", borderTop: `2px solid rgba(255,255,255,.14)` }}>
          <span style={{ fontFamily: F.texto, fontSize: size * 0.78, color: C.branco, fontWeight: 500, lineHeight: 1.2, paddingRight: 16 }}>{a}</span>
          <span style={{ fontFamily: F.display, fontSize: size, color: C.cinza }}>{b}</span>
          <span style={{ fontFamily: F.display, fontSize: size * 1.12, color: C.rosa }}>{c}</span>
        </div>
      ))}
    </div>
  );
};

// =====================================================================
// 02 · A PRIMEIRA É NOSSA — primeira visita + passaporte de volta
// =====================================================================
export const PrimeiraSlide: React.FC<{ n: number }> = ({ n }) => {
  const pag = `${n}/6`;
  const seta = n < 6;
  switch (n) {
    case 1:
      return (
        <Moldura fmt="feed" pag={pag} seta={seta}>
          <Eyebrow>Nunca veio no Butiquim?</Eyebrow>
          <Linha h={20} />
          <Titulo linhas={["A primeira", [{ t: "é nossa.", c: C.lima }]]} size={200} />
          <Linha h={50} />
          <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
            <PassaporteCapa w={380} rot={-7} />
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <Ico i="caipirinha" size={84} color={C.lima} stroke={1.6} />
                <Texto size={40}>Drink de boas-vindas</Texto>
              </div>
              <div style={{ fontFamily: F.display, fontSize: 60, color: C.branco }}>+</div>
              <Texto size={40}>
                <b style={{ color: C.lima }}>R$20</b> pra voltar
                <br />
                <span style={{ color: C.rosa }}>(R$40 sexta e domingo)</span>
              </Texto>
            </div>
          </div>
        </Moldura>
      );
    case 2:
      return (
        <Moldura fmt="feed" pag={pag} seta={seta}>
          <Titulo linhas={["Na 1ª visita,", "o drink é", [{ t: "por nossa conta.", c: C.lima }]]} size={100} />
          <Linha h={44} />
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Comanda
              w={580}
              numero="0001"
              linhas={[
                ["1× DRINK DE BOAS-VINDAS", "CORTESIA"],
                ["PRIMEIRA VISITA", "✓"],
              ]}
              total={["VOCÊ PAGA", "R$ 0,00"]}
              carimbo={<Carimbo linhas={["Primeira", "é nossa"]} size={270} rot={-14} seed={51} />}
            />
          </div>
          <Linha h={50} />
          <Texto size={40} color={C.cinza}>
            A casa confere pelo CPF, na portaria, que é a sua primeira vez.
          </Texto>
        </Moldura>
      );
    case 3:
      return (
        <Moldura fmt="feed" pag={pag} seta={seta}>
          <Titulo linhas={["E você sai com o", [{ t: "passaporte", c: C.lima }], [{ t: "de volta.", c: C.lima }]]} size={116} />
          <Linha h={40} />
          <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
            <PassaportePagina w={480} rot={-4} />
            <Texto size={42} style={{ flex: 1 }}>
              <b style={{ color: C.branco }}>R$20 de crédito no bar</b> pra usar numa nova visita, em até 21 dias.
            </Texto>
          </div>
        </Moldura>
      );
    case 4:
      return (
        <Moldura fmt="feed" pag={pag} seta={seta}>
          <div style={{ position: "absolute", right: 0, top: 60 }}>
            <SeloSexDom size={230} rot={12} />
          </div>
          <Titulo linhas={["Voltou na", "sexta ou", "no domingo?"]} size={136} />
          <Linha h={60} />
          <Troca de="R$ 20" para="R$ 40" size={160} />
          <Linha h={50} />
          <Texto size={44}>O passaporte vale o dobro nas noites de sexta e de domingo.</Texto>
        </Moldura>
      );
    case 5:
      return (
        <Moldura fmt="feed" pag={pag} seta={seta}>
          <Titulo linhas={["Como", [{ t: "funciona", c: C.lima }]]} size={140} />
          <Linha h={60} />
          <Passos
            size={42}
            itens={[
              "Entra na lista pelo link da bio.",
              "Passa o CPF na portaria: o sistema vê que é sua primeira vez.",
              "Pede o drink de boas-vindas no bar.",
              "O passaporte de volta chega no seu WhatsApp.",
            ]}
          />
        </Moldura>
      );
    default:
      return (
        <Moldura fmt="feed" pag={pag}>
          <Titulo linhas={["Letras", [{ t: "grandes", c: C.lima }]]} size={130} />
          <Linha h={44} />
          <Regras
            size={34}
            itens={[
              "Só pra quem nunca veio ao Butiquim, conferido pelo CPF na portaria.",
              "1 drink de boas-vindas por pessoa.",
              "Passaporte pessoal: R$20 de crédito no bar numa nova visita em até 21 dias. R$40 se a volta for sexta ou domingo.",
              "O crédito não vale entrada nem troco em dinheiro.",
            ]}
          />
          <Linha h={60} />
          <Cta acao="Entra na lista pela bio" detalhe="@obutiquim · a primeira é nossa" size={52} />
        </Moldura>
      );
  }
};

// =====================================================================
// 03 · A GENTE PAGA PRA VOCÊ VIR — visita premiada
// =====================================================================
export const PagaSlide: React.FC<{ n: number }> = ({ n }) => {
  const pag = `${n}/6`;
  const seta = n < 6;
  switch (n) {
    case 1:
      return (
        <Moldura fmt="feed" pag={pag} seta={seta}>
          <Eyebrow>Faz tempo que você não vem</Eyebrow>
          <Linha h={20} />
          <Titulo linhas={["A gente", "paga pra", [{ t: "você vir.", c: C.lima }]]} size={170} />
          <Linha h={40} />
          <div style={{ position: "relative", height: 260 }}>
            <Escrita start={0} size={165} font={F.mao} color={C.branco} weight={400} style={{ transform: "rotate(-4deg)", display: "inline-block" }}>
              R$ 50
            </Escrita>
            <div style={{ position: "absolute", right: 0, top: 10 }}>
              <Carimbo linhas={["Pago pela", "casa"]} size={270} rot={-12} seed={61} style={{ mixBlendMode: "normal" }} />
            </div>
          </div>
        </Moldura>
      );
    case 2:
      return (
        <Moldura fmt="feed" pag={pag} seta={seta}>
          <Titulo linhas={["Não é desconto.", [{ t: "É crédito.", c: C.lima }]]} size={124} />
          <Linha h={50} />
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Comanda
              w={640}
              numero="0845"
              linhas={[
                ["CRÉDITO DA CASA", "R$ 50,00"],
                ["2× CAIPIRINHA", "R$ 50,00"],
              ]}
              total={["VOCÊ PAGA", "R$ 0,00"]}
              carimbo={<Carimbo linhas={["Pago pela", "casa"]} size={270} rot={-16} seed={62} />}
            />
          </div>
          <Linha h={50} />
          <Texto size={42}>R$50 no bar, por nossa conta, na noite em que você voltar.</Texto>
        </Moldura>
      );
    case 3:
      return (
        <Moldura fmt="feed" pag={pag} seta={seta}>
          <div style={{ position: "absolute", right: 0, top: 60 }}>
            <SeloSexDom size={230} rot={12} />
          </div>
          <Titulo linhas={["Voltou na", "sexta ou", "no domingo?"]} size={136} />
          <Linha h={60} />
          <Troca de="R$ 50" para="R$ 70" size={160} />
          <Linha h={50} />
          <Texto size={44}>Nas noites de sexta e de domingo, a volta vale R$70.</Texto>
        </Moldura>
      );
    case 4:
      return (
        <Moldura fmt="feed" pag={pag} seta={seta}>
          <Titulo linhas={["Parece burrice", "de gestão.", [{ t: "É saudade.", c: C.rosa }]]} size={118} />
          <Linha h={50} />
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Papel w={860} h={380} rot={2} topo={80} pauta={62}>
              <div style={{ position: "absolute", left: 130, top: 90, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ position: "relative", alignSelf: "flex-start" }}>
                  <Escrita start={0} size={58}>
                    Você — sumido desde julho
                  </Escrita>
                  <Risco start={0} seed={13} width={7} />
                </div>
                <Escrita start={0} size={78} font={F.mao} color={C.rosa} weight={400} style={{ transform: "rotate(-3deg)", marginTop: 20 }}>
                  Volta paga!
                </Escrita>
              </div>
            </Papel>
          </div>
          <Linha h={50} />
          <Texto size={42}>Ninguém vem pro Butiquim sozinho. A gente banca o começo, a noite faz o resto.</Texto>
        </Moldura>
      );
    case 5:
      return (
        <Moldura fmt="feed" pag={pag} seta={seta}>
          <Titulo linhas={["Como", [{ t: "funciona", c: C.lima }]]} size={140} />
          <Linha h={60} />
          <Passos
            size={42}
            itens={[
              `Manda VOLTEI no WhatsApp do Butiquim, ${ZAP_FONE}, e recebe seu código.`,
              "Entra na lista pelo link da bio.",
              "Passa o CPF na portaria e mostra o código no caixa.",
              "Os R$50 (ou R$70) já estão na sua comanda.",
            ]}
          />
        </Moldura>
      );
    default:
      return (
        <Moldura fmt="feed" pag={pag}>
          <Titulo linhas={["Letras", [{ t: "grandes", c: C.lima }]]} size={130} />
          <Linha h={44} />
          <Regras
            size={34}
            itens={[
              "Vale pra quem não vem ao Butiquim há 45 dias ou mais, conferido pelo CPF.",
              "1 crédito por pessoa, válido por 15 dias depois do código.",
              "R$50 no sábado. R$70 na sexta e no domingo.",
              "Só consumo no bar: não vale entrada nem troco em dinheiro.",
            ]}
          />
          <Linha h={60} />
          <Cta acao="Manda VOLTEI" detalhe={`no WhatsApp do Butiquim · ${ZAP_FONE}`} size={52} />
        </Moldura>
      );
  }
};

// =====================================================================
// 04 · CARIMBO NO CPF — a 3ª visita já ganha
// =====================================================================
export const CarimboSlide: React.FC<{ n: number }> = ({ n }) => {
  const pag = `${n}/6`;
  const seta = n < 6;
  switch (n) {
    case 1:
      return (
        <Moldura fmt="feed" pag={pag} seta={seta}>
          <Eyebrow>Carimbo no CPF</Eyebrow>
          <Linha h={20} />
          <Titulo linhas={["A 3ª visita", [{ t: "já ganha.", c: C.lima }]]} size={150} />
          <Linha h={44} />
          <Cartela w={920} carimbos={2} />
          <Linha h={44} />
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <Balde size={72} color={C.lima} />
            <Ico i="garrafa" size={72} color={C.lima} stroke={1.5} />
            <Texto size={42} style={{ whiteSpace: "nowrap", marginLeft: 10 }}>
              Balde de cerveja <span style={{ color: C.cinza }}>ou</span> garrafa de vodka
            </Texto>
          </div>
        </Moldura>
      );
    case 2:
      return (
        <Moldura fmt="feed" pag={pag} seta={seta}>
          <Titulo linhas={["Seu CPF virou", [{ t: "cartão fidelidade.", c: C.lima }]]} size={112} />
          <Linha h={60} />
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 420, position: "relative" }}>
            <Papel w={860} h={300} rot={-2} espiral={false} topo={300} margem={false} cor={C.recibo}>
              <div style={{ position: "absolute", left: 60, top: 70, fontFamily: F.comanda, fontSize: 40, color: "#333" }}>
                CPF
                <div style={{ fontSize: 86, fontWeight: 700, letterSpacing: "0.04em", color: "#222" }}>***.482.***-10</div>
              </div>
            </Papel>
            <div style={{ position: "absolute", right: 70, top: 200 }}>
              <Carimbo linhas={["Carimbado"]} size={340} rot={-10} seed={71} />
            </div>
          </div>
          <Linha h={40} />
          <Texto size={42}>Sem cartão de papel, sem aplicativo. Passou o CPF na portaria e consumiu no bar: carimbou.</Texto>
        </Moldura>
      );
    case 3:
      return (
        <Moldura fmt="feed" pag={pag} seta={seta}>
          <Titulo linhas={["3 carimbos =", [{ t: "você escolhe.", c: C.lima }]]} size={124} />
          <Linha h={70} />
          <div style={{ display: "flex", justifyContent: "space-around", alignItems: "flex-end" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
              <Balde size={300} color={C.lima} stroke={1.1} />
              <div style={{ fontFamily: F.display, fontSize: 56, color: C.branco }}>BALDE DE CERVEJA</div>
            </div>
            <div style={{ fontFamily: F.mao, fontSize: 70, color: C.rosa, paddingBottom: 140 }}>ou</div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
              <Ico i="garrafa" size={300} color={C.lima} stroke={1.1} />
              <div style={{ fontFamily: F.display, fontSize: 56, color: C.branco }}>GARRAFA DE VODKA</div>
            </div>
          </div>
          <Linha h={60} />
          <Texto size={42}>O prêmio sai na noite em que você completar os 3 carimbos. É só pedir no caixa.</Texto>
        </Moldura>
      );
    case 4:
      return (
        <Moldura fmt="feed" pag={pag} seta={seta}>
          <Titulo linhas={["Sexta e domingo:", [{ t: "carimbo em dobro.", c: C.rosa }]]} size={104} />
          <Linha h={40} />
          <Cartela w={936} carimbos={2} dobro />
          <Linha h={40} />
          <Texto size={42}>Veio numa sexta e num domingo? Já são 4 carimbos: ganhou na 2ª visita.</Texto>
        </Moldura>
      );
    case 5:
      return (
        <Moldura fmt="feed" pag={pag} seta={seta}>
          <Titulo linhas={["Entrar e sair", [{ t: "não vale.", c: C.rosa }]]} size={128} />
          <Linha h={50} />
          <div style={{ display: "flex", justifyContent: "center", position: "relative" }}>
            <Papel w={860} h={330} rot={-2} topo={80} pauta={62}>
              <div style={{ position: "absolute", left: 130, top: 94, display: "flex", flexDirection: "column", gap: 14 }}>
                <Escrita start={0} size={52}>
                  entrou 23h10 · saiu 23h14
                </Escrita>
                <Escrita start={0} size={52}>
                  consumo: R$ 0,00
                </Escrita>
              </div>
            </Papel>
            <div style={{ position: "absolute", right: 90, top: 200 }}>
              <Carimbo linhas={["Não vale"]} size={300} rot={10} seed={81} />
            </div>
          </div>
          <Linha h={50} />
          <Texto size={40}>Só carimba a visita com consumo a partir de R$30 na comanda. Os carimbos valem por 60 dias, e a gente te avisa no WhatsApp quantos faltam.</Texto>
        </Moldura>
      );
    default:
      return (
        <Moldura fmt="feed" pag={pag}>
          <Titulo linhas={["Letras", [{ t: "grandes", c: C.lima }]]} size={130} />
          <Linha h={44} />
          <Regras
            size={34}
            itens={[
              "1 carimbo por noite, com consumo a partir de R$30 na comanda.",
              "Sexta e domingo valem 2 carimbos.",
              "3 carimbos em até 60 dias = 1 balde de cerveja ou 1 garrafa de vodka.",
              "O prêmio é pessoal e sai na noite em que você completa os carimbos.",
            ]}
          />
          <Linha h={60} />
          <Cta acao="Entra na lista pela bio" detalhe="seu CPF já é seu cartão" size={52} />
        </Moldura>
      );
  }
};

// =====================================================================
// STORIES estáticos (1 por ação + geral)
// =====================================================================
export type Acao = "casa" | "primeira" | "paga" | "carimbo";

export const Story: React.FC<{ acao: Acao }> = ({ acao }) => {
  if (acao === "casa")
    return (
      <Moldura fmt="story">
        <Titulo linhas={["No Butiquim,", "agora é a", [{ t: "casa que", c: C.lima }], [{ t: "te deve.", c: C.lima }]]} size={150} />
        <Linha h={70} />
        <div style={{ display: "flex", flexDirection: "column", gap: 50 }}>
          {JEITOS.map((j, i) => (
            <Jeito key={i} j={j} start={0} size={58} />
          ))}
        </div>
        <Linha h={70} />
        <Cta acao="Responde DEVE" detalhe="e a gente te explica tudo no direct" />
      </Moldura>
    );
  if (acao === "primeira")
    return (
      <Moldura fmt="story">
        <Eyebrow size={30}>Nunca veio no Butiquim?</Eyebrow>
        <Linha h={24} />
        <Titulo linhas={["A primeira", [{ t: "é nossa.", c: C.lima }]]} size={190} />
        <Linha h={70} />
        <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
          <PassaporteCapa w={400} rot={-7} />
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <Texto size={44}>Drink de boas-vindas na 1ª visita.</Texto>
            <Texto size={44}>
              E <b style={{ color: C.lima }}>R$20</b> pra voltar em 21 dias.
            </Texto>
          </div>
        </div>
        <Linha h={60} />
        <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
          <SeloSexDom size={210} rot={-8} texto={["R$ 40", "NA SEXTA E", "NO DOMINGO"]} />
          <Cta acao="Responde PRIMEIRA" />
        </div>
      </Moldura>
    );
  if (acao === "paga")
    return (
      <Moldura fmt="story">
        <Eyebrow size={30}>Faz tempo que você não vem</Eyebrow>
        <Linha h={24} />
        <Titulo linhas={["A gente", "paga pra", [{ t: "você vir.", c: C.lima }]]} size={150} />
        <Linha h={50} />
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Comanda
            w={700}
            numero="0845"
            linhas={[
              ["CRÉDITO DA CASA", "R$ 50,00"],
              ["SEX · DOM", "R$ 70,00"],
            ]}
            total={["VOCÊ PAGA", "R$ 0,00"]}
            carimbo={<Carimbo linhas={["Pago pela", "casa"]} size={280} rot={-16} seed={63} />}
          />
        </div>
        <Linha h={70} />
        <Cta acao="Responde VOLTEI" detalhe="pra quem não vem há 45 dias ou mais" />
      </Moldura>
    );
  return (
    <Moldura fmt="story">
      <Eyebrow size={30}>Carimbo no CPF</Eyebrow>
      <Linha h={24} />
      <Titulo linhas={["A 3ª visita", [{ t: "já ganha.", c: C.lima }]]} size={160} />
      <Linha h={60} />
      <Cartela w={920} carimbos={2} dobro />
      <Linha h={50} />
      <Texto size={46}>
        Balde de cerveja ou garrafa de vodka. <b style={{ color: C.rosa }}>Sexta e domingo: carimbo em dobro.</b>
      </Texto>
      <Linha h={60} />
      <Cta acao="Responde CARIMBO" />
    </Moldura>
  );
};

// =====================================================================
// DISPARO (cabeçalho de imagem do WhatsApp, 1,91:1)
// =====================================================================
export const Zap: React.FC<{ acao: Acao | "lembrete" }> = ({ acao }) => {
  const Cols: React.FC<{ esq: React.ReactNode; dir: React.ReactNode }> = ({ esq, dir }) => (
    <Moldura fmt="zap">
      <div style={{ display: "flex", alignItems: "center", gap: 60 }}>
        <div style={{ flex: 1 }}>{esq}</div>
        <div style={{ flex: "0 0 auto", display: "flex", justifyContent: "center" }}>{dir}</div>
      </div>
    </Moldura>
  );
  if (acao === "casa")
    return (
      <Cols
        esq={<Titulo linhas={["No Butiquim,", "agora é a casa", [{ t: "que te deve.", c: C.lima }]]} size={124} />}
        dir={<CadernetaFiado w={700} h={620} rot={3} />}
      />
    );
  if (acao === "primeira")
    return (
      <Cols
        esq={
          <>
            <Eyebrow size={30}>Primeira vez no Butiquim</Eyebrow>
            <Linha h={16} />
            <Titulo linhas={["A primeira", [{ t: "é nossa.", c: C.lima }]]} size={150} />
            <Linha h={24} />
            <Texto size={40}>
              Drink de boas-vindas + R$20 pra voltar <span style={{ color: C.rosa }}>(R$40 sexta e domingo)</span>
            </Texto>
          </>
        }
        dir={<PassaporteCapa w={440} rot={-6} />}
      />
    );
  if (acao === "paga")
    return (
      <Cols
        esq={
          <>
            <Eyebrow size={30}>Faz tempo que você não vem</Eyebrow>
            <Linha h={16} />
            <Titulo linhas={["A gente paga", [{ t: "pra você vir.", c: C.lima }]]} size={140} />
            <Linha h={24} />
            <Texto size={40}>
              R$50 no bar na sua volta. <span style={{ color: C.rosa }}>R$70 na sexta e no domingo.</span>
            </Texto>
          </>
        }
        dir={
          <Comanda
            w={600}
            numero="0845"
            linhas={[["CRÉDITO DA CASA", "R$ 50,00"]]}
            total={["VOCÊ PAGA", "R$ 0,00"]}
            carimbo={<Carimbo linhas={["Pago pela", "casa"]} size={250} rot={-16} seed={64} />}
          />
        }
      />
    );
  if (acao === "carimbo")
    return (
      <Cols
        esq={
          <>
            <Eyebrow size={30}>Carimbo no CPF</Eyebrow>
            <Linha h={16} />
            <Titulo linhas={["A 3ª visita", [{ t: "já ganha.", c: C.lima }]]} size={150} />
            <Linha h={24} />
            <Texto size={40}>
              Balde ou vodka. <span style={{ color: C.rosa }}>Sexta e domingo: carimbo em dobro.</span>
            </Texto>
          </>
        }
        dir={<Cartela w={820} carimbos={2} dobro />}
      />
    );
  return (
    <Cols
      esq={
        <>
          <Eyebrow size={30}>Última chamada</Eyebrow>
          <Linha h={16} />
          <Titulo linhas={["A casa ainda", [{ t: "te deve.", c: C.lima }]]} size={150} />
          <Linha h={24} />
          <Texto size={40}>
            Seu crédito vence domingo. <span style={{ color: C.rosa }}>Sexta e domingo valem mais.</span>
          </Texto>
        </>
      }
      dir={
        <div style={{ position: "relative" }}>
          <Papel w={640} h={560} rot={4} topo={110}>
            <div style={{ position: "absolute", left: 120, top: 150, display: "flex", flexDirection: "column", gap: 4 }}>
              <Escrita start={0} size={64}>
                Crédito: R$ 50
              </Escrita>
              <Escrita start={0} size={64}>
                Vence: domingo
              </Escrita>
            </div>
            <div style={{ position: "absolute", right: 30, bottom: 40 }}>
              <Carimbo linhas={["Não", "esquece"]} size={240} rot={-12} redondo seed={91} />
            </div>
          </Papel>
        </div>
      }
    />
  );
};

// =====================================================================
// VÍDEOS (Reels e stories 9:16; feed em movimento 4:5 para anúncio)
// =====================================================================
type Roteiro = {
  video: string;
  from: number;
  gancho: { eyebrow: string; titulo: (string | { t: string; c?: string }[])[] };
  objeto: (fmt: "feed" | "story", start: number) => React.ReactNode;
  explica: string;
  bonus: { de: string; para: string; texto: string };
  cta: { acao: string; detalhe?: string };
};

export const ROTEIROS: Record<Exclude<Acao, "casa">, Roteiro> = {
  primeira: {
    video: "broll/souvibe.mp4",
    from: 30,
    gancho: { eyebrow: "Nunca veio no Butiquim?", titulo: ["A primeira", [{ t: "é nossa.", c: C.lima }]] },
    objeto: (fmt, s) => (
      <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
        <PassaporteCapa w={fmt === "story" ? 380 : 320} rot={-7} start={s} />
        <PassaportePagina w={fmt === "story" ? 440 : 380} rot={5} start={s + 12} />
      </div>
    ),
    explica: "Drink de boas-vindas na 1ª visita e R$20 pra voltar em até 21 dias.",
    bonus: { de: "R$ 20", para: "R$ 40", texto: "Voltou na sexta ou no domingo? O passaporte vale R$40." },
    cta: { acao: "Entra na lista pela bio", detalhe: "o CPF confere que é sua 1ª vez" },
  },
  paga: {
    video: "broll/cqsamba.mp4",
    from: 60,
    gancho: { eyebrow: "Faz tempo que você não vem", titulo: ["A gente", "paga pra", [{ t: "você vir.", c: C.lima }]] },
    objeto: (fmt, s) => (
      <Comanda
        w={fmt === "story" ? 700 : 600}
        numero="0845"
        start={s}
        linhas={[
          ["CRÉDITO DA CASA", "R$ 50,00"],
          ["SEU CONSUMO", "R$ 50,00"],
        ]}
        total={["VOCÊ PAGA", "R$ 0,00"]}
        carimbo={<Carimbo linhas={["Pago pela", "casa"]} size={fmt === "story" ? 290 : 250} rot={-16} seed={65} start={s + 24} />}
      />
    ),
    explica: "Sumiu faz 45 dias ou mais? A gente põe R$50 no bar pra você voltar.",
    bonus: { de: "R$ 50", para: "R$ 70", texto: "Na sexta e no domingo, a volta vale R$70." },
    cta: { acao: "Manda VOLTEI", detalhe: `WhatsApp do Butiquim · ${ZAP_FONE}` },
  },
  carimbo: {
    video: "broll/ricardo.mp4",
    from: 20,
    gancho: { eyebrow: "Carimbo no CPF", titulo: ["A 3ª visita", [{ t: "já ganha.", c: C.lima }]] },
    objeto: (fmt, s) => <Cartela w={fmt === "story" ? 920 : 900} carimbos={2} start={s} />,
    explica: "Cada visita com consumo é um carimbo no seu CPF. Juntou 3: balde de cerveja ou garrafa de vodka.",
    bonus: { de: "1", para: "2", texto: "Sexta e domingo valem 2 carimbos por visita: dá pra ganhar já na 2ª." },
    cta: { acao: "Entra na lista pela bio", detalhe: "seu CPF já é seu cartão" },
  },
};

export const VIDEO_DUR = { story: 450, feed: 300 } as const;

export const AcaoVideo: React.FC<{ acao: Exclude<Acao, "casa">; fmt: "feed" | "story" }> = ({ acao, fmt }) => {
  const r = ROTEIROS[acao];
  const story = fmt === "story";
  const pad = story ? "220px 80px 280px" : "70px 72px 70px";
  const T = story ? { g: 110, o: 140, b: 110, c: 90 } : { g: 75, o: 95, b: 70, c: 60 };
  const dur = VIDEO_DUR[fmt];
  const tBig = story ? 176 : 150;
  return (
    <AbsoluteFill>
      <Fundo />
      <Html5Audio src={staticFile(r.video)} volume={(f) => interpolate(f, [0, 15, dur - 25, dur], [0, 0.55, 0.55, 0], clamp)} />
      <Sequence durationInFrames={T.g}>
        <Cena dur={T.g}>
          <Fundo video={r.video} from={r.from} videoOpacity={0.6} />
          <AbsoluteFill style={{ padding: pad, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <Eyebrow size={story ? 34 : 30}>{r.gancho.eyebrow}</Eyebrow>
            <div style={{ height: 24 }} />
            <Titulo linhas={r.gancho.titulo} size={tBig} start={6} />
          </AbsoluteFill>
        </Cena>
      </Sequence>
      <Sequence from={T.g} durationInFrames={T.o}>
        <Cena dur={T.o}>
          <AbsoluteFill style={{ padding: pad, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: story ? 80 : 50 }}>
            {r.objeto(fmt, 4)}
            <Texto size={story ? 48 : 40} start={30} style={{ textAlign: "center" }}>
              {r.explica}
            </Texto>
          </AbsoluteFill>
        </Cena>
      </Sequence>
      <Sequence from={T.g + T.o} durationInFrames={T.b}>
        <Cena dur={T.b}>
          <AbsoluteFill style={{ padding: pad, display: "flex", flexDirection: "column", justifyContent: "center", gap: story ? 70 : 44 }}>
            <SeloSexDom size={story ? 250 : 200} rot={-8} start={2} />
            <Troca de={r.bonus.de} para={r.bonus.para} size={acao === "carimbo" ? (story ? 240 : 200) : story ? 170 : 140} start={16} />
            <Texto size={story ? 48 : 40} start={34}>
              {r.bonus.texto}
            </Texto>
          </AbsoluteFill>
        </Cena>
      </Sequence>
      <Sequence from={T.g + T.o + T.b} durationInFrames={T.c}>
        <Cena dur={T.c} sai={false}>
          <AbsoluteFill style={{ padding: pad, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <SeloCasa size={story ? 46 : 40} />
            <div style={{ display: "flex", flexDirection: "column", gap: story ? 50 : 34 }}>
              <Titulo linhas={r.gancho.titulo} size={story ? 150 : 124} />
              <Cta acao={r.cta.acao} detalhe={r.cta.detalhe} start={10} size={story ? 54 : 46} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <Logo width={story ? 220 : 180} />
              <Esquina size={story ? 34 : 30} />
            </div>
          </AbsoluteFill>
        </Cena>
      </Sequence>
    </AbsoluteFill>
  );
};

// Reels geral ("o que é"), 18 s
export const CASA_DUR = 540;
export const CasaVideo: React.FC = () => {
  const pad = "220px 80px 280px";
  return (
    <AbsoluteFill>
      <Fundo />
      <Html5Audio src={staticFile("broll/souvibe.mp4")} volume={(f) => interpolate(f, [0, 15, CASA_DUR - 25, CASA_DUR], [0, 0.5, 0.5, 0], clamp)} />
      <Sequence durationInFrames={90}>
        <Cena dur={90}>
          <Fundo video="broll/souvibe.mp4" from={10} videoOpacity={0.6} />
          <AbsoluteFill style={{ padding: pad, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <Titulo linhas={["Um bar", "que te", [{ t: "deve?", c: C.lima }]]} size={250} start={4} />
          </AbsoluteFill>
        </Cena>
      </Sequence>
      <Sequence from={90} durationInFrames={130}>
        <Cena dur={130}>
          <AbsoluteFill style={{ padding: pad, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 60 }}>
            <Titulo linhas={["No boteco,", [{ t: "o fiado era seu.", c: C.lima }]]} size={110} align="center" />
            <CadernetaFiado w={900} h={620} rot={-3} start={8} virarEm={70} />
          </AbsoluteFill>
        </Cena>
      </Sequence>
      {JEITOS.map((j, i) => (
        <Sequence key={i} from={220 + i * 80} durationInFrames={80}>
          <Cena dur={80}>
            <AbsoluteFill style={{ padding: pad, display: "flex", flexDirection: "column", justifyContent: "center", gap: 50 }}>
              <div style={{ fontFamily: F.mao, fontSize: 150, color: C.rosa, lineHeight: 1 }}>{j.n}</div>
              <Titulo linhas={[["A primeira", "é nossa"], ["A gente paga", "pra você vir"], ["Carimbo", "no CPF"]][i]} size={140} start={2} />
              <div style={{ display: "flex", justifyContent: "center" }}>
                {i === 0 && <PassaporteCapa w={330} rot={-6} start={10} />}
                {i === 1 && (
                  <Comanda w={600} numero="0845" start={10} linhas={[["CRÉDITO DA CASA", "R$ 50,00"]]} total={["VOCÊ PAGA", "R$ 0,00"]} carimbo={<Carimbo linhas={["Pago pela", "casa"]} size={240} rot={-16} seed={66} start={30} />} />
                )}
                {i === 2 && <Cartela w={900} carimbos={2} start={8} />}
              </div>
              <Texto size={48} start={16}>
                {j.sub}
              </Texto>
            </AbsoluteFill>
          </Cena>
        </Sequence>
      ))}
      <Sequence from={460} durationInFrames={80}>
        <Cena dur={80} sai={false}>
          <AbsoluteFill style={{ padding: pad, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <SeloCasa size={46} />
            <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
              <Titulo linhas={["Sexta e domingo", [{ t: "valem mais.", c: C.rosa }]]} size={120} />
              <Cta acao="Entra na lista pela bio" detalhe="o CPF na portaria faz o resto" start={10} size={54} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <Logo width={220} />
              <Esquina size={34} />
            </div>
          </AbsoluteFill>
        </Cena>
      </Sequence>
    </AbsoluteFill>
  );
};

// =====================================================================
// APOIO
// =====================================================================
export const RegrasStory: React.FC = () => (
  <Moldura fmt="story">
    <Titulo linhas={["Regras", [{ t: "da casa", c: C.lima }]]} size={150} />
    <Linha h={50} />
    {(
      [
        ["A primeira é nossa", ["Só pra quem nunca veio (CPF).", "Drink de boas-vindas + R$20 em até 21 dias. R$40 sexta e domingo."]],
        ["A gente paga pra você vir", ["Pra quem não vem há 45 dias ou mais (CPF).", "R$50 no bar; R$70 sexta e domingo. Código vale 15 dias."]],
        ["Carimbo no CPF", ["1 carimbo por noite com consumo de R$30+. Sexta e domingo: 2.", "3 carimbos em 60 dias = balde de cerveja ou garrafa de vodka."]],
      ] as [string, string[]][]
    ).map(([t, itens], i) => (
      <div key={i} style={{ marginBottom: 46 }}>
        <div style={{ fontFamily: F.display, fontSize: 56, color: C.branco, textTransform: "uppercase", marginBottom: 16 }}>{t}</div>
        <Regras itens={itens} size={34} />
      </div>
    ))}
    <Texto size={30} color={C.cinza}>
      Créditos são pessoais, valem só consumo no bar (não valem entrada nem troco) e não se somam na mesma noite.
    </Texto>
  </Moldura>
);

export const Destaque: React.FC = () => (
  <AbsoluteFill style={{ background: C.noite, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <Carimbo linhas={["A casa", "te deve"]} size={620} rot={-10} redondo cor={C.lima} seed={99} style={{ mixBlendMode: "normal" }} />
  </AbsoluteFill>
);

export const Cartaz: React.FC = () => (
  <AbsoluteFill>
    <Fundo />
    <AbsoluteFill style={{ padding: "120px 120px 110px", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Logo width={340} />
        <Esquina size={48} />
      </div>
      <div style={{ height: 80 }} />
      <Titulo linhas={["A casa", [{ t: "te deve.", c: C.lima }]]} size={330} />
      <div style={{ height: 40 }} />
      <Texto size={66} color={C.cinza}>
        No boteco, o fiado era seu. Aqui, é a casa que te paga pra vir.
      </Texto>
      <div style={{ height: 90 }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 80 }}>
        {JEITOS.map((j, i) => (
          <Jeito key={i} j={j} start={0} size={96} />
        ))}
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <SeloSexDom size={380} rot={-8} />
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: F.display, fontSize: 110, color: C.branco, lineHeight: 1 }}>PERGUNTA</div>
          <div style={{ fontFamily: F.display, fontSize: 110, color: C.lima, lineHeight: 1 }}>NO CAIXA</div>
        </div>
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);

// lembrete em story (crédito vencendo)
export const LembreteStory: React.FC = () => (
  <Moldura fmt="story">
    <Eyebrow size={30}>Última chamada</Eyebrow>
    <Linha h={24} />
    <Titulo linhas={["A casa ainda", [{ t: "te deve.", c: C.lima }]]} size={170} />
    <Linha h={70} />
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Papel w={880} h={560} rot={-3} topo={110}>
        <div style={{ position: "absolute", left: 130, top: 150, display: "flex", flexDirection: "column", gap: 4 }}>
          <Escrita start={0} size={70}>
            Crédito: R$ 50
          </Escrita>
          <Escrita start={0} size={70}>
            Vence: domingo
          </Escrita>
        </div>
        <div style={{ position: "absolute", right: 40, bottom: 40 }}>
          <Carimbo linhas={["Não", "esquece"]} size={260} rot={-12} redondo seed={92} />
        </div>
      </Papel>
    </div>
    <Linha h={70} />
    <Cta acao="Entra na lista pela bio" detalhe="sexta e domingo valem mais" />
  </Moldura>
);
