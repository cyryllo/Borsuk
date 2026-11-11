#!/usr/bin/env node
// Renders block images of the MakeCode examples (English and Polish) using the
// official MakeCode block renderer (https://makecode.microbit.org/--docs?render=1).
//
// The renderer loads the extension from GitHub (github:cyryllo/Borsuk), so push
// your changes first. Output: images/blocks/<lang>/<example>.webp
//
// Setup (once):
//   npm install --no-save playwright-core
//   npx playwright-core install chromium     # or set CHROME_PATH to an existing Chrome/Chromium
// Usage:
//   node tools/render_blocks.mjs                       # all examples, en + pl
//   node tools/render_blocks.mjs 02-square.ts          # selected examples
import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SRC = path.join(ROOT, 'examples', 'makecode');
const OUT = path.join(ROOT, 'images', 'blocks');
const LANGS = ['en', 'pl'];
const PACKAGE = 'borsuk=github:cyryllo/Borsuk';
const SCALE = 0.5; // renderer returns 4x density PNG; keep 2x for sharp but small images

const only = process.argv.slice(2);
const files = fs.readdirSync(SRC).filter(f => f.endsWith('.ts') && (!only.length || only.includes(f))).sort();

const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
let failed = 0;
for (const lang of LANGS) {
    const page = await browser.newPage();
    await page.goto(`https://makecode.microbit.org/--docs?render=1&lang=${lang}`, { waitUntil: 'load', timeout: 120000 });
    fs.mkdirSync(path.join(OUT, lang), { recursive: true });
    for (const file of files) {
        const code = fs.readFileSync(path.join(SRC, file), 'utf8');
        const res = await page.evaluate(({ code, pkg, scale, id }) => new Promise((resolve) => {
            const timer = setTimeout(() => resolve({ error: 'timeout' }), 110000);
            const send = () => window.postMessage({ type: 'renderblocks', id, code, options: { package: pkg } }, '*');
            window.addEventListener('message', async (ev) => {
                const d = ev.data || {};
                if (d.type === 'renderready') send();
                if (d.type !== 'renderblocks' || d.id !== id || !(d.uri || d.error)) return;
                clearTimeout(timer);
                if (!d.uri) return resolve({ error: d.error || 'no image' });
                const img = new Image();
                img.onload = () => {
                    const c = document.createElement('canvas');
                    c.width = Math.round(img.width * scale);
                    c.height = Math.round(img.height * scale);
                    const ctx = c.getContext('2d');
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(img, 0, 0, c.width, c.height);
                    resolve({ img: c.toDataURL('image/webp', 0.9) });
                };
                img.src = d.uri;
            });
            send(); // in case the renderer is already ready
        }), { code, pkg: PACKAGE, scale: SCALE, id: `${lang}-${file}` });
        const out = path.join(OUT, lang, file.replace(/\.ts$/, '.webp'));
        if (res.img) {
            fs.writeFileSync(out, Buffer.from(res.img.split(',')[1], 'base64'));
            console.log(`ok   ${path.relative(ROOT, out)}`);
        } else {
            failed++;
            console.log(`FAIL ${lang}/${file}: ${res.error}`);
        }
    }
    await page.close();
}
await browser.close();
process.exit(failed ? 1 : 0);
