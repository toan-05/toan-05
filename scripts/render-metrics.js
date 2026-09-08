// scripts/render-metrics.js
// MINIMAL mono: 4 số liệu, 1 dòng top-lang, không chart cột, không hành tinh.

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

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
const esc = (s) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

async function main() {
  mkdirSync(join(ROOT, "assets"), { recursive: true });

  let user = { login: USERNAME, public_repos: 0, followers: 0, following: 0 };
  let repos = [];
  try {
    [user, repos] = await Promise.all([
      gh(`/users/${USERNAME}`),
      gh(`/users/${USERNAME}/repos?per_page=100&sort=updated`),
    ]);
  } catch (e) {
    console.warn("⚠️ API lỗi, dùng fallback:", String(e?.message || e));
  }

  const stars = repos.reduce((a, r) => a + (r.stargazers_count || 0), 0);
  const langs = {};
  for (const r of repos) {
    if (r.fork) continue;
    const l = r.language || "Other";
    langs[l] = (langs[l] || 0) + 1;
  }
  const top3 = Object.entries(langs).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([l]) => l).join(" · ") || "—";

  const updated = new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 16).replace("T", " ");

  const items = [
    ["REPOS", user.public_repos],
    ["STARS", stars],
    ["FOLLOWERS", user.followers],
    ["FOLLOWING", user.following],
  ];
  const cells = items
    .map(([k, v], i) => {
      const x = 40 + i * 280;
      return `<g transform="translate(${x},90)">
        <rect width="250" height="80" rx="10" fill="none" stroke="#fff" stroke-opacity="0.25"/>
        <text x="20" y="36" font-size="24" font-weight="700" fill="#fff" font-family="Consolas, monospace">${esc(v)}</text>
        <text x="20" y="60" font-size="12" fill="#737373" font-family="Consolas, monospace" letter-spacing="3">${k}</text>
      </g>`;
    })
    .join("\n");

  let dots = "";
  for (let i = 0; i < 20; i++) {
    const x = (i * 211 + 37) % 1200;
    const y = (i * 131 + 19) % 250;
    dots += `<circle cx="${x}" cy="${y}" r="1" fill="#fff" opacity="0.3"><animate attributeName="opacity" values="0.08;0.55;0.08" dur="${3 + (i % 4)}s" repeatCount="indefinite"/></circle>\n`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="250" viewBox="0 0 1200 250">
  <rect width="1200" height="250" rx="12" fill="#050505"/>
  <rect width="1200" height="250" rx="12" fill="none" stroke="#fff" stroke-opacity="0.3"/>
  ${dots}
  <text x="40" y="48" font-size="20" font-weight="700" fill="#fff" font-family="Consolas, monospace">@${esc(user.login)} <tspan fill="#737373" font-weight="400">— telemetry</tspan></text>
  <circle cx="1150" cy="42" r="4" fill="#fff"><animate attributeName="opacity" values="1;0.2;1" dur="2s" repeatCount="indefinite"/></circle>
  ${cells}
  <text x="40" y="212" font-size="13" fill="#737373" font-family="Consolas, monospace">top: ${esc(top3)}</text>
  <text x="1160" y="212" text-anchor="end" font-size="13" fill="#525252" font-family="Consolas, monospace">${esc(updated)}</text>
</svg>`;

  writeFileSync(join(ROOT, "assets", "metrics.svg"), svg);
  writeFileSync(join(ROOT, "assets", "metrics.json"), JSON.stringify({
    username: user.login, public_repos: user.public_repos,
    followers: user.followers, following: user.following, stars, top: top3,
    updated_at: new Date().toISOString(),
  }, null, 2));
  console.log("✅ metrics minimal done");
}

main().catch((e) => { console.error(e); process.exit(1); });
