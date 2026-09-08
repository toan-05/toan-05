<div align="center">

  <!-- HEADER ANIMATION: capsule render -->
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=200&section=header&text=toan-05&fontSize=70&fontColor=fff&animation=twinkling&fontAlignY=35&desc=Code+%E2%80%A2+Anime+%E2%80%A2+Coffee&descAlignY=55&descSize=20" alt="header"/>

  <!-- TYPING SVG -->
  <a href="https://github.com/toan-05">
    <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&weight=700&size=22&pause=1000&color=FF6EC7&center=true&vCenter=true&width=600&lines=Yo.+T%C3%B4i+l%C3%A0+toan-05+%E2%9C%A8;Fullstack+chill+chill+%F0%9F%8E%A7;JS+%2F+TS+%2F+Node+%E2%80%A2+Anime+lover+%F0%9F%8C%B8;Auto-render+metrics+b%E1%BA%B1ng+GitHub+Actions+%F0%9F%A4%96" alt="typing"/>
  </a>

  <br/>

  <!-- GIF DECOR -->
  <img src="https://media.giphy.com/media/M9gbBd9nbDrOTu1Mqx/giphy.gif" width="120" alt="cat code"/>
  <img src="https://media.giphy.com/media/qgQUggAC3Pfv687qPC/giphy.gif" width="200" alt="anime coding"/>
  <img src="https://media.giphy.com/media/LnQjpWaON8nhr21v2gN/giphy.gif" width="120" alt="coffee"/>

  <br/>

  ![Profile views](https://komarev.com/ghpvc/?username=toan-05&color=ff6ec7&style=flat-square&label=VIEWS)
  ![Followers](https://img.shields.io/github/followers/toan-05?style=flat-square&color=7873f5&label=FOLLOWERS)
  ![Stars](https://img.shields.io/github/stars/toan-05?affiliations=OWNER&style=flat-square&color=facc15&label=STARS)

</div>

---

## 🤖 Metrics động — auto render bằng GitHub Actions + Node.js

> File này **không phải ảnh tĩnh copy-paste**. Nó được render bởi [`scripts/render-metrics.js`](./scripts/render-metrics.js) + workflow [`render-metrics.yml`](./.github/workflows/render-metrics.yml), chạy mỗi 6 tiếng (và mỗi lần push script).

<div align="center">

  ![dynamic metrics](./assets/metrics.svg)

  <sub>✨ SVG có animation thuần (sao nhấp nháy, thanh language chạy, tia shine) — hiển thị ngon trên GitHub • update: xem footer trong ảnh</sub>

</div>

<details>
<summary>⚙️ Cơ chế hoạt động (bấm để xem)</summary>

1. Actions checkout repo → setup Node 20
2. Chạy `node scripts/render-metrics.js` (fetch `api.github.com/users/toan-05`, tính stars/forks/top-langs, vẽ SVG + JSON)
3. Auto-commit `assets/metrics.svg` + `assets/metrics.json` nếu có thay đổi
4. Snake animation chạy job riêng [`snake.yml`](./.github/workflows/snake.yml) bằng `Platane/snk`

Muốn đổi user render: sửa `METRICS_USER` trong workflow.

</details>

---

## 📊 Stats classic (widget ngoài — làm nền cho vui)

<div align="center">

  <img height="160" src="https://github-readme-stats.vercel.app/api?username=toan-05&show_icons=true&theme=tokyonight&hide_border=true&bg_color=0f0c29,302b63,24243e&title_color=ff6ec7&icon_color=7873f5&text_color=fff" alt="stats"/>
  <img height="160" src="https://streak-stats.demolab.com?user=toan-05&theme=tokyonight&hide_border=true&background=45,0f0c29,302b63&ring=ff6ec7&fire=ff6ec7&currStreakLabel=ff6ec7" alt="streak"/>
  <br/>
  <img height="160" src="https://github-readme-stats.vercel.app/api/top-langs/?username=toan-05&layout=compact&theme=tokyonight&hide_border=true&bg_color=0f0c29,302b63&title_color=38bdf8" alt="top langs"/>
  <img height="160" src="https://github-readme-activity-graph.vercel.app/graph?username=toan-05&theme=tokyo-night&hide_border=true&bg_color=0f0c29&color=ff6ec7&line=7873f5&point=38bdf8" alt="activity"/>

  <br/><br/>

  <img src="https://github-profile-trophy.vercel.app/?username=toan-05&theme=radical&no-frame=true&margin-w=8&row=1&column=6" alt="trophies"/>
  <br/>
  <img src="https://quotes-github-readme.vercel.app/api?type=horizontal&theme=tokyonight" alt="quote"/>

</div>

---

## 🐍 Contribution Snake (Actions tự vẽ mỗi ngày)

<div align="center">

  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/github-snake-dark.svg"/>
    <img src="./assets/github-snake.svg" alt="snake"/>
  </picture>

  <sub>Nếu chưa thấy rắn: vào tab <b>Actions → Snake animation → Run workflow</b> 1 lần là có 🐍</sub>

</div>

---

## 🛠️ Tech stack

<div align="center">

![JS](https://img.shields.io/badge/-JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![TS](https://img.shields.io/badge/-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Node](https://img.shields.io/badge/-Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![HTML](https://img.shields.io/badge/-HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/-CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![Git](https://img.shields.io/badge/-Git-F05032?style=for-the-badge&logo=git&logoColor=white)

<img src="https://media.giphy.com/media/SWoSkN6DxTszqIKEqv/giphy.gif" width="180" alt="meme"/>

</div>

---

## 🎮 Fun zone

```js
// scripts/render-metrics.js — tóm tắt logic
const toan = await fetch("https://api.github.com/users/toan-05").then(r => r.json());
console.log(`✨ ${toan.login} có ${toan.followers} followers, ${toan.public_repos} repos`);
// → vẽ SVG neon + commit tự động, khỏi đụng tay 😎
```

<div align="center">

  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=120&section=footer&text=Thanks+for+visiting!&fontSize=30&fontColor=fff&animation=twinkling" alt="footer"/>

</div>
