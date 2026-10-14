#!/usr/bin/env bash
# Vídeos das urgências de outubro (14/10): domingos 18 e 25, sexta 30 (Sou Vibe) e agendas s4/s5
# Um render por vez (em paralelo o OffthreadVideo derruba o compositor). Bundle já feito em build/.
cd "$(dirname "$0")/.."
NOITES_RENDER="domingo3 domingo4 sexta5" bash scripts/render-all.sh
for s in s4 s5; do
  for f in feed story; do
    F=$(echo $f | tr a-z A-Z)
    npx remotion render build agenda-$s-$f-video out/agendas/agenda-$s-$F.mp4 --codec=h264 --crf=18 --log=error && echo "OK agenda-$s-$F.mp4" || echo "FALHOU agenda-$s-$F.mp4"
  done
done
echo FIM
