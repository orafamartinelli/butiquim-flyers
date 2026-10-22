#!/usr/bin/env bash
# Render de um mês inteiro (noites + agendas das semanas completas + vésperas), um render por vez.
# Uso: MES=2026-12 bash scripts/render-mes.sh            (tudo do mês)
#      MES=2026-12 SO="sexta10 sabado11" bash scripts/render-mes.sh   (só essas chaves, sem agendas)
#      SEM_VIDEO=1 → só as imagens
cd "$(dirname "$0")/.."
MES=${MES:?informe MES=YYYY-MM}
LISTA=$(node -e "import('./scripts/_rotacao.mjs').then(m=>{const r=m.noitesDoMes('$MES');console.log(r.noites.map(n=>n.key).join(' '));console.log(r.agendas.map(a=>a.s).join(' '));console.log(r.noites.filter(n=>n.vespera).map(n=>n.vespera).join(' '))})")
NOITES=$(echo "$LISTA" | sed -n 1p); AGENDAS=$(echo "$LISTA" | sed -n 2p); VESPERAS=$(echo "$LISTA" | sed -n 3p)
if [ -n "$SO" ]; then NOITES="$SO"; AGENDAS=""; VESPERAS=""; fi
echo "noites: $NOITES | agendas: $AGENDAS | vesperas: $VESPERAS"
B=build-$MES
npx remotion bundle src/index.ts --out-dir=$B --log=error || { echo "FALHOU bundle"; exit 1; }
r() { local out=${@: -1}; npx remotion render "$@" --codec=h264 --crf=18 --log=error && echo "OK $out" || echo "FALHOU $out"; }
mkdir -p out/final out/agendas out/vespera
for k in $NOITES; do
  for f in feed story; do F=$(echo $f | tr a-z A-Z)
    npx remotion still $B $k-$f out/final/$k-$F.png --frame=150 --log=error && echo "OK $k-$F.png" || echo "FALHOU $k-$F.png"
  done
  [ -z "$SEM_VIDEO" ] && { r $B $k-feed out/final/$k-FEED.mp4; r $B $k-broll out/final/$k-STORY-BROLL.mp4; }
done
for s in $AGENDAS; do
  for f in feed story; do F=$(echo $f | tr a-z A-Z)
    npx remotion still $B agenda-$s-$f out/agendas/agenda-$s-$F.png --log=error && echo "OK agenda-$s-$F.png" || echo "FALHOU agenda-$s-$F.png"
    [ -z "$SEM_VIDEO" ] && r $B agenda-$s-$f-video out/agendas/agenda-$s-$F.mp4
  done
done
for v in $VESPERAS; do
  for f in feed story; do F=$(echo $f | tr a-z A-Z)
    npx remotion still src/entries/vespera/index.ts $v-$f out/vespera/$v-$F.png --frame=220 --log=error && echo "OK $v-$F.png" || echo "FALHOU $v-$F.png"
  done
  [ -z "$SEM_VIDEO" ] && { r src/entries/vespera/index.ts $v-feed out/vespera/$v-FEED.mp4; r src/entries/vespera/index.ts $v-story out/vespera/$v-STORY.mp4; r src/entries/vespera/index.ts $v-broll out/vespera/$v-STORY-BROLL.mp4; }
done
echo FIM
