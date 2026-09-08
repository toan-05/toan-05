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

// Dải thiên hà: cụm sao ký tự li ti dọc theo đường chéo, mờ dần ra mép.
function galaxyBand() {
  let s = `<ellipse cx="500" cy="130" rx="420" ry="46" fill="#fff" opacity="0.035"/>\n`;
  s += `<ellipse cx="500" cy="130" rx="300" ry="26" fill="#fff" opacity="0.045"/>\n`;
  for (let i = 0; i < 70; i++) {
    // x dàn đều, y gom quanh trục dải (phân bố dày ở giữa)
    const x = (i * 137 + 53) % 1000;
    const off = ((i * 89) % 100) - 50; // -50..49
    const y = 130 + off * (0.35 + (i % 5) * 0.12);
    const ch = CHARS[(i * 3) % CHARS.length];
    const size = 5 + (i % 3) * 2;
    const peak = (0.25 + (i % 4) * 0.12).toFixed(2);
    s += `<text x="${x.toFixed(0)}" y="${y.toFixed(0)}" font-size="${size}" fill="#fff" opacity="0.2" font-family="Consolas, monospace">${ch}<animate attributeName="opacity" values="0.05;${peak};0.05" dur="${(4 + (i % 5)).toFixed(0)}s" repeatCount="indefinite"/></text>\n`;
  }
  // vài sao sáng điểm xuyết trên dải
  for (let i = 0; i < 6; i++) {
    const x = (i * 311 + 120) % 1000;
    const y = 130 + (((i * 67) % 60) - 30) * 0.5;
    s += `<text x="${x.toFixed(0)}" y="${y.toFixed(0)}" font-size="13" fill="#f0f6fc" opacity="0.7" font-family="Consolas, monospace">✦<animate attributeName="opacity" values="0.25;0.9;0.25" dur="${(3 + i).toFixed(0)}s" repeatCount="indefinite"/></text>\n`;
  }
  return `<g transform="rotate(-16 500 130)">${s}</g>`;
}

const banner = `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="260" viewBox="0 0 1000 260">
  <rect width="1000" height="260" rx="6" fill="${BG}"/>
  ${charStars(1000, 260, 24)}
  ${galaxyBand()}
  <g text-anchor="middle" font-family="Consolas, monospace">
    <text x="500" y="120" font-size="38" font-weight="700" fill="#f0f6fc" letter-spacing="10">${USER.toUpperCase()}</text>
    <text x="500" y="152" font-size="14" fill="#8b949e" letter-spacing="4">· · · milky way · · ·</text>
  </g>
</svg>`;

const divider = `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="20" viewBox="0 0 1000 20">
  <rect width="1000" height="20" fill="${BG}"/>
  <text x="460" y="15" font-size="12" fill="#6e7681" font-family="Consolas, monospace">· ✦ · ⋆ · ✧ ·<animate attributeName="opacity" values="0.4;1;0.4" dur="4s" repeatCount="indefinite"/></text>
</svg>`;

mkdirSync(join(ROOT, "assets"), { recursive: true });
writeFileSync(join(ROOT, "assets", "space-banner.svg"), banner);
writeFileSync(join(ROOT, "assets", "space-divider.svg"), divider);
console.log("✅ starry sky done");
