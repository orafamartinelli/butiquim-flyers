#!/bin/sh
# Recortes das fotos reais da casa (acervo @andercleiperez, Drive de Artes/09/Fotos - Geral/Casa Cheia - Interior)
# para a V2 "A casa cheia" da campanha Primeira Vez. Recortes evitam o neon de outra marca e a marca d'água.
# Uso: sh scripts/prep-fotos-primeira-vez.sh <pasta>  com os originais copiados e renomeados:
#   geral.png     = 2024/@andercleiperez-123.png
#   pagode.png    = 2024/@andercleiperez-43.png
#   sertanejo.png = 2024/@andercleiperez-39.png
FF="/c/Users/User/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.2-full_build/bin/ffmpeg.exe"
IN="$1"
OUT="$(dirname "$0")/../public/fotos/primeira-vez"
mkdir -p "$OUT"
q="-q:v 3"
# geral: plateia de mãos pra cima (5760x3840)
"$FF" -y -loglevel error -i "$IN/geral.png" -vf "crop=2800:3500:600:0,scale=1080:1350:flags=lanczos" $q "$OUT/v2-geral-feed.jpg"
"$FF" -y -loglevel error -i "$IN/geral.png" -vf "crop=1969:3500:820:0,scale=1080:1920:flags=lanczos" $q "$OUT/v2-geral-story.jpg"
# pagode: cantor + percussão (1920x1280), só a metade direita (neon de outra marca fica fora)
"$FF" -y -loglevel error -i "$IN/pagode.png" -vf "crop=800:1000:1120:200,scale=1080:1350:flags=lanczos,unsharp=5:5:0.6" $q "$OUT/v2-pagode-feed.jpg"
"$FF" -y -loglevel error -i "$IN/pagode.png" -vf "crop=720:1280:1200:0,scale=1080:1920:flags=lanczos,unsharp=5:5:0.6" $q "$OUT/v2-pagode-story.jpg"
# sertanejo: cantora de chapéu + letreiro BUTIQUIM (1920x1280), sem a marca d'água do rodapé
"$FF" -y -loglevel error -i "$IN/sertanejo.png" -vf "crop=800:1000:1120:150,scale=1080:1350:flags=lanczos,unsharp=5:5:0.6" $q "$OUT/v2-sertanejo-feed.jpg"
"$FF" -y -loglevel error -i "$IN/sertanejo.png" -vf "crop=720:1280:1150:0,scale=1080:1920:flags=lanczos,unsharp=5:5:0.6" $q "$OUT/v2-sertanejo-story.jpg"
ls -la "$OUT"
