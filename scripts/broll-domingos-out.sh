#!/usr/bin/env bash
# B-roll (11s, 1080x1920, com áudio) dos domingos 18/10 (Alister Ferraz) e 25/10 (João Maurício)
# mesmos pontos de corte do corte 01 da biblioteca (editor-clipes/PRONTOS/*/_fontes.json), mas do BRUTO limpo
set -e
cd "$(dirname "$0")/.."
FF=/c/Users/User/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.2-full_build/bin/ffmpeg
VF="scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=30"
corta() { # $1 bruto, $2 início (s), $3 saída
  "$FF" -v error -y -ss "$2" -i "$1" -t 11 -vf "$VF" -c:v libx264 -crf 18 -preset medium -pix_fmt yuv420p -c:a aac -b:a 192k -ar 48000 "$3"
  echo "OK $3"
}
corta "C:/Users/User/Documents/projetos/butiquim-social/editor-clipes/baixados/alister-DTVgNDDAIuD.mp4" "${ALISTER_INI:-25}" public/broll/alister.mp4
corta "G:/.shortcut-targets-by-id/1oT-4W3zvBBiSf96Wem3-GPJR10vxF5vx/01 - Drive de Artes - O Butiquim/09 - FOTOS E VIDEOS/01 - VIDEOS - Artistas no Butica/João Mauricio/João 01.mov" "${JOAO_INI:-12}" public/broll/joao.mp4
