#!/usr/bin/env bash
# mede o custo do vídeo do Estúdio com GL por software e 2 núcleos (como o runner do GitHub). Uso: bash scripts/estudio-bench.sh rotulo
cd "$(dirname "$0")/.."
npx remotion bundle src/entries/aviso/index.ts --out-dir=build-estudio --log=error >/dev/null || exit 1
mkdir -p build-estudio/public/estudio
cp out/estudio/anel-bench.png build-estudio/public/estudio/anel-bench.png 2>/dev/null
ini=$(date +%s)
npx remotion render build-estudio aviso-video out/estudio/bench-$1.mp4 --frames=60-89 --gl=swangle --concurrency=2 --log=error \
  --props='{"titulo":"Final do Paulistão - Camisa do Campeão","chamada":"Quem vier com a camisa do Maringá FC entra grátis a noite toda","regra":"Camisa","data_evento":"2026-10-18","hora":"22:00","anelSrc":"estudio/anel-bench.png"}' >/dev/null
echo "$1: $(( $(date +%s) - ini ))s para 30 quadros"
