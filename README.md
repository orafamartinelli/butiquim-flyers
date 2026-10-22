# butiquim-flyers

Flyers do Butiquim em código (Remotion): feed estático, feed em vídeo, story e story com B-roll,
uma identidade visual por noite. Criado em 26/09/2026 como teste para substituir o design manual.

## Identidades
- **Sexta — "Placa de Esquina"** (`src/ids/Sexta.tsx`): preto + lima, Big Shoulders, placa "NA ESQUINA COM".
- **Sabadá — "Esquina de Vidro"** (`src/ids/Sabado.tsx`): luzes do palco, cromo furta-cor, card de vidro fosco.
- **Saideira — "Rótulo da Última Rodada"** (`src/ids/Domingo.tsx`): âmbar/cobre, Fraunces, selo, faixa e canhoto.
- Elo comum: o "O" do logo em 3D (`src/shared/Ring3D.tsx`, Three.js), com material por noite.
- **B** (2º fds): Sexta "Painel de Embarque" (`SextaB`), Sabadá "Lado A" (`SabadoB`), Saideira "Letreiro Neon" (`DomingoB`).
- **C** (aprovadas 20/10): Sexta "Lambe-lambe" (`SextaC`), Sabadá "Lousa do Butica" (`SabadoC`), Saideira "Comanda" (`DomingoC`).
- **D** (aprovadas 20/10): Sexta "Mesa do Butica" (`SextaD`), Sabadá "Gibi do Butica" (`SabadoD`). Domingo não tem D.
- Véspera de feriado: "Folhinha" (`Vespera`, entrada própria em `src/entries/vespera`).

## Rotação (desde dez/2026)
`src/rotacao.ts` (espelho em `scripts/_rotacao.mjs` — manter iguais): semana 1 = semana da sexta 02/10/2026.
Semanas 1–9 alternam A/B (como foram produzidas); da semana 10 em diante gira **C → D → A → B** (domingo **C → A → B**).
Agenda de terça gira V1 → V2 → V3 e só existe com a semana completa (sex, sáb e dom na planilha).
`Root.tsx` escolhe a identidade sozinho (`compDe`) e registra as agendas das semanas ≥ 10 (`AGENDAS_AUTO`).
Conferir: `node scripts/checa-rotacao.mjs`.

## Dados
`src/data.ts` — artista, data, hora e lista de cada noite. A agenda vem de `butiquim_social_posts` (espelho da
planilha oficial) via `node scripts/sync-agenda.mjs <de> <ate>` → `src/agenda.json`.
**Noite nova = 1 linha em `NOITES`** (`<dia><semana>: noiteDe("AAAA-MM-DD")`; chave pelo `chaveDe` da rotação).

## Produzir um mês (fluxo oficial)
1. `node scripts/sync-agenda.mjs 2026-10-01 AAAA-MM-31` e adicionar as noites novas em `src/data.ts`.
2. `MES=AAAA-MM bash scripts/render-mes.sh` (noites + agendas + vésperas; `SO="chaves"` renderiza só algumas).
3. `node scripts/fila-mes.mjs --mes AAAA-MM` (simula) → `--gravar` (sobe pro bucket e grava `butiquim_social_avulso`).
4. `node scripts/etiqueta-datas-show.mjs --gravar` (protege as noites contra troca de atração).
5. `node scripts/previa-mes.mjs AAAA-MM` (Drive `Agenda Claude\MM - MÊS\previa.html`) e `node scripts/revisa-datas-artistas.mjs`.

## Insumos
- Fotos oficiais: objetos inteligentes dos PSDs do designer (`scripts/psd-extract.mjs psd/X.psd assets/raw-X`),
  depois `scripts/prep-assets.py` recorta e salva em `public/fotos/`.
- B-roll: `public/broll/*.mp4` (1080x1920, 11s), cortados com ffmpeg dos vídeos em
  "09 - FOTOS E VIDEOS/01 - VIDEOS - Artistas no Butica" ou da biblioteca de música.

## Estúdio (peças pedidas pelo WhatsApp) — desde 14/10/2026
- Composição `src/ids/Aviso.tsx` (entrada `src/entries/aviso/`): `aviso-feed` 1080×1350 e `aviso-story` 1080×1920
  (stills no frame 150) + `aviso-video` 1080×1920 de 6 s que vai pro feed como Reels. Props: titulo ("A - B" → B vira
  a faixa lima), chamada, regra, data_evento, hora, dia_semana, imagem (+ imagem_modo logo|foto), tom (promo|evento|convidado|aviso).
  `--props` se MESCLA com o defaultProps: mandar todos os campos (null = não tem).
- Vídeo barato no runner (CPU, 2 núcleos, WebGL por software ≈ 1–2 s/quadro): o "O" 3D sai 1× em PNG (`aviso-anel-story`)
  e anima em 2D; só a entrada (60 quadros) é renderizada e o resto até 6 s é push-in no ffmpeg. Medir: `scripts/estudio-bench.sh`.
- Nuvem: `.github/workflows/estudio-render.yml` (repository_dispatch `estudio_render` {pedido_id} ou workflow_dispatch)
  roda `scripts/estudio-render.mjs`: lê o pedido no Supabase, renderiza, sobe em
  `butiquim-social/estudio/pedido-<id>-v<versao>-{feed.jpg,story.jpg,feed.mp4}`, grava `provas` + status `em_prova`
  e manda as 3 peças no grupo do pedido (Z-API). Contrato completo no topo do script.
- Prévia local: `bash scripts/estudio-local.sh [props.json] [prefixo]` → `out/estudio/`.

## Render
`bash scripts/render-all.sh --rebundle` → `out/final/`. Um render por vez: em paralelo o
OffthreadVideo derruba o compositor. 3D usa `--gl=angle` (em `remotion.config.ts`).
