import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');
const sourcePath = path.join(__dirname, 'logo-source.png');
const logoPath = path.join(publicDir, 'logo.png');
const faviconPath = path.join(publicDir, 'favicon.png');

/** Keep warm gold emblem pixels; drop black matte + gray shadow. */
function keyOutBackground(data, channels) {
  const out = Buffer.from(data);
  for (let i = 0; i < out.length; i += channels) {
    const r = out[i];
    const g = out[i + 1];
    const b = out[i + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max - min;
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    const isGold =
      lum >= 55 && sat >= 18 && r >= g * 0.75 && g >= b * 0.85 && r >= 70;

    const isBrightHighlight = lum >= 200 && sat <= 40;

    if (isGold || isBrightHighlight) {
      out[i + 3] = 255;
      continue;
    }

    if (lum >= 40 && r > g && g > b && sat >= 10) {
      const alpha = Math.min(255, Math.round(sat * 8));
      out[i + 3] = Math.min(out[i + 3], alpha);
      continue;
    }

    out[i + 3] = 0;
  }
  return out;
}

async function processLogo(inputPath, outputPath, size = null) {
  let pipeline = sharp(inputPath).ensureAlpha();
  if (size) {
    pipeline = pipeline.resize(size, size, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    });
  }

  const { data, info } = await pipeline.raw().toBuffer({ resolveWithObject: true });
  const processed = keyOutBackground(data, info.channels);

  const tmpPath = `${outputPath}.tmp.png`;
  await sharp(processed, {
    raw: { width: info.width, height: info.height, channels: info.channels },
  })
    .trim({ threshold: 10 })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(tmpPath);

  const fs = await import('fs/promises');
  await fs.rename(tmpPath, outputPath);

  console.log('Wrote', outputPath, size ? `${size}x${size}` : `${info.width}x${info.height}`);
}

await processLogo(sourcePath, logoPath);
await processLogo(sourcePath, faviconPath, 192);
await processLogo(sourcePath, path.join(publicDir, 'favicon-48.png'), 48);
await processLogo(sourcePath, path.join(publicDir, 'favicon-64.png'), 64);
await processLogo(sourcePath, path.join(publicDir, 'favicon-32.png'), 32);

console.log('Done — transparent icon logo ready.');
