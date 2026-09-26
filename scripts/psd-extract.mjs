import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { readPsd, initializeCanvas } from 'ag-psd';
const mkID = (w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(w * h * 4) });
initializeCanvas((w, h) => ({ width: w, height: h, getContext: () => ({ createImageData: mkID, putImageData() {}, drawImage() {} }) }), undefined, mkID);
import { PNG } from 'pngjs';
const [,, f, outDir] = process.argv;
mkdirSync(outDir, { recursive: true });
const psd = readPsd(readFileSync(f), { useImageData: true, skipCompositeImageData: true, skipThumbnail: true });
const lf = psd.linkedFiles || [];
const byId = Object.fromEntries(lf.map(x => [x.id, x]));
const safe = s => s.replace(/[^\w\-. ]+/g, '_').trim();
const walk = (ls, path = []) => ls?.forEach(l => {
  const p = [...path, l.name];
  if (l.children) return walk(l.children, p);
  const grp = path.join('/');
  if (!/FOTO ARTISTA|LOGO ARTISTA|FOTO ARTISTAS|^$/.test(grp) && !/logo_obutiquim/i.test(l.name)) return;
  if (l.imageData) {
    const { width, height, data } = l.imageData;
    const png = new PNG({ width, height }); png.data = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
    writeFileSync(`${outDir}/layer__${safe(l.name)}.png`, PNG.sync.write(png));
  }
  if (l.placedLayer) {
    const lk = byId[l.placedLayer.id];
    if (lk?.data) writeFileSync(`${outDir}/embed__${safe(l.name)}__${safe(lk.name || 'x')}`, Buffer.from(lk.data));
    console.log('smart', l.name, '->', lk?.name, lk?.type, lk?.data?.length);
  }
});
walk(psd.children);
