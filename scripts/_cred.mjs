// Credencial do Supabase: na NUVEM (GitHub Actions) vem do ambiente (SUPABASE_URL + SUPABASE_SECRET_KEY);
// no PC, do cofre. Mesmo formato do arquivo do cofre: { project_url, secret_key }.
import { readFileSync } from "fs";

export const credSupabase = () =>
  process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY
    ? { project_url: process.env.SUPABASE_URL, secret_key: process.env.SUPABASE_SECRET_KEY }
    : JSON.parse(readFileSync("C:/Users/User/Documents/projetos/.credentials/supabase-new-api-keys.json", "utf8"));

// ffmpeg completo: FFMPEG no runner (estático em node_modules/.ffmpeg), o do WinGet no PC
export const FFMPEG =
  process.env.FFMPEG ||
  (process.platform === "win32"
    ? "C:/Users/User/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.2-full_build/bin/ffmpeg.exe"
    : "ffmpeg");
