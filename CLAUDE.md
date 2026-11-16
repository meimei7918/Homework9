# CLAUDE.md — WebGIS 課程資料庫

> 給 AI（Claude Code、Codex、Cursor…）與未來的我看的專案規則。
> **動手前先讀完；做完一定要跑 `python3 scripts/check.py`，顯示「✓ 全部通過」才算完成。**

網站：<https://meimei7918.github.io/Homework9/>

---

## 1. 專案目的

臺大地理系 115-1 WebGIS 課程的個人筆記網站。使用者（我）每週會丟進來三種原始資料，AI 依本文件把它們變成網站上的五種內容：

| 我給的原始資料 | 網站上產生的內容 | type | 代表色 |
|---|---|---|---|
| 老師講義 **PDF** | **講義筆記**：AI 改寫的重點整理（不是我的筆記） | `lecture` | 藍綠 `--lecture` |
| 老師講義 PDF | **課後練習**：選擇題＋實作題＋參考解答 | `practice` | 紅 `--practice` |
| 老師 demo **ZIP** | **範例程式**：可在網頁上執行、看原始碼、下載 | `code` | 赭 `--code` |
| 我的筆記：**PDF / 網址 / 直接貼上的文字** | **我的筆記**：我自己的版本 | `note` | 苔綠 `--note` |
| （講義筆記裡的連結自動彙整） | **資源總表** `resources.html` | — | 靛藍 `--resource` |

讀者是我和同學：要能**依週次找到東西、看懂、動手練習**。

---

## 2. 技術限制（不可違反）

- **純靜態網站**：HTML / CSS / 原生 JavaScript。**不用**框架、npm、建置步驟。GitHub Pages 從 `main` 根目錄發布。
- 網站本身允許的外部資源（不要新增）：Google Fonts（Noto Sans TC、Noto Serif TC、JetBrains Mono）、highlight.js `11.9.0`（jsDelivr）。
- `code/demos/` 裡老師的範例**保留它原本引用的 CDN**（OpenLayers、jQuery、Bootstrap…），只做第 9.2 節列出的必要修正。
- 練習題的參考解答若用 OpenLayers，統一寫 `ol@v10.11.0` 的 CDN 全域寫法（`new ol.Map`），**不用** `import`。
- 一律用**相對路徑**（網站在 `/Homework9/` 子路徑下，`/xxx` 開頭會壞掉）。
- 改了 `style.css` 或 `site.js` 時，把所有 HTML（含 templates/）引用處的 `?v=` 版本號換新（例如 `?v=20261120a`），避免瀏覽器讀到舊快取。
- 本機預覽：專案根目錄執行 `python3 -m http.server 8000`，開 <http://localhost:8000>。不要直接雙擊 HTML。

---

## 3. 目錄結構

```
.
├── CLAUDE.md / AGENTS.md / README.md
├── CHANGELOG.md            修改紀錄：每一輪需求、修改與決定
├── index.html              首頁：週次卡片＋搜尋＋類型篩選（由 site.js 產生）
├── resources.html          資源總表（由 site.js 從 catalog 彙整）
├── .nojekyll
├── data/catalog.json       ★ 唯一真相來源：週次、所有頁面的標題／標籤／摘要／資源／demo 清單
├── lectures/               講義筆記  wNN-slug.html
├── practice/               課後練習  wNN-slug.html
├── code/                   範例程式頁 wNN-slug.html
│   └── demos/              老師的 demo 原檔
│       ├── wNN-slug/       解壓後的資料夾（結構照原樣）
│       └── wNN-slug.zip    同一包重新壓縮，供整包下載
├── notes/                  我的筆記  wNN-slug.html
├── assets/
│   ├── css/style.css       全站唯一樣式表
│   ├── js/site.js          全站唯一共用腳本
│   └── files/              我同意公開的檔案（例如我自己的筆記 PDF）
├── templates/              lecture / practice / code / note 四種模板
└── scripts/
    ├── new.py              建頁＋登錄 catalog
    ├── annotate.py         在 demo 原檔插入【說明】註解（只加註解行，不改程式）
    └── check.py            規則檢查
```

不要新增其他頂層資料夾或內容類型；真的需要先問我，並同步更新本文件、`site.js` 的 `TYPES`、`check.py` 的 `FOLDERS` / `SECTIONS`、`new.py`。

---

## 4. 命名規則

| 東西 | 格式 | 例子 |
|---|---|---|
| 頁面檔名 | `w{兩位數週次}-{slug}.html` | `w05-openlayers-basics.html` |
| slug | 英文小寫、數字、連字號；描述主題 | `gis-data-model`、`basic-map` |
| id | `w{NN}-{type}-{slug}` | `w05-lecture-openlayers-basics` |
| demo 資料夾 | `code/demos/w{NN}-{slug}/`，與範例頁同 slug | `code/demos/w05-basic-map/` |
| demo 內的檔名 | **不可有空白或中文**，必要時改名並在頁面註明原檔名 | `ass3_GoogleCharts.html` |

週次以**老師課程大綱**為準（第 1 週 10/08，之後每週四）；講義封面日期跨兩週時放在第一次上課的那週。

---

## 5. `data/catalog.json`

標題、日期、標籤、摘要、麵包屑、相關連結、上下篇、首頁列表、資源清單、demo 檔案列表，**全部**由 `site.js` 讀這個檔案產生，頁面 HTML 不重複手寫。

```jsonc
{
  "course": { "name": "WebGIS 課程資料庫", "school": "臺大地理系", "term": "115-1", "owner": "meimei7918", "cool": "https://cool.ntu.edu.tw/courses/67575" },
  "weeks": {
    "05": { "date": "2026-11-05", "topic": "WebGIS 前端（一）：OpenLayers 入門" }
  },
  "items": [
    {
      // ── 所有類型共用（必填）──
      "id": "w05-lecture-openlayers-basics",
      "type": "lecture",                 // lecture | practice | code | note
      "week": 5,
      "title": "OpenLayers 入門：…",       // 30 字內
      "date": "2026-11-05",              // 上課日期
      "tags": ["OpenLayers", "底圖"],      // 1–5 個，先沿用既有標籤
      "summary": "一到兩句，80 字內",
      "path": "lectures/w05-openlayers-basics.html",
      // ── 選填 ──
      "order": 1,                        // 同週同類型多篇時的排序
      "related": ["w05-code-basic-map"], // 相關頁面 id（雙向自動顯示，只需寫一邊）

      // ── lecture 專用（必填）──
      "source": "WebGISfrontend.pdf",    // 依據的老師講義檔名
      "resources": [
        { "kind": "mentioned", "title": "OpenLayers 範例集", "url": "https://…", "desc": "一句話說明用途" },
        { "kind": "practice",  "title": "…", "url": "…", "desc": "…" },
        { "kind": "reference", "title": "…", "url": "…", "desc": "…" }
      ]
    },
    {
      // ── code 專用（必填）──
      "demo": {
        "dir": "code/demos/w05-basic-map",
        "zip": "code/demos/w05-basic-map.zip",
        "files": [ { "file": "map.html", "title": "最小地圖", "desc": "一句話", "run": true } ]
      }
    }
    // practice：必填 related（指向對應講義與範例），選填 source
    // note：選填 "origin": { "kind": "pdf" | "url" | "text", "ref": "檔名或網址" }
  ]
}
```

**resources 的 kind**：

| kind | 意思 | 來源 |
|---|---|---|
| `mentioned` | 講義中提到的網站 | 從 PDF 逐頁抄出，**一個都不要漏**（老師的個人電話、email 除外） |
| `practice` | 可以動手練的工具、遊戲、教學 | AI 上網搜尋並確認網址存在 |
| `reference` | 延伸閱讀、官方文件 | AI 上網搜尋並確認網址存在 |

每份講義至少要有 1 筆 `practice` 或 `reference`；建議 2–4 筆，優先官方文件、MDN、互動練習。

`demo.files` 必須列出資料夾裡**每一個檔案**；HTML 預設可執行，若無法在網站上執行（需 PHP 等）設 `"run": false` 並在 desc 說明。

---

## 6. 四種頁面的固定結構

所有頁面從 `templates/` 產生，**保留骨架**：`<header id="page-head">`、`<nav id="pager">`、`<aside id="toc">`、`site.js` 的 `<script>`。
`<title>` 必須是 `{catalog 的 title} · WebGIS 課程資料庫`，`<body data-id>` 必須等於 id，`<body data-type>` 必須等於類型（模板已寫好，決定頁面底色）。
正文寫在 `<article>` 內，用 `<h2>` 分段（自動成為右側目錄）。下列段落**必須存在且順序一致**，中間可以插入其他 `<h2>`。

### 講義筆記 `lecture`
1. `學習目標`：`<ul class="goals">`，2–4 條，用「能……」開頭
2. 主題段落：依講義順序，3–8 個 `<h2>`；表格整理比較、`<pre><code>` 放語法
3. `小結`：一個 `.callout.key`，三句話以內
4. `外部資源`：只放 `<div id="resources"></div>`（自動依 kind 分組列出）

### 課後練習 `practice`（每週一份，涵蓋該週所有講義）
1. `觀念測驗`：**至少 5 題、建議 8 題**選擇題
   ```html
   <div class="quiz" data-answer="2">          <!-- 正確選項是第幾個，從 1 起算 -->
     <p class="q">1. 題目</p>
     <ol class="opts"><li>選項</li><li>選項</li><li>選項</li><li>選項</li></ol>
     <p class="explain">為什麼對、其他錯在哪</p>
   </div>
   ```
   - 正確答案位置要分散（A/B/C/D 各約 1/4）
   - 錯誤選項要是「常見誤解」，不要放明顯荒謬的選項
   - 題目只考講義教過的內容
2. `實作題`：**至少 2 題、建議 3 題**，由易到難
   ```html
   <div class="task">
     <h3>1. 題目名稱<span class="level">考的技能</span></h3>
     <p>要做什麼、完成的樣子</p>
     <details class="hint"><summary>提示</summary>…</details>
     <details class="solution"><summary>參考解答</summary><pre><code class="language-…">…</code></pre></details>
   </div>
   ```
   - 參考解答**必須實際跑過**（JavaScript 可用 node 或瀏覽器驗證；數值題附上算出來的數字）
   - 優先用本週 demo 的資料（例如 `metro.geojson`）出題

### 範例程式 `code`
1. `這包範例在做什麼`：主題、用到的函式庫、建議閱讀順序
2. `範例檔案`：只放 `<div id="demo"></div>`（自動產生檔案列表＋「執行／原始碼／編輯練習」三種模式＋整包下載）
   - 「編輯練習」：HTML、JS、CSS 都能改。上方改程式、下方即時預覽；改 JS／CSS 時，自動找出載入它的 HTML 當入口，把 `<script src>`／`<link href>` 換成草稿內容，同一包所有改過的檔案一起套用（例如同時改 index.html 和 map.js）。自動加 `<base>`，其他相對路徑照樣讀範例資料夾。草稿存在使用者瀏覽器的 localStorage，檔案列表會標「已修改」，可還原、可下載。不需要另外寫任何東西
   - 限制：用 JavaScript 讀取的資料檔（例如 GeoJSON）不會被草稿取代，只能讀原檔
3. `重點解說`：挑 3–5 個關鍵檔案，用 `<h3>檔名：重點</h3>` 解說，可貼 3–8 行片段。**實際執行過**，有怪現象（例如永遠跑到 default）要寫出原因
4. `為了在網站上執行所做的修改`：逐條列出改了哪個檔案、改了什麼、為什麼；沒改就寫「無，這包範例沒有修改任何檔案。」
5. `動手改改看`：`<ul class="todo">`，2–3 個改法

### 我的筆記 `note`
1. `今日重點`：`<ol>`，最多 3 條
2. `課堂筆記`：依上課順序，用 `<h3>` 分小段
3. `疑問與解答`：每題一個 `<details class="qa">`；沒答案的寫「待確認」
4. `待辦`：`<ul class="todo">`，完成的 `<li class="done">`
- 四個段落的內容都只能來自我的筆記：「今日重點」從筆記裡挑我標粗體或強調的句子；筆記裡沒有疑問或待辦時，該段寫「這份筆記沒有記下疑問。」／「這份筆記沒有記下待辦事項。」，不要自己補
- 筆記匯出時遺失的截圖不要猜內容，在「課堂筆記」開頭用一行斜體說明「原筆記中的截圖沒有隨文字匯出」，原處可寫「（原筆記為截圖）」
- 一份筆記涵蓋兩週以上的內容時，依課程週次拆成多篇，並在開頭註明另一半在哪一週

---

## 7. 外觀與元件

**設計概念：紙本講義。** 紙色底、襯線標題，首頁依週次排列卡片，每種內容用代表色（第 1 節）的徽章區分。

- 底色紙色 `--bg`（#f4f1ea），卡片 `--surface`，文字 `--ink`；顏色只用 `style.css` 的 `:root` 變數
- 各類型頁面有自己的淡色底與頁首色（講義淡藍綠、程式淡赭、練習淡紅、筆記淡苔綠、資源淡靛藍），由 `<body data-type>` 決定；首頁維持紙色
- 色彩點綴：頁首下方一條由五個類型色組成的分段色條；首頁週次數字與主題左線依 `--w1`～`--w6` 循環上色；標籤底色是所屬類型色的淡色；提示框各有淡色底
- 首頁：左側週次（W01 大字＋主題＋日期），右側卡片格線；卡片內依序是「類型徽章＋日期 → 標題 → 摘要 → 標籤」
- 卡片**不加頂部色條**，只用細框；滑過時微微上浮、框線換成代表色
- 內容頁的 `<h2>` 用襯線字＋左側 5px 代表色直線
- 字型：Noto Serif TC（網站名稱、頁面標題、h2、週次數字）、Noto Sans TC（內文）、JetBrains Mono（程式碼與標籤）
- 首頁 header 不放背景圖、不放說明文字，只有網站名稱、搜尋與篩選

正文**只能**用下列 class，不寫 `<style>` 或 inline style（`check.py` 會檢查）：

| 元件 | 寫法 | 用途 |
|---|---|---|
| 提示框 | `<div class="callout tip">` / `warn` / `key` | 小技巧 / 容易錯 / 必記重點 |
| 學習目標 | `<ul class="goals">` | 講義開頭 |
| 術語 | `<dfn class="term">中文<span>English</span></dfn>` | 術語**第一次**出現 |
| 選擇題 | `<div class="quiz" data-answer="N">` | 見第 6 節 |
| 實作題 | `<div class="task">` ＋ `details.hint` / `details.solution` | 見第 6 節 |
| 等級標示 | `<span class="level">` | 放在實作題 h3 裡 |
| Q&A | `<details class="qa">` | 我的筆記 |
| 待辦 | `<ul class="todo">`、`<li class="done">` | 筆記、範例頁 |
| 程式碼 | `<pre><code class="language-xxx">`，HTML 要跳脫 `&lt;` `&gt;` `&amp;` | 自動加複製鈕與高亮 |
| 表格 | `<table>` ＋ `<thead>` | 比較、對照 |

新元件：先加到 `style.css` 的「元件」區，再更新這張表。

---

## 8. 內容與著作權規則

- **語言**：繁體中文、臺灣用語（程式碼、資料、預設、伺服器、座標）。
- **講義筆記是「AI 改寫」**：用自己的話重新組織，不可整段照抄投影片；頁首會自動標示「由 AI 依老師講義整理」。講義有明顯錯誤或過時（例如 Bootstrap 3 的斷點寫在 5.3 的段落裡）時，照講義寫，再用 `.callout.warn` 補充正確資訊。
- **我的筆記是「我的話」**：保留我的用詞與重點，只做排版與分段；不要加入我沒寫的內容。看不清楚的字寫「〔無法辨識〕」，不要猜。
- **不公開的東西**：老師的講義 PDF **不放進 repo**；講義裡老師與助教的電話、email 不寫進網站；盜版電子書（例如檔名含 z-lib）不放、不連結下載處，只列書名。
- **可以公開的東西**：老師的 demo 程式碼（已確認）；我的筆記 PDF 需先問我。
- **座標**：寫出 EPSG 代碼並註明順序；GeoJSON / OpenLayers 是 `[經度, 緯度]`。
- **不要編造**：老師沒講的不要寫成「老師說」；作業要求以 NTU COOL 為準。

---

## 9. 工作流程（依我丟進來的東西）

### 9.1 收到老師講義 PDF
1. `pdftotext -layout` 抽文字；圖多字少的頁面轉成圖片看
2. 依課程大綱決定週次；新的一週用 `--topic` 建立
3. 建講義筆記：
   `python3 scripts/new.py lecture <週> <slug> "<標題>" --source <PDF檔名> --date <上課日> --tags …`
4. 寫正文（第 6 節結構）
5. 資源：把講義**每一個**網址填進 `resources`（kind=`mentioned`）；再上網搜尋 2–4 個 `practice` / `reference`，確認網址可開
6. 建或更新該週的課後練習（9.4）
7. PDF 本身**不放進 repo**

### 9.2 收到老師 demo ZIP
1. 解壓到暫存資料夾檢查；刪掉 `__MACOSX`、`.DS_Store`
2. `python3 scripts/new.py code <週> <slug> "<標題>"`，把檔案搬進 `code/demos/w<NN>-<slug>/`，保持原本的資料夾結構
3. 只做**讓它能在 GitHub Pages 執行**的修正，每處加 `// [網站版修改] 原為 …` 或 `<!-- [網站版修改] … -->` 註解：
   - `http://` 的圖磚、CDN → `https://`（HTTPS 網站會擋 HTTP）
   - `http://localhost/...` 或老師電腦的路徑 → 改成 demo 資料夾內的相對路徑
   - `/xxx` 開頭的絕對路徑：檔案不存在就註解掉，存在就改相對路徑
   - 檔名有空白或中文 → 改名
   - 需要 PHP 的（AJAX、表單送出）不修，在 desc 註明
4. **加上中文註解**：每個 `.html`、`.js`（CSS 視需要）都要有 `【說明】` 註解，寫法見下方「註解規則」
5. 在 `demo.files` 逐一登錄每個檔案（title、desc；照建議閱讀順序排）
6. 重新壓縮：`cd code/demos/w<NN>-<slug> && zip -qr ../w<NN>-<slug>.zip .`
7. 逐一打開每個 HTML 看 Console，再寫範例頁
8. 若有對應講義，在範例頁或講義的 `related` 互相連結

#### 註解規則
- 先**逐行讀懂**程式並實際執行，再寫註解；註解內容必須和程式實際行為一致（例如某段被註解掉、某個樣式沒套用、某個 bug，都要照實寫）
- 用 `scripts/annotate.py` 插入：寫一個 spec 檔 `ANN = {"檔名": [(行號, "說明文字"), ...]}`，工具會把註解插在該行上方，並依位置自動使用 `<!-- -->`、`//` 或 `/* */`
- 一律以 `【說明】` 開頭，和老師原本的註解區分；**不刪改老師的註解與程式**
- 每個檔案至少要有：檔案開頭一段「這個範例在示範什麼／怎麼操作」，以及每個主要區塊的用途
- 要特別點出：容易出錯的地方、看起來怪的行為與原因、被註解掉的程式打開後會怎樣、可以怎麼改
- HTML 註解內不可出現 `--`；不要把註解插在多行標籤或 `<pre>` 的中間
- 插完後確認：去掉【說明】行之後，檔案和插入前完全相同；所有 HTML 執行後 Console 沒有新錯誤

### 9.3 收到我的筆記
| 形式 | 做法 |
|---|---|
| PDF | 抽文字（手寫就看圖）。問我要不要公開原檔；要的話放 `assets/files/notes/w<NN>-<slug>.pdf`，在正文開頭附連結 |
| 網址 | 抓取內容（Notion、HackMD、Google Docs 等），`origin` 記下網址 |
| 直接貼上 | 照內容整理 |

然後 `python3 scripts/new.py note <週> <slug> "<標題>"`，整理成第 6 節的四段；`related` 連到同週的講義筆記。

### 9.4 產生課後練習
- 每週一份：`python3 scripts/new.py practice <週> <slug> "W<NN> 課後練習：<主題>" --related <該週講義與範例 id>`
- 依第 6 節規格出題，解答要跑過
- 新增講義後，該週練習要補上對應題目

### 9.5 修改既有內容
- 改標題／日期／標籤／摘要／資源 → 只改 `catalog.json`（標題也要同步 `<title>`）
- 改正文 → 只改該頁 `<article>` 內
- 改 demo → 改 `code/demos/` 的檔案、補註解、重新壓 zip、更新範例頁的修改清單

---

## 10. 完成的定義

- [ ] `python3 scripts/check.py` 顯示 `✓ 全部通過`
- [ ] 本機預覽：首頁看得到新項目；內容頁的標題區、相關連結、目錄、上下篇正常；Console 沒有錯誤
- [ ] 範例頁：每個 HTML 都按過「執行」，原始碼能顯示，且每個檔案都有【說明】註解
- [ ] 練習頁：至少點過一題，解析與計分正常
- [ ] 沒有改到與任務無關的檔案

## 11. Git

- 直接在 `main` 上工作，push 後 GitHub Pages 約 1 分鐘更新
- 每次修改都要在 `CHANGELOG.md` 最下方新增一筆：「需求 → 修改 → 決定（使用者做的選擇）」，用使用者看得懂的話寫，不寫程式細節
- Commit 訊息：`<type>: <說明>`，type 為 `add`（新內容）、`update`、`style`、`fix`、`docs`、`chore`
  例：`add: W07 PHP 講義筆記、範例與課後練習`

## 12. 不要做的事

- ❌ 引入框架、建置工具、新的 CDN
- ❌ 在頁面手寫標題區、麵包屑、資源清單、demo 列表（都由 `site.js` 產生）
- ❌ 把老師的 PDF、聯絡資料、盜版書放進 repo
- ❌ 在「我的筆記」加入我沒寫的內容；在「講義筆記」照抄投影片
- ❌ 練習題放沒跑過的解答
- ❌ 修改 demo 卻不加「網站版修改」註解、不寫進修改清單
- ❌ 為了加註解而改動 demo 的程式碼；註解內容與實際執行結果不符
- ❌ 卡片頂部色條、柔和漸層、裝飾性背景圖（見第 7 節）
