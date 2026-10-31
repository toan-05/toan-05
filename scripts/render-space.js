// scripts/render-space.js
// BANNER = dải thiên hà + 2 sao băng song song (đúng góc đuôi).
// Hỗ trợ cả giao diện SÁNG (light) và TỐI (dark). Không viền (borderless).

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const USER = process.env.METRICS_USER || "toan-05";
const CHARS = ["✦", "✧", "⋆", "✶", "*", "·", "+"];

function renderBanner(theme = "dark") {
  const isDark = theme === "dark";
  const bg = isDark ? "#0d1117" : "#ffffff";
  const titleColor = isDark ? "#f0f6fc" : "#1f2328";
  const subColor = isDark ? "#8b949e" : "#656d76";

  // Dải thiên hà: cụm sao ký tự li ti dọc trục ngang (local), xoay -16° khi đặt vào banner.
  const ellipse1 = isDark
    ? `<ellipse cx="500" cy="130" rx="430" ry="48" fill="#fff" opacity="0.035"/>\n`
    : `<ellipse cx="500" cy="130" rx="430" ry="48" fill="#0969da" opacity="0.04"/>\n`;
  const ellipse2 = isDark
    ? `<ellipse cx="500" cy="130" rx="300" ry="26" fill="#fff" opacity="0.05"/>\n`
    : `<ellipse cx="500" cy="130" rx="300" ry="26" fill="#8250df" opacity="0.035"/>\n`;

  let stars = "";
  for (let i = 0; i < 90; i++) {
    const x = (i * 137 + 53) % 1000;
    const off = ((i * 89) % 100) - 50; // -50..49
    const y = 130 + off * (0.32 + (i % 5) * 0.11);
    const ch = CHARS[(i * 3) % CHARS.length];
    const size = 4 + (i % 3) * 2;
    const minOp = isDark ? 0.04 : 0.08;
    const peak = isDark
      ? (0.18 + (i % 4) * 0.1).toFixed(2)
      : (0.22 + (i % 4) * 0.12).toFixed(2);
    const fill = isDark ? "#fff" : (i % 2 === 0 ? "#24292f" : "#0969da");
    const initOp = isDark ? 0.15 : 0.22;
    stars += `<text x="${x.toFixed(0)}" y="${y.toFixed(0)}" font-size="${size}" fill="${fill}" opacity="${initOp}" font-family="Consolas, monospace">${ch}<animate attributeName="opacity" values="${minOp};${peak};${minOp}" dur="${(4 + (i % 6)).toFixed(0)}s" repeatCount="indefinite"/></text>\n`;
  }
  for (let i = 0; i < 6; i++) {
    const x = (i * 311 + 120) % 1000;
    const y = 130 + (((i * 67) % 60) - 30) * 0.5;
    const fill = isDark ? "#f0f6fc" : "#0969da";
    const minOp = isDark ? 0.25 : 0.35;
    const maxOp = isDark ? 0.9 : 0.95;
    stars += `<text x="${x.toFixed(0)}" y="${y.toFixed(0)}" font-size="13" fill="${fill}" opacity="${minOp}" font-family="Consolas, monospace">✦<animate attributeName="opacity" values="${minOp};${maxOp};${minOp}" dur="${(3 + i).toFixed(0)}s" repeatCount="indefinite"/></text>\n`;
  }
  const galaxy = `<g transform="rotate(-16 500 130)">${ellipse1}${ellipse2}${stars}</g>`;

  // Sao băng: đầu sáng + quầng + đuôi 2 đoạn mờ dần.
  function meteor(id, x1, y1, x2, y2, tail, dur, begin, headR) {
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    const ux = dx / len, uy = dy / len;
    // đuôi = ngược hướng bay
    const tx = (-ux * tail).toFixed(1), ty = (-uy * tail).toFixed(1);
    const tx2 = (-ux * tail * 0.45).toFixed(1), ty2 = (-uy * tail * 0.45).toFixed(1);

    const line1Stroke = isDark ? "#f0f6fc" : "#0969da";
    const line2Stroke = isDark ? "#fff" : "#54aeff";
    const headFill = isDark ? "#fff" : "#0969da";
    const haloFill = isDark ? "#fff" : "#54aeff";

    return `<g opacity="0">
    <line x1="0" y1="0" x2="${tx}" y2="${ty}" stroke="${line1Stroke}" stroke-width="1" stroke-linecap="round" opacity="0.5"/>
    <line x1="0" y1="0" x2="${tx2}" y2="${ty2}" stroke="${line2Stroke}" stroke-width="1.6" stroke-linecap="round" opacity="0.9"/>
    <circle r="${(headR * 2.4).toFixed(1)}" fill="${haloFill}" opacity="0.22"/>
    <circle r="${headR}" fill="${headFill}"/>
    <animateTransform attributeName="transform" type="translate"
      values="${x1} ${y1};${x2} ${y2}" dur="${dur}s" begin="${begin}s"
      calcMode="spline" keyTimes="0;1" keySplines="0.45 0 0.55 1" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.12;0.75;1"
      dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/>
  </g>`;
  }

  // Viền ngoài bị bỏ theo yêu cầu của user (bỏ stroke)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="260" viewBox="0 0 1000 260">
  <rect width="1000" height="260" rx="6" fill="${bg}"/>
  ${galaxy}
  ${meteor("m1", 1080, 30, -80, 250, 110, 4.5, 0.5, 2.2)}
  ${meteor("m2", 950, -30, -210, 190, 70, 7, 3.5, 1.6)}
  <g text-anchor="middle" font-family="Consolas, monospace">
    <text x="500" y="120" font-size="38" font-weight="700" fill="${titleColor}" letter-spacing="10">${USER.toUpperCase()}</text>
    <text x="500" y="152" font-size="14" fill="${subColor}" letter-spacing="4">· · · milky way · · ·</text>
  </g>
</svg>`;
}

function renderDivider() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="20" viewBox="0 0 1000 20">
  <style>
    .star-div { fill: #8b949e; }
    @media (prefers-color-scheme: light) {
      .star-div { fill: #57606a; }
    }
  </style>
  <text x="500" y="15" text-anchor="middle" font-size="12" class="star-div" font-family="Consolas, monospace">· ✦ · ⋆ · ✧ ·<animate attributeName="opacity" values="0.4;1;0.4" dur="4s" repeatCount="indefinite"/></text>
</svg>`;
}

mkdirSync(join(ROOT, "assets"), { recursive: true });

const bannerDark = renderBanner("dark");
const bannerLight = renderBanner("light");
const divider = renderDivider();

writeFileSync(join(ROOT, "assets", "space-banner-dark.svg"), bannerDark);
writeFileSync(join(ROOT, "assets", "space-banner-light.svg"), bannerLight);
writeFileSync(join(ROOT, "assets", "space-banner.svg"), bannerDark); // fallback

writeFileSync(join(ROOT, "assets", "space-divider.svg"), divider);

console.log("✅ space banner & divider rendered (borderless, dark + light)");
