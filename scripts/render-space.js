// scripts/render-space.js
// MINIMAL mono: ít sao, 1 vệ tinh, không UFO, không sao băng rối mắt.

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const USER = process.env.METRICS_USER || "toan-05";

function stars(w, h, n) {
  let s = "";
  for (let i = 0; i < n; i++) {
    const x = (i * 211 + 37) % w;
    const y = (i * 131 + 19) % h;
    s += `<circle cx="${x}" cy="${y}" r="1" fill="#fff" opacity="0.35"><animate attributeName="opacity" values="0.1;0.6;0.1" dur="${(3 + (i % 4)).toFixed(0)}s" repeatCount="indefinite"/></circle>\n`;
  }
  return s;
}

const banner = `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="260" viewBox="0 0 1000 260">
  <rect width="1000" height="260" rx="12" fill="#050505"/>
  <rect width="1000" height="260" rx="12" fill="none" stroke="#fff" stroke-opacity="0.25"/>
  ${stars(1000, 260, 28)}
  <g transform="translate(500,150)">
    <ellipse rx="150" ry="44" fill="none" stroke="#fff" stroke-opacity="0.3"/>
    <circle cx="-150" cy="0" r="4" fill="#fff">
      <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="12s" repeatCount="indefinite"/>
    </circle>
    <circle r="26" fill="none" stroke="#fff" stroke-opacity="0.8"/>
    <circle r="26" fill="#fff" opacity="0.06"/>
    <text y="8" text-anchor="middle" font-size="20" fill="#fff" font-family="Consolas, monospace">◈</text>
  </g>
  <g text-anchor="middle" font-family="Consolas, monospace">
    <text x="500" y="48" font-size="34" font-weight="700" fill="#fff" letter-spacing="10">${USER.toUpperCase()}</text>
    <text x="500" y="238" font-size="13" fill="#737373" letter-spacing="4">deep space relay — online</text>
  </g>
</svg>`;

const divider = `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="20" viewBox="0 0 1000 20">
  <line x1="40" y1="10" x2="960" y2="10" stroke="#fff" stroke-opacity="0.2"/>
  <circle r="3" fill="#fff">
    <animateTransform attributeName="transform" type="translate" values="40 10;960 10;40 10" dur="10s" repeatCount="indefinite"/>
  </circle>
</svg>`;

mkdirSync(join(ROOT, "assets"), { recursive: true });
writeFileSync(join(ROOT, "assets", "space-banner.svg"), banner);
writeFileSync(join(ROOT, "assets", "space-divider.svg"), divider);
console.log("✅ space minimal done");
