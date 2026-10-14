# butiquim-flyers

Flyers do Butiquim em código (Remotion): feed estático, feed em vídeo, story e story com B-roll,
uma identidade visual por noite. Criado em 26/09/2026 como teste para substituir o design manual.

## Identidades
- **Sexta — "Placa de Esquina"** (`src/ids/Sexta.tsx`): preto + lima, Big Shoulders, placa "NA ESQUINA COM".
- **Sabadá — "Esquina de Vidro"** (`src/ids/Sabado.tsx`): luzes do palco, cromo furta-cor, card de vidro fosco.
- **Saideira — "Rótulo da Última Rodada"** (`src/ids/Domingo.tsx`): âmbar/cobre, Fraunces, selo, faixa e canhoto.
- Elo comum: o "O" do logo em 3D (`src/shared/Ring3D.tsx`, Three.js), com material por noite.

## Dados
`src/data.ts` — artista, data, hora e lista de cada noite. Conferir sempre em `butiquim_social_posts`
(espelho da planilha oficial) antes de renderizar.

## Insumos
- Fotos oficiais: objetos inteligentes dos PSDs do designer (`scripts/psd-extract.mjs psd/X.psd assets/raw-X`),
  depois `scripts/prep-assets.py` recorta e salva em `public/fotos/`.
- B-roll: `public/broll/*.mp4` (1080x1920, 11s), cortados com ffmpeg dos vídeos em
  "09 - FOTOS E VIDEOS/01 - VIDEOS - Artistas no Butica" ou da biblioteca de música.

## Estúdio (peças pedidas pelo WhatsApp) — desde 14/10/2026
- Composição `src/ids/Aviso.tsx` (entrada `src/entries/aviso/`): `aviso-feed` 1080×1350 e `aviso-story` 1080×1920
  (still no frame 150 + vídeo de 7 s que vai pro feed como Reels). Props: titulo ("A - B" → B vira a faixa lima),
  chamada, regra, data_evento, hora, dia_semana, imagem (+ imagem_modo logo|foto), tom (promo|evento|convidado|aviso).
- Nuvem: `.github/workflows/estudio-render.yml` (repository_dispatch `estudio_render` {pedido_id} ou workflow_dispatch)
  roda `scripts/estudio-render.mjs`: lê o pedido no Supabase, renderiza, sobe em
  `butiquim-social/estudio/pedido-<id>-v<versao>-{feed.jpg,story.jpg,feed.mp4}`, grava `provas` + status `em_prova`
  e manda as 3 peças no grupo do pedido (Z-API). Contrato completo no topo do script.
- Prévia local: `bash scripts/estudio-local.sh [props.json] [prefixo]` → `out/estudio/`.

## Render
`bash scripts/render-all.sh --rebundle` → `out/final/`. Um render por vez: em paralelo o
OffthreadVideo derruba o compositor. 3D usa `--gl=angle` (em `remotion.config.ts`).
