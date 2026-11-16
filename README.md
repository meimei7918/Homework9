# WebGIS 課程資料庫

把 WebGIS 課程的**老師講義重點**、**可以直接執行的 Leaflet 程式碼**和**自己的上課筆記**，依週次整理成一個靜態網站。

🌐 網站：<https://meimei7918.github.io/Homework9/>
📐 專案規則（給 AI 與自己）：[CLAUDE.md](./CLAUDE.md)

## 特色

- **週次時間軸首頁**：搜尋、依類型（講義／程式碼／筆記）或標籤篩選
- **程式碼頁即 Demo**：地圖直接在頁面上跑，原始碼區自動讀取 `code/src/*.js`，只維護一份
- **單一索引**：所有頁面的標題、標籤、摘要都在 `data/catalog.json`
- **規則可驗證**：`scripts/check.py` 會檢查命名、必要段落、孤兒頁、模板佔位文字

## 新增內容

```bash
python3 scripts/new.py code 4 leaflet-heatmap "熱區圖範例" --tags Leaflet,熱區圖 --topic "點資料分析"
# 編輯 code/w04-leaflet-heatmap.html 與 code/src/w04-leaflet-heatmap.js
python3 scripts/check.py
python3 -m http.server 8000   # 預覽 http://localhost:8000
```

或直接對 AI 說：「依照 CLAUDE.md，幫我把這份第四週講義加進來」。

## 技術

HTML / CSS / 原生 JavaScript、Leaflet 1.9.4、highlight.js，部署於 GitHub Pages。
