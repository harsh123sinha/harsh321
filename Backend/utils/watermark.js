import sharp from 'sharp';

const LINE1 = 'Harsh To Let Services';
const LINE2 = 'Verified Listing';

/**
 * Apply semi-transparent bottom-right watermark.
 */
export async function applyListingWatermark(imageBuffer) {
  const base = sharp(imageBuffer);
  const meta = await base.metadata();
  const width = meta.width || 800;
  const height = meta.height || 600;

  const fontSize = Math.max(14, Math.round(Math.min(width, height) * 0.035));
  const pad = Math.round(fontSize * 0.6);
  const boxW = Math.min(width * 0.55, fontSize * 14);
  const boxH = fontSize * 3.2;
  const x = Math.max(0, width - boxW - pad);
  const y = Math.max(0, height - boxH - pad);

  const svg = `
    <svg width="${width}" height="${height}">
      <rect x="${x}" y="${y}" width="${boxW}" height="${boxH}" rx="6" fill="rgba(15,23,42,0.55)"/>
      <text x="${x + pad}" y="${y + fontSize + pad * 0.4}" fill="rgba(255,255,255,0.95)" font-size="${fontSize}" font-family="Arial, Helvetica, sans-serif" font-weight="600">${LINE1}</text>
      <text x="${x + pad}" y="${y + fontSize * 2 + pad * 0.5}" fill="rgba(212,175,55,0.95)" font-size="${Math.round(fontSize * 0.85)}" font-family="Arial, Helvetica, sans-serif">${LINE2}</text>
    </svg>
  `;

  return base
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer();
}
