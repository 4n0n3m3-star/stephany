import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, 'temporary screenshots');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Find next available index
function nextIndex(label) {
  let i = 1;
  while (true) {
    const name = label ? `screenshot-${i}-${label}.png` : `screenshot-${i}.png`;
    if (!fs.existsSync(path.join(outDir, name))) return { i, name };
    i++;
  }
}

const url   = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';

const { name } = nextIndex(label);
const outPath = path.join(outDir, name);

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

// Scroll through the entire page to trigger IntersectionObservers
await page.evaluate(async () => {
  await new Promise(resolve => {
    const distance = 300;
    const timer = setInterval(() => {
      window.scrollBy(0, distance);
      if (window.scrollY + window.innerHeight >= document.body.scrollHeight) {
        clearInterval(timer);
        window.scrollTo(0, 0);
        resolve();
      }
    }, 60);
  });
});

// Let fade-in animations finish
await new Promise(r => setTimeout(r, 1000));

await page.screenshot({ path: outPath, fullPage: true });
await browser.close();

console.log(`Screenshot saved: temporary screenshots/${name}`);
