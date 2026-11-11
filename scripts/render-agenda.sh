#!/usr/bin/env bash
# Render SÓ das agendas de semana (feed + story, vídeo + still), um por vez.
# Uso: bash scripts/render-agenda.sh s7 [s9 ...]   → out/agendas/agenda-sN-{FEED,STORY}.{mp4,png}
set -u
cd "$(dirname "$0")/.."
[ $# -ge 1 ] || { echo "informe as semanas (ex.: s7)"; exit 1; }
B=build-agenda
npx remotion bundle src/index.ts --out-dir=$B --log=error || { echo "FALHOU bundle"; exit 1; }
mkdir -p out/agendas
falhou=0
for s in "$@"; do
  for f in feed story; do F=$(echo $f | tr a-z A-Z)
    npx remotion still $B agenda-$s-$f out/agendas/agenda-$s-$F.png --gl=angle --log=error && echo "OK agenda-$s-$F.png" || { echo "FALHOU agenda-$s-$F.png"; falhou=1; }
    npx remotion render $B agenda-$s-$f-video out/agendas/agenda-$s-$F.mp4 --codec=h264 --crf=18 --gl=angle --log=error && echo "OK agenda-$s-$F.mp4" || { echo "FALHOU agenda-$s-$F.mp4"; falhou=1; }
  done
done
exit $falhou
