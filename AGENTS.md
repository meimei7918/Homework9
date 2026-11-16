# AGENTS.md

完整規則在 **[CLAUDE.md](./CLAUDE.md)**，所有 AI 工具都以那份為準。最重要的六件事：

1. 純靜態網站（HTML / CSS / 原生 JS），不用框架與建置工具，路徑一律相對。
2. `data/catalog.json` 是唯一真相來源；標題、標籤、資源、demo 檔案清單都寫在這裡，頁面不重複手寫。
3. 輸入→輸出：講義 PDF → 講義筆記＋課後練習；demo ZIP → 範例程式頁；我的筆記（PDF／網址／文字）→ 我的筆記頁。
4. 建頁一律用 `python3 scripts/new.py <lecture|practice|code|note> <週次> <slug> "<標題>"`。
5. 老師的 PDF 與聯絡資料不放進 repo；講義筆記要改寫不照抄；我的筆記不加料。
6. 完成後執行 `python3 scripts/check.py`，必須顯示「✓ 全部通過」。
