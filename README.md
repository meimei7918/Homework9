# WebGIS 課程資料庫

臺大地理系 115-1 WebGIS 課程的個人筆記網站：每週的**講義筆記**（AI 依老師講義改寫）、老師的**範例程式**（可直接在網頁上執行）、**課後練習**（選擇題＋實作題＋參考解答），以及整理好的**外部資源**。

- 網站：<https://meimei7918.github.io/Homework9/>
- 專案規則：[CLAUDE.md](./CLAUDE.md)（AI 與人共用的開發規範）
- 修改紀錄：[CHANGELOG.md](./CHANGELOG.md)

## 目前內容

| 週 | 主題 | 講義筆記 | 範例程式 | 課後練習 |
|---|---|---|---|---|
| W01 | WebGIS 導論、開發環境、HTML、CSS | 4 | CSS | ✓ |
| W02 | CSS（二）、JavaScript | 1 | JavaScript | ✓ |
| W03 | jQuery | 1 | jQuery | ✓ |
| W04 | GIS 資料模型、OpenGIS、Map API | 2 | — | ✓ |
| W05 | OpenLayers 入門 | 1 | basicMap | ✓ |
| W06 | OpenLayers 框架、樣式、互動 | 1 | framework | ✓ |

## 怎麼新增內容

把資料交給 AI 並說「依照 CLAUDE.md 處理」即可：

- 老師講義 PDF → 講義筆記＋外部資源＋課後練習
- 老師 demo ZIP → 範例程式頁
- 我的筆記（PDF、網址或直接貼上）→ 我的筆記頁

手動操作：

```bash
python3 scripts/new.py lecture 7 php "PHP：伺服器端程式入門" --source PHP.pdf --date 2026-11-19 --topic "PHP 後端入門"
python3 scripts/check.py           # 規則檢查
python3 -m http.server 8000        # 本機預覽
```

## 說明

講義筆記與練習由 AI 依課堂講義整理，若有出入以老師講義為準；原始講義 PDF 請至 NTU COOL 下載，本 repo 不收錄。`code/demos/` 為老師提供的範例程式，僅為了在 HTTPS 上執行做最小修改，修改處皆有註解。
