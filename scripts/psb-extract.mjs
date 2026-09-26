// extrai a imagem composta de um .psb/.psd embutido (ex.: foto do Pagode 44 dentro do PSD do Sabadá)
import { readFileSync, writeFileSync } from "fs";
import { readPsd, initializeCanvas } from "ag-psd";
import { PNG } from "pngjs";
const mkID = (w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(w * h * 4) });
initializeCanvas((w, h) => ({ width: w, height: h, getContext: () => ({ createImageData: mkID, putImageData() {}, drawImage() {} }) }), undefined, mkID);
const [, , src, dst] = process.argv;
const psd = readPsd(readFileSync(src), { useImageData: true, skipLayerImageData: true, skipThumbnail: true });
const { width, height, data } = psd.imageData;
const png = new PNG({ width, height });
png.data = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
writeFileSync(dst, PNG.sync.write(png));
console.log(dst, width, height);
