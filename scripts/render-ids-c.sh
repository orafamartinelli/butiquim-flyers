#!/usr/bin/env bash
# Identidades C (19/10) — amostra: só o feed estático de cada dia (frame 150), um render por vez
cd "$(dirname "$0")/.."
mkdir -p out/ids-c
npx remotion bundle src/index.ts --out-dir=build-c --log=error || { echo "FALHOU bundle"; exit 1; }
for k in ${IDS:-sexta sabado domingo}; do
  npx remotion still build-c c-$k-feed out/ids-c/$k-C-FEED.png --frame=150 --log=error && echo "OK $k-C-FEED.png" || echo "FALHOU $k-C-FEED.png"
done
echo FIM
