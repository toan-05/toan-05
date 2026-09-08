// scripts/render-space.js
// Sinh banner + divider vũ trụ (mono đen/trắng) — KHÁC matrix-rain của mẫu.
// Output: assets/space-banner.svg, assets/space-divider.svg
// Animation dùng SMIL (<animate>/<animateTransform>) để GitHub render được.

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_BANNER = join(ROOT, "assets", "space-banner.svg");
const OUT_DIVIDER = join(ROOT, "assets", "space-divider.svg");

const USER = process.env.METRICS_USER || "toan-05";

function starfield(w, h, n, seed = 7) {
  let s = "";
  for (let i = 0; i < n; i++) {
    const x = (i * 173 + seed * 41) % w;
    const y = (i * 97 + seed * 13) % h;
    const r = 0.7 + (i % 3) * 0.55;
    s += `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity="0.4"><animate attributeName="opacity" values="0.06;0.95;0.06" dur="${(1.6 + (i % 7) * 0.6).toFixed(1)}s" repeatCount="indefinite"/></circle>\n`;
  }
  return s;
}

function banner() {
  const W = 1000, H = 340;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="deep space banner">
  <rect width="${W}" height="${H}" rx="12" fill="#050505"/>
  <rect width="${W}" height="${H}" rx="12" fill="none" stroke="#ffffff" stroke-opacity="0.35" stroke-width="1.5"/>
  ${starfield(W, H, 90, 11)}

  <!-- tinh vân mờ (mono) -->
  <ellipse cx="200" cy="280" rx="260" ry="90" fill="#ffffff" opacity="0.04"/>
  <ellipse cx="820" cy="60" rx="240" ry="80" fill="#ffffff" opacity="0.05"/>

  <!-- 2 sao băng chéo nhau -->
  <g>
    <line x1="0" y1="0" x2="130" y2="36" stroke="#fff" stroke-width="1.6" stroke-linecap="round">
      <animateTransform attributeName="transform" type="translate" values="-220 40;1120 220;-220 40" dur="6.5s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0;1;0" dur="6.5s" repeatCount="indefinite"/>
    </line>
  </g>
  <g>
    <line x1="0" y1="0" x2="90" y2="26" stroke="#fff" stroke-width="1" stroke-linecap="round">
      <animateTransform attributeName="transform" type="translate" values="1120 60;-220 300;1120 60" dur="10s" begin="1.5s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0;0.8;0" dur="10s" begin="1.5s" repeatCount="indefinite"/>
    </line>
  </g>

  <!-- hệ hành tinh: mặt trời mono + 2 quỹ đạo + vệ tinh -->
  <g transform="translate(500,178)">
    <circle r="34" fill="#fff"/>
    <circle r="34" fill="none" stroke="#050505" stroke-width="2" stroke-dasharray="6 6" opacity="0.6"/>
    <ellipse rx="90" ry="30" fill="none" stroke="#fff" stroke-opacity="0.4" transform="rotate(-18)"/>
    <ellipse rx="150" ry="48" fill="none" stroke="#fff" stroke-opacity="0.22" transform="rotate(-18)"/>
    <g>
      <circle cx="90" cy="0" r="8" fill="#050505" stroke="#fff" stroke-width="2"/>
      <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="6s" repeatCount="indefinite"/>
    </g>
    <g>
      <circle cx="-150" cy="0" r="5" fill="#fff"/>
      <animateTransform attributeName="transform" type="rotate" from="360" to="0" dur="11s" repeatCount="indefinite"/>
    </g>
    <!-- tên lửa bay quanh -->
    <g font-family="Consolas, monospace">
      <text x="0" y="-58" text-anchor="middle" font-size="15" fill="#fff" letter-spacing="6">◈ DEEP SPACE ◈</text>
    </g>
  </g>

  <!-- title -->
  <g text-anchor="middle" font-family="Consolas, monospace">
    <text x="500" y="52" font-size="44" font-weight="800" fill="#fff" letter-spacing="8">${USER.toUpperCase()} // STATION</text>
    <text x="500" y="80" font-size="14" fill="#a1a1a1" letter-spacing="3">ORBITAL CORE • SIGNAL STABLE • sol-3 relay
      <animate attributeName="opacity" values="1;0.55;1" dur="3.2s" repeatCount="indefinite"/>
    </text>
  </g>

  <!-- UFO lướt đáy -->
  <g>
    <g font-size="22" fill="#fff">
      <text x="0" y="0">◖ UFO ◗ —▶</text>
      <animateTransform attributeName="transform" type="translate" values="-160 308;1120 296;-160 308" dur="14s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0;1;1;0" dur="14s" repeatCount="indefinite"/>
    </g>
  </g>

  <!-- phi hành gia nhấp nháy -->
  <text x="60" y="120" font-size="30" fill="#fff" opacity="0.9">✦<animate attributeName="opacity" values="0.9;0.2;0.9" dur="2.4s" repeatCount="indefinite"/></text>
  <text x="910" y="250" font-size="26" fill="#fff" opacity="0.9">✧<animate attributeName="opacity" values="0.9;0.25;0.9" dur="3.1s" repeatCount="indefinite"/></text>
</svg>`;
}

function divider() {
  const W = 1000, H = 28;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <line x1="10" y1="14" x2="990" y2="14" stroke="#fff" stroke-opacity="0.25"/>
  <circle cx="500" cy="14" r="5" fill="none" stroke="#fff" stroke-width="1.5"/>
  <circle cx="500" cy="14" r="2" fill="#fff"/>
  <!-- vệ tinh chạy dọc divider -->
  <circle r="4" fill="#fff">
    <animateTransform attributeName="transform" type="translate" values="10 14;990 14;10 14" dur="8s" repeatCount="indefinite"/>
  </circle>
  <circle r="9" fill="none" stroke="#fff" stroke-opacity="0.35">
    <animateTransform attributeName="transform" type="translate" values="10 14;990 14;10 14" dur="8s" repeatCount="indefinite"/>
  </circle>
  <text x="30" y="19" font-size="12" fill="#737373" font-family="Consolas, monospace">· · · ORBIT · · ·</text>
  <text x="970" y="19" text-anchor="end" font-size="12" fill="#737373" font-family="Consolas, monospace">· · · STABLE · · ·</text>
</svg>`;
}

mkdirSync(join(ROOT, "assets"), { recursive: true });
writeFileSync(OUT_BANNER, banner());
writeFileSync(OUT_DIVIDER, divider());
console.log(`✅ space: ${OUT_BANNER}`);
console.log(`✅ space: ${OUT_DIVIDER}`);
