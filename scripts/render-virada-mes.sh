#!/usr/bin/env bash
# Vídeos do domingo 01/11 (virada do mês) e da agenda 30/10–01/11, a partir do pacote build2 (bundle com domingo5)
cd "$(dirname "$0")/.."
OUT=out/final
npx remotion render build2 domingo5-feed $OUT/domingo5-FEED.mp4 --codec=h264 --crf=18 --log=error && echo "OK domingo5-FEED.mp4" || echo "FALHOU domingo5-FEED.mp4"
npx remotion render build2 domingo5-broll $OUT/domingo5-STORY-BROLL.mp4 --codec=h264 --crf=18 --log=error && echo "OK domingo5-STORY-BROLL.mp4" || echo "FALHOU domingo5-STORY-BROLL.mp4"
for f in feed story; do
  F=$(echo $f | tr a-z A-Z)
  npx remotion render build2 agenda-s5-$f-video out/agendas/agenda-s5-$F.mp4 --codec=h264 --crf=18 --log=error && echo "OK agenda-s5-$F.mp4" || echo "FALHOU agenda-s5-$F.mp4"
done
echo FIM
