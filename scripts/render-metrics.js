// scripts/render-metrics.js
// Theme: MONO SPACE (đen/trắng, đồng tông hainguyen011 nhưng animation vũ trụ riêng)
// Output: assets/metrics.svg + assets/metrics.json

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
  const now = new Date(Date.now() + 7 * 3600 * 1000);
  return now.toISOString().slice(0, 16).replace("T", " ") + " UTC+7";
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
    console.warn("⚠️ API lỗi, dùng fallback:", error);
    user = {
      login: USERNAME, name: USERNAME, followers: 0,
      following: 0, public_repos: 0, created_at: new Date().toISOString(),
    };
    repos = [];
  }

  const stars = repos.reduce((a, r) => a + (r.stargazers_count || 0), 0);
  const forks = repos.reduce((a, r) => a + (r.forks_count || 0), 0);
  const langCount = {};
  for (const r of repos) {
    if (r.fork) continue;
    const lang = r.language || "Other";
    langCount[lang] = (langCount[lang] || 0) + 1;
  }
  const topLangs = Object.entries(langCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const totalLangRepos = topLangs.reduce((a, [, c]) => a + c, 0) || 1;
  const ageDays = Math.max(1, Math.floor((Date.now() - new Date(user.created_at).getTime()) / 86400000));

  const data = {
    username: user.login, name: user.name || user.login,
    followers: user.followers, following: user.following,
    public_repos: user.public_repos, stars, forks,
    created_at: user.created_at, age_days: ageDays,
    top_languages: topLangs.map(([lang, count]) => ({ lang, count })),
    updated_at: new Date().toISOString(), api_error: error,
  };
  writeFileSync(OUT_JSON, JSON.stringify(data, null, 2));

  const W = 1200, H = 470;

  const statCards = [
    { label: "Followers", value: data.followers, icon: "◉" },
    { label: "Following", value: data.following, icon: "◎" },
    { label: "Public Repos", value: data.public_repos, icon: "▣" },
    { label: "Total Stars", value: data.stars, icon: "✦" },
    { label: "Total Forks", value: data.forks, icon: "⑂" },
    { label: "Account Age", value: `${ageDays}d`, icon: "◷" },
  ];
  const cardX = (i) => 40 + (i % 3) * 250;
  const cardY = (i) => 175 + Math.floor(i / 3) * 95;

  const cardsSvg = statCards.map((c, i) => {
    const x = cardX(i), y = cardY(i);
    return `
      <g transform="translate(${x},${y})">
        <rect width="230" height="75" rx="10" fill="#0a0a0a" stroke="#ffffff" stroke-opacity="0.25"/>
        <rect x="0" y="0" width="3" height="75" fill="#ffffff" opacity="0.9"/>
        <text x="18" y="32" font-size="20" fill="#fff" font-family="Segoe UI, Arial">${c.icon}</text>
        <text x="50" y="32" font-size="22" font-weight="800" fill="#fff" font-family="Consolas, monospace">${esc(c.value)}</text>
        <text x="18" y="56" font-size="12" fill="#a1a1a1" font-family="Consolas, monospace" letter-spacing="2">${esc(c.label).toUpperCase()}</text>
        <circle cx="214" cy="14" r="3" fill="#fff">
          <animate attributeName="opacity" values="1;0.15;1" dur="${(1.6 + i * 0.3).toFixed(2)}s" repeatCount="indefinite"/>
        </circle>
      </g>`;
  }).join("\n");

  const barX = 830, barY0 = 180, barW = 300;
  const barsSvg = topLangs.length === 0
    ? `<text x="${barX}" y="${barY0 + 40}" fill="#737373" font-size="14" font-family="Consolas, monospace">no signal // push code to light up</text>`
    : topLangs.map(([lang, count], i) => {
        const pct = Math.round((count / totalLangRepos) * 100);
        const y = barY0 + i * 48;
        const animatedW = Math.max(10, Math.round((barW * pct) / 100));
        // mono: thanh trắng với opacity giảm dần
        const op = (0.95 - i * 0.14).toFixed(2);
        return `
        <g transform="translate(${barX},${y})">
          <text font-size="13" font-weight="700" fill="#fff" font-family="Consolas, monospace">${esc(lang)} <tspan fill="#737373" font-weight="400">${pct}%</tspan></text>
          <rect y="10" width="${barW}" height="10" rx="5" fill="none" stroke="#ffffff" stroke-opacity="0.25"/>
          <rect y="10" width="0" height="10" rx="5" fill="#ffffff" opacity="${op}">
            <animate attributeName="width" from="0" to="${animatedW}" dur="1.1s" begin="${(i * 0.15).toFixed(2)}s" fill="freeze"/>
          </rect>
        </g>`;
      }).join("\n");

  // ---- VŨ TRỤ: starfield twinkle + hành tinh quỹ đạo + sao băng ----
  const starsSvg = Array.from({ length: 60 }, (_, i) => {
    const x = (i * 173 + 41) % W;
    const y = (i * 97 + 13) % H;
    const r = 0.8 + (i % 3) * 0.6;
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity="0.4"><animate attributeName="opacity" values="0.05;0.9;0.05" dur="${(1.8 + (i % 6) * 0.7).toFixed(1)}s" repeatCount="indefinite"/></circle>`;
  }).join("\n");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="GitHub metrics for ${esc(USERNAME)}">
  <defs>
    <radialGradient id="planet" cx="35%" cy="30%" r="80%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="45%" stop-color="#a1a1a1"/>
      <stop offset="100%" stop-color="#000000"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" rx="12" fill="#050505"/>
  <rect width="${W}" height="${H}" rx="12" fill="none" stroke="#ffffff" stroke-opacity="0.4" stroke-width="1.5"/>
  ${starsSvg}

  <!-- sao băng quét ngang (SMIL, hiện tốt trên GitHub) -->
  <g opacity="0.9">
    <line x1="0" y1="0" x2="120" y2="34" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round">
      <animateTransform attributeName="transform" type="translate" values="-200 60;1300 260;-200 60" dur="7s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0;1;0" dur="7s" repeatCount="indefinite"/>
    </line>
    <circle r="2.5" fill="#fff">
      <animateTransform attributeName="transform" type="translate" values="-200 60;1300 260;-200 60" dur="7s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0;1;0" dur="7s" repeatCount="indefinite"/>
    </circle>
  </g>
  <g opacity="0.6">
    <line x1="0" y1="0" x2="90" y2="26" stroke="#ffffff" stroke-width="1" stroke-linecap="round">
      <animateTransform attributeName="transform" type="translate" values="1300 120;-200 320;1300 120" dur="11s" begin="2s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0;0.8;0" dur="11s" begin="2s" repeatCount="indefinite"/>
    </line>
  </g>

  <!-- Header: hành tinh + quỹ đạo vệ tinh -->
  <g transform="translate(40,30)">
    <circle cx="36" cy="36" r="30" fill="url(#planet)" stroke="#ffffff" stroke-opacity="0.5"/>
    <ellipse cx="36" cy="36" rx="48" ry="16" fill="none" stroke="#ffffff" stroke-opacity="0.35" transform="rotate(-20 36 36)"/>
    <g>
      <circle cx="36" cy="36" r="46" fill="none"/>
      <circle cx="82" cy="36" r="5" fill="#fff">
        <animateTransform attributeName="transform" type="rotate" from="0 36 36" to="360 36 36" dur="5s" repeatCount="indefinite"/>
      </circle>
      <animateTransform attributeName="transform" type="rotate" from="0 36 36" to="360 36 36" dur="5s" repeatCount="indefinite"/>
    </g>
    <text x="100" y="34" font-size="30" font-weight="800" fill="#fff" font-family="Consolas, monospace">@${esc(data.username)}</text>
    <text x="100" y="60" font-size="14" fill="#a1a1a1" font-family="Consolas, monospace">MISSION // DEEP-SPACE TELEMETRY • Node ${esc(process.version)}</text>
  </g>

  <!-- status: SIGNAL -->
  <g transform="translate(985,44)" font-family="Consolas, monospace">
    <rect width="175" height="34" rx="17" fill="none" stroke="#ffffff" stroke-opacity="0.6"/>
    <circle cx="22" cy="17" r="6" fill="#fff">
      <animate attributeName="r" values="6;3;6" dur="1.6s" repeatCount="indefinite"/>
    </circle>
    <text x="38" y="23" font-size="14" font-weight="700" fill="#fff" letter-spacing="1">● SIGNAL LIVE</text>
  </g>

  <!-- đường quỹ đạo chia header/body -->
  <g transform="translate(40,128)">
    <line x1="0" y1="0" x2="1120" y2="0" stroke="#ffffff" stroke-opacity="0.2"/>
    <circle r="4" fill="#fff">
      <animateTransform attributeName="transform" type="translate" values="0 0;1120 0;0 0" dur="9s" repeatCount="indefinite"/>
    </circle>
    <circle r="8" fill="none" stroke="#fff" stroke-opacity="0.4">
      <animateTransform attributeName="transform" type="translate" values="0 0;1120 0;0 0" dur="9s" repeatCount="indefinite"/>
    </circle>
  </g>

  ${cardsSvg}

  <g>
    <text x="${barX}" y="152" font-size="14" font-weight="800" fill="#fff" font-family="Consolas, monospace" letter-spacing="3">FLIGHT // TOP LANGUAGES</text>
    ${barsSvg}
  </g>

  <!-- Footer -->
  <g transform="translate(40,408)" font-family="Consolas, monospace">
    <line x1="0" y1="0" x2="1120" y2="0" stroke="#ffffff" stroke-opacity="0.25"/>
    <text y="26" font-size="13" fill="#737373">updated: ${esc(nowVN())} • repos: ${repos.length} • since ${esc(fmtDate(data.created_at))}</text>
    <text x="1120" y="26" text-anchor="end" font-size="13" fill="#fff">◈ rendered by scripts/render-metrics.js</text>
  </g>
</svg>`;

  writeFileSync(OUT_SVG, svg);
  console.log(`✅ metrics: ${OUT_SVG}`);
  console.log(JSON.stringify(data, null, 2));
}

main().catch((e) => { console.error(e); process.exit(1); });
