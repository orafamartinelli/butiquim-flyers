import { loadFont as bigShoulders } from "@remotion/google-fonts/BigShoulders";
import { loadFont as archivo } from "@remotion/google-fonts/Archivo";
import { loadFont as unbounded } from "@remotion/google-fonts/Unbounded";
import { loadFont as fraunces } from "@remotion/google-fonts/Fraunces";

const latin: ("latin" | "latin-ext")[] = ["latin", "latin-ext"];
export const BIG = bigShoulders("normal", { weights: ["800", "900"], subsets: latin }).fontFamily;
export const ARCHIVO = archivo("normal", { weights: ["500", "600", "700", "800", "900"], subsets: latin }).fontFamily;
archivo("italic", { weights: ["800", "900"], subsets: latin });
export const UNB = unbounded("normal", { weights: ["500", "700", "900"], subsets: latin }).fontFamily;
export const FRAUNCES = fraunces("normal", { weights: ["400", "600", "900"], subsets: latin }).fontFamily;
fraunces("italic", { weights: ["400", "600", "900"], subsets: latin });

// identidades B
import { loadFont as barlowCond } from "@remotion/google-fonts/BarlowCondensed";
import { loadFont as anton } from "@remotion/google-fonts/Anton";
import { loadFont as yellowtail } from "@remotion/google-fonts/Yellowtail";
import { loadFont as monoton } from "@remotion/google-fonts/Monoton";
export const BARLOW = barlowCond("normal", { weights: ["500", "700", "800", "900"], subsets: latin }).fontFamily;
barlowCond("italic", { weights: ["800", "900"], subsets: latin });
export const ANTON = anton("normal", { weights: ["400"], subsets: latin }).fontFamily;
export const YELLOWTAIL = yellowtail("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily;
export const MONOTON = monoton("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily;

// identidades C (19/10): lambe-lambe, chope gelado, comanda
import { loadFont as bebas } from "@remotion/google-fonts/BebasNeue";
import { loadFont as alfa } from "@remotion/google-fonts/AlfaSlabOne";
import { loadFont as league } from "@remotion/google-fonts/LeagueGothic";
import { loadFont as courier } from "@remotion/google-fonts/CourierPrime";
export const BEBAS = bebas("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily;
export const ALFA = alfa("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily;
export const LEAGUE = league("normal", { weights: ["400"], subsets: latin }).fontFamily;
export const COURIER = courier("normal", { weights: ["400", "700"], subsets: ["latin"] }).fontFamily;
courier("italic", { weights: ["400", "700"], subsets: ["latin"] });
// Sabado C "Lousa do Butica": giz
import { loadFont as cabinSketch } from "@remotion/google-fonts/CabinSketch";
import { loadFont as caveatBrush } from "@remotion/google-fonts/CaveatBrush";
export const SKETCH = cabinSketch("normal", { weights: ["400", "700"], subsets: ["latin"] }).fontFamily;
export const GIZ = caveatBrush("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily;
// Sexta D "Mesa do Butica": caneta/marcador
import { loadFont as marker } from "@remotion/google-fonts/PermanentMarker";
export const MARKER = marker("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily;
// Sabado D "Gibi do Butica": quadrinhos
import { loadFont as bangers } from "@remotion/google-fonts/Bangers";
import { loadFont as luckiest } from "@remotion/google-fonts/LuckiestGuy";
export const BANGERS = bangers("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily;
export const LUCKIEST = luckiest("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily;
