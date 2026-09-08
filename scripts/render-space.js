// scripts/render-space.js
// BẦU TRỜI SAO KÝ TỰ — nền #0d1117 trùng GitHub dark.
// Sao = các ký tự ✦ ✧ ⋆ ✶ * · + nhấp nháy, tối giản.

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const BG = "#0d1117";

const USER = process.env.METRICS_USER || "toan-05";
const CHARS = ["✦", "✧", "⋆", "✶", "*", "·", "+"];

function charStars(w, h, n) {
  let s = "";
  for (let i = 0; i < n; i++) {
    const x = (i * 211 + 37) % w;
    const y = (i * 131 + 19) % h;
    const ch = CHARS[i % CHARS.length];
    const size = 8 + (i % 3) * 4;
    s += `<text x="${x}" y="${y}" font-size="${size}" fill="#fff" opacity="0.35" font-family="Consolas, monospace">${ch}<animate attributeName="opacity" values="0.08;0.7;0.08" dur="${(3 + (i % 4)).toFixed(0)}s" repeatCount="indefinite"/></text>\n`;
  }
  return s;
}

const banner = `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="260" viewBox="0 0 1000 260">
  <rect width="1000" height="260" rx="6" fill="${BG}"/>
  ${charStars(1000, 260, 32)}
  <g text-anchor="middle" font-family="Consolas, monospace">
    <text x="500" y="120" font-size="38" font-weight="700" fill="#f0f6fc" letter-spacing="10">${USER.toUpperCase()}</text>
    <text x="500" y="152" font-size="14" fill="#8b949e" letter-spacing="4">· · · starry sky · · ·</text>
  </g>
  <!-- 1 sao băng mảnh -->
  <line x1="0" y1="0" x2="80" y2="22" stroke="#f0f6fc" stroke-width="1" stroke-linecap="round" opacity="0">
    <animateTransform attributeName="transform" type="translate" values="-120 30;1100 210;-120 30" dur="9s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0;0.8;0" dur="9s" repeatCount="indefinite"/>
  </line>
</svg>`;

const divider = `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="20" viewBox="0 0 1000 20">
  <rect width="1000" height="20" fill="${BG}"/>
  <text x="460" y="15" font-size="12" fill="#6e7681" font-family="Consolas, monospace">· ✦ · ⋆ · ✧ ·<animate attributeName="opacity" values="0.4;1;0.4" dur="4s" repeatCount="indefinite"/></text>
</svg>`;

mkdirSync(join(ROOT, "assets"), { recursive: true });
writeFileSync(join(ROOT, "assets", "space-banner.svg"), banner);
writeFileSync(join(ROOT, "assets", "space-divider.svg"), divider);
console.log("✅ starry sky done");
