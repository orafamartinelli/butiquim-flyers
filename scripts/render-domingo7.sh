#!/usr/bin/env bash
# Domingo 15/11 (João Maurício, identidade A) — preenchido pelo Victor depois do lote de novembro. Um render por vez.
cd "$(dirname "$0")/.."
npx remotion bundle src/index.ts --out-dir=build-nov --log=error
for f in feed story; do F=$(echo $f | tr a-z A-Z)
  npx remotion still build-nov domingo7-$f out/final/domingo7-$F.png --frame=150 --log=error && echo "OK domingo7-$F.png" || echo "FALHOU domingo7-$F.png"
done
r() { local out=${@: -1}; npx remotion render "$@" --codec=h264 --crf=18 --log=error && echo "OK $out" || echo "FALHOU $out"; }
r build-nov domingo7-feed out/final/domingo7-FEED.mp4
r build-nov domingo7-broll out/final/domingo7-STORY-BROLL.mp4
echo FIM
