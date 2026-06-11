import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outDir = path.join(root, 'latex', 'images');
fs.mkdirSync(outDir, { recursive: true });

const nb = JSON.parse(fs.readFileSync(path.join(root, 'Untitled.ipynb'), 'utf8'));
const names = ['notebook_idle', 'notebook_iterations', 'notebook_converged', 'notebook_elbow'];
let i = 0;

for (const cell of nb.cells) {
  for (const o of cell.outputs || []) {
    if (o.data?.['image/png']) {
      const b64 = Array.isArray(o.data['image/png'])
        ? o.data['image/png'].join('')
        : o.data['image/png'];
      const name = names[i] ?? `notebook_${i}`;
      fs.writeFileSync(path.join(outDir, `${name}.png`), Buffer.from(b64, 'base64'));
      console.log('saved', name);
      i++;
    }
  }
}
