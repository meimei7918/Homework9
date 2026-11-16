# CLAUDE.md — WebGIS 課程資料庫

> 這份文件是給 AI（Claude Code、Codex、Cursor 等）與未來的我看的專案規則。
> **新增或修改任何內容前，先讀完這份文件；完成後一定要跑 `python3 scripts/check.py`。**

---

## 1. 專案目的

把一門 WebGIS 課程的學習資料，依「週次」整理成一個可以公開瀏覽的靜態網站：

| 類型 | type 值 | 放什麼 | 代表色 |
|---|---|---|---|
| 講義 | `lecture` | 老師講義的**重點整理**（用自己的話重寫）＋原始檔附件 | 藍綠 `--lecture` |
| 程式碼 | `code` | 可在頁面上直接執行的 Leaflet 範例＋逐段解說 | 赭色 `--code` |
| 筆記 | `note` | 自己的上課筆記、疑問、待辦 | 苔綠 `--note` |

讀者是「修這門課的自己與同學」：要能**依週次找到東西、看懂、複製程式碼直接用**。

網站：<https://meimei7918.github.io/Homework9/>

---

## 2. 技術限制（不可違反）

- **純靜態網站**：只有 HTML / CSS / 原生 JavaScript，**不使用**任何框架、打包工具、npm、建置步驟。GitHub Pages 直接從 `main` 分支根目錄發布。
- 允許的外部 CDN（版本固定，不要升級或新增其他 CDN，除非使用者要求）：
  - Leaflet `1.9.4`（unpkg）— 只在 `code` 類型頁面載入
  - highlight.js `11.9.0`（jsDelivr）— 所有內容頁
  - Google Fonts：Noto Sans TC、Noto Serif TC、JetBrains Mono
- 所有路徑一律用**相對路徑**（網站部署在 `/Homework9/` 子路徑下，絕對路徑 `/xxx` 會壞掉）。
- 本機預覽：在專案根目錄執行 `python3 -m http.server 8000`，開 <http://localhost:8000>。**不要**直接雙擊 HTML（`fetch` 會因 `file://` 失敗）。

---

## 3. 目錄結構

```
.
├── CLAUDE.md                 ← 本文件（專案規則，唯一來源）
├── AGENTS.md                 ← 指向本文件，給非 Claude 的 AI 工具
├── README.md                 ← 給人看的簡介
├── index.html                ← 首頁：週次時間軸、搜尋、類型與標籤篩選
├── .nojekyll                 ← 讓 GitHub Pages 不經 Jekyll 處理
├── data/
│   ├── catalog.json          ← ★ 所有內容的索引（單一真相來源）
│   └── geo/                  ← 程式碼範例用的 GeoJSON 等空間資料
├── lectures/                 ← 講義頁  wNN-slug.html
├── code/                     ← 程式碼頁 wNN-slug.html
│   └── src/                  ← 程式碼頁實際執行的 JS  wNN-slug.js
├── notes/                    ← 筆記頁  wNN-slug.html
├── assets/
│   ├── css/style.css         ← 全站唯一樣式表
│   ├── js/site.js            ← 全站唯一共用腳本
│   └── files/                ← 老師講義原始檔（PDF、PPTX、ZIP）
├── templates/                ← 三種頁面的模板（lecture / code / note）
└── scripts/
    ├── new.py                ← 新增頁面（複製模板＋登錄 catalog）
    └── check.py              ← 規則檢查
```

**不要**新增上面以外的頂層資料夾或新的內容類型。若真的需要，先詢問使用者，並同步更新本文件、`site.js` 的 `TYPES`、`check.py` 的 `FOLDERS` / `SECTIONS`。

---

## 4. 命名規則

| 東西 | 格式 | 例子 |
|---|---|---|
| 頁面檔名 | `w{兩位數週次}-{slug}.html` | `w03-geojson-layer.html` |
| slug | 英文小寫、數字、連字號；描述主題，不含類型 | `leaflet-basemap`、`intro-webgis` |
| id | `w{NN}-{type}-{slug}` | `w03-code-geojson-layer` |
| 程式碼 JS | `code/src/` 下與頁面同名，副檔名 `.js` | `code/src/w03-geojson-layer.js` |
| 空間資料 | `data/geo/w{NN}-{描述}.geojson` | `data/geo/w03-taipei-landmarks.geojson` |
| 講義附件 | `assets/files/w{NN}-{描述}.{ext}` | `assets/files/w02-leaflet-slides.pdf` |

- 同一週的講義、程式碼、筆記**可以用同一個 slug**（id 因為含 type 而不會重複）。
- 週次從 `01` 開始，一學期最多 `18`。

---

## 5. `data/catalog.json`（單一真相來源）

網站上看到的**標題、日期、標籤、摘要、麵包屑、上一篇／下一篇、首頁卡片**全部由 `site.js` 讀這個檔案產生。頁面 HTML 裡**不要**再手寫這些東西。

```jsonc
{
  "course": { "name": "WebGIS 課程資料庫", "term": "115-1", "owner": "meimei7918" },
  "weeks": { "01": "WebGIS 概論與座標系統", "02": "…" },   // 每週主題，key 為兩位數字串
  "items": [
    {
      "id": "w03-code-geojson-layer",          // 必填，= w{NN}-{type}-{slug}
      "type": "code",                          // 必填，lecture | code | note
      "week": 3,                               // 必填，整數
      "title": "GeoJSON 分類著色＋圖例",        // 必填，30 字內
      "date": "2026-09-29",                    // 必填，上課日期 YYYY-MM-DD
      "tags": ["Leaflet", "GeoJSON"],          // 必填，1–5 個，見第 8 節標籤規則
      "summary": "一到兩句話，60 字內",         // 必填
      "path": "code/w03-geojson-layer.html",   // 必填
      "src": "code/src/w03-geojson-layer.js",  // code 類型必填
      "files": [ { "label": "第三週投影片 (PDF)", "path": "assets/files/w03-slides.pdf" } ]  // lecture 類型選填
    }
  ]
}
```

- `items` 的順序不重要，`site.js` 會依「週次 → 講義/程式碼/筆記 → 日期」排序。
- 新增一週時，`weeks` 也要加上該週主題。

---

## 6. 三種頁面的固定結構

所有內容頁都從 `templates/` 複製，**保留模板骨架**：`<header id="page-head">`、`<nav id="pager">`、`<aside id="toc">`、`site.js` 的 `<script>`。
`<title>` 必須是 `{catalog 的 title} · WebGIS 課程資料庫`，`<body data-id="…">` 必須等於 catalog 的 id。

正文只寫在 `<article>` 裡，用 `<h2>` 分段（`<h2>` 會自動變成右側目錄）。下列段落**必須存在且順序一致**，中間可以插入其他 `<h2>`：

### 講義 `lecture`
1. `學習目標` — `<ul class="goals">`，2–4 條，用「能夠……」的角度寫
2. （自由的主題段落，每段一個 `<h2>`）
3. `小結` — 一個 `.callout.key`，三句話以內
4. `附件與延伸閱讀` — 保留 `<div id="files"></div>`（自動列出 catalog 的 `files`），下面放外部連結

### 程式碼 `code`
1. `這段程式在做什麼` — 一段話：目的、用到的 API、資料來源
2. `Demo` — `<div id="map" class="map-demo"></div>`
3. `原始碼` — 保留 `<div id="source"></div>`（自動讀取 `src` 檔顯示，**不要**把整份程式碼貼進 HTML）
4. `逐段解說` — 用 `<h3>` 對應 JS 檔裡的編號註解（`// 1.`、`// 2.`…），需要時貼 3–8 行關鍵片段
5. `練習` — `<ul class="todo">`，2–3 個可以自己改的方向

### 筆記 `note`
1. `今日重點` — `<ol>`，最多 3 條，一條一句
2. `課堂筆記` — 依上課順序，用 `<h3>` 分小段
3. `疑問與解答` — 每題一個 `<details class="qa">`；還沒解決的答案寫「待確認：…」
4. `待辦` — `<ul class="todo">`，完成的 `<li class="done">`

---

## 7. 可用元件（定義在 `assets/css/style.css`）

**只使用下列 class，不要在頁面寫 `<style>` 或 inline style**（Leaflet 控制項的 DOM 例外）。

| 元件 | 寫法 | 用途 |
|---|---|---|
| 提示框 | `<div class="callout tip">` / `warn` / `key` | 小技巧 / 容易出錯 / 必記重點 |
| 學習目標 | `<ul class="goals">` | 講義開頭 |
| 術語 | `<dfn class="term">中文<span>English</span></dfn>` | 術語**第一次**出現時 |
| 地圖框 | `<div id="map" class="map-demo">` | 程式碼頁 Demo，一頁只放一個 |
| Q&A | `<details class="qa"><summary>問題</summary><p>答案</p></details>` | 筆記疑問 |
| 待辦 | `<ul class="todo"><li class="done">` | 筆記待辦、程式碼練習 |
| 程式碼 | `<pre><code class="language-javascript">` | 會自動加複製按鈕與語法高亮；HTML 片段要跳脫 `&lt;` |
| 表格 | 一般 `<table>` 加 `<thead>` | 比較、對照 |

顏色只用 `:root` 的 CSS 變數。需要新元件時：先加到 `style.css` 的「元件」區，再更新這張表。

---

## 8. 內容與寫作規則

- **語言**：繁體中文、臺灣用語（程式碼、資料、預設、伺服器；不用「代碼、數據、默認、服務器」）。中英文之間不強制加空格，但程式碼片段用 `<code>`。
- **座標**：一律寫出 EPSG 代碼（`EPSG:4326`），並註明座標順序；Leaflet 是 `[lat, lng]`、GeoJSON 是 `[lng, lat]`。
- **講義著作權**：老師的投影片原始檔放 `assets/files/` 並在 catalog `files` 登錄；講義頁內容必須是**自己整理改寫的重點**，不可整段複製投影片文字或截圖整頁投影片。若使用者沒有說明可公開，先詢問是否能把原始檔放上公開 repo。
- **程式碼**：
  - 每個 JS 檔開頭兩行註解：`// W{NN}｜{標題}`、`// 執行環境：…`
  - 用編號註解 `// 1.`、`// 2.` 分段，與頁面「逐段解說」對應
  - 地圖容器固定是 `#map`；資料用相對路徑 `../data/geo/…` 讀取
  - 底圖一定要有 `attribution`；國土測繪中心 WMTS 網址是 `{z}/{y}/{x}`
  - 不使用需要 API key 的服務
- **標籤**：優先沿用已存在的標籤（先看 catalog 裡有哪些），大小寫一致：`Leaflet`、`GeoJSON`、`EPSG`、`WMTS`、`座標系統`、`底圖`、`圖層`、`樣式`、`事件`、`圖例`、`概論`、`圖磚`、`踩雷`。
- **筆記**是第一人稱、口語可以；**講義**是條理化的教學語氣。

---

## 9. 工作流程

### 新增一頁（最常見）
```bash
# 1. 產生頁面＋登錄 catalog（新的週次要加 --topic）
python3 scripts/new.py <lecture|code|note> <週次> <slug> "<標題>" --tags A,B --summary "…" --date YYYY-MM-DD [--topic "週主題"]
# 2. 把頁面裡所有「（待補：…）」換成真正內容；code 類型還要寫 code/src/*.js
# 3. 檢查
python3 scripts/check.py
# 4. 本機預覽
python3 -m http.server 8000
```

### 使用者丟來老師的講義（PDF / PPT）
1. 原始檔改名為 `w{NN}-{描述}.{ext}` 放進 `assets/files/`（先確認可公開）
2. `new.py lecture …` 建頁，把檔案登錄進該項目的 `files`
3. 讀講義，**改寫**成：學習目標 → 2–5 個主題段落 → 小結
4. 若講義裡有程式碼，另外用 `new.py code …` 建程式碼頁，並在講義頁連結過去

### 使用者丟來上課筆記（文字、照片、零散重點）
1. `new.py note …` 建頁
2. 整理成四個固定段落；看不清楚或不確定的內容放「疑問與解答」並標「待確認」，**不要自己編造**老師說過的話

### 修改既有頁面
- 改標題／日期／標籤／摘要 → **只改 `catalog.json`**（以及 `<title>`）
- 改正文 → 只改該頁 `<article>` 內
- 改程式碼 → 只改 `code/src/*.js`，頁面上的原始碼區會自動更新；記得同步「逐段解說」

---

## 10. 完成的定義（Definition of Done）

- [ ] `python3 scripts/check.py` 顯示 `✓ 全部通過`
- [ ] 本機預覽：首頁看得到新卡片、點進去標題區／目錄／上下篇正常、瀏覽器 Console 沒有錯誤
- [ ] code 頁的地圖有畫出來、原始碼區有顯示
- [ ] 沒有改動與本次任務無關的檔案

## 11. Git

- 直接在 `main` 上工作即可（個人專案），push 後 GitHub Pages 約 1 分鐘更新。
- Commit 訊息格式：`<type>: <說明>`，type 為 `add`（新內容）、`update`（修改內容）、`style`（樣式）、`fix`、`docs`（本文件、README）、`chore`（腳本）。例：`add: W04 熱區圖程式碼範例`

## 12. 不要做的事

- ❌ 引入 React / Vue / Tailwind / 任何建置工具
- ❌ 在頁面手寫標題區、麵包屑、上下篇連結（由 `site.js` 產生）
- ❌ 把程式碼同時貼在 HTML 和 JS 檔（原始碼只維護 `code/src/` 一份）
- ❌ 使用絕對路徑 `/assets/...`
- ❌ 新增內容卻沒登錄 `catalog.json`（`check.py` 會抓到孤兒頁）
- ❌ 憑空捏造老師的講義內容或作業要求
