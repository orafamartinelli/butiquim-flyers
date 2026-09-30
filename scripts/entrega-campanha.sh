#!/usr/bin/env bash
# Gera prévias leves (jpg 540px, mp4 540p) + index.html e copia a campanha para o Drive e Downloads.
set -e
cd "$(dirname "$0")/.."
OUT=out/campanha
rm -rf $OUT/previa && mkdir -p $OUT/previa
for f in $OUT/0*/*.png; do
  rel=${f#$OUT/}; d=$OUT/previa/$(dirname $rel); mkdir -p $d
  ffmpeg -loglevel error -y -i "$f" -vf "scale=540:-2" -q:v 4 "$d/$(basename "${f%.png}").jpg"
done
for f in $OUT/0*/*.mp4; do
  rel=${f#$OUT/}; d=$OUT/previa/$(dirname $rel); mkdir -p $d
  ffmpeg -loglevel error -y -i "$f" -vf "scale=540:-2" -c:v libx264 -crf 30 -preset veryfast -c:a aac -b:a 96k -movflags +faststart "$d/$(basename "$f")"
done
cp scripts/campanha-guia.html $OUT/index.html
du -sh $OUT/previa
DRIVE="/g/Meu Drive/02 O Butiquim/Campanha A Casa Te Deve - Out 2026"
mkdir -p "$DRIVE"
cp -r $OUT/0* $OUT/previa $OUT/index.html "$DRIVE/"
DL="/c/Users/User/Downloads/O Butiquim - Materiais/${DL_SUB:-07 - Agenda e Promos}/Campanha A Casa Te Deve - Out 2026"
mkdir -p "$DL"
cp -r $OUT/0* $OUT/previa $OUT/index.html "$DL/"
echo "Drive: $DRIVE"; echo "Downloads: $DL"
