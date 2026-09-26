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
