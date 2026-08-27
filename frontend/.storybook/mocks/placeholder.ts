/** Offline SVG placeholders — no Sanity CDN or external hosts required. */
export function placeholderSrc(width: number, height: number, label = 'Image') {
  const safeLabel = label.replace(/[<>&'"]/g, '');
  const fontSize = Math.max(14, Math.min(width, height) / 18);
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0B3D4A"/>
      <stop offset="100%" stop-color="#2A9D8F"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <text x="50%" y="50%" fill="#F4F7F5" font-family="system-ui,sans-serif" font-size="${fontSize}" text-anchor="middle" dominant-baseline="middle">${safeLabel}</text>
</svg>`.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
