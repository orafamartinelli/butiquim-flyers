#!/usr/bin/env bash
# Novembro 2026 — vídeos (um por vez): FEED.mp4 + STORY-BROLL.mp4 de cada noite, agendas s6/s8/s9 e Folhinha do 14/11
cd "$(dirname "$0")/.."
r() { local out=${@: -1}; npx remotion render "$@" --codec=h264 --crf=18 --log=error && echo "OK $out" || echo "FALHOU $out"; }
for k in sexta6 sabado6 domingo6 sabado7 sabado8 domingo8 sexta9 sabado9; do
  r build-nov $k-feed out/final/$k-FEED.mp4
  r build-nov $k-broll out/final/$k-STORY-BROLL.mp4
done
for s in s6 s8 s9; do
  r build-nov agenda-$s-feed-video out/agendas/agenda-$s-FEED.mp4
  r build-nov agenda-$s-story-video out/agendas/agenda-$s-STORY.mp4
done
r src/entries/vespera/index.ts vespera3-feed out/vespera/vespera3-FEED.mp4
r src/entries/vespera/index.ts vespera3-story out/vespera/vespera3-STORY.mp4
r src/entries/vespera/index.ts vespera3-broll out/vespera/vespera3-STORY-BROLL.mp4
echo FIM
