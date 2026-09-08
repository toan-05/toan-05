// scripts/render-space.js
// BANNER = dải thiên hà + 2 sao băng song song (đúng góc đuôi).
// Nền #0d1117 trùng GitHub dark. Không còn sao nền rải rác.

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const BG = "#0d1117";

const USER = process.env.METRICS_USER || "toan-05";
const CHARS = ["✦", "✧", "⋆", "✶", "*", "·", "+"];

// Dải thiên hà: cụm sao ký tự li ti dọc trục ngang (local), xoay -16° khi đặt vào banner.
function galaxyBand() {
  let s = `<ellipse cx="500" cy="130" rx="430" ry="48" fill="#fff" opacity="0.035"/>\n`;
  s += `<ellipse cx="500" cy="130" rx="300" ry="26" fill="#fff" opacity="0.05"/>\n`;
  for (let i = 0; i < 90; i++) {
    const x = (i * 137 + 53) % 1000;
    const off = ((i * 89) % 100) - 50; // -50..49
    const y = 130 + off * (0.32 + (i % 5) * 0.11);
    const ch = CHARS[(i * 3) % CHARS.length];
    const size = 4 + (i % 3) * 2;
    const peak = (0.18 + (i % 4) * 0.1).toFixed(2);
    s += `<text x="${x.toFixed(0)}" y="${y.toFixed(0)}" font-size="${size}" fill="#fff" opacity="0.15" font-family="Consolas, monospace">${ch}<animate attributeName="opacity" values="0.04;${peak};0.04" dur="${(4 + (i % 6)).toFixed(0)}s" repeatCount="indefinite"/></text>\n`;
  }
  for (let i = 0; i < 6; i++) {
    const x = (i * 311 + 120) % 1000;
    const y = 130 + (((i * 67) % 60) - 30) * 0.5;
    s += `<text x="${x.toFixed(0)}" y="${y.toFixed(0)}" font-size="13" fill="#f0f6fc" opacity="0.7" font-family="Consolas, monospace">✦<animate attributeName="opacity" values="0.25;0.9;0.25" dur="${(3 + i).toFixed(0)}s" repeatCount="indefinite"/></text>\n`;
  }
  return `<g transform="rotate(-16 500 130)">${s}</g>`;
}

// Sao băng: đầu sáng + quầng + đuôi 2 đoạn mờ dần.
// Đuôi VẼ NGƯỢC đúng vector bay nên thẳng hàng tuyệt đối.
// path: bay từ (x1,y1) tới (x2,y2), đuôi dài `tail` px.
function meteor(id, x1, y1, x2, y2, tail, dur, begin, headR) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  const ux = dx / len, uy = dy / len;
  // đuôi = ngược hướng bay
  const tx = (-ux * tail).toFixed(1), ty = (-uy * tail).toFixed(1);
  const tx2 = (-ux * tail * 0.45).toFixed(1), ty2 = (-uy * tail * 0.45).toFixed(1);
  return `<g opacity="0">
    <line x1="0" y1="0" x2="${tx}" y2="${ty}" stroke="#f0f6fc" stroke-width="1" stroke-linecap="round" opacity="0.5"/>
    <line x1="0" y1="0" x2="${tx2}" y2="${ty2}" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity="0.9"/>
    <circle r="${(headR * 2.4).toFixed(1)}" fill="#fff" opacity="0.22"/>
    <circle r="${headR}" fill="#fff"/>
    <animateTransform attributeName="transform" type="translate"
      values="${x1} ${y1};${x2} ${y2}" dur="${dur}s" begin="${begin}s"
      calcMode="spline" keyTimes="0;1" keySplines="0.45 0 0.55 1" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.12;0.75;1"
      dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/>
  </g>`;
}

const banner = `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="260" viewBox="0 0 1000 260">
  <rect width="1000" height="260" rx="6" fill="${BG}"/>
  ${galaxyBand()}
  ${meteor("m1", 1080, 30, -80, 250, 110, 4.5, 0.5, 2.2)}
  ${meteor("m2", 950, -30, -210, 190, 70, 7, 3.5, 1.6)}
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
console.log("✅ galaxy + meteors done");
