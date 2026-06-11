import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'latex', 'images');
fs.mkdirSync(outDir, { recursive: true });

const URL = 'http://127.0.0.1:5173';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(1500);
await page.screenshot({ path: path.join(outDir, 'app_main.png'), fullPage: true });
console.log('app_main.png');

await page.getByRole('button', { name: /Start/i }).click();
await page.waitForTimeout(2000);
await page.screenshot({ path: path.join(outDir, 'app_running.png'), fullPage: true });
console.log('app_running.png');

await page.getByRole('button', { name: /Pause/i }).click();
await page.waitForTimeout(500);

for (let step = 0; step < 3; step++) {
  await page.getByRole('button', { name: /Step/i }).click();
  await page.waitForTimeout(1200);
  await page.screenshot({
    path: path.join(outDir, `app_step_${step + 1}.png`),
    fullPage: true,
  });
  console.log(`app_step_${step + 1}.png`);
}

await page.getByRole('button', { name: /Start/i }).click();
await page.waitForTimeout(8000);
await page.screenshot({ path: path.join(outDir, 'app_converged.png'), fullPage: true });
console.log('app_converged.png');

await browser.close();
console.log('done');
