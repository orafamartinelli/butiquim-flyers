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

## Render
`bash scripts/render-all.sh --rebundle` → `out/final/`. Um render por vez: em paralelo o
OffthreadVideo derruba o compositor. 3D usa `--gl=angle` (em `remotion.config.ts`).
