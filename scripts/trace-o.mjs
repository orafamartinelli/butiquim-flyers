// retraça o "O" oficial (rasterizado do PDF) em contornos limpos: externo + furos
import potrace from "potrace";
import { writeFileSync } from "fs";
potrace.trace("out/o-hi.png", { threshold: 128, turdSize: 50, optTolerance: 0.2, alphaMax: 1 }, (err, svg) => {
  if (err) throw err;
  writeFileSync("public/logos/o-3d.svg", svg);
  const d = svg.match(/ d="([^"]+)"/)[1];
  console.log("subpaths", (d.match(/M/g) || []).length, "len", d.length, svg.slice(0, 120));
});
