// scripts/render-metrics.js
// Chạy bằng: node scripts/render-metrics.js
// Output: assets/metrics.svg + assets/metrics.json
// Dùng GitHub REST API (có token thì đỡ rate-limit). Không cần npm deps.

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_SVG = join(ROOT, "assets", "metrics.svg");
const OUT_JSON = join(ROOT, "assets", "metrics.json");

const USERNAME = process.env.METRICS_USER || "toan-05";
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";
const headers = {
  "User-Agent": "toan-05-profile-metrics",
  Accept: "application/vnd.github+json",
  ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
};

async function gh(path) {
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (!res.ok) throw new Error(`GitHub API ${path} -> ${res.status}`);
  return res.json();
}

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fmtDate(d) {
  return new Date(d).toISOString().slice(0, 10);
}

function nowVN() {
  // UTC+7 cho hiển thị
  const now = new Date(Date.now() + 7 * 3600 * 1000);
  return now.toISOString().slice(0, 16).replace("T", " ") + " UTC+7";
}

// Màu cho top languages (anime/neon vibe)
const LANG_COLORS = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Java: "#b07219",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Vue: "#41b883",
  "C++": "#f34b7d",
  C: "#555555",
  Go: "#00ADD8",
  Rust: "#dea584",
  PHP: "#4F5D95",
  Shell: "#89e051",
  Dockerfile: "#384d54",
};
const fallbackPalette = ["#ff6ec7", "#7873f5", "#4ade80", "#facc15", "#38bdf8", "#fb7185"];
function langColor(lang, i) {
  return LANG_COLORS[lang] || fallbackPalette[i % fallbackPalette.length];
}

async function main() {
  mkdirSync(join(ROOT, "assets"), { recursive: true });

  let user = null;
  let repos = [];
  let error = null;

  try {
    [user, repos] = await Promise.all([
      gh(`/users/${USERNAME}`),
      gh(`/users/${USERNAME}/repos?per_page=100&sort=updated`),
    ]);
  } catch (e) {
    error = String(e?.message || e);
    console.warn("⚠️ API lỗi, dùng dữ liệu fallback:", error);
    user = {
      login: USERNAME,
      name: USERNAME,
      followers: 0,
      following: 0,
      public_repos: 0,
      created_at: new Date().toISOString(),
    };
    repos = [];
  }

  const stars = repos.reduce((a, r) => a + (r.stargazers_count || 0), 0);
  const forks = repos.reduce((a, r) => a + (r.forks_count || 0), 0);

  // Gom ngôn ngữ chính của từng repo
  const langCount = {};
  for (const r of repos) {
    if (r.fork) continue;
    const lang = r.language || "Other";
    langCount[lang] = (langCount[lang] || 0) + 1;
  }
  const topLangs = Object.entries(langCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const totalLangRepos = topLangs.reduce((a, [, c]) => a + c, 0) || 1;

  const ageDays = Math.max(
    1,
    Math.floor((Date.now() - new Date(user.created_at).getTime()) / 86400000)
  );

  const data = {
    username: user.login,
    name: user.name || user.login,
    followers: user.followers,
    following: user.following,
    public_repos: user.public_repos,
    stars,
    forks,
    created_at: user.created_at,
    age_days: ageDays,
    top_languages: topLangs.map(([lang, count]) => ({ lang, count })),
    updated_at: new Date().toISOString(),
    api_error: error,
  };
  writeFileSync(OUT_JSON, JSON.stringify(data, null, 2));

  // ---- Render SVG (1200 x 460) ----
  const W = 1200;
  const H = 460;

  const statCards = [
    { label: "Followers", value: data.followers, icon: "♥", color: "#ff6ec7" },
    { label: "Following", value: data.following, icon: "★", color: "#7873f5" },
    { label: "Public Repos", value: data.public_repos, icon: "▣", color: "#38bdf8" },
    { label: "Total Stars", value: data.stars, icon: "✦", color: "#facc15" },
    { label: "Total Forks", value: data.forks, icon: "⑂", color: "#4ade80" },
    { label: "Account Age", value: `${ageDays}d`, icon: "◷", color: "#fb7185" },
  ];

  const cardX = (i) => 40 + (i % 3) * 250;
  const cardY = (i) => 170 + Math.floor(i / 3) * 95;

  const cardsSvg = statCards
    .map((c, i) => {
      const x = cardX(i);
      const y = cardY(i);
      return `
      <g transform="translate(${x},${y})">
        <rect width="230" height="75" rx="16" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.14)"/>
        <rect width="230" height="75" rx="16" fill="none" stroke="${c.color}" stroke-opacity="0.35" stroke-width="1.5"/>
        <text x="16" y="30" font-size="22">${c.icon}</text>
        <text x="48" y="30" font-size="22" font-weight="800" fill="#fff" font-family="Segoe UI, Arial">${esc(c.value)}</text>
        <text x="16" y="54" font-size="13" fill="#c4b5fd" font-family="Segoe UI, Arial" letter-spacing="1">${esc(c.label).toUpperCase()}</text>
        <circle cx="214" cy="16" r="4" fill="${c.color}">
          <animate attributeName="opacity" values="1;0.2;1" dur="${(1.4 + i * 0.25).toFixed(2)}s" repeatCount="indefinite"/>
        </circle>
      </g>`;
    })
    .join("\n");

  const barX = 830;
  const barY0 = 175;
  const barW = 300;
  const barsSvg =
    topLangs.length === 0
      ? `<text x="${barX}" y="${barY0 + 40}" fill="#94a3b8" font-size="14" font-family="Segoe UI, Arial">Chưa có dữ liệu ngôn ngữ.\nPush code để chart sáng lên ✨</text>`
      : topLangs
          .map(([lang, count], i) => {
            const pct = Math.round((count / totalLangRepos) * 100);
            const y = barY0 + i * 48;
            const color = langColor(lang, i);
            const animatedW = Math.max(8, Math.round((barW * pct) / 100));
            return `
        <g transform="translate(${barX},${y})">
          <text font-size="13" font-weight="700" fill="#fff" font-family="Segoe UI, Arial">${esc(lang)} <tspan fill="#94a3b8" font-weight="400">${pct}%</tspan></text>
          <rect y="10" width="${barW}" height="12" rx="6" fill="rgba(255,255,255,0.10)"/>
          <rect y="10" width="0" height="12" rx="6" fill="${color}">
            <animate attributeName="width" from="0" to="${animatedW}" dur="1.2s" begin="${(i * 0.15).toFixed(2)}s" fill="freeze"/>
          </rect>
        </g>`;
          })
          .join("\n");

  // Sao bay trang trí (animation SVG thuần, hiển thị tốt trên GitHub)
  const starsSvg = Array.from({ length: 24 }, (_, i) => {
    const x = (i * 197) % W;
    const y = (i * 89) % H;
    const r = 1 + (i % 3) * 0.7;
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity="0.5"><animate attributeName="opacity" values="0.1;0.8;0.1" dur="${(2 + (i % 5)).toFixed(1)}s" repeatCount="indefinite"/></circle>`;
  }).join("\n");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="GitHub metrics for ${esc(USERNAME)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f0c29"/>
      <stop offset="50%" stop-color="#302b63"/>
      <stop offset="100%" stop-color="#24243e"/>
    </linearGradient>
    <linearGradient id="neon" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#ff6ec7"/>
      <stop offset="50%" stop-color="#7873f5"/>
      <stop offset="100%" stop-color="#38bdf8"/>
    </linearGradient>
    <linearGradient id="shine" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="white" stop-opacity="0"/>
      <stop offset="50%" stop-color="white" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="white" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" rx="24" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" rx="24" fill="none" stroke="url(#neon)" stroke-width="3"/>
  ${starsSvg}

  <!-- Header -->
  <g transform="translate(40,32)">
    <circle cx="34" cy="34" r="32" fill="url(#neon)"/>
    <circle cx="34" cy="34" r="27" fill="#0f0c29"/>
    <text x="34" y="45" text-anchor="middle" font-size="30" font-weight="900" fill="#fff" font-family="Segoe UI, Arial">${esc((data.name || USERNAME).slice(0, 1).toUpperCase())}</text>
    <text x="82" y="32" font-size="30" font-weight="900" fill="#fff" font-family="Segoe UI, Arial">@${esc(data.username)}
      <animate attributeName="opacity" values="1;0.85;1" dur="3s" repeatCount="indefinite"/>
    </text>
    <text x="82" y="58" font-size="15" fill="#c4b5fd" font-family="Segoe UI, Arial">auto-rendered by GitHub Actions • Node.js ${esc(process.version)}</text>
    <!-- tia shine chạy ngang -->
    <rect x="82" y="64" width="220" height="6" rx="3" fill="rgba(255,255,255,0.12)"/>
    <rect x="82" y="64" width="60" height="6" rx="3" fill="url(#shine)">
      <animate attributeName="x" values="82;242;82" dur="3.5s" repeatCount="indefinite"/>
    </rect>
  </g>

  <!-- live badge -->
  <g transform="translate(980,48)">
    <rect width="180" height="36" rx="18" fill="#22c55e" opacity="0.9"/>
    <circle cx="22" cy="18" r="7" fill="#fff">
      <animate attributeName="r" values="7;4;7" dur="1.6s" repeatCount="indefinite"/>
    </circle>
    <text x="38" y="24" font-size="15" font-weight="800" fill="#052e16" font-family="Segoe UI, Arial">● LIVE METRICS</text>
  </g>

  <line x1="40" y1="130" x2="1160" y2="130" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>

  <!-- Stat cards -->
  ${cardsSvg}

  <!-- Languages -->
  <g>
    <text x="${barX}" y="150" font-size="15" font-weight="800" fill="#fff" font-family="Segoe UI, Arial" letter-spacing="2">TOP LANGUAGES</text>
    ${barsSvg}
  </g>

  <!-- Footer -->
  <g transform="translate(40,398)">
    <rect width="1120" height="1.5" fill="url(#neon)" opacity="0.6"/>
    <text y="28" font-size="13" fill="#94a3b8" font-family="Consolas, monospace">updated: ${esc(nowVN())} • repos scanned: ${repos.length} • since ${esc(fmtDate(data.created_at))}</text>
    <text x="1120" y="28" text-anchor="end" font-size="13" fill="#f0abfc" font-family="Segoe UI, Arial">✨ rendered by scripts/render-metrics.js</text>
  </g>
</svg>
`;

  writeFileSync(OUT_SVG, svg);
  console.log(`✅ Đã render: ${OUT_SVG}`);
  console.log(`✅ JSON: ${OUT_JSON}`);
  console.log(JSON.stringify(data, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
