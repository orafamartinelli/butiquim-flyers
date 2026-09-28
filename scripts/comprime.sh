#!/bin/bash
# Versão web das artes (720px) + capas dos vídeos, para a página dos sócios
SRC="/g/Meu Drive/02 O Butiquim/Teste Identidade Nova - Out 2026"
DST="C:/Users/User/AppData/Local/Temp/claude/C--Users-User/1ba7c3b4-4112-40bc-bfff-dc730696006a/scratchpad/socios/m"
img() { [ -f "$DST/$2.jpg" ] || ffmpeg -v error -y -i "$SRC/$1" -vf scale=720:-2 -q:v 4 "$DST/$2.jpg"; }
vid() { # $1 origem, $2 nome, $3 segundo da capa
  [ -f "$DST/$2.mp4" ] || ffmpeg -v error -y -i "$SRC/$1" -vf scale=720:-2 -c:v libx264 -crf 27 -preset medium -pix_fmt yuv420p -c:a aac -b:a 96k -movflags +faststart "$DST/$2.mp4"
  [ -f "$DST/$2-capa.jpg" ] || ffmpeg -v error -y -ss "$3" -i "$SRC/$1" -frames:v 1 -vf scale=540:-2 -q:v 5 "$DST/$2-capa.jpg"
}
for k in sexta sabado domingo sexta2 sabado2 domingo2 sexta3 sabado3 sexta4 sabado4 sexta5 sabado5 vespera; do
  img "$k-FEED.png" "$k-feed"; img "$k-STORY.png" "$k-story"
  vid "$k-FEED.mp4" "$k-feed-video" 3.5; vid "$k-STORY-BROLL.mp4" "$k-broll" 3.5
done
for d in sexta sabado domingo; do
  img "lista-$d-A-FEED.png" "lista-$d-a-feed"; img "lista-$d-A-STORY.png" "lista-$d-a-story"
  vid "lista-$d-B-FEED.mp4" "lista-$d-b-feed" 3.5; vid "lista-$d-B-STORY.mp4" "lista-$d-b-story" 3.5
done
for s in 1 2 3 4 5; do
  img "agenda-s$s-FEED.png" "agenda-s$s-feed"; img "agenda-s$s-STORY.png" "agenda-s$s-story"
  vid "agenda-s$s-FEED.mp4" "agenda-s$s-feed-video" 3.5; vid "agenda-s$s-STORY.mp4" "agenda-s$s-story-video" 3.5
done
for k in sexta sabado domingo sexta2 sabado2 domingo2 sexta3 sabado3 sexta4 sabado4 sexta5 sabado5; do
  [ -f "$SRC/referencia/$k-FEED-atual.mp4" ] || continue
  vid "referencia/$k-FEED-atual.mp4" "ref-$k-feed" 3; img "referencia/$k-STORY-atual.png" "ref-$k-story"
done
echo "PRONTO: $(ls "$DST" | wc -l) arquivos, $(du -sh "$DST" | cut -f1)"
