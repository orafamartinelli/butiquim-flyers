#!/usr/bin/env bash
# Folhinha (véspera de Finados) do domingo 01/11 + story com vídeo do Alister reenquadrado (clipTop -180)
cd "$(dirname "$0")/.."
r() { npx remotion render "$@" --codec=h264 --crf=18 --log=error && echo "OK ${@: -1}" || echo "FALHOU ${@: -1}"; }
r build3 domingo3-broll out/final/domingo3-STORY-BROLL.mp4
r src/entries/vespera/index.ts vespera2-feed out/vespera/vespera2-FEED.mp4
r src/entries/vespera/index.ts vespera2-story out/vespera/vespera2-STORY.mp4
r src/entries/vespera/index.ts vespera2-broll out/vespera/vespera2-STORY-BROLL.mp4
echo FIM
