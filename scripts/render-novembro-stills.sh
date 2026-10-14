#!/usr/bin/env bash
# Novembro 2026 — imagens estáticas (feed/story) de cada noite, Folhinha do 14/11 e agendas s6–s9, num bundle próprio (build-nov)
cd "$(dirname "$0")/.."
npx remotion bundle src/index.ts --out-dir=build-nov --log=error
for k in sexta6 sabado6 domingo6 sabado7 sabado8 domingo8 sexta9 sabado9; do
  for f in feed story; do F=$(echo $f | tr a-z A-Z)
    npx remotion still build-nov $k-$f out/final/$k-$F.png --frame=150 --log=error && echo "OK $k-$F.png" || echo "FALHOU $k-$F.png"
  done
done
for s in s6 s7 s8 s9; do
  for f in feed story; do F=$(echo $f | tr a-z A-Z)
    npx remotion still build-nov agenda-$s-$f out/agendas/agenda-$s-$F.png --log=error && echo "OK agenda-$s-$F.png" || echo "FALHOU agenda-$s-$F.png"
  done
done
for f in feed story; do F=$(echo $f | tr a-z A-Z)
  npx remotion still src/entries/vespera/index.ts vespera3-$f out/vespera/vespera3-$F.png --frame=220 --log=error && echo "OK vespera3-$F.png" || echo "FALHOU vespera3-$F.png"
done
echo FIM
