#!/usr/bin/env bash
# Identidades C e D — conjunto completo de amostra por ID (FEED.png, FEED.mp4, STORY.png, STORY-BROLL.mp4), um render por vez
cd "$(dirname "$0")/.."
mkdir -p out/ids-c
npx remotion bundle src/index.ts --out-dir=build-c --log=error || { echo "FALHOU bundle"; exit 1; }
r() { local out=${@: -1}; npx remotion render "$@" --codec=h264 --crf=18 --log=error && echo "OK $out" || echo "FALHOU $out"; }
for k in ${IDS:-sexta sabado domingo sextaD sabadoD}; do
  npx remotion still build-c c-$k-feed out/ids-c/$k-FEED.png --frame=150 --log=error && echo "OK $k-FEED.png" || echo "FALHOU $k-FEED.png"
  npx remotion still build-c c-$k-story out/ids-c/$k-STORY.png --frame=150 --log=error && echo "OK $k-STORY.png" || echo "FALHOU $k-STORY.png"
  r build-c c-$k-feed out/ids-c/$k-FEED.mp4
  r build-c c-$k-broll out/ids-c/$k-STORY-BROLL.mp4
done
echo FIM
