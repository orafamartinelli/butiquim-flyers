#!/usr/bin/env bash
# Renderiza as 4 peças de cada noite: FEED.png, FEED.mp4, STORY.png, STORY-BROLL.mp4
# Uma de cada vez: renders em paralelo derrubam o extrator de vídeo do Remotion (OffthreadVideo).
cd "$(dirname "$0")/.."
OUT=out/final
mkdir -p $OUT
[ "$1" = "--rebundle" ] && npx remotion bundle src/index.ts --out-dir=build --log=error >/dev/null
fail=0
run() { # $1 = arquivo de saída, resto = comando
  local f=$1; shift
  [ -s "$f" ] && [ "$FORCE" != "1" ] && { echo "pula $f"; return; }
  if "$@" --log=error >/dev/null 2>"$f.log"; then echo "OK $f"; rm -f "$f.log"; else echo "FALHOU $f (ver $f.log)"; fail=1; fi
}
for d in ${NOITES_RENDER:-sexta sabado domingo sexta2 sabado2 domingo2}; do
  run $OUT/$d-FEED.png npx remotion still build $d-feed $OUT/$d-FEED.png --frame=150
  run $OUT/$d-STORY.png npx remotion still build $d-story $OUT/$d-STORY.png --frame=150
  run $OUT/$d-FEED.mp4 npx remotion render build $d-feed $OUT/$d-FEED.mp4 --codec=h264 --crf=18
  run $OUT/$d-STORY-BROLL.mp4 npx remotion render build $d-broll $OUT/$d-STORY-BROLL.mp4 --codec=h264 --crf=18
done
exit $fail
