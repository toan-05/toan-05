// scripts/render-activity.js
// RADAR HOẠT ĐỘNG (Activity Radar) — Sóng nhịp tim đóng góp 30 ngày.
// Hỗ trợ cả giao diện SÁNG (light) và TỐI (dark). Hoàn toàn không viền (borderless).

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const USERNAME = process.env.METRICS_USER || "toan-05";

function generateActivitySVG(days, theme = "dark") {
  const isDark = theme === "dark";
  const bg = isDark ? "#0d1117" : "#ffffff";
  const fg = isDark ? "#f0f6fc" : "#1f2328";
  const muted = isDark ? "#8b949e" : "#656d76";
  const grid = isDark ? "#21262d" : "#eaeef2";
  const lineColor = isDark ? "#58a6ff" : "#0969da";
  const gradOp = isDark ? "0.28" : "0.20";
  const accent = isDark ? "#58a6ff" : "#0969da";
  const pointFill = isDark ? "#f0f6fc" : "#0969da";

  const total = days.reduce((a, b) => a + b.count, 0);
  const max = Math.max(...days.map((d) => d.count), 5);

  const W = 1200;
  const H = 250;
  const padLeft = 65;
  const padRight = 65;
  const chartW = W - padLeft - padRight;
  const topY = 85;
  const botY = 205;
  const chartH = botY - topY;

  // Tọa độ 30 ngày
  const n = days.length;
  const stepX = chartW / (n - 1);
  const points = days.map((d, i) => {
    const x = padLeft + i * stepX;
    const y = botY - (d.count / max) * chartH;
    return { x, y, count: d.count, date: d.date };
  });

  // Đường cong Bezier mượt mà
  let pathD = `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 >= points.length ? points.length - 1 : i + 2];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    pathD += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }

  // Khối diện tích đổ màu gradient phía dưới đường cong
  const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(1)},${botY} L ${points[0].x.toFixed(1)},${botY} Z`;

  // Các điểm phát sáng vào ngày có commit
  let dots = "";
  let peakPoint = points[0];
  for (const p of points) {
    if (p.count > peakPoint.count) peakPoint = p;
    if (p.count > 0) {
      const r = p.count >= max * 0.7 ? 4.5 : 3.2;
      dots += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${r}" fill="${pointFill}" stroke="${bg}" stroke-width="2"/>\n`;
    }
  }

  // Vòng sóng radar nhấp nháy tại điểm có commit cao nhất (Peak)
  if (peakPoint.count > 0) {
    dots += `<circle cx="${peakPoint.x.toFixed(1)}" cy="${peakPoint.y.toFixed(1)}" r="8" fill="none" stroke="${accent}" stroke-width="1.5" opacity="0.6"><animate attributeName="r" values="4;14;4" dur="2.5s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.8;0.1;0.8" dur="2.5s" repeatCount="indefinite"/></circle>\n`;
  }

  // Nhãn ngày trục X
  let xLabels = "";
  const labelIndices = [0, 6, 12, 18, 24, n - 1];
  for (const idx of labelIndices) {
    const p = points[idx];
    const dStr = p.date.slice(5).replace("-", "/"); // MM/DD
    xLabels += `<text x="${p.x.toFixed(1)}" y="226" text-anchor="middle" font-size="11" fill="${muted}" font-family="Consolas, monospace">${dStr}</text>\n`;
  }

  // Đường lưới ngang
  const gridLines = `
    <line x1="${padLeft}" y1="${topY}" x2="${W - padRight}" y2="${topY}" stroke="${grid}" stroke-width="1" stroke-dasharray="3,3"/>
    <line x1="${padLeft}" y1="${(topY + botY) / 2}" x2="${W - padRight}" y2="${(topY + botY) / 2}" stroke="${grid}" stroke-width="1" stroke-dasharray="3,3"/>
    <line x1="${padLeft}" y1="${botY}" x2="${W - padRight}" y2="${botY}" stroke="${grid}" stroke-width="1"/>
  `;

  const gradId = `actGrad_${theme}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${lineColor}" stop-opacity="${gradOp}"/>
      <stop offset="100%" stop-color="${lineColor}" stop-opacity="0.00"/>
    </linearGradient>
  </defs>

  <!-- Nền card borderless hoàn toàn không viền -->
  <rect width="${W}" height="${H}" rx="6" fill="${bg}"/>

  <!-- Tiêu đề Header -->
  <text x="40" y="48" font-size="20" font-weight="700" fill="${fg}" font-family="Consolas, monospace">@${USERNAME} <tspan fill="${muted}" font-weight="400">— activity radar</tspan></text>
  <text x="1150" y="48" font-size="16" fill="${accent}">✦<animate attributeName="opacity" values="1;0.2;1" dur="2s" repeatCount="indefinite"/></text>

  <text x="420" y="48" font-size="13" fill="${muted}" font-family="Consolas, monospace">30d pulse: <tspan fill="${fg}" font-weight="700">${total}</tspan> contributions · peak: <tspan fill="${fg}" font-weight="700">${max}</tspan>/day</text>

  <!-- Lưới biểu đồ -->
  ${gridLines}

  <!-- Nhãn trục Y -->
  <text x="${padLeft - 12}" y="${topY + 4}" text-anchor="end" font-size="11" fill="${muted}" font-family="Consolas, monospace">${max}</text>
  <text x="${padLeft - 12}" y="${((topY + botY) / 2) + 4}" text-anchor="end" font-size="11" fill="${muted}" font-family="Consolas, monospace">${Math.round(max / 2)}</text>
  <text x="${padLeft - 12}" y="${botY + 4}" text-anchor="end" font-size="11" fill="${muted}" font-family="Consolas, monospace">0</text>

  <!-- Vùng đổ màu bên dưới sóng -->
  <path d="${areaD}" fill="url(#${gradId})"/>

  <!-- Đường sóng nhịp tim -->
  <path d="${pathD}" fill="none" stroke="${lineColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- Các điểm hoạt động & hiệu ứng radar -->
  ${dots}

  <!-- Nhãn ngày trục X -->
  ${xLabels}
</svg>`;
}

async function main() {
  mkdirSync(join(ROOT, "assets"), { recursive: true });

  let days = [];
  try {
    const res = await fetch(`https://github.com/users/${USERNAME}/contributions`, {
      headers: { "User-Agent": `${USERNAME}-activity-radar` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    const tdRegex = /<td[^>]*data-date="(\d{4}-\d{2}-\d{2})"[^>]*id="([^"]+)"/g;
    const idToDate = {};
    let m;
    while ((m = tdRegex.exec(html)) !== null) idToDate[m[2]] = m[1];

    const tipRegex = /<tool-tip[^>]*for="([^"]+)"[^>]*>(.*?)<\/tool-tip>/gs;
    const dateToCount = {};
    while ((m = tipRegex.exec(html)) !== null) {
      const text = m[2].trim();
      const countMatch = text.match(/^(\d+|No)\s+contribution/i);
      const count = countMatch ? (countMatch[1].toLowerCase() === "no" ? 0 : parseInt(countMatch[1], 10)) : 0;
      const date = idToDate[m[1]];
      if (date) dateToCount[date] = count;
    }

    const sortedDates = Object.keys(dateToCount).sort();
    if (sortedDates.length > 0) {
      days = sortedDates.slice(-30).map((d) => ({ date: d, count: dateToCount[d] }));
    }
  } catch (err) {
    console.warn("⚠️ Không thể tải contributions, sử dụng dữ liệu mặc định:", err.message);
  }

  // Fallback nếu không có dữ liệu
  if (days.length === 0) {
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      days.push({ date: d.toISOString().slice(0, 10), count: 0 });
    }
  }

  const darkSVG = generateActivitySVG(days, "dark");
  const lightSVG = generateActivitySVG(days, "light");

  writeFileSync(join(ROOT, "assets", "activity-dark.svg"), darkSVG);
  writeFileSync(join(ROOT, "assets", "activity-light.svg"), lightSVG);
  writeFileSync(join(ROOT, "assets", "activity.svg"), darkSVG);

  console.log("✅ activity radar rendered (borderless, dark + light)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
