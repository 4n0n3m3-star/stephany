import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join, extname, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MEDIA_DIR = join(__dirname, 'media');
const QUALITY = 82;

async function findImages(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...await findImages(full));
        } else if (/\.(jpg|jpeg|JPG|JPEG)$/.test(entry.name)) {
            files.push(full);
        }
    }
    return files;
}

const images = await findImages(MEDIA_DIR);
let totalBefore = 0, totalAfter = 0;

for (const imgPath of images) {
    const webpPath = imgPath.replace(/\.(jpg|jpeg|JPG|JPEG)$/, '.webp');
    const { size: before } = await stat(imgPath);
    await sharp(imgPath).webp({ quality: QUALITY }).toFile(webpPath);
    const { size: after } = await stat(webpPath);
    totalBefore += before;
    totalAfter += after;
    const saved = Math.round((1 - after / before) * 100);
    console.log(`${basename(imgPath)} → ${basename(webpPath)} | ${(before/1024/1024).toFixed(1)}MB → ${(after/1024/1024).toFixed(1)}MB (-${saved}%)`);
}

console.log(`\nTotal: ${(totalBefore/1024/1024).toFixed(0)}MB → ${(totalAfter/1024/1024).toFixed(0)}MB (-${Math.round((1 - totalAfter/totalBefore)*100)}%)`);
