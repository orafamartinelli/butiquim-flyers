#!/usr/bin/env bash
# Prévia local do ESTÚDIO: bundle + stills (um render por vez). Uso: bash scripts/estudio-local.sh [props.json] [prefixo]
cd "$(dirname "$0")/.."
PROPS=${1:-}
PFX=${2:-local}
mkdir -p out/estudio
npx remotion bundle src/entries/aviso/index.ts --out-dir=build-estudio --log=error >/dev/null || exit 1
ARG=()
[ -n "$PROPS" ] && ARG=(--props="$PROPS")
for f in feed story; do
  npx remotion still build-estudio aviso-$f out/estudio/$PFX-$f.jpg --frame=150 --image-format=jpeg --jpeg-quality=92 --log=error "${ARG[@]}" >/dev/null && echo "OK out/estudio/$PFX-$f.jpg"
done
