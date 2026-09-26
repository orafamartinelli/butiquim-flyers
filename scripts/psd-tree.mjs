import { readFileSync } from 'fs';
import { readPsd, initializeCanvas } from 'ag-psd';
const f = process.argv[2];
const psd = readPsd(readFileSync(f), { skipLayerImageData: true, skipCompositeImageData: true, skipThumbnail: true });
console.log(f, psd.width + 'x' + psd.height);
const walk = (ls, d = 0) => ls?.forEach((l, i) => {
  const w = (l.right ?? 0) - (l.left ?? 0), h = (l.bottom ?? 0) - (l.top ?? 0);
  console.log(`${'  '.repeat(d)}[${i}] ${l.hidden ? '(h) ' : ''}${l.name} ${l.children ? '{grp}' : ''} ${w}x${h} @${l.left},${l.top}${l.placedLayer ? ' SMART' : ''}${l.text ? ' TEXT:' + JSON.stringify(l.text.text).slice(0, 40) : ''}`);
  if (l.children) walk(l.children, d + 1);
});
walk(psd.children);
