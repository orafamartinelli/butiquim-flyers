import React from "react";
import { fitText } from "@remotion/layout-utils";
import {
  C,
  Cabecalho,
  CarimboAprovado,
  CarimboRedondo,
  Check,
  Confete,
  F,
  Faixa,
  Grifo,
  INST,
  InstKey,
  Lista,
  Papel,
  Pronto,
  Titulo,
} from "./kit";

const W = 1080;
const X = 64;
const LARG = W - X * 2;

// mesmo corpo nas duas linhas do título (o menor que couber)
const corpoTitulo = (l1: string, l2: string, max: number) => {
  const a = fitText({ text: l1, withinWidth: LARG, fontFamily: F.display, fontWeight: 900 }).fontSize;
  const b = fitText({ text: l2, withinWidth: LARG, fontFamily: F.display, fontWeight: 900 }).fontSize;
  return Math.min(max, a * 0.97, b * 0.97);
};

const Bloco: React.FC<{ top: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ top, children, style }) => (
  <div style={{ position: "absolute", top, left: X, right: X, ...style }}>{children}</div>
);

// o título fica centrado na vertical dentro da sua área (títulos longos saem menores)
const TituloInst: React.FC<{ inst: InstKey; top: number; max: number }> = ({ inst, top, max }) => {
  const t = INST[inst];
  const fs = corpoTitulo(t.l1, t.l2, max);
  const area = max * 0.86 * 2;
  return (
    <Bloco top={top} style={{ height: area, display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: fs, lineHeight: 0.86, color: C.tinta, whiteSpace: "nowrap" }}>
        <div>{t.l1}</div>
        <div>{t.l2}</div>
      </div>
    </Bloco>
  );
};

// a oferta em 3 linhas
const Oferta: React.FC<{ top: number; grande: number; mini: number }> = ({ top, grande, mini }) => (
  <Bloco top={top}>
    <div style={{ fontFamily: F.mono, fontWeight: 700, fontSize: mini * 0.8, letterSpacing: "0.14em", color: C.cinza }}>NA SUA 1ª NOITE NA ESQUINA:</div>
    <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: grande, lineHeight: 0.95, color: C.tinta, marginTop: 6 }}>
      <Grifo rot={-0.8} style={{ padding: "0 14px" }}>ENTRADA GRÁTIS</Grifo>
    </div>
    <div style={{ fontFamily: F.texto, fontWeight: 800, fontSize: mini, color: C.tinta, marginTop: mini * 0.5, lineHeight: 1.15, textTransform: "uppercase" }}>
      + 1 dose de Smirnoff <span style={{ color: C.vermelho }}>+</span> passaporte de volta
    </div>
  </Bloco>
);

// ================= FEED 4:5 =================
export const Feed: React.FC<{ inst: InstKey }> = ({ inst }) => (
  <Pronto>
    <Papel>
      <Confete w={W} h={1350} n={14} seed={inst.length * 7} zonas={[{ y0: 1150, y1: 1190 }, { y0: 0, y1: 34 }]} />
      <Cabecalho top={40} esq="Edital nº 01/2027 · resultado final" dir="Maringá-PR" />
      <TituloInst inst={inst} top={112} max={262} />
      <Lista top={588} linhas={5} destaque={4} fs={23} />
      <div style={{ position: "absolute", top: 572, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <CarimboAprovado w={660} rot={-6} topo="comissão de boas-vindas" base="A 1ª É NOSSA." seed={3} />
      </div>
      <Oferta top={922} grande={128} mini={33} />
      <Faixa top={1196} h={154} logo={210} assinatura={46} legal={19} legalBottom={18} />
    </Papel>
  </Pronto>
);

// ================= STORY 9:16 (área segura: 250 px em cima e embaixo) =================
export const Story: React.FC<{ inst: InstKey }> = ({ inst }) => (
  <Pronto>
    <Papel>
      <Confete w={W} h={1920} n={24} seed={inst.length * 5 + 2} zonas={[{ y0: 60, y1: 236 }]} />
      <Cabecalho top={262} esq="Edital nº 01/2027 · resultado final" dir="Maringá-PR" />
      <TituloInst inst={inst} top={338} max={290} />
      <Lista top={850} linhas={6} destaque={5} fs={25} />
      <div style={{ position: "absolute", top: 846, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <CarimboAprovado w={800} rot={-6} topo="comissão de boas-vindas" base="A 1ª É NOSSA." seed={5} />
      </div>
      <Oferta top={1262} grande={140} mini={36} />
      <Faixa top={1530} h={390} logo={230} assinatura={50} legal={20} legalBottom={268} />
    </Papel>
  </Pronto>
);

// ================= CARROSSEL 4:5 =================
const Moldura: React.FC<{ n: number; titulo: string; children: React.ReactNode; confete?: number }> = ({ n, titulo, children, confete = 0 }) => (
  <Pronto>
    <Papel>
      {confete > 0 && <Confete w={W} h={1350} n={confete} seed={n * 13} zonas={[{ y0: 1150, y1: 1196 }]} />}
      <Cabecalho top={40} esq={titulo} dir={`${n}/7`} />
      {children}
      <Faixa top={1222} h={128} logo={170} assinatura={38} legal={18} legalBottom={14} />
    </Papel>
  </Pronto>
);

const Art: React.FC<{ n: string; children: React.ReactNode; fs?: number }> = ({ n, children, fs = 40 }) => (
  <div style={{ display: "flex", gap: 22, alignItems: "baseline", padding: "22px 0", borderBottom: `1.5px dashed ${C.linha}` }}>
    <div style={{ fontFamily: F.mono, fontWeight: 700, fontSize: fs * 0.62, color: C.vermelho, width: fs * 2.6, flex: "0 0 auto" }}>{n}</div>
    <div style={{ fontFamily: F.texto, fontWeight: 700, fontSize: fs, lineHeight: 1.15, color: C.tinta }}>{children}</div>
  </div>
);

const Seta: React.FC = () => (
  <div style={{ position: "absolute", right: X, top: 1066, fontFamily: F.mono, fontWeight: 700, fontSize: 26, letterSpacing: "0.12em", color: C.tinta }}>
    ARRASTA →
  </div>
);

// 1 — capa (uma por instituição)
export const Capa: React.FC<{ inst: InstKey }> = ({ inst }) => (
  <Moldura n={1} titulo="Edital do calouro 2027" confete={20}>
    <TituloInst inst={inst} top={130} max={290} />
    <Lista top={640} linhas={5} destaque={4} fs={24} />
    <div style={{ position: "absolute", top: 618, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <CarimboAprovado w={700} rot={-6} topo="comissão de boas-vindas" base="A 1ª É NOSSA." seed={9} />
    </div>
    <Bloco top={1020}>
      <div style={{ fontFamily: F.texto, fontWeight: 800, fontSize: 40, color: C.tinta, lineHeight: 1.1 }}>
        Sua 1ª noite de calouro
        <br />é por conta da esquina.
      </div>
    </Bloco>
    <Seta />
  </Moldura>
);

// 2 — passou? a gente comemora
const Cracha: React.FC = () => (
  <div style={{ position: "relative", width: 440, transform: "rotate(5deg)" }}>
    <div style={{ position: "absolute", left: 196, top: -90, width: 48, height: 120, background: C.vermelho, clipPath: "polygon(0 0, 100% 0, 80% 100%, 20% 100%)" }} />
    <div style={{ position: "relative", background: "#fff", borderRadius: 22, boxShadow: "0 30px 60px rgba(0,0,0,.25), 0 4px 10px rgba(0,0,0,.15)", overflow: "hidden" }}>
      <div style={{ width: 70, height: 16, borderRadius: 8, background: C.papelSombra, margin: "22px auto 0", boxShadow: "inset 0 2px 3px rgba(0,0,0,.25)" }} />
      <div style={{ background: C.tinta, color: C.marca, fontFamily: F.display, fontWeight: 900, fontSize: 84, textAlign: "center", marginTop: 20, padding: "6px 0 2px" }}>BIXO 2027</div>
      <div style={{ padding: "26px 34px 34px", fontFamily: F.mono, color: C.tinta }}>
        <div style={{ fontSize: 20, letterSpacing: "0.14em", opacity: 0.6 }}>NOME</div>
        <div style={{ fontSize: 46, fontWeight: 700, borderBottom: `2px solid ${C.tinta}`, paddingBottom: 6 }}>VOCÊ</div>
        <div style={{ fontSize: 20, letterSpacing: "0.14em", opacity: 0.6, marginTop: 18 }}>SITUAÇÃO</div>
        <div style={{ fontSize: 36, fontWeight: 700 }}>
          <Grifo style={{ padding: "0 8px" }}>APROVADO(A)</Grifo>
        </div>
      </div>
    </div>
  </div>
);

export const Slide2: React.FC = () => (
  <Moldura n={2} titulo="Art. 1º · do motivo" confete={14}>
    <Bloco top={118}>
      <Titulo texto="PASSOU?" largura={700} max={260} />
      <Titulo texto="A GENTE COMEMORA." largura={LARG} max={170} cor={C.vermelho} style={{ marginTop: 14 }} />
    </Bloco>
    <div style={{ position: "absolute", right: 64, top: 600, transform: "scale(1.12)", transformOrigin: "top right" }}>
      <Cracha />
    </div>
    <Bloco top={640} style={{ right: 580 }}>
      <div style={{ fontFamily: F.texto, fontWeight: 600, fontSize: 38, lineHeight: 1.22, color: C.tinta }}>
        Foi um ano inteiro de cursinho, simulado e lista de chamada.
      </div>
      <div style={{ fontFamily: F.texto, fontWeight: 800, fontSize: 38, lineHeight: 1.22, color: C.tinta, marginTop: 26 }}>
        Agora a sua 1ª noite de calouro é por conta da casa.
      </div>
    </Bloco>
  </Moldura>
);

// 3 — o que você ganha
const Item: React.FC<{ titulo: string; sub: string; fs: number }> = ({ titulo, sub, fs }) => (
  <div style={{ display: "flex", gap: 30, alignItems: "center", padding: "24px 0", borderBottom: `1.5px dashed ${C.linha}` }}>
    <Check size={70} />
    <div>
      <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: fs, lineHeight: 0.92, color: C.tinta }}>{titulo}</div>
      <div style={{ fontFamily: F.texto, fontWeight: 600, fontSize: 28, color: C.cinza, marginTop: 6 }}>{sub}</div>
    </div>
  </div>
);
export const Slide3: React.FC = () => (
  <Moldura n={3} titulo="Art. 2º · do que você ganha">
    <Bloco top={118}>
      <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 128, lineHeight: 0.9, color: C.tinta }}>O QUE VOCÊ GANHA</div>
      <div style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 26, letterSpacing: "0.12em", color: C.vermelho, marginTop: 14 }}>NA 1ª VISITA, COM A APROVAÇÃO NA MÃO:</div>
    </Bloco>
    <Bloco top={330}>
      <Item titulo="ENTRADA GRÁTIS" sub="a porta é por nossa conta" fs={104} />
      <Item titulo="1 DOSE DE SMIRNOFF" sub="de boas-vindas, no balcão" fs={74} />
      <Item titulo="PASSAPORTE DE VOLTA" sub="R$ 20 ou R$ 40 em consumo na próxima" fs={74} />
      <Item titulo="CARTÃO COM 2 CARIMBOS" sub="faltam só 2 pra ganhar uma garrafa" fs={74} />
    </Bloco>
    <div style={{ position: "absolute", right: 70, top: 1010 }}>
      <CarimboAprovado w={460} rot={-7} topo="" base="" grande="A 1ª É NOSSA." seed={17} />
    </div>
  </Moldura>
);

// 4 — como resgatar
const Passo: React.FC<{ n: number; titulo: string; sub: string }> = ({ n, titulo, sub }) => (
  <div style={{ display: "flex", gap: 34, alignItems: "flex-start", marginBottom: 70 }}>
    <div style={{ width: 128, height: 128, borderRadius: "50%", background: C.tinta, color: C.marca, fontFamily: F.display, fontWeight: 900, fontSize: 96, display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto", lineHeight: 1 }}>{n}</div>
    <div style={{ paddingTop: 8 }}>
      <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 92, lineHeight: 0.92, color: C.tinta }}>{titulo}</div>
      <div style={{ fontFamily: F.texto, fontWeight: 600, fontSize: 36, lineHeight: 1.2, color: C.cinza, marginTop: 8 }}>{sub}</div>
    </div>
  </div>
);
export const Slide4: React.FC = () => (
  <Moldura n={4} titulo="Art. 3º · de como resgatar">
    <Bloco top={118}>
      <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 128, lineHeight: 0.9, color: C.tinta }}>COMO RESGATAR</div>
    </Bloco>
    <Bloco top={330}>
      <Passo n={1} titulo="TIRA O PRINT" sub="do resultado ou da lista de aprovados com o seu nome" />
      <Passo n={2} titulo="TRAZ O DOCUMENTO" sub="com foto (RG ou CNH). Só pra maiores de 18." />
      <Passo n={3} titulo="MOSTRA NA PORTA" sub="e entra. A 1ª é nossa." />
    </Bloco>
    <div style={{ position: "absolute", right: 70, top: 960 }}>
      <CarimboAprovado w={440} rot={-8} topo="" base="" grande="SIMPLES ASSIM." seed={21} />
    </div>
  </Moldura>
);

// 5 — passaporte de volta (bilhete preto picotado)
export const Slide5: React.FC = () => (
  <Moldura n={5} titulo="Art. 4º · do passaporte de volta" confete={10}>
    <Bloco top={118}>
      <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 118, lineHeight: 0.9, color: C.tinta }}>
        VOLTOU?
        <br />
        <span style={{ color: C.vermelho }}>GANHOU DE NOVO.</span>
      </div>
    </Bloco>
    <div style={{ position: "absolute", left: 70, right: 70, top: 370, height: 600, transform: "rotate(-2deg)" }}>
      <div style={{ position: "absolute", inset: 0, background: C.noite, borderRadius: 26, boxShadow: "0 30px 60px rgba(0,0,0,.3)", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 100, borderBottom: `3px dashed rgba(247,246,242,.3)`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 44px" }}>
          <span style={{ fontFamily: F.display, fontWeight: 900, fontSize: 56, color: C.marca }}>PASSAPORTE DE VOLTA</span>
          <span style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 22, color: C.branco, opacity: 0.7, letterSpacing: "0.12em" }}>CALOURO 2027</span>
        </div>
        <div style={{ position: "absolute", top: 130, left: 44, right: 44, display: "flex", gap: 30 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 24, color: C.branco, opacity: 0.75, letterSpacing: "0.1em", marginBottom: 14 }}>VOLTOU EM ATÉ 21 DIAS</div>
            <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 172, color: C.branco, lineHeight: 1, whiteSpace: "nowrap" }}>R$ 20</div>
            <div style={{ fontFamily: F.texto, fontWeight: 700, fontSize: 30, color: C.branco }}>em consumo</div>
          </div>
          <div style={{ width: 0, borderLeft: `3px dashed rgba(247,246,242,.3)` }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 24, color: C.marca, letterSpacing: "0.1em", marginBottom: 14 }}>SE FOR SEXTA OU DOMINGO</div>
            <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 172, color: C.marca, lineHeight: 1, whiteSpace: "nowrap" }}>R$ 40</div>
            <div style={{ fontFamily: F.texto, fontWeight: 700, fontSize: 30, color: C.marca }}>em consumo</div>
          </div>
        </div>
        <div style={{ position: "absolute", left: 44, right: 44, bottom: 34, fontFamily: F.mono, fontSize: 22, color: C.branco, opacity: 0.6, letterSpacing: "0.06em" }}>
          RECEBE NA 1ª VISITA · VALE NA VOLTA EM ATÉ 21 DIAS
        </div>
      </div>
      {/* recortes do picote nas laterais */}
      <div style={{ position: "absolute", left: -26, top: 74, width: 52, height: 52, borderRadius: "50%", background: C.papel }} />
      <div style={{ position: "absolute", right: -26, top: 74, width: 52, height: 52, borderRadius: "50%", background: C.papel }} />
    </div>
    <Bloco top={1040}>
      <div style={{ fontFamily: F.texto, fontWeight: 700, fontSize: 38, lineHeight: 1.2, color: C.tinta }}>
        A 1ª é nossa. A 2ª já vem com crédito.
      </div>
    </Bloco>
  </Moldura>
);

// 6 — cartão que já nasce com 2 carimbos
export const Slide6: React.FC = () => (
  <Moldura n={6} titulo="Art. 5º · do cartão de carimbos">
    <Bloco top={118}>
      <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 104, lineHeight: 0.9, whiteSpace: "nowrap", color: C.tinta }}>
        SEU CARTÃO JÁ NASCE
        <br />
        COM <span style={{ color: C.vermelho }}>2 CARIMBOS.</span>
      </div>
    </Bloco>
    <div style={{ position: "absolute", left: 70, right: 70, top: 370, height: 490, background: "#fff", borderRadius: 24, boxShadow: "0 30px 60px rgba(0,0,0,.22), 0 4px 10px rgba(0,0,0,.12)", transform: "rotate(1.5deg)", padding: "36px 44px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontFamily: F.mono, color: C.tinta }}>
        <span style={{ fontFamily: F.display, fontWeight: 900, fontSize: 54 }}>CARTÃO DO CALOURO</span>
        <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: "0.12em", opacity: 0.6 }}>4 = 1 GARRAFA</span>
      </div>
      <div style={{ height: 3, background: C.tinta, margin: "16px 0 34px" }} />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ width: 196, height: 196, borderRadius: "50%", border: i < 2 ? "none" : `4px dashed rgba(17,17,19,.35)`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
            {i < 2 ? <CarimboRedondo d={196} rot={i === 0 ? -14 : 9} seed={11 + i} /> : <span style={{ fontFamily: F.display, fontWeight: 900, fontSize: 80, color: "rgba(17,17,19,.22)" }}>{i + 1}</span>}
          </div>
        ))}
      </div>
      <div style={{ fontFamily: F.mono, fontSize: 22, color: C.cinza, marginTop: 34, letterSpacing: "0.04em" }}>1 CARIMBO POR VISITA · O 4º VIRA UMA GARRAFA DE SMIRNOFF</div>
    </div>
    <Bloco top={940}>
      <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 96, lineHeight: 0.92, color: C.tinta }}>
        FALTAM 2 PRA UMA <br /><Grifo style={{ padding: "0 12px" }}>GARRAFA DE SMIRNOFF</Grifo>
      </div>
    </Bloco>
  </Moldura>
);

// 7 — regras + assinatura
export const Slide7: React.FC = () => (
  <Moldura n={7} titulo="Art. 6º · das regras" confete={16}>
    <Bloco top={118}>
      <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 128, lineHeight: 0.9, color: C.tinta }}>AS REGRAS</div>
    </Bloco>
    <Bloco top={270}>
      <Art n="§ 1º">Só para maiores de 18 anos.</Art>
      <Art n="§ 2º">Print do resultado ou da lista de aprovados com o seu nome + documento com foto.</Art>
      <Art n="§ 3º">Vale para aprovados no vestibular 2027 de faculdades de Maringá, na 1ª visita.</Art>
      <Art n="§ 4º">De 30/11/2026 a 31/03/2027.</Art>
    </Bloco>
    <Bloco top={790} style={{ textAlign: "center" }}>
      <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 150, lineHeight: 0.88, color: C.tinta }}>TE VEJO</div>
      <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 150, lineHeight: 0.88, color: C.vermelho }}>NA ESQUINA</div>
    </Bloco>
  </Moldura>
);

export const SLIDES: Record<number, React.FC> = { 2: Slide2, 3: Slide3, 4: Slide4, 5: Slide5, 6: Slide6, 7: Slide7 };
